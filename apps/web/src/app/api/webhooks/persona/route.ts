import { headers } from 'next/headers'
import { db, users, complianceChecks } from '@remit/db'
import { eq } from 'drizzle-orm'
import {
  verifyPersonaWebhookSignature,
  mapPersonaStatusToKycStatus,
  type PersonaInquiryStatus,
} from '@/lib/persona'

interface PersonaWebhookEvent {
  data: {
    type: 'event'
    id: string
    attributes: {
      name: string
      payload: {
        data: {
          type: 'inquiry'
          id: string
          attributes: {
            status: PersonaInquiryStatus
            referenceId: string | null
          }
        }
      }
    }
  }
}

export async function POST(req: Request) {
  const headerPayload = await headers()
  const signature = headerPayload.get('persona-signature')

  if (!signature) {
    return Response.json({ error: 'Missing Persona-Signature header' }, { status: 400 })
  }

  const rawBody = await req.text()

  const isValid = await verifyPersonaWebhookSignature(rawBody, signature)
  if (!isValid) {
    return Response.json({ error: 'Invalid signature' }, { status: 401 })
  }

  let event: PersonaWebhookEvent
  try {
    event = JSON.parse(rawBody) as PersonaWebhookEvent
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { name, payload } = event.data.attributes
  const inquiry = payload.data

  if (inquiry.type !== 'inquiry') {
    return Response.json({ received: true })
  }

  const inquiryId = inquiry.id
  const inquiryStatus = inquiry.attributes.status
  const referenceId = inquiry.attributes.referenceId // Clerk userId

  if (!referenceId) {
    console.warn('[persona webhook] inquiry missing referenceId, skipping', inquiryId)
    return Response.json({ received: true })
  }

  const kycStatus = mapPersonaStatusToKycStatus(inquiryStatus)

  // Map to compliance_checks result
  const checkResult =
    kycStatus === 'approved' ? 'pass' : kycStatus === 'rejected' ? 'fail' : 'review'

  if (
    name === 'inquiry.completed' ||
    name === 'inquiry.failed' ||
    name === 'inquiry.declined' ||
    name === 'inquiry.needs_review'
  ) {
    await db.transaction(async (tx) => {
      // Update user KYC status
      await tx
        .update(users)
        .set({
          kycStatus,
          kycProviderRef: inquiryId,
          updatedAt: new Date(),
        })
        .where(eq(users.id, referenceId))

      // Insert compliance check record
      await tx.insert(complianceChecks).values({
        entityType: 'user',
        entityId: referenceId,
        checkType: 'kyc',
        provider: 'persona',
        providerRef: inquiryId,
        result: checkResult,
        metadata: { inquiryStatus, eventName: name },
      })
    })

    console.info(`[persona webhook] ${name}: user=${referenceId} kycStatus=${kycStatus}`)
  }

  return Response.json({ received: true })
}
