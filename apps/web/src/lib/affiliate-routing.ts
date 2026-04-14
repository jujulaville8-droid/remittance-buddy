/**
 * Affiliate routing logic — decides when Buddy should execute the send through
 * its own rails vs hand off to the cheapest competitor via affiliate link.
 *
 * The "honest aggregator" contract:
 *   - If Buddy is within $WIN_THRESHOLD of the best competitor, Buddy executes
 *     (charging 0.5% service fee, absorbing margin if needed).
 *   - If a competitor is meaningfully cheaper, route user via affiliate URL so
 *     we at least earn a commission and they save money.
 *   - Every decision is logged (localStorage during the build phase, DB after
 *     migration) for audit + analytics.
 */

import { affiliateClicksStore, type LocalAffiliateClick } from './local-db'

export type RoutingDecision =
  | {
      readonly action: 'buddy-executes'
      readonly provider: string
      readonly providerSlug: string
      readonly targetAmount: number
      readonly buddyFee: number
      readonly totalCost: number
    }
  | {
      readonly action: 'affiliate-handoff'
      readonly provider: string
      readonly providerSlug: string
      readonly targetAmount: number
      readonly affiliateUrl: string
      readonly reasonDeltaUsd: number
    }

export interface Quote {
  readonly provider: string
  readonly providerSlug: string
  readonly targetAmount: number
  readonly sourceAmount: number
  readonly fee: number
  readonly affiliateUrl: string
}

const WIN_THRESHOLD_USD = 2.0 // Buddy keeps the user if within $2 of the winner
const BUDDY_FEE_BPS = 50 // 0.5%

/**
 * Decide how to route a user's send given a list of live provider quotes.
 *
 * Accepts already-ranked quotes (by targetAmount desc, index 0 is best).
 * Returns a RoutingDecision the UI can act on.
 */
export function decideRouting(quotes: readonly Quote[]): RoutingDecision {
  if (quotes.length === 0) {
    throw new Error('decideRouting requires at least one quote')
  }

  const winner = quotes[0]!
  const sourceAmount = winner.sourceAmount
  const buddyFee = sourceAmount * (BUDDY_FEE_BPS / 10000)

  // Simulate what Buddy would deliver via its own rail.
  // For V1 Lite Buddy, we treat the winner's rate as Buddy's rate (match-the-best
  // mechanic) and add the 0.5% fee. In V2 this becomes the real NIUM quote.
  const buddyTargetAmount = Math.round(winner.targetAmount * (1 - BUDDY_FEE_BPS / 10000))
  const buddyTotalCost = sourceAmount + buddyFee

  // Delta between what Buddy delivers and what the winner delivers, in USD.
  const targetDeltaPhp = winner.targetAmount - buddyTargetAmount
  const deltaUsd = (targetDeltaPhp / winner.targetAmount) * sourceAmount

  if (deltaUsd <= WIN_THRESHOLD_USD) {
    // Buddy is competitive — execute via our own rails (V2 NIUM integration)
    return {
      action: 'buddy-executes',
      provider: winner.provider,
      providerSlug: winner.providerSlug,
      targetAmount: buddyTargetAmount,
      buddyFee,
      totalCost: buddyTotalCost,
    }
  }

  // The competitor is meaningfully cheaper — hand off via affiliate
  return {
    action: 'affiliate-handoff',
    provider: winner.provider,
    providerSlug: winner.providerSlug,
    targetAmount: Math.round(winner.targetAmount),
    affiliateUrl: winner.affiliateUrl,
    reasonDeltaUsd: deltaUsd,
  }
}

/**
 * Log an affiliate click to localStorage and return the stored record.
 * After DB unpause, the migration function syncs these to Drizzle.
 */
export function trackAffiliateClick(input: {
  readonly provider: string
  readonly amount: number
  readonly affiliateUrl: string
  readonly context: LocalAffiliateClick['context']
}): LocalAffiliateClick {
  return affiliateClicksStore.log(input)
}

/**
 * Build an affiliate URL with tracking params baked in.
 * Each provider's affiliate network expects different query params;
 * this normalizes them.
 */
export function buildTrackedUrl(
  baseUrl: string,
  params: { readonly amount: number; readonly corridor: string; readonly context?: string },
): string {
  try {
    const url = new URL(baseUrl)
    url.searchParams.set('utm_source', 'remittance-buddy')
    url.searchParams.set('utm_medium', params.context ?? 'compare')
    url.searchParams.set('utm_campaign', 'ofw-remittance')
    url.searchParams.set('utm_content', params.corridor)
    url.searchParams.set('amount', params.amount.toString())
    return url.toString()
  } catch {
    return baseUrl
  }
}

/**
 * Open an affiliate URL in a new tab and log the click.
 * Used by the Hero compare widget and the extension popup when Buddy decides
 * to hand off rather than execute.
 */
export function handleAffiliateHandoff(
  provider: string,
  amount: number,
  affiliateUrl: string,
  context: LocalAffiliateClick['context'],
  corridor: string,
): void {
  trackAffiliateClick({ provider, amount, affiliateUrl, context })
  const tracked = buildTrackedUrl(affiliateUrl, { amount, corridor, context })
  if (typeof window !== 'undefined') {
    window.open(tracked, '_blank', 'noopener,noreferrer')
  }
}
