'use client'

import { useMemo, useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import {
  ArrowUpRight,
  Bell,
  CheckCircle2,
  ChevronDown,
  Clock,
  Copy,
  Shield,
  Sparkles,
  TrendingUp,
  Zap,
} from 'lucide-react'
import { useLiveQuotes, type LiveQuote } from '@/components/landing/useLiveQuotes'
import { decideRouting } from '@/lib/affiliate-routing'

const CORRIDORS = [
  { id: 'US-PH', label: 'US → PH', sourceCurrency: 'USD', targetCurrency: 'PHP', flag: '🇺🇸' },
  { id: 'UK-PH', label: 'UK → PH', sourceCurrency: 'GBP', targetCurrency: 'PHP', flag: '🇬🇧' },
  { id: 'SG-PH', label: 'SG → PH', sourceCurrency: 'SGD', targetCurrency: 'PHP', flag: '🇸🇬' },
  { id: 'AE-PH', label: 'UAE → PH', sourceCurrency: 'AED', targetCurrency: 'PHP', flag: '🇦🇪' },
  { id: 'SA-PH', label: 'SA → PH', sourceCurrency: 'SAR', targetCurrency: 'PHP', flag: '🇸🇦' },
] as const

const PAYOUT_METHODS = [
  { id: 'gcash', label: 'GCash', desc: 'Instant, mobile wallet' },
  { id: 'maya', label: 'Maya', desc: 'Mobile wallet' },
  { id: 'bank', label: 'Bank', desc: 'BPI, BDO, Metro' },
  { id: 'cash_pickup', label: 'Cash pickup', desc: 'Cebuana, MLhuillier' },
] as const

const QUICK_AMOUNTS = [100, 200, 500, 1000, 2500] as const
type SortMode = 'recipient' | 'fee' | 'speed'

export function CompareTool() {
  const searchParams = useSearchParams()
  const router = useRouter()

  // Seed state from URL params so the hero "Compare rates" CTA deep-links here
  const initialCorridor =
    (searchParams.get('corridor') as (typeof CORRIDORS)[number]['id'] | null) ?? 'US-PH'
  const initialPayout =
    (searchParams.get('payout') as (typeof PAYOUT_METHODS)[number]['id'] | null) ?? 'gcash'
  const initialAmount = Number(searchParams.get('amount') ?? 500)

  const [corridorId, setCorridorId] = useState<(typeof CORRIDORS)[number]['id']>(initialCorridor)
  const [payout, setPayout] = useState<(typeof PAYOUT_METHODS)[number]['id']>(initialPayout)
  const [amount, setAmount] = useState<number>(initialAmount)
  const [sortMode, setSortMode] = useState<SortMode>('recipient')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

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
    const copy = [...quotes]
    if (sortMode === 'recipient') copy.sort((a, b) => b.targetAmount - a.targetAmount)
    else if (sortMode === 'fee') copy.sort((a, b) => a.totalCost - b.totalCost)
    else copy.sort((a, b) => a.deliveryMinutes - b.deliveryMinutes)
    return copy
  }, [quotes, sortMode])

  const winner = sorted[0]
  const worst = sorted[sorted.length - 1]
  const savingsPhp = winner && worst ? winner.targetAmount - worst.targetAmount : 0
  const savingsUsd = winner ? savingsPhp / winner.exchangeRate : 0

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
    router.replace(`/compare?${params.toString()}`, { scroll: false })
  }, [corridorId, payout, amount, router])

  function handleCopyLink() {
    if (typeof window === 'undefined') return
    navigator.clipboard.writeText(window.location.href).then(
      () => {
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
      },
      () => {
        /* ignore */
      },
    )
  }

  const secondsAgo = fetchedAt ? Math.max(0, Math.floor((Date.now() - fetchedAt.getTime()) / 1000)) : null

  return (
    <div className="pt-28 pb-20">
      <Header loading={loading} cached={cached} secondsAgo={secondsAgo} onRefresh={refetch} />

      <div className="container max-w-6xl mt-12">
        <ControlBar
          corridorId={corridorId}
          setCorridorId={setCorridorId}
          amount={amount}
          setAmount={setAmount}
          payout={payout}
          setPayout={setPayout}
          corridor={corridor}
        />

        <div className="mt-10 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          <div className="space-y-6">
            <ResultsToolbar
              sortMode={sortMode}
              setSortMode={setSortMode}
              count={sorted.length}
              onCopy={handleCopyLink}
              copied={copied}
            />

            {error ? (
              <ErrorState message={error} onRetry={refetch} />
            ) : sorted.length === 0 && !loading ? (
              <EmptyState />
            ) : (
              <div className="space-y-3">
                {sorted.map((quote, i) => (
                  <ProviderRow
                    key={quote.providerSlug}
                    quote={quote}
                    rank={i + 1}
                    isWinner={i === 0}
                    isExpanded={expandedId === quote.providerSlug}
                    onToggle={() =>
                      setExpandedId(expandedId === quote.providerSlug ? null : quote.providerSlug)
                    }
                    corridor={corridor}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right rail: winner card + quick actions */}
          <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
            <WinnerCard
              winner={winner}
              routing={routing}
              amount={amount}
              savingsPhp={savingsPhp}
              savingsUsd={savingsUsd}
              corridor={corridor}
              payout={payout}
            />
            <QuickActions corridor={corridor} amount={amount} />
          </aside>
        </div>
      </div>
    </div>
  )
}

function Header({
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
    <header className="container max-w-6xl">
      <div className="text-xs font-semibold uppercase tracking-[0.2em] text-coral">
        Decision engine
      </div>
      <div className="mt-4 flex flex-wrap items-end justify-between gap-6">
        <h1 className="font-display text-5xl lg:text-6xl leading-[0.95] text-foreground text-balance max-w-3xl">
          Compare every route. <span className="italic text-coral">Send the winner.</span>
        </h1>
        <button
          type="button"
          onClick={onRefresh}
          className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground transition-colors hover:border-foreground/30"
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${loading ? 'bg-gold animate-pulse' : 'bg-teal'}`}
          />
          {loading
            ? 'Fetching live rates'
            : secondsAgo != null
              ? `Updated ${secondsAgo}s ago${cached ? ' · cached' : ''}`
              : 'Idle'}
        </button>
      </div>
    </header>
  )
}

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
    <section className="rounded-[2rem] border border-border bg-card p-8 shadow-level-1">
      <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr_1fr]">
        {/* Amount */}
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground mb-3">
            Amount
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-border bg-background px-5 h-16 focus-within:border-foreground/40 transition-colors">
            <span className="font-mono text-xl text-muted-foreground">
              {currencySymbol(corridor.sourceCurrency)}
            </span>
            <input
              type="number"
              min={1}
              value={amount}
              onChange={(e) => setAmount(Math.max(0, Number(e.target.value) || 0))}
              className="flex-1 bg-transparent font-display text-4xl text-foreground outline-none tabular-nums"
              aria-label="Amount to send"
            />
            <span className="text-sm font-medium text-muted-foreground">
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

        {/* Corridor */}
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground mb-3">
            Corridor
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
                  <span className="text-sm">{c.flag}</span>
                  <span>{c.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Payout */}
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground mb-3">
            Payout method
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

function ResultsToolbar({
  sortMode,
  setSortMode,
  count,
  onCopy,
  copied,
}: {
  readonly sortMode: SortMode
  readonly setSortMode: (m: SortMode) => void
  readonly count: number
  readonly onCopy: () => void
  readonly copied: boolean
}) {
  const sorts: readonly { id: SortMode; label: string }[] = [
    { id: 'recipient', label: 'Best rate' },
    { id: 'fee', label: 'Lowest fee' },
    { id: 'speed', label: 'Fastest' },
  ]
  return (
    <div className="flex items-center justify-between gap-4 flex-wrap">
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Sort
        </span>
        <div className="flex items-center gap-1 rounded-full border border-border bg-card p-1">
          {sorts.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSortMode(s.id)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                sortMode === s.id
                  ? 'bg-foreground text-background'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-xs text-muted-foreground">
          {count} provider{count === 1 ? '' : 's'} compared
        </span>
        <button
          type="button"
          onClick={onCopy}
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:border-foreground/30"
        >
          <Copy className="h-3 w-3" />
          {copied ? 'Copied' : 'Share'}
        </button>
      </div>
    </div>
  )
}

function ProviderRow({
  quote,
  rank,
  isWinner,
  isExpanded,
  onToggle,
  corridor,
}: {
  readonly quote: LiveQuote
  readonly rank: number
  readonly isWinner: boolean
  readonly isExpanded: boolean
  readonly onToggle: () => void
  readonly corridor: (typeof CORRIDORS)[number]
}) {
  return (
    <div
      className={`rounded-2xl border bg-card transition-colors ${
        isWinner ? 'border-coral' : 'border-border hover:border-foreground/20'
      }`}
    >
      <button type="button" onClick={onToggle} className="w-full text-left p-5">
        <div className="grid items-center gap-4 grid-cols-[auto_1fr_auto_auto]">
          <div className="font-mono text-xs font-semibold text-muted-foreground tabular-nums w-6">
            {rank.toString().padStart(2, '0')}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-display text-xl text-foreground leading-none">
                {quote.provider}
              </span>
              {isWinner ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-coral px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white">
                  <Sparkles className="h-2.5 w-2.5" />
                  Winner
                </span>
              ) : null}
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {quote.deliveryTime}
              </span>
              <span>Rate {quote.exchangeRate.toFixed(4)}</span>
              <span>Spread {(quote.spread * 100).toFixed(2)}%</span>
              <span className="inline-flex items-center gap-1">
                <Shield className="h-3 w-3" />
                {quote.trustScore.toFixed(1)}/10
              </span>
            </div>
          </div>

          <div className="text-right">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Fee
            </div>
            <div className="mt-1 font-mono text-sm text-foreground tabular-nums">
              ${quote.fee.toFixed(2)}
            </div>
          </div>

          <div className="text-right pl-2">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Recipient gets
            </div>
            <div
              className={`mt-1 font-display text-2xl leading-none tabular-nums ${
                isWinner ? 'text-coral' : 'text-foreground'
              }`}
            >
              {currencySymbol(corridor.targetCurrency)}
              {Math.round(quote.targetAmount).toLocaleString()}
            </div>
          </div>
        </div>

        <ChevronDown
          className={`mt-3 h-4 w-4 text-muted-foreground transition-transform ${
            isExpanded ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isExpanded ? (
        <div className="border-t border-border px-5 py-5 bg-background/60 rounded-b-2xl">
          <div className="grid sm:grid-cols-2 gap-x-8 gap-y-3 text-sm">
            <Row label="Mid-market rate" value={`1 ${quote.sourceCurrency} = ${quote.midMarketRate.toFixed(4)} ${quote.targetCurrency}`} />
            <Row label="Provider rate" value={`1 ${quote.sourceCurrency} = ${quote.exchangeRate.toFixed(4)} ${quote.targetCurrency}`} />
            <Row label="Spread vs mid-market" value={`${(quote.spread * 100).toFixed(2)}%`} />
            <Row label="Provider fee" value={`$${quote.fee.toFixed(2)}`} />
            <Row label="Total cost" value={`$${quote.totalCost.toFixed(2)}`} />
            <Row label="Delivery" value={`${quote.deliveryTime} (${quote.deliveryMinutes} min)`} />
            <Row
              label="Supports"
              value={
                [
                  quote.supportsGcash && 'GCash',
                  quote.supportsMaya && 'Maya',
                  quote.supportsBank && 'Bank',
                  quote.supportsCashPickup && 'Cash pickup',
                ]
                  .filter(Boolean)
                  .join(' · ') || '—'
              }
            />
            <Row label="Source" value={quote.source} />
          </div>
        </div>
      ) : null}
    </div>
  )
}

function Row({ label, value }: { readonly label: string; readonly value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-mono text-xs text-foreground tabular-nums">{value}</span>
    </div>
  )
}

function WinnerCard({
  winner,
  routing,
  amount,
  savingsPhp,
  savingsUsd,
  corridor,
  payout,
}: {
  readonly winner: LiveQuote | undefined
  readonly routing: ReturnType<typeof decideRouting> | null
  readonly amount: number
  readonly savingsPhp: number
  readonly savingsUsd: number
  readonly corridor: (typeof CORRIDORS)[number]
  readonly payout: (typeof PAYOUT_METHODS)[number]['id']
}) {
  if (!winner || !routing) {
    return (
      <div className="rounded-[2rem] border border-dashed border-border bg-card p-8 text-center">
        <div className="text-sm text-muted-foreground">
          Enter an amount above to see the winning route.
        </div>
      </div>
    )
  }

  const buddyFee = amount * 0.005
  const total = amount + winner.fee + buddyFee
  const isBuddyRoute = routing.action === 'buddy-executes'

  const sendHref = `/send/recipient?amount=${amount}&corridor=${corridor.id}&payout=${payout}`

  return (
    <div className="relative overflow-hidden rounded-[2rem] bg-foreground text-background p-8 shadow-level-3">
      <div className="flex items-center justify-between">
        <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-teal">
          Winning route
        </div>
        <Sparkles className="h-4 w-4 text-coral" />
      </div>

      <div className="mt-4 font-display text-3xl leading-[1.05]">{winner.provider}</div>
      <div className="mt-1 text-xs text-background/60">via {isBuddyRoute ? 'Remittance Buddy' : 'affiliate handoff'}</div>

      <div className="mt-8">
        <div className="text-[10px] font-semibold uppercase tracking-widest text-background/50">
          Recipient gets
        </div>
        <div className="mt-2 font-display text-5xl leading-none text-background tabular-nums">
          {currencySymbol(corridor.targetCurrency)}
          {Math.round(winner.targetAmount).toLocaleString()}
        </div>
        {savingsUsd > 0.5 ? (
          <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-teal/15 px-3 py-1 text-[11px] font-semibold text-teal">
            <TrendingUp className="h-3 w-3" />+{currencySymbol(corridor.targetCurrency)}
            {Math.round(savingsPhp).toLocaleString()} (${savingsUsd.toFixed(2)}) vs worst option
          </div>
        ) : null}
      </div>

      <div className="mt-8 space-y-2.5 rounded-2xl border border-background/15 bg-background/5 p-4">
        <MathRow label="Amount" value={`$${amount.toFixed(2)}`} />
        <MathRow label="Provider fee" value={`$${winner.fee.toFixed(2)}`} />
        <MathRow label="Buddy 0.5%" value={`$${buddyFee.toFixed(2)}`} />
        <div className="border-t border-background/15 pt-2.5">
          <MathRow label="You pay total" value={`$${total.toFixed(2)}`} bold />
        </div>
        <MathRow label="Arrives in" value={winner.deliveryTime} />
      </div>

      <Link
        href={sendHref}
        className="mt-6 group flex items-center justify-center gap-2 w-full h-14 rounded-full bg-coral text-white text-sm font-semibold transition-all hover:-translate-y-0.5"
      >
        {isBuddyRoute ? 'Send with Buddy' : `Continue with ${winner.provider}`}
        <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </Link>
      <div className="mt-3 text-[10px] text-center text-background/50 uppercase tracking-wider">
        Rate locked 30 min · Best-price guarantee
      </div>
    </div>
  )
}

function QuickActions({
  corridor,
  amount: _amount,
}: {
  readonly corridor: (typeof CORRIDORS)[number]
  readonly amount: number
}) {
  const items = [
    {
      icon: Bell,
      title: 'Set a rate alert',
      body: `Get emailed when ${corridor.sourceCurrency} → ${corridor.targetCurrency} hits your target.`,
      href: '/alerts',
    },
    {
      icon: Zap,
      title: 'Open in extension',
      body: 'Run this same comparison from any browser tab.',
      href: '/extension-privacy',
    },
  ]
  return (
    <div className="rounded-[2rem] border border-border bg-card p-6 space-y-2">
      {items.map((item) => {
        const Icon = item.icon
        return (
          <Link
            key={item.title}
            href={item.href}
            className="group flex items-start gap-4 rounded-2xl border border-transparent p-4 transition-colors hover:border-border hover:bg-background"
          >
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-border bg-background text-foreground transition-colors group-hover:bg-foreground group-hover:text-background group-hover:border-foreground">
              <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-foreground">{item.title}</div>
              <div className="mt-1 text-[11px] text-muted-foreground leading-snug">{item.body}</div>
            </div>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
          </Link>
        )
      })}
    </div>
  )
}

function MathRow({
  label,
  value,
  bold = false,
}: {
  readonly label: string
  readonly value: string
  readonly bold?: boolean
}) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-background/60">{label}</span>
      <span
        className={`font-mono tabular-nums ${
          bold ? 'font-bold text-background' : 'text-background/90'
        }`}
      >
        {value}
      </span>
    </div>
  )
}

function ErrorState({ message, onRetry }: { readonly message: string; readonly onRetry: () => void }) {
  return (
    <div className="rounded-[2rem] border border-dashed border-destructive/30 bg-card p-10 text-center">
      <div className="text-sm font-semibold text-destructive mb-2">Could not fetch live rates</div>
      <div className="text-xs text-muted-foreground mb-5">{message}</div>
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex items-center rounded-full bg-foreground px-5 py-2.5 text-xs font-semibold text-background"
      >
        Retry
      </button>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="rounded-[2rem] border border-dashed border-border bg-card p-10 text-center">
      <div className="text-sm text-muted-foreground">
        Enter an amount above to compare live rates across every provider.
      </div>
    </div>
  )
}

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
