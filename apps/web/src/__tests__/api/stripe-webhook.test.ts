import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import type Stripe from 'stripe'

// Webhook fixtures include only fields consumed by the handler, checked against the SDK.
type DeepPartial<T> = T extends object ? { [K in keyof T]?: DeepPartial<T[K]> } : T
type StripeEventFixture<T extends Stripe.Event = Stripe.Event> = T extends Stripe.Event
  ? { type: T['type']; data: { object: DeepPartial<T['data']['object']> } }
  : never

const { dbSetMock, dbUpdateMock, mockConstructStripeEvent, upsertMock, serviceClientMock } =
  vi.hoisted(() => {
    const dbSetMock = vi.fn(() => ({ where: vi.fn() }))
    const upsertMock = vi.fn().mockResolvedValue({ error: null })
    return {
      dbSetMock,
      dbUpdateMock: vi.fn(() => ({ set: dbSetMock })),
      mockConstructStripeEvent:
        vi.fn<(...args: Parameters<typeof constructStripeEvent>) => StripeEventFixture>(),
      upsertMock,
      serviceClientMock: vi.fn(() => ({ from: vi.fn(() => ({ upsert: upsertMock })) })),
    }
  })

// ─── Module mocks ─────────────────────────────────────────────────────────────

vi.mock('next/headers', () => ({
  headers: vi.fn(),
}))

vi.mock('@remit/db', () => ({
  db: {
    query: {
      transfers: { findFirst: vi.fn() },
    },
    update: dbUpdateMock,
  },
  transfers: {},
}))

vi.mock('@/lib/stripe', () => ({
  constructStripeEvent: mockConstructStripeEvent,
}))

vi.mock('@/lib/wise', () => ({
  createQuote: vi.fn(),
  createRecipient: vi.fn(),
  createTransfer: vi.fn(),
  fundTransfer: vi.fn(),
}))

vi.mock('@/lib/audit', () => ({
  logAuditEvent: vi.fn(),
}))

vi.mock('@/lib/supabase/service', () => ({
  createServiceClient: serviceClientMock,
}))

// ─── Imports after mocks ──────────────────────────────────────────────────────

import { headers } from 'next/headers'
import { db } from '@remit/db'
import { constructStripeEvent } from '@/lib/stripe'
import { createQuote, createRecipient, createTransfer, fundTransfer } from '@/lib/wise'
import { POST } from '@/app/api/webhooks/stripe/route'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeRequest(body = '') {
  return new Request('http://localhost/api/webhooks/stripe', {
    method: 'POST',
    body,
  })
}

function mockHeaders(sig: string | null) {
  vi.mocked(headers).mockResolvedValue({
    get: (name: string) => (name === 'stripe-signature' ? sig : null),
  } as ReturnType<typeof headers> extends Promise<infer T> ? T : never)
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('POST /api/webhooks/stripe', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubEnv('ENABLE_TRANSFER_EXECUTION', 'true')
    vi.stubEnv('ENABLE_PAID_PLANS', 'true')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('returns 400 when stripe-signature header is missing', async () => {
    mockHeaders(null)
    const res = await POST(makeRequest())
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toMatch(/Missing stripe-signature/i)
  })

  it('returns 401 when signature verification fails', async () => {
    mockHeaders('bad-sig')
    mockConstructStripeEvent.mockImplementation(() => {
      throw new Error('Invalid signature')
    })
    const res = await POST(makeRequest('{}'))
    expect(res.status).toBe(401)
    const body = await res.json()
    expect(body.error).toMatch(/Invalid signature/i)
  })

  describe('comparison-only launch guards', () => {
    const blockedEvents: StripeEventFixture[] = [
      { type: 'customer.subscription.created', data: { object: {} } },
      { type: 'customer.subscription.updated', data: { object: {} } },
      { type: 'customer.subscription.deleted', data: { object: {} } },
      {
        type: 'checkout.session.completed',
        data: { object: { metadata: { tier: 'buddy_plus', userId: 'user-123' } } },
      },
      {
        type: 'checkout.session.completed',
        data: { object: { metadata: { transferId: 'transfer-uuid' } } },
      },
      {
        type: 'checkout.session.expired',
        data: { object: { metadata: { transferId: 'transfer-uuid' } } },
      },
      {
        type: 'payment_intent.succeeded',
        data: { object: { metadata: { transferId: 'transfer-uuid' } } },
      },
      {
        type: 'payment_intent.payment_failed',
        data: { object: { metadata: { transferId: 'transfer-uuid' } } },
      },
    ]

    it.each(blockedEvents)(
      'blocks $type without any provider or database side effects',
      async (event) => {
        vi.stubEnv('ENABLE_TRANSFER_EXECUTION', undefined)
        vi.stubEnv('ENABLE_PAID_PLANS', undefined)
        mockHeaders('valid-sig')
        mockConstructStripeEvent.mockReturnValue(event)
        const res = await POST(makeRequest('{}'))
        expect(res.status).toBe(503)
        expect(mockConstructStripeEvent).toHaveBeenCalledWith('{}', 'valid-sig')
        expect(db.query.transfers.findFirst).not.toHaveBeenCalled()
        expect(dbUpdateMock).not.toHaveBeenCalled()
        expect(serviceClientMock).not.toHaveBeenCalled()
        expect(upsertMock).not.toHaveBeenCalled()
        expect(createQuote).not.toHaveBeenCalled()
        expect(createRecipient).not.toHaveBeenCalled()
        expect(createTransfer).not.toHaveBeenCalled()
        expect(fundTransfer).not.toHaveBeenCalled()
      }
    )

    it('does not let transfer execution enable paid-plan mutations', async () => {
      vi.stubEnv('ENABLE_PAID_PLANS', undefined)
      mockHeaders('valid-sig')
      mockConstructStripeEvent.mockReturnValue({
        type: 'customer.subscription.updated',
        data: { object: {} },
      })
      const res = await POST(makeRequest('{}'))
      expect(res.status).toBe(503)
      expect(serviceClientMock).not.toHaveBeenCalled()
    })

    it('does not let paid plans enable transfer execution', async () => {
      vi.stubEnv('ENABLE_TRANSFER_EXECUTION', undefined)
      mockHeaders('valid-sig')
      mockConstructStripeEvent.mockReturnValue({
        type: 'checkout.session.completed',
        data: { object: { metadata: { transferId: 'transfer-uuid' } } },
      })
      const res = await POST(makeRequest('{}'))
      expect(res.status).toBe(503)
      expect(db.query.transfers.findFirst).not.toHaveBeenCalled()
      expect(dbUpdateMock).not.toHaveBeenCalled()
      expect(createTransfer).not.toHaveBeenCalled()
      expect(fundTransfer).not.toHaveBeenCalled()
    })

    it('still rejects invalid signatures when both flows are disabled', async () => {
      vi.stubEnv('ENABLE_TRANSFER_EXECUTION', undefined)
      vi.stubEnv('ENABLE_PAID_PLANS', undefined)
      mockHeaders('bad-sig')
      mockConstructStripeEvent.mockImplementationOnce(() => {
        throw new Error('Invalid signature')
      })
      const res = await POST(makeRequest('{}'))
      expect(res.status).toBe(401)
      expect(dbUpdateMock).not.toHaveBeenCalled()
      expect(serviceClientMock).not.toHaveBeenCalled()
    })

    it('acknowledges unrelated events without side effects', async () => {
      vi.stubEnv('ENABLE_TRANSFER_EXECUTION', undefined)
      vi.stubEnv('ENABLE_PAID_PLANS', undefined)
      mockHeaders('valid-sig')
      mockConstructStripeEvent.mockReturnValue({ type: 'customer.created', data: { object: {} } })
      const res = await POST(makeRequest('{}'))
      expect(res.status).toBe(200)
      expect(dbUpdateMock).not.toHaveBeenCalled()
      expect(serviceClientMock).not.toHaveBeenCalled()
    })
  })

  describe('Buddy Plus subscription lifecycle', () => {
    it.each(['customer.subscription.created', 'customer.subscription.updated'] as const)(
      'persists the Stripe v21 item period for %s when only paid plans are enabled',
      async (type) => {
        vi.stubEnv('ENABLE_TRANSFER_EXECUTION', undefined)
        mockHeaders('valid-sig')
        mockConstructStripeEvent.mockReturnValue({
          type,
          data: {
            object: {
              id: 'sub_test',
              status: 'active',
              metadata: { userId: 'user-123' },
              items: { data: [{ current_period_end: 1_800_000_000 }] },
            },
          },
        })
        const res = await POST(makeRequest('{}'))
        expect(res.status).toBe(200)
        expect(upsertMock).toHaveBeenCalledWith(
          expect.objectContaining({
            user_id: 'user-123',
            active: true,
            subscription_id: 'sub_test',
            period_end: new Date(1_800_000_000 * 1000).toISOString(),
          }),
          { onConflict: 'user_id' }
        )
        expect(createTransfer).not.toHaveBeenCalled()
        expect(fundTransfer).not.toHaveBeenCalled()
      }
    )
  })

  describe('checkout.session.completed', () => {
    const mockTransfer = {
      id: 'transfer-uuid',
      status: 'quote',
      senderId: 'user-123',
      sourceCurrency: 'USD',
      targetCurrency: 'MXN',
      sourceAmountCents: 10000,
      recipientName: 'Maria Garcia',
      recipientBankAccount: {
        type: 'aba',
        details: { routingNumber: '021000021', accountNumber: '123456' },
      },
      idempotencyKey: 'idem-key-1',
    }

    beforeEach(() => {
      vi.stubEnv('WISE_PROFILE_ID', 'profile-123')
      mockHeaders('valid-sig')
      mockConstructStripeEvent.mockReturnValue({
        type: 'checkout.session.completed',
        data: {
          object: {
            metadata: { transferId: 'transfer-uuid' },
          },
        },
      })
      vi.mocked(db.query.transfers.findFirst).mockResolvedValue(mockTransfer as never)
      vi.mocked(createQuote).mockResolvedValue({
        id: 'quote-uuid',
        rate: 17.5,
        targetAmount: 175,
        fee: { total: 2, transferwise: 2, payIn: 0 },
      } as ReturnType<typeof createQuote> extends Promise<infer T> ? T : never)
      vi.mocked(createRecipient).mockResolvedValue({ id: 9999 } as never)
      vi.mocked(createTransfer).mockResolvedValue({ id: 11111 } as never)
      vi.mocked(fundTransfer).mockResolvedValue({ status: 'COMPLETED', errorCode: null })
    })

    it('creates Wise quote, recipient, transfer and funds it', async () => {
      const res = await POST(makeRequest('{}'))
      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body.received).toBe(true)

      expect(createQuote).toHaveBeenCalledWith(
        expect.objectContaining({ profileId: 'profile-123' })
      )
      expect(createRecipient).toHaveBeenCalledOnce()
      expect(createTransfer).toHaveBeenCalledOnce()
      expect(fundTransfer).toHaveBeenCalledWith('profile-123', 11111)
    })

    it('returns received:true and skips Wise when transfer not in quote status', async () => {
      vi.mocked(db.query.transfers.findFirst).mockResolvedValue({
        ...mockTransfer,
        status: 'processing',
      } as never)

      const res = await POST(makeRequest('{}'))
      expect(res.status).toBe(200)
      expect(createQuote).not.toHaveBeenCalled()
    })

    it('marks transfer failed when Wise call throws', async () => {
      vi.mocked(createQuote).mockRejectedValueOnce(new Error('Wise down'))
      const res = await POST(makeRequest('{}'))
      expect(res.status).toBe(200)
      expect(dbSetMock).toHaveBeenCalledWith(expect.objectContaining({ status: 'failed' }))
    })
  })

  describe('checkout.session.expired', () => {
    it('cancels the transfer on checkout expiry', async () => {
      mockHeaders('valid-sig')
      mockConstructStripeEvent.mockReturnValue({
        type: 'checkout.session.expired',
        data: { object: { metadata: { transferId: 'transfer-uuid' } } },
      })

      const res = await POST(makeRequest('{}'))
      expect(res.status).toBe(200)
      expect(dbSetMock).toHaveBeenCalledWith(expect.objectContaining({ status: 'cancelled' }))
    })
  })

  describe('payment_intent.payment_failed', () => {
    it('marks transfer failed', async () => {
      mockHeaders('valid-sig')
      mockConstructStripeEvent.mockReturnValue({
        type: 'payment_intent.payment_failed',
        data: { object: { metadata: { transferId: 'transfer-uuid' } } },
      })

      const res = await POST(makeRequest('{}'))
      expect(res.status).toBe(200)
      expect(dbSetMock).toHaveBeenCalledWith(expect.objectContaining({ status: 'failed' }))
    })
  })
})
