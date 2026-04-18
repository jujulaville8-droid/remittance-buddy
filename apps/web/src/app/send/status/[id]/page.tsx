'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Check,
  Clock,
  CreditCard,
  FileText,
  Send,
  Sparkles,
  User,
  X,
} from 'lucide-react'
import { transfersStore, type LocalTransfer, type LocalTransferStatus } from '@/lib/local-db'

// Mock state-machine progression timings (ms after transfer creation)
// In production these are driven by real rail webhook events.
const STATE_PROGRESSION: ReadonlyArray<{ at: number; status: LocalTransferStatus }> = [
  { at: 0, status: 'awaiting_payment' },
  { at: 3000, status: 'payment_received' },
  { at: 6000, status: 'processing' },
  { at: 10000, status: 'delivered' },
]

const STEP_LABELS: Record<LocalTransferStatus, { label: string; detail: string; icon: React.ComponentType<{ className?: string }> }> = {
  quote: { label: 'Quote locked', detail: 'Rate reserved for 30 minutes', icon: FileText },
  awaiting_payment: { label: 'Awaiting payment', detail: 'Waiting for your bank to confirm', icon: CreditCard },
  payment_received: { label: 'Payment received', detail: 'Funds cleared your bank', icon: Check },
  processing: { label: 'Processing transfer', detail: 'Routing through our partner network', icon: Send },
  delivered: { label: 'Delivered to GCash', detail: 'Your recipient received the money', icon: Sparkles },
  failed: { label: 'Failed', detail: 'The transfer could not complete', icon: X },
  cancelled: { label: 'Cancelled', detail: 'The transfer was cancelled', icon: X },
}

export default function StatusPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const [transfer, setTransfer] = useState<LocalTransfer | null>(null)

  useEffect(() => {
    const t = transfersStore.get(params.id)
    if (!t) {
      router.replace('/send/recipient')
      return
    }
    setTransfer(t)
  }, [params.id, router])

  // Mock the state machine progression via setTimeout
  // In production this would be replaced by polling or SSE from the rails webhook
  useEffect(() => {
    if (!transfer) return
    if (transfer.status === 'delivered' || transfer.status === 'failed') return

    const startedAt = new Date(transfer.createdAt).getTime()
    const elapsed = Date.now() - startedAt

    const timeouts: ReturnType<typeof setTimeout>[] = []
    for (const step of STATE_PROGRESSION) {
      if (step.at <= elapsed) continue
      const t = setTimeout(() => {
        const updated = transfersStore.updateStatus(transfer.id, step.status)
        if (updated) setTransfer(updated)
      }, step.at - elapsed)
      timeouts.push(t)
    }

    return () => {
      timeouts.forEach(clearTimeout)
    }
  }, [transfer])

  if (!transfer) {
    return <div className="text-center py-16 text-muted-foreground">Loading…</div>
  }

  const isDelivered = transfer.status === 'delivered'

  return (
    <div>
      <div className="text-xs font-bold uppercase tracking-[0.2em] text-coral mb-2">Step 3 of 3</div>
      <h1 className="font-display text-4xl lg:text-5xl leading-tight text-foreground mb-2 inline-flex items-center gap-3">
        {isDelivered ? (
          <>
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-teal text-white">
              <Check className="h-5 w-5" strokeWidth={2.25} />
            </span>
            Sent.
          </>
        ) : (
          'Sending your transfer.'
        )}
      </h1>
      <p className="text-muted-foreground mb-8">
        {isDelivered
          ? `${transfer.recipientName} received ₱${transfer.targetAmount.toLocaleString()} in their GCash.`
          : `Your ${transfer.provider} transfer is in progress. This usually takes a couple of minutes.`}
      </p>

      {/* Hero result */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden mb-5">
        <div className="bg-foreground text-background px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-coral" />
            <span className="text-xs font-bold uppercase tracking-widest">Transfer receipt</span>
          </div>
          <span className="text-[10px] font-mono text-background/60">
            #{transfer.id.slice(0, 8).toUpperCase()}
          </span>
        </div>

        <div className="p-5">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-coral/10 grid place-items-center text-coral">
              <User className="h-5 w-5" />
            </div>
            <div>
              <div className="font-semibold text-foreground">{transfer.recipientName}</div>
              <div className="text-xs text-muted-foreground">via {transfer.provider}</div>
            </div>
          </div>

          <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Recipient gets via GCash
          </div>
          <div className={`mt-0.5 flex items-baseline gap-1 text-coral ${isDelivered ? '' : 'opacity-70'}`}>
            <span className="font-display text-2xl leading-none">₱</span>
            <span className="font-display text-5xl leading-none tabular-nums tracking-tight">
              {transfer.targetAmount.toLocaleString()}
            </span>
          </div>

          <div className="mt-5 grid gap-2 text-xs text-muted-foreground">
            <div className="flex justify-between">
              <span>You sent</span>
              <span className="font-mono tabular-nums">${transfer.sourceAmount.toFixed(2)} USD</span>
            </div>
            <div className="flex justify-between">
              <span>Exchange rate</span>
              <span className="font-mono tabular-nums">
                1 USD = {transfer.exchangeRate.toFixed(4)} PHP
              </span>
            </div>
            <div className="flex justify-between">
              <span>Buddy service fee</span>
              <span className="font-mono tabular-nums">${transfer.buddyFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Total charged</span>
              <span className="font-mono font-bold text-foreground tabular-nums">
                ${transfer.totalCost.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Status timeline */}
      <div className="rounded-2xl border border-border bg-card p-5 mb-5">
        <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">
          Progress
        </div>
        <div className="space-y-3">
          {(['quote', 'awaiting_payment', 'payment_received', 'processing', 'delivered'] as const).map(
            (step, idx) => {
              const reached = transfer.statusHistory.some((h) => h.status === step)
              const isCurrent = transfer.status === step
              const meta = STEP_LABELS[step]
              const Icon = meta.icon
              return (
                <div key={step} className="flex items-start gap-3">
                  <div
                    className={`w-8 h-8 rounded-full grid place-items-center shrink-0 transition-all ${
                      reached
                        ? 'bg-teal text-white'
                        : isCurrent
                          ? 'bg-coral text-white animate-pulse'
                          : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div
                      className={`text-sm font-semibold ${
                        reached || isCurrent ? 'text-foreground' : 'text-muted-foreground'
                      }`}
                    >
                      {meta.label}
                    </div>
                    <div className="text-xs text-muted-foreground">{meta.detail}</div>
                  </div>
                  {idx < 4 && (
                    <div className="absolute" />
                  )}
                </div>
              )
            },
          )}
        </div>
      </div>

      {isDelivered ? (
        <div className="grid gap-3">
          <Link
            href="/send/recipient?amount=500&payout=gcash"
            className="flex items-center justify-center w-full h-12 rounded-full bg-coral text-white font-semibold hover:brightness-110 transition-all shadow-glow-coral"
          >
            Send again
          </Link>
          <Link
            href="/"
            className="flex items-center justify-center w-full h-12 rounded-full border border-border bg-card text-foreground font-semibold hover:bg-muted transition-colors"
          >
            Back to home
          </Link>
        </div>
      ) : (
        <div className="flex items-center gap-2 text-xs text-muted-foreground justify-center">
          <Clock className="h-3 w-3" />
          This page updates automatically. You can close it and come back anytime.
        </div>
      )}
    </div>
  )
}
