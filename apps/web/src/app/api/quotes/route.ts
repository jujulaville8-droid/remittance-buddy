import { NextResponse } from 'next/server'
import { z } from 'zod'
import { Redis } from '@upstash/redis'
import * as Sentry from '@sentry/nextjs'
import {
  fetchAllQuotes,
  getCachedQuotes,
  setCachedQuotes,
  type CacheClient,
  type Corridor,
  type PayoutMethod,
  type QuoteRequest,
} from '@remit/api'

const querySchema = z.object({
  corridor: z.enum(['US-PH', 'UK-PH', 'SG-PH', 'AE-PH', 'SA-PH', 'CA-PH', 'AU-PH', 'JP-PH', 'HK-PH']),
  sourceCurrency: z.string().length(3),
  targetCurrency: z.string().length(3),
  sourceAmount: z.coerce.number().positive().max(50000),
  payoutMethod: z.enum(['gcash', 'maya', 'bank', 'cash_pickup']).default('gcash'),
})

function getRedisClient(): CacheClient | null {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token || url.includes('placeholder')) return null
  const redis = Redis.fromEnv()
  const client: CacheClient = {
    async get(key: string) {
      const val = await redis.get<string>(key)
      return val ?? null
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

export async function GET(req: Request) {
  return Sentry.withServerActionInstrumentation('GET /api/quotes', async () => {
    const url = new URL(req.url)
    const parseResult = querySchema.safeParse({
      corridor: url.searchParams.get('corridor'),
      sourceCurrency: url.searchParams.get('sourceCurrency'),
      targetCurrency: url.searchParams.get('targetCurrency'),
      sourceAmount: url.searchParams.get('sourceAmount'),
      payoutMethod: url.searchParams.get('payoutMethod') ?? 'gcash',
    })

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: parseResult.error.issues },
        { status: 400 },
      )
    }

    const quoteReq: QuoteRequest = {
      corridor: parseResult.data.corridor as Corridor,
      sourceCurrency: parseResult.data.sourceCurrency,
      targetCurrency: parseResult.data.targetCurrency,
      sourceAmount: parseResult.data.sourceAmount,
      payoutMethod: parseResult.data.payoutMethod as PayoutMethod,
    }

    const cache = getRedisClient()

    try {
      // Try cache first
      if (cache) {
        const cached = await getCachedQuotes(cache, quoteReq)
        if (cached) {
          return NextResponse.json(
            { ...cached, cached: true },
            {
              headers: {
                'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
              },
            },
          )
        }
      }

      // Cache miss — fetch live
      const result = await fetchAllQuotes(quoteReq)

      // Log partial failures (some providers failed) without breaking the user's request
      if (result.errors.length > 0) {
        Sentry.captureMessage(
          `Quote fetch partial failure: ${result.errors.length}/${result.quotes.length + result.errors.length} providers failed`,
          {
            level: 'warning',
            tags: {
              corridor: quoteReq.corridor,
              sourceAmount: String(quoteReq.sourceAmount),
            },
            extra: { errors: result.errors },
          },
        )
      }

      // Write through to cache for next request
      if (cache) {
        await setCachedQuotes(cache, quoteReq, result)
      }

      return NextResponse.json(
        { ...result, cached: false },
        {
          headers: {
            'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
          },
        },
      )
    } catch (err) {
      Sentry.captureException(err, {
        tags: { route: '/api/quotes' },
        extra: { quoteReq },
      })
      return NextResponse.json(
        { error: 'Failed to fetch quotes', quotes: [], errors: [] },
        { status: 500 },
      )
    }
  })
}
