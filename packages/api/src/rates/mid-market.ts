/**
 * Mid-market reference rates.
 *
 * For V1 we use Wise's public currency API to fetch the actual mid-market rate
 * (Wise itself publishes it openly as their marketing differentiator).
 * This is used to calculate each provider's spread as a comparable metric.
 *
 * In V2 we can swap for a multi-source aggregate (ECB, OpenExchangeRates, etc.)
 */

const CACHE_TTL_MS = 60 * 1000 // 60 seconds
const cache = new Map<string, { rate: number; fetchedAt: number }>()

export async function getMidMarketRate(
  sourceCurrency: string,
  targetCurrency: string,
): Promise<number> {
  const key = `${sourceCurrency}-${targetCurrency}`
  const cached = cache.get(key)
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return cached.rate
  }

  // Wise's public rate endpoint — no auth required, updated every few minutes
  // Returns the genuine interbank mid-market rate
  const url = `https://wise.com/rates/live?source=${sourceCurrency}&target=${targetCurrency}&length=1&resolution=hourly&unit=hour`

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; RemittanceBuddy/1.0)',
        Accept: 'application/json',
      },
    })
    if (!res.ok) throw new Error(`Wise rates API returned ${res.status}`)
    const data = (await res.json()) as Array<{ value: number; time: string }>
    const latest = data[data.length - 1]
    if (!latest || typeof latest.value !== 'number') {
      throw new Error('No rate data in Wise response')
    }
    cache.set(key, { rate: latest.value, fetchedAt: Date.now() })
    return latest.value
  } catch (err) {
    // Fallback: use stale cache if available
    if (cached) return cached.rate
    // Last-resort hardcoded fallback for USD-PHP (updated periodically)
    if (sourceCurrency === 'USD' && targetCurrency === 'PHP') return 57.42
    if (sourceCurrency === 'GBP' && targetCurrency === 'PHP') return 72.8
    if (sourceCurrency === 'EUR' && targetCurrency === 'PHP') return 62.5
    if (sourceCurrency === 'SGD' && targetCurrency === 'PHP') return 42.9
    if (sourceCurrency === 'AED' && targetCurrency === 'PHP') return 15.63
    if (sourceCurrency === 'SAR' && targetCurrency === 'PHP') return 15.3
    throw new Error(
      `Could not fetch mid-market rate for ${sourceCurrency}→${targetCurrency}: ${
        err instanceof Error ? err.message : 'unknown error'
      }`,
    )
  }
}

export function calculateSpread(providerRate: number, midMarketRate: number): number {
  if (midMarketRate === 0) return 0
  return (midMarketRate - providerRate) / midMarketRate
}
