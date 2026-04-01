import { createClient } from '@/lib/supabase/server'
import { db, recipients } from '@remit/db'
import { eq, and } from 'drizzle-orm'
import { z } from 'zod'

const CreateRecipientSchema = z.object({
  name: z.string().min(1).max(200),
  nickname: z.string().max(100).optional(),
  country: z.string().length(2),
  bankAccount: z.object({
    type: z.string().min(1),
    details: z.record(z.string()),
  }),
  isDefault: z.boolean().optional().default(false),
})

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const userId = user.id

  const rows = await db.query.recipients.findMany({
    where: eq(recipients.userId, userId),
    orderBy: (r, { desc }) => [desc(r.createdAt)],
  })

  return Response.json(rows)
}

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const userId = user.id

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = CreateRecipientSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: 'Invalid request', details: parsed.error.flatten() }, { status: 422 })
  }

  const { name, nickname, country, bankAccount, isDefault } = parsed.data

  // If setting as default, clear existing defaults first
  if (isDefault) {
    await db
      .update(recipients)
      .set({ isDefault: false })
      .where(and(eq(recipients.userId, userId), eq(recipients.isDefault, true)))
  }

  const [record] = await db
    .insert(recipients)
    .values({
      userId,
      name,
      nickname: nickname ?? null,
      country,
      bankAccount,
      isDefault,
    })
    .returning()

  return Response.json(record, { status: 201 })
}
