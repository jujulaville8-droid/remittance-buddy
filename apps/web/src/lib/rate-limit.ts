import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const redis = Redis.fromEnv()

/** 20 requests per 10 seconds per identifier (general API) */
export const rateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, '10 s'),
  analytics: true,
})

/** 5 transfer requests per minute per user */
export const transferRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '60 s'),
  analytics: true,
})

/** 3 payment intent requests per minute per user */
export const paymentRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, '60 s'),
  analytics: true,
})

/** 5 KYC inquiry requests per hour per user */
export const kycRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '3600 s'),
  analytics: true,
})

/** 10 chat requests per minute per user (AI calls are expensive) */
export const chatRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '60 s'),
  analytics: true,
})
