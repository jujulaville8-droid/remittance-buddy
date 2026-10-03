import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { transferExecutionEnabled, paidPlansEnabled } from '@/lib/launch-mode'

beforeEach(() => {
  vi.stubEnv('ENABLE_TRANSFER_EXECUTION', '')
  vi.stubEnv('ENABLE_PAID_PLANS', '')
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', '')
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', '')
})
describe('comparison-only launch gate', () => {
  it('requires explicit true to enable either consequential flow', () => {
    expect(transferExecutionEnabled()).toBe(false)
    expect(paidPlansEnabled()).toBe(false)
    vi.stubEnv('ENABLE_TRANSFER_EXECUTION', 'TRUE')
    expect(transferExecutionEnabled()).toBe(false)
    vi.stubEnv('ENABLE_TRANSFER_EXECUTION', 'true')
    expect(transferExecutionEnabled()).toBe(true)
  })
  it.each(['/send/recipient', '/pay/123/success', '/kyc', '/transfers', '/pricing'])(
    'returns %s to public comparison',
    async (path) => {
      const res = await updateSession(new NextRequest(`https://example.com${path}`))
      expect(res.status).toBe(307)
      expect(res.headers.get('location')).toBe('https://example.com/compare')
    }
  )
  it.each([
    '/api/transfers',
    '/api/payments/intent',
    '/api/kyc/create-inquiry',
    '/api/billing/create-checkout-session',
  ])('blocks %s before auth or downstream services', async (path) => {
    const res = await updateSession(
      new NextRequest(`https://example.com${path}`, {
        headers: { Authorization: 'Bearer arbitrary' },
      })
    )
    expect(res.status).toBe(503)
    expect(res.headers.get('cache-control')).toBe('no-store')
  })
})
