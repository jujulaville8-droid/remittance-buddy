'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * Debounced client-side hook that fetches live quotes from /api/quotes.
 *
 * Returns ranked quotes (best recipient amount first), loading/error state,
 * and a `refetch` for manual retry. Debounces input changes by 400ms so
 * rapid typing doesn't spam the API.
 */

export interface LiveQuote {
  readonly provider: string
  readonly providerSlug: string
  readonly corridor: string
  readonly sourceAmount: number
  readonly sourceCurrency: string
  readonly targetAmount: number
  readonly targetCurrency: string
  readonly exchangeRate: number
  readonly midMarketRate: number
  readonly fee: number
  readonly totalCost: number
  readonly spread: number
  readonly deliveryTime: string
  readonly deliveryMinutes: number
  readonly supportsGcash: boolean
  readonly supportsMaya: boolean
  readonly supportsBank: boolean
  readonly supportsCashPickup: boolean
  readonly trustScore: number
  readonly affiliateUrl: string
  readonly fetchedAt: string
  readonly source: 'live-api' | 'scraped' | 'cached' | 'fallback'
  readonly logoUrl?: string
}

interface QuoteResponse {
  readonly quotes: readonly LiveQuote[]
  readonly errors: readonly { provider: string; error: string }[]
  readonly fetchedAt: string
  readonly durationMs: number
  readonly cached?: boolean
}

export interface UseLiveQuotesArgs {
  readonly corridor: string
  readonly sourceCurrency: string
  readonly targetCurrency: string
  readonly sourceAmount: number
  readonly payoutMethod: string
  readonly debounceMs?: number
}

export interface UseLiveQuotesResult {
  readonly quotes: readonly LiveQuote[]
  readonly loading: boolean
  readonly error: string | null
  readonly fetchedAt: Date | null
  readonly cached: boolean
  readonly refetch: () => void
}

export function useLiveQuotes({
  corridor,
  sourceCurrency,
  targetCurrency,
  sourceAmount,
  payoutMethod,
  debounceMs = 400,
}: UseLiveQuotesArgs): UseLiveQuotesResult {
  const [quotes, setQuotes] = useState<readonly LiveQuote[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fetchedAt, setFetchedAt] = useState<Date | null>(null)
  const [cached, setCached] = useState(false)
  const [refetchCounter, setRefetchCounter] = useState(0)

  const abortRef = useRef<AbortController | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!sourceAmount || sourceAmount < 1) {
      setQuotes([])
      return
    }

    // Cancel any in-flight request
    if (abortRef.current) abortRef.current.abort()
    if (debounceRef.current) clearTimeout(debounceRef.current)

    debounceRef.current = setTimeout(async () => {
      const controller = new AbortController()
      abortRef.current = controller
      setLoading(true)
      setError(null)

      try {
        const params = new URLSearchParams({
          corridor,
          sourceCurrency,
          targetCurrency,
          sourceAmount: sourceAmount.toString(),
          payoutMethod,
        })
        const res = await fetch(`/api/quotes?${params.toString()}`, {
          signal: controller.signal,
        })
        if (!res.ok) {
          throw new Error(`Quote API returned ${res.status}`)
        }
        const data = (await res.json()) as QuoteResponse
        setQuotes(data.quotes)
        setFetchedAt(data.fetchedAt ? new Date(data.fetchedAt) : new Date())
        setCached(Boolean(data.cached))
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') return
        setError(err instanceof Error ? err.message : 'Failed to fetch quotes')
      } finally {
        setLoading(false)
      }
    }, debounceMs)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      if (abortRef.current) abortRef.current.abort()
    }
  }, [corridor, sourceCurrency, targetCurrency, sourceAmount, payoutMethod, debounceMs, refetchCounter])

  return {
    quotes,
    loading,
    error,
    fetchedAt,
    cached,
    refetch: () => setRefetchCounter((n) => n + 1),
  }
}
