/** Reference comparisons, not executable or payout-specific provider quotes. */
import type { LiveQuote, QuoteRequest } from '../types'

interface WiseQuote {
  readonly rate?: number
  readonly fee?: number
  readonly markup?: number
  readonly receivedAmount?: number
  readonly dateCollected?: string
  readonly sourceCountry?: string | null
  readonly targetCountry?: string | null
  readonly deliveryEstimation?: {
    readonly duration?: { readonly min?: string; readonly max?: string } | null
  }
}
interface WiseProvider {
  readonly alias: string
  readonly name: string
  readonly quotes?: readonly WiseQuote[]
  readonly logo?: string
  readonly logos?: { readonly normal?: { readonly svgUrl?: string | null } }
}

// Ordinary destination links; no affiliate approval or commission is implied.
const PROVIDER_URLS: Record<string, string> = {
  wise: 'https://wise.com/',
  remitly: 'https://www.remitly.com/',
  xoom: 'https://www.xoom.com/',
  'western-union': 'https://www.westernunion.com/',
  moneygram: 'https://www.moneygram.com/',
  'world-remit': 'https://www.worldremit.com/',
  paypal: 'https://www.paypal.com/',
  ofx: 'https://www.ofx.com/',
  skrill: 'https://www.skrill.com/',
  instarem: 'https://www.instarem.com/',
}

export function durationMinutes(duration: string | undefined): number | null {
  if (!duration) return null
  const match =
    /^P(?:(\d+(?:\.\d+)?)D)?(?:T(?:(\d+(?:\.\d+)?)H)?(?:(\d+(?:\.\d+)?)M)?(?:(\d+(?:\.\d+)?)S)?)?$/.exec(
      duration
    )
  if (!match || !match.slice(1).some(Boolean)) return null
  const minutes =
    Number(match[1] || 0) * 1440 +
    Number(match[2] || 0) * 60 +
    Number(match[3] || 0) +
    Number(match[4] || 0) / 60
  return Number.isFinite(minutes) && minutes >= 0 ? Math.ceil(minutes) : null
}

export function mapComparisonQuotes(
  providers: readonly WiseProvider[],
  req: QuoteRequest,
  fetchedAt: string
): LiveQuote[] {
  const wiseRate = providers.find((p) => p.alias === 'wise')?.quotes?.[0]?.rate
  const midMarket =
    typeof wiseRate === 'number' && Number.isFinite(wiseRate) && wiseRate > 0 ? wiseRate : 0
  const sourceCountry = req.corridor.split('-')[0] === 'UK' ? 'GB' : req.corridor.split('-')[0]
  return providers.flatMap((p) => {
    const q = p.quotes?.[0]
    if (
      !q ||
      ![q.rate, q.fee, q.receivedAmount].every(
        (v) => typeof v === 'number' && Number.isFinite(v) && v >= 0
      ) ||
      !q.rate
    )
      return []
    if (q.sourceCountry && q.sourceCountry !== sourceCountry) return []
    if (q.targetCountry && q.targetCountry !== 'PH') return []
    const collectedAt =
      q.dateCollected && Number.isFinite(Date.parse(q.dateCollected))
        ? new Date(q.dateCollected).toISOString()
        : null
    const minutes = durationMinutes(q.deliveryEstimation?.duration?.max)
    return [
      {
        provider: p.name,
        providerSlug: p.alias,
        corridor: req.corridor,
        sourceAmount: req.sourceAmount,
        sourceCurrency: req.sourceCurrency,
        targetAmount: q.receivedAmount!,
        targetCurrency: req.targetCurrency,
        exchangeRate: q.rate,
        midMarketRate: midMarket,
        fee: q.fee!,
        // Wise comparison sendAmount is the inclusive amount: fee is deducted.
        totalCost: req.sourceAmount,
        spread: typeof q.markup === 'number' && Number.isFinite(q.markup) ? q.markup / 100 : 0,
        deliveryMinutes: minutes ?? Number.MAX_SAFE_INTEGER,
        deliveryTime:
          minutes === null
            ? 'Check provider'
            : minutes < 60
              ? `About ${minutes} min`
              : `About ${Math.ceil(minutes / 60)} hours`,
        // This endpoint does not prove the requested payout method or funding rail.
        supportsGcash: false,
        supportsMaya: false,
        supportsBank: false,
        supportsCashPickup: false,
        payoutVerified: false,
        trustScore: 0,
        affiliateUrl: PROVIDER_URLS[p.alias] ?? '',
        fetchedAt,
        collectedAt,
        sourceName: 'Wise comparison data',
        source: 'comparison' as const,
        logoUrl: p.logos?.normal?.svgUrl ?? p.logo,
      },
    ]
  })
}

export async function fetchWiseComparisons(req: QuoteRequest): Promise<LiveQuote[]> {
  const params = new URLSearchParams({
    sourceCurrency: req.sourceCurrency,
    targetCurrency: req.targetCurrency,
    sendAmount: String(req.sourceAmount),
  })
  const res = await fetch(`https://api.wise.com/v3/comparisons/?${params}`, {
    signal: AbortSignal.timeout(10_000),
    headers: { Accept: 'application/json' },
  })
  if (!res.ok) throw new Error(`Comparison source returned ${res.status}`)
  const data = (await res.json()) as { providers?: WiseProvider[] }
  return mapComparisonQuotes(
    Array.isArray(data.providers) ? data.providers : [],
    req,
    new Date().toISOString()
  )
}
