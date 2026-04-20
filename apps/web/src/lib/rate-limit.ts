import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

type Duration = Parameters<typeof Ratelimit.slidingWindow>[1]

const isConfigured = process.env.UPSTASH_REDIS_REST_URL && !process.env.UPSTASH_REDIS_REST_URL.includes('placeholder')

const redis = isConfigured ? Redis.fromEnv() : null

function createLimiter(requests: number, window: Duration) {
  if (!redis) {
    return { limit: async (_id: string) => ({ success: true, limit: requests, remaining: requests, reset: 0 }) }
  }
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(requests, window),
    analytics: true,
  })
}

/** 20 requests per 10 seconds per identifier (general API) */
export const rateLimiter = createLimiter(20, '10 s')

/** 5 transfer requests per minute per user */
export const transferRateLimiter = createLimiter(5, '60 s')

/** 3 payment intent requests per minute per user */
export const paymentRateLimiter = createLimiter(3, '60 s')

/** 5 KYC inquiry requests per hour per user */
export const kycRateLimiter = createLimiter(5, '3600 s')

/** 10 chat requests per minute per user (AI calls are expensive) */
export const chatRateLimiter = createLimiter(10, '60 s')
