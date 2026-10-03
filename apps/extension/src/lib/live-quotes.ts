import { resolveApiBaseUrl } from './constants'

import { usableQuotes, type ReferenceQuote } from './quote-contract'
export type { ReferenceQuote } from './quote-contract'

export interface FetchQuotesArgs {
  readonly sourceAmount: number
  readonly sourceCurrency: string
  readonly corridor: string
  readonly payoutMethod: string
  readonly signal?: AbortSignal
}
export async function fetchLiveQuotes(args: FetchQuotesArgs): Promise<ReferenceQuote[]> {
  const params = new URLSearchParams({
    corridor: args.corridor,
    sourceCurrency: args.sourceCurrency,
    targetCurrency: 'PHP',
    sourceAmount: String(args.sourceAmount),
    payoutMethod: args.payoutMethod,
  })
  const response = await fetch(`${await resolveApiBaseUrl()}/api/quotes?${params}`, {
    signal: args.signal,
    headers: { Accept: 'application/json' },
  })
  if (!response.ok) throw new Error('Comparison is unavailable. Try again later.')
  const data = (await response.json()) as { quotes?: unknown }
  const quotes = usableQuotes(data.quotes).filter(
    (q) =>
      q.sourceAmount === args.sourceAmount &&
      q.sourceCurrency === args.sourceCurrency &&
      q.targetCurrency === 'PHP'
  )
  if (!quotes.length)
    throw new Error(
      'No reference comparisons are available for this route and amount. Try another amount or route.'
    )
  return quotes
}
