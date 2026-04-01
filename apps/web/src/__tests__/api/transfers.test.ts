import { describe, it, expect, vi, beforeEach } from 'vitest'
import { randomUUID } from 'crypto'

// ─── Module mocks ─────────────────────────────────────────────────────────────

const mockGetUser = vi.fn()
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => ({
    auth: {
      getUser: mockGetUser,
    },
  })),
}))

vi.mock('@remit/db', () => ({
  db: {
    query: {
      transfers: { findMany: vi.fn(), findFirst: vi.fn() },
      users: { findFirst: vi.fn() },
    },
    insert: vi.fn(() => ({ values: vi.fn(() => ({ returning: vi.fn() })) })),
  },
  transfers: {},
  users: {},
}))

vi.mock('@/lib/wise', () => ({
  createQuote: vi.fn(),
  createRecipient: vi.fn(),
  createTransfer: vi.fn(),
}))

vi.mock('@/lib/rate-limit', () => ({
  transferRateLimiter: { limit: vi.fn() },
}))

vi.mock('@/lib/audit', () => ({
  logAuditEvent: vi.fn(),
  getClientIp: vi.fn(),
}))

// ─── Imports after mocks ──────────────────────────────────────────────────────

import { db } from '@remit/db'
import { createQuote, createRecipient, createTransfer } from '@/lib/wise'
import { transferRateLimiter } from '@/lib/rate-limit'
import { GET, POST } from '@/app/api/transfers/route'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const validTransferBody = {
  sourceCurrency: 'USD',
  targetCurrency: 'MXN',
  sourceAmountCents: 10000,
  recipientName: 'Maria Garcia',
  recipientCountry: 'MX',
  recipientBankAccount: { type: 'aba', details: { routingNumber: '021000021', accountNumber: '123456' } },
  idempotencyKey: randomUUID(),
}

function makePostRequest(body: object) {
  return new Request('http://localhost/api/transfers', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('GET /api/transfers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 when not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const res = await GET()
    expect(res.status).toBe(401)
  })

  it('returns transfer list for authenticated user', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-123' } } })
    vi.mocked(db.query.transfers.findMany).mockResolvedValue([{ id: 'tx-1' }] as never)
    const res = await GET()
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toHaveLength(1)
  })
})

describe('POST /api/transfers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-123' } } })
    vi.mocked(transferRateLimiter.limit).mockResolvedValue({ success: true } as never)
    vi.mocked(db.query.users.findFirst).mockResolvedValue({ id: 'user-123', kycStatus: 'approved' } as never)
    vi.mocked(db.query.transfers.findFirst).mockResolvedValue(null)
    process.env.WISE_PROFILE_ID = 'profile-123'
    vi.mocked(createQuote).mockResolvedValue({
      id: 'quote-uuid', rate: 17.5, targetAmount: 175,
      fee: { total: 2, transferwise: 2, payIn: 0 },
    } as never)
    vi.mocked(createRecipient).mockResolvedValue({ id: 9999 } as never)
    vi.mocked(createTransfer).mockResolvedValue({ id: 11111 } as never)
    const returningMock = vi.fn().mockResolvedValue([{ id: 'new-tx-id', status: 'processing' }])
    const valuesMock = vi.fn(() => ({ returning: returningMock }))
    vi.mocked(db).insert = vi.fn(() => ({ values: valuesMock }))
  })

  it('returns 401 when not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const res = await POST(makePostRequest(validTransferBody))
    expect(res.status).toBe(401)
  })

  it('returns 429 when rate limit exceeded', async () => {
    vi.mocked(transferRateLimiter.limit).mockResolvedValue({ success: false } as never)
    const res = await POST(makePostRequest(validTransferBody))
    expect(res.status).toBe(429)
  })

  it('returns 403 with KYC_REQUIRED when user KYC is pending', async () => {
    vi.mocked(db.query.users.findFirst).mockResolvedValue({ id: 'user-123', kycStatus: 'pending' } as never)
    const res = await POST(makePostRequest(validTransferBody))
    expect(res.status).toBe(403)
    const body = await res.json()
    expect(body.error).toBe('KYC_REQUIRED')
    expect(body.kycStatus).toBe('pending')
  })

  it('returns 403 with KYC_REQUIRED when user KYC is none', async () => {
    vi.mocked(db.query.users.findFirst).mockResolvedValue({ id: 'user-123', kycStatus: 'none' } as never)
    const res = await POST(makePostRequest(validTransferBody))
    expect(res.status).toBe(403)
    const body = await res.json()
    expect(body.error).toBe('KYC_REQUIRED')
  })

  it('returns 404 when user not found', async () => {
    vi.mocked(db.query.users.findFirst).mockResolvedValue(null)
    const res = await POST(makePostRequest(validTransferBody))
    expect(res.status).toBe(404)
  })

  it('returns 400 for invalid request body (missing field)', async () => {
    const res = await POST(makePostRequest({ sourceCurrency: 'USD' }))
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toBe('Invalid request')
  })

  it('returns 400 for currency codes that are wrong length', async () => {
    const res = await POST(makePostRequest({
      ...validTransferBody,
      sourceCurrency: 'USDD', // 4 chars, must be 3
    }))
    expect(res.status).toBe(400)
  })

  it('returns 400 when idempotencyKey is not a UUID', async () => {
    const res = await POST(makePostRequest({
      ...validTransferBody,
      idempotencyKey: 'not-a-uuid',
    }))
    expect(res.status).toBe(400)
  })

  it('returns existing transfer on duplicate idempotency key', async () => {
    vi.mocked(db.query.transfers.findFirst).mockResolvedValue({ id: 'existing-tx', status: 'processing' } as never)
    const res = await POST(makePostRequest(validTransferBody))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.id).toBe('existing-tx')
    expect(createQuote).not.toHaveBeenCalled()
  })

  it('creates transfer successfully and returns 201', async () => {
    const res = await POST(makePostRequest({ ...validTransferBody, idempotencyKey: randomUUID() }))
    expect(res.status).toBe(201)
    expect(createQuote).toHaveBeenCalledWith(expect.objectContaining({ profileId: 'profile-123' }))
    expect(createRecipient).toHaveBeenCalledOnce()
    expect(createTransfer).toHaveBeenCalledOnce()
  })

  it('returns 500 when WISE_PROFILE_ID is not configured', async () => {
    delete process.env.WISE_PROFILE_ID
    const res = await POST(makePostRequest(validTransferBody))
    expect(res.status).toBe(500)
  })
})
