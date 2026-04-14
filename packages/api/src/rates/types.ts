/**
 * Live rate fetcher types.
 *
 * Each provider implements a `fetchQuote(input)` function that returns a
 * normalized LiveQuote. The scoring engine consumes these and ranks them.
 */

export type Corridor =
  | 'US-PH'
  | 'UK-PH'
  | 'SG-PH'
  | 'AE-PH'
  | 'SA-PH'
  | 'CA-PH'
  | 'AU-PH'
  | 'JP-PH'
  | 'HK-PH'

export type PayoutMethod = 'gcash' | 'maya' | 'bank' | 'cash_pickup'

export interface QuoteRequest {
  readonly corridor: Corridor
  readonly sourceCurrency: string // ISO 4217
  readonly targetCurrency: string
  readonly sourceAmount: number // in major units (USD, not cents)
  readonly payoutMethod: PayoutMethod
}

export interface LiveQuote {
  readonly provider: string
  readonly providerSlug: string
  readonly corridor: Corridor
  readonly sourceAmount: number
  readonly sourceCurrency: string
  readonly targetAmount: number // what the recipient gets
  readonly targetCurrency: string
  readonly exchangeRate: number // provider's rate
  readonly midMarketRate: number // true mid-market benchmark
  readonly fee: number // in source currency
  readonly totalCost: number // source amount + fee
  readonly spread: number // as decimal, e.g. 0.005 = 0.5%
  readonly deliveryTime: string // human-readable, e.g. "Minutes", "1-2 days"
  readonly deliveryMinutes: number // normalized
  readonly supportsGcash: boolean
  readonly supportsMaya: boolean
  readonly supportsBank: boolean
  readonly supportsCashPickup: boolean
  readonly trustScore: number // 1-10
  readonly affiliateUrl: string
  readonly fetchedAt: string // ISO timestamp
  readonly source: 'live-api' | 'scraped' | 'cached' | 'fallback'
}

export interface QuoteFetcher {
  readonly name: string
  readonly slug: string
  readonly supportedCorridors: readonly Corridor[]
  fetchQuote(req: QuoteRequest): Promise<LiveQuote | null>
}

export interface QuoteFetchError {
  readonly provider: string
  readonly error: string
  readonly timestamp: string
}

export interface QuoteBatchResult {
  readonly quotes: readonly LiveQuote[]
  readonly errors: readonly QuoteFetchError[]
  readonly fetchedAt: string
  readonly durationMs: number
}
