import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { LiveQuote } from '@/components/landing/useLiveQuotes'

const { useLiveQuotes, search } = vi.hoisted(() => ({
  useLiveQuotes: vi.fn(),
  search: { value: new URLSearchParams() },
}))
vi.mock('@/components/landing/useLiveQuotes', () => ({ useLiveQuotes }))
vi.mock('next/navigation', () => ({ useSearchParams: () => search.value }))

import {
  ComparisonCanvas,
  CORRIDORS,
  collectionTime,
  matchingQuotes,
  safeProviderUrl,
  validAmount,
} from '@/components/landing/ComparisonCanvas'
import { CompareTool } from '@/app/compare/CompareTool'
import { Nav } from '@/components/landing/Nav'

const quote = (patch: Partial<LiveQuote> = {}): LiveQuote => ({
  provider: 'Test Provider',
  providerSlug: 'test',
  corridor: 'US-PH',
  sourceAmount: 1000,
  sourceCurrency: 'USD',
  targetAmount: 55555.55,
  targetCurrency: 'PHP',
  exchangeRate: 55.834724,
  midMarketRate: 56,
  fee: 5,
  totalCost: 1000,
  spread: 0,
  deliveryTime: 'Check provider',
  deliveryMinutes: Number.MAX_SAFE_INTEGER,
  supportsGcash: false,
  supportsMaya: false,
  supportsBank: false,
  supportsCashPickup: false,
  trustScore: 0,
  affiliateUrl: 'https://wise.com/quote',
  fetchedAt: '2026-10-03T12:00:00Z',
  collectedAt: '2026-10-01T12:00:00Z',
  source: 'comparison',
  sourceName: 'Wise comparison data',
  payoutVerified: false,
  ...patch,
})

beforeEach(() => {
  vi.stubGlobal('React', React)
  search.value = new URLSearchParams()
  useLiveQuotes.mockReset()
  useLiveQuotes.mockReturnValue({
    quotes: [quote()],
    loading: false,
    error: null,
    fetchedAt: new Date('2026-10-03T12:00:00Z'),
    cached: false,
    refetch: vi.fn(),
  })
})

describe('Clear Canvas comparison', () => {
  it.each(['1', '1.01', '1000', '50000', '50000.00'])('accepts a valid budget %s', (input) => {
    expect(validAmount(input)).toBe(Number(input))
  })
  it.each([
    '',
    ' ',
    '0',
    '-1',
    '0.99',
    '50000.01',
    '50001',
    'Infinity',
    'NaN',
    '1e3',
    '1,000',
    '1.001',
    '12abc',
  ])('rejects invalid budgets %s', (input) => {
    expect(validAmount(input)).toBeNull()
  })
  it('does not query with an invalid budget', () => {
    const html = renderToStaticMarkup(<ComparisonCanvas initialAmount="50001" />)
    expect(useLiveQuotes).not.toHaveBeenCalled()
    expect(html).toContain('Enter a valid total send budget')
    expect(html).not.toContain('Test Provider')
  })
  it('uses native labeled controls with all required financial context visible', () => {
    const html = renderToStaticMarkup(<ComparisonCanvas />)
    for (const text of [
      'Sender country / currency',
      'Total send budget',
      'Preferred payout',
      'Receiving currency',
      'Compare options',
      'Reference recipient amount',
      'Included fee',
      'Exchange rate',
      'Source collected:',
      'Source age:',
      'requested · unverified',
      'PHP',
      'Source: Wise comparison data',
    ])
      expect(html).toContain(text)
    expect(html).toContain('inputMode="decimal"')
    expect(html).toContain('1–50,000 USD')
    expect(html).toContain('<select')
    expect(html).not.toContain('View breakdown')
    expect(html).not.toContain('Selected sort leader')
    expect(html).not.toContain('Illustrative')
    expect(html).not.toContain('Top in selected sort')
  })
  it('does not fabricate providers, amounts or timestamps in loading and empty states', () => {
    useLiveQuotes.mockReturnValue({
      quotes: [],
      loading: true,
      error: null,
      cached: false,
      fetchedAt: null,
      refetch: vi.fn(),
    })
    let html = renderToStaticMarkup(<ComparisonCanvas />)
    expect(html).toContain('Checking available reference comparisons')
    expect(html).not.toContain('55,555.55')
    expect(html).not.toContain('Source collected:')
    useLiveQuotes.mockReturnValue({
      quotes: [],
      loading: false,
      error: null,
      cached: false,
      fetchedAt: null,
      refetch: vi.fn(),
    })
    html = renderToStaticMarkup(<ComparisonCanvas />)
    expect(html).toContain('No quote available')
    expect(html).not.toContain('Test Provider')
  })
  it('preserves the ordinary provider URL without click tracking parameters', () => {
    const html = renderToStaticMarkup(<ComparisonCanvas />)
    expect(html).toContain('href="https://wise.com/quote"')
    expect(html).toContain('rel="noopener noreferrer"')
    expect(html).toContain('opens provider website in a new tab')
    expect(html).not.toContain('utm_')
  })
  it.each([
    '',
    'javascript:alert(1)',
    'http://wise.com',
    'https://unknown.example',
    'https://user:password@wise.com',
    'https://wise.com:444',
    'not-a-url',
  ])('leaves unsafe or absent links inactive: %s', (url) => {
    useLiveQuotes.mockReturnValue({
      quotes: [quote({ affiliateUrl: url })],
      loading: false,
      error: null,
      cached: false,
      fetchedAt: null,
      refetch: vi.fn(),
    })
    const html = renderToStaticMarkup(<ComparisonCanvas />)
    expect(html).toContain('Provider link unavailable')
    expect(html).not.toContain('Check Test Provider')
  })
  it('sorts actual reference amounts without an emphasized winner card', () => {
    useLiveQuotes.mockReturnValue({
      quotes: [
        quote({ provider: 'Second', targetAmount: 50000 }),
        quote({ provider: 'First', providerSlug: 'first', targetAmount: 60000 }),
      ],
      loading: false,
      error: null,
      cached: false,
      fetchedAt: null,
      refetch: vi.fn(),
    })
    const html = renderToStaticMarkup(<ComparisonCanvas />)
    expect(html.indexOf('<h3>First')).toBeLessThan(html.indexOf('<h3>Second'))
    expect(html.match(/class="[^"]*providerCard/g)).toHaveLength(2)
    expect(html).not.toContain('winner')
  })
  it('retains compare-route defaults and validates supplied query parameters', () => {
    renderToStaticMarkup(<CompareTool />)
    expect(useLiveQuotes).toHaveBeenLastCalledWith(
      expect.objectContaining({
        corridor: 'CA-PH',
        sourceCurrency: 'CAD',
        sourceAmount: 100,
        payoutMethod: 'bank',
      })
    )
    search.value = new URLSearchParams('corridor=AU-PH&amount=250.50&payout=gcash')
    renderToStaticMarkup(<CompareTool />)
    expect(useLiveQuotes).toHaveBeenLastCalledWith(
      expect.objectContaining({
        corridor: 'AU-PH',
        sourceCurrency: 'AUD',
        sourceAmount: 250.5,
        payoutMethod: 'gcash',
      })
    )
  })
  it('does not silently replace an out-of-range URL budget with another amount', () => {
    search.value = new URLSearchParams('amount=50001')
    const html = renderToStaticMarkup(<CompareTool />)
    expect(html).toContain('value="50001"')
    expect(html).toContain('Enter a valid total send budget')
    expect(useLiveQuotes).not.toHaveBeenCalled()
  })
  it.each([
    { fee: NaN },
    { fee: -1 },
    { fee: 1001 },
    { exchangeRate: Infinity },
    { exchangeRate: 0 },
    { sourceAmount: 999 },
    { corridor: 'CA-PH' },
    { sourceCurrency: 'CAD' },
    { targetCurrency: 'USD' },
  ])('excludes invalid or different-query financial values: %j', (patch) => {
    expect(matchingQuotes([quote(patch)], CORRIDORS[0], 1000)).toEqual([])
  })
  it('retains exact source time and flags old data', () => {
    expect(collectionTime('2026-10-01T12:00:00Z', Date.parse('2026-10-03T12:00:00Z'))).toEqual({
      iso: '2026-10-01T12:00:00.000Z',
      label: '1 Oct 2026, 12:00 UTC',
      ageLabel: 'Over 24 hours old · 2 days ago',
      old: true,
    })
    expect(collectionTime('invalid')).toBeNull()
    expect(collectionTime(null)).toBeNull()
    expect(
      collectionTime('2026-10-04T12:00:00Z', Date.parse('2026-10-03T12:00:00Z'))?.ageLabel
    ).toBe('Source time is in the future; freshness cannot be verified')
  })
  it('uses the approved original hero artwork separately from real text and controls', () => {
    const html = renderToStaticMarkup(<ComparisonCanvas />)
    expect(html).toContain('philippines-coast-concept-a.png')
    expect(html).toContain('sizes="100vw"')
    expect(html).toContain('Make more of<br/>what you send')
    expect(html).not.toContain('Clear_Canvas.png')
  })
  it('keeps account and payment actions out of the navigation', () => {
    const html = renderToStaticMarkup(<Nav />)
    expect(html).toContain('My Remittance Pal')
    expect(html).toContain('aria-expanded="false"')
    expect(html).not.toContain('/sign-in')
    expect(html).not.toContain('/pricing')
    expect(html).not.toContain('/send')
  })
})

it('allows only the mapped ordinary provider destinations', () => {
  expect(safeProviderUrl('https://wise.com/')).toBe('https://wise.com/')
  expect(safeProviderUrl('https://www.remitly.com/')).toBe('https://www.remitly.com/')
  expect(safeProviderUrl('https://wise.com.attacker.example/')).toBeNull()
  expect(safeProviderUrl('https://attacker@wise.com/')).toBeNull()
})
