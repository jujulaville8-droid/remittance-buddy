export interface ReferenceQuote {
  readonly provider: string
  readonly providerSlug: string
  readonly sourceAmount: number
  readonly sourceCurrency: string
  readonly targetAmount: number
  readonly targetCurrency: string
  readonly exchangeRate: number
  readonly fee: number
  readonly totalCost: number
  readonly deliveryTime: string
  readonly affiliateUrl: string
  readonly collectedAt?: string | null
  readonly fetchedAt: string
  readonly sourceName?: string
  readonly source: string
  readonly payoutVerified?: boolean
}
export function usableQuotes(raw: unknown): ReferenceQuote[] {
  if (!Array.isArray(raw)) return []
  return raw
    .filter(
      (q): q is ReferenceQuote =>
        q &&
        q.source === 'comparison' &&
        typeof q.provider === 'string' &&
        [q.sourceAmount, q.targetAmount, q.exchangeRate, q.fee, q.totalCost].every(
          (v: unknown) => typeof v === 'number' && Number.isFinite(v) && v >= 0
        )
    )
    .sort((a, b) => b.targetAmount - a.targetAmount)
}

/** Keep browser/network diagnostics out of the user-facing comparison message. */
export function quoteFailureMessage(error: unknown): string {
  const allowed = new Set([
    'Comparison is unavailable. Try again later.',
    'No reference comparisons are available for this route and amount. Try another amount or route.',
  ])
  return error instanceof Error && allowed.has(error.message)
    ? error.message
    : 'Could not load comparisons. Check your connection and try again.'
}
