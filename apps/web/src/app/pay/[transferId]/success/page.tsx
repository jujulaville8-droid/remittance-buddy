import { createClient } from '@/lib/supabase/server'
import { db, transfers } from '@remit/db'
import { eq } from 'drizzle-orm'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'

interface Props {
  params: Promise<{ transferId: string }>
}

export default async function PaymentSuccessPage({ params }: Props) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')
  const userId = user.id

  const { transferId } = await params

  const transfer = await db.query.transfers.findFirst({
    where: eq(transfers.id, transferId),
  })

  if (!transfer || transfer.senderId !== userId) notFound()

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6 rounded-2xl border bg-card p-8 text-card-foreground shadow-sm">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-950 dark:text-green-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-8 w-8"
            >
              <path
                fillRule="evenodd"
                d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>

        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-bold">Payment received!</h1>
          <p className="text-muted-foreground text-sm">
            Your transfer is being processed. We&apos;ll send it to{' '}
            <span className="font-medium text-foreground">{transfer.recipientName}</span> shortly.
          </p>
        </div>

        {/* Transfer summary */}
        <div className="rounded-lg border bg-muted/40 p-4 text-sm space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">You sent</span>
            <span className="font-medium">
              {transfer.sourceCurrency} {(transfer.sourceAmountCents / 100).toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Recipient gets</span>
            <span className="font-medium">
              {(transfer.targetAmountCents / 100).toFixed(2)} {transfer.targetCurrency}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Status</span>
            <span className="font-medium capitalize">{transfer.status}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Reference</span>
            <span className="font-mono text-xs text-muted-foreground">
              {transfer.id.slice(0, 8)}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Link
            href="/onboard"
            className="flex w-full items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Back to assistant
          </Link>
          <Link
            href="/dashboard"
            className="flex w-full items-center justify-center rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
          >
            Go to dashboard
          </Link>
        </div>
      </div>
    </main>
  )
}
