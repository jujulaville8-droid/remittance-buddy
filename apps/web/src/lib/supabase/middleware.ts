import { transferExecutionEnabled, paidPlansEnabled } from '@/lib/launch-mode'
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PROTECTED_PATHS = [
  '/dashboard',
  '/family',
  '/alerts',
  '/send',
  '/pay',
  '/onboard',
  '/kyc',
  '/transfers',
  '/recipients',
  '/api/transfers',
  '/api/kyc',
  '/api/chat',
  '/api/recipients',
  '/api/payments',
  '/api/migrate',
  '/api/alerts',
  '/api/family',
  '/api/billing',
] as const

export async function updateSession(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isPath = (path: string) => pathname === path || pathname.startsWith(`${path}/`)
  const transferPath = [
    '/send',
    '/pay',
    '/kyc',
    '/transfers',
    '/api/transfers',
    '/api/payments',
    '/api/kyc',
  ].some(isPath)
  const paidPath = ['/pricing', '/api/billing'].some(isPath)
  if ((transferPath && !transferExecutionEnabled()) || (paidPath && !paidPlansEnabled())) {
    if (!pathname.startsWith('/api/'))
      return NextResponse.redirect(new URL('/compare', request.url))
    return NextResponse.json(
      { error: 'This feature is not available in comparison mode.' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } }
    )
  }
  const isProtected = PROTECTED_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  )
  // Public comparison traffic must not depend on an authentication service round trip.
  if (!isProtected) return NextResponse.next({ request })
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // The comparison and quote routes are public. Missing account-service config
  // must not break them, but it must never open a personal page or protected API.
  if (!supabaseUrl || !supabaseKey) {
    if (isProtected) {
      return NextResponse.json(
        { error: 'Authentication is unavailable. Please try again later.' },
        { status: 503, headers: { 'Cache-Control': 'no-store' } }
      )
    }
    return NextResponse.next({ request })
  }

  let supabaseResponse = NextResponse.next({ request })
  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        supabaseResponse = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        )
      },
    },
  })

  // Keep session validation immediately after creating the server client.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Extension bearer tokens are validated inside protected API handlers.
  // A header must not bypass authentication for a personal page.
  const hasApiBearer =
    pathname.startsWith('/api/') && request.headers.get('Authorization')?.startsWith('Bearer ')

  if (!user && isProtected && !hasApiBearer) {
    if (pathname.startsWith('/api/')) {
      const response = NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401, headers: { 'Cache-Control': 'no-store' } }
      )
      supabaseResponse.cookies.getAll().forEach((cookie) => response.cookies.set(cookie))
      return response
    }
    const url = request.nextUrl.clone()
    url.pathname = '/sign-in'
    url.searchParams.set('next', pathname + (request.nextUrl.search || ''))
    const response = NextResponse.redirect(url)
    supabaseResponse.cookies.getAll().forEach((cookie) => response.cookies.set(cookie))
    return response
  }

  return supabaseResponse
}
