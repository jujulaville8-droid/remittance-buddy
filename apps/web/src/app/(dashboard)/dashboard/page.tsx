import { auth } from '@clerk/nextjs/server'
import { db, users } from '@remit/db'
import { eq } from 'drizzle-orm'
import Link from 'next/link'

const KYC_LABELS = {
  pending: { label: 'Not verified', color: 'text-yellow-500', action: true },
  in_review: { label: 'Under review', color: 'text-blue-500', action: false },
  approved: { label: 'Verified', color: 'text-green-500', action: false },
  rejected: { label: 'Rejected — contact support', color: 'text-destructive', action: false },
} as const

export default async function DashboardPage() {
  const { userId } = await auth()
  if (!userId) return null

  const user = await db.query.users.findFirst({ where: eq(users.id, userId) })
  const kycStatus = user?.kycStatus ?? 'pending'
  const kycMeta = KYC_LABELS[kycStatus]

  return (
    <main className="p-8">
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
          Get started
        </Link>
      </div>
    </main>
  )
}
