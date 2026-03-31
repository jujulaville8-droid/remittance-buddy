import { describe, it, expect, vi, beforeEach } from 'vitest'

// ─── Module mocks ─────────────────────────────────────────────────────────────

vi.mock('next/headers', () => ({
  headers: vi.fn(),
}))

vi.mock('@remit/db', () => ({
  db: {
    query: {
      transfers: { findFirst: vi.fn() },
    },
    update: vi.fn(() => ({ set: vi.fn(() => ({ where: vi.fn() })) })),
  },
  transfers: {},
}))

vi.mock('@/lib/stripe', () => ({
  constructStripeEvent: vi.fn(),
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
    vi.mocked(constructStripeEvent).mockImplementation(() => {
      throw new Error('Invalid signature')
    })
    const res = await POST(makeRequest('{}'))
    expect(res.status).toBe(401)
    const body = await res.json()
    expect(body.error).toMatch(/Invalid signature/i)
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
      recipientBankAccount: { type: 'aba', details: { routingNumber: '021000021', accountNumber: '123456' } },
      idempotencyKey: 'idem-key-1',
    }

    beforeEach(() => {
      process.env.WISE_PROFILE_ID = 'profile-123'
      mockHeaders('valid-sig')
      vi.mocked(constructStripeEvent).mockReturnValue({
        type: 'checkout.session.completed',
        data: {
          object: {
            metadata: { transferId: 'transfer-uuid' },
          },
        },
      } as ReturnType<typeof constructStripeEvent>)
      vi.mocked(db.query.transfers.findFirst).mockResolvedValue(mockTransfer as never)
      vi.mocked(createQuote).mockResolvedValue({
        id: 'quote-uuid', rate: 17.5, targetAmount: 175,
        fee: { total: 2, transferwise: 2, payIn: 0 },
      } as ReturnType<typeof createQuote> extends Promise<infer T> ? T : never)
      vi.mocked(createRecipient).mockResolvedValue({ id: 9999 } as never)
      vi.mocked(createTransfer).mockResolvedValue({ id: 11111 } as never)
      vi.mocked(fundTransfer).mockResolvedValue({ status: 'COMPLETED', errorCode: null })
    })

    it('creates Wise quote, recipient, transfer and funds it', async () => {
      const dbUpdate = vi.fn(() => ({ set: vi.fn(() => ({ where: vi.fn() })) }))
      vi.mocked(db).update = dbUpdate

      const res = await POST(makeRequest('{}'))
      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body.received).toBe(true)

      expect(createQuote).toHaveBeenCalledWith(expect.objectContaining({ profileId: 'profile-123' }))
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
      const dbSetMock = vi.fn(() => ({ where: vi.fn() }))
      const dbUpdateMock = vi.fn(() => ({ set: dbSetMock }))
      vi.mocked(db).update = dbUpdateMock

      const res = await POST(makeRequest('{}'))
      expect(res.status).toBe(200)
      expect(dbSetMock).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'failed' }),
      )
    })
  })

  describe('checkout.session.expired', () => {
    it('cancels the transfer on checkout expiry', async () => {
      mockHeaders('valid-sig')
      vi.mocked(constructStripeEvent).mockReturnValue({
        type: 'checkout.session.expired',
        data: { object: { metadata: { transferId: 'transfer-uuid' } } },
      } as ReturnType<typeof constructStripeEvent>)

      const dbSetMock = vi.fn(() => ({ where: vi.fn() }))
      const dbUpdateMock = vi.fn(() => ({ set: dbSetMock }))
      vi.mocked(db).update = dbUpdateMock

      const res = await POST(makeRequest('{}'))
      expect(res.status).toBe(200)
      expect(dbSetMock).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'cancelled' }),
      )
    })
  })

  describe('payment_intent.payment_failed', () => {
    it('marks transfer failed', async () => {
      mockHeaders('valid-sig')
      vi.mocked(constructStripeEvent).mockReturnValue({
        type: 'payment_intent.payment_failed',
        data: { object: { metadata: { transferId: 'transfer-uuid' } } },
      } as ReturnType<typeof constructStripeEvent>)

      const dbSetMock = vi.fn(() => ({ where: vi.fn() }))
      const dbUpdateMock = vi.fn(() => ({ set: dbSetMock }))
      vi.mocked(db).update = dbUpdateMock

      const res = await POST(makeRequest('{}'))
      expect(res.status).toBe(200)
      expect(dbSetMock).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'failed' }),
      )
    })
  })
})
