import { auth } from '@clerk/nextjs/server'
import { streamText, convertToModelMessages, tool } from 'ai'
import { gateway } from '@ai-sdk/gateway'
import { db, users, transfers } from '@remit/db'
import { eq, desc } from 'drizzle-orm'
import { z } from 'zod'
import { randomUUID } from 'crypto'
import type { UIMessage } from 'ai'
import { createQuote } from '@/lib/wise'
import { getOrCreateCustomer, createCheckoutSession } from '@/lib/stripe'
import { chatRateLimiter } from '@/lib/rate-limit'
import { logAuditEvent } from '@/lib/audit'

export const maxDuration = 30

const messagesSchema = z.array(
  z.object({
    id: z.string(),
    role: z.enum(['user', 'assistant', 'system', 'tool']),
    parts: z.array(z.record(z.unknown())).optional(),
    content: z.string().optional(),
  }),
)

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Rate limit: 10 chat requests per minute per user (AI calls are expensive)
  const { success } = await chatRateLimiter.limit(userId)
  if (!success) {
    return Response.json({ error: 'Too many requests. Please slow down.' }, { status: 429 })
  }

  const user = await db.query.users.findFirst({ where: eq(users.id, userId) })
  const kycStatus = user?.kycStatus ?? 'pending'
  const userName = user?.fullName ?? 'there'

  let messages: UIMessage[]
  try {
    const body = await req.json()
    const parsed = messagesSchema.safeParse(body?.messages)
    if (!parsed.success) {
      return Response.json({ error: 'Invalid request body' }, { status: 400 })
    }
    messages = parsed.data as UIMessage[]
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const result = streamText({
    model: gateway('anthropic/claude-sonnet-4.6'),
    system: `You are the Remittance Buddy onboarding assistant — a friendly guide helping ${userName} get set up to send money internationally.

Current user state:
- KYC status: ${kycStatus}
- Account: ${user ? 'set up' : 'not yet created'}

Your onboarding flow:
1. Welcome the user and confirm their account is created
2. If KYC is "pending" or "rejected", guide them to complete identity verification at /kyc
3. If KYC is "in_review", explain it's being processed and they will be notified
4. If KYC is "approved", help them make a transfer:
   a. Ask who they want to send money to, how much, and in what currency
   b. Use get_quote to show the live exchange rate and fees before asking for bank details
   c. Confirm the quote details with the user
   d. Ask for the recipient's bank account details (type like "iban", "sort_code", "aba", or "philippines", plus the required fields)
   e. Call initiate_transfer to create the transfer and generate a payment link
   f. Share the payment link and let the user know they can check status with check_transfer_status
5. Use check_transfer_status to update the user on an in-progress transfer

Be concise, warm, and speak in plain English. You can use Taglish (English + Tagalog) if the user does too.
Never fabricate exchange rates — always call get_quote for real rates.
Always confirm all transfer details with the user before calling initiate_transfer.`,
    messages: await convertToModelMessages(messages),
    tools: {
      check_kyc_status: tool({
        description: 'Check the current KYC (identity verification) status for the user.',
        inputSchema: z.object({}),
        execute: async () => {
          const u = await db.query.users.findFirst({ where: eq(users.id, userId) })
          return {
            kycStatus: u?.kycStatus ?? 'pending',
            fullName: u?.fullName,
            countryOfResidence: u?.countryOfResidence,
          }
        },
      }),

      get_transfer_history: tool({
        description: 'Retrieve recent transfer history for the user.',
        inputSchema: z.object({
          limit: z.number().int().min(1).max(10).default(5),
        }),
        execute: async ({ limit }) => {
          const rows = await db.query.transfers.findMany({
            where: eq(transfers.senderId, userId),
            orderBy: [desc(transfers.createdAt)],
            limit,
          })
          return rows.map((t) => ({
            id: t.id,
            status: t.status,
            sourceCurrency: t.sourceCurrency,
            sourceAmountCents: t.sourceAmountCents,
            targetCurrency: t.targetCurrency,
            targetAmountCents: t.targetAmountCents,
            recipientName: t.recipientName,
            recipientCountry: t.recipientCountry,
            createdAt: t.createdAt,
          }))
        },
      }),

      get_quote: tool({
        description:
          'Get a live FX quote from Wise showing the exchange rate, fees, and how much the recipient will receive. Call this before confirming a transfer.',
        inputSchema: z.object({
          sourceAmountCents: z
            .number()
            .int()
            .positive()
            .describe('Amount to send in cents (e.g. 50000 = $500.00)'),
          sourceCurrency: z.string().length(3).describe('Source currency code, e.g. USD'),
          targetCurrency: z.string().length(3).describe('Target currency code, e.g. PHP'),
        }),
        execute: async ({ sourceAmountCents, sourceCurrency, targetCurrency }) => {
          const profileId = process.env.WISE_PROFILE_ID
          if (!profileId) {
            return {
              success: false,
              error: 'WISE_NOT_CONFIGURED',
              message: 'Exchange rate service is not configured. Please contact support.',
            }
          }
          try {
            const quote = await createQuote({
              profileId,
              sourceCurrency,
              targetCurrency,
              sourceAmount: sourceAmountCents / 100,
            })
            const feeCents = Math.round((quote.fee?.total ?? 0) * 100)
            const targetAmountCents = Math.round(quote.targetAmount * 100)
            return {
              success: true,
              sourceCurrency,
              sourceAmount: sourceAmountCents / 100,
              targetCurrency,
              targetAmount: targetAmountCents / 100,
              fxRate: quote.rate,
              feeCents,
              feeFormatted: `${sourceCurrency} ${(feeCents / 100).toFixed(2)}`,
              totalToPayCents: sourceAmountCents + feeCents,
              totalToPayFormatted: `${sourceCurrency} ${((sourceAmountCents + feeCents) / 100).toFixed(2)}`,
            }
          } catch (err) {
            return {
              success: false,
              error: 'WISE_ERROR',
              message: err instanceof Error ? err.message : 'Failed to get exchange rate.',
            }
          }
        },
      }),

      initiate_transfer: tool({
        description:
          'Create a transfer record and generate a Stripe payment link. Call this only after confirming all details with the user. Returns a paymentUrl the user must visit to complete payment.',
        inputSchema: z.object({
          sourceAmountCents: z
            .number()
            .int()
            .positive()
            .describe('Amount to send in cents'),
          sourceCurrency: z.string().length(3),
          targetCurrency: z.string().length(3),
          recipientName: z.string().describe('Full name of the recipient'),
          recipientCountry: z.string().length(2).describe('ISO 3166-1 alpha-2 country code, e.g. PH'),
          recipientAccountType: z
            .string()
            .describe('Wise account type, e.g. "iban", "sort_code", "aba", "philippines"'),
          recipientAccountDetails: z
            .record(z.string())
            .describe('Account fields as key-value pairs, e.g. {"accountNumber": "123"}'),
        }),
        execute: async ({
          sourceAmountCents,
          sourceCurrency,
          targetCurrency,
          recipientName,
          recipientCountry,
          recipientAccountType,
          recipientAccountDetails,
        }) => {
          const u = await db.query.users.findFirst({ where: eq(users.id, userId) })
          if (!u || u.kycStatus !== 'approved') {
            return {
              success: false,
              error: 'KYC_REQUIRED',
              message: 'Identity verification must be approved before initiating a transfer.',
            }
          }

          const profileId = process.env.WISE_PROFILE_ID
          if (!profileId) {
            return {
              success: false,
              error: 'WISE_NOT_CONFIGURED',
              message: 'Transfer service is not configured. Please contact support.',
            }
          }

          // Get fresh quote for accurate amounts
          let fxRate = '1'
          let feeCents = 0
          let targetAmountCents = 0
          try {
            const quote = await createQuote({
              profileId,
              sourceCurrency,
              targetCurrency,
              sourceAmount: sourceAmountCents / 100,
            })
            fxRate = String(quote.rate)
            feeCents = Math.round((quote.fee?.total ?? 0) * 100)
            targetAmountCents = Math.round(quote.targetAmount * 100)
          } catch (err) {
            return {
              success: false,
              error: 'WISE_QUOTE_FAILED',
              message:
                err instanceof Error
                  ? err.message
                  : 'Failed to get exchange rate. Please try again.',
            }
          }

          // Create transfer record in 'quote' status (Wise transfer created after payment)
          const idempotencyKey = randomUUID()
          const [record] = await db
            .insert(transfers)
            .values({
              senderId: userId,
              sourceCurrency,
              sourceAmountCents,
              targetCurrency,
              targetAmountCents,
              fxRate,
              feeCents,
              recipientName,
              recipientCountry,
              recipientBankAccount: { type: recipientAccountType, details: recipientAccountDetails },
              status: 'quote',
              provider: 'wise',
              idempotencyKey,
            })
            .returning()

          if (!record) {
            return { success: false, error: 'DB_ERROR', message: 'Failed to create transfer.' }
          }

          // Create Stripe Checkout Session
          try {
            const customerId = await getOrCreateCustomer(userId, u.email)
            const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
            const session = await createCheckoutSession({
              amountCents: sourceAmountCents + feeCents,
              currency: sourceCurrency,
              customerId,
              transferId: record.id,
              idempotencyKey,
              recipientName,
              successUrl: `${appUrl}/pay/${record.id}/success`,
              cancelUrl: `${appUrl}/onboard`,
            })

            await logAuditEvent({
              userId,
              action: 'transfer.initiated_via_chat',
              entityType: 'transfer',
              entityId: record.id,
              metadata: {
                sourceCurrency,
                sourceAmountCents,
                targetCurrency,
                recipientCountry,
                provider: 'wise',
              },
            })

            return {
              success: true,
              transferId: record.id,
              paymentUrl: session.url,
              summary: {
                from: `${sourceCurrency} ${(sourceAmountCents / 100).toFixed(2)}`,
                to: `${targetAmountCents / 100} ${targetCurrency}`,
                fee: `${sourceCurrency} ${(feeCents / 100).toFixed(2)}`,
                total: `${sourceCurrency} ${((sourceAmountCents + feeCents) / 100).toFixed(2)}`,
                recipient: recipientName,
                country: recipientCountry,
              },
            }
          } catch (err) {
            // Rollback transfer record on Stripe failure
            await db.delete(transfers).where(eq(transfers.id, record.id))
            return {
              success: false,
              error: 'STRIPE_ERROR',
              message:
                err instanceof Error
                  ? err.message
                  : 'Failed to create payment session. Please try again.',
            }
          }
        },
      }),

      check_transfer_status: tool({
        description:
          'Check the current status of a transfer by its ID. Use after the user has initiated a transfer.',
        inputSchema: z.object({
          transferId: z.string().uuid().describe('The transfer ID returned by initiate_transfer'),
        }),
        execute: async ({ transferId }) => {
          const transfer = await db.query.transfers.findFirst({
            where: eq(transfers.id, transferId),
          })

          if (!transfer || transfer.senderId !== userId) {
            return { success: false, error: 'NOT_FOUND', message: 'Transfer not found.' }
          }

          const statusMessages: Record<string, string> = {
            quote: 'Awaiting payment. Please complete your payment to send this transfer.',
            pending: 'Payment received — preparing your transfer.',
            processing: 'Your transfer is being processed by Wise.',
            completed: 'Transfer completed! The funds have been sent to the recipient.',
            failed: 'Transfer failed. Please contact support.',
            cancelled: 'Transfer was cancelled.',
          }

          return {
            success: true,
            transferId: transfer.id,
            status: transfer.status,
            statusMessage: statusMessages[transfer.status] ?? 'Unknown status.',
            sourceAmount: `${transfer.sourceCurrency} ${(transfer.sourceAmountCents / 100).toFixed(2)}`,
            targetAmount: `${(transfer.targetAmountCents / 100).toFixed(2)} ${transfer.targetCurrency}`,
            recipientName: transfer.recipientName,
            createdAt: transfer.createdAt,
          }
        },
      }),
    },
  })

  return result.toUIMessageStreamResponse()
}
