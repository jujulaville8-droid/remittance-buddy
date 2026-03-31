/**
 * Persona KYC API client
 * Docs: https://docs.withpersona.com/reference/create-an-inquiry
 */

const PERSONA_BASE_URL = 'https://withpersona.com/api/v1'
const PERSONA_API_VERSION = '2023-01-05'

function personaHeaders() {
  const apiKey = process.env.PERSONA_API_KEY
  if (!apiKey) throw new Error('PERSONA_API_KEY is not configured')
  return {
    Authorization: `Bearer ${apiKey}`,
    'Persona-Version': PERSONA_API_VERSION,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  }
}

export type PersonaInquiryStatus =
  | 'created'
  | 'pending'
  | 'completed'
  | 'failed'
  | 'declined'
  | 'expired'
  | 'needs_review'

export interface PersonaInquiry {
  id: string
  type: string
  attributes: {
    status: PersonaInquiryStatus
    referenceId: string | null
    sessionToken: string
    createdAt: string
    completedAt: string | null
    declinedAt: string | null
    failedAt: string | null
  }
}

export interface CreateInquiryParams {
  templateId: string
  referenceId: string // Clerk userId
  fields?: {
    nameFirst?: string
    nameLast?: string
    emailAddress?: string
    phoneNumber?: string
    countryCode?: string
  }
}

export async function createInquiry(params: CreateInquiryParams): Promise<PersonaInquiry> {
  const templateId = params.templateId ?? process.env.PERSONA_TEMPLATE_ID
  if (!templateId) throw new Error('PERSONA_TEMPLATE_ID is not configured')

  const body = {
    data: {
      type: 'inquiry',
      attributes: {
        'inquiry-template-id': templateId,
        'reference-id': params.referenceId,
        fields: params.fields ?? {},
      },
    },
  }

  const res = await fetch(`${PERSONA_BASE_URL}/inquiries`, {
    method: 'POST',
    headers: personaHeaders(),
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Persona createInquiry failed (${res.status}): ${err}`)
  }

  const json = await res.json()
  return json.data as PersonaInquiry
}

export async function getInquiry(inquiryId: string): Promise<PersonaInquiry> {
  const res = await fetch(`${PERSONA_BASE_URL}/inquiries/${inquiryId}`, {
    headers: personaHeaders(),
    next: { revalidate: 0 },
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Persona getInquiry failed (${res.status}): ${err}`)
  }

  const json = await res.json()
  return json.data as PersonaInquiry
}

/**
 * Map a Persona inquiry status to the user's kycStatus column value.
 */
export function mapPersonaStatusToKycStatus(
  status: PersonaInquiryStatus,
): 'pending' | 'in_review' | 'approved' | 'rejected' {
  switch (status) {
    case 'completed':
      return 'approved'
    case 'declined':
    case 'failed':
      return 'rejected'
    case 'needs_review':
      return 'in_review'
    default:
      return 'pending'
  }
}

/**
 * Verify a Persona webhook signature.
 * Persona sends a SHA-256 HMAC in the `Persona-Signature` header.
 */
export async function verifyPersonaWebhookSignature(
  rawBody: string,
  signatureHeader: string,
): Promise<boolean> {
  const secret = process.env.PERSONA_WEBHOOK_SECRET
  if (!secret) throw new Error('PERSONA_WEBHOOK_SECRET is not configured')

  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify'],
  )

  // Persona signature format: "t=<timestamp>,v1=<hex-digest>"
  const parts = Object.fromEntries(
    signatureHeader.split(',').map((part) => {
      const [k, v] = part.split('=', 2)
      return [k, v]
    }),
  )

  const timestamp = parts['t']
  const v1 = parts['v1']
  if (!timestamp || !v1) return false

  const signedPayload = `${timestamp}.${rawBody}`
  const hexBytes = new Uint8Array(v1.match(/.{1,2}/g)!.map((b: string) => parseInt(b, 16)))

  return crypto.subtle.verify('HMAC', key, hexBytes, encoder.encode(signedPayload))
}
