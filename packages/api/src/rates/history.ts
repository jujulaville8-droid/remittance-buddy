/**
 * Rate history — pulls daily mid-market rates for a corridor from Wise's
 * public historical endpoint and derives a simple "is it a good time to
 * send" signal.
 *
 * Endpoint: GET https://wise.com/rates/history+live
 *   ?source=CAD&target=PHP&length=30&resolution=daily&unit=day
 *
 * Deliberately *not* a forecasting model — we're showing recent context
 * and a plain-English read, not pretending to predict tomorrow's rate.
 */

const HISTORY_URL = 'https://wise.com/rates/history+live'
const CACHE_TTL_MS = 60 * 60 * 1000 // 1 hour — historical data is mostly settled
const cache = new Map<string, { fetchedAt: number; data: RatePoint[] }>()

export interface RatePoint {
  readonly value: number
  readonly time: number // unix ms
}

export type TrendDirection = 'rising' | 'falling' | 'flat'

export type SendSignal = 'good-time' | 'wait' | 'neutral'

export interface RateInsight {
  readonly points: readonly RatePoint[]
  readonly current: number
  readonly min30d: number
  readonly max30d: number
  readonly avg30d: number
  readonly pctVsAvg: number // (current - avg) / avg, positive means better-than-avg
  readonly trend: TrendDirection
  readonly trend7dPct: number // percent change over last 7 days
  readonly signal: SendSignal
  readonly rationale: string
}

export async function fetchRateHistory(
  sourceCurrency: string,
  targetCurrency: string,
  days = 30,
): Promise<readonly RatePoint[]> {
  const key = `${sourceCurrency}-${targetCurrency}-${days}`
  const hit = cache.get(key)
  if (hit && Date.now() - hit.fetchedAt < CACHE_TTL_MS) {
    return hit.data
  }

  const url =
    `${HISTORY_URL}?source=${encodeURIComponent(sourceCurrency)}` +
    `&target=${encodeURIComponent(targetCurrency)}` +
    `&length=${days}&resolution=daily&unit=day`

  const res = await fetch(url, {
    signal: AbortSignal.timeout(8_000),
    headers: {
      Accept: 'application/json',
      'User-Agent': 'Mozilla/5.0 (compatible; RemittanceBuddy/1.0)',
    },
  })
  if (!res.ok) throw new Error(`Rate history fetch failed: ${res.status}`)
  const raw = (await res.json()) as Array<{ value: number; time: number }>
  const points: RatePoint[] = raw
    .filter((p) => typeof p.value === 'number' && typeof p.time === 'number')
    .map((p) => ({ value: p.value, time: p.time }))
  cache.set(key, { fetchedAt: Date.now(), data: points })
  return points
}

export function buildRateInsight(points: readonly RatePoint[]): RateInsight | null {
  if (points.length < 3) return null
  const values = points.map((p) => p.value)
  const current = values[values.length - 1]!
  const min30d = Math.min(...values)
  const max30d = Math.max(...values)
  const avg30d = values.reduce((a, b) => a + b, 0) / values.length
  const pctVsAvg = (current - avg30d) / avg30d

  // Simple 7-day trend: compare current to 7 points ago if we have that depth,
  // otherwise fall back to the oldest point we have.
  const windowStart = points.length >= 7 ? values[values.length - 7]! : values[0]!
  const trend7dPct = (current - windowStart) / windowStart

  const trend: TrendDirection =
    Math.abs(trend7dPct) < 0.004 ? 'flat' : trend7dPct > 0 ? 'rising' : 'falling'

  // Signal heuristic:
  //  - >= +0.5% above 30d avg   → good time to send
  //  - <= -0.5% below 30d avg   → suggest waiting (unless urgent)
  //  - otherwise                 → neutral
  let signal: SendSignal
  let rationale: string
  if (pctVsAvg >= 0.005) {
    signal = 'good-time'
    rationale =
      trend === 'rising'
        ? 'Current rate is above the 30-day average and still climbing — a solid moment to send.'
        : 'Current rate is above the 30-day average. Rate has been stable, so the advantage is real.'
  } else if (pctVsAvg <= -0.005) {
    signal = 'wait'
    rationale =
      trend === 'falling'
        ? 'Rate is below the 30-day average and still dropping. If you can wait a few days, you may do better.'
        : 'Rate is below the 30-day average. If you can wait, it may drift back toward average.'
  } else {
    signal = 'neutral'
    rationale =
      'Rate is close to the 30-day average. No strong edge in waiting — send when it works for you.'
  }

  return {
    points,
    current,
    min30d,
    max30d,
    avg30d,
    pctVsAvg,
    trend,
    trend7dPct,
    signal,
    rationale,
  }
}
