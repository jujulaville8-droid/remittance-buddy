import { auth } from '@clerk/nextjs/server'
import { db, users } from '@remit/db'
import { eq } from 'drizzle-orm'

export async function GET() {
  const { userId } = await auth()
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await db.query.users.findFirst({ where: eq(users.id, userId) })
  if (!user) {
    return Response.json({ error: 'User not found' }, { status: 404 })
  }

  return Response.json(user)
}
