import { useEffect, useState } from 'react'
import { ArrowLeftRight, ArrowUpRight, Info, RefreshCw, Settings } from 'lucide-react'
import '../styles/comparison.css'
import {
  DEFAULT_PREFS,
  loadPreferences,
  savePreferences,
  type UserPreferences,
} from '../lib/constants'
import { fetchLiveQuotes, type ReferenceQuote } from '../lib/live-quotes'
import { quoteFailureMessage } from '../lib/quote-contract'

const CORRIDORS = [
  ['US-PH', 'USD', 'United States'],
  ['CA-PH', 'CAD', 'Canada'],
  ['UK-PH', 'GBP', 'United Kingdom'],
  ['SG-PH', 'SGD', 'Singapore'],
  ['AE-PH', 'AED', 'UAE'],
  ['SA-PH', 'SAR', 'Saudi Arabia'],
  ['AU-PH', 'AUD', 'Australia'],
] as const
const PAYOUTS = [
  ['bank', 'Bank deposit'],
  ['gcash', 'GCash'],
  ['maya', 'Maya'],
  ['cash_pickup', 'Cash pickup'],
] as const
const PROVIDER_HOSTS = new Set([
  'wise.com',
  'www.remitly.com',
  'www.xoom.com',
  'www.westernunion.com',
  'www.moneygram.com',
  'www.worldremit.com',
  'www.paypal.com',
  'www.ofx.com',
  'www.skrill.com',
  'www.instarem.com',
])
export function safeProviderUrl(value: string): string | null {
  try {
    const url = new URL(value)
    return url.protocol === 'https:' &&
      PROVIDER_HOSTS.has(url.hostname) &&
      !url.username &&
      !url.password
      ? url.href
      : null
  } catch {
    return null
  }
}
export function sourceTime(value?: string | null, now = Date.now()): string {
  if (!value || !Number.isFinite(Date.parse(value))) return 'Not supplied by source'
  const age = now - Date.parse(value)
  if (age < 0) return `${new Date(value).toLocaleString()} · Source time needs checking`
  const minutes = Math.floor(age / 60000)
  const ageLabel =
    age > 86400000
      ? 'Over 24 hours old'
      : minutes < 1
        ? 'Less than a minute old'
        : minutes < 60
          ? `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} old`
          : `${Math.floor(minutes / 60)} ${Math.floor(minutes / 60) === 1 ? 'hour' : 'hours'} old`
  return `${new Date(value).toLocaleString()} · ${ageLabel}`
}
export function App({ sidePanel = false }: { readonly sidePanel?: boolean }) {
  const [prefs, setPrefs] = useState<UserPreferences>(DEFAULT_PREFS)
  const [ready, setReady] = useState(false)
  const [amount, setAmount] = useState(500)
  const [result, setResult] = useState<{
    readonly key: string
    readonly quotes: ReferenceQuote[]
  } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [refresh, setRefresh] = useState(0)
  const [now, setNow] = useState(Date.now())
  const currency = CORRIDORS.find((c) => c[0] === prefs.defaultCorridor)?.[1] ?? 'USD'
  const payoutLabel = PAYOUTS.find((p) => p[0] === prefs.defaultPayout)?.[1] ?? 'Preferred payout'
  const invalidAmount = !Number.isFinite(amount) || amount < 1 || amount > 50000
  const comparisonKey = JSON.stringify([
    amount,
    currency,
    prefs.defaultCorridor,
    prefs.defaultPayout,
  ])
  // Keep values during a same-input refresh; never show them under changed input labels.
  const quotes = result?.key === comparisonKey ? result.quotes : []
  useEffect(() => {
    Promise.all([
      loadPreferences(),
      typeof chrome !== 'undefined' && chrome.storage?.session
        ? chrome.storage.session.get('comparisonAmount').catch(() => ({}))
        : Promise.resolve({}),
    ]).then(([p, session]) => {
      setPrefs(p)
      const savedAmount = (session as { comparisonAmount?: number }).comparisonAmount
      if (
        typeof savedAmount === 'number' &&
        Number.isFinite(savedAmount) &&
        savedAmount >= 1 &&
        savedAmount <= 50000
      )
        setAmount(savedAmount)
      setReady(true)
    })
  }, [])
  useEffect(() => {
    if (!ready) return
    setError(null)
    if (!Number.isFinite(amount) || amount < 1 || amount > 50000) {
      setLoading(false)
      return
    }
    if (typeof chrome !== 'undefined' && chrome.storage?.session) {
      void chrome.storage.session.set({ comparisonAmount: amount }).catch(() => {})
    }
    const controller = new AbortController()
    setLoading(true)
    const timer = setTimeout(async () => {
      try {
        const next = await fetchLiveQuotes({
          sourceAmount: amount,
          sourceCurrency: currency,
          corridor: prefs.defaultCorridor,
          payoutMethod: prefs.defaultPayout,
          signal: controller.signal,
        })
        if (!controller.signal.aborted) {
          setNow(Date.now())
          setResult({ key: comparisonKey, quotes: next })
        }
      } catch (err) {
        if (!controller.signal.aborted) setError(quoteFailureMessage(err))
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }, 400)
    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [amount, currency, prefs.defaultCorridor, prefs.defaultPayout, ready, refresh, comparisonKey])
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60000)
    return () => clearInterval(timer)
  }, [])
  function updatePreferences(next: UserPreferences) {
    setPrefs(next)
    void savePreferences(next).catch(() =>
      setError('Could not save preferences. Your current comparison still works.')
    )
  }
  async function openSidePanel() {
    try {
      const window = await chrome.windows.getCurrent()
      if (window.id === undefined) throw new Error('No current window')
      const response = await chrome.runtime.sendMessage({
        type: 'OPEN_SIDE_PANEL',
        windowId: window.id,
      })
      if (!response?.success) throw new Error('Panel unavailable')
      setError(null)
    } catch {
      setError('Could not open the side panel. Please try the extension button again.')
    }
  }
  return (
    <main className={`comparison-shell ${sidePanel ? 'comparison-panel' : 'comparison-popup'}`}>
      <header className="comparison-header">
        <div className="comparison-brand">
          <ArrowLeftRight className="comparison-brand-icon" size={22} aria-hidden="true" />
          <span>My Remittance Pal</span>
        </div>
        <nav className="comparison-header-actions" aria-label="Extension tools">
          {!sidePanel && (
            <button
              type="button"
              aria-label="Open full comparison side panel"
              className="comparison-header-button comparison-panel-button"
              onClick={() => void openSidePanel()}
            >
              Full panel
            </button>
          )}
          <button
            type="button"
            aria-label="Open settings"
            onClick={() => chrome.runtime.openOptionsPage()}
            className="comparison-header-button"
          >
            <Settings size={15} aria-hidden="true" />
            Settings
          </button>
        </nav>
      </header>

      <div className="comparison-content">
        <form
          className="comparison-form comparison-surface"
          aria-labelledby="comparison-heading"
          onSubmit={(event) => {
            event.preventDefault()
            if (!invalidAmount && !loading) setRefresh((n) => n + 1)
          }}
        >
          <h1 id="comparison-heading">Compare options</h1>
          <div className="comparison-field">
            <label htmlFor="send-country">Sending from</label>
            <select
              id="send-country"
              name="corridor"
              value={prefs.defaultCorridor}
              onChange={(e) =>
                updatePreferences({
                  ...prefs,
                  defaultCorridor: e.target.value as UserPreferences['defaultCorridor'],
                })
              }
            >
              {CORRIDORS.map((c) => (
                <option key={c[0]} value={c[0]}>
                  {c[2]} · {c[1]}
                </option>
              ))}
            </select>
          </div>
          <div className="comparison-field">
            <label htmlFor="send-budget">Total send budget ({currency})</label>
            <input
              id="send-budget"
              name="amount"
              aria-invalid={invalidAmount}
              aria-describedby={invalidAmount ? 'budget-error' : undefined}
              type="number"
              min="1"
              max="50000"
              step="0.01"
              value={amount || ''}
              onChange={(e) => setAmount(Number(e.target.value))}
            />
            <div className="comparison-presets" role="group" aria-label="Quick send budgets">
              {[100, 500, 1000].map((n) => (
                <button
                  key={n}
                  type="button"
                  aria-pressed={amount === n}
                  onClick={() => setAmount(n)}
                >
                  {currency} {n.toLocaleString()}
                </button>
              ))}
            </div>
            {invalidAmount && (
              <p id="budget-error" role="alert" className="comparison-field-error">
                Enter an amount from 1 to 50,000 {currency}.
              </p>
            )}
          </div>
          <div className="comparison-field">
            <label htmlFor="receive-method">Payout preference</label>
            <select
              id="receive-method"
              name="payout"
              value={prefs.defaultPayout}
              onChange={(e) =>
                updatePreferences({
                  ...prefs,
                  defaultPayout: e.target.value as UserPreferences['defaultPayout'],
                })
              }
            >
              {PAYOUTS.map((p) => (
                <option key={p[0]} value={p[0]}>
                  {p[1]}
                </option>
              ))}
            </select>
          </div>
          <div className="comparison-receiving">
            <span>Receiving currency</span>
            <strong>PHP</strong>
          </div>
          <button
            type="submit"
            className="comparison-primary"
            disabled={!ready || loading || invalidAmount}
          >
            {loading && (
              <RefreshCw size={15} className="comparison-loading-icon" aria-hidden="true" />
            )}
            {loading ? 'Retrieving comparisons…' : 'Compare options'}
          </button>
        </form>

        <section
          aria-label="Provider comparisons"
          aria-busy={loading}
          className="comparison-results"
        >
          <div className="comparison-results-heading">
            <p className="comparison-reference-label">Reference comparison · Not a live quote</p>
            <h2>Reference recipient amount</h2>
            <p className="comparison-muted">
              Source funding and payout methods may differ. Confirm the final rate, fee and payout
              with the provider.
            </p>
          </div>
          {error && (
            <p role="alert" className="comparison-message comparison-error">
              {error}
            </p>
          )}
          <p role="status" aria-atomic="true" className="sr-only">
            {!ready
              ? 'Loading comparison preferences…'
              : loading
                ? quotes.length > 0
                  ? 'Refreshing reference comparisons. Previous values remain visible.'
                  : 'Retrieving comparisons…'
                : !error && quotes.length > 0
                  ? `${quotes.length} reference ${quotes.length === 1 ? 'comparison' : 'comparisons'} available.`
                  : ''}
          </p>
          {(!ready || loading) && (
            <p className="comparison-message comparison-muted" aria-hidden="true">
              {!ready
                ? 'Loading your preferences…'
                : quotes.length > 0
                  ? 'Refreshing… Previous reference values remain visible.'
                  : 'Looking for reference comparisons…'}
            </p>
          )}
          {error && quotes.length > 0 && (
            <p className="comparison-retained-note">
              Previous reference values are still shown. Check their collection times below.
            </p>
          )}
          <div className="comparison-card-list">
            {quotes.map((q) => {
              const url = safeProviderUrl(q.affiliateUrl)
              return (
                <article key={q.providerSlug} className="comparison-quote comparison-surface">
                  <div className="comparison-quote-top">
                    <span className="comparison-provider-mark" aria-hidden="true">
                      {q.provider.charAt(0)}
                    </span>
                    <div className="comparison-quote-main">
                      <h3>{q.provider}</h3>
                      <p className="comparison-amount">
                        <span className="sr-only">Reference recipient amount: </span>₱
                        {q.targetAmount.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                        <span className="comparison-amount-currency">PHP</span>
                      </p>
                      <dl className="comparison-quote-details">
                        <div>
                          <dt>Send budget</dt>
                          <dd>
                            {q.sourceCurrency}{' '}
                            {q.sourceAmount.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </dd>
                        </div>
                        <div>
                          <dt>Fee included</dt>
                          <dd>
                            {q.sourceCurrency} {q.fee.toFixed(2)}
                          </dd>
                        </div>
                        <div>
                          <dt>Rate</dt>
                          <dd>
                            {q.exchangeRate.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 4,
                            })}{' '}
                            PHP / {q.sourceCurrency}
                          </dd>
                        </div>
                      </dl>
                    </div>
                  </div>
                  <div className="comparison-quote-context">
                    <p>
                      <strong>Source:</strong> {q.sourceName ?? 'Comparison source'}
                    </p>
                    <p>
                      <strong>Collected:</strong> {sourceTime(q.collectedAt, now)}
                    </p>
                    <p>
                      <strong>Delivery:</strong> {q.deliveryTime}. Confirm with provider.
                    </p>
                    <p>
                      <strong>Payout:</strong> {payoutLabel}
                      {q.payoutVerified !== true && ' · Availability not checked'}
                    </p>
                  </div>
                  {url ? (
                    <a
                      className="comparison-primary comparison-provider-link"
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Check {q.provider}
                      <ArrowUpRight size={15} aria-hidden="true" />
                    </a>
                  ) : (
                    <p className="comparison-link-unavailable">Provider link unavailable</p>
                  )}
                </article>
              )
            })}
          </div>
        </section>

        <footer className="comparison-footer">
          <p className="comparison-provider-note">
            <Info size={16} aria-hidden="true" />
            <span>Provider confirms the final quote, payout availability and delivery time.</span>
          </p>
          <p>
            Ranked by reference PHP received. No account needed. Pal does not move money or
            guarantee savings. Provider links are ordinary links; no approved paid partnership is
            claimed.
          </p>
        </footer>
      </div>
    </main>
  )
}
