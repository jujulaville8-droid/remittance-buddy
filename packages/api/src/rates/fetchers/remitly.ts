/**
 * Remitly public calculator fetcher.
 *
 * Remitly's marketing site uses an unauthenticated calculator endpoint.
 * They support two rate tiers: "Express" (instant, premium) and "Economy"
 * (2-3 days, cheaper). We fetch Express since OFWs typically prioritize speed.
 */

import type { LiveQuote, QuoteFetcher, QuoteRequest } from '../types'
import { calculateSpread, getMidMarketRate } from '../mid-market'

interface RemitlyResponse {
  exchangeRate: number
  fee: number
  deliveryMethod?: string
  estimatedDelivery?: string
}

const REMITLY_AFFILIATE_BASE = 'https://www.remitly.com/us/en/philippines'

export const remitlyFetcher: QuoteFetcher = {
  name: 'Remitly',
  slug: 'remitly',
  supportedCorridors: ['US-PH', 'UK-PH', 'SG-PH', 'CA-PH', 'AU-PH', 'AE-PH', 'SA-PH'],

  async fetchQuote(req: QuoteRequest): Promise<LiveQuote | null> {
    const { sourceCurrency, targetCurrency, sourceAmount, payoutMethod } = req

    try {
      // Remitly's marketing calculator endpoint
      const params = new URLSearchParams({
        amount: sourceAmount.toFixed(2),
        source: sourceCurrency,
        destination: targetCurrency,
      })
      const url = `https://api.remitly.com/v3/calculator/estimate?${params.toString()}`

      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; RemittanceBuddy/1.0)',
          Accept: 'application/json',
        },
        signal: AbortSignal.timeout(8000),
      })

      if (!res.ok) {
        // Fall back to synthetic quote using mid-market minus typical Remitly spread
        // This prevents the whole pipeline from breaking when a single provider is down
        return buildSyntheticQuote(req)
      }

      const data = (await res.json()) as RemitlyResponse
      if (typeof data.exchangeRate !== 'number') {
        return buildSyntheticQuote(req)
      }

      const midMarket = await getMidMarketRate(sourceCurrency, targetCurrency)
      const spread = calculateSpread(data.exchangeRate, midMarket)
      const targetAmount = (sourceAmount - (data.fee ?? 0)) * data.exchangeRate

      return {
        provider: 'Remitly',
        providerSlug: 'remitly',
        corridor: req.corridor,
        sourceAmount,
        sourceCurrency,
        targetAmount,
        targetCurrency,
        exchangeRate: data.exchangeRate,
        midMarketRate: midMarket,
        fee: data.fee ?? 1.99,
        totalCost: sourceAmount + (data.fee ?? 1.99),
        spread,
        deliveryTime: 'Minutes',
        deliveryMinutes: 5,
        supportsGcash: payoutMethod === 'gcash' || targetCurrency === 'PHP',
        supportsMaya: targetCurrency === 'PHP',
        supportsBank: true,
        supportsCashPickup: true,
        trustScore: 9,
        affiliateUrl: REMITLY_AFFILIATE_BASE,
        fetchedAt: new Date().toISOString(),
        source: 'live-api',
      }
    } catch (err) {
      console.error(
        `[remitly] fetchQuote failed for ${sourceCurrency}→${targetCurrency}:`,
        err instanceof Error ? err.message : err,
      )
      return buildSyntheticQuote(req)
    }
  },
}

async function buildSyntheticQuote(req: QuoteRequest): Promise<LiveQuote | null> {
  // When Remitly's API is unavailable, return a conservative synthetic quote
  // based on mid-market minus a historical Remitly-specific spread (~0.55%).
  // Marked as 'fallback' so the UI can optionally flag it.
  try {
    const midMarket = await getMidMarketRate(req.sourceCurrency, req.targetCurrency)
    const syntheticRate = midMarket * 0.9945 // -0.55% spread
    const fee = 1.99
    const targetAmount = (req.sourceAmount - fee) * syntheticRate
    return {
      provider: 'Remitly',
      providerSlug: 'remitly',
      corridor: req.corridor,
      sourceAmount: req.sourceAmount,
      sourceCurrency: req.sourceCurrency,
      targetAmount,
      targetCurrency: req.targetCurrency,
      exchangeRate: syntheticRate,
      midMarketRate: midMarket,
      fee,
      totalCost: req.sourceAmount + fee,
      spread: 0.0055,
      deliveryTime: 'Minutes',
      deliveryMinutes: 5,
      supportsGcash: true,
      supportsMaya: true,
      supportsBank: true,
      supportsCashPickup: true,
      trustScore: 9,
      affiliateUrl: REMITLY_AFFILIATE_BASE,
      fetchedAt: new Date().toISOString(),
      source: 'fallback',
    }
  } catch {
    return null
  }
}
