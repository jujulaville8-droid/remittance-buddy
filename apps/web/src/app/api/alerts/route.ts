/**
 * Rate alerts — DB-free, Upstash-backed.
 *
 * POST: create a new alert. Stored as a JSON blob in a Redis list so the
 *       /api/cron/check-alerts job can scan them without Postgres.
 * GET:  list alerts for an email (client passes it; we're pre-auth).
 * DELETE: remove a specific alert by id.
 *
 * Shape mirrors LocalRateAlert in lib/local-db.ts for clean migration later.
 */

import { NextResponse } from 'next/server'
import { Redis } from '@upstash/redis'
import { z } from 'zod'

const REDIS_KEY = 'rate_alerts:v1'

const createSchema = z.object({
  email: z.string().email(),
  corridor: z.string().min(2).max(10),
  sourceCurrency: z.string().length(3),
  targetCurrency: z.string().length(3),
  targetRate: z.number().positive(),
  payoutMethod: z.enum(['gcash', 'maya', 'bank', 'cash_pickup']),
})

interface StoredAlert {
  id: string
  email: string
  corridor: string
  sourceCurrency: string
  targetCurrency: string
  targetRate: number
  payoutMethod: 'gcash' | 'maya' | 'bank' | 'cash_pickup'
  active: boolean
  createdAt: string
  lastTriggeredAt: string | null
}

function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token || url.includes('placeholder')) return null
  return Redis.fromEnv()
}

async function loadAll(redis: Redis): Promise<StoredAlert[]> {
  const raw = await redis.get<StoredAlert[]>(REDIS_KEY)
  return raw ?? []
}

async function saveAll(redis: Redis, alerts: StoredAlert[]): Promise<void> {
  await redis.set(REDIS_KEY, alerts)
}

export async function POST(req: Request) {
  const redis = getRedis()
  if (!redis) {
    return NextResponse.json({ error: 'Upstash not configured' }, { status: 503 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = createSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', issues: parsed.error.issues }, { status: 400 })
  }

  const id =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`

  const alert: StoredAlert = {
    id,
    ...parsed.data,
    active: true,
    createdAt: new Date().toISOString(),
    lastTriggeredAt: null,
  }

  const all = await loadAll(redis)
  all.push(alert)
  // Cap at 10k alerts total for pre-launch safety.
  await saveAll(redis, all.slice(-10000))

  return NextResponse.json({ ok: true, alert })
}

export async function GET(req: Request) {
  const redis = getRedis()
  if (!redis) {
    return NextResponse.json({ error: 'Upstash not configured' }, { status: 503 })
  }

  const url = new URL(req.url)
  const email = url.searchParams.get('email')
  if (!email) {
    return NextResponse.json({ error: 'email query param required' }, { status: 400 })
  }

  const all = await loadAll(redis)
  const mine = all.filter((a) => a.email === email)
  return NextResponse.json({ alerts: mine })
}

export async function DELETE(req: Request) {
  const redis = getRedis()
  if (!redis) {
    return NextResponse.json({ error: 'Upstash not configured' }, { status: 503 })
  }

  const url = new URL(req.url)
  const id = url.searchParams.get('id')
  const email = url.searchParams.get('email')
  if (!id || !email) {
    return NextResponse.json({ error: 'id and email required' }, { status: 400 })
  }

  const all = await loadAll(redis)
  const filtered = all.filter((a) => !(a.id === id && a.email === email))
  await saveAll(redis, filtered)
  return NextResponse.json({ ok: true })
}
