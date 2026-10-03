'use client'

import { useEffect, useRef, useState } from 'react'
import { useLiveQuotes, type LiveQuote, type UseLiveQuotesArgs } from './useLiveQuotes'

/** Sample the clock on every render, including a newly completed request.
 * The timer only ensures that displayed ages also advance while idle.
 */
export function useComparisonClock() {
  const [, tick] = useState(0)
  useEffect(() => {
    const timer = setInterval(() => tick((value) => value + 1), 60_000)
    return () => clearInterval(timer)
  }, [])
  return Date.now()
}

export function comparisonQueryKey(args: UseLiveQuotesArgs) {
  return JSON.stringify([
    args.corridor,
    args.sourceCurrency,
    args.targetCurrency,
    args.sourceAmount,
    args.payoutMethod,
  ])
}

export function quoteMatchesRequest(quote: LiveQuote, args: UseLiveQuotesArgs) {
  return (
    quote.corridor === args.corridor &&
    quote.sourceCurrency === args.sourceCurrency &&
    quote.targetCurrency === args.targetCurrency &&
    quote.sourceAmount === args.sourceAmount &&
    Number.isFinite(quote.targetAmount) &&
    quote.targetAmount > 0 &&
    Number.isFinite(quote.fee) &&
    quote.fee >= 0 &&
    quote.fee <= args.sourceAmount &&
    Number.isFinite(quote.exchangeRate) &&
    quote.exchangeRate > 0
  )
}

interface SettledComparison {
  readonly key: string
  readonly quotes: readonly LiveQuote[]
  readonly cached: boolean
}

/** Use only inside a component keyed by comparisonQueryKey(args).
 * That remount boundary also clears payout-only changes, since quotes do not
 * echo a payout method. A settled snapshot survives only same-query refreshes.
 */
export function useReferenceComparison(args: UseLiveQuotesArgs) {
  const result = useLiveQuotes(args)
  const previous = useRef<SettledComparison | null>(null)
  const key = comparisonQueryKey(args)
  const currentQuotes = result.quotes.filter((quote) => quoteMatchesRequest(quote, args))

  useEffect(() => {
    if (result.loading) return
    previous.current =
      !result.error && currentQuotes.length > 0
        ? { key, quotes: currentQuotes, cached: result.cached }
        : null
  }, [key, currentQuotes, result.loading, result.error, result.cached])

  const retained =
    result.loading && currentQuotes.length === 0 && previous.current?.key === key
      ? previous.current
      : null
  return {
    ...result,
    quotes: result.error ? [] : (retained?.quotes ?? currentQuotes),
    cached: retained?.cached ?? result.cached,
  }
}
