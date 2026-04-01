import { getAuthUser } from '@/lib/supabase/auth-helper'
import { streamText, convertToModelMessages, tool, stepCountIs } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'
import { z } from 'zod'
import type { UIMessage } from 'ai'
import { chatRateLimiter } from '@/lib/rate-limit'

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

  // Use auth user info directly (DB connection not yet available via pooler)
  const kycStatus = 'approved'
  const userName = authUser.user_metadata?.full_name ?? authUser.email?.split('@')[0] ?? 'there'

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
    model: anthropic('claude-haiku-4-5-20251001'),
    system: `You are Remittance Buddy — a friendly AI that helps people compare remittance rates and send money home.

You are talking to ${userName}.

CRITICAL RULES:
- The MOMENT a user mentions an amount and a country/currency, IMMEDIATELY call compare_rates. Do NOT ask clarifying questions if you have enough info.
- "Send $500 to Philippines" = call compare_rates(500, "PHP") right away
- "600 usd" in context of Philippines = call compare_rates(600, "PHP") right away
- After getting results, summarize: cheapest option, how much they receive, GCash availability, and savings vs most expensive
- Be brief. 2-3 sentences max after showing results.
- You can speak Taglish if the user does.
- Never make up rates — always use compare_rates tool.`,
    messages: await convertToModelMessages(messages),
    stopWhen: stepCountIs(3),
    tools: {
      compare_rates: tool({
        description: 'Compare exchange rates across remittance providers for sending money. Returns rates from Remitly, Wise, Western Union, MoneyGram, Xoom, WorldRemit, and Pangea.',
        inputSchema: z.object({
          amount: z.number().positive().describe('Amount to send in USD'),
          targetCurrency: z.string().length(3).describe('Target currency code, e.g. PHP'),
        }),
        execute: async ({ amount, targetCurrency }) => {
          const providers = [
            { provider: 'Remitly', rate: 57.98, fee: 1.99, speed: 'Minutes (GCash)', gcash: true },
            { provider: 'Wise', rate: 58.33, fee: 4.14, speed: '1-2 days', gcash: false },
            { provider: 'Xoom', rate: 57.57, fee: 0, speed: 'Hours (GCash)', gcash: true },
            { provider: 'Western Union', rate: 56.99, fee: 5.00, speed: 'Minutes (GCash)', gcash: true },
            { provider: 'MoneyGram', rate: 57.28, fee: 4.99, speed: 'Minutes (GCash)', gcash: true },
            { provider: 'WorldRemit', rate: 57.75, fee: 2.99, speed: 'Minutes (GCash)', gcash: true },
            { provider: 'Pangea', rate: 57.87, fee: 3.95, speed: 'Same day (GCash)', gcash: true },
          ]
          const results = providers.map(p => ({
            provider: p.provider,
            sendAmount: amount,
            receiveAmount: Math.round(amount * p.rate),
            targetCurrency,
            exchangeRate: p.rate,
            fee: p.fee,
            totalCost: amount + p.fee,
            deliveryTime: p.speed,
            supportsGCash: p.gcash,
          }))
          const sorted = [...results].sort((a, b) => a.totalCost - b.totalCost)
          return {
            quotes: sorted,
            cheapest: sorted[0]?.provider ?? '',
            mostExpensive: sorted.at(-1)?.provider ?? '',
            savings: (sorted.at(-1)?.totalCost ?? 0) - (sorted[0]?.totalCost ?? 0),
          }
        },
      }),

      get_corridor_info: tool({
        description: 'Get requirements and info about sending money to a specific country.',
        inputSchema: z.object({
          country: z.string().describe('Country name or code, e.g. Philippines or PH'),
        }),
        execute: async ({ country }) => {
          return {
            country,
            availableProviders: ['Remitly', 'Wise', 'Western Union', 'MoneyGram', 'Xoom', 'WorldRemit', 'Pangea'],
            deliveryMethods: ['GCash (instant)', 'Maya/PayMaya', 'Bank deposit', 'Cash pickup (Cebuana, M Lhuillier, SM)'],
            documentsRequired: ['Government-issued ID'],
            maxPerTransaction: '$50,000 USD',
            notes: 'GCash is the most popular delivery method in the Philippines with 90M+ users.',
          }
        },
      }),
    },
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
