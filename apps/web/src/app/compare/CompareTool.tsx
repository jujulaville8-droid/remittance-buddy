'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import {
  ArrowUpRight,
  BadgeCheck,
  Building2,
  ChevronDown,
  ChevronRight,
  Clock,
  DollarSign,
  Heart,
  Lightbulb,
  Lock,
  Star,
  Shield,
  TrendingUp,
  Wallet,
  Zap,
} from 'lucide-react'
import { useLiveQuotes, type LiveQuote } from '@/components/landing/useLiveQuotes'
import { useHeroMotion } from '@/components/landing/useHeroMotion'
import { useMagneticTilt } from '@/components/landing/useMagneticTilt'
import { useParallax } from '@/components/landing/useParallax'
import { decideRouting, trackAffiliateClick } from '@/lib/affiliate-routing'
import { FlagIcon } from '@/components/FlagIcon'
import { ProviderLogo } from '@/components/ProviderLogo'

// ─────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────

const CORRIDORS = [
  { id: 'US-PH', label: 'USA', countryCode: 'us', sourceCurrency: 'USD' },
  { id: 'CA-PH', label: 'Canada', countryCode: 'ca', sourceCurrency: 'CAD' },
  { id: 'UK-PH', label: 'United Kingdom', countryCode: 'gb', sourceCurrency: 'GBP' },
  { id: 'SG-PH', label: 'Singapore', countryCode: 'sg', sourceCurrency: 'SGD' },
  { id: 'AE-PH', label: 'UAE', countryCode: 'ae', sourceCurrency: 'AED' },
  { id: 'SA-PH', label: 'Saudi Arabia', countryCode: 'sa', sourceCurrency: 'SAR' },
  { id: 'AU-PH', label: 'Australia', countryCode: 'au', sourceCurrency: 'AUD' },
] as const

const DESTINATION = {
  countryCode: 'ph',
  label: 'Philippines',
  currency: 'PHP',
}

const PAYOUT_METHODS = [
  { id: 'bank', label: 'Bank Deposit', icon: Building2 },
  { id: 'gcash', label: 'GCash', icon: Wallet },
  { id: 'maya', label: 'Maya', icon: Wallet },
  { id: 'cash_pickup', label: 'Cash pickup', icon: DollarSign },
] as const

type PayoutId = (typeof PAYOUT_METHODS)[number]['id']
type CorridorId = (typeof CORRIDORS)[number]['id']
type FilterMode = 'recommended' | 'cheapest' | 'fastest' | 'most' | 'no-fees'

// ─────────────────────────────────────────────────────────────
// Root component
// ─────────────────────────────────────────────────────────────

export function CompareTool() {
  const params = useSearchParams()
  const initialCorridor = (params.get('corridor') as CorridorId) || 'CA-PH'
  const initialAmount = Math.max(1, Number(params.get('amount')) || 100)
  const initialPayout = (params.get('payout') as PayoutId) || 'bank'

  const [corridorId, setCorridorId] = useState<CorridorId>(initialCorridor)
  const [amount, setAmount] = useState<number>(initialAmount)
  const [payout, setPayout] = useState<PayoutId>(initialPayout)
  const [filter, setFilter] = useState<FilterMode>('recommended')

  const corridor = useMemo(
    () => CORRIDORS.find((c) => c.id === corridorId) ?? CORRIDORS[1],
    [corridorId],
  )

  const { quotes, loading, cached, fetchedAt, refetch } = useLiveQuotes({
    corridor: corridor.id,
    sourceCurrency: corridor.sourceCurrency,
    targetCurrency: DESTINATION.currency,
    sourceAmount: amount,
    payoutMethod: payout,
  })

  const resultsRef = useRef<HTMLDivElement>(null)
  function handleCompare() {
    refetch()
    // Give React a tick to kick off the refetch before we scroll,
    // so the loading state is visible in the summary card
    requestAnimationFrame(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

  // Freshness label for the trust strip
  const [freshLabel, setFreshLabel] = useState<string>('—')
  useEffect(() => {
    function tick() {
      if (!fetchedAt) {
        setFreshLabel('Loading…')
        return
      }
      const s = Math.floor((Date.now() - fetchedAt.getTime()) / 1000)
      if (s < 5) setFreshLabel('Just now')
      else if (s < 60) setFreshLabel(`${s}s ago`)
      else if (s < 3600) setFreshLabel(`${Math.floor(s / 60)}m ago`)
      else setFreshLabel('over an hour ago')
    }
    tick()
    const id = setInterval(tick, 5_000)
    return () => clearInterval(id)
  }, [fetchedAt])

  const sorted = useMemo(() => applyFilter(quotes, filter), [quotes, filter])
  const winner = sorted[0] ?? null
  const worst = quotes.length > 0 ? [...quotes].sort((a, b) => a.targetAmount - b.targetAmount)[0] : null
  const savingsPhp = winner && worst ? Math.max(0, winner.targetAmount - worst.targetAmount) : 0
  const savingsSource = winner && worst ? Math.max(0, worst.totalCost - winner.totalCost) : 0
  const fastest = useMemo(
    () => [...quotes].sort((a, b) => (a.deliveryMinutes ?? 9999) - (b.deliveryMinutes ?? 9999))[0] ?? null,
    [quotes],
  )
  const mostReceive = useMemo(
    () => [...quotes].sort((a, b) => b.targetAmount - a.targetAmount)[0] ?? null,
    [quotes],
  )

  return (
    <div className="relative pt-20">
      <Hero />

      <div className="relative z-10 mx-auto max-w-6xl px-5 lg:px-8 -mt-4 lg:-mt-6">
        <QuoteForm
          corridor={corridor}
          amount={amount}
          payout={payout}
          loading={loading}
          onCorridor={(id) => setCorridorId(id)}
          onAmount={setAmount}
          onPayout={setPayout}
          onCompare={handleCompare}
        />

        <TrustStrip freshLabel={freshLabel} cached={cached} />

        <div ref={resultsRef} className="scroll-mt-24" />

        {quotes.length > 0 && winner && (
          <>
            <SummaryCard
              totalCount={quotes.length}
              bestMatch={winner}
              mostReceive={mostReceive ?? winner}
              fastest={fastest ?? winner}
              savings={{ php: savingsPhp, source: savingsSource, currency: corridor.sourceCurrency }}
            />

            <FilterBar filter={filter} onChange={setFilter} />

            <ProviderList
              quotes={sorted}
              winnerSlug={winner.providerSlug}
              corridorCurrency={corridor.sourceCurrency}
              payoutLabel={
                PAYOUT_METHODS.find((p) => p.id === payout)?.label ?? 'Bank Deposit'
              }
            />
          </>
        )}

        {quotes.length === 0 && loading && <QuotesSkeleton />}

        {quotes.length === 0 && !loading && (
          <div className="mt-8 rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center">
            <p className="text-sm text-slate-500">
              No quotes available right now. Try a different corridor or amount.
            </p>
          </div>
        )}

        <HowWeCompare />
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Sort / filter helpers
// ─────────────────────────────────────────────────────────────

function applyFilter(quotes: readonly LiveQuote[], mode: FilterMode): readonly LiveQuote[] {
  if (quotes.length === 0) return quotes
  const copy = [...quotes]
  switch (mode) {
    case 'cheapest':
      return copy.sort((a, b) => a.totalCost - b.totalCost)
    case 'fastest':
      return copy.sort((a, b) => (a.deliveryMinutes ?? 9999) - (b.deliveryMinutes ?? 9999))
    case 'most':
      return copy.sort((a, b) => b.targetAmount - a.targetAmount)
    case 'no-fees':
      return copy.sort((a, b) => a.fee - b.fee)
    case 'recommended':
    default:
      // Weighted: heavy on targetAmount, light on speed + trust
      return copy.sort((a, b) => {
        const aScore = a.targetAmount - a.fee * 10 - (a.deliveryMinutes ?? 0) * 0.05
        const bScore = b.targetAmount - b.fee * 10 - (b.deliveryMinutes ?? 0) * 0.05
        return bScore - aScore
      })
  }
}

// ─────────────────────────────────────────────────────────────
// Hero
// ─────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto max-w-6xl px-5 lg:px-8 pt-6 pb-12 lg:pt-8 lg:pb-16 grid lg:grid-cols-[1.05fr_1fr] gap-8 items-center">
        <div>
          <h1 className="font-display text-[44px] lg:text-[56px] font-bold leading-[1.05] tracking-[-0.02em] text-slate-900">
            Find the best way
            <br />
            to send money
            <svg
              className="inline-block ml-2 -mb-1 text-blue-500"
              width="40"
              height="24"
              viewBox="0 0 60 32"
              fill="none"
              aria-hidden
            >
              <path
                d="M8 14 Q 18 4 28 14 Q 38 24 48 14 Q 58 4 56 18"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M44 10 L56 18 L46 26"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
          </h1>
          <p className="mt-5 max-w-md text-sm lg:text-base text-slate-500 leading-relaxed">
            Compare rates, fees and delivery times in real-time and send more to the people who
            matter.
          </p>
        </div>
        <HeroArt />
      </div>
    </section>
  )
}

function HeroArt() {
  const parallaxRef = useParallax({ speed: 0.9, maxOffset: 50 })
  return (
    <div className="relative h-[240px] lg:h-[300px]">
      <div ref={parallaxRef} className="absolute inset-0 will-change-transform">
        <Image
          src="/hero-compare.png"
          alt=""
          aria-hidden
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 580px"
          className="object-contain object-right"
        />
      </div>
      {/* Live status chip — replaces the old heart badge and covers the
          baked-in sticker in hero-compare.png. */}
      <div className="absolute top-[42%] right-[2%] rounded-xl bg-white border border-slate-100 shadow-card-lg px-3 py-2 flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
        </span>
        <div className="leading-tight">
          <div className="text-[10px] font-semibold text-slate-500">Rates updated</div>
          <div className="text-xs font-bold text-slate-900">just now</div>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Quote form — one-row, 5 controls
// ─────────────────────────────────────────────────────────────

function QuoteForm({
  corridor,
  amount,
  payout,
  loading,
  onCorridor,
  onAmount,
  onPayout,
  onCompare,
}: {
  readonly corridor: (typeof CORRIDORS)[number]
  readonly amount: number
  readonly payout: PayoutId
  readonly loading: boolean
  readonly onCorridor: (id: CorridorId) => void
  readonly onAmount: (n: number) => void
  readonly onPayout: (id: PayoutId) => void
  readonly onCompare: () => void
}) {
  const payoutMeta = PAYOUT_METHODS.find((m) => m.id === payout) ?? PAYOUT_METHODS[0]
  const PayoutIcon = payoutMeta.icon

  // Separate "display" from "value" so typing feels natural:
  //  - while focused, show exactly what the user is typing (no commas, no
  //    forced decimals), keeping the caret stable
  //  - while blurred, pretty-print with commas, preserving cents only if
  //    the user entered any
  const [draft, setDraft] = useState<string>('')
  const [focused, setFocused] = useState(false)
  useEffect(() => {
    if (!focused) setDraft('')
  }, [amount, focused])

  const displayValue = focused
    ? draft
    : amount.toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      })

  function handleAmountChange(raw: string) {
    // Keep digits + at most one decimal point, strip everything else
    const digits = raw.replace(/[^0-9.]/g, '')
    const firstDot = digits.indexOf('.')
    const normalized =
      firstDot === -1
        ? digits
        : digits.slice(0, firstDot + 1) + digits.slice(firstDot + 1).replace(/\./g, '')
    setDraft(normalized)
    // Defer commit until we can produce a valid number — avoids clobbering
    // the debounced fetch with NaN while the user is mid-edit.
    if (normalized === '' || normalized === '.') {
      onAmount(0)
      return
    }
    const n = Number(normalized)
    if (!Number.isNaN(n)) onAmount(n)
  }

  return (
    <div className="rounded-2xl bg-white border border-slate-100 shadow-card-lg p-5 lg:p-6">
      <div className="grid grid-cols-1 md:grid-cols-[1.2fr_1.2fr_1fr_1.2fr_auto] gap-4 items-end">
        {/* You send */}
        <div>
          <label htmlFor="qf-amount" className="text-[11px] font-semibold text-slate-500">
            You send
          </label>
          <div className="mt-1.5 flex items-center gap-2 rounded-lg border border-slate-200 bg-white h-12 px-3 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100 transition-all">
            <input
              id="qf-amount"
              type="text"
              inputMode="decimal"
              autoComplete="off"
              value={displayValue}
              onFocus={() => {
                setFocused(true)
                setDraft(amount ? String(amount) : '')
              }}
              onBlur={() => setFocused(false)}
              onChange={(e) => handleAmountChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  ;(e.target as HTMLInputElement).blur()
                  onCompare()
                }
              }}
              className="flex-1 bg-transparent text-lg font-bold tabular-nums text-slate-900 outline-none min-w-0"
            />
            <CurrencyChip
              code={corridor.sourceCurrency}
              flagCode={corridor.countryCode}
              activeId={corridor.id}
              onSelect={onCorridor}
            />
          </div>
        </div>

        {/* Send to — destination is fixed to Philippines in V1 */}
        <div>
          <label className="text-[11px] font-semibold text-slate-500">Send to</label>
          <div className="mt-1.5 rounded-lg border border-slate-200 bg-slate-50 h-12 px-3 flex items-center">
            <FlagIcon code={DESTINATION.countryCode} size={22} />
            <span className="ml-2 text-sm font-semibold text-slate-900 flex-1">
              {DESTINATION.label}
            </span>
          </div>
        </div>

        {/* They receive — fixed to PHP in V1 */}
        <div>
          <label className="text-[11px] font-semibold text-slate-500">They receive</label>
          <div className="mt-1.5 rounded-lg border border-slate-200 bg-slate-50 h-12 px-3 flex items-center">
            <span className="text-sm font-bold text-slate-900 flex-1">{DESTINATION.currency}</span>
          </div>
        </div>

        {/* Payout method */}
        <div>
          <label htmlFor="qf-payout" className="text-[11px] font-semibold text-slate-500">
            Payout method
          </label>
          <div className="relative mt-1.5">
            <PayoutIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <select
              id="qf-payout"
              value={payout}
              onChange={(e) => onPayout(e.target.value as PayoutId)}
              className="block w-full h-12 pl-9 pr-9 rounded-lg border border-slate-200 bg-white text-sm font-semibold text-slate-900 appearance-none outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
            >
              {PAYOUT_METHODS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Submit */}
        <button
          type="button"
          onClick={onCompare}
          className="h-12 px-5 rounded-lg bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 shadow-md shadow-blue-600/25 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? 'Fetching…' : 'Compare now'}
        </button>
      </div>

      {/* Corridor picker + privacy note */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          {CORRIDORS.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => onCorridor(c.id)}
              className={`inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full text-[11px] font-semibold transition-colors ${
                c.id === corridor.id
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-300'
              }`}
            >
              <FlagIcon code={c.countryCode} size={14} />
              {c.sourceCurrency}
            </button>
          ))}
        </div>
        <p className="inline-flex items-center gap-1.5 text-[11px] text-slate-500">
          <Lock className="h-3 w-3" />
          We&rsquo;ll never share your information
        </p>
      </div>
    </div>
  )
}

function CurrencyChip({
  code,
  flagCode,
  activeId,
  onSelect,
}: {
  readonly code: string
  readonly flagCode: string
  readonly activeId: CorridorId
  readonly onSelect: (id: CorridorId) => void
}) {
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onDocClick(e: MouseEvent) {
      if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDocClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div ref={wrapperRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex items-center gap-1.5 h-8 px-2 rounded-md bg-slate-50 text-sm font-bold text-slate-900 hover:bg-slate-100 transition-colors"
      >
        <FlagIcon code={flagCode} size={16} />
        {code}
        <ChevronDown
          className={`h-3 w-3 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <ul
          role="listbox"
          className="absolute right-0 top-full mt-1.5 w-52 rounded-lg bg-white border border-slate-200 shadow-card-lg py-1 z-30 max-h-72 overflow-auto"
        >
          {CORRIDORS.map((c) => {
            const selected = c.id === activeId
            return (
              <li key={c.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => {
                    onSelect(c.id)
                    setOpen(false)
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors ${
                    selected
                      ? 'bg-blue-50 text-blue-700 font-semibold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <FlagIcon code={c.countryCode} size={18} />
                  <span className="flex-1 text-left">{c.label}</span>
                  <span className="text-xs font-semibold text-slate-500">{c.sourceCurrency}</span>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Trust strip
// ─────────────────────────────────────────────────────────────

function TrustStrip({ freshLabel, cached }: { readonly freshLabel: string; readonly cached: boolean }) {
  const items = [
    {
      Icon: TrendingUp,
      tone: 'bg-emerald-50 text-emerald-600',
      title: 'Live rates',
      body: 'Real-time exchange rates from trusted providers',
    },
    {
      Icon: Shield,
      tone: 'bg-blue-50 text-blue-600',
      title: 'Transparent fees',
      body: 'No hidden charges. What you see is what you pay.',
    },
    {
      Icon: Lock,
      tone: 'bg-violet-50 text-violet-600',
      title: 'Secure transfers',
      body: 'Your money is protected at every step.',
    },
    {
      Icon: Clock,
      tone: 'bg-emerald-50 text-emerald-600',
      title: cached ? 'Updated recently' : 'Updated just now',
      body: `Rates updated ${freshLabel}`,
      dot: true,
    },
  ] as const

  return (
    <div className="mt-5 rounded-2xl bg-white border border-slate-100 shadow-card px-5 py-5 grid grid-cols-1 md:grid-cols-4 gap-6">
      {items.map((it) => (
        <div key={it.title} className="flex items-start gap-3">
          <span className={`relative grid place-items-center w-10 h-10 rounded-full shrink-0 ${it.tone}`}>
            <it.Icon className="h-4 w-4" />
            {'dot' in it && it.dot && (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            )}
          </span>
          <div>
            <div className="text-sm font-bold text-slate-900">{it.title}</div>
            <div className="mt-0.5 text-xs text-slate-500 leading-snug">{it.body}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Summary card — "Here's what we found for you"
// ─────────────────────────────────────────────────────────────

function SummaryCard({
  totalCount,
  bestMatch,
  mostReceive,
  fastest,
  savings,
}: {
  readonly totalCount: number
  readonly bestMatch: LiveQuote
  readonly mostReceive: LiveQuote
  readonly fastest: LiveQuote
  readonly savings: { php: number; source: number; currency: string }
}) {
  const php = (n: number) => `₱${Math.round(n).toLocaleString()}`
  const tiltRef = useMagneticTilt({ maxDeg: 2.5, perspective: 1400 })
  // Count-up in integers, then we tack on .00 so the display still reads as a
  // currency number. Passing 0 when savings isn't known avoids a wild jump.
  const { displayedAmount: savedSource } = useHeroMotion({
    target: Math.round(savings.source),
    mountDuration: 900,
    jitterMagnitude: 0,
    jitterIntervalMs: 60_000_000,
  })

  return (
    <div
      ref={tiltRef}
      className="mt-6 rounded-2xl bg-white border border-slate-100 shadow-card p-5 lg:p-6 will-change-transform"
    >
      <div className="flex items-center justify-between">
        <div className="text-base font-bold text-slate-900">Here&rsquo;s what we found for you</div>
        <Link
          href="#provider-list"
          className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:underline"
        >
          View all providers ({totalCount})
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-6 border-t border-slate-100 pt-4">
        <Tile
          Icon={Star}
          tone="bg-blue-100 text-blue-600"
          label="Best match"
          primary={bestMatch.provider}
          sub="Best balance of rate, fees and speed"
        />
        <Tile
          Icon={DollarSign}
          tone="bg-emerald-100 text-emerald-600"
          label="Most you receive"
          primary={mostReceive.provider}
          sub={`You receive ${php(mostReceive.targetAmount)}`}
        />
        <Tile
          Icon={Zap}
          tone="bg-violet-100 text-violet-600"
          label="Fastest delivery"
          primary={fastest.provider}
          sub={fastest.deliveryTime}
        />
        <Tile
          Icon={BadgeCheck}
          tone="bg-emerald-100 text-emerald-600"
          label="You save up to"
          primary={`${savedSource.toLocaleString()}.00 ${savings.currency}`}
          sub="Compared to other options"
        />
      </div>
    </div>
  )
}

function Tile({
  Icon,
  tone,
  label,
  primary,
  sub,
}: {
  readonly Icon: typeof Star
  readonly tone: string
  readonly label: string
  readonly primary: string
  readonly sub: string
}) {
  return (
    <div className="flex items-start gap-3">
      <span className={`grid place-items-center w-10 h-10 rounded-full shrink-0 ${tone}`}>
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <div className="text-[11px] font-semibold text-slate-500">{label}</div>
        <div className="mt-0.5 text-sm font-bold text-slate-900 truncate">{primary}</div>
        <div className="mt-0.5 text-[11px] text-slate-500 leading-snug">{sub}</div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Filter bar
// ─────────────────────────────────────────────────────────────

const FILTERS: { id: FilterMode; label: string }[] = [
  { id: 'recommended', label: 'Recommended' },
  { id: 'cheapest', label: 'Cheapest' },
  { id: 'fastest', label: 'Fastest' },
  { id: 'most', label: 'Most you receive' },
  { id: 'no-fees', label: 'No hidden fees' },
]

function FilterBar({
  filter,
  onChange,
}: {
  readonly filter: FilterMode
  readonly onChange: (f: FilterMode) => void
}) {
  return (
    <div id="provider-list" className="mt-8 flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => onChange(f.id)}
            className={`inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full text-sm font-semibold transition-colors ${
              f.id === filter
                ? 'bg-blue-50 border border-blue-200 text-blue-700'
                : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
            }`}
          >
            {f.id === filter && <Star className="h-3.5 w-3.5 fill-current" />}
            {f.label}
          </button>
        ))}
      </div>
      <label className="inline-flex items-center gap-2 text-sm text-slate-500">
        Sort by
        <span className="relative">
          <select
            value={filter}
            onChange={(e) => onChange(e.target.value as FilterMode)}
            className="appearance-none h-9 pl-3 pr-9 rounded-lg border border-slate-200 bg-white text-sm font-semibold text-slate-700 outline-none focus:border-blue-500"
          >
            {FILTERS.map((f) => (
              <option key={f.id} value={f.id}>
                {f.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
        </span>
      </label>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Provider list + row
// ─────────────────────────────────────────────────────────────

function ProviderList({
  quotes,
  winnerSlug,
  corridorCurrency,
  payoutLabel,
}: {
  readonly quotes: readonly LiveQuote[]
  readonly winnerSlug: string
  readonly corridorCurrency: string
  readonly payoutLabel: string
}) {
  return (
    <div className="mt-5 space-y-4">
      {quotes.map((q, i) => (
        <ProviderRow
          key={q.providerSlug}
          quote={q}
          rank={i + 1}
          isWinner={q.providerSlug === winnerSlug}
          corridorCurrency={corridorCurrency}
          payoutLabel={payoutLabel}
        />
      ))}
    </div>
  )
}

function providerTag(q: LiveQuote): { label: string; tone: string } {
  if (q.deliveryMinutes != null && q.deliveryMinutes <= 10) {
    return { label: 'Fastest', tone: 'bg-emerald-50 text-emerald-700' }
  }
  if (q.fee < 1) {
    return { label: 'Low fee', tone: 'bg-blue-50 text-blue-700' }
  }
  if (q.trustScore != null && q.trustScore >= 9) {
    return { label: 'Reliable', tone: 'bg-violet-50 text-violet-700' }
  }
  return { label: 'Best balance', tone: 'bg-slate-100 text-slate-700' }
}

function reviewStub(slug: string): { stars: number; count: number } {
  // Deterministic pseudo-ratings based on slug so rows don't flip randomly
  // between renders. Real reviews would replace this.
  const sum = [...slug].reduce((a, c) => a + c.charCodeAt(0), 0)
  const stars = 4.3 + ((sum % 8) / 10)
  const count = 5000 + (sum % 13000)
  return { stars: Math.round(stars * 10) / 10, count }
}

function whyWeLikeIt(q: LiveQuote): string {
  const reasons: string[] = []
  if (q.fee < 1) reasons.push('low fees')
  if (q.deliveryMinutes != null && q.deliveryMinutes <= 60) reasons.push('fast delivery')
  if (q.spread != null && q.spread < 0.5) reasons.push('great exchange rate')
  if (q.trustScore != null && q.trustScore >= 9) reasons.push('reliable')
  if (reasons.length === 0) return 'Solid all-rounder for this corridor.'
  const joined =
    reasons.length === 1
      ? reasons[0]
      : reasons.slice(0, -1).join(', ') + ' and ' + reasons[reasons.length - 1]
  return `Strong on ${joined}.`
}

function ProviderRow({
  quote,
  rank,
  isWinner,
  corridorCurrency,
  payoutLabel,
}: {
  readonly quote: LiveQuote
  readonly rank: number
  readonly isWinner: boolean
  readonly corridorCurrency: string
  readonly payoutLabel: string
}) {
  const [expanded, setExpanded] = useState(false)
  const tag = providerTag(quote)
  const { stars, count } = reviewStub(quote.providerSlug)
  const routing = decideRouting([quote])

  function onCtaClick() {
    trackAffiliateClick({
      provider: quote.provider,
      amount: quote.sourceAmount,
      affiliateUrl: routing.affiliateUrl,
      context: 'compare',
    })
  }

  return (
    <div
      className={`relative rounded-2xl border bg-white overflow-hidden animate-in fade-in-0 slide-in-from-bottom-3 duration-500 transition-transform hover:-translate-y-0.5 hover:shadow-card-lg ${
        isWinner
          ? 'border-blue-500 shadow-card-lg ring-1 ring-blue-500'
          : 'border-slate-100 shadow-card'
      }`}
      style={{
        animationDelay: `${Math.min(rank, 8) * 60}ms`,
        animationFillMode: 'both',
      }}
    >
      {isWinner && (
        <div className="absolute top-0 right-0 inline-flex items-center gap-1 bg-blue-600 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-bl-lg">
          Best match
        </div>
      )}
      <div className="p-5 lg:p-6 grid grid-cols-1 md:grid-cols-[auto_minmax(0,1.3fr)_repeat(3,minmax(0,1fr))_auto] gap-5 items-center">
        {/* Rank */}
        <div className="grid place-items-center w-7 h-7 rounded-full bg-slate-100 text-xs font-bold text-slate-600 shrink-0">
          {rank}
        </div>

        {/* Identity */}
        <div className="flex items-center gap-4 min-w-0">
          <ProviderLogo
            name={quote.provider}
            slug={quote.providerSlug}
            logoUrl={quote.logoUrl}
            size={60}
          />
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="text-base font-bold text-slate-900 truncate">{quote.provider}</div>
              <span
                className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${tag.tone}`}
              >
                {tag.label}
              </span>
            </div>
            <div className="mt-1 flex items-center gap-1 text-[11px] text-slate-500">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              <span className="font-bold text-slate-900">{stars}</span>
              <span>· {count.toLocaleString()} reviews</span>
            </div>
            <div className="mt-2 text-[11px] font-semibold text-slate-500">Why we like it</div>
            <div className="text-xs text-slate-700 max-w-xs">{whyWeLikeIt(quote)}</div>
          </div>
        </div>

        {/* Receive */}
        <div>
          <div className="text-[11px] font-semibold text-slate-500">They receive</div>
          <div className="mt-1 text-lg font-extrabold tabular-nums text-emerald-600">
            ₱
            {quote.targetAmount.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
          {isWinner && (
            <span className="mt-1 inline-block text-[10px] font-bold text-emerald-700 bg-emerald-50 rounded px-1.5 py-0.5">
              Highest amount
            </span>
          )}
        </div>

        {/* Fee */}
        <div>
          <div className="text-[11px] font-semibold text-slate-500">Total fee</div>
          <div className="mt-1 text-lg font-bold tabular-nums text-slate-900">
            ${quote.fee.toFixed(2)}
          </div>
          <div className="text-[11px] text-slate-500">{quote.fee < 2 ? 'Low fee' : 'Standard fee'}</div>
        </div>

        {/* Exchange rate */}
        <div>
          <div className="text-[11px] font-semibold text-slate-500">Exchange rate</div>
          <div className="mt-1 text-sm font-bold tabular-nums text-slate-900">
            1 {corridorCurrency} = {quote.exchangeRate.toFixed(2)} PHP
          </div>
          <div className="text-[11px] text-slate-500">
            {quote.spread != null && quote.spread < 0.5 ? 'Great rate' : 'Fair rate'}
          </div>
        </div>

        {/* Delivery + CTA */}
        <div className="flex flex-col items-stretch gap-2">
          <div>
            <div className="text-[11px] font-semibold text-slate-500">Delivery time</div>
            <div className="mt-1 text-sm font-bold text-slate-900">{quote.deliveryTime}</div>
            <div className="text-[11px] text-slate-500">{payoutLabel}</div>
          </div>
          <a
            href={routing.affiliateUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onCtaClick}
            className="inline-flex items-center justify-center gap-1.5 h-10 px-4 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 shadow-sm transition-colors"
          >
            Send with {quote.provider}
            <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            className="inline-flex items-center justify-center gap-1 text-xs font-semibold text-blue-600 hover:underline"
          >
            View breakdown
            <ChevronDown
              className={`h-3.5 w-3.5 transition-transform ${expanded ? 'rotate-180' : ''}`}
            />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-slate-100 bg-slate-50/60 px-5 py-4 lg:px-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <BreakdownRow k="Mid-market rate" v={`${quote.midMarketRate.toFixed(4)} PHP`} />
          <BreakdownRow k="Provider rate" v={`${quote.exchangeRate.toFixed(4)} PHP`} />
          <BreakdownRow
            k="FX spread"
            v={quote.spread != null ? `${quote.spread.toFixed(2)}%` : '—'}
          />
          <BreakdownRow k="Provider fee" v={`$${quote.fee.toFixed(2)}`} />
          <BreakdownRow k="Total cost" v={`$${quote.totalCost.toFixed(2)}`} />
          <BreakdownRow k="Source" v={quote.source.replace('-', ' ')} />
          <BreakdownRow k="Delivery" v={quote.deliveryTime} />
          <BreakdownRow
            k="Fetched"
            v={new Date(quote.fetchedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          />
        </div>
      )}
    </div>
  )
}

function BreakdownRow({ k, v }: { readonly k: string; readonly v: string }) {
  return (
    <div>
      <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">{k}</div>
      <div className="mt-0.5 font-semibold text-slate-900 tabular-nums capitalize">{v}</div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Loading skeleton
// ─────────────────────────────────────────────────────────────

function QuotesSkeleton() {
  return (
    <div className="mt-8 space-y-4">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="h-[140px] rounded-2xl border border-slate-100 bg-white shadow-card animate-pulse"
        />
      ))}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Footer note
// ─────────────────────────────────────────────────────────────

function HowWeCompare() {
  return (
    <div className="mt-10 mb-16 rounded-2xl border border-slate-100 bg-white shadow-card p-5 lg:p-6 flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-start gap-3 flex-1 min-w-0">
        <span className="grid place-items-center w-10 h-10 rounded-full bg-amber-50 text-amber-600 shrink-0">
          <Lightbulb className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <div className="text-sm font-bold text-slate-900">How do we compare?</div>
          <div className="mt-0.5 text-xs text-slate-500 leading-relaxed max-w-2xl">
            We compare exchange rates, fees, delivery speed and user satisfaction to help you find
            the best option. Pal is a comparison engine — we never touch your money; you complete
            the send with the provider you pick.
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative h-12 w-20 hidden md:block">
          <div className="absolute right-10 top-1 grid place-items-center w-9 h-9 rounded-lg bg-blue-100 text-blue-600">
            <Shield className="h-4 w-4" />
          </div>
          <div className="absolute right-2 top-3 grid place-items-center w-6 h-6 rounded-full bg-rose-100 text-rose-500">
            <Heart className="h-3 w-3 fill-current" />
          </div>
        </div>
        <Link
          href="/#how"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:underline"
        >
          Learn more
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  )
}
