import { createClient } from '@/lib/supabase/server'
import { db, transfers, users } from '@remit/db'
import { and, eq } from 'drizzle-orm'
import { z } from 'zod'
import { createQuote, createRecipient, createTransfer } from '@/lib/wise'
import { transferRateLimiter } from '@/lib/rate-limit'
import { logAuditEvent, getClientIp } from '@/lib/audit'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const userId = user.id

  const rows = await db.query.transfers.findMany({
    where: eq(transfers.senderId, userId),
    orderBy: (t, { desc }) => [desc(t.createdAt)],
    limit: 50,
  })

  return Response.json(rows)
}

const CreateTransferSchema = z.object({
  sourceCurrency: z.string().length(3),
  targetCurrency: z.string().length(3),
  sourceAmountCents: z.number().int().positive(),
  recipientName: z.string().min(1),
  recipientCountry: z.string().length(2),
  recipientBankAccount: z.object({
    type: z.string(),
    details: z.record(z.string()),
  }),
  idempotencyKey: z.string().uuid(),
  reference: z.string().max(100).optional(),
})

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const userId = authUser.id

  const { success } = await transferRateLimiter.limit(userId)
  if (!success) {
    return Response.json({ error: 'Too many transfer requests. Please slow down.' }, { status: 429 })
  }

  // KYC gate
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

  const body = await req.json()
  const parsed = CreateTransferSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: 'Invalid request', details: parsed.error.flatten() }, { status: 400 })
  }

  const input = parsed.data
  const profileId = process.env.WISE_PROFILE_ID
  if (!profileId) {
    return Response.json({ error: 'Wise profile not configured' }, { status: 500 })
  }

  // Idempotency check — return existing transfer if key already used
  const existing = await db.query.transfers.findFirst({
    where: and(
      eq(transfers.idempotencyKey, input.idempotencyKey),
      eq(transfers.senderId, userId),
    ),
  })
  if (existing) {
    return Response.json(existing)
  }

  // 1. Get quote
  const quote = await createQuote({
    profileId,
    sourceCurrency: input.sourceCurrency,
    targetCurrency: input.targetCurrency,
    sourceAmount: input.sourceAmountCents / 100,
  })

  // 2. Create recipient
  const recipient = await createRecipient({
    profileId,
    currency: input.targetCurrency,
    type: input.recipientBankAccount.type,
    accountHolderName: input.recipientName,
    details: input.recipientBankAccount.details,
  })

  // 3. Create transfer
  const wiseTransfer = await createTransfer({
    targetAccountId: recipient.id,
    quoteUuid: quote.id,
    customerTransactionId: input.idempotencyKey,
    details: { reference: input.reference },
  })

  const feeCents = Math.round((quote.fee?.total ?? 0) * 100)
  const targetAmountCents = Math.round(quote.targetAmount * 100)

  // 4. Persist transfer record
  let record = existing
  try {
    const inserted = await db
      .insert(transfers)
      .values({
        senderId: userId,
        sourceCurrency: input.sourceCurrency,
        sourceAmountCents: input.sourceAmountCents,
        targetCurrency: input.targetCurrency,
        targetAmountCents,
        fxRate: String(quote.rate),
        feeCents,
        recipientName: input.recipientName,
        recipientCountry: input.recipientCountry,
        recipientBankAccount: input.recipientBankAccount,
        status: 'processing',
        provider: 'wise',
        providerTransferId: String(wiseTransfer.id),
        idempotencyKey: input.idempotencyKey,
      })
      .returning()
    record = inserted[0]
  } catch (err: unknown) {
    const code = (err as { code?: string })?.code
    if (code === '23505') {
      const dupe = await db.query.transfers.findFirst({
        where: and(
          eq(transfers.idempotencyKey, input.idempotencyKey),
          eq(transfers.senderId, userId),
        ),
      })
      if (dupe) return Response.json(dupe)
    }
    throw err
  }

  await logAuditEvent({
    userId,
    action: 'transfer.created',
    entityType: 'transfer',
    entityId: record?.id,
    metadata: {
      sourceCurrency: input.sourceCurrency,
      sourceAmountCents: input.sourceAmountCents,
      targetCurrency: input.targetCurrency,
      recipientCountry: input.recipientCountry,
      provider: 'wise',
    },
    ipAddress: getClientIp(req),
  })

  return Response.json(record, { status: 201 })
}
