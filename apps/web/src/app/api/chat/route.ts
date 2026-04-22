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

const pageContextSchema = z
  .object({
    pathname: z.string().optional(),
    search: z.string().optional(),
    label: z.string().optional(),
    hints: z.record(z.string()).optional(),
  })
  .optional()

function describePage(ctx: z.infer<typeof pageContextSchema>): string {
  if (!ctx?.pathname) return 'Unknown — treat as generic help request.'
  const { pathname, search, label, hints } = ctx
  const parts: string[] = []
  parts.push(`URL: ${pathname}${search ?? ''}`)
  if (label) parts.push(`Section: ${label}`)

  const route =
    pathname === '/' ? 'landing'
    : pathname.startsWith('/compare') ? 'compare'
    : pathname.startsWith('/dashboard') ? 'dashboard'
    : pathname.startsWith('/family') ? 'family'
    : pathname.startsWith('/alerts') ? 'rate-alerts'
    : pathname.startsWith('/pricing') ? 'pricing'
    : pathname.startsWith('/sign-in') || pathname.startsWith('/sign-up') ? 'auth'
    : 'other'

  const routeHint: Record<string, string> = {
    landing: 'Marketing home page. User is evaluating whether to use Pal. Lead with value and offer to run a comparison.',
    compare: 'Live comparison tool. User is actively comparing providers. Use compareProviders tool liberally when amounts are mentioned.',
    dashboard: 'Signed-in dashboard. User is reviewing their activity. Summarize if asked; offer to rerun comparisons.',
    family: 'Family groups hub. User is managing shared recipients or pooled sends. Focus help on group setup, shared recipients, contribution tracking.',
    'rate-alerts': 'Rate alerts page. User is setting thresholds or reviewing alerts. Help them pick a sensible target rate using live data.',
    pricing: 'Buddy Plus pricing. User is evaluating premium tier. Help compare Free vs Plus benefits; do not pressure-sell.',
    auth: 'Sign-in/up flow. Answer sign-up or account questions only.',
    other: 'Generic page.',
  }
  parts.push(routeHint[route])

  if (hints && Object.keys(hints).length) {
    const pairs = Object.entries(hints).map(([k, v]) => `${k}=${v}`).join(', ')
    parts.push(`Page state: ${pairs}`)
  }
  return parts.join('\n')
}

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
  let pageContext: z.infer<typeof pageContextSchema>
  try {
    const body = await req.json()
    const parsed = messagesSchema.safeParse(body?.messages)
    if (!parsed.success) {
      return Response.json({ error: 'Invalid request body' }, { status: 400 })
    }
    messages = parsed.data as UIMessage[]
    const ctxParsed = pageContextSchema.safeParse(body?.pageContext)
    pageContext = ctxParsed.success ? ctxParsed.data : undefined
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const result = streamText({
    model: 'anthropic/claude-haiku-4.5',
    system: `You are Pal — the AI concierge for My Remittance Pal, a COMPARISON ENGINE for Filipino overseas workers sending money home.

CRITICAL POSITIONING:
- Pal does NOT send money. We compare 12+ remittance providers in real time and hand users off to the winner.
- Never imply we process, hold, or transmit money.
- When someone wants to send, the answer is: "I'll show you the cheapest route; you complete the send with that provider."

You are talking to ${userName}.

PAGE CONTEXT (where the user is right now):
${describePage(pageContext)}

Use this context:
- Tailor examples and suggestions to the page they're on.
- On /compare, be concrete and run the compareProviders tool generously.
- On the landing, nudge them to try a comparison — don't assume they know how it works.
- On /family or /alerts, help with that feature specifically.

TOOL USE — compareProviders:
Call it when:
- User mentions a specific dollar amount to send.
- User asks to compare providers or rates.
- User changes criteria ("what about GCash only?", "show me the fastest").

Do NOT call the tool for:
- General questions (GCash overview, docs, how the product works).
- Casual greetings.
- Follow-ups that don't need fresh data.

After a tool call, add 1-2 sentences with your pick and the trade-off. Don't repeat numbers — the cards already show them. If the user asks rate/amount questions, you MUST call the tool — never guess.

GENERAL KNOWLEDGE (no tool needed):
- GCash is the #1 wallet in PH (90M+ users); most providers support it except Wise.
- Cash pickup locations: Cebuana Lhuillier (6,000+), M Lhuillier (3,000+), SM, 7-Eleven, LBC.
- Docs usually needed: government ID. Over $3,000 often needs proof of address.
- Maya is #2 wallet — Remitly, WorldRemit, Xoom support it.
- OFW remittances are tax-exempt in PH.
- Rate alerts, family groups, and the /compare tool are free. Buddy Plus unlocks higher caps.

STYLE:
- Be brief. Speak Taglish if the user does.
- Lead with a recommendation, not a data dump.
- Never claim Pal can complete the transfer.`,
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
