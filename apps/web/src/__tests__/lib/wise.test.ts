import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  mapWiseStatusToTransferStatus,
  verifyWiseWebhookSignature,
  createQuote,
  createTransfer,
} from '@/lib/wise'
import type { WiseTransferStatus } from '@/lib/wise'

// ─── mapWiseStatusToTransferStatus ────────────────────────────────────────────

describe('mapWiseStatusToTransferStatus', () => {
  it.each<[WiseTransferStatus, string]>([
    ['outgoing_payment_sent', 'completed'],
    ['funds_converted', 'completed'],
    ['processing', 'processing'],
    ['incoming_payment_waiting', 'processing'],
    ['cancelled', 'cancelled'],
    ['funds_refunded', 'failed'],
    ['bounced_back', 'failed'],
    ['unknown', 'pending'],
  ])('maps %s → %s', (wiseStatus, expected) => {
    expect(mapWiseStatusToTransferStatus(wiseStatus)).toBe(expected)
  })
})

// ─── verifyWiseWebhookSignature ────────────────────────────────────────────────

describe('verifyWiseWebhookSignature', () => {
  const originalEnv = process.env

  beforeEach(() => {
    process.env = { ...originalEnv }
  })

  it('returns false when WISE_WEBHOOK_SECRET is not set (fail closed)', async () => {
    delete process.env.WISE_WEBHOOK_SECRET
    const result = await verifyWiseWebhookSignature('body', 'anysig')
    expect(result).toBe(false)
  })

  it('returns true for a valid HMAC signature', async () => {
    const secret = 'test-secret'
    const body = '{"event":"test"}'
    process.env.WISE_WEBHOOK_SECRET = secret

    // Generate a valid HMAC-SHA256 signature
    const encoder = new TextEncoder()
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign'],
    )
    const sigBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(body))
    const sigBase64 = btoa(String.fromCharCode(...new Uint8Array(sigBuffer)))

    const result = await verifyWiseWebhookSignature(body, sigBase64)
    expect(result).toBe(true)
  })

  it('returns false for an invalid HMAC signature', async () => {
    process.env.WISE_WEBHOOK_SECRET = 'test-secret'
    const fakeSignature = btoa('not-a-valid-signature-bytes-here!')
    const result = await verifyWiseWebhookSignature('{"event":"test"}', fakeSignature)
    expect(result).toBe(false)
  })
})

// ─── createQuote ──────────────────────────────────────────────────────────────

describe('createQuote', () => {
  beforeEach(() => {
    process.env.WISE_API_KEY = 'test-api-key'
    process.env.WISE_ENV = 'sandbox'
    vi.stubGlobal('fetch', vi.fn())
  })

  it('throws if WISE_API_KEY is not set', async () => {
    delete process.env.WISE_API_KEY
    await expect(
      createQuote({ profileId: '123', sourceCurrency: 'USD', targetCurrency: 'MXN', sourceAmount: 100 }),
    ).rejects.toThrow('WISE_API_KEY is not configured')
  })

  it('returns a quote on success', async () => {
    const mockQuote = {
      id: 'quote-uuid',
      sourceCurrency: 'USD',
      targetCurrency: 'MXN',
      sourceAmount: 100,
      targetAmount: 1750,
      rate: 17.5,
      fee: { total: 2.5, transferwise: 2.0, payIn: 0.5 },
      expirationTime: '2026-04-01T00:00:00Z',
      paymentOptions: [],
    }
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify(mockQuote), { status: 200 }),
    )

    const result = await createQuote({
      profileId: '123',
      sourceCurrency: 'USD',
      targetCurrency: 'MXN',
      sourceAmount: 100,
    })

    expect(result.id).toBe('quote-uuid')
    expect(result.rate).toBe(17.5)
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/v3/profiles/123/quotes'),
      expect.objectContaining({ method: 'POST' }),
    )
  })

  it('throws on non-OK response', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response('Unauthorized', { status: 401 }),
    )

    await expect(
      createQuote({ profileId: '123', sourceCurrency: 'USD', targetCurrency: 'MXN', sourceAmount: 100 }),
    ).rejects.toThrow('Wise createQuote failed (401)')
  })
})

// ─── createTransfer ────────────────────────────────────────────────────────────

describe('createTransfer', () => {
  beforeEach(() => {
    process.env.WISE_API_KEY = 'test-api-key'
    vi.stubGlobal('fetch', vi.fn())
  })

  it('returns a transfer on success', async () => {
    const mockTransfer = {
      id: 12345,
      targetAccount: 67890,
      quote: 'quote-uuid',
      status: 'incoming_payment_waiting' as WiseTransferStatus,
      reference: null,
      rate: 17.5,
      created: '2026-03-31T00:00:00Z',
      business: null,
      details: { reference: null },
      hasActiveIssues: false,
      sourceCurrency: 'USD',
      sourceValue: 100,
      targetCurrency: 'MXN',
      targetValue: 1750,
    }
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify(mockTransfer), { status: 200 }),
    )

    const result = await createTransfer({
      targetAccountId: 67890,
      quoteUuid: 'quote-uuid',
      customerTransactionId: 'idempotency-key',
    })

    expect(result.id).toBe(12345)
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/v1/transfers'),
      expect.objectContaining({ method: 'POST' }),
    )
  })

  it('throws on non-OK response', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response('Bad Request', { status: 400 }),
    )

    await expect(
      createTransfer({ targetAccountId: 1, quoteUuid: 'q', customerTransactionId: 'k' }),
    ).rejects.toThrow('Wise createTransfer failed (400)')
  })
})
