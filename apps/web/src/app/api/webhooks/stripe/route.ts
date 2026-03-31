import { headers } from 'next/headers'
import { db, transfers } from '@remit/db'
import { eq } from 'drizzle-orm'
import { constructStripeEvent } from '@/lib/stripe'
import { createQuote, createRecipient, createTransfer, fundTransfer } from '@/lib/wise'
import { logAuditEvent } from '@/lib/audit'
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

  // Checkout Session completed — chat-driven flow: create Wise transfer then fund
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const transferId = session.metadata?.transferId

    if (!transferId) {
      console.warn('[stripe webhook] checkout.session.completed missing transferId metadata')
      return Response.json({ received: true })
    }

    const transfer = await db.query.transfers.findFirst({
      where: eq(transfers.id, transferId),
    })

    if (!transfer || transfer.status !== 'quote') {
      return Response.json({ received: true })
    }

    const profileId = process.env.WISE_PROFILE_ID
    if (!profileId) {
      console.error('[stripe webhook] WISE_PROFILE_ID not configured')
      await db
        .update(transfers)
        .set({ status: 'failed', updatedAt: new Date() })
        .where(eq(transfers.id, transferId))
      return Response.json({ received: true })
    }

    // Mark as pending while we execute the Wise transfer
    await db
      .update(transfers)
      .set({ status: 'pending', updatedAt: new Date() })
      .where(eq(transfers.id, transferId))

    try {
      const bankAccount = transfer.recipientBankAccount as {
        type: string
        details: Record<string, string>
      }

      // 1. Get a fresh quote
      const quote = await createQuote({
        profileId,
        sourceCurrency: transfer.sourceCurrency,
        targetCurrency: transfer.targetCurrency,
        sourceAmount: transfer.sourceAmountCents / 100,
      })

      // 2. Create Wise recipient
      const recipient = await createRecipient({
        profileId,
        currency: transfer.targetCurrency,
        type: bankAccount.type,
        accountHolderName: transfer.recipientName,
        details: bankAccount.details,
      })

      // 3. Create Wise transfer
      const wiseTransfer = await createTransfer({
        targetAccountId: recipient.id,
        quoteUuid: quote.id,
        customerTransactionId: transfer.idempotencyKey,
        details: {},
      })

      // 4. Fund the transfer
      await fundTransfer(profileId, wiseTransfer.id)

      // 5. Update DB with provider transfer ID and processing status
      await db
        .update(transfers)
        .set({
          providerTransferId: String(wiseTransfer.id),
          fxRate: String(quote.rate),
          targetAmountCents: Math.round(quote.targetAmount * 100),
          feeCents: Math.round((quote.fee?.total ?? 0) * 100),
          status: 'processing',
          updatedAt: new Date(),
        })
        .where(eq(transfers.id, transferId))

      await logAuditEvent({
        userId: transfer.senderId,
        action: 'transfer.payment_completed',
        entityType: 'transfer',
        entityId: transferId,
        metadata: { wiseTransferId: wiseTransfer.id, status: 'processing' },
      })

      console.info(
        `[stripe webhook] checkout succeeded → Wise transfer ${wiseTransfer.id} created and funded for transfer ${transferId}`,
      )
    } catch (err) {
      console.error('[stripe webhook] Wise transfer creation failed:', err)
      await db
        .update(transfers)
        .set({ status: 'failed', updatedAt: new Date() })
        .where(eq(transfers.id, transferId))
    }

    return Response.json({ received: true })
  }

  // PaymentIntent succeeded — legacy flow: fund an already-created Wise transfer
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

  // Checkout expired — user abandoned the payment page; cancel the quote-status transfer
  if (event.type === 'checkout.session.expired') {
    const session = event.data.object as Stripe.Checkout.Session
    const transferId = session.metadata?.transferId

    if (transferId) {
      await db
        .update(transfers)
        .set({ status: 'cancelled', updatedAt: new Date() })
        .where(eq(transfers.id, transferId))

      console.info(`[stripe webhook] checkout expired → transfer ${transferId} cancelled`)
    }
  }

  return Response.json({ received: true })
}
