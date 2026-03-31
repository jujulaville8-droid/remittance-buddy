import { auth } from '@clerk/nextjs/server'
import { db, transfers, users } from '@remit/db'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { getOrCreateCustomer, createPaymentIntent } from '@/lib/stripe'

const Schema = z.object({
  transferId: z.string().uuid(),
})

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const parsed = Schema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: 'Invalid request', details: parsed.error.flatten() }, { status: 400 })
  }

  const { transferId } = parsed.data

  const [transfer, user] = await Promise.all([
    db.query.transfers.findFirst({ where: eq(transfers.id, transferId) }),
    db.query.users.findFirst({ where: eq(users.id, userId) }),
  ])

  if (!transfer || transfer.senderId !== userId) {
    return Response.json({ error: 'Transfer not found' }, { status: 404 })
  }

  if (!user) {
    return Response.json({ error: 'User not found' }, { status: 404 })
  }

  if (transfer.status !== 'quote' && transfer.status !== 'pending') {
    return Response.json(
      { error: 'Transfer is not in a fundable state', status: transfer.status },
      { status: 409 },
    )
  }

  const customerId = await getOrCreateCustomer(userId, user.email)

  const { clientSecret, paymentIntentId } = await createPaymentIntent({
    amountCents: transfer.sourceAmountCents + transfer.feeCents,
    currency: transfer.sourceCurrency,
    customerId,
    transferId,
    idempotencyKey: `pi-${transfer.idempotencyKey}`,
  })

  // Mark transfer as pending payment
  await db
    .update(transfers)
    .set({ status: 'pending', updatedAt: new Date() })
    .where(eq(transfers.id, transferId))

  return Response.json({ clientSecret, paymentIntentId })
}
