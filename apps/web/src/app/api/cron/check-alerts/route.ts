/**
 * Cron: scan all rate alerts, fetch current mid-market rate per corridor,
 * fire email via Resend when target is hit, and stamp lastTriggeredAt to
 * avoid spamming the user.
 *
 * Runs every 5 minutes (see vercel.json). No DB required — alerts live in
 * Upstash, emails send through Resend, and cooldown is enforced in-place.
 */

import { NextResponse } from 'next/server'
import { Redis } from '@upstash/redis'
import * as Sentry from '@sentry/nextjs'
import { getMidMarketRate } from '@remit/api'

const REDIS_KEY = 'rate_alerts:v1'
const COOLDOWN_MS = 6 * 60 * 60 * 1000 // 6 hours between re-notifications

interface StoredAlert {
  id: string
  email: string
  corridor: string
  sourceCurrency: string
  targetCurrency: string
  targetRate: number
  payoutMethod: string
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

function verifyCronSecret(req: Request): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return true
  return req.headers.get('authorization') === `Bearer ${secret}`
}

async function sendAlertEmail(alert: StoredAlert, currentRate: number): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.ALERTS_FROM_EMAIL ?? 'alerts@myremittancepal.com'
  if (!apiKey) {
    console.warn('[check-alerts] RESEND_API_KEY missing — skipping send')
    return false
  }

  const subject = `Rate alert: ${alert.sourceCurrency}→${alert.targetCurrency} hit ${currentRate.toFixed(2)}`
  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;padding:24px;">
      <h2 style="color:#E5613F;">Good news — your target rate just hit.</h2>
      <p>You asked us to let you know when <strong>1 ${alert.sourceCurrency}</strong> would buy at least <strong>${alert.targetRate.toFixed(2)} ${alert.targetCurrency}</strong>.</p>
      <p>Right now the mid-market rate is <strong>${currentRate.toFixed(2)} ${alert.targetCurrency}</strong>.</p>
      <p>
        <a href="https://myremittancepal.com/compare?corridor=${alert.corridor}"
           style="display:inline-block;background:#E5613F;color:white;padding:12px 20px;border-radius:999px;text-decoration:none;font-weight:600;">
          Send now
        </a>
      </p>
      <p style="color:#888;font-size:12px;margin-top:32px;">You can manage or disable alerts at myremittancepal.com/alerts</p>
    </div>
  `

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: alert.email,
        subject,
        html,
      }),
    })
    if (!res.ok) {
      const text = await res.text()
      console.warn(`[check-alerts] Resend failed ${res.status}: ${text}`)
      return false
    }
    return true
  } catch (err) {
    Sentry.captureException(err, { tags: { cron: 'check-alerts', step: 'resend' } })
    return false
  }
}

export async function GET(req: Request) {
  if (!verifyCronSecret(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const redis = getRedis()
  if (!redis) {
    return NextResponse.json({ error: 'Upstash not configured' }, { status: 503 })
  }

  const startedAt = Date.now()
  const all = (await redis.get<StoredAlert[]>(REDIS_KEY)) ?? []
  const active = all.filter((a) => a.active)

  // Group by corridor to minimize rate lookups
  const corridorMap = new Map<string, number | null>()
  for (const alert of active) {
    const key = `${alert.sourceCurrency}:${alert.targetCurrency}`
    if (!corridorMap.has(key)) {
      try {
        const rate = await getMidMarketRate(alert.sourceCurrency, alert.targetCurrency)
        corridorMap.set(key, rate)
      } catch (err) {
        Sentry.captureException(err, { tags: { cron: 'check-alerts', step: 'mid-market' } })
        corridorMap.set(key, null)
      }
    }
  }

  const now = Date.now()
  let triggered = 0
  let skipped = 0
  let failed = 0

  for (const alert of all) {
    if (!alert.active) continue
    const key = `${alert.sourceCurrency}:${alert.targetCurrency}`
    const currentRate = corridorMap.get(key)
    if (currentRate == null) {
      failed += 1
      continue
    }
    if (currentRate < alert.targetRate) continue

    const lastTs = alert.lastTriggeredAt ? new Date(alert.lastTriggeredAt).getTime() : 0
    if (now - lastTs < COOLDOWN_MS) {
      skipped += 1
      continue
    }

    const sent = await sendAlertEmail(alert, currentRate)
    if (sent) {
      alert.lastTriggeredAt = new Date(now).toISOString()
      triggered += 1
    } else {
      failed += 1
    }
  }

  await redis.set(REDIS_KEY, all)

  const durationMs = Date.now() - startedAt
  return NextResponse.json({
    ok: true,
    durationMs,
    scanned: active.length,
    triggered,
    skipped,
    failed,
    checkedAt: new Date().toISOString(),
  })
}
