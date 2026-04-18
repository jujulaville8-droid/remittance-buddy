import { getAuthUser } from '@/lib/supabase/auth-helper'
import { streamText, convertToModelMessages, tool, stepCountIs } from 'ai'
import type { UIMessage } from 'ai'
import { z } from 'zod'
import { chatRateLimiter } from '@/lib/rate-limit'
import { db, users } from '@remit/db'
import { eq } from 'drizzle-orm'
import { fetchAllQuotes } from '@remit/api'

type PayoutFilter = 'all' | 'gcash' | 'cash_pickup' | 'fast'

/**
 * Compare providers using the same live-quote aggregator the /compare
 * tool uses. The payout filter maps the chat's user-facing filter to
 * the underlying payoutMethod param; `fast` post-filters by delivery
 * speed since it's not a payout method per se.
 */
async function computeComparison(amountUsd: number, filter: PayoutFilter = 'all') {
  const payoutMethod: 'gcash' | 'bank' | 'cash_pickup' =
    filter === 'gcash'
      ? 'gcash'
      : filter === 'cash_pickup'
        ? 'cash_pickup'
        : 'bank' // default — widest coverage

  let result
  try {
    result = await fetchAllQuotes({
      corridor: 'US-PH',
      sourceCurrency: 'USD',
      targetCurrency: 'PHP',
      sourceAmount: amountUsd,
      payoutMethod,
    })
  } catch (err) {
    console.warn('[chat] quote fetch failed:', err)
    return {
      recommended: null,
      alternatives: [],
      savings: null,
      error: 'Rates unavailable right now. Try again in a moment.',
    }
  }

  let providers = result.quotes.map((q) => ({
    provider: q.provider,
    rate: Number(q.exchangeRate.toFixed(2)),
    fee: Number(q.fee.toFixed(2)),
    speed: q.deliveryTime,
    gcash: payoutMethod === 'gcash' || q.supportsGcash === true,
    cashPickup: payoutMethod === 'cash_pickup' || q.supportsCashPickup === true,
    trust: q.trustScore ?? 7,
    receiveAmount: Math.round(q.targetAmount),
    totalCost: Number((amountUsd + q.fee).toFixed(2)),
    sendAmount: amountUsd,
  }))

  if (filter === 'fast') {
    providers = providers.filter((p) => /min/i.test(p.speed))
  }

  const sorted = [...providers].sort((a, b) => b.receiveAmount - a.receiveAmount)
  const best = sorted[0]
  const worst = sorted[sorted.length - 1]

  return {
    recommended: best
      ? {
          ...best,
          reason: `Best value — recipient gets the most pesos (₱${best.receiveAmount.toLocaleString()})`,
        }
      : null,
    alternatives: sorted.slice(1, 4).map((p) => ({ ...p })),
    savings:
      best && worst
        ? {
            feeSaved: worst.totalCost - best.totalCost,
            extraPesos: best.receiveAmount - worst.receiveAmount,
          }
        : null,
  }
}

export const maxDuration = 30

function getCorsHeaders(origin: string | null): Record<string, string> {
  if (!origin || !origin.startsWith('chrome-extension://')) return {};
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

export async function OPTIONS(req: Request) {
  const origin = req.headers.get('origin');
  return new Response(null, { status: 204, headers: getCorsHeaders(origin) });
}

const messagesSchema = z.array(
  z.object({
    id: z.string(),
    role: z.enum(['user', 'assistant', 'system', 'tool']),
    parts: z.array(z.record(z.unknown())).optional(),
    content: z.string().optional(),
  }),
)

export async function POST(req: Request) {
  try {
  const authUser = await getAuthUser(req)
  if (!authUser) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const userId = authUser.id

  // Rate limit (skipped if Redis not configured)
  const { success } = await chatRateLimiter.limit(userId)
  if (!success) {
    return Response.json({ error: 'Too many requests. Please slow down.' }, { status: 429 })
  }

  // Look up user from DB for KYC status; fall back to auth metadata
  const fallbackName = authUser.user_metadata?.full_name ?? authUser.email?.split('@')[0] ?? 'there'
  let kycStatus = 'pending'
  let userName = fallbackName
  try {
    const dbUser = await db.query.users.findFirst({ where: eq(users.id, userId) })
    if (dbUser) {
      kycStatus = dbUser.kycStatus
      userName = dbUser.fullName ?? fallbackName
    }
  } catch {
    // DB unavailable — continue with defaults
  }

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
    model: 'anthropic/claude-haiku-4.5',
    system: `You are Remittance Buddy — a friendly AI that helps people compare remittance rates and send money home to the Philippines.

You are talking to ${userName}.

You have a compareProviders tool that shows visual comparison cards to the user. Use it when it adds value:
- User mentions a specific dollar amount to send
- User asks to compare providers or rates
- User changes criteria (e.g. "what about GCash only?" or "show me the fastest")
- A visual comparison would help the user decide

Do NOT call the tool when:
- User asks a general question (e.g. "what is GCash?", "what documents do I need?")
- You already showed a comparison and the user is asking a follow-up that doesn't need new data
- The conversation is casual/greeting

When you call the tool, add 1-2 sentences after with your recommendation and tradeoffs. Don't repeat numbers — the cards show those.

You do NOT have rate data in your memory. If the user asks about rates or amounts, you MUST call the tool — never guess numbers.

GENERAL KNOWLEDGE (answer without the tool):
- GCash is the #1 wallet in PH (90M+ users). Most providers support it except Wise.
- Cash pickup locations: Cebuana Lhuillier (6,000+), M Lhuillier (3,000+), SM, 7-Eleven, LBC
- Documents: Government ID. Over $3,000 may need proof of address.
- Maya/PayMaya is #2 wallet. Supported by Remitly, WorldRemit, Xoom.
- OFW remittances are tax-exempt in PH.

STYLE:
- Be brief and helpful. Speak Taglish if the user does.
- Lead with recommendations, not data dumps.`,
    tools: {
      compareProviders: tool({
        description: 'Compare remittance providers for a given USD amount. MUST be called whenever the user mentions any dollar amount, asks to compare, or asks about rates/fees. Returns structured visual cards.',
        inputSchema: z.object({
          amountUsd: z.number().describe('The amount in USD to send'),
          filter: z.enum(['all', 'gcash', 'cash_pickup', 'fast']).optional().describe('Optional filter: gcash (GCash only), cash_pickup (cash pickup only), fast (instant delivery only)'),
        }),
        execute: async ({ amountUsd, filter }) => {
          return await computeComparison(amountUsd, (filter ?? 'all') as PayoutFilter)
        },
      }),
    },
    toolChoice: 'auto',
    stopWhen: stepCountIs(2),
    messages: await convertToModelMessages(messages),
  })

  const corsHeaders = getCorsHeaders(req.headers.get('origin'));
  const response = result.toUIMessageStreamResponse();

  for (const [key, value] of Object.entries(corsHeaders)) {
    response.headers.set(key, value);
  }

  return response;
  } catch (error) {
    console.error('[chat] Error:', error);
    return Response.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
  }
}
