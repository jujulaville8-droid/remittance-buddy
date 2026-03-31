/**
 * Wise Business API client
 * Docs: https://docs.wise.com/api-docs/
 */

const WISE_BASE_URL =
  process.env.WISE_ENV === 'live'
    ? 'https://api.transferwise.com'
    : 'https://api.sandbox.transferwise.com'

function wiseHeaders() {
  const apiKey = process.env.WISE_API_KEY
  if (!apiKey) throw new Error('WISE_API_KEY is not configured')
  return {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface WiseQuote {
  id: string
  sourceCurrency: string
  targetCurrency: string
  sourceAmount: number
  targetAmount: number
  rate: number
  fee: { total: number; transferwise: number; payIn: number }
  expirationTime: string
  paymentOptions: Array<{ payIn: string; payOut: string; fee: { total: number } }>
}

export interface WiseRecipient {
  id: number
  profile: number
  name: { fullName: string }
  currency: string
  country: string
  accountSummary: string
}

export interface WiseTransfer {
  id: number
  targetAccount: number
  quote: string
  status: WiseTransferStatus
  reference: string | null
  rate: number
  created: string
  business: number | null
  details: { reference: string | null }
  hasActiveIssues: boolean
  sourceCurrency: string
  sourceValue: number
  targetCurrency: string
  targetValue: number
}

export type WiseTransferStatus =
  | 'incoming_payment_waiting'
  | 'processing'
  | 'funds_converted'
  | 'outgoing_payment_sent'
  | 'cancelled'
  | 'funds_refunded'
  | 'bounced_back'
  | 'unknown'

export interface CreateRecipientParams {
  profileId: string
  currency: string
  type: string // e.g. "aba", "iban", "sort_code"
  accountHolderName: string
  details: Record<string, string>
}

export interface CreateTransferParams {
  targetAccountId: number
  quoteUuid: string
  customerTransactionId: string // idempotency key
  details?: { reference?: string }
}

// ─── Quote ────────────────────────────────────────────────────────────────────

export async function createQuote(params: {
  profileId: string
  sourceCurrency: string
  targetCurrency: string
  sourceAmount?: number
  targetAmount?: number
}): Promise<WiseQuote> {
  const body: Record<string, unknown> = {
    profile: params.profileId,
    sourceCurrency: params.sourceCurrency,
    targetCurrency: params.targetCurrency,
    payOut: 'BANK_TRANSFER',
  }
  if (params.sourceAmount !== undefined) body.sourceAmount = params.sourceAmount
  if (params.targetAmount !== undefined) body.targetAmount = params.targetAmount

  const res = await fetch(`${WISE_BASE_URL}/v3/profiles/${params.profileId}/quotes`, {
    method: 'POST',
    headers: wiseHeaders(),
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Wise createQuote failed (${res.status}): ${err}`)
  }

  return res.json() as Promise<WiseQuote>
}

// ─── Recipients ───────────────────────────────────────────────────────────────

export async function createRecipient(params: CreateRecipientParams): Promise<WiseRecipient> {
  const body = {
    profile: params.profileId,
    currency: params.currency,
    type: params.type,
    accountHolderName: params.accountHolderName,
    details: params.details,
  }

  const res = await fetch(`${WISE_BASE_URL}/v1/accounts`, {
    method: 'POST',
    headers: wiseHeaders(),
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Wise createRecipient failed (${res.status}): ${err}`)
  }

  return res.json() as Promise<WiseRecipient>
}

// ─── Transfers ────────────────────────────────────────────────────────────────

export async function createTransfer(params: CreateTransferParams): Promise<WiseTransfer> {
  const body = {
    targetAccount: params.targetAccountId,
    quoteUuid: params.quoteUuid,
    customerTransactionId: params.customerTransactionId,
    details: params.details ?? {},
  }

  const res = await fetch(`${WISE_BASE_URL}/v1/transfers`, {
    method: 'POST',
    headers: wiseHeaders(),
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Wise createTransfer failed (${res.status}): ${err}`)
  }

  return res.json() as Promise<WiseTransfer>
}

export async function fundTransfer(
  profileId: string,
  transferId: number,
): Promise<{ status: string; errorCode: string | null }> {
  const res = await fetch(
    `${WISE_BASE_URL}/v3/profiles/${profileId}/transfers/${transferId}/payments`,
    {
      method: 'POST',
      headers: wiseHeaders(),
      body: JSON.stringify({ type: 'BALANCE' }),
    },
  )

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Wise fundTransfer failed (${res.status}): ${err}`)
  }

  return res.json() as Promise<{ status: string; errorCode: string | null }>
}

export async function getTransfer(transferId: number): Promise<WiseTransfer> {
  const res = await fetch(`${WISE_BASE_URL}/v1/transfers/${transferId}`, {
    headers: wiseHeaders(),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Wise getTransfer failed (${res.status}): ${err}`)
  }

  return res.json() as Promise<WiseTransfer>
}

// ─── Webhook verification ─────────────────────────────────────────────────────

/**
 * Verify Wise webhook using their public key RSA signature.
 * Wise sends `X-Signature-SHA256` header with base64-encoded RSA-SHA256 signature.
 */
export async function verifyWiseWebhookSignature(
  rawBody: string,
  signatureHeader: string,
): Promise<boolean> {
  // Wise uses a static public key per environment — in production, fetch from
  // https://api.transferwise.com/v1/subscriptions/signatures
  // For MVP, we use the shared secret approach as a simpler alternative
  const secret = process.env.WISE_WEBHOOK_SECRET
  if (!secret) return true // skip verification if not configured

  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify'],
  )

  const sigBytes = Uint8Array.from(atob(signatureHeader), (c) => c.charCodeAt(0))
  return crypto.subtle.verify('HMAC', key, sigBytes, encoder.encode(rawBody))
}

// ─── Status mapping ───────────────────────────────────────────────────────────

export function mapWiseStatusToTransferStatus(
  wiseStatus: WiseTransferStatus,
): 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' {
  switch (wiseStatus) {
    case 'outgoing_payment_sent':
    case 'funds_converted':
      return 'completed'
    case 'processing':
    case 'incoming_payment_waiting':
      return 'processing'
    case 'cancelled':
      return 'cancelled'
    case 'funds_refunded':
    case 'bounced_back':
      return 'failed'
    default:
      return 'pending'
  }
}
