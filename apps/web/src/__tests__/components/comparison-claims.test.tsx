import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { beforeEach, expect, it, vi } from 'vitest'
vi.mock('next/navigation', () => ({ useSearchParams: () => new URLSearchParams() }))
vi.mock('@/components/landing/useLiveQuotes', () => ({
  useLiveQuotes: () => ({
    quotes: [
      {
        provider: 'Example',
        providerSlug: 'example',
        corridor: 'CA-PH',
        sourceAmount: 100,
        sourceCurrency: 'CAD',
        targetAmount: 4300,
        targetCurrency: 'PHP',
        exchangeRate: 43,
        midMarketRate: 43,
        fee: 0,
        totalCost: 100,
        spread: 0,
        deliveryTime: 'Check provider',
        deliveryMinutes: Number.MAX_SAFE_INTEGER,
        supportsGcash: false,
        supportsMaya: false,
        supportsBank: false,
        supportsCashPickup: false,
        trustScore: 0,
        affiliateUrl: '',
        fetchedAt: '2026-10-03T14:00:00Z',
        collectedAt: null,
        source: 'comparison',
        sourceName: 'Wise comparison data',
        payoutVerified: false,
      },
    ],
    loading: false,
    error: null,
    cached: false,
    fetchedAt: new Date('2026-10-03T14:00:00Z'),
    refetch: vi.fn(),
  }),
}))
import { CompareTool } from '@/app/compare/CompareTool'
beforeEach(() => vi.stubGlobal('React', React))
it('does not invent freshness, privacy guarantees, savings or speed rankings', () => {
  const html = renderToStaticMarkup(<CompareTool />)
  for (const claim of [
    'Rates updated',
    'just now',
    'never share your information',
    'You save up to',
    'Fastest delivery',
  ])
    expect(html).not.toContain(claim)
  expect(html).toContain('Source collected:')
  expect(html).toContain('Time unavailable')
  expect(html).toContain('requested · unverified')
  expect(html).toContain('Provider link unavailable')
  expect(html).toContain('Available comparisons')
})
