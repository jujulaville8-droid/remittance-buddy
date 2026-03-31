import { auth } from '@clerk/nextjs/server'
import { db, users } from '@remit/db'
import { eq } from 'drizzle-orm'
import { createInquiry } from '@/lib/persona'
import { kycRateLimiter } from '@/lib/rate-limit'
import { logAuditEvent, getClientIp } from '@/lib/audit'

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { success } = await kycRateLimiter.limit(userId)
  if (!success) {
    return Response.json({ error: 'Too many KYC requests. Please try again later.' }, { status: 429 })
  }

  const templateId = process.env.PERSONA_TEMPLATE_ID
  if (!templateId) {
    return Response.json({ error: 'Persona template not configured' }, { status: 500 })
  }

  // Fetch user to check current KYC status
  const user = await db.query.users.findFirst({ where: eq(users.id, userId) })
  if (!user) {
    return Response.json({ error: 'User not found' }, { status: 404 })
  }

  if (user.kycStatus === 'approved') {
    return Response.json({ error: 'KYC already approved' }, { status: 409 })
  }

  const inquiry = await createInquiry({
    templateId,
    referenceId: userId,
    fields: {
      nameFirst: user.fullName.split(' ')[0],
      nameLast: user.fullName.split(' ').slice(1).join(' ') || undefined,
      emailAddress: user.email,
    },
  })

  await logAuditEvent({
    userId,
    action: 'kyc.inquiry_created',
    entityType: 'kyc',
    entityId: inquiry.id,
    metadata: { previousStatus: user.kycStatus },
    ipAddress: getClientIp(req),
  })

  return Response.json({
    inquiryId: inquiry.id,
    sessionToken: inquiry.attributes.sessionToken,
  })
}
