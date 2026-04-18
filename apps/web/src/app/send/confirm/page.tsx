'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, CheckCircle2, Clock, Shield, Sparkles, User } from 'lucide-react'
import {
  activeTransferStore,
  recipientsStore,
  transfersStore,
  type LocalRecipient,
} from '@/lib/local-db'
import { useLiveQuotes } from '@/components/landing/useLiveQuotes'

// V1 reality: no platform fee. We hand users off to providers via
// affiliate links; the fee they pay is the provider's fee only.

export default function ConfirmPage() {
  return (
    <Suspense fallback={null}>
      <ConfirmPageInner />
    </Suspense>
  )
}

function ConfirmPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const amount = Number(searchParams.get('amount') ?? 500)
  const payout = searchParams.get('payout') ?? 'gcash'

  const [recipient, setRecipient] = useState<LocalRecipient | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lockSeconds, setLockSeconds] = useState(1800) // 30 minutes

  const { quotes, loading, error: quoteError } = useLiveQuotes({
    corridor: 'US-PH',
    sourceCurrency: 'USD',
    targetCurrency: 'PHP',
    sourceAmount: amount,
    payoutMethod: payout,
  })

  useEffect(() => {
    const draft = activeTransferStore.get()
    if (!draft?.recipientId) {
      router.replace('/send/recipient')
      return
    }
    const r = recipientsStore.get(draft.recipientId)
    if (!r) {
      router.replace('/send/recipient')
      return
    }
    setRecipient(r)
  }, [router])

  // Rate lock countdown
  useEffect(() => {
    const id = setInterval(() => {
      setLockSeconds((s) => Math.max(0, s - 1))
    }, 1000)
    return () => clearInterval(id)
  }, [])

  const winner = quotes[0]
  const buddyFee = 0 // no platform fee — Buddy is affiliate-only in V1
  const totalCost = winner ? amount + winner.fee : amount

  async function handleConfirm() {
    if (!recipient || !winner) return
    setSubmitting(true)
    setError(null)

    try {
      // Create the transfer in localStorage
      const transfer = transfersStore.create({
        recipientId: recipient.id,
        recipientName: recipient.fullName,
        sourceAmount: amount,
        sourceCurrency: 'USD',
        targetAmount: Math.round(winner.targetAmount),
        targetCurrency: 'PHP',
        exchangeRate: winner.exchangeRate,
        providerFee: winner.fee,
        buddyFee,
        totalCost,
        provider: winner.provider,
        providerSlug: winner.providerSlug,
        status: 'quote',
        // not set:
        // createdAt, updatedAt, statusHistory, deliveredAt
      })

      recipientsStore.markUsed(recipient.id)
      activeTransferStore.clear()

      router.push(`/send/status/${transfer.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setSubmitting(false)
    }
  }

  if (!recipient) {
    return <div className="text-center py-16 text-muted-foreground">Loading…</div>
  }

  const mins = Math.floor(lockSeconds / 60)
  const secs = lockSeconds % 60

  return (
    <div>
      <div className="text-xs font-bold uppercase tracking-[0.2em] text-coral mb-2">Step 2 of 3</div>
      <h1 className="font-display text-4xl lg:text-5xl leading-tight text-foreground mb-8">
        Review your transfer.
      </h1>

      {/* Rate lock banner */}
      <div className="mb-5 flex items-center gap-2 rounded-full bg-teal/10 border border-teal/20 px-4 py-2 w-fit">
        <Clock className="h-3.5 w-3.5 text-teal" />
        <span className="text-xs font-semibold text-teal tabular-nums">
          Rate locked for {mins}:{secs.toString().padStart(2, '0')}
        </span>
      </div>

      {/* Recipient card */}
      <div className="rounded-2xl border border-border bg-card p-5 mb-4 flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl grid place-items-center shrink-0 ${recipient.avatarColor}`}>
          <User className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-foreground">
            {recipient.fullName}
            {recipient.relationship && (
              <span className="ml-2 text-xs font-normal text-muted-foreground">
                · {recipient.relationship}
              </span>
            )}
          </div>
          <div className="text-xs text-muted-foreground truncate">
            {recipient.payoutMethod === 'gcash'
              ? `GCash · ${recipient.gcashNumber}`
              : recipient.payoutMethod === 'bank'
                ? `${recipient.bankCode} · ${recipient.bankAccountNumber}`
                : recipient.payoutMethod}
          </div>
        </div>
        <Link
          href={`/send/recipient?amount=${amount}&payout=${payout}`}
          className="text-xs font-semibold text-coral hover:underline"
        >
          Change
        </Link>
      </div>

      {/* Quote card */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden mb-4">
        <div className="bg-foreground text-background px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-coral" />
            <span className="text-xs font-bold uppercase tracking-widest">Your transfer</span>
          </div>
          {loading && (
            <span className="text-[10px] font-semibold text-background/60 uppercase tracking-wider">
              Refreshing…
            </span>
          )}
        </div>

        <div className="p-5">
          <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
            Recipient gets via GCash
          </div>
          <div className="flex items-baseline gap-1 text-coral mb-5">
            <span className="font-display text-2xl leading-none">₱</span>
            <span className="font-display text-5xl leading-none tabular-nums tracking-tight">
              {winner ? Math.round(winner.targetAmount).toLocaleString() : '—'}
            </span>
          </div>

          <div className="space-y-2.5 text-sm">
            <Row label="You send" value={`$${amount.toFixed(2)} USD`} />
            <Row
              label="Exchange rate"
              value={winner ? `1 USD = ${winner.exchangeRate.toFixed(4)} PHP` : '—'}
            />
            <Row
              label={winner?.provider ? `${winner.provider} fee` : 'Provider fee'}
              value={winner ? `$${winner.fee.toFixed(2)}` : '—'}
            />
            <div className="border-t border-dashed border-border pt-2.5" />
            <Row
              label={<span className="font-bold text-foreground">You pay total</span>}
              value={
                <span className="font-bold text-foreground text-base">
                  ${totalCost.toFixed(2)}
                </span>
              }
            />
          </div>

          <div className="mt-5 flex items-center gap-2 rounded-xl bg-teal/10 border border-teal/20 px-3 py-2.5">
            <Shield className="h-3.5 w-3.5 text-teal shrink-0" />
            <span className="text-[11px] text-teal/90 leading-snug">
              Best-price guarantee · Rate refunded if a competitor is cheaper today
            </span>
          </div>
        </div>
      </div>

      {quoteError && (
        <div className="mb-4 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm px-4 py-3">
          {quoteError}
        </div>
      )}
      {error && (
        <div className="mb-4 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm px-4 py-3">
          {error}
        </div>
      )}

      <div className="grid gap-3">
        <button
          type="button"
          onClick={handleConfirm}
          disabled={!winner || submitting}
          className="w-full h-12 rounded-full bg-coral text-white font-semibold hover:brightness-110 transition-all active:scale-[0.98] shadow-glow-coral disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? 'Creating transfer…' : 'Confirm and continue to payment'}
        </button>
        <Link
          href={`/send/recipient?amount=${amount}&payout=${payout}`}
          className="flex items-center justify-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3 w-3" />
          Back to recipient
        </Link>
      </div>

      <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground justify-center">
        <CheckCircle2 className="h-3 w-3 text-teal" />
        We compared 5 providers. You're getting the best available rate today.
      </div>
    </div>
  )
}

function Row({ label, value }: { readonly label: React.ReactNode; readonly value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-foreground font-mono tabular-nums">{value}</span>
    </div>
  )
}
