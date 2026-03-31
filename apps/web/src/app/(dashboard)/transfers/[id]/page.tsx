import { auth } from '@clerk/nextjs/server'
import { db, transfers } from '@remit/db'
import { eq, and } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'

const TRANSFER_STATUS_LABELS: Record<string, { label: string; className: string }> = {
  quote: {
    label: 'Awaiting payment',
    className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  },
  pending: {
    label: 'Processing',
    className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  },
  processing: {
    label: 'In transit',
    className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  },
  completed: {
    label: 'Completed',
    className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  },
  failed: {
    label: 'Failed',
    className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  },
  cancelled: {
    label: 'Cancelled',
    className: 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400',
  },
}

// Ordered stages of a transfer lifecycle
const TIMELINE_STAGES: Array<{
  status: string
  label: string
  description: string
}> = [
  { status: 'quote', label: 'Quote created', description: 'Transfer quote was generated' },
  { status: 'pending', label: 'Payment received', description: 'Funds received and transfer queued' },
  { status: 'processing', label: 'In transit', description: 'Transfer is being processed by provider' },
  { status: 'completed', label: 'Delivered', description: 'Funds delivered to recipient' },
]

const TERMINAL_FAIL_STAGES: Array<{ status: string; label: string; description: string }> = [
  { status: 'failed', label: 'Transfer failed', description: 'An error occurred during processing' },
  { status: 'cancelled', label: 'Transfer cancelled', description: 'This transfer was cancelled' },
]

function formatDateTime(date: Date | string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

function TimelineItem({
  label,
  description,
  isCompleted,
  isActive,
  isFailed,
  isLast,
}: {
  label: string
  description: string
  isCompleted: boolean
  isActive: boolean
  isFailed: boolean
  isLast: boolean
}) {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 ${
            isFailed
              ? 'border-red-500 bg-red-500 text-white'
              : isCompleted || isActive
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-muted bg-background text-muted-foreground'
          }`}
        >
          {isFailed ? (
            <span className="text-xs font-bold">✕</span>
          ) : isCompleted ? (
            <span className="text-xs font-bold">✓</span>
          ) : isActive ? (
            <span className="h-2 w-2 rounded-full bg-primary-foreground" />
          ) : (
            <span className="h-2 w-2 rounded-full bg-muted-foreground/40" />
          )}
        </div>
        {!isLast && (
          <div
            className={`mt-1 w-0.5 flex-1 min-h-[2rem] ${isCompleted ? 'bg-primary' : 'bg-border'}`}
          />
        )}
      </div>
      <div className="pb-6">
        <p
          className={`text-sm font-medium ${
            isFailed
              ? 'text-red-500'
              : isCompleted || isActive
                ? 'text-foreground'
                : 'text-muted-foreground'
          }`}
        >
          {label}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}

export default async function TransferDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { userId } = await auth()
  if (!userId) return null

  const { id } = await params

  const transfer = await db.query.transfers.findFirst({
    where: and(eq(transfers.id, id), eq(transfers.senderId, userId)),
  })

  if (!transfer) notFound()

  const statusMeta = TRANSFER_STATUS_LABELS[transfer.status] ?? {
    label: transfer.status,
    className: 'bg-zinc-100 text-zinc-500',
  }

  const isFailed = transfer.status === 'failed' || transfer.status === 'cancelled'
  const statusOrder = ['quote', 'pending', 'processing', 'completed']
  const currentIdx = statusOrder.indexOf(transfer.status)

  // Build timeline items
  const timelineItems = TIMELINE_STAGES.map((stage, idx) => ({
    ...stage,
    isCompleted: !isFailed && idx < currentIdx,
    isActive: !isFailed && idx === currentIdx,
    isFailed: false,
  }))

  // If failed/cancelled, replace the last item with the failure stage
  const terminalStage = TERMINAL_FAIL_STAGES.find((s) => s.status === transfer.status)

  return (
    <main className="p-8 max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/transfers" className="text-sm text-muted-foreground hover:text-foreground">
          ← Transfers
        </Link>
      </div>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {formatCurrency(transfer.sourceAmountCents, transfer.sourceCurrency)}
            <span className="text-muted-foreground font-normal text-lg ml-2">
              → {formatCurrency(transfer.targetAmountCents, transfer.targetCurrency)}
            </span>
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            To {transfer.recipientName} · {transfer.recipientCountry}
          </p>
        </div>
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${statusMeta.className}`}
        >
          {statusMeta.label}
        </span>
      </div>

      {/* Transfer details */}
      <div className="mt-6 rounded-lg border divide-y">
        <div className="grid grid-cols-2 gap-4 px-4 py-3">
          <div>
            <p className="text-xs text-muted-foreground">You send</p>
            <p className="text-sm font-medium mt-0.5">
              {formatCurrency(transfer.sourceAmountCents, transfer.sourceCurrency)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Recipient gets</p>
            <p className="text-sm font-medium mt-0.5">
              {formatCurrency(transfer.targetAmountCents, transfer.targetCurrency)}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 px-4 py-3">
          <div>
            <p className="text-xs text-muted-foreground">FX rate</p>
            <p className="text-sm font-medium mt-0.5">
              1 {transfer.sourceCurrency} = {parseFloat(transfer.fxRate).toFixed(4)}{' '}
              {transfer.targetCurrency}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Fee</p>
            <p className="text-sm font-medium mt-0.5">
              {formatCurrency(transfer.feeCents, transfer.sourceCurrency)}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 px-4 py-3">
          <div>
            <p className="text-xs text-muted-foreground">Provider</p>
            <p className="text-sm font-medium mt-0.5 capitalize">{transfer.provider}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Created</p>
            <p className="text-sm font-medium mt-0.5">{formatDateTime(transfer.createdAt)}</p>
          </div>
        </div>
        {transfer.providerTransferId && (
          <div className="px-4 py-3">
            <p className="text-xs text-muted-foreground">Provider transfer ID</p>
            <p className="text-sm font-mono mt-0.5 text-muted-foreground">
              {transfer.providerTransferId}
            </p>
          </div>
        )}
        <div className="px-4 py-3">
          <p className="text-xs text-muted-foreground">Transfer ID</p>
          <p className="text-sm font-mono mt-0.5 text-muted-foreground">{transfer.id}</p>
        </div>
      </div>

      {/* Timeline */}
      <div className="mt-8">
        <h2 className="text-base font-semibold mb-4">Status timeline</h2>
        <div>
          {isFailed ? (
            <>
              {timelineItems.slice(0, 1).map((item) => (
                <TimelineItem
                  key={item.status}
                  {...item}
                  isLast={false}
                />
              ))}
              {terminalStage && (
                <TimelineItem
                  label={terminalStage.label}
                  description={terminalStage.description}
                  isCompleted={false}
                  isActive={false}
                  isFailed={true}
                  isLast={true}
                />
              )}
            </>
          ) : (
            timelineItems.map((item, idx) => (
              <TimelineItem
                key={item.status}
                {...item}
                isLast={idx === timelineItems.length - 1}
              />
            ))
          )}
        </div>
      </div>

      {/* Last updated */}
      <p className="mt-2 text-xs text-muted-foreground">
        Last updated {formatDateTime(transfer.updatedAt)}
      </p>
    </main>
  )
}
