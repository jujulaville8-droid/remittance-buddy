import { getAuthUser } from '@/lib/supabase/auth-helper'
import { streamText, convertToModelMessages } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'
import type { UIMessage } from 'ai'
import { z } from 'zod'
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
    system: `You are Remittance Buddy — a friendly AI that helps people compare remittance rates and send money home to the Philippines.

You are talking to ${userName}.

You have CURRENT rate data for US → Philippines (PHP). Use this data directly in your responses — no need to call any tool:

PROVIDER RATES (per $1 USD):
- Remitly: ₱57.98 | Fee: $1.99 | Speed: Minutes | GCash: Yes | Cash pickup: Yes | Trust: 9/10
- Wise: ₱58.33 | Fee: $4.14 | Speed: 1-2 days | GCash: No | Cash pickup: No | Trust: 10/10
- Xoom: ₱57.57 | Fee: $0 | Speed: Hours | GCash: Yes | Cash pickup: Yes | Trust: 8/10
- Western Union: ₱56.99 | Fee: $5.00 | Speed: Minutes | GCash: Yes | Cash pickup: Yes | Trust: 9/10
- MoneyGram: ₱57.28 | Fee: $4.99 | Speed: Minutes | GCash: Yes | Cash pickup: Yes | Trust: 8/10
- WorldRemit: ₱57.75 | Fee: $2.99 | Speed: Minutes | GCash: Yes | Cash pickup: No | Trust: 7/10
- Pangea: ₱57.87 | Fee: $3.95 | Speed: Same day | GCash: Yes | Cash pickup: No | Trust: 6/10

COMMON KNOWLEDGE (answer directly, no tool needed):
- GCash is the #1 wallet in PH (90M+ users). Most providers support it except Wise.
- Cash pickup: Cebuana Lhuillier (6,000+ branches), M Lhuillier (3,000+), SM, 7-Eleven, LBC
- Documents needed: Government ID. Over $3,000 may need proof of address.
- Maya/PayMaya is #2 wallet (50M users). Supported by Remitly, WorldRemit, Xoom.
- All providers are licensed and regulated. OFW remittances are tax-exempt in PH.

RULES:
1. When user mentions an amount, IMMEDIATELY calculate and show the comparison. Do the math yourself using the rates above.
2. Lead with your RECOMMENDATION, not just data. Say "I recommend X because..." then show alternatives.
3. Always show: what the recipient GETS in pesos, the fee, and delivery time.
4. Show savings: "You save $X vs [most expensive]" and "Recipient gets ₱X more vs [worst rate]"
5. Explain tradeoffs in plain language: "Wise has the best rate but takes 1-2 days and doesn't support GCash"
6. Be brief. Recommendation + 2-3 sentences. Don't list all 7 unless asked.
7. Top 3 is enough unless they ask for all options.
8. Speak Taglish if the user does.
9. For follow-up questions, remember the conversation context. Don't re-ask what was already discussed.`,
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
