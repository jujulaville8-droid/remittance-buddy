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
  Heart,
  Plus,
  Share2,
  Shield,
  Sparkles,
  TrendingUp,
  Users,
} from 'lucide-react'
import { useLiveQuotes, type LiveQuote } from '@/components/landing/useLiveQuotes'
import { decideRouting } from '@/lib/affiliate-routing'
import {
  familyGroupsStore,
  recipientsStore,
  type LocalFamilyGroup,
  type LocalRecipient,
} from '@/lib/local-db'
import { useBuddyPlus } from '@/lib/hooks/useBuddyPlus'

// ─────────────────────────────────────────────────────────────
// Constants — corridors/payouts tuned for OFW Philippines-first
// ─────────────────────────────────────────────────────────────

const CORRIDORS = [
  { id: 'US-PH', label: 'US → PH', sourceCurrency: 'USD', targetCurrency: 'PHP', flag: '🇺🇸' },
  { id: 'UK-PH', label: 'UK → PH', sourceCurrency: 'GBP', targetCurrency: 'PHP', flag: '🇬🇧' },
  { id: 'SG-PH', label: 'SG → PH', sourceCurrency: 'SGD', targetCurrency: 'PHP', flag: '🇸🇬' },
  { id: 'AE-PH', label: 'UAE → PH', sourceCurrency: 'AED', targetCurrency: 'PHP', flag: '🇦🇪' },
  { id: 'SA-PH', label: 'SA → PH', sourceCurrency: 'SAR', targetCurrency: 'PHP', flag: '🇸🇦' },
] as const

const PAYOUT_METHODS = [
  { id: 'gcash', label: 'GCash', desc: 'Mobile wallet, instant' },
  { id: 'maya', label: 'Maya', desc: 'Mobile wallet' },
  { id: 'bank', label: 'Bank', desc: 'BPI, BDO, Metro' },
  { id: 'cash_pickup', label: 'Cash pickup', desc: 'Cebuana, MLhuillier' },
] as const

const QUICK_AMOUNTS = [100, 200, 500, 1000, 2500] as const
type SortMode = 'recipient' | 'fee' | 'speed'

// ─────────────────────────────────────────────────────────────
// Humanising helpers — turns abstract savings into concrete things
// ─────────────────────────────────────────────────────────────

/**
 * Translate a PHP savings amount into a concrete household item.
 * Rough 2026 Philippine household reference prices — intentionally simple,
 * because the goal is a vibe, not a financial statement.
 */
function humanizeSavings(savingsPhp: number): string | null {
  if (savingsPhp < 30) return null
  if (savingsPhp < 70) return 'about a cup of kape at the kapeteria'
  if (savingsPhp < 200) return 'a jeepney ride to school for the week'
  if (savingsPhp < 500) return "a Jollibee lunch for the whole family"
  if (savingsPhp < 1000) return 'a week of rice money'
  if (savingsPhp < 2500) return 'a month of mobile load for the kids'
  return 'a big chunk of the electric bill'
}

/**
 * Friendly greeting based on time of day, with a light Tagalog touch.
 * Keeps it subtle — the vision doc warns against gimmicky AI.
 */
function greeting(): string {
  if (typeof window === 'undefined') return 'Kumusta'
  const h = new Date().getHours()
  if (h < 12) return 'Magandang umaga'
  if (h < 18) return 'Magandang hapon'
  return 'Magandang gabi'
}

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
  const [sortMode, setSortMode] = useState<SortMode>('recipient')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [shared, setShared] = useState(false)

  // Family/recipient state loaded from localStorage on mount
  const [recipients, setRecipients] = useState<readonly LocalRecipient[]>([])
  const [families, setFamilies] = useState<readonly LocalFamilyGroup[]>([])
  const [selectedRecipientId, setSelectedRecipientId] = useState<string | null>(initialRecipientId)

  // Buddy Plus state — enables the "fee waived" perk in WinnerCard
  const { isActive: isPlus } = useBuddyPlus()

  useEffect(() => {
    setRecipients(recipientsStore.list())
    setFamilies(familyGroupsStore.list())
  }, [])

  const selectedRecipient = recipients.find((r) => r.id === selectedRecipientId) ?? null
  const recipientFirstName = selectedRecipient
    ? selectedRecipient.fullName.split(' ')[0] ?? selectedRecipient.fullName
    : null

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
    if (selectedRecipientId) params.set('recipient', selectedRecipientId)
    router.replace(`/compare?${params.toString()}`, { scroll: false })
  }, [corridorId, payout, amount, selectedRecipientId, router])

  // When you pick a saved recipient, auto-fill corridor + payout from them
  function handlePickRecipient(r: LocalRecipient) {
    setSelectedRecipientId(r.id)
    setPayout(r.payoutMethod)
    // keep current corridor unless the recipient has a hint
  }

  function handleCopyLink() {
    if (typeof window === 'undefined') return
    navigator.clipboard.writeText(window.location.href).then(
      () => {
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
      },
      () => {},
    )
  }

  function handleShareWithFamily() {
    if (!winner) return
    if (typeof window === 'undefined') return
    const name = recipientFirstName ?? 'the family'
    const php = Math.round(winner.targetAmount).toLocaleString()
    const message = `Sending ₱${php} home to ${name} via ${winner.provider}, arriving in ${winner.deliveryTime}. I'll let you know when it lands 🇵🇭`

    const flash = () => {
      setShared(true)
      setTimeout(() => setShared(false), 1500)
    }

    const copyToClipboard = () => {
      window.navigator.clipboard.writeText(message).then(flash, flash)
    }

    // Use the native share sheet on mobile when available; fall back to clipboard on desktop
    const nav = window.navigator as Navigator & {
      share?: (data: ShareData) => Promise<void>
    }
    if (typeof nav.share === 'function') {
      nav.share({ text: message, title: 'Money on the way' }).then(flash, copyToClipboard)
    } else {
      copyToClipboard()
    }
  }

  const secondsAgo = fetchedAt
    ? Math.max(0, Math.floor((Date.now() - fetchedAt.getTime()) / 1000))
    : null

  return (
    <div className="pt-28 pb-20">
      <Greeting recipientFirstName={recipientFirstName} />

      <div className="container max-w-6xl mt-10">
        <RecipientStrip
          recipients={recipients}
          selectedId={selectedRecipientId}
          onPick={handlePickRecipient}
          onClear={() => setSelectedRecipientId(null)}
        />

        <div className="mt-8 flex items-center justify-between flex-wrap gap-3">
          <p className="text-lg lg:text-xl text-foreground leading-snug max-w-2xl">
            Sending{' '}
            <span className="font-display italic text-coral">
              {currencySymbol(corridor.sourceCurrency)}
              {amount.toLocaleString()} {corridor.sourceCurrency}
            </span>{' '}
            via{' '}
            <span className="font-semibold">
              {PAYOUT_METHODS.find((m) => m.id === payout)?.label}
            </span>
            {recipientFirstName ? (
              <>
                {' '}
                to{' '}
                <span className="font-semibold text-foreground">{recipientFirstName}</span>
              </>
            ) : (
              <>
                {' '}
                home to{' '}
                <span className="font-semibold text-foreground">
                  {corridor.targetCurrency === 'PHP' ? 'the Philippines 🇵🇭' : 'your family'}
                </span>
              </>
            )}
          </p>

          <LiveChip
            loading={loading}
            cached={cached}
            secondsAgo={secondsAgo}
            onRefresh={refetch}
          />
        </div>

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
              recipientFirstName={recipientFirstName}
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
                      setExpandedId(
                        expandedId === quote.providerSlug ? null : quote.providerSlug,
                      )
                    }
                    corridor={corridor}
                    recipientFirstName={recipientFirstName}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right rail: warm winner card + family nudges */}
          <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
            <WinnerCard
              winner={winner}
              routing={routing}
              amount={amount}
              savingsPhp={savingsPhp}
              savingsUsd={savingsUsd}
              corridor={corridor}
              payout={payout}
              recipientFirstName={recipientFirstName}
              recipientId={selectedRecipientId}
              onShareWithFamily={handleShareWithFamily}
              shared={shared}
              isPlus={isPlus}
            />
            <FamilyNudges
              families={families}
              corridor={corridor}
              amount={amount}
              hasRecipient={Boolean(selectedRecipient)}
            />
          </aside>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Greeting header — warm, personalised, Tagalog-tinted
// ─────────────────────────────────────────────────────────────

function Greeting({ recipientFirstName }: { readonly recipientFirstName: string | null }) {
  // Avoid hydration mismatch: server renders the neutral fallback,
  // then the client swaps in the time-of-day greeting after mount.
  const [localGreeting, setLocalGreeting] = useState('Kumusta')
  useEffect(() => {
    setLocalGreeting(greeting())
  }, [])
  return (
    <header className="container max-w-6xl">
      <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-coral">
        <span className="text-sm leading-none">🇵🇭</span>
        Built for Filipino families abroad
      </div>
      <h1 className="mt-5 font-sans font-semibold text-4xl lg:text-[3.25rem] tracking-tight leading-[1.05] text-foreground text-balance max-w-4xl">
        {localGreeting},{' '}
        <span className="font-editorial italic font-normal text-coral">
          {recipientFirstName
            ? `sending home to ${recipientFirstName}`
            : 'padalahan natin ang pamilya mo'}
        </span>
        .
      </h1>
      <p className="mt-5 text-lg text-muted-foreground max-w-2xl leading-relaxed">
        {recipientFirstName
          ? `We\u2019ll find the best route for ${recipientFirstName} across every major provider — live rates from every OFW corridor, the math all on screen.`
          : 'For Filipino OFWs sending home from the US, UK, Singapore, UAE and Saudi. We compare every major provider in real time and tell you which route lands the most pesos — GCash, Maya, bank, or cash pickup.'}
      </p>
    </header>
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
            href="/send/recipient?amount=500"
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
            href="/send/recipient?amount=500"
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
    <section className="mt-6 rounded-[2rem] border border-border bg-card p-8 shadow-level-1">
      <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr_1fr]">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground mb-3">
            How much?
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
                  <span className="text-sm">{c.flag}</span>
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
// Results toolbar — conversational section heading
// ─────────────────────────────────────────────────────────────

function ResultsToolbar({
  sortMode,
  setSortMode,
  count,
  onCopy,
  copied,
  recipientFirstName,
}: {
  readonly sortMode: SortMode
  readonly setSortMode: (m: SortMode) => void
  readonly count: number
  readonly onCopy: () => void
  readonly copied: boolean
  readonly recipientFirstName: string | null
}) {
  const sorts: readonly { id: SortMode; label: string }[] = [
    { id: 'recipient', label: 'Most delivered' },
    { id: 'fee', label: 'Cheapest total' },
    { id: 'speed', label: 'Fastest' },
  ]
  return (
    <div>
      <div className="mb-4 font-display text-2xl lg:text-3xl text-foreground leading-[1.1]">
        {recipientFirstName
          ? `How everyone stacks up for ${recipientFirstName} today.`
          : 'How everyone stacks up today.'}
      </div>
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
            {copied ? 'Link copied' : 'Share compare'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Provider row — softened table, friendlier labels
// ─────────────────────────────────────────────────────────────

function ProviderRow({
  quote,
  rank,
  isWinner,
  isExpanded,
  onToggle,
  corridor,
  recipientFirstName,
}: {
  readonly quote: LiveQuote
  readonly rank: number
  readonly isWinner: boolean
  readonly isExpanded: boolean
  readonly onToggle: () => void
  readonly corridor: (typeof CORRIDORS)[number]
  readonly recipientFirstName: string | null
}) {
  const deliveredLabel = recipientFirstName ? `${recipientFirstName} gets` : 'They get'
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
                  Today's winner
                </span>
              ) : null}
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Arrives in {quote.deliveryTime}
              </span>
              <span>Rate {quote.exchangeRate.toFixed(4)}</span>
              <span>Hidden markup {(quote.spread * 100).toFixed(2)}%</span>
              <span className="inline-flex items-center gap-1">
                <Shield className="h-3 w-3" />
                Trust {quote.trustScore.toFixed(1)}/10
              </span>
            </div>
          </div>

          <div className="text-right">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Their fee
            </div>
            <div className="mt-1 font-mono text-sm text-foreground tabular-nums">
              ${quote.fee.toFixed(2)}
            </div>
          </div>

          <div className="text-right pl-2">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {deliveredLabel}
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
            <Row
              label="Mid-market rate"
              value={`1 ${quote.sourceCurrency} = ${quote.midMarketRate.toFixed(4)} ${quote.targetCurrency}`}
            />
            <Row
              label="What they quote you"
              value={`1 ${quote.sourceCurrency} = ${quote.exchangeRate.toFixed(4)} ${quote.targetCurrency}`}
            />
            <Row
              label="Hidden FX markup"
              value={`${(quote.spread * 100).toFixed(2)}%`}
            />
            <Row label="Provider fee" value={`$${quote.fee.toFixed(2)}`} />
            <Row label="Your total cost" value={`$${quote.totalCost.toFixed(2)}`} />
            <Row
              label="Delivery"
              value={`${quote.deliveryTime} (${quote.deliveryMinutes} min)`}
            />
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
            <Row label="Rate source" value={quote.source} />
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

// ─────────────────────────────────────────────────────────────
// Winner card — warm surface, conversational headline, share CTA
// ─────────────────────────────────────────────────────────────

function WinnerCard({
  winner,
  routing,
  amount,
  savingsPhp,
  savingsUsd,
  corridor,
  payout,
  recipientFirstName,
  recipientId,
  onShareWithFamily,
  shared,
  isPlus,
}: {
  readonly winner: LiveQuote | undefined
  readonly routing: ReturnType<typeof decideRouting> | null
  readonly amount: number
  readonly savingsPhp: number
  readonly savingsUsd: number
  readonly corridor: (typeof CORRIDORS)[number]
  readonly payout: (typeof PAYOUT_METHODS)[number]['id']
  readonly recipientFirstName: string | null
  readonly recipientId: string | null
  readonly onShareWithFamily: () => void
  readonly shared: boolean
  readonly isPlus: boolean
}) {
  if (!winner || !routing) {
    return (
      <div className="rounded-[2rem] border border-dashed border-border bg-card p-10 text-center">
        <Heart className="mx-auto h-5 w-5 text-coral/60 mb-3" strokeWidth={1.8} />
        <div className="text-sm text-muted-foreground">
          Pick an amount above and we\u2019ll find the best route for your family.
        </div>
      </div>
    )
  }

  // Buddy Plus perk: zero platform fee on sends. Free tier: 0.5%.
  const buddyFee = isPlus ? 0 : amount * 0.005
  const total = amount + winner.fee + buddyFee
  const isBuddyRoute = routing.action === 'buddy-executes'

  const sendHref = `/send/recipient?amount=${amount}&corridor=${corridor.id}&payout=${payout}${
    recipientId ? `&recipient=${recipientId}` : ''
  }`

  const name = recipientFirstName ?? 'Your family'
  const human = humanizeSavings(savingsPhp)

  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-coral/30 bg-card p-8 shadow-level-3">
      {/* Soft coral wash at the top edge */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-coral/10 to-transparent pointer-events-none"
      />

      <div className="relative flex items-center justify-between">
        <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-coral">
          Today\u2019s best route
        </div>
        <Sparkles className="h-4 w-4 text-coral" />
      </div>

      {/* Conversational headline — "Nanay gets ₱28,500 via Wise in 2 minutes" */}
      <div className="relative mt-6">
        <div className="font-display text-[2.25rem] leading-[1.05] text-foreground text-balance">
          <span className="font-semibold">{name}</span> gets{' '}
          <span className="text-coral italic">
            {currencySymbol(corridor.targetCurrency)}
            {Math.round(winner.targetAmount).toLocaleString()}
          </span>{' '}
          via {winner.provider} in {winner.deliveryTime}.
        </div>
        {savingsUsd > 0.5 ? (
          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-teal/10 px-3 py-1.5 text-[11px] font-semibold text-teal">
            <TrendingUp className="h-3 w-3" />
            Saves {currencySymbol(corridor.targetCurrency)}
            {Math.round(savingsPhp).toLocaleString()} vs the worst option
            {human ? <span className="text-teal/80">· {human}</span> : null}
          </div>
        ) : null}
      </div>

      {/* Math breakdown — quiet, confidence-building */}
      <div className="relative mt-7 space-y-2.5 rounded-2xl border border-border bg-background p-4">
        <MathRow label="You send" value={`$${amount.toFixed(2)}`} />
        <MathRow label={`${winner.provider} fee`} value={`$${winner.fee.toFixed(2)}`} />
        <MathRow
          label={isPlus ? 'Buddy service fee · waived for Plus' : 'Buddy service fee · 0.5%'}
          value={isPlus ? '$0.00' : `$${buddyFee.toFixed(2)}`}
        />
        <div className="border-t border-dashed border-border pt-2.5">
          <MathRow label="You pay in total" value={`$${total.toFixed(2)}`} bold />
        </div>
        <MathRow
          label={`Arrives at ${PAYOUT_METHODS.find((m) => m.id === payout)?.label}`}
          value={winner.deliveryTime}
        />
      </div>

      {/* Primary action — changes copy based on routing decision */}
      <Link
        href={sendHref}
        className="relative mt-6 group flex items-center justify-center gap-2 w-full h-14 rounded-full bg-coral text-white text-sm font-semibold transition-all hover:-translate-y-0.5"
      >
        {isBuddyRoute
          ? `Send ${name}\u2019s money now`
          : `Continue with ${winner.provider}`}
        <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </Link>

      {/* Secondary action — let the family know */}
      <button
        type="button"
        onClick={onShareWithFamily}
        className="relative mt-3 group flex items-center justify-center gap-2 w-full h-12 rounded-full border border-border bg-background text-xs font-semibold text-foreground transition-colors hover:border-foreground/30"
      >
        <Share2 className="h-3.5 w-3.5" />
        {shared ? 'Message copied — paste in Messenger' : 'Tell the family it\u2019s coming'}
      </button>

      <p className="relative mt-4 text-center text-[10px] uppercase tracking-wider text-muted-foreground">
        Rate locked 30 min · Best-price guarantee
      </p>
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
      <span className="text-muted-foreground">{label}</span>
      <span
        className={`font-mono tabular-nums ${
          bold ? 'font-bold text-foreground' : 'text-foreground/90'
        }`}
      >
        {value}
      </span>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Family nudges — shared goals and rate alerts
// ─────────────────────────────────────────────────────────────

function FamilyNudges({
  families,
  corridor,
  amount: _amount,
  hasRecipient,
}: {
  readonly families: readonly LocalFamilyGroup[]
  readonly corridor: (typeof CORRIDORS)[number]
  readonly amount: number
  readonly hasRecipient: boolean
}) {
  const firstGroupWithGoal = families.find((f) => f.goal != null) ?? null

  return (
    <div className="rounded-[2rem] border border-border bg-card p-6 space-y-2">
      {firstGroupWithGoal && firstGroupWithGoal.goal ? (
        <Link
          href="/family"
          className="group flex items-start gap-4 rounded-2xl border border-transparent p-4 transition-colors hover:border-border hover:bg-background"
        >
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-border bg-background text-foreground transition-colors group-hover:bg-coral group-hover:text-white group-hover:border-coral">
            <Users className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold text-foreground">
              Pool this into {firstGroupWithGoal.name}
            </div>
            <div className="mt-1 text-[11px] text-muted-foreground leading-snug">
              Working towards <strong>{firstGroupWithGoal.goal.label}</strong>. Contribute this
              send.
            </div>
          </div>
          <ArrowUpRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
        </Link>
      ) : (
        <Link
          href="/family"
          className="group flex items-start gap-4 rounded-2xl border border-transparent p-4 transition-colors hover:border-border hover:bg-background"
        >
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-border bg-background text-foreground transition-colors group-hover:bg-coral group-hover:text-white group-hover:border-coral">
            <Users className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold text-foreground">Build a family hub</div>
            <div className="mt-1 text-[11px] text-muted-foreground leading-snug">
              Pool sends with your siblings, set a shared goal like a roof fund or tuition.
            </div>
          </div>
          <ArrowUpRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
        </Link>
      )}

      <Link
        href="/alerts"
        className="group flex items-start gap-4 rounded-2xl border border-transparent p-4 transition-colors hover:border-border hover:bg-background"
      >
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-border bg-background text-foreground transition-colors group-hover:bg-coral group-hover:text-white group-hover:border-coral">
          <Bell className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold text-foreground">
            Wait for a better {corridor.sourceCurrency} → {corridor.targetCurrency} rate
          </div>
          <div className="mt-1 text-[11px] text-muted-foreground leading-snug">
            {hasRecipient
              ? 'We\u2019ll email you the moment it hits your target — no chart-watching.'
              : 'Set a target and we\u2019ll email you the moment it hits.'}
          </div>
        </div>
        <ArrowUpRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
      </Link>
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
