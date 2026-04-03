import { getAuthUser } from '@/lib/supabase/auth-helper'
import { db, affiliateClicks } from '@remit/db'
import { z } from 'zod'

const clickSchema = z.object({
  provider: z.string().min(1),
  network: z.string().optional(),
  context: z.enum(['popup', 'chat', 'comparison']),
  corridor: z.string().default('USD-PHP'),
  amountUsd: z.number().positive().optional(),
  affiliateUrl: z.string().url().optional(),
})

const batchSchema = z.object({
  clicks: z.array(clickSchema).min(1).max(100),
})

function getCorsHeaders(origin: string | null): Record<string, string> {
  if (!origin || !origin.startsWith('chrome-extension://')) return {}
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  }
}

export async function OPTIONS(req: Request) {
  const origin = req.headers.get('origin')
  return new Response(null, { status: 204, headers: getCorsHeaders(origin) })
}

export async function POST(req: Request) {
  try {
    const authUser = await getAuthUser(req)
    const userId = authUser?.id ?? null

    const body = await req.json()
    const parsed = batchSchema.safeParse(body)
    if (!parsed.success) {
      return Response.json({ error: 'Invalid request body' }, { status: 400 })
    }

    const rows = parsed.data.clicks.map((click) => ({
      userId,
      provider: click.provider,
      network: click.network ?? null,
      context: click.context,
      corridor: click.corridor,
      amountUsd: click.amountUsd?.toString() ?? null,
      affiliateUrl: click.affiliateUrl ?? null,
    }))

    await db.insert(affiliateClicks).values(rows)

    const corsHeaders = getCorsHeaders(req.headers.get('origin'))
    return Response.json(
      { success: true, tracked: rows.length },
      { headers: corsHeaders },
    )
  } catch (error) {
    console.error('[affiliate/track] Error:', error)
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
