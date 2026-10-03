/**
 * Verify a Stripe Checkout Session and return minimal subscription info
 * so the client can mirror it to localStorage.
 */

import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import * as Sentry from '@sentry/nextjs'
import { paidPlansEnabled } from '@/lib/launch-mode'

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2026-03-25.dahlia' })
  : null

export async function GET(req: Request) {
  if (!paidPlansEnabled()) {
    return NextResponse.json(
      { error: 'Paid plans are unavailable in comparison-only mode.' },
      { status: 503 }
    )
  }

  if (!stripe) {
    return NextResponse.json({ error: 'Stripe is not configured' }, { status: 503 })
  }

  const url = new URL(req.url)
  const sessionId = url.searchParams.get('session_id')
  if (!sessionId) {
    return NextResponse.json({ error: 'Missing session_id' }, { status: 400 })
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription'],
    })
    const subscription = typeof session.subscription === 'object' ? session.subscription : null
    // Buddy Plus checkout creates one recurring item; Stripe v21 stores its period there.
    const periodEnd = subscription?.items.data[0]?.current_period_end

    return NextResponse.json({
      active: session.payment_status === 'paid' || Boolean(session.subscription),
      subscriptionId:
        typeof session.subscription === 'string'
          ? session.subscription
          : (subscription?.id ?? null),
      periodEnd: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
      status: subscription?.status ?? session.status,
    })
  } catch (err) {
    Sentry.captureException(err, { tags: { route: '/api/billing/verify-session' } })
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to verify session' },
      { status: 500 }
    )
  }
}
