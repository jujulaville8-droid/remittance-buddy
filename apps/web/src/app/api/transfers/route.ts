import { auth } from '@clerk/nextjs/server'
import { db, transfers, users } from '@remit/db'
import { eq } from 'drizzle-orm'

export async function GET() {
  const { userId } = await auth()
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const rows = await db.query.transfers.findMany({
    where: eq(transfers.senderId, userId),
    orderBy: (t, { desc }) => [desc(t.createdAt)],
    limit: 50,
  })

  return Response.json(rows)
}

export async function POST() {
  const { userId } = await auth()
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // KYC gate — user must be approved before initiating transfers
  const user = await db.query.users.findFirst({ where: eq(users.id, userId) })
  if (!user) {
    return Response.json({ error: 'User not found' }, { status: 404 })
  }
  if (user.kycStatus !== 'approved') {
    return Response.json(
      {
        error: 'KYC_REQUIRED',
        message: 'Complete identity verification before sending money.',
        kycStatus: user.kycStatus,
      },
      { status: 403 },
    )
  }

  // Full transfer creation implemented in REM-5 (Wise integration)
  return Response.json({ error: 'Not implemented' }, { status: 501 })
}
