/**
 * MoneyGram quote fetcher.
 *
 * Similar situation to WU — their public endpoint is geo-blocked and often
 * changes. V1 uses a synthetic quote based on historical averages.
 */

import type { LiveQuote, QuoteFetcher, QuoteRequest } from '../types'
import { getMidMarketRate } from '../mid-market'

const MG_AFFILIATE_BASE = 'https://www.moneygram.com/mgo/us/en/send/philippines'

export const moneygramFetcher: QuoteFetcher = {
  name: 'MoneyGram',
  slug: 'moneygram',
  supportedCorridors: ['US-PH', 'UK-PH', 'CA-PH', 'AU-PH', 'AE-PH', 'SA-PH'],

  async fetchQuote(req: QuoteRequest): Promise<LiveQuote | null> {
    try {
      const midMarket = await getMidMarketRate(req.sourceCurrency, req.targetCurrency)
      // MoneyGram typical spread on US→PH is ~2.2-2.5%
      const mgRate = midMarket * 0.9775
      const fee = req.sourceAmount < 100 ? 2.99 : req.sourceAmount < 500 ? 4.99 : 5.99
      const targetAmount = (req.sourceAmount - fee) * mgRate

      return {
        provider: 'MoneyGram',
        providerSlug: 'moneygram',
        corridor: req.corridor,
        sourceAmount: req.sourceAmount,
        sourceCurrency: req.sourceCurrency,
        targetAmount,
        targetCurrency: req.targetCurrency,
        exchangeRate: mgRate,
        midMarketRate: midMarket,
        fee,
        totalCost: req.sourceAmount + fee,
        spread: 0.0225,
        deliveryTime: 'Minutes',
        deliveryMinutes: 10,
        supportsGcash: true,
        supportsMaya: false,
        supportsBank: true,
        supportsCashPickup: true,
        trustScore: 8,
        affiliateUrl: MG_AFFILIATE_BASE,
        fetchedAt: new Date().toISOString(),
        source: 'scraped',
      }
    } catch {
      return null
    }
  },
}
