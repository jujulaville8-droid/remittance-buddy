/**
 * Rates module — public API.
 *
 * Usage in a Next.js route:
 *
 *   import { fetchAllQuotes, getCachedQuotes, setCachedQuotes } from '@remit/api/rates'
 *   import { Redis } from '@upstash/redis'
 *
 *   const redis = Redis.fromEnv()
 *   const cached = await getCachedQuotes(redis, req)
 *   if (cached) return cached
 *   const fresh = await fetchAllQuotes(req)
 *   await setCachedQuotes(redis, req, fresh)
 *   return fresh
 */

export type {
  Corridor,
  PayoutMethod,
  QuoteRequest,
  LiveQuote,
  QuoteFetcher,
  QuoteFetchError,
  QuoteBatchResult,
} from './types'

export { fetchAllQuotes, fetchQuotesForBatch, ALL_FETCHERS } from './aggregator'

export {
  getCachedQuotes,
  setCachedQuotes,
  invalidateQuotes,
  buildKey,
  CACHE_TTL_SECONDS,
  type CacheClient,
} from './cache'

export { getMidMarketRate, calculateSpread } from './mid-market'

export {
  fetchRateHistory,
  buildRateInsight,
  type RatePoint,
  type RateInsight,
  type SendSignal,
  type TrendDirection,
} from './history'
