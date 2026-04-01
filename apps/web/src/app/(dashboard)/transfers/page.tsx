import { createClient } from '@/lib/supabase/server'
import { db, transfers } from '@remit/db'
import { eq, and, gte, lte, ilike, type SQL } from 'drizzle-orm'
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

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'quote', label: 'Awaiting payment' },
  { value: 'pending', label: 'Processing' },
  { value: 'processing', label: 'In transit' },
  { value: 'completed', label: 'Completed' },
  { value: 'failed', label: 'Failed' },
  { value: 'cancelled', label: 'Cancelled' },
]

function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date))
}

type SearchParams = { status?: string; from?: string; to?: string; recipient?: string }

export default async function TransfersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const userId = user.id

  const params = await searchParams
  const { status, from, to, recipient } = params

  const conditions: SQL[] = [eq(transfers.senderId, userId)]

  if (status && status in TRANSFER_STATUS_LABELS) {
    conditions.push(eq(transfers.status, status as 'quote' | 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'))
  }
  if (from) {
    const fromDate = new Date(from)
    if (!isNaN(fromDate.getTime())) {
      conditions.push(gte(transfers.createdAt, fromDate))
    }
  }
  if (to) {
    const toDate = new Date(to)
    if (!isNaN(toDate.getTime())) {
      // Include the full "to" day
      toDate.setHours(23, 59, 59, 999)
      conditions.push(lte(transfers.createdAt, toDate))
    }
  }
  if (recipient && recipient.trim()) {
    conditions.push(ilike(transfers.recipientName, `%${recipient.trim()}%`))
  }

  const rows = await db.query.transfers.findMany({
    where: and(...conditions),
    orderBy: (t, { desc }) => [desc(t.createdAt)],
    limit: 100,
  })

  const hasFilters = Boolean(status || from || to || recipient)

  return (
    <main className="p-8 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Transfer history</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {rows.length === 100 ? '100+ transfers' : `${rows.length} transfer${rows.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <Link
          href="/dashboard"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to dashboard
        </Link>
      </div>

      {/* Filters */}
      <form method="GET" className="mt-6 flex flex-wrap gap-3">
        <select
          name="status"
          defaultValue={status ?? ''}
          className="rounded-md border bg-background px-3 py-1.5 text-sm"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <input
          type="date"
          name="from"
          defaultValue={from ?? ''}
          className="rounded-md border bg-background px-3 py-1.5 text-sm"
          placeholder="From date"
        />
        <input
          type="date"
          name="to"
          defaultValue={to ?? ''}
          className="rounded-md border bg-background px-3 py-1.5 text-sm"
          placeholder="To date"
        />
        <input
          type="text"
          name="recipient"
          defaultValue={recipient ?? ''}
          className="rounded-md border bg-background px-3 py-1.5 text-sm min-w-[160px]"
          placeholder="Recipient name"
        />

        <button
          type="submit"
          className="rounded-md bg-primary text-primary-foreground px-3 py-1.5 text-sm font-medium"
        >
          Filter
        </button>
        {hasFilters && (
          <Link
            href="/transfers"
            className="rounded-md border px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            Clear
          </Link>
        )}
      </form>

      {/* Transfer list */}
      <div className="mt-6">
        {rows.length === 0 ? (
          <div className="rounded-lg border border-dashed p-12 text-center">
            <p className="text-sm text-muted-foreground">
              {hasFilters ? 'No transfers match your filters.' : 'No transfers yet.'}
            </p>
            {!hasFilters && (
              <Link
                href="/onboard"
                className="mt-3 inline-block text-xs font-medium text-primary hover:underline"
              >
                Start your first transfer →
              </Link>
            )}
          </div>
        ) : (
          <div className="divide-y rounded-lg border">
            {rows.map((transfer) => {
              const statusMeta = TRANSFER_STATUS_LABELS[transfer.status] ?? {
                label: transfer.status,
                className: 'bg-zinc-100 text-zinc-500',
              }
              return (
                <div key={transfer.id} className="flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{transfer.recipientName}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatCurrency(transfer.sourceAmountCents, transfer.sourceCurrency)}
                      {' → '}
                      {formatCurrency(transfer.targetAmountCents, transfer.targetCurrency)}
                      {' · '}
                      {formatDate(transfer.createdAt)}
                      {' · '}
                      {transfer.provider}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 ml-4 shrink-0">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusMeta.className}`}
                    >
                      {statusMeta.label}
                    </span>
                    <Link
                      href={`/transfers/${transfer.id}`}
                      className="text-xs text-primary hover:underline"
                    >
                      Details →
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
