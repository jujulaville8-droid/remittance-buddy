/**
 * Affiliate routing logic.
 *
 * V1 reality check: we are a comparison tool + affiliate router, not a money
 * transmitter. We cannot execute transfers ourselves — we have no license,
 * no Wise account for customers, no NIUM integration. Every winner is
 * handed off to the real provider via their affiliate link.
 *
 * When (if) we get licensed / partner with a rail, the 'buddy-executes'
 * branch can come back. Until then, this function is a simple picker.
 */

import { affiliateClicksStore, type LocalAffiliateClick } from './local-db'

export interface RoutingDecision {
  readonly action: 'affiliate-handoff'
  readonly provider: string
  readonly providerSlug: string
  readonly targetAmount: number
  readonly affiliateUrl: string
}

export interface Quote {
  readonly provider: string
  readonly providerSlug: string
  readonly targetAmount: number
  readonly sourceAmount: number
  readonly fee: number
  readonly affiliateUrl: string
}

/**
 * Return an affiliate-handoff decision for the best-ranked quote.
 * Accepts already-ranked quotes (by targetAmount desc, index 0 is best).
 */
export function decideRouting(quotes: readonly Quote[]): RoutingDecision {
  if (quotes.length === 0) {
    throw new Error('decideRouting requires at least one quote')
  }
  const winner = quotes[0]!
  return {
    action: 'affiliate-handoff',
    provider: winner.provider,
    providerSlug: winner.providerSlug,
    targetAmount: Math.round(winner.targetAmount),
    affiliateUrl: winner.affiliateUrl,
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
    url.searchParams.set('utm_source', 'my-remittance-pal')
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
