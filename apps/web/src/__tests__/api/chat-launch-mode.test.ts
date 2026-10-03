import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const { streamTextMock, getAuthUserMock, findUserMock, limitMock } = vi.hoisted(() => ({
  streamTextMock:
    vi.fn<(_options: { system: string }) => { toUIMessageStreamResponse: () => Response }>(),
  getAuthUserMock: vi.fn(),
  findUserMock: vi.fn(),
  limitMock: vi.fn(),
}))

vi.mock('ai', () => ({
  streamText: streamTextMock,
  convertToModelMessages: vi.fn().mockResolvedValue([]),
  tool: vi.fn((definition: unknown) => definition),
  stepCountIs: vi.fn(),
}))
vi.mock('@/lib/supabase/auth-helper', () => ({ getAuthUser: getAuthUserMock }))
vi.mock('@remit/db', () => ({
  db: { query: { users: { findFirst: findUserMock } } },
  users: { id: 'user_id' },
}))
vi.mock('@/lib/rate-limit', () => ({ chatRateLimiter: { limit: limitMock } }))
vi.mock('@remit/api', () => ({ fetchAllQuotes: vi.fn() }))

import { POST } from '@/app/api/chat/route'

function makeRequest() {
  return new Request('http://localhost/api/chat', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      messages: [
        {
          id: 'msg-1',
          role: 'user',
          parts: [{ type: 'text', text: 'What features are available?' }],
        },
      ],
      pageContext: { pathname: '/pricing' },
    }),
  })
}

describe('chat comparison-only launch mode', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubEnv('ENABLE_PAID_PLANS', undefined)
    getAuthUserMock.mockResolvedValue({ id: 'user-123', user_metadata: { full_name: 'Test User' } })
    findUserMock.mockResolvedValue({ fullName: 'Test User' })
    limitMock.mockResolvedValue({ success: true })
    streamTextMock.mockReturnValue({ toUIMessageStreamResponse: () => new Response('mock stream') })
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('does not promote paid plans by default, including pricing-page context', async () => {
    const res = await POST(makeRequest())
    expect(res.status).toBe(200)
    expect(streamTextMock).toHaveBeenCalledOnce()
    const system = streamTextMock.mock.calls[0]?.[0].system
    expect(system).toContain('Paid plans are not currently offered')
    expect(system).toContain('do not offer subscriptions or paid upgrades')
    expect(system).not.toContain('Buddy Plus unlocks higher caps')
    expect(system).not.toContain('Help compare Free vs Plus benefits')
  })

  it('retains paid-plan guidance only when explicitly enabled', async () => {
    vi.stubEnv('ENABLE_PAID_PLANS', 'true')
    const res = await POST(makeRequest())
    expect(res.status).toBe(200)
    const system = streamTextMock.mock.calls[0]?.[0].system
    expect(system).toContain('Buddy Plus unlocks higher caps')
    expect(system).toContain('Help compare Free vs Plus benefits')
    expect(system).not.toContain('Paid plans are not currently offered')
  })

  it('still requires authentication before calling the model', async () => {
    getAuthUserMock.mockResolvedValue(null)
    const res = await POST(makeRequest())
    expect(res.status).toBe(401)
    expect(streamTextMock).not.toHaveBeenCalled()
  })

  it('still rate limits authenticated chat requests', async () => {
    limitMock.mockResolvedValue({ success: false })
    const res = await POST(makeRequest())
    expect(res.status).toBe(429)
    expect(streamTextMock).not.toHaveBeenCalled()
  })
})
