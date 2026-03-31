import Stripe from 'stripe'

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) throw new Error('STRIPE_SECRET_KEY is not configured')
  return new Stripe(key, { apiVersion: '2026-03-25.dahlia' })
}

/**
 * Get or create a Stripe customer for a user.
 * Stores customer ID in Stripe metadata keyed by Clerk userId.
 */
export async function getOrCreateCustomer(userId: string, email: string): Promise<string> {
  const stripe = getStripe()

  const existing = await stripe.customers.search({
    query: `metadata['clerkUserId']:'${userId}'`,
    limit: 1,
  })

  if (existing.data.length > 0 && existing.data[0]) {
    return existing.data[0].id
  }

  const customer = await stripe.customers.create({
    email,
    metadata: { clerkUserId: userId },
  })

  return customer.id
}

/**
 * Create a PaymentIntent for funding a transfer.
 * Amount is in cents (USD).
 */
export async function createPaymentIntent(params: {
  amountCents: number
  currency: string
  customerId: string
  transferId: string
  idempotencyKey: string
}): Promise<{ clientSecret: string; paymentIntentId: string }> {
  const stripe = getStripe()

  const intent = await stripe.paymentIntents.create(
    {
      amount: params.amountCents,
      currency: params.currency.toLowerCase(),
      customer: params.customerId,
      metadata: { transferId: params.transferId },
      automatic_payment_methods: { enabled: true },
    },
    { idempotencyKey: params.idempotencyKey },
  )

  if (!intent.client_secret) {
    throw new Error('Stripe did not return a client_secret')
  }

  return { clientSecret: intent.client_secret, paymentIntentId: intent.id }
}

/**
 * Verify a Stripe webhook signature.
 */
export function constructStripeEvent(rawBody: string, signature: string): Stripe.Event {
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!secret) throw new Error('STRIPE_WEBHOOK_SECRET is not configured')
  return getStripe().webhooks.constructEvent(rawBody, signature, secret)
}
