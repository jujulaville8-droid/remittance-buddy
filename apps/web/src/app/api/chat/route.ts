import { auth } from '@clerk/nextjs/server'
import { streamText, convertToModelMessages, tool } from 'ai'
import { gateway } from '@ai-sdk/gateway'
import { db, users, transfers } from '@remit/db'
import { eq, desc } from 'drizzle-orm'
import { z } from 'zod'
import type { UIMessage } from 'ai'

export const maxDuration = 30

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Fetch user context to inform the AI
  const user = await db.query.users.findFirst({ where: eq(users.id, userId) })
  const kycStatus = user?.kycStatus ?? 'pending'
  const userName = user?.fullName ?? 'there'

  const { messages }: { messages: UIMessage[] } = await req.json()

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
4. If KYC is "approved", celebrate and walk them through making their first transfer
5. Answer questions about fees, rates, and supported countries

Be concise, warm, and speak in plain English. You can use Taglish (English + Tagalog) if the user does too.
Never fabricate exchange rates — use the check_kyc_status and get_transfer_history tools to get real data.
For initiate_transfer, confirm the details with the user before calling the tool.`,
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
          limit: z
            .number()
            .int()
            .min(1)
            .max(10)
            .default(5)
            .describe('Number of recent transfers to fetch'),
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
      initiate_transfer: tool({
        description:
          'Stub: confirm transfer details and instruct the user how to proceed. Does not execute the transfer.',
        inputSchema: z.object({
          sourceAmountCents: z
            .number()
            .int()
            .positive()
            .describe('Amount to send in cents (e.g. 50000 = $500.00)'),
          sourceCurrency: z.string().length(3).describe('Source currency code, e.g. USD'),
          targetCurrency: z.string().length(3).describe('Target currency code, e.g. PHP'),
          recipientName: z.string().describe('Full name of the recipient'),
          recipientCountry: z
            .string()
            .length(2)
            .describe('ISO-3166-1 alpha-2 country code of the recipient, e.g. PH'),
        }),
        execute: async ({
          sourceAmountCents,
          sourceCurrency,
          targetCurrency,
          recipientName,
          recipientCountry,
        }) => {
          const u = await db.query.users.findFirst({ where: eq(users.id, userId) })
          if (!u || u.kycStatus !== 'approved') {
            return {
              success: false,
              error: 'KYC_REQUIRED',
              message: 'Identity verification must be approved before initiating a transfer.',
            }
          }
          return {
            success: true,
            message: `Ready to send ${sourceCurrency} ${(sourceAmountCents / 100).toFixed(2)} to ${recipientName} in ${recipientCountry} (receiving ${targetCurrency}).`,
            nextStep:
              'Use the Send Money form on the dashboard to complete this transfer with recipient bank details.',
          }
        },
      }),
    },
  })

  return result.toUIMessageStreamResponse()
}
