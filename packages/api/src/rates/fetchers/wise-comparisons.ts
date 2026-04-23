/**
 * Wise public Comparisons API — one request returns real-time rates for
 * 5-15 providers (Wise, Remitly, Xoom, WU, MoneyGram, WorldRemit, PayPal,
 * banks, …) for a given corridor.
 *
 * Endpoint: GET https://api.wise.com/v3/comparisons/
 *   ?sourceCurrency=USD&targetCurrency=PHP&sendAmount=1000
 *
 * Wise publishes this data for their own transparency pages; it's public,
 * unauthenticated, and returns the same numbers they show on wise.com.
 * We consume it to replace per-provider synthetic fetchers with live data.
 */

import type { LiveQuote, QuoteRequest } from '../types'
import { getMidMarketRate } from '../mid-market'

const COMPARISONS_URL = 'https://api.wise.com/v3/comparisons/'
const FETCH_TIMEOUT_MS = 10_000

interface WiseQuote {
  readonly rate?: number
  readonly fee?: number
  readonly markup?: number
  readonly receivedAmount?: number
  readonly dateCollected?: string
  readonly deliveryEstimation?: {
    readonly duration?: number | null
    readonly durationType?: string | null
  }
}

interface WiseProvider {
  readonly id: number
  readonly alias: string
  readonly name: string
  readonly type: 'bank' | 'moneyTransferProvider'
  readonly partner?: boolean
  readonly quotes?: readonly WiseQuote[]
}

interface ComparisonsResponse {
  readonly providers?: readonly WiseProvider[]
}

// Per-provider metadata we maintain on our side — rails support,
// human-friendly delivery copy, affiliate URLs, and a trust-score hint.
// Unknown providers fall back to DEFAULT_MTP or DEFAULT_BANK.
interface ProviderMeta {
  readonly slug: string
  readonly deliveryMinutes: number
  readonly deliveryTime: string
  readonly supportsGcash: boolean
  readonly supportsMaya: boolean
  readonly supportsBank: boolean
  readonly supportsCashPickup: boolean
  readonly trustScore: number
  readonly affiliateUrl: string
}

const PROVIDER_META: Record<string, ProviderMeta> = {
  wise: {
    slug: 'wise',
    deliveryMinutes: 20,
    deliveryTime: 'Minutes',
    supportsGcash: true,
    supportsMaya: true,
    supportsBank: true,
    supportsCashPickup: false,
    trustScore: 9,
    affiliateUrl: 'https://wise.com/invite/dhc/remittancebuddy',
  },
  remitly: {
    slug: 'remitly',
    deliveryMinutes: 30,
    deliveryTime: 'Minutes',
    supportsGcash: true,
    supportsMaya: true,
    supportsBank: true,
    supportsCashPickup: true,
    trustScore: 9,
    affiliateUrl: 'https://www.remitly.com/us/en/philippines',
  },
  xoom: {
    slug: 'xoom',
    deliveryMinutes: 15,
    deliveryTime: 'Minutes',
    supportsGcash: true,
    supportsMaya: false,
    supportsBank: true,
    supportsCashPickup: true,
    trustScore: 8,
    affiliateUrl: 'https://www.xoom.com/philippines',
  },
  'western-union': {
    slug: 'western-union',
    deliveryMinutes: 10,
    deliveryTime: 'Minutes',
    supportsGcash: true,
    supportsMaya: false,
    supportsBank: true,
    supportsCashPickup: true,
    trustScore: 8,
    affiliateUrl: 'https://www.westernunion.com/us/en/send-money-to-philippines.html',
  },
  moneygram: {
    slug: 'moneygram',
    deliveryMinutes: 20,
    deliveryTime: 'Minutes',
    supportsGcash: false,
    supportsMaya: false,
    supportsBank: true,
    supportsCashPickup: true,
    trustScore: 7,
    affiliateUrl: 'https://www.moneygram.com/mgo/us/en/send/philippines',
  },
  'world-remit': {
    slug: 'worldremit',
    deliveryMinutes: 30,
    deliveryTime: 'Minutes',
    supportsGcash: true,
    supportsMaya: false,
    supportsBank: true,
    supportsCashPickup: true,
    trustScore: 8,
    affiliateUrl: 'https://www.worldremit.com/en/philippines',
  },
  paypal: {
    slug: 'paypal',
    deliveryMinutes: 60,
    deliveryTime: '1 hour',
    supportsGcash: false,
    supportsMaya: false,
    supportsBank: true,
    supportsCashPickup: false,
    trustScore: 7,
    affiliateUrl: 'https://www.paypal.com/us/send-money',
  },
  ofx: {
    slug: 'ofx',
    deliveryMinutes: 1440,
    deliveryTime: '1-2 days',
    supportsGcash: false,
    supportsMaya: false,
    supportsBank: true,
    supportsCashPickup: false,
    trustScore: 7,
    affiliateUrl: 'https://www.ofx.com',
  },
  skrill: {
    slug: 'skrill',
    deliveryMinutes: 60,
    deliveryTime: '1 hour',
    supportsGcash: false,
    supportsMaya: false,
    supportsBank: true,
    supportsCashPickup: false,
    trustScore: 6,
    affiliateUrl: 'https://www.skrill.com',
  },
}

const DEFAULT_MTP: ProviderMeta = {
  slug: 'unknown',
  deliveryMinutes: 60,
  deliveryTime: '1 hour',
  supportsGcash: false,
  supportsMaya: false,
  supportsBank: true,
  supportsCashPickup: false,
  trustScore: 6,
  affiliateUrl: '',
}

const DEFAULT_BANK: ProviderMeta = {
  slug: 'bank',
  deliveryMinutes: 2880,
  deliveryTime: '2-3 days',
  supportsGcash: false,
  supportsMaya: false,
  supportsBank: true,
  supportsCashPickup: false,
  trustScore: 7,
  affiliateUrl: '',
}

function pickMeta(alias: string, type: WiseProvider['type']): ProviderMeta {
  const m = PROVIDER_META[alias]
  if (m) return m
  return type === 'bank' ? DEFAULT_BANK : DEFAULT_MTP
}

function mapQuote(
  p: WiseProvider,
  q: WiseQuote,
  req: QuoteRequest,
  midMarket: number,
  now: string,
): LiveQuote | null {
  if (typeof q.rate !== 'number' || typeof q.receivedAmount !== 'number') return null

  const meta = pickMeta(p.alias, p.type)
  const fee = typeof q.fee === 'number' ? q.fee : 0
  const markup = typeof q.markup === 'number' ? q.markup : 0

  // Slug falls back to the provider's Wise alias so the UI always has a
  // stable identifier, even for providers we haven't curated meta for.
  const slug = meta.slug === 'unknown' || meta.slug === 'bank' ? p.alias : meta.slug

  return {
    provider: p.name,
    providerSlug: slug,
    corridor: req.corridor,
    sourceAmount: req.sourceAmount,
    sourceCurrency: req.sourceCurrency,
    targetAmount: q.receivedAmount,
    targetCurrency: req.targetCurrency,
    exchangeRate: q.rate,
    midMarketRate: midMarket,
    fee,
    totalCost: req.sourceAmount + fee,
    spread: markup / 100,
    deliveryTime: meta.deliveryTime,
    deliveryMinutes: meta.deliveryMinutes,
    supportsGcash: meta.supportsGcash,
    supportsMaya: meta.supportsMaya,
    supportsBank: meta.supportsBank,
    supportsCashPickup: meta.supportsCashPickup,
    trustScore: meta.trustScore,
    affiliateUrl: meta.affiliateUrl,
    fetchedAt: now,
    source: 'live-api',
  }
}

export async function fetchWiseComparisons(req: QuoteRequest): Promise<LiveQuote[]> {
  const url =
    `${COMPARISONS_URL}?sourceCurrency=${encodeURIComponent(req.sourceCurrency)}` +
    `&targetCurrency=${encodeURIComponent(req.targetCurrency)}` +
    `&sendAmount=${req.sourceAmount}`

  const res = await fetch(url, {
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    headers: { Accept: 'application/json' },
  })
  if (!res.ok) {
    throw new Error(`Wise comparisons returned ${res.status}`)
  }

  const data = (await res.json()) as ComparisonsResponse
  const midMarket = await getMidMarketRate(req.sourceCurrency, req.targetCurrency)
  const now = new Date().toISOString()

  const quotes: LiveQuote[] = []
  for (const p of data.providers ?? []) {
    const q = p.quotes?.[0]
    if (!q) continue
    const mapped = mapQuote(p, q, req, midMarket, now)
    if (mapped) quotes.push(mapped)
  }
  return quotes
}
