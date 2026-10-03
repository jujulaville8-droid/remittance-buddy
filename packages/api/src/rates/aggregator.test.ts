import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { LiveQuote, QuoteRequest } from './types'
const { fetchWiseComparisons } = vi.hoisted(() => ({ fetchWiseComparisons: vi.fn() }))
vi.mock('./fetchers/wise-comparisons', () => ({ fetchWiseComparisons }))
import { fetchAllQuotes } from './aggregator'
const req: QuoteRequest = {
  corridor: 'US-PH',
  sourceCurrency: 'USD',
  targetCurrency: 'PHP',
  sourceAmount: 500,
  payoutMethod: 'bank',
}
beforeEach(() => vi.resetAllMocks())
describe('public reference aggregation', () => {
  it('never fabricates provider prices when the source fails', async () => {
    fetchWiseComparisons.mockRejectedValue(new Error('Unavailable'))
    const result = await fetchAllQuotes(req)
    expect(result.quotes).toEqual([])
    expect(result.errors).toHaveLength(1)
  })
  it('keeps an empty result empty', async () => {
    fetchWiseComparisons.mockResolvedValue([])
    expect((await fetchAllQuotes(req)).quotes).toEqual([])
  })
  it('keeps a single available source quote without synthetic augmentation', async () => {
    const quote = { provider: 'Example', targetAmount: 30000, source: 'comparison' } as LiveQuote
    fetchWiseComparisons.mockResolvedValue([quote])
    expect((await fetchAllQuotes(req)).quotes).toEqual([quote])
  })
  it('ranks the available reference amounts in descending order', async () => {
    const lower = { provider: 'A', targetAmount: 29000 } as LiveQuote
    const higher = { provider: 'B', targetAmount: 30000 } as LiveQuote
    fetchWiseComparisons.mockResolvedValue([lower, higher])
    expect((await fetchAllQuotes(req)).quotes).toEqual([higher, lower])
  })
})
