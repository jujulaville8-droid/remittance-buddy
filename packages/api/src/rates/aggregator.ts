/**
 * Rate aggregator — fetches quotes from every registered provider in parallel,
 * normalizes results, ranks by recipient amount, and returns a QuoteBatchResult.
 *
 * This is the single entry point used by the /api/quotes route and the cron job.
 */

import type {
  LiveQuote,
  QuoteBatchResult,
  QuoteFetcher,
  QuoteFetchError,
  QuoteRequest,
} from './types'

import { wiseFetcher } from './fetchers/wise'
import { remitlyFetcher } from './fetchers/remitly'
import { westernUnionFetcher } from './fetchers/western-union'
import { xoomFetcher } from './fetchers/xoom'
import { moneygramFetcher } from './fetchers/moneygram'

const ALL_FETCHERS: readonly QuoteFetcher[] = [
  wiseFetcher,
  remitlyFetcher,
  westernUnionFetcher,
  xoomFetcher,
  moneygramFetcher,
]

/**
 * Fetch quotes from every supported provider for a given request.
 * Runs all providers in parallel with a per-provider timeout.
 * Returns ranked results (best recipient amount first) plus any errors.
 */
export async function fetchAllQuotes(req: QuoteRequest): Promise<QuoteBatchResult> {
  const startedAt = Date.now()
  const fetchers = ALL_FETCHERS.filter((f) => f.supportedCorridors.includes(req.corridor))

  const settled = await Promise.allSettled(
    fetchers.map(async (fetcher) => {
      const quote = await fetcher.fetchQuote(req)
      return { fetcher, quote }
    }),
  )

  const quotes: LiveQuote[] = []
  const errors: QuoteFetchError[] = []

  for (let i = 0; i < settled.length; i++) {
    const result = settled[i]
    const fetcher = fetchers[i]
    if (!fetcher || !result) continue

    if (result.status === 'fulfilled') {
      if (result.value.quote) {
        quotes.push(result.value.quote)
      } else {
        errors.push({
          provider: fetcher.name,
          error: 'No quote returned',
          timestamp: new Date().toISOString(),
        })
      }
    } else {
      errors.push({
        provider: fetcher.name,
        error: result.reason instanceof Error ? result.reason.message : String(result.reason),
        timestamp: new Date().toISOString(),
      })
    }
  }

  // Rank by target amount descending (best deal first)
  quotes.sort((a, b) => b.targetAmount - a.targetAmount)

  return {
    quotes,
    errors,
    fetchedAt: new Date().toISOString(),
    durationMs: Date.now() - startedAt,
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
  payoutMethod: QuoteRequest['payoutMethod'] = 'gcash',
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
    }),
  )
  return Object.fromEntries(entries)
}

export { ALL_FETCHERS }
