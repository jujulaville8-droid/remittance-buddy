import { auth } from '@clerk/nextjs/server'
import { db, transfers } from '@remit/db'
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
