import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type Stripe from 'stripe'

// Only the fields read by this endpoint are needed in the Stripe response fixtures.
type SubscriptionFixture = Pick<Stripe.Subscription, 'id' | 'status'> & {
  items: { data: Pick<Stripe.SubscriptionItem, 'current_period_end'>[] }
}
type SessionFixture = Pick<Stripe.Checkout.Session, 'payment_status' | 'status'> & {
  subscription: SubscriptionFixture | string | null
}

const { retrieveMock, captureExceptionMock } = vi.hoisted(() => ({
  retrieveMock: vi.fn<() => Promise<SessionFixture>>(),
  captureExceptionMock: vi.fn(),
}))

vi.mock('stripe', () => ({
  default: class StripeMock {
    checkout = { sessions: { retrieve: retrieveMock } }
  },
}))

vi.mock('@sentry/nextjs', () => ({ captureException: captureExceptionMock }))

const periodEnd = 1_800_000_000

async function verifySession(query = '?session_id=cs_test') {
  const { GET } = await import('@/app/api/billing/verify-session/route')
  return GET(new Request(`http://localhost/api/billing/verify-session${query}`))
}

describe('GET /api/billing/verify-session', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
    vi.stubEnv('ENABLE_PAID_PLANS', 'true')
    vi.stubEnv('STRIPE_SECRET_KEY', 'sk_test_fixture_only')
    retrieveMock.mockResolvedValue({
      payment_status: 'paid',
      status: 'complete',
      subscription: {
        id: 'sub_test',
        status: 'active',
        items: { data: [{ current_period_end: periodEnd }] },
      },
    })
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it.each([undefined, '', 'false', 'TRUE'])(
    'rejects disabled paid plans (%s) without contacting Stripe',
    async (flag) => {
      vi.stubEnv('ENABLE_PAID_PLANS', flag)
      const res = await verifySession()
      expect(res.status).toBe(503)
      expect(retrieveMock).not.toHaveBeenCalled()
    }
  )

  it('returns the Stripe v21 subscription item billing period', async () => {
    const res = await verifySession()
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({
      active: true,
      subscriptionId: 'sub_test',
      periodEnd: new Date(periodEnd * 1000).toISOString(),
      status: 'active',
    })
    expect(retrieveMock).toHaveBeenCalledWith('cs_test', { expand: ['subscription'] })
  })

  it('preserves an unexpanded subscription ID without inventing a period end', async () => {
    retrieveMock.mockResolvedValue({
      payment_status: 'unpaid',
      status: 'complete',
      subscription: 'sub_test',
    })
    const res = await verifySession()
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({
      active: true,
      subscriptionId: 'sub_test',
      periodEnd: null,
      status: 'complete',
    })
  })

  it('returns null periodEnd for a subscription with no items', async () => {
    retrieveMock.mockResolvedValue({
      payment_status: 'unpaid',
      status: 'complete',
      subscription: { id: 'sub_test', status: 'trialing', items: { data: [] } },
    })
    const res = await verifySession()
    expect(res.status).toBe(200)
    expect(await res.json()).toMatchObject({ active: true, periodEnd: null, status: 'trialing' })
  })

  it('keeps unpaid sessions without a subscription inactive', async () => {
    retrieveMock.mockResolvedValue({ payment_status: 'unpaid', status: 'open', subscription: null })
    const res = await verifySession()
    expect(await res.json()).toEqual({
      active: false,
      subscriptionId: null,
      periodEnd: null,
      status: 'open',
    })
  })

  it('returns 400 for a missing session ID', async () => {
    const res = await verifySession('')
    expect(res.status).toBe(400)
    expect(retrieveMock).not.toHaveBeenCalled()
  })

  it('returns 503 when Stripe is not configured', async () => {
    vi.stubEnv('STRIPE_SECRET_KEY', undefined)
    const res = await verifySession()
    expect(res.status).toBe(503)
    expect(retrieveMock).not.toHaveBeenCalled()
  })

  it('reports Stripe retrieval failures', async () => {
    const error = new Error('Stripe unavailable')
    retrieveMock.mockRejectedValueOnce(error)
    const res = await verifySession()
    expect(res.status).toBe(500)
    expect(captureExceptionMock).toHaveBeenCalledWith(error, expect.any(Object))
  })
})
