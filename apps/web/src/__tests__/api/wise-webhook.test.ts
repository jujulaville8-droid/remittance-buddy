import { describe, it, expect, vi, beforeEach } from 'vitest'

// ─── Module mocks ─────────────────────────────────────────────────────────────

vi.mock('next/headers', () => ({
  headers: vi.fn(),
}))

vi.mock('@remit/db', () => ({
  db: {
    update: vi.fn(() => ({ set: vi.fn(() => ({ where: vi.fn() })) })),
  },
  transfers: {},
}))

vi.mock('@/lib/wise', () => ({
  verifyWiseWebhookSignature: vi.fn(),
  mapWiseStatusToTransferStatus: vi.fn(),
}))

// ─── Imports after mocks ──────────────────────────────────────────────────────

import { headers } from 'next/headers'
import { db } from '@remit/db'
import { verifyWiseWebhookSignature, mapWiseStatusToTransferStatus } from '@/lib/wise'
import { POST } from '@/app/api/webhooks/wise/route'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function mockHeaders(sig = '') {
  vi.mocked(headers).mockResolvedValue({
    get: (name: string) => (name === 'x-signature-sha256' ? sig : null),
  } as ReturnType<typeof headers> extends Promise<infer T> ? T : never)
}

function makeStateChangeEvent(transferId: number, currentState: string, previousState = 'incoming_payment_waiting') {
  return JSON.stringify({
    event_type: 'transfers#state-change',
    schema_version: '2.0.0',
    sent_at: '2026-03-31T00:00:00Z',
    data: {
      resource: { type: 'transfer', id: transferId, profile_id: 1, account_id: 2 },
      current_state: currentState,
      previous_state: previousState,
      occurred_at: '2026-03-31T00:00:00Z',
    },
  })
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('POST /api/webhooks/wise', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(verifyWiseWebhookSignature).mockResolvedValue(true)
    vi.mocked(mapWiseStatusToTransferStatus).mockReturnValue('completed')
  })

  it('returns 401 when signature verification fails', async () => {
    mockHeaders('bad-sig')
    vi.mocked(verifyWiseWebhookSignature).mockResolvedValue(false)

    const req = new Request('http://localhost/api/webhooks/wise', {
      method: 'POST',
      body: '{}',
    })
    const res = await POST(req)
    expect(res.status).toBe(401)
  })

  it('returns 400 on invalid JSON body', async () => {
    mockHeaders('valid-sig')
    const req = new Request('http://localhost/api/webhooks/wise', {
      method: 'POST',
      body: 'not-json',
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('returns received:true for non-state-change events', async () => {
    mockHeaders('valid-sig')
    const body = JSON.stringify({
      event_type: 'transfers#refund',
      schema_version: '2.0.0',
      sent_at: '2026-03-31T00:00:00Z',
      data: {},
    })
    const req = new Request('http://localhost/api/webhooks/wise', {
      method: 'POST',
      body,
    })
    const res = await POST(req)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.received).toBe(true)
    expect(db.update).not.toHaveBeenCalled()
  })

  it('updates transfer status on state-change event', async () => {
    mockHeaders('valid-sig')
    vi.mocked(mapWiseStatusToTransferStatus).mockReturnValue('completed')

    const dbSetMock = vi.fn(() => ({ where: vi.fn() }))
    const dbUpdateMock = vi.fn(() => ({ set: dbSetMock }))
    vi.mocked(db).update = dbUpdateMock

    const req = new Request('http://localhost/api/webhooks/wise', {
      method: 'POST',
      body: makeStateChangeEvent(12345, 'outgoing_payment_sent'),
    })
    const res = await POST(req)
    expect(res.status).toBe(200)
    expect(mapWiseStatusToTransferStatus).toHaveBeenCalledWith('outgoing_payment_sent')
    expect(dbSetMock).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'completed' }),
    )
  })

  it('maps processing state correctly', async () => {
    mockHeaders('valid-sig')
    vi.mocked(mapWiseStatusToTransferStatus).mockReturnValue('processing')

    const dbSetMock = vi.fn(() => ({ where: vi.fn() }))
    vi.mocked(db).update = vi.fn(() => ({ set: dbSetMock }))

    const req = new Request('http://localhost/api/webhooks/wise', {
      method: 'POST',
      body: makeStateChangeEvent(99999, 'processing'),
    })
    await POST(req)
    expect(dbSetMock).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'processing' }),
    )
  })
})
