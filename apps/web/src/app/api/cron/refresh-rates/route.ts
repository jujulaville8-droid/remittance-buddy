/**
 * Cron route: refresh cached rate quotes for popular corridors and amounts.
 *
 * Called by Vercel Cron every 60 seconds (configured in vercel.json).
 * Pre-fetches quotes for the most common (corridor, amount) pairs so the
 * landing page and popup see cached responses instantly.
 *
 * Security: Vercel cron requests include an `Authorization: Bearer <CRON_SECRET>`
 * header. We verify this to prevent public abuse.
 */

import { NextResponse } from 'next/server'
import { Redis } from '@upstash/redis'
import * as Sentry from '@sentry/nextjs'
import {
  fetchQuotesForBatch,
  setCachedQuotes,
  type CacheClient,
  type Corridor,
  type PayoutMethod,
  type QuoteRequest,
} from '@remit/api'

// Common quote amounts — matches the popup's quick-amount chips
const COMMON_AMOUNTS = [100, 200, 500, 1000] as const

// V1 corridors — we pre-warm these every minute. Add more as volume grows.
interface CorridorConfig {
  readonly corridor: Corridor
  readonly sourceCurrency: string
  readonly targetCurrency: string
  readonly payoutMethod: PayoutMethod
}

const ACTIVE_CORRIDORS: readonly CorridorConfig[] = [
  { corridor: 'US-PH', sourceCurrency: 'USD', targetCurrency: 'PHP', payoutMethod: 'gcash' },
  { corridor: 'UK-PH', sourceCurrency: 'GBP', targetCurrency: 'PHP', payoutMethod: 'gcash' },
  { corridor: 'SG-PH', sourceCurrency: 'SGD', targetCurrency: 'PHP', payoutMethod: 'gcash' },
  { corridor: 'AE-PH', sourceCurrency: 'AED', targetCurrency: 'PHP', payoutMethod: 'gcash' },
  { corridor: 'SA-PH', sourceCurrency: 'SAR', targetCurrency: 'PHP', payoutMethod: 'gcash' },
]

function getRedisClient(): CacheClient | null {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token || url.includes('placeholder')) return null
  const redis = Redis.fromEnv()
  const client: CacheClient = {
    async get(key: string) {
      return (await redis.get<string>(key)) ?? null
    },
    async set(key: string, value: string, opts?: { ex?: number }) {
      if (opts?.ex) {
        await redis.set(key, value, { ex: opts.ex })
      } else {
        await redis.set(key, value)
      }
    },
    async del(key: string) {
      await redis.del(key)
    },
  }
  return client
}

function verifyCronSecret(req: Request): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return true // allow in local dev
  const header = req.headers.get('authorization') ?? ''
  return header === `Bearer ${secret}`
}

export async function GET(req: Request) {
  if (!verifyCronSecret(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const cache = getRedisClient()
  if (!cache) {
    return NextResponse.json(
      { error: 'Redis not configured — cache refresh skipped' },
      { status: 503 },
    )
  }

  const startedAt = Date.now()
  const results: Record<string, { success: number; failed: number; errors: string[] }> = {}

  for (const config of ACTIVE_CORRIDORS) {
    const corridorKey = `${config.sourceCurrency}->${config.targetCurrency}`
    results[corridorKey] = { success: 0, failed: 0, errors: [] }

    try {
      const batch = await fetchQuotesForBatch(
        config.corridor,
        config.sourceCurrency,
        config.targetCurrency,
        COMMON_AMOUNTS,
        config.payoutMethod,
      )

      for (const [amountStr, result] of Object.entries(batch)) {
        const amount = Number(amountStr)
        if (result.quotes.length === 0) {
          results[corridorKey].failed += 1
          results[corridorKey].errors.push(`${amount}: no quotes`)
          continue
        }

        const quoteReq: QuoteRequest = {
          corridor: config.corridor,
          sourceCurrency: config.sourceCurrency,
          targetCurrency: config.targetCurrency,
          sourceAmount: amount,
          payoutMethod: config.payoutMethod,
        }
        await setCachedQuotes(cache, quoteReq, result)
        results[corridorKey].success += 1
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      results[corridorKey].failed += COMMON_AMOUNTS.length
      results[corridorKey].errors.push(message)
      Sentry.captureException(err, {
        tags: { cron: 'refresh-rates', corridor: config.corridor },
      })
    }
  }

  const durationMs = Date.now() - startedAt
  const totalSuccess = Object.values(results).reduce((sum, r) => sum + r.success, 0)
  const totalFailed = Object.values(results).reduce((sum, r) => sum + r.failed, 0)

  return NextResponse.json({
    ok: true,
    durationMs,
    totalSuccess,
    totalFailed,
    corridors: results,
    refreshedAt: new Date().toISOString(),
  })
}
