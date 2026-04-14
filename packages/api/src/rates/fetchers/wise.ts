/**
 * Wise public quote fetcher.
 *
 * Uses Wise's public comparison API — the same endpoint their marketing site
 * calls to show live rates. No authentication required.
 *
 * Endpoint: https://wise.com/gateway/v3/price
 */

import type { LiveQuote, QuoteFetcher, QuoteRequest } from '../types'
import { calculateSpread, getMidMarketRate } from '../mid-market'

interface WiseQuoteResponse {
  sourceCurrency: string
  targetCurrency: string
  sourceAmount: number
  targetAmount: number
  rate: number
  fee: number
  payInMethod?: string
  payOutMethod?: string
  estimatedDelivery?: string
  total?: number
}

const WISE_AFFILIATE_BASE = 'https://wise.com/us/send-money/send-money-to-philippines'

export const wiseFetcher: QuoteFetcher = {
  name: 'Wise',
  slug: 'wise',
  supportedCorridors: ['US-PH', 'UK-PH', 'SG-PH', 'CA-PH', 'AU-PH', 'JP-PH', 'HK-PH'],

  async fetchQuote(req: QuoteRequest): Promise<LiveQuote | null> {
    const { sourceCurrency, targetCurrency, sourceAmount, payoutMethod } = req

    // Wise doesn't support GCash or mobile wallets — bank only
    if (payoutMethod !== 'bank') return null

    try {
      const params = new URLSearchParams({
        sourceAmount: sourceAmount.toFixed(2),
        sourceCurrency,
        targetCurrency,
        profileCountry: sourceCurrency === 'USD' ? 'US' : 'GB',
      })

      const url = `https://wise.com/gateway/v3/price?${params.toString()}`
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; RemittanceBuddy/1.0)',
          Accept: 'application/json',
        },
        signal: AbortSignal.timeout(8000),
      })

      if (!res.ok) {
        throw new Error(`Wise API returned ${res.status}`)
      }

      const data = (await res.json()) as WiseQuoteResponse | WiseQuoteResponse[]
      const quote = Array.isArray(data) ? data[0] : data
      if (!quote || typeof quote.rate !== 'number') {
        throw new Error('Invalid Wise response shape')
      }

      const midMarket = await getMidMarketRate(sourceCurrency, targetCurrency)
      const spread = calculateSpread(quote.rate, midMarket)
      const targetAmount =
        typeof quote.targetAmount === 'number'
          ? quote.targetAmount
          : (sourceAmount - (quote.fee ?? 0)) * quote.rate

      return {
        provider: 'Wise',
        providerSlug: 'wise',
        corridor: req.corridor,
        sourceAmount,
        sourceCurrency,
        targetAmount,
        targetCurrency,
        exchangeRate: quote.rate,
        midMarketRate: midMarket,
        fee: quote.fee ?? 0,
        totalCost: sourceAmount + (quote.fee ?? 0),
        spread,
        deliveryTime: quote.estimatedDelivery ?? 'Minutes',
        deliveryMinutes: 15,
        supportsGcash: false,
        supportsMaya: false,
        supportsBank: true,
        supportsCashPickup: false,
        trustScore: 10,
        affiliateUrl: WISE_AFFILIATE_BASE,
        fetchedAt: new Date().toISOString(),
        source: 'live-api',
      }
    } catch (err) {
      // Graceful failure — caller logs and continues with other providers
      console.error(
        `[wise] fetchQuote failed for ${sourceCurrency}→${targetCurrency} ${sourceAmount}:`,
        err instanceof Error ? err.message : err,
      )
      return null
    }
  },
}
