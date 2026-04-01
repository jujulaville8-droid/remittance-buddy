import { createClient } from '@/lib/supabase/server'
import { db, recipients } from '@remit/db'
import { eq, and } from 'drizzle-orm'
import { z } from 'zod'

const UpdateRecipientSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  nickname: z.string().max(100).nullable().optional(),
  country: z.string().length(2).optional(),
  bankAccount: z
    .object({
      type: z.string().min(1),
      details: z.record(z.string()),
    })
    .optional(),
  isDefault: z.boolean().optional(),
})

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const userId = user.id

  const { id } = await params

  const record = await db.query.recipients.findFirst({
    where: and(eq(recipients.id, id), eq(recipients.userId, userId)),
  })

  if (!record) {
    return Response.json({ error: 'Not found' }, { status: 404 })
  }

  return Response.json(record)
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const userId = user.id

  const { id } = await params

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = UpdateRecipientSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: 'Invalid request', details: parsed.error.flatten() }, { status: 422 })
  }

  // Verify ownership
  const existing = await db.query.recipients.findFirst({
    where: and(eq(recipients.id, id), eq(recipients.userId, userId)),
  })
  if (!existing) {
    return Response.json({ error: 'Not found' }, { status: 404 })
  }

  const { isDefault, ...rest } = parsed.data

  // If setting as default, clear existing defaults first
  if (isDefault) {
    await db
      .update(recipients)
      .set({ isDefault: false })
      .where(and(eq(recipients.userId, userId), eq(recipients.isDefault, true)))
  }

  const updates: Record<string, unknown> = {
    ...rest,
    updatedAt: new Date(),
  }
  if (isDefault !== undefined) updates.isDefault = isDefault

  const [updated] = await db
    .update(recipients)
    .set(updates)
    .where(and(eq(recipients.id, id), eq(recipients.userId, userId)))
    .returning()

  return Response.json(updated)
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const userId = user.id

  const { id } = await params

  const deleted = await db
    .delete(recipients)
    .where(and(eq(recipients.id, id), eq(recipients.userId, userId)))
    .returning()

  if (deleted.length === 0) {
    return Response.json({ error: 'Not found' }, { status: 404 })
  }

  return new Response(null, { status: 204 })
}
