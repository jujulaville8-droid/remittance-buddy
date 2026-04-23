/**
 * Push notification device token registration.
 *
 * Called by NativeShell on app boot inside Capacitor. Stores the APNs /
 * FCM token in an Upstash hash keyed by user id (when we have one) or by
 * the token itself (when still anonymous). The rate-alert cron and transfer
 * status worker read from here to dispatch notifications.
 *
 * DB-free like /api/alerts — matches the existing pre-auth storage pattern.
 */

import { NextResponse } from 'next/server'
import { Redis } from '@upstash/redis'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const REGISTRY_KEY = 'push_tokens:v1'

const schema = z.object({
  token: z.string().min(8).max(256),
  platform: z.enum(['ios', 'android']),
})

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 })
  }

  let userId: string | null = null
  try {
    const supabase = await createClient()
    const { data } = await supabase.auth.getUser()
    userId = data.user?.id ?? null
  } catch {
    // pre-auth — token binds later when user signs in
  }

  try {
    const redis = Redis.fromEnv()
    await redis.hset(REGISTRY_KEY, {
      [parsed.data.token]: JSON.stringify({
        platform: parsed.data.platform,
        userId,
        registeredAt: new Date().toISOString(),
      }),
    })
  } catch {
    // Redis unavailable — token is useless without somewhere to store it,
    // but don't surface the error to the client (non-critical path).
    return NextResponse.json({ ok: true, stored: false })
  }

  return NextResponse.json({ ok: true, stored: true })
}
