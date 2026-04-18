/**
 * Create a Stripe Checkout Session for Buddy Plus subscription.
 *
 * DB-free: we don't persist anything to Postgres. Stripe is the source of truth
 * for subscription state; we mirror minimal bits to localStorage on the client
 * after the redirect via `/api/billing/verify-session`.
 */

import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import * as Sentry from '@sentry/nextjs'
import { createClient as createSupabaseServerClient } from '@/lib/supabase/server'

// Using a stable API version the type defs know about; the installed
// @types/stripe@2026-03-25.dahlia is fine but we pin to avoid drift
const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2026-03-25.dahlia' })
  : null

// Price ID for Buddy Plus monthly — must match your Stripe dashboard
// Set via env; falls back to a dummy that returns 503 in local dev without Stripe
const BUDDY_PLUS_PRICE_ID = process.env.STRIPE_BUDDY_PLUS_PRICE_ID ?? ''

export async function POST(req: Request) {
  if (!stripe) {
    return NextResponse.json(
      {
        error: 'Stripe is not configured. Set STRIPE_SECRET_KEY and STRIPE_BUDDY_PLUS_PRICE_ID.',
      },
      { status: 503 },
    )
  }

  if (!BUDDY_PLUS_PRICE_ID) {
    return NextResponse.json(
      { error: 'STRIPE_BUDDY_PLUS_PRICE_ID env var is not set' },
      { status: 503 },
    )
  }

  try {
    const body = (await req.json().catch(() => ({}))) as { plan?: string; email?: string }
    const origin = new URL(req.url).origin

    // Attach the authenticated Supabase user ID so the Stripe webhook
    // can flip buddy_plus_state for the right account.
    const supabase = await createSupabaseServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: BUDDY_PLUS_PRICE_ID,
          quantity: 1,
        },
      ],
      metadata: {
        tier: 'buddy_plus',
        userId: user?.id ?? '',
      },
      subscription_data: {
        trial_period_days: 7,
        metadata: {
          plan: body.plan ?? 'buddy-plus-monthly',
          source: 'pricing-page',
          tier: 'buddy_plus',
          userId: user?.id ?? '',
        },
      },
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
      customer_email: body.email ?? user?.email ?? undefined,
      success_url: `${origin}/pricing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/pricing`,
    })

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    })
  } catch (err) {
    Sentry.captureException(err, { tags: { route: '/api/billing/create-checkout-session' } })
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to create checkout session' },
      { status: 500 },
    )
  }
}
