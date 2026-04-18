import { headers } from 'next/headers'
import { db, transfers } from '@remit/db'
import { eq } from 'drizzle-orm'
import { constructStripeEvent } from '@/lib/stripe'
import { createQuote, createRecipient, createTransfer, fundTransfer } from '@/lib/wise'
import { logAuditEvent } from '@/lib/audit'
import { createServiceClient } from '@/lib/supabase/service'
import type Stripe from 'stripe'

async function markBuddyPlus(
  userId: string,
  active: boolean,
  fields: { subscriptionId?: string; checkoutSessionId?: string; periodEnd?: number } = {},
) {
  if (!userId) return
  try {
    const supa = createServiceClient()
    await supa.from('buddy_plus_state').upsert(
      {
        user_id: userId,
        active,
        subscription_id: fields.subscriptionId ?? null,
        checkout_session_id: fields.checkoutSessionId ?? null,
        period_end: fields.periodEnd ? new Date(fields.periodEnd * 1000).toISOString() : null,
      },
      { onConflict: 'user_id' },
    )
  } catch (err) {
    console.warn('[stripe webhook] buddy_plus_state upsert failed:', err)
  }
}

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

  // ========= Buddy Plus subscription lifecycle =========
  if (event.type === 'customer.subscription.created' || event.type === 'customer.subscription.updated') {
    const sub = event.data.object as Stripe.Subscription
    const userId = (sub.metadata?.userId ?? '').trim()
    const isPlus =
      sub.status === 'active' || sub.status === 'trialing' || sub.status === 'past_due'
    // Stripe types mark current_period_end as mandatory number; be defensive
    const periodEnd = (sub as unknown as { current_period_end?: number }).current_period_end
    await markBuddyPlus(userId, isPlus, {
      subscriptionId: sub.id,
      periodEnd,
    })
    return Response.json({ received: true })
  }

  if (event.type === 'customer.subscription.deleted') {
    const sub = event.data.object as Stripe.Subscription
    const userId = (sub.metadata?.userId ?? '').trim()
    await markBuddyPlus(userId, false, { subscriptionId: sub.id })
    return Response.json({ received: true })
  }

  // Checkout Session completed — either Buddy Plus subscription OR chat-driven transfer
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    // Buddy Plus subscription path — we stamp Plus active as soon as
    // checkout lands; subscription.created will also fire shortly and
    // give us the full period_end.
    if (session.metadata?.tier === 'buddy_plus') {
      const userId = (session.metadata?.userId ?? '').trim()
      await markBuddyPlus(userId, true, {
        checkoutSessionId: session.id,
        subscriptionId: typeof session.subscription === 'string' ? session.subscription : undefined,
      })
      return Response.json({ received: true })
    }

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
