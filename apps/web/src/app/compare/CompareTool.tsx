'use client'

import { useMemo, useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { ArrowUpRight, CheckCircle2, Heart, Plus } from 'lucide-react'
import { useLiveQuotes, type LiveQuote } from '@/components/landing/useLiveQuotes'
import { decideRouting, trackAffiliateClick } from '@/lib/affiliate-routing'
import { recipientsStore, type LocalRecipient } from '@/lib/local-db'

// ─────────────────────────────────────────────────────────────
// Constants — corridors/payouts tuned for OFW Philippines-first
// ─────────────────────────────────────────────────────────────

const CORRIDORS = [
  { id: 'US-PH', label: 'US → PH', sourceCurrency: 'USD', targetCurrency: 'PHP' },
  { id: 'UK-PH', label: 'UK → PH', sourceCurrency: 'GBP', targetCurrency: 'PHP' },
  { id: 'SG-PH', label: 'SG → PH', sourceCurrency: 'SGD', targetCurrency: 'PHP' },
  { id: 'AE-PH', label: 'UAE → PH', sourceCurrency: 'AED', targetCurrency: 'PHP' },
  { id: 'SA-PH', label: 'SA → PH', sourceCurrency: 'SAR', targetCurrency: 'PHP' },
] as const

const PAYOUT_METHODS = [
  { id: 'gcash', label: 'GCash', desc: 'Mobile wallet, instant' },
  { id: 'maya', label: 'Maya', desc: 'Mobile wallet' },
  { id: 'bank', label: 'Bank', desc: 'BPI, BDO, Metro' },
  { id: 'cash_pickup', label: 'Cash pickup', desc: 'Cebuana, MLhuillier' },
] as const

const QUICK_AMOUNTS = [100, 200, 500, 1000, 2500] as const

// ─────────────────────────────────────────────────────────────
// Humanising helpers — turns abstract savings into concrete things
// ─────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────

export function CompareTool() {
  const searchParams = useSearchParams()
  const router = useRouter()

  // Seed state from URL params so the hero CTA deep-links here
  const initialCorridor =
    (searchParams.get('corridor') as (typeof CORRIDORS)[number]['id'] | null) ?? 'US-PH'
  const initialPayout =
    (searchParams.get('payout') as (typeof PAYOUT_METHODS)[number]['id'] | null) ?? 'gcash'
  const initialAmount = Number(searchParams.get('amount') ?? 500)
  const initialRecipientId = searchParams.get('recipient')

  const [corridorId, setCorridorId] = useState<(typeof CORRIDORS)[number]['id']>(initialCorridor)
  const [payout, setPayout] = useState<(typeof PAYOUT_METHODS)[number]['id']>(initialPayout)
  const [amount, setAmount] = useState<number>(initialAmount)

  // Recipient state loaded from localStorage on mount
  const [recipients, setRecipients] = useState<readonly LocalRecipient[]>([])
  const [selectedRecipientId, setSelectedRecipientId] = useState<string | null>(initialRecipientId)

  useEffect(() => {
    setRecipients(recipientsStore.list())
  }, [])

  const corridor = CORRIDORS.find((c) => c.id === corridorId)!

  const { quotes, loading, error, fetchedAt, cached, refetch } = useLiveQuotes({
    corridor: corridor.id,
    sourceCurrency: corridor.sourceCurrency,
    targetCurrency: corridor.targetCurrency,
    sourceAmount: amount,
    payoutMethod: payout,
  })

  const sorted = useMemo<readonly LiveQuote[]>(() => {
    if (quotes.length === 0) return quotes
    return [...quotes].sort((a, b) => b.targetAmount - a.targetAmount)
  }, [quotes])

  const winner = sorted[0]

  const routing = useMemo(() => {
    if (sorted.length === 0) return null
    return decideRouting(
      sorted.map((q) => ({
        provider: q.provider,
        providerSlug: q.providerSlug,
        sourceAmount: q.sourceAmount,
        targetAmount: q.targetAmount,
        fee: q.fee,
        affiliateUrl: q.affiliateUrl,
      })),
    )
  }, [sorted])

  // Reflect current controls in the URL so the page is shareable and back/forward works
  useEffect(() => {
    const params = new URLSearchParams()
    params.set('corridor', corridorId)
    params.set('payout', payout)
    params.set('amount', amount.toString())
    if (selectedRecipientId) params.set('recipient', selectedRecipientId)
    router.replace(`/compare?${params.toString()}`, { scroll: false })
  }, [corridorId, payout, amount, selectedRecipientId, router])

  // When you pick a saved recipient, auto-fill corridor + payout from them
  function handlePickRecipient(r: LocalRecipient) {
    setSelectedRecipientId(r.id)
    setPayout(r.payoutMethod)
  }

  const secondsAgo = fetchedAt
    ? Math.max(0, Math.floor((Date.now() - fetchedAt.getTime()) / 1000))
    : null

  return (
    <div className="pt-4 pb-20">
      <div className="container max-w-2xl">
        <RecipientStrip
          recipients={recipients}
          selectedId={selectedRecipientId}
          onPick={handlePickRecipient}
          onClear={() => setSelectedRecipientId(null)}
        />

        <ControlBar
          corridorId={corridorId}
          setCorridorId={setCorridorId}
          amount={amount}
          setAmount={setAmount}
          payout={payout}
          setPayout={setPayout}
          corridor={corridor}
        />

        <div className="mt-5 flex items-center justify-between">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            {sorted.length} providers
          </div>
          <LiveChip
            loading={loading}
            cached={cached}
            secondsAgo={secondsAgo}
            onRefresh={refetch}
          />
        </div>

        <div className="mt-3">
          {error ? (
            <ErrorState message={error} onRetry={refetch} />
          ) : sorted.length === 0 && !loading ? (
            <EmptyState />
          ) : (
            <WinnerCard
              winner={winner}
              routing={routing}
              corridor={corridor}
            />
          )}
        </div>

        {sorted.length > 1 ? (
          <div className="mt-3 divide-y divide-border rounded-2xl border border-border bg-card overflow-hidden">
            {sorted.slice(1).map((quote) => (
              <ProviderRow
                key={quote.providerSlug}
                quote={quote}
                corridor={corridor}
              />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Recipient strip — the family-hub entry point
// ─────────────────────────────────────────────────────────────

function RecipientStrip({
  recipients,
  selectedId,
  onPick,
  onClear,
}: {
  readonly recipients: readonly LocalRecipient[]
  readonly selectedId: string | null
  readonly onPick: (r: LocalRecipient) => void
  readonly onClear: () => void
}) {
  return (
    <section className="mt-2">
      <div className="flex items-center justify-between mb-4">
        <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Who is this for?
        </div>
        {selectedId ? (
          <button
            type="button"
            onClick={onClear}
            className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            Clear
          </button>
        ) : null}
      </div>

      {recipients.length === 0 ? (
        <div className="flex items-center gap-4 rounded-[1.5rem] border border-dashed border-border bg-card px-5 py-4">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-coral/10 text-coral">
            <Heart className="h-5 w-5" strokeWidth={2.2} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-foreground text-sm">
              Nanay, Tatay, Ate, Kuya — we\u2019ll remember them all.
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              Run a comparison below, then save whoever you\u2019re sending to. One tap next time.
            </div>
          </div>
          <Link
            href="/recipients"
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-4 py-2 text-xs font-semibold text-foreground transition-colors hover:border-foreground/30"
          >
            <Plus className="h-3 w-3" />
            Add
          </Link>
        </div>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-2 px-2 snap-x">
          {recipients.map((r) => {
            const selected = r.id === selectedId
            const initials = r.fullName
              .split(' ')
              .map((n) => n[0])
              .join('')
              .slice(0, 2)
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => onPick(r)}
                className={`group flex items-center gap-3 rounded-full border px-4 py-2.5 shrink-0 snap-start transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  selected
                    ? 'border-coral bg-coral text-white'
                    : 'border-border bg-card text-foreground hover:border-foreground/30'
                }`}
              >
                <span
                  className={`grid h-8 w-8 place-items-center rounded-full text-xs font-bold ${
                    selected ? 'bg-white/20 text-white' : r.avatarColor
                  }`}
                >
                  {initials}
                </span>
                <span className="text-left pr-1">
                  <span className="block text-sm font-semibold leading-none">
                    {r.fullName.split(' ')[0]}
                  </span>
                  {r.relationship ? (
                    <span
                      className={`block text-[10px] mt-0.5 ${
                        selected ? 'text-white/70' : 'text-muted-foreground'
                      }`}
                    >
                      {r.relationship}
                    </span>
                  ) : null}
                </span>
              </button>
            )
          })}
          <Link
            href="/recipients"
            className="flex items-center gap-2 rounded-full border border-dashed border-border bg-background px-4 py-2.5 shrink-0 text-xs font-semibold text-muted-foreground hover:border-foreground/30 hover:text-foreground transition-colors snap-start"
          >
            <Plus className="h-3.5 w-3.5" />
            Add someone
          </Link>
        </div>
      )}
    </section>
  )
}

// ─────────────────────────────────────────────────────────────
// Small live-status chip next to the sentence above the controls
// ─────────────────────────────────────────────────────────────

function LiveChip({
  loading,
  cached,
  secondsAgo,
  onRefresh,
}: {
  readonly loading: boolean
  readonly cached: boolean
  readonly secondsAgo: number | null
  readonly onRefresh: () => void
}) {
  return (
    <button
      type="button"
      onClick={onRefresh}
      className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-foreground transition-colors hover:border-foreground/30"
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          loading ? 'bg-gold animate-pulse' : 'bg-teal'
        }`}
      />
      {loading
        ? 'Checking live rates'
        : secondsAgo != null
          ? `Updated ${secondsAgo}s ago${cached ? ' · cached' : ''}`
          : 'Tap to refresh'}
    </button>
  )
}

// ─────────────────────────────────────────────────────────────
// Control bar — same functionally, softer visually
// ─────────────────────────────────────────────────────────────

function ControlBar({
  corridorId,
  setCorridorId,
  amount,
  setAmount,
  payout,
  setPayout,
  corridor,
}: {
  readonly corridorId: (typeof CORRIDORS)[number]['id']
  readonly setCorridorId: (v: (typeof CORRIDORS)[number]['id']) => void
  readonly amount: number
  readonly setAmount: (n: number) => void
  readonly payout: (typeof PAYOUT_METHODS)[number]['id']
  readonly setPayout: (v: (typeof PAYOUT_METHODS)[number]['id']) => void
  readonly corridor: (typeof CORRIDORS)[number]
}) {
  return (
    <section className="mt-6 rounded-[2rem] border border-border bg-card p-5 sm:p-8 shadow-level-1">
      <div className="grid gap-6 sm:gap-8 lg:grid-cols-[1.2fr_1fr_1fr]">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground mb-3">
            How much?
          </div>
          <div className="flex items-center gap-2 sm:gap-3 rounded-2xl border border-border bg-background px-3 sm:px-5 h-14 sm:h-16 focus-within:border-foreground/40 transition-colors overflow-hidden">
            <span className="shrink-0 font-mono text-base sm:text-xl text-muted-foreground">
              {currencySymbol(corridor.sourceCurrency)}
            </span>
            <input
              type="number"
              inputMode="numeric"
              min={1}
              value={amount}
              onChange={(e) => setAmount(Math.max(0, Number(e.target.value) || 0))}
              className="w-0 flex-1 min-w-0 bg-transparent font-display text-xl sm:text-3xl lg:text-4xl text-foreground outline-none tabular-nums"
              aria-label="Amount to send"
            />
            <span className="shrink-0 text-[11px] sm:text-sm font-medium text-muted-foreground uppercase">
              {corridor.sourceCurrency}
            </span>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {QUICK_AMOUNTS.map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => setAmount(a)}
                className={`h-8 rounded-full px-4 text-xs font-semibold transition-colors ${
                  amount === a
                    ? 'bg-foreground text-background'
                    : 'bg-muted text-muted-foreground hover:bg-border'
                }`}
              >
                {currencySymbol(corridor.sourceCurrency)}
                {a.toLocaleString()}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground mb-3">
            Sending from
          </div>
          <div className="grid grid-cols-2 gap-2">
            {CORRIDORS.map((c) => {
              const selected = c.id === corridorId
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCorridorId(c.id)}
                  className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-xs font-semibold transition-colors ${
                    selected
                      ? 'border-foreground bg-foreground text-background'
                      : 'border-border bg-background text-foreground hover:border-foreground/30'
                  }`}
                >
                  <span>{c.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground mb-3">
            How they receive it
          </div>
          <div className="space-y-2">
            {PAYOUT_METHODS.map((m) => {
              const selected = m.id === payout
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setPayout(m.id)}
                  className={`w-full flex items-center justify-between rounded-xl border px-4 py-2.5 text-left transition-colors ${
                    selected
                      ? 'border-foreground bg-foreground text-background'
                      : 'border-border bg-background text-foreground hover:border-foreground/30'
                  }`}
                >
                  <div>
                    <div className="text-xs font-semibold">{m.label}</div>
                    <div
                      className={`text-[10px] mt-0.5 ${
                        selected ? 'text-background/60' : 'text-muted-foreground'
                      }`}
                    >
                      {m.desc}
                    </div>
                  </div>
                  {selected ? <CheckCircle2 className="h-4 w-4" /> : null}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────────
// Provider row — softened table, friendlier labels
// ─────────────────────────────────────────────────────────────

function ProviderRow({
  quote,
  corridor,
}: {
  readonly quote: LiveQuote
  readonly corridor: (typeof CORRIDORS)[number]
}) {
  const handleClick = () => {
    trackAffiliateClick({
      provider: quote.provider,
      amount: quote.sourceAmount,
      affiliateUrl: quote.affiliateUrl,
      context: 'compare',
    })
  }
  return (
    <a
      href={quote.affiliateUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className="flex items-center justify-between gap-3 px-4 py-4 transition-colors hover:bg-background/60 active:bg-background"
    >
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold text-foreground truncate">{quote.provider}</div>
        <div className="mt-0.5 text-[11px] text-muted-foreground tabular-nums">
          Fee ${quote.fee.toFixed(2)} · {quote.deliveryTime}
        </div>
      </div>
      <div className="text-right">
        <div className="font-sans text-lg font-semibold text-foreground tabular-nums leading-none">
          {currencySymbol(corridor.targetCurrency)}{Math.round(quote.targetAmount).toLocaleString()}
        </div>
      </div>
      <ArrowUpRight className="h-4 w-4 text-muted-foreground shrink-0" />
    </a>
  )
}

// ─────────────────────────────────────────────────────────────
// Winner card — warm surface, conversational headline, share CTA
// ─────────────────────────────────────────────────────────────

function WinnerCard({
  winner,
  routing,
  corridor,
}: {
  readonly winner: LiveQuote | undefined
  readonly routing: ReturnType<typeof decideRouting> | null
  readonly corridor: (typeof CORRIDORS)[number]
}) {
  if (!winner || !routing) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
        Enter an amount to compare providers.
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-coral/40 bg-card p-5">
      <div className="flex items-center justify-between">
        <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-coral">
          Best rate
        </div>
        <div className="text-[11px] text-muted-foreground">{winner.deliveryTime}</div>
      </div>

      <div className="mt-3 flex items-baseline justify-between gap-3">
        <div className="text-lg font-semibold text-foreground">{winner.provider}</div>
        <div className="font-sans text-3xl font-semibold text-foreground tabular-nums">
          {currencySymbol(corridor.targetCurrency)}{Math.round(winner.targetAmount).toLocaleString()}
        </div>
      </div>

      <div className="mt-1 flex items-center justify-between text-[11px] text-muted-foreground tabular-nums">
        <span>Fee ${winner.fee.toFixed(2)}</span>
        <span>Rate {winner.exchangeRate.toFixed(2)}</span>
      </div>

      <a
        href={routing.affiliateUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() =>
          trackAffiliateClick({
            provider: winner.provider,
            amount: winner.sourceAmount,
            affiliateUrl: routing.affiliateUrl,
            context: 'compare',
          })
        }
        className="mt-4 flex items-center justify-center gap-2 w-full h-12 rounded-full bg-coral text-white text-sm font-semibold active:scale-[0.99]"
      >
        Continue
        <ArrowUpRight className="h-4 w-4" />
      </a>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Error / empty states
// ─────────────────────────────────────────────────────────────

function ErrorState({
  message,
  onRetry,
}: {
  readonly message: string
  readonly onRetry: () => void
}) {
  return (
    <div className="rounded-[2rem] border border-dashed border-destructive/30 bg-card p-10 text-center">
      <div className="text-sm font-semibold text-destructive mb-2">
        We couldn\u2019t reach live rates
      </div>
      <div className="text-xs text-muted-foreground mb-5">{message}</div>
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex items-center rounded-full bg-foreground px-5 py-2.5 text-xs font-semibold text-background"
      >
        Try again
      </button>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="rounded-[2rem] border border-dashed border-border bg-card p-10 text-center">
      <div className="text-sm text-muted-foreground">
        Enter an amount above and we\u2019ll show every route.
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Utilities
// ─────────────────────────────────────────────────────────────

function currencySymbol(code: string): string {
  switch (code) {
    case 'USD':
      return '$'
    case 'GBP':
      return '£'
    case 'EUR':
      return '€'
    case 'SGD':
      return 'S$'
    case 'AED':
      return 'د.إ '
    case 'SAR':
      return '﷼ '
    case 'PHP':
      return '₱'
    default:
      return ''
  }
}
