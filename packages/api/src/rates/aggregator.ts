/**
 * Rate aggregator — fetches quotes from every registered provider in parallel,
 * normalizes results, ranks by recipient amount, and returns a QuoteBatchResult.
 *
 * This is the single entry point used by the /api/quotes route and the cron job.
 */

import type { QuoteBatchResult, QuoteFetcher, QuoteRequest } from './types'

import { wiseFetcher } from './fetchers/wise'
import { remitlyFetcher } from './fetchers/remitly'
import { westernUnionFetcher } from './fetchers/western-union'
import { xoomFetcher } from './fetchers/xoom'
import { moneygramFetcher } from './fetchers/moneygram'
import { fetchWiseComparisons } from './fetchers/wise-comparisons'

const ALL_FETCHERS: readonly QuoteFetcher[] = [
  wiseFetcher,
  remitlyFetcher,
  westernUnionFetcher,
  xoomFetcher,
  moneygramFetcher,
]

/**
 * Fetch quotes from every supported provider for a given request.
 * Primary source: Wise Comparisons API (real, multi-provider, single request).
 * No synthetic fallback is used in public comparisons.
 */
export async function fetchAllQuotes(req: QuoteRequest): Promise<QuoteBatchResult> {
  const startedAt = Date.now()
  try {
    const quotes = await fetchWiseComparisons(req)
    return {
      quotes: [...quotes].sort((a, b) => b.targetAmount - a.targetAmount),
      errors: [],
      fetchedAt: new Date().toISOString(),
      durationMs: Date.now() - startedAt,
    }
  } catch (error) {
    // Fail honestly. Synthetic provider prices must never become recommendations.
    return {
      quotes: [],
      errors: [
        {
          provider: 'Comparison source',
          error: error instanceof Error ? error.message : 'Unavailable',
          timestamp: new Date().toISOString(),
        },
      ],
      fetchedAt: new Date().toISOString(),
      durationMs: Date.now() - startedAt,
    }
  }
}

/**
 * Convenience: fetch quotes for a set of common amounts at once.
 * Used by the cron job to pre-warm the cache.
 */
export async function fetchQuotesForBatch(
  corridor: QuoteRequest['corridor'],
  sourceCurrency: string,
  targetCurrency: string,
  amounts: readonly number[],
  payoutMethod: QuoteRequest['payoutMethod'] = 'gcash'
): Promise<Record<number, QuoteBatchResult>> {
  const entries = await Promise.all(
    amounts.map(async (amount) => {
      const result = await fetchAllQuotes({
        corridor,
        sourceCurrency,
        targetCurrency,
        sourceAmount: amount,
        payoutMethod,
      })
      return [amount, result] as const
    })
  )
  return Object.fromEntries(entries)
}

export { ALL_FETCHERS }
