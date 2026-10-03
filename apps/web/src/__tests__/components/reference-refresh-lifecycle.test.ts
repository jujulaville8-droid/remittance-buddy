import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { LiveQuote, UseLiveQuotesArgs } from '@/components/landing/useLiveQuotes'

// The project has no DOM/test-renderer dependency. This deterministic hook
// runner executes the real fetching and snapshot hooks, including effect
// cleanup and state rerenders. Browser behavior is a separate QA gate.
const runtime = vi.hoisted(() => {
  type Slot = { value?: unknown; deps?: readonly unknown[]; cleanup?: (() => void) | void }
  const slots: Slot[] = []
  let cursor = 0
  let dirty = false
  let effects: (() => void)[] = []
  return {
    begin() {
      cursor = 0
      dirty = false
      effects = []
    },
    commit() {
      const pending = effects
      effects = []
      pending.forEach((effect) => effect())
      return dirty
    },
    unmount() {
      slots.forEach((slot) => slot.cleanup?.())
      slots.length = 0
      effects = []
      cursor = 0
      dirty = false
    },
    useState<T>(initial: T | (() => T)) {
      const index = cursor++
      const slot =
        slots[index] ??
        (slots[index] = { value: typeof initial === 'function' ? (initial as () => T)() : initial })
      return [
        slot.value as T,
        (next: T | ((old: T) => T)) => {
          const value = typeof next === 'function' ? (next as (old: T) => T)(slot.value as T) : next
          if (!Object.is(value, slot.value)) {
            slot.value = value
            dirty = true
          }
        },
      ] as const
    },
    useRef<T>(initial: T) {
      const index = cursor++
      const slot = slots[index] ?? (slots[index] = { value: { current: initial } })
      return slot.value as { current: T }
    },
    useEffect(effect: () => void | (() => void), deps?: readonly unknown[]) {
      const index = cursor++
      const slot = slots[index] ?? (slots[index] = {})
      if (
        !deps ||
        !slot.deps ||
        deps.length !== slot.deps.length ||
        deps.some((value, i) => !Object.is(value, slot.deps?.[i]))
      ) {
        slot.deps = deps
        effects.push(() => {
          slot.cleanup?.()
          slot.cleanup = effect()
        })
      }
    },
  }
})
vi.mock('react', () => ({
  useState: runtime.useState,
  useRef: runtime.useRef,
  useEffect: runtime.useEffect,
}))

import {
  comparisonQueryKey,
  useReferenceComparison,
} from '@/components/landing/useReferenceComparison'

const request: UseLiveQuotesArgs = {
  corridor: 'US-PH',
  sourceCurrency: 'USD',
  targetCurrency: 'PHP',
  sourceAmount: 1000,
  payoutMethod: 'bank',
  debounceMs: 400,
}
const quote: LiveQuote = {
  provider: 'Wise',
  providerSlug: 'wise',
  corridor: 'US-PH',
  sourceCurrency: 'USD',
  targetCurrency: 'PHP',
  sourceAmount: 1000,
  targetAmount: 55555.55,
  exchangeRate: 55.8347,
  fee: 5,
  midMarketRate: 56,
  totalCost: 1000,
  spread: 0,
  deliveryTime: 'Check provider',
  deliveryMinutes: Number.MAX_SAFE_INTEGER,
  supportsGcash: false,
  supportsMaya: false,
  supportsBank: false,
  supportsCashPickup: false,
  trustScore: 0,
  affiliateUrl: 'https://wise.com/',
  fetchedAt: '2026-10-03T12:00:00Z',
  collectedAt: '2026-10-01T12:00:00Z',
  source: 'comparison',
  payoutVerified: false,
}
let latest: ReturnType<typeof useReferenceComparison>
let args = request
const fetchMock = vi.fn()
function render() {
  for (let count = 0; count < 20; count++) {
    runtime.begin()
    // eslint-disable-next-line react-hooks/rules-of-hooks -- This is the deterministic hook test runner, not an application component.
    latest = useReferenceComparison(args)
    if (!runtime.commit()) return
  }
  throw new Error('Hook rerenders did not settle')
}
function response(quotes: readonly LiveQuote[], cached = false) {
  return { ok: true, json: async () => ({ quotes, cached, fetchedAt: '2026-10-03T12:00:00Z' }) }
}
async function settle(quotes: readonly LiveQuote[], cached = false) {
  fetchMock.mockResolvedValueOnce(response(quotes, cached))
  await vi.advanceTimersByTimeAsync(400)
  render()
}
beforeEach(() => {
  runtime.unmount()
  vi.useFakeTimers()
  fetchMock.mockReset()
  vi.stubGlobal('fetch', fetchMock)
  args = request
})
afterEach(() => {
  runtime.unmount()
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

describe('actual quote hook + same-query refresh lifecycle', () => {
  it('retains settled values while the fetching hook clears its quotes on refetch', async () => {
    render()
    expect(latest.loading).toBe(true)
    expect(latest.quotes).toEqual([])
    await settle([quote], true)
    expect(latest.loading).toBe(false)
    expect(latest.quotes).toEqual([quote])
    latest.refetch()
    render()
    expect(latest.loading).toBe(true)
    expect(latest.quotes).toEqual([quote])
    expect(latest.cached).toBe(true)
    expect(latest.quotes[0]?.collectedAt).toBe('2026-10-01T12:00:00Z')
    await settle([{ ...quote, targetAmount: 55000 }])
    expect(latest.loading).toBe(false)
    expect(latest.quotes[0]?.targetAmount).toBe(55000)
    expect(latest.cached).toBe(false)
  })
  it('clears retained results after an empty response and cannot revive them on another refresh', async () => {
    render()
    await settle([quote])
    latest.refetch()
    render()
    expect(latest.quotes).toHaveLength(1)
    await settle([])
    expect(latest.quotes).toEqual([])
    latest.refetch()
    render()
    expect(latest.loading).toBe(true)
    expect(latest.quotes).toEqual([])
  })
  it('clears retained results on errors and keeps retries empty until a new success', async () => {
    render()
    await settle([quote])
    latest.refetch()
    render()
    fetchMock.mockRejectedValueOnce(new Error('Network unavailable'))
    await vi.advanceTimersByTimeAsync(400)
    render()
    expect(latest.error).toBe('Network unavailable')
    expect(latest.quotes).toEqual([])
    latest.refetch()
    render()
    expect(latest.quotes).toEqual([])
    await settle([quote])
    expect(latest.quotes).toHaveLength(1)
  })
  it.each([
    { corridor: 'CA-PH', sourceCurrency: 'CAD' },
    { sourceAmount: 500 },
    { payoutMethod: 'gcash' },
  ])('remounts results for each changed query tuple: %j', async (patch) => {
    render()
    await settle([quote])
    const previousKey = comparisonQueryKey(args)
    runtime.unmount() // React's keyed QueryResults boundary performs this cleanup.
    args = { ...request, ...patch }
    expect(comparisonQueryKey(args)).not.toBe(previousKey)
    render()
    expect(latest.loading).toBe(true)
    expect(latest.quotes).toEqual([])
    expect(fetchMock.mock.calls[0]?.[1]?.signal.aborted).toBe(true)
  })
  it('does not accept a mismatched response as a new settled comparison', async () => {
    render()
    await settle([{ ...quote, sourceAmount: 500 }])
    expect(latest.quotes).toEqual([])
    latest.refetch()
    render()
    expect(latest.quotes).toEqual([])
  })
})
