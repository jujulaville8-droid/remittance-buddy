'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowUpRight, ChevronDown, Heart, Plus, RefreshCw } from 'lucide-react'
import { useLiveQuotes, type LiveQuote } from '@/components/landing/useLiveQuotes'
import { decideRouting, trackAffiliateClick } from '@/lib/affiliate-routing'
import { recipientsStore, type LocalRecipient } from '@/lib/local-db'
import { CURRENCIES, PHP, getCurrency } from '@/lib/currencies'
import { CurrencyPicker } from '@/components/CurrencyPicker'

const PAYOUT_METHODS = [
  { id: 'gcash', label: 'GCash' },
  { id: 'maya', label: 'Maya' },
  { id: 'bank', label: 'Bank' },
  { id: 'cash_pickup', label: 'Cash pickup' },
] as const

type PayoutId = (typeof PAYOUT_METHODS)[number]['id']
const QUICK_AMOUNTS = [100, 200, 500, 1000, 2500] as const

export function CompareTool() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const initialSource = (searchParams.get('from') ?? 'USD').toUpperCase()
  const initialAmount = Number(searchParams.get('amount') ?? 500)
  const initialPayout = (searchParams.get('payout') as PayoutId | null) ?? 'gcash'
  const initialRecipientId = searchParams.get('recipient')

  const [sourceCode, setSourceCode] = useState<string>(
    CURRENCIES.some((c) => c.code === initialSource) ? initialSource : 'USD',
  )
  const [amount, setAmount] = useState<number>(initialAmount)
  const [payout, setPayout] = useState<PayoutId>(initialPayout)
  const [pickerOpen, setPickerOpen] = useState(false)

  const [recipients, setRecipients] = useState<readonly LocalRecipient[]>([])
  const [selectedRecipientId, setSelectedRecipientId] = useState<string | null>(initialRecipientId)

  useEffect(() => {
    setRecipients(recipientsStore.list())
  }, [])

  const source = getCurrency(sourceCode)
  const corridorId = `${sourceCode}-PH`

  const { quotes, loading, error, fetchedAt, cached, refetch } = useLiveQuotes({
    corridor: corridorId,
    sourceCurrency: sourceCode,
    targetCurrency: 'PHP',
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

  useEffect(() => {
    const params = new URLSearchParams()
    params.set('from', sourceCode)
    params.set('amount', amount.toString())
    params.set('payout', payout)
    if (selectedRecipientId) params.set('recipient', selectedRecipientId)
    router.replace(`/compare?${params.toString()}`, { scroll: false })
  }, [sourceCode, amount, payout, selectedRecipientId, router])

  function handlePickRecipient(r: LocalRecipient) {
    setSelectedRecipientId(r.id)
    setPayout(r.payoutMethod)
  }

  const secondsAgo = fetchedAt
    ? Math.max(0, Math.floor((Date.now() - fetchedAt.getTime()) / 1000))
    : null

  const recipientGets = winner ? Math.round(winner.targetAmount) : 0

  return (
    <div className="pt-4 pb-24">
      <div className="container max-w-lg space-y-4">
        <RecipientStrip
          recipients={recipients}
          selectedId={selectedRecipientId}
          onPick={handlePickRecipient}
          onClear={() => setSelectedRecipientId(null)}
        />

        {/* ───── You send / Recipient gets panel (Wise-style) ───── */}
        <section className="rounded-2xl border border-border bg-card overflow-hidden">
          <AmountBlock
            label="You send"
            amount={amount}
            onAmountChange={setAmount}
            currencyCode={source.code}
            currencyFlag={source.flag}
            onPickCurrency={() => setPickerOpen(true)}
            editable
            symbol={source.symbol}
          />
          <div className="h-px bg-border" />
          <AmountBlock
            label="Recipient gets"
            amount={recipientGets}
            currencyCode={PHP.code}
            currencyFlag={PHP.flag}
            symbol={PHP.symbol}
            editable={false}
            loading={loading}
            empty={!winner}
          />
        </section>

        {/* Quick amounts */}
        <div className="flex flex-wrap gap-1.5">
          {QUICK_AMOUNTS.map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => setAmount(a)}
              className={`h-8 rounded-full px-3.5 text-xs font-semibold transition-colors ${
                amount === a
                  ? 'bg-foreground text-background'
                  : 'bg-muted text-muted-foreground hover:bg-border'
              }`}
            >
              {source.symbol}{a.toLocaleString()}
            </button>
          ))}
        </div>

        {/* Payout method chips */}
        <div className="flex flex-wrap gap-1.5">
          {PAYOUT_METHODS.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setPayout(m.id)}
              className={`h-8 rounded-full px-3.5 text-xs font-semibold transition-colors ${
                payout === m.id
                  ? 'bg-foreground text-background'
                  : 'bg-muted text-muted-foreground hover:bg-border'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Winner summary */}
        {winner && routing ? (
          <WinnerSummary winner={winner} routing={routing} />
        ) : error ? (
          <ErrorState message={error} onRetry={refetch} />
        ) : !loading ? (
          <EmptyState />
        ) : null}

        {/* Other routes */}
        {sorted.length > 1 ? (
          <section>
            <div className="flex items-center justify-between mb-2">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Other routes
              </div>
              <RefreshChip loading={loading} cached={cached} secondsAgo={secondsAgo} onRefresh={refetch} />
            </div>
            <div className="divide-y divide-border rounded-2xl border border-border bg-card overflow-hidden">
              {sorted.slice(1).map((q) => (
                <ProviderRow key={q.providerSlug} quote={q} />
              ))}
            </div>
          </section>
        ) : null}
      </div>

      <CurrencyPicker
        open={pickerOpen}
        selectedCode={sourceCode}
        excludeCode="PHP"
        onSelect={(code) => setSourceCode(code)}
        onClose={() => setPickerOpen(false)}
      />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Amount block — "You send" / "Recipient gets" Wise-style row
// ─────────────────────────────────────────────────────────────

function AmountBlock({
  label,
  amount,
  onAmountChange,
  currencyCode,
  currencyFlag,
  symbol,
  onPickCurrency,
  editable,
  loading,
  empty,
}: {
  readonly label: string
  readonly amount: number
  readonly onAmountChange?: (n: number) => void
  readonly currencyCode: string
  readonly currencyFlag: string
  readonly symbol: string
  readonly onPickCurrency?: () => void
  readonly editable: boolean
  readonly loading?: boolean
  readonly empty?: boolean
}) {
  return (
    <div className="flex items-center justify-between px-4 py-3.5">
      <div className="min-w-0 flex-1 pr-3">
        <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          {label}
        </div>
        {editable ? (
          <div className="mt-1 flex items-center gap-1">
            <span className="font-mono text-base text-muted-foreground shrink-0">{symbol}</span>
            <input
              type="number"
              inputMode="numeric"
              min={1}
              value={amount}
              onChange={(e) => onAmountChange?.(Math.max(0, Number(e.target.value) || 0))}
              className="w-0 flex-1 min-w-0 bg-transparent text-2xl font-semibold text-foreground outline-none tabular-nums"
              aria-label={label}
            />
          </div>
        ) : (
          <div className="mt-1 flex items-center gap-1 tabular-nums">
            <span className="font-mono text-base text-muted-foreground shrink-0">{symbol}</span>
            <span className={`text-2xl font-semibold text-foreground ${loading ? 'opacity-40' : ''}`}>
              {empty ? '—' : amount.toLocaleString()}
            </span>
          </div>
        )}
      </div>
      {onPickCurrency ? (
        <button
          type="button"
          onClick={onPickCurrency}
          className="shrink-0 flex items-center gap-2 rounded-full border border-border bg-background px-3 h-10 text-sm font-semibold text-foreground active:scale-95"
        >
          <span className="text-base leading-none">{currencyFlag}</span>
          <span>{currencyCode}</span>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </button>
      ) : (
        <div className="shrink-0 flex items-center gap-2 rounded-full border border-border bg-muted px-3 h-10 text-sm font-semibold text-foreground">
          <span className="text-base leading-none">{currencyFlag}</span>
          <span>{currencyCode}</span>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Winner summary — rate / fee / arrives + Continue
// ─────────────────────────────────────────────────────────────

function WinnerSummary({
  winner,
  routing,
}: {
  readonly winner: LiveQuote
  readonly routing: NonNullable<ReturnType<typeof decideRouting>>
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-4 space-y-3">
      <SummaryRow label="Best route" value={winner.provider} bold />
      <SummaryRow
        label={`1 ${winner.sourceCurrency}`}
        value={`${winner.exchangeRate.toFixed(2)} ${winner.targetCurrency}`}
      />
      <SummaryRow label="Fee" value={`${winner.sourceCurrency} ${winner.fee.toFixed(2)}`} />
      <SummaryRow label="Arrives in" value={winner.deliveryTime} />

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
        className="mt-1 flex items-center justify-center gap-2 w-full h-12 rounded-full bg-foreground text-background text-sm font-semibold active:scale-[0.99]"
      >
        Continue with {winner.provider}
        <ArrowUpRight className="h-4 w-4" />
      </a>
    </section>
  )
}

function SummaryRow({
  label,
  value,
  bold = false,
}: {
  readonly label: string
  readonly value: string
  readonly bold?: boolean
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className={bold ? 'font-medium text-foreground' : 'text-muted-foreground'}>{label}</span>
      <span className={`tabular-nums ${bold ? 'font-semibold text-foreground' : 'text-foreground'}`}>
        {value}
      </span>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Provider row — other routes list
// ─────────────────────────────────────────────────────────────

function ProviderRow({ quote }: { readonly quote: LiveQuote }) {
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
      className="flex items-center justify-between gap-3 px-4 py-3.5 transition-colors hover:bg-muted/40"
    >
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold text-foreground truncate">{quote.provider}</div>
        <div className="mt-0.5 text-[11px] text-muted-foreground tabular-nums">
          Fee {quote.sourceCurrency} {quote.fee.toFixed(2)} · {quote.deliveryTime}
        </div>
      </div>
      <div className="text-right">
        <div className="text-base font-semibold text-foreground tabular-nums">
          {PHP.symbol}{Math.round(quote.targetAmount).toLocaleString()}
        </div>
      </div>
      <ArrowUpRight className="h-4 w-4 text-muted-foreground shrink-0" />
    </a>
  )
}

// ─────────────────────────────────────────────────────────────
// Recipient strip
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
  if (recipients.length === 0) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-dashed border-border bg-card px-4 py-3">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground">
          <Heart className="h-4 w-4" strokeWidth={1.8} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-foreground">Save a recipient</div>
          <div className="text-[11px] text-muted-foreground">One-tap future sends</div>
        </div>
        <Link
          href="/recipients"
          className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground"
        >
          <Plus className="h-3 w-3" />
          Add
        </Link>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        Sending to
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {recipients.map((r) => {
          const selected = r.id === selectedId
          const initials = r.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2)
          return (
            <button
              key={r.id}
              type="button"
              onClick={() => onPick(r)}
              className={`flex items-center gap-2 rounded-full border px-3 h-8 shrink-0 transition-colors ${
                selected ? 'border-foreground bg-foreground text-background' : 'border-border bg-card text-foreground'
              }`}
            >
              <span className="text-[10px] font-bold">{initials}</span>
              <span className="text-xs font-semibold">{r.fullName.split(' ')[0]}</span>
            </button>
          )
        })}
        {selectedId ? (
          <button
            type="button"
            onClick={onClear}
            className="text-xs text-muted-foreground shrink-0"
          >
            Clear
          </button>
        ) : null}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Refresh chip + error/empty states
// ─────────────────────────────────────────────────────────────

function RefreshChip({
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
      className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground"
    >
      <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
      {loading
        ? 'Checking'
        : secondsAgo != null
          ? `${secondsAgo}s ago${cached ? ' · cached' : ''}`
          : 'Refresh'}
    </button>
  )
}

function ErrorState({
  message,
  onRetry,
}: {
  readonly message: string
  readonly onRetry: () => void
}) {
  return (
    <div className="rounded-2xl border border-destructive/30 bg-card p-6 text-center">
      <div className="text-sm font-semibold text-destructive mb-1">Couldn't fetch live rates</div>
      <div className="text-xs text-muted-foreground mb-4">{message}</div>
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex items-center rounded-full bg-foreground px-4 py-2 text-xs font-semibold text-background"
      >
        Try again
      </button>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card p-6 text-center text-sm text-muted-foreground">
      Enter an amount to compare providers.
    </div>
  )
}
