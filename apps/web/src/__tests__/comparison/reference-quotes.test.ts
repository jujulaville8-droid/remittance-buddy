import { describe, expect, it } from 'vitest'
import {
  durationMinutes,
  mapComparisonQuotes,
} from '../../../../../packages/api/src/rates/fetchers/wise-comparisons'
import { usableQuotes, quoteFailureMessage } from '../../../../extension/src/lib/quote-contract'
import type { QuoteRequest } from '../../../../../packages/api/src/rates/types'

const req: QuoteRequest = {
  corridor: 'US-PH',
  sourceCurrency: 'USD',
  targetCurrency: 'PHP',
  sourceAmount: 500,
  payoutMethod: 'gcash',
}
const fetchedAt = '2026-10-03T14:45:00.000Z'
const collected = '2026-10-02T16:35:25Z'
const provider = {
  alias: 'wise',
  name: 'Wise',
  quotes: [
    {
      rate: 62.5415,
      fee: 9.43,
      receivedAmount: 30680.98,
      markup: 0,
      dateCollected: collected,
      deliveryEstimation: { duration: { max: 'PT47H34M19.7S' } },
    },
  ],
}

describe('reference comparison contract', () => {
  it('keeps upstream amount and collection time; fee is inside the send budget', () => {
    const [q] = mapComparisonQuotes([provider], req, fetchedAt)
    expect(q?.targetAmount).toBe(30680.98)
    expect(q?.totalCost).toBe(500)
    expect(q?.fee).toBe(9.43)
    expect(q?.collectedAt).toBe('2026-10-02T16:35:25.000Z')
    expect(q?.fetchedAt).toBe(fetchedAt)
    expect(q?.source).toBe('comparison')
    expect(q?.midMarketRate).toBe(62.5415)
  })
  it('never fabricates payout support, trust or delivery speeds', () => {
    const [q] = mapComparisonQuotes([provider], req, fetchedAt)
    expect(q?.payoutVerified).toBe(false)
    expect(q?.supportsGcash).toBe(false)
    expect(q?.trustScore).toBe(0)
    expect(q?.deliveryTime).toBe('About 48 hours')
    const [unknown] = mapComparisonQuotes(
      [
        {
          alias: 'unknown',
          name: 'Unknown',
          quotes: [{ rate: 60, fee: 0, receivedAmount: 30000 }],
        },
      ],
      req,
      fetchedAt
    )
    expect(unknown?.collectedAt).toBeNull()
    expect(unknown?.midMarketRate).toBe(0)
    expect(unknown?.deliveryTime).toBe('Check provider')
    expect(unknown?.affiliateUrl).toBe('')
  })
  it('rejects invalid prices and country mismatches', () => {
    expect(
      mapComparisonQuotes(
        [{ ...provider, quotes: [{ ...provider.quotes[0], rate: NaN }] }],
        req,
        fetchedAt
      )
    ).toEqual([])
    expect(
      mapComparisonQuotes(
        [{ ...provider, quotes: [{ ...provider.quotes[0], sourceCountry: 'CA' }] }],
        req,
        fetchedAt
      )
    ).toEqual([])
    expect(
      mapComparisonQuotes(
        [{ ...provider, quotes: [{ ...provider.quotes[0], targetCountry: 'IN' }] }],
        req,
        fetchedAt
      )
    ).toEqual([])
  })
  it('accepts only provenance-aware comparison results in the extension', () => {
    const quotes = mapComparisonQuotes([provider], req, fetchedAt)
    expect(usableQuotes(quotes)).toHaveLength(1)
    expect(usableQuotes([{ ...quotes[0], source: 'fallback' }])).toEqual([])
    expect(usableQuotes([{ ...quotes[0], source: 'live-api' }])).toEqual([])
    expect(usableQuotes(null)).toEqual([])
  })
  it('uses recoverable copy instead of raw network or parser errors', () => {
    expect(quoteFailureMessage(new TypeError('Failed to fetch'))).toBe(
      'Could not load comparisons. Check your connection and try again.'
    )
    expect(quoteFailureMessage(new Error('Unexpected token <'))).not.toContain('Unexpected token')
    expect(quoteFailureMessage(new Error('Comparison is unavailable. Try again later.'))).toBe(
      'Comparison is unavailable. Try again later.'
    )
  })
  it('parses provider ISO durations and leaves unknown values unknown', () => {
    expect(durationMinutes('P2DT3H')).toBe(3060)
    expect(durationMinutes('PT30M')).toBe(30)
    expect(durationMinutes('P')).toBeNull()
    expect(durationMinutes(undefined)).toBeNull()
  })
})
