/**
 * Quote cache — Upstash Redis wrapper for storing and retrieving
 * pre-computed rate batches from the cron job.
 *
 * Cache key format: `quotes:{corridor}:{sourceCurrency}:{targetCurrency}:{amount}:{method}`
 * TTL: 90 seconds (cron refreshes every 60s so we have a 30s safety window)
 */

import type { QuoteBatchResult, QuoteRequest } from './types'

const CACHE_TTL_SECONDS = 90
const KEY_PREFIX = 'quotes'

export interface CacheClient {
  get(key: string): Promise<string | null>
  set(key: string, value: string, opts?: { ex?: number }): Promise<void>
  del(key: string): Promise<void>
}

function buildKey(req: {
  corridor: string
  sourceCurrency: string
  targetCurrency: string
  sourceAmount: number
  payoutMethod: string
}): string {
  return [
    KEY_PREFIX,
    req.corridor,
    req.sourceCurrency,
    req.targetCurrency,
    req.sourceAmount.toFixed(2),
    req.payoutMethod,
  ].join(':')
}

export async function getCachedQuotes(
  cache: CacheClient,
  req: QuoteRequest,
): Promise<QuoteBatchResult | null> {
  try {
    const raw = await cache.get(buildKey(req))
    if (!raw) return null
    return JSON.parse(raw) as QuoteBatchResult
  } catch (err) {
    console.error('[cache] getCachedQuotes failed:', err)
    return null
  }
}

export async function setCachedQuotes(
  cache: CacheClient,
  req: QuoteRequest,
  result: QuoteBatchResult,
): Promise<void> {
  try {
    await cache.set(buildKey(req), JSON.stringify(result), { ex: CACHE_TTL_SECONDS })
  } catch (err) {
    console.error('[cache] setCachedQuotes failed:', err)
  }
}

export async function invalidateQuotes(cache: CacheClient, req: QuoteRequest): Promise<void> {
  try {
    await cache.del(buildKey(req))
  } catch (err) {
    console.error('[cache] invalidateQuotes failed:', err)
  }
}

export { buildKey, CACHE_TTL_SECONDS }
