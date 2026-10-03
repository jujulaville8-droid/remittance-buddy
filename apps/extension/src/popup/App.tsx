import { useEffect, useState } from 'react'
import { ArrowUpRight, RefreshCw, Settings } from 'lucide-react'
import {
  DEFAULT_PREFS,
  loadPreferences,
  savePreferences,
  type UserPreferences,
} from '../lib/constants'
import { fetchLiveQuotes, type ReferenceQuote } from '../lib/live-quotes'

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
function sourceTime(value?: string | null): string {
  return value && Number.isFinite(Date.parse(value))
    ? `${new Date(value).toLocaleString()}${Date.now() - Date.parse(value) > 86400000 ? ' · Over 24 hours old' : ''}`
    : 'Not supplied by source'
}
export function App({ sidePanel = false }: { readonly sidePanel?: boolean }) {
  const [prefs, setPrefs] = useState<UserPreferences>(DEFAULT_PREFS)
  const [ready, setReady] = useState(false)
  const [amount, setAmount] = useState(500)
  const [quotes, setQuotes] = useState<ReferenceQuote[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [refresh, setRefresh] = useState(0)
  const currency = CORRIDORS.find((c) => c[0] === prefs.defaultCorridor)?.[1] ?? 'USD'
  const payoutLabel = PAYOUTS.find((p) => p[0] === prefs.defaultPayout)?.[1] ?? 'Preferred payout'
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
    setQuotes([])
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
        if (!controller.signal.aborted) setQuotes(next)
      } catch (err) {
        if (!controller.signal.aborted)
          setError(err instanceof Error ? err.message : 'Comparison unavailable')
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }, 400)
    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [amount, currency, prefs.defaultCorridor, prefs.defaultPayout, ready, refresh])
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
    } catch {
      setError('Could not open the side panel. Please try the extension button again.')
    }
  }
  return (
    <main
      className={`mx-auto bg-[hsl(var(--background))] p-5 text-[hsl(var(--foreground))] ${sidePanel ? 'min-h-screen max-w-xl' : 'min-h-[520px] w-[390px]'}`}
    >
      <header className="mb-5 flex items-center justify-between gap-2">
        <div>
          <h1 className="text-xl">My Remittance Pal</h1>
          <p className="text-xs text-[hsl(var(--muted-foreground))]">
            Reference comparison · Philippines
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {!sidePanel && (
            <button
              type="button"
              aria-label="Open full comparison side panel"
              className="rounded border px-2 py-2 text-xs font-semibold"
              onClick={() => void openSidePanel()}
            >
              Full panel
            </button>
          )}
          <button
            aria-label="Open settings"
            onClick={() => chrome.runtime.openOptionsPage()}
            className="p-2"
          >
            <Settings size={18} />
          </button>
        </div>
      </header>
      <label className="block text-xs font-semibold">
        Sending from
        <select
          className="mb-3 mt-1 block w-full rounded border bg-white p-2"
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
      </label>
      <label className="block text-xs font-semibold">
        Total send budget ({currency})
        <input
          className="my-2 block w-full rounded border bg-white p-2 text-4xl"
          type="number"
          min="1"
          max="50000"
          step="0.01"
          value={amount || ''}
          onChange={(e) => setAmount(Number(e.target.value))}
        />
      </label>
      <div className="mb-3 flex gap-2">
        {[100, 500, 1000].map((n) => (
          <button
            key={n}
            className="rounded-full border px-3 py-1 text-xs"
            onClick={() => setAmount(n)}
          >
            {currency} {n}
          </button>
        ))}
      </div>
      <label className="block text-xs font-semibold">
        Preferred payout (confirm with provider)
        <select
          className="mt-1 block w-full rounded border bg-white p-2"
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
      </label>
      <p className="my-4 text-xs leading-relaxed text-[hsl(var(--muted-foreground))]">
        Source comparisons may use different funding or payout methods. These are reference amounts,
        not guaranteed offers. Confirm the final rate, fee and payout on the provider’s site.
      </p>
      <button
        className="mb-4 flex items-center gap-2 text-xs font-semibold"
        onClick={() => setRefresh((n) => n + 1)}
        disabled={loading}
      >
        <RefreshCw size={13} />
        {loading ? 'Retrieving comparisons…' : 'Refresh comparisons'}
      </button>
      {(!amount || amount < 1 || amount > 50000) && (
        <p role="alert" className="text-sm">
          Enter an amount from 1 to 50,000 {currency}.
        </p>
      )}
      {error && (
        <p role="alert" className="rounded border p-3 text-sm">
          {error}
        </p>
      )}
      <p role="status" aria-atomic="true" className="sr-only">
        {!ready
          ? 'Loading comparison preferences…'
          : loading
            ? 'Retrieving comparisons…'
            : !error && quotes.length > 0
              ? `${quotes.length} reference ${quotes.length === 1 ? 'comparison' : 'comparisons'} available.`
              : ''}
      </p>
      <section aria-label="Provider comparisons" aria-busy={loading} className="space-y-3">
        {quotes.map((q, i) => {
          const url = safeProviderUrl(q.affiliateUrl)
          return (
            <article
              key={q.providerSlug}
              className={`rounded-xl border bg-white p-4 ${i === 0 ? 'border-[hsl(var(--coral))]' : ''}`}
            >
              <div className="flex justify-between gap-2">
                <h2 className="text-lg">{q.provider}</h2>
                {i === 0 && (
                  <span className="text-xs text-[hsl(174,84%,24%)]">Most PHP in this set</span>
                )}
              </div>
              <p className="mt-2 text-xs text-[hsl(var(--muted-foreground))]">
                Reference recipient amount
              </p>
              <p className="font-display mb-2 text-3xl text-[hsl(14,60%,42%)]">
                ₱
                {q.targetAmount.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
              <p className="text-xs">
                Fee included: {currency} {q.fee.toFixed(2)} · {q.deliveryTime}
              </p>
              <p className="mt-1 text-xs">
                Rate: 1 {currency} = ₱
                {q.exchangeRate.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 4,
                })}
              </p>
              {q.payoutVerified !== true && (
                <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
                  {payoutLabel} availability not checked
                </p>
              )}
              <p className="mt-2 text-[11px] text-[hsl(var(--muted-foreground))]">
                {q.sourceName ?? 'Comparison source'}
                <br />
                Collected: {sourceTime(q.collectedAt)}
              </p>
              {url ? (
                <a
                  className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-[hsl(174,84%,24%)]"
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Check {q.provider}
                  <ArrowUpRight size={14} />
                </a>
              ) : (
                <p className="mt-3 text-xs">Provider link unavailable</p>
              )}
            </article>
          )
        })}
      </section>
      <footer className="mt-5 border-t pt-3 text-[11px] text-[hsl(var(--muted-foreground))]">
        Ranked by reference PHP received. No account needed. Pal does not move money or guarantee
        savings. Provider links are ordinary links; no approved paid partnership is claimed.
      </footer>
    </main>
  )
}
