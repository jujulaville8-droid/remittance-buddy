import { createClient } from '@/lib/supabase/server'
import { db, users } from '@remit/db'
import { eq } from 'drizzle-orm'

export async function GET() {
  const supabase = await createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const userId = authUser.id

  const user = await db.query.users.findFirst({ where: eq(users.id, userId) })
  if (!user) {
    return Response.json({ error: 'User not found' }, { status: 404 })
  }

  return Response.json(user)
}
