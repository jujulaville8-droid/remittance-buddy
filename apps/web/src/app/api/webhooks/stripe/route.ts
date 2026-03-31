import { headers } from 'next/headers'
import { db, transfers } from '@remit/db'
import { eq } from 'drizzle-orm'
import { constructStripeEvent } from '@/lib/stripe'
import { fundTransfer } from '@/lib/wise'
import type Stripe from 'stripe'

export async function POST(req: Request) {
  const headerPayload = await headers()
  const signature = headerPayload.get('stripe-signature')

  if (!signature) {
    return Response.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  const rawBody = await req.text()

  let event: Stripe.Event
  try {
    event = constructStripeEvent(rawBody, signature)
  } catch {
    return Response.json({ error: 'Invalid signature' }, { status: 401 })
  }

  if (event.type === 'payment_intent.succeeded') {
    const intent = event.data.object as Stripe.PaymentIntent
    const transferId = intent.metadata?.transferId

    if (!transferId) {
      console.warn('[stripe webhook] payment_intent.succeeded missing transferId metadata')
      return Response.json({ received: true })
    }

    const transfer = await db.query.transfers.findFirst({
      where: eq(transfers.id, transferId),
    })

    if (!transfer || transfer.status !== 'pending') {
      return Response.json({ received: true })
    }

    const profileId = process.env.WISE_PROFILE_ID
    if (profileId && transfer.providerTransferId) {
      try {
        await fundTransfer(profileId, Number(transfer.providerTransferId))
      } catch (err) {
        console.error('[stripe webhook] Wise fundTransfer failed:', err)
        await db
          .update(transfers)
          .set({ status: 'failed', updatedAt: new Date() })
          .where(eq(transfers.id, transferId))
        return Response.json({ received: true })
      }
    }

    await db
      .update(transfers)
      .set({ status: 'processing', updatedAt: new Date() })
      .where(eq(transfers.id, transferId))

    console.info(`[stripe webhook] payment succeeded → transfer ${transferId} now processing`)
  }

  if (event.type === 'payment_intent.payment_failed') {
    const intent = event.data.object as Stripe.PaymentIntent
    const transferId = intent.metadata?.transferId

    if (transferId) {
      await db
        .update(transfers)
        .set({ status: 'failed', updatedAt: new Date() })
        .where(eq(transfers.id, transferId))

      console.info(`[stripe webhook] payment failed → transfer ${transferId} marked failed`)
    }
  }

  return Response.json({ received: true })
}
