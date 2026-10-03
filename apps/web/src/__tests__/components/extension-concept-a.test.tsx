/// <reference path="../../../../extension/node_modules/@types/chrome/index.d.ts" />
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { ReferenceQuote } from '../../../../extension/src/lib/quote-contract'

// Supply the extension's compile-time symbol to the web-hosted test runner only.
declare global {
  const __REMIT_API_ORIGIN__: string
}

// These are isolated component/hook-contract checks, not installed-Chrome layout tests.
const harness = vi.hoisted(() => ({
  states: [] as unknown[],
  setters: [] as ReturnType<typeof vi.fn>[],
  effects: [] as (() => void | (() => void))[],
  fetchQuotes: vi.fn(),
}))
vi.mock('react', async (importOriginal) => {
  const original = await importOriginal<typeof import('react')>()
  return {
    ...original,
    useState: (initial: unknown) => {
      const index = harness.setters.length
      const setter = vi.fn()
      harness.setters.push(setter)
      return [index < harness.states.length ? harness.states[index] : initial, setter]
    },
    useEffect: (effect: () => void | (() => void)) => {
      harness.effects.push(effect)
    },
  }
})
vi.mock('../../../../extension/src/lib/live-quotes', () => ({
  fetchLiveQuotes: harness.fetchQuotes,
}))

import { App, safeProviderUrl, sourceTime } from '../../../../extension/src/popup/App'
import { OptionsApp } from '../../../../extension/src/options/App'
import { DEFAULT_PREFS } from '../../../../extension/src/lib/constants'

// Synthetic fixtures are confined to this test file, never shipped as UI quote data.
const fixture = (patch: Partial<ReferenceQuote> = {}): ReferenceQuote => ({
  provider: 'QA Provider',
  providerSlug: 'qa-provider',
  sourceAmount: 500,
  sourceCurrency: 'USD',
  targetAmount: 27931.4,
  targetCurrency: 'PHP',
  exchangeRate: 56.2,
  fee: 3,
  totalCost: 500,
  deliveryTime: 'Check provider',
  affiliateUrl: 'https://wise.com/',
  collectedAt: '2026-10-03T15:55:00Z',
  fetchedAt: '2026-10-03T16:00:00Z',
  sourceName: 'QA comparison source',
  source: 'comparison',
  payoutVerified: false,
  ...patch,
})
function prepare({
  amount = 500,
  ready = true,
  quotes = [] as ReferenceQuote[],
  resultKey = JSON.stringify([amount, 'USD', 'US-PH', 'bank']),
  error = null as string | null,
  loading = false,
} = {}) {
  harness.states = [
    DEFAULT_PREFS,
    ready,
    amount,
    quotes.length ? { key: resultKey, quotes } : null,
    error,
    loading,
    0,
    Date.now(),
  ]
  harness.setters = []
  harness.effects = []
}
function html(options: Parameters<typeof prepare>[0] = {}, sidePanel = false) {
  prepare(options)
  return renderToStaticMarkup(<App sidePanel={sidePanel} />)
}
function findNode(
  node: React.ReactNode,
  test: (props: Record<string, any>) => boolean
): React.ReactElement<any> | undefined {
  if (!React.isValidElement<Record<string, any>>(node)) return undefined
  if (test(node.props)) return node
  for (const child of React.Children.toArray(node.props.children)) {
    const found = findNode(child, test)
    if (found) return found
  }
  return undefined
}
beforeEach(() => {
  vi.stubGlobal('React', React)
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-10-03T16:00:00Z'))
  harness.fetchQuotes.mockReset()
  prepare()
})
afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

describe('Concept A extension presentation', () => {
  it('keeps the approved brand, named settings, full panel action and PHP destination', () => {
    const markup = html()
    expect(markup).toContain('My Remittance Pal')
    expect(markup).not.toContain('Remittance Buddy')
    expect(markup).toContain('Full panel')
    expect(markup).toContain('Settings')
    expect(markup).toContain('Receiving currency')
    expect(markup).toContain('<strong>PHP</strong>')
    expect(markup).toContain('Compare options')
    expect(markup).toContain('comparison-popup')
    const panel = html({}, true)
    expect(panel).toContain('comparison-panel')
    expect(panel).not.toContain('Full panel')
  })

  it('preserves all named and labeled native comparison controls and the quick budgets', () => {
    const markup = html()
    for (const [id, name] of [
      ['send-country', 'corridor'],
      ['send-budget', 'amount'],
      ['receive-method', 'payout'],
    ]) {
      expect(markup).toContain(`for="${id}"`)
      expect(markup).toMatch(new RegExp(`<(?:input|select)[^>]*id="${id}"[^>]*name="${name}"`))
    }
    expect(markup).toContain('aria-label="Quick send budgets"')
    expect(markup.match(/aria-pressed=/g)).toHaveLength(3)
  })

  it.each([0, -1, 50001, Number.NaN])('associates amount %s with the inline error', (amount) => {
    const markup = html({ amount })
    expect(markup).toContain('aria-invalid="true" aria-describedby="budget-error"')
    expect(markup).toContain('id="budget-error" role="alert"')
    expect(markup).toContain('Enter an amount from 1 to 50,000 USD')
  })

  it('renders actual data and source time with no fabricated partners or estimate', () => {
    const markup = html({ quotes: [fixture()] })
    for (const value of [
      'QA Provider',
      '27,931.40',
      'PHP',
      'Fee included',
      'USD 3.00',
      '56.20',
      'QA comparison source',
      '5 minutes old',
      'Availability not checked',
    ]) {
      expect(markup).toContain(value)
    }
    expect(markup).toContain(new Date('2026-10-03T15:55:00Z').toLocaleString())
    expect(markup).toContain('Not a live quote')
    expect(markup).toContain('href="https://wise.com/" target="_blank" rel="noopener noreferrer"')
    for (const claim of [
      'Fastest',
      'Best rate',
      'Guaranteed',
      'Live quote',
      'Illustrative example',
    ]) {
      expect(markup).not.toContain(claim)
    }
  })

  it('keeps old and missing collection times distinct from the retrieval timestamp', () => {
    expect(html({ quotes: [fixture({ collectedAt: '2026-10-01T10:00:00Z' })] })).toContain(
      'Over 24 hours old'
    )
    const missing = html({ quotes: [fixture({ collectedAt: null })] })
    expect(missing).toContain('Not supplied by source')
    expect(missing).not.toContain('minutes old')
    expect(missing).not.toContain(new Date('2026-10-03T16:00:00Z').toLocaleString())
  })

  it('flags future source time instead of presenting it as freshly collected', () => {
    const markup = html({ quotes: [fixture({ collectedAt: '2026-10-04T16:00:00Z' })] })
    expect(markup).toContain('Source time needs checking')
    expect(markup).not.toContain('Less than a minute old')
    expect(sourceTime('2026-10-03T16:00:00Z', Date.parse('2026-10-03T16:01:00Z'))).toContain(
      '1 minute old'
    )
    expect(sourceTime('2026-10-03T16:00:00Z', Date.parse('2026-10-03T17:00:00Z'))).toContain(
      '1 hour old'
    )
  })

  it('retains complete same-query values during refresh and explains failed refreshes', () => {
    const refreshing = html({ quotes: [fixture()], loading: true })
    expect(refreshing).toContain('27,931.40')
    expect(refreshing).toContain('Previous reference values remain visible')
    const failed = html({
      quotes: [fixture()],
      error: 'Comparison is unavailable. Try again later.',
    })
    expect(failed).toContain('27,931.40')
    expect(failed).toContain('Previous reference values are still shown')
  })

  it.each([
    JSON.stringify([100, 'USD', 'US-PH', 'bank']),
    JSON.stringify([500, 'CAD', 'CA-PH', 'bank']),
    JSON.stringify([500, 'USD', 'US-PH', 'gcash']),
  ])('never flashes values for a different amount, corridor or payout key: %s', (resultKey) => {
    const markup = html({ quotes: [fixture()], resultKey })
    expect(markup).not.toContain('27,931.40')
    expect(markup).not.toContain('QA Provider')
  })

  it('does not insert mock recipient amounts when loading, invalid or unavailable', () => {
    for (const state of [
      { loading: true },
      { ready: false },
      { amount: 0 },
      { error: 'Could not load comparisons. Check your connection and try again.' },
    ]) {
      const markup = html(state)
      expect(markup).not.toContain('comparison-quote-main')
      expect(markup).not.toContain('27,931')
    }
    expect(html({ loading: true })).toContain('aria-busy="true"')
    expect(html({ error: 'Connection unavailable' })).toContain('role="alert"')
  })

  it('disables unsafe provider destinations and never renders them as links', () => {
    for (const url of [
      'javascript:alert(1)',
      'http://wise.com',
      'https://wise.com.evil.test',
      'https://name:password@wise.com',
      '/relative',
    ]) {
      expect(safeProviderUrl(url)).toBeNull()
      expect(html({ quotes: [fixture({ affiliateUrl: url })] })).toContain(
        'Provider link unavailable'
      )
    }
  })

  it('gives settings controls names, associated labels and hints', () => {
    harness.states = [DEFAULT_PREFS, true, 'idle']
    const markup = renderToStaticMarkup(<OptionsApp />)
    for (const id of ['default-corridor', 'default-payout']) {
      expect(markup).toContain(`for="${id}"`)
      expect(markup).toContain(`id="${id}"`)
      expect(markup).toContain(`aria-describedby="${id}-hint"`)
    }
    expect(markup).toContain('name="corridor"')
    expect(markup).toContain('name="payout"')
    expect(markup).toContain('role="status" aria-live="polite"')
  })

  it('keeps normal text, button labels and meaningful input boundaries at accessible contrast', () => {
    function luminance(hex: string) {
      const values = [1, 3, 5].map((index) => parseInt(hex.slice(index, index + 2), 16) / 255)
      const linear = values.map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
      return linear[0]! * 0.2126 + linear[1]! * 0.7152 + linear[2]! * 0.0722
    }
    function contrast(a: string, b: string) {
      const [dark, light] = [luminance(a), luminance(b)].sort((a, b) => a - b)
      return (light! + 0.05) / (dark! + 0.05)
    }
    for (const [text, background] of [
      ['#0b173f', '#ffffff'],
      ['#40577f', '#ffffff'],
      ['#ffffff', '#0066eb'],
      ['#0059d1', '#e7f2ff'],
    ]) {
      expect(contrast(text!, background!)).toBeGreaterThanOrEqual(4.5)
    }
    expect(contrast('#7a90ad', '#ffffff')).toBeGreaterThanOrEqual(3)
    expect(contrast('#5579ab', '#ffffff')).toBeGreaterThanOrEqual(3)
    expect(contrast('#005bd3', '#ffffff')).toBeGreaterThanOrEqual(3)
    const css = readFileSync(
      resolve(process.cwd(), '../extension/src/styles/comparison.css'),
      'utf8'
    )
    expect(css).toContain('border: 1px solid #7a90ad')
  })

  it('specifies one bounded popup scroll owner, wrapping shortcuts, focus and reduced motion', () => {
    const css = readFileSync(
      resolve(process.cwd(), '../extension/src/styles/comparison.css'),
      'utf8'
    )
    expect(css).toMatch(
      /\.comparison-popup\s*\{[^}]*width:\s*390px;[^}]*max-width:\s*100vw;[^}]*max-height:\s*600px;[^}]*overflow-y:\s*auto;/
    )
    expect(css).toMatch(/\.comparison-presets\s*\{[^}]*flex-wrap:\s*wrap;/)
    expect(css).toContain(':focus-visible')
    expect(css).toContain('prefers-reduced-motion: reduce')
    expect(css).toContain('@media (max-width: 260px)')
    expect(css).toMatch(
      /\.comparison-amount\s*\{[^}]*overflow-wrap:\s*anywhere;[^}]*white-space:\s*normal;/
    )
    expect(css).toMatch(
      /@media \(max-width: 260px\)[\s\S]*\.comparison-quote-main\s*\{[^}]*flex-basis:\s*100%;/
    )
    expect(css).not.toMatch(/text-overflow:\s*ellipsis|line-clamp|white-space:\s*nowrap/)
    expect(html({ quotes: [fixture({ targetAmount: 2999999.99 })] })).toContain('2,999,999.99')
  })
})

describe('preserved extension behavior contracts', () => {
  it('submits a refresh, while amount presets still update the amount', () => {
    prepare()
    const tree = App({})
    const event = { preventDefault: vi.fn() }
    findNode(tree, (p) => p['aria-labelledby'] === 'comparison-heading')!.props.onSubmit(event)
    expect(event.preventDefault).toHaveBeenCalled()
    expect(harness.setters[6]).toHaveBeenCalledOnce()
    findNode(tree, (p) => p['aria-pressed'] === false)!.props.onClick()
    expect(harness.setters[2]).toHaveBeenCalledWith(100)
  })

  it('cancels an in-flight request and ignores its late result', async () => {
    let finish!: (value: ReferenceQuote[]) => void
    harness.fetchQuotes.mockImplementation(
      () =>
        new Promise<ReferenceQuote[]>((resolve) => {
          finish = resolve
        })
    )
    App({})
    const cleanup = harness.effects[1]!()
    await vi.advanceTimersByTimeAsync(400)
    const args = harness.fetchQuotes.mock.calls[0]![0]
    expect(args).toMatchObject({
      sourceAmount: 500,
      sourceCurrency: 'USD',
      corridor: 'US-PH',
      payoutMethod: 'bank',
    })
    expect(args.signal.aborted).toBe(false)
    if (typeof cleanup === 'function') cleanup()
    expect(args.signal.aborted).toBe(true)
    finish([fixture()])
    await Promise.resolve()
    expect(harness.setters[3]).not.toHaveBeenCalled()
  })

  it('stores a successful response with the exact input key and updates display age', async () => {
    harness.fetchQuotes.mockResolvedValue([fixture()])
    App({})
    harness.effects[1]!()
    await vi.advanceTimersByTimeAsync(400)
    expect(harness.setters[3]).toHaveBeenLastCalledWith({
      key: JSON.stringify([500, 'USD', 'US-PH', 'bank']),
      quotes: [fixture()],
    })
    expect(harness.setters[7]).toHaveBeenLastCalledWith(Date.parse('2026-10-03T16:00:00Z') + 400)
  })

  it('keeps friendly network errors and stops loading after request failure', async () => {
    harness.fetchQuotes.mockRejectedValue(new TypeError('Failed to fetch'))
    App({})
    harness.effects[1]!()
    await vi.advanceTimersByTimeAsync(400)
    expect(harness.setters[4]).toHaveBeenLastCalledWith(
      'Could not load comparisons. Check your connection and try again.'
    )
    expect(harness.setters[5]).toHaveBeenLastCalledWith(false)
  })

  it('does not fetch or save an invalid amount', async () => {
    prepare({ amount: 0 })
    const set = vi.fn()
    vi.stubGlobal('chrome', { storage: { session: { set } } })
    App({})
    harness.effects[1]!()
    await vi.advanceTimersByTimeAsync(1000)
    expect(harness.fetchQuotes).not.toHaveBeenCalled()
    expect(set).not.toHaveBeenCalled()
  })

  it('keeps corridor and payout changes persisted and updates their comparison preferences', () => {
    const set = vi.fn().mockResolvedValue(undefined)
    vi.stubGlobal('chrome', { storage: { local: { set } } })
    const tree = App({})
    findNode(tree, (p) => p.id === 'send-country')!.props.onChange({ target: { value: 'CA-PH' } })
    expect(harness.setters[0]).toHaveBeenCalledWith(
      expect.objectContaining({ defaultCorridor: 'CA-PH' })
    )
    expect(set).toHaveBeenCalledWith({
      remit_default_corridor: 'CA-PH',
      remit_default_payout: 'bank',
    })
    findNode(tree, (p) => p.id === 'receive-method')!.props.onChange({ target: { value: 'maya' } })
    expect(set).toHaveBeenLastCalledWith({
      remit_default_corridor: 'US-PH',
      remit_default_payout: 'maya',
    })
  })

  it('restores the session budget and saves valid amount changes', async () => {
    const sessionSet = vi.fn().mockResolvedValue(undefined)
    vi.stubGlobal('chrome', {
      storage: {
        local: {
          get: vi
            .fn()
            .mockResolvedValue({ remit_default_corridor: 'CA-PH', remit_default_payout: 'maya' }),
        },
        session: { get: vi.fn().mockResolvedValue({ comparisonAmount: 750 }), set: sessionSet },
      },
    })
    harness.fetchQuotes.mockResolvedValue([])
    App({})
    harness.effects[0]!()
    await vi.advanceTimersByTimeAsync(0)
    expect(harness.setters[0]).toHaveBeenCalledWith(
      expect.objectContaining({ defaultCorridor: 'CA-PH', defaultPayout: 'maya' })
    )
    expect(harness.setters[2]).toHaveBeenCalledWith(750)
    expect(harness.setters[1]).toHaveBeenCalledWith(true)
    const cleanup = harness.effects[1]!()
    expect(sessionSet).toHaveBeenCalledWith({ comparisonAmount: 500 })
    if (typeof cleanup === 'function') cleanup()
  })

  it('keeps side-panel failure recovery and retries through the same header action', async () => {
    const sendMessage = vi
      .fn()
      .mockResolvedValueOnce({ success: false })
      .mockResolvedValueOnce({ success: true })
    vi.stubGlobal('chrome', {
      windows: { getCurrent: vi.fn().mockResolvedValue({ id: 7 }) },
      runtime: { sendMessage },
    })
    const tree = App({})
    const button = findNode(tree, (p) => p['aria-label'] === 'Open full comparison side panel')!
    button.props.onClick()
    await vi.advanceTimersByTimeAsync(0)
    expect(harness.setters[4]).toHaveBeenCalledWith(
      'Could not open the side panel. Please try the extension button again.'
    )
    button.props.onClick()
    await vi.advanceTimersByTimeAsync(0)
    expect(harness.setters[4]).toHaveBeenLastCalledWith(null)
    expect(sendMessage).toHaveBeenCalledTimes(2)
    expect(sendMessage).toHaveBeenLastCalledWith({ type: 'OPEN_SIDE_PANEL', windowId: 7 })
  })
  it('advances age locally every minute and clears its timer on unmount', async () => {
    App({})
    const cleanup = harness.effects[2]!()
    await vi.advanceTimersByTimeAsync(120000)
    expect(harness.setters[7]).toHaveBeenCalledTimes(2)
    expect(harness.setters[7]).toHaveBeenLastCalledWith(Date.parse('2026-10-03T16:02:00Z'))
    expect(harness.fetchQuotes).not.toHaveBeenCalled()
    if (typeof cleanup === 'function') cleanup()
    await vi.advanceTimersByTimeAsync(60000)
    expect(harness.setters[7]).toHaveBeenCalledTimes(2)
  })

  it('prevents submit-triggered repeated refreshes while loading', () => {
    prepare({ loading: true, quotes: [fixture()] })
    const tree = App({})
    const event = { preventDefault: vi.fn() }
    const form = findNode(tree, (p) => p['aria-labelledby'] === 'comparison-heading')!
    form.props.onSubmit(event)
    form.props.onSubmit(event)
    expect(harness.setters[6]).not.toHaveBeenCalled()
  })

  it('clears a pending debounce before a rapid input change can fetch', async () => {
    App({})
    const cleanup = harness.effects[1]!()
    if (typeof cleanup === 'function') cleanup()
    await vi.advanceTimersByTimeAsync(1000)
    expect(harness.fetchQuotes).not.toHaveBeenCalled()
  })
})
