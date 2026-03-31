import { auth } from '@clerk/nextjs/server'
import { db, users, transfers } from '@remit/db'
import { eq, desc } from 'drizzle-orm'
import Link from 'next/link'

const KYC_LABELS = {
  pending: { label: 'Not verified', color: 'text-yellow-500', action: true },
  in_review: { label: 'Under review', color: 'text-blue-500', action: false },
  approved: { label: 'Verified', color: 'text-green-500', action: false },
  rejected: { label: 'Rejected — contact support', color: 'text-destructive', action: false },
} as const

const TRANSFER_STATUS_LABELS: Record<
  string,
  { label: string; className: string }
> = {
  quote: { label: 'Awaiting payment', className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
  pending: { label: 'Processing', className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  processing: { label: 'In transit', className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  completed: { label: 'Completed', className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  failed: { label: 'Failed', className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  cancelled: { label: 'Cancelled', className: 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400' },
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date)
}

export default async function DashboardPage() {
  const { userId } = await auth()
  if (!userId) return null

  const [user, recentTransfers] = await Promise.all([
    db.query.users.findFirst({ where: eq(users.id, userId) }),
    db.query.transfers.findMany({
      where: eq(transfers.senderId, userId),
      orderBy: [desc(transfers.createdAt)],
      limit: 10,
    }),
  ])

  const kycStatus = user?.kycStatus ?? 'pending'
  const kycMeta = KYC_LABELS[kycStatus]

  return (
    <main className="p-8 max-w-3xl">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="text-muted-foreground mt-1 text-sm">Welcome back, {user?.fullName ?? userId}</p>

      {/* KYC status banner */}
      <div className="mt-6 flex items-center justify-between rounded-lg border p-4">
        <div>
          <p className="text-sm font-medium">Identity verification</p>
          <p className={`mt-0.5 text-xs ${kycMeta.color}`}>{kycMeta.label}</p>
        </div>
        {kycMeta.action && (
          <Link
            href="/kyc"
            className="bg-primary text-primary-foreground rounded px-3 py-1.5 text-xs font-medium"
          >
            Verify now
          </Link>
        )}
      </div>

      {/* AI onboarding assistant */}
      <div className="mt-4 flex items-center justify-between rounded-lg border p-4">
        <div>
          <p className="text-sm font-medium">AI onboarding assistant</p>
          <p className="text-muted-foreground mt-0.5 text-xs">
            Get personalised help setting up your account and making your first transfer
          </p>
        </div>
        <Link
          href="/onboard"
          className="bg-primary text-primary-foreground rounded px-3 py-1.5 text-xs font-medium"
        >
          {recentTransfers.length === 0 ? 'Get started' : 'Send money'}
        </Link>
      </div>

      {/* Transfer history */}
      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">Transfer history</h2>
          {recentTransfers.length > 0 && (
            <Link href="/transfers" className="text-xs text-primary hover:underline">
              View all →
            </Link>
          )}
        </div>

        {recentTransfers.length === 0 ? (
          <div className="mt-3 rounded-lg border border-dashed p-8 text-center">
            <p className="text-sm text-muted-foreground">No transfers yet.</p>
            <Link
              href="/onboard"
              className="mt-3 inline-block text-xs font-medium text-primary hover:underline"
            >
              Start your first transfer →
            </Link>
          </div>
        ) : (
          <div className="mt-3 divide-y rounded-lg border">
            {recentTransfers.map((transfer) => {
              const statusMeta = TRANSFER_STATUS_LABELS[transfer.status] ?? {
                label: transfer.status,
                className: 'bg-zinc-100 text-zinc-500',
              }
              return (
                <div key={transfer.id} className="flex items-center justify-between px-4 py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{transfer.recipientName}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {transfer.sourceCurrency} {(transfer.sourceAmountCents / 100).toFixed(2)}
                      {' → '}
                      {(transfer.targetAmountCents / 100).toFixed(2)} {transfer.targetCurrency}
                      {' · '}
                      {formatDate(new Date(transfer.createdAt))}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 ml-4 shrink-0">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusMeta.className}`}
                    >
                      {statusMeta.label}
                    </span>
                    {transfer.status === 'quote' ? (
                      <Link
                        href="/onboard"
                        className="text-xs text-primary hover:underline"
                      >
                        Complete
                      </Link>
                    ) : (
                      <Link
                        href={`/transfers/${transfer.id}`}
                        className="text-xs text-primary hover:underline"
                      >
                        Details →
                      </Link>
                    )}
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
