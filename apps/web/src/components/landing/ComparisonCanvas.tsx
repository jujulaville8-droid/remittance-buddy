'use client'

import { useEffect, useId, useRef, useState, type FormEvent } from 'react'
import Image from 'next/image'
import { ArrowUpRight, Info, Check } from 'lucide-react'
import { type LiveQuote } from './useLiveQuotes'
import {
  comparisonQueryKey,
  quoteMatchesRequest,
  useReferenceComparison,
} from './useReferenceComparison'
import styles from './ClearCanvas.module.css'

export const CORRIDORS = [
  { id: 'US-PH', label: 'United States', currency: 'USD' },
  { id: 'CA-PH', label: 'Canada', currency: 'CAD' },
  { id: 'UK-PH', label: 'United Kingdom', currency: 'GBP' },
  { id: 'SG-PH', label: 'Singapore', currency: 'SGD' },
  { id: 'AE-PH', label: 'United Arab Emirates', currency: 'AED' },
  { id: 'SA-PH', label: 'Saudi Arabia', currency: 'SAR' },
  { id: 'AU-PH', label: 'Australia', currency: 'AUD' },
] as const

export const PAYOUTS = [
  { id: 'bank', label: 'Bank deposit' },
  { id: 'gcash', label: 'GCash' },
  { id: 'maya', label: 'Maya' },
  { id: 'cash_pickup', label: 'Cash pickup' },
] as const

type Corridor = (typeof CORRIDORS)[number]
type Payout = (typeof PAYOUTS)[number]
type Sort = 'amount' | 'fee' | 'delivery'

export function validAmount(raw: string): number | null {
  if (!/^(?:\d+(?:\.\d{0,2})?|\.\d{1,2})$/.test(raw.trim())) return null
  const value = Number(raw)
  return Number.isFinite(value) && value >= 1 && value <= 50_000 ? value : null
}

export function matchingQuotes(quotes: readonly LiveQuote[], corridor: Corridor, amount: number) {
  return quotes.filter((quote) =>
    quoteMatchesRequest(quote, {
      corridor: corridor.id,
      sourceCurrency: corridor.currency,
      targetCurrency: 'PHP',
      sourceAmount: amount,
      payoutMethod: 'bank',
    })
  )
}

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
      !url.password &&
      !url.port
      ? url.href
      : null
  } catch {
    return null
  }
}

function money(value: number) {
  return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function sourceLabel(quote: LiveQuote, cached: boolean) {
  if (quote.source === 'fallback') return 'Estimate'
  if (cached || quote.source === 'cached') return 'Cached reference'
  if (quote.source === 'live-api') return 'Provider API quote'
  return 'Reference quote'
}

export function collectionTime(value?: string | null, now = Date.now()) {
  const date = value ? new Date(value) : null
  if (!date || !Number.isFinite(date.getTime())) return null
  const age = now - date.getTime()
  const minutes = Math.floor(age / 60_000)
  const ageLabel =
    age < 0
      ? 'Source time is in the future; freshness cannot be verified'
      : age >= 86_400_000
        ? `Over 24 hours old · ${Math.floor(age / 86_400_000)} day${age >= 172_800_000 ? 's' : ''} ago`
        : minutes >= 60
          ? `${Math.floor(minutes / 60)} hour${minutes >= 120 ? 's' : ''} ago`
          : minutes > 0
            ? `${minutes} min ago`
            : 'Less than a minute ago'
  return {
    iso: date.toISOString(),
    label: `${date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })}, ${date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })} UTC`,
    ageLabel,
    old: age >= 86_400_000,
  }
}

export function ComparisonCanvas({
  variant = 'landing',
  initialCorridor = 'US-PH',
  initialAmount = '1000',
  initialPayout = 'bank',
}: {
  readonly variant?: 'landing' | 'compare'
  readonly initialCorridor?: string
  readonly initialAmount?: string
  readonly initialPayout?: string
}) {
  const [corridorId, setCorridorId] = useState(initialCorridor)
  const [amountInput, setAmountInput] = useState(initialAmount)
  const [payoutId, setPayoutId] = useState(initialPayout)
  const [refresh, setRefresh] = useState(0)
  const [touched, setTouched] = useState(validAmount(initialAmount) === null)
  const amountRef = useRef<HTMLInputElement>(null)
  const id = useId()
  const corridor = CORRIDORS.find((item) => item.id === corridorId) ?? CORRIDORS[0]
  const payout = PAYOUTS.find((item) => item.id === payoutId) ?? PAYOUTS[0]
  const amount = validAmount(amountInput)
  const invalid = amount === null
  // Include payout in the mounted results identity. Quote records have no payout
  // echo, so field matching alone cannot protect a just-changed preference.
  const queryKey = comparisonQueryKey({
    corridor: corridor.id,
    sourceCurrency: corridor.currency,
    targetCurrency: 'PHP',
    sourceAmount: amount ?? 0,
    payoutMethod: payout.id,
  })

  function compare(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setTouched(true)
    if (amount === null) {
      amountRef.current?.focus()
      return
    }
    setRefresh((value) => value + 1)
  }

  return (
    <>
      <section className={styles.hero} aria-labelledby={`${id}-heading`}>
        <div className={styles.heroArt} aria-hidden="true">
          <Image
            src="/illustrations/philippines-coast-concept-a.png"
            alt=""
            fill
            priority
            sizes="100vw"
            className={styles.heroImage}
          />
        </div>
        <div className={styles.container}>
          <div className={styles.heroCopy}>
            <h1 id={`${id}-heading`}>
              {variant === 'landing' ? (
                <>
                  Make more of
                  <br />
                  what you send
                </>
              ) : (
                <>
                  Compare your options.
                  <br />
                  Keep the details in view.
                </>
              )}
            </h1>
            <p className={styles.heroDescription}>
              Compare remittance options to the Philippines, with fees and trade-offs in view.
            </p>
            <p className={styles.heroNote}>
              <Check size={15} aria-hidden="true" />
              Compare without creating an account
            </p>
          </div>
        </div>
      </section>

      <div className={`${styles.container} ${styles.comparisonArea}`}>
        <form
          className={styles.form}
          onSubmit={compare}
          noValidate
          aria-label="Compare remittance options"
        >
          <div className={styles.formGrid}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor={`${id}-corridor`}>
                Sender country / currency
              </label>
              <select
                id={`${id}-corridor`}
                className={styles.control}
                value={corridor.id}
                onChange={(event) => setCorridorId(event.target.value)}
              >
                {CORRIDORS.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label} · {item.currency}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor={`${id}-amount`}>
                Total send budget
              </label>
              <input
                id={`${id}-amount`}
                ref={amountRef}
                className={styles.control}
                type="text"
                inputMode="decimal"
                autoComplete="off"
                spellCheck={false}
                value={amountInput}
                aria-invalid={invalid && touched}
                aria-describedby={`${id}-budget-help${invalid && touched ? ` ${id}-error` : ''}`}
                onBlur={() => setTouched(true)}
                onChange={(event) => {
                  setAmountInput(event.target.value)
                  setTouched(true)
                }}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor={`${id}-payout`}>
                Preferred payout
              </label>
              <select
                id={`${id}-payout`}
                className={styles.control}
                value={payout.id}
                onChange={(event) => setPayoutId(event.target.value)}
              >
                {PAYOUTS.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>
            <div className={`${styles.field} ${styles.fixedField}`}>
              <span className={styles.label} id={`${id}-receiving`}>
                Receiving currency
              </span>
              <span className={styles.fixedCurrency} aria-labelledby={`${id}-receiving`}>
                PHP
              </span>
            </div>
            <div className={styles.submitField}>
              <button className={styles.primaryButton} type="submit">
                Compare options
              </button>
            </div>
          </div>
          <p className={styles.formHelp}>
            <span id={`${id}-budget-help`}>
              1–50,000 {corridor.currency}, including the listed fee
            </span>
            <span>Payout availability is unverified. Check with the provider.</span>
          </p>
          {invalid && touched && (
            <p id={`${id}-error`} className={styles.fieldError} role="alert">
              Enter a budget from 1 to 50,000 {corridor.currency}, with up to 2 decimal places.
            </p>
          )}
        </form>
        <noscript>
          <p className={styles.status}>
            Enable JavaScript to retrieve comparisons. Provider prices and availability must be
            confirmed directly with the provider.
          </p>
        </noscript>
        {amount === null ? (
          <section className={styles.results} aria-label="Comparison results">
            <p className={styles.status}>
              Enter a valid total send budget to see reference recipient amounts.
            </p>
          </section>
        ) : (
          <QueryResults
            key={queryKey}
            corridor={corridor}
            amount={amount}
            payout={payout}
            refresh={refresh}
          />
        )}
      </div>
    </>
  )
}

function QueryResults({
  corridor,
  amount,
  payout,
  refresh,
}: {
  readonly corridor: Corridor
  readonly amount: number
  readonly payout: Payout
  readonly refresh: number
}) {
  const result = useReferenceComparison({
    corridor: corridor.id,
    sourceCurrency: corridor.currency,
    targetCurrency: 'PHP',
    sourceAmount: amount,
    payoutMethod: payout.id,
  })
  const [sort, setSort] = useState<Sort>('amount')
  const [now, setNow] = useState(() => Date.now())
  const lastRefresh = useRef(refresh)
  const refetch = useRef(result.refetch)
  const headingId = useId()
  useEffect(() => {
    refetch.current = result.refetch
  }, [result.refetch])
  useEffect(() => {
    if (lastRefresh.current !== refresh) {
      lastRefresh.current = refresh
      refetch.current()
    }
  }, [refresh])
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60_000)
    return () => clearInterval(timer)
  }, [])

  const matching = matchingQuotes(result.quotes, corridor, amount)
  const quotes = result.error
    ? []
    : [...matching].sort((a, b) =>
        sort === 'fee'
          ? a.fee - b.fee
          : sort === 'delivery'
            ? (a.deliveryMinutes ?? Number.MAX_SAFE_INTEGER) -
              (b.deliveryMinutes ?? Number.MAX_SAFE_INTEGER)
            : b.targetAmount - a.targetAmount
      )

  return (
    <section className={styles.results} aria-labelledby={headingId}>
      <div className={styles.resultsHeader}>
        <span className={styles.eyebrow}>Reference comparison · Confirm with provider</span>
        <h2 id={headingId}>Reference recipient amount</h2>
        <p className={styles.resultsDescription}>
          Compare the same {corridor.currency} {money(amount)} total budget. Reference comparisons,
          not guaranteed offers. Check payout availability with each provider.
        </p>
      </div>
      <div role="status" aria-live="polite" aria-atomic="true">
        {result.loading && (
          <p className={styles.refreshStatus}>
            {quotes.length
              ? 'Refreshing this comparison. The amounts below are from the previous response; source collection times still apply.'
              : 'Checking available reference comparisons…'}
          </p>
        )}
        {!result.loading && !result.error && quotes.length > 0 && (
          <p className={styles.externalNote}>
            {quotes.length} available comparison{quotes.length === 1 ? '' : 's'} for{' '}
            {corridor.label} → Philippines
          </p>
        )}
      </div>
      {result.error ? (
        <div role="alert" className={`${styles.status} ${styles.errorStatus}`}>
          <strong>Comparisons are unavailable right now</strong>No estimated prices are substituted.
          Use Compare options to try again.
        </div>
      ) : quotes.length > 0 ? (
        <>
          <div className={styles.resultTools}>
            <span>
              Available comparisons: {quotes.length}
              {result.cached ? ' · Cached response' : ''}
            </span>
            <label className={styles.sortLabel}>
              Sort by
              <select value={sort} onChange={(event) => setSort(event.target.value as Sort)}>
                <option value="amount">Highest reference amount</option>
                <option value="fee">Lowest listed fee</option>
                <option value="delivery">Reported delivery estimate</option>
              </select>
            </label>
          </div>
          <div className={styles.providerGrid} aria-busy={result.loading}>
            {quotes.map((quote) => (
              <ProviderCard
                key={quote.providerSlug}
                quote={quote}
                cached={result.cached}
                payout={payout}
                now={now}
              />
            ))}
          </div>
        </>
      ) : !result.loading ? (
        <p className={styles.status}>
          <strong>No quote available</strong>Try another sender country or budget, or use Compare
          options to check again.
        </p>
      ) : null}
      <p className={styles.disclaimer}>
        <Info size={17} aria-hidden="true" />
        <span>
          The provider confirms the final quote, payout availability and delivery time. Funding
          method and promotions may change the final offer.
        </span>
      </p>
      <div className={styles.methodology}>
        <h3>How this comparison works</h3>
        <p>
          Reference recipient amounts are ordered from highest to lowest by default, for the same
          total send budget. Listed fees are included. Source collection times vary, and this is not
          a complete market comparison. Provider links are ordinary links; no paid partnership is
          claimed. My Remittance Pal does not handle your money.
        </p>
      </div>
    </section>
  )
}

function ProviderCard({
  quote,
  cached,
  payout,
  now,
}: {
  readonly quote: LiveQuote
  readonly cached: boolean
  readonly payout: Payout
  readonly now: number
}) {
  const time = collectionTime(quote.collectedAt, now)
  // The API supplies vetted ordinary provider URLs. Do not append affiliate
  // parameters or carry the user's budget into an outbound URL.
  const providerUrl = safeProviderUrl(quote.affiliateUrl)

  return (
    <article className={styles.providerCard} aria-label={`${quote.provider} comparison`}>
      <div className={styles.providerTop}>
        <span className={styles.providerInitial} aria-hidden="true">
          {quote.provider.trim().charAt(0).toUpperCase()}
        </span>
        <div className={styles.providerHeading}>
          <h3>{quote.provider}</h3>
          <p className={styles.quoteLabel}>{sourceLabel(quote, cached)}</p>
          <span className={styles.recipientAmount}>
            ₱{money(quote.targetAmount)} <span className={styles.recipientCurrency}>PHP</span>
          </span>
        </div>
      </div>
      <dl className={styles.quoteFacts}>
        <dt>Total send budget</dt>
        <dd>
          {quote.sourceCurrency} {money(quote.sourceAmount)}
        </dd>
        <dt>Included fee</dt>
        <dd>
          {quote.sourceCurrency} {money(quote.fee)}
        </dd>
        <dt>Exchange rate</dt>
        <dd>
          {quote.exchangeRate.toLocaleString('en-US', { maximumFractionDigits: 4 })} PHP /{' '}
          {quote.sourceCurrency}
        </dd>
        <dt>Preferred payout</dt>
        <dd>{payout.label} requested · unverified</dd>
        <dt>Delivery</dt>
        <dd>{quote.deliveryTime || 'Check provider'} · confirm with provider</dd>
      </dl>
      <div className={styles.sourceDetails}>
        <p>Source: {quote.sourceName || sourceLabel(quote, false)}</p>
        <p>
          Source collected:{' '}
          {time ? <time dateTime={time.iso}>{time.label}</time> : 'Time unavailable'}
        </p>
        {time ? (
          <p className={time.old ? styles.sourceAge : undefined}>Source age: {time.ageLabel}</p>
        ) : (
          <p>Source time unavailable; freshness cannot be verified.</p>
        )}
      </div>
      {providerUrl ? (
        <a
          className={styles.primaryButton}
          href={providerUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          Check {quote.provider}
          <ArrowUpRight size={15} aria-hidden="true" />
          <span className="sr-only"> (opens provider website in a new tab)</span>
        </a>
      ) : (
        <span className={styles.unavailableLink}>Provider link unavailable</span>
      )}
      {providerUrl && <p className={styles.externalNote}>Opens the provider’s website</p>}
    </article>
  )
}
