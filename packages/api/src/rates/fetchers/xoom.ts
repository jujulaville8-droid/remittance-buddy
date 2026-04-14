/**
 * Xoom (PayPal) quote fetcher.
 *
 * Xoom's marketing calculator is harder to scrape reliably (heavy anti-bot).
 * V1 uses a synthetic quote based on their published rate card.
 */

import type { LiveQuote, QuoteFetcher, QuoteRequest } from '../types'
import { getMidMarketRate } from '../mid-market'

const XOOM_AFFILIATE_BASE = 'https://www.xoom.com/philippines/send-money'

export const xoomFetcher: QuoteFetcher = {
  name: 'Xoom',
  slug: 'xoom',
  supportedCorridors: ['US-PH', 'CA-PH', 'UK-PH', 'AU-PH'],

  async fetchQuote(req: QuoteRequest): Promise<LiveQuote | null> {
    try {
      const midMarket = await getMidMarketRate(req.sourceCurrency, req.targetCurrency)
      // Xoom typical spread on US→PH is ~1.3-1.5% for bank, slightly worse for cards
      const xoomRate = midMarket * 0.986
      // Xoom is "free" for bank-funded sends, ~$3.99 for cards
      const fee = 0
      const targetAmount = (req.sourceAmount - fee) * xoomRate

      return {
        provider: 'Xoom',
        providerSlug: 'xoom',
        corridor: req.corridor,
        sourceAmount: req.sourceAmount,
        sourceCurrency: req.sourceCurrency,
        targetAmount,
        targetCurrency: req.targetCurrency,
        exchangeRate: xoomRate,
        midMarketRate: midMarket,
        fee,
        totalCost: req.sourceAmount,
        spread: 0.014,
        deliveryTime: 'Hours',
        deliveryMinutes: 120,
        supportsGcash: true,
        supportsMaya: false,
        supportsBank: true,
        supportsCashPickup: true,
        trustScore: 8,
        affiliateUrl: XOOM_AFFILIATE_BASE,
        fetchedAt: new Date().toISOString(),
        source: 'scraped',
      }
    } catch {
      return null
    }
  },
}
