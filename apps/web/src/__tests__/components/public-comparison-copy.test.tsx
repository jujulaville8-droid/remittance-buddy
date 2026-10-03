import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import type { LiveQuote, UseLiveQuotesResult } from '@/components/landing/useLiveQuotes'

const { useLiveQuotes } = vi.hoisted(() => ({ useLiveQuotes: vi.fn() }))
vi.mock('@/components/landing/useLiveQuotes', () => ({ useLiveQuotes }))
vi.mock('@/lib/hooks/useSessionUser', () => ({
  useSessionUser: () => ({ user: null, loading: false }),
}))
vi.mock('@/components/NavAuthButtons', () => ({ NavAuthButtons: () => null }))
vi.mock('@/components/landing/useMagneticTilt', () => ({ useMagneticTilt: () => null }))
vi.mock('@/components/landing/useParallax', () => ({ useParallax: () => null }))
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), refresh: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}))

import LandingReceipt from '@/components/landing/LandingReceipt'
import SignInPage from '@/app/sign-in/[[...sign-in]]/page'
import SignUpPage from '@/app/sign-up/[[...sign-up]]/page'
import { Footer } from '@/components/landing/Footer'

const quote = (patch: Partial<LiveQuote> = {}): LiveQuote => ({
  provider: 'Example Provider',
  providerSlug: 'example',
  corridor: 'US-PH',
  sourceAmount: 1000,
  sourceCurrency: 'USD',
  targetAmount: 56123.45,
  targetCurrency: 'PHP',
  exchangeRate: 56.5,
  midMarketRate: 57,
  fee: 5,
  totalCost: 10,
  spread: 0.5,
  deliveryTime: '1 day',
  deliveryMinutes: 1440,
  supportsGcash: true,
  supportsMaya: false,
  supportsBank: true,
  supportsCashPickup: false,
  trustScore: 0,
  affiliateUrl: 'https://example.test',
  fetchedAt: '2026-10-03T10:00:00Z',
  source: 'comparison',
  ...patch,
})
const result = (patch: Partial<UseLiveQuotesResult> = {}): UseLiveQuotesResult => ({
  quotes: [],
  loading: false,
  error: null,
  fetchedAt: null,
  cached: false,
  refetch: vi.fn(),
  ...patch,
})

beforeEach(() => {
  // The application uses Next's automatic JSX runtime; Vitest's standalone
  // TSX transformer also supports classic JSX when React is in global scope.
  vi.stubGlobal('React', React)
  useLiveQuotes.mockReturnValue(result())
})

describe('public comparison copy', () => {
  it('replaces fabricated social proof and guarantee copy', () => {
    const html = renderToStaticMarkup(<LandingReceipt />)
    for (const claim of [
      '47,218',
      '$2.4M',
      '1,240',
      '10K+',
      '100% Secure',
      'Best rate guaranteed',
      'FinCEN-registered',
      'BSP-registered',
      'FCA-authorised',
    ]) {
      expect(html).not.toContain(claim)
    }
    expect(html).toContain('Compare without creating an account')
    expect(html).toContain('Illustrative example')
    expect(html).toContain('fictional providers')
    expect(html).toContain('not current rates or a savings promise')
    expect(html).not.toContain('href="#"')
    expect(html).not.toContain('App Store')
    expect(html).not.toContain('Google Play')
  })

  it('renders no invented amount or fake freshness with no data', () => {
    const html = renderToStaticMarkup(<LandingReceipt />)
    expect(html).toContain('No quote available')
    expect(html).not.toContain('56,850')
    expect(html).not.toContain('Live ·')
    const source = readFileSync(
      resolve(process.cwd(), 'src/components/landing/LandingReceipt.tsx'),
      'utf8'
    )
    expect(source).not.toContain('useHeroMotion')
    expect(source).not.toContain('Math.random')
  })

  it('renders the returned amount without fabricated motion or source timestamp', () => {
    useLiveQuotes.mockReturnValue(result({ quotes: [quote()] }))
    const html = renderToStaticMarkup(<LandingReceipt />)
    expect(html).toContain('56,123.45')
    expect(html).toContain('Reference quote')
    expect(html).toContain('Source time unavailable')
    expect(html).not.toContain('Live ·')
  })

  it.each([
    ['fallback', false, 'Estimate'],
    ['cached', false, 'Cached reference'],
    ['comparison', true, 'Cached reference'],
    ['live-api', false, 'Provider API quote'],
    ['scraped', false, 'Reference quote'],
  ] as const)('labels %s provenance accurately', (source, cached, label) => {
    useLiveQuotes.mockReturnValue(result({ quotes: [quote({ source })], cached }))
    expect(renderToStaticMarkup(<LandingReceipt />)).toContain(label)
  })

  it('uses the actual source timestamp when supplied', () => {
    useLiveQuotes.mockReturnValue(
      result({ quotes: [quote({ collectedAt: '2026-10-01T09:00:00Z' })] })
    )
    const html = renderToStaticMarkup(<LandingReceipt />)
    expect(html).toContain('Source time')
    expect(html).not.toContain('Source time unavailable')
  })

  it.each([
    { sourceAmount: 500 },
    { corridor: 'CA-PH' },
    { sourceCurrency: 'CAD' },
    { targetCurrency: 'EUR' },
    { targetAmount: NaN },
    { targetAmount: -1 },
  ])('does not present a mismatched or invalid quote as current: %j', (patch) => {
    useLiveQuotes.mockReturnValue(result({ quotes: [quote(patch)] }))
    const html = renderToStaticMarkup(<LandingReceipt />)
    expect(html).toContain('No quote available')
    expect(html).not.toContain('Example Provider')
  })

  it.each([{ loading: true }, { error: 'Network unavailable' }])(
    'hides prior quotes during loading or errors: %j',
    (patch) => {
      useLiveQuotes.mockReturnValue(result({ quotes: [quote()], ...patch }))
      expect(renderToStaticMarkup(<LandingReceipt />)).not.toContain('Example Provider')
    }
  )

  it.each([SignInPage, SignUpPage])(
    'offers public comparison from account pages without fake claims',
    (Page) => {
      const html = renderToStaticMarkup(<Page />)
      expect(html).toContain('Compare without an account')
      expect(html).toContain('href="/compare"')
      for (const claim of [
        '47,218',
        '$2.4M',
        '12+ providers',
        'Free forever',
        'Naka-save',
        'referral fee',
      ]) {
        expect(html).not.toContain(claim)
      }
    }
  )

  it('provides real navigation instead of unavailable download or footer links', () => {
    const html = renderToStaticMarkup(<Footer />)
    expect(html).not.toContain('href="#')
    expect(html).not.toContain('affiliate fees')
    expect(html).toContain('href="/compare?corridor=US-PH"')
  })
})
