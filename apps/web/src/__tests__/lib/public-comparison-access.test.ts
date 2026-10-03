import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

const { getUser, createServerClient } = vi.hoisted(() => ({
  getUser: vi.fn(),
  createServerClient: vi.fn(),
}))

vi.mock('@supabase/ssr', () => ({ createServerClient }))

import { updateSession } from '@/lib/supabase/middleware'

const request = (path: string, headers?: HeadersInit) =>
  new NextRequest(`https://example.test${path}`, { headers })

beforeEach(() => {
  vi.resetAllMocks()
  vi.stubEnv('ENABLE_TRANSFER_EXECUTION', 'true')
  vi.stubEnv('ENABLE_PAID_PLANS', 'true')
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://example.supabase.co')
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'test-public-key')
  getUser.mockResolvedValue({ data: { user: null } })
  createServerClient.mockReturnValue({ auth: { getUser } })
})

describe('public comparison access', () => {
  it.each(['/', '/compare', '/compare?corridor=CA-PH&amount=500', '/api/quotes?sourceAmount=500'])(
    'allows unauthenticated access to %s',
    async (path) => {
      const response = await updateSession(request(path))
      expect(response.status).toBe(200)
      expect(response.headers.get('location')).toBeNull()
      expect(response.headers.get('x-middleware-next')).toBe('1')
    }
  )

  it.each([
    '/dashboard',
    '/family',
    '/alerts',
    '/send/recipient',
    '/pay/transfer-1/success',
    '/onboard',
    '/kyc',
    '/recipients',
    '/transfers/transfer-1',
  ])('still protects personal page %s', async (path) => {
    const response = await updateSession(request(path))
    expect(response.status).toBe(307)
    const destination = new URL(response.headers.get('location')!)
    expect(destination.pathname).toBe('/sign-in')
    expect(destination.searchParams.get('next')).toBe(path)
  })

  it('preserves the destination query on a protected page redirect', async () => {
    const response = await updateSession(request('/family?group=family-1'))
    expect(new URL(response.headers.get('location')!).searchParams.get('next')).toBe(
      '/family?group=family-1'
    )
  })

  it.each([
    '/api/transfers',
    '/api/recipients',
    '/api/payments',
    '/api/family/members',
    '/api/kyc',
  ])('still rejects unauthenticated API access to %s', async (path) => {
    const response = await updateSession(request(path))
    expect(response.status).toBe(401)
    expect(response.headers.get('x-middleware-next')).toBeNull()
    expect(await response.json()).toEqual({ error: 'Unauthorized' })
  })

  it('allows an authenticated personal page', async () => {
    getUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    expect((await updateSession(request('/dashboard'))).status).toBe(200)
  })

  it('delegates extension bearer token validation to the API handler', async () => {
    const response = await updateSession(
      request('/api/recipients', { Authorization: 'Bearer test-token' })
    )
    expect(response.headers.get('x-middleware-next')).toBe('1')
  })

  it('does not accept a bearer header as authentication for personal pages', async () => {
    const response = await updateSession(
      request('/dashboard', { Authorization: 'Bearer test-token' })
    )
    expect(response.status).toBe(307)
  })

  describe('without account service configuration', () => {
    beforeEach(() => {
      vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', '')
      vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', '')
    })

    it.each(['/', '/compare', '/api/quotes', '/sign-in', '/sign-up'])(
      'keeps %s available without constructing an auth client',
      async (path) => {
        const response = await updateSession(request(path))
        expect(response.headers.get('x-middleware-next')).toBe('1')
        expect(createServerClient).not.toHaveBeenCalled()
      }
    )

    it.each(['/dashboard', '/family', '/api/recipients', '/transfers/transfer-1'])(
      'fails closed for %s',
      async (path) => {
        const response = await updateSession(request(path))
        expect(response.status).toBe(503)
        expect(response.headers.get('x-middleware-next')).toBeNull()
        expect(response.headers.get('cache-control')).toBe('no-store')
        expect(createServerClient).not.toHaveBeenCalled()
      }
    )

    it('also fails closed for bearer requests when configuration is missing', async () => {
      const response = await updateSession(
        request('/api/recipients', { Authorization: 'Bearer test-token' })
      )
      expect(response.status).toBe(503)
    })
  })
})
