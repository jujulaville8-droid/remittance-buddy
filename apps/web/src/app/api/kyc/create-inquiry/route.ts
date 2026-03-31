import { auth } from '@clerk/nextjs/server'
import { db, users } from '@remit/db'
import { eq } from 'drizzle-orm'
import { createInquiry } from '@/lib/persona'

export async function POST() {
  const { userId } = await auth()
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
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

  return Response.json({
    inquiryId: inquiry.id,
    sessionToken: inquiry.attributes.sessionToken,
  })
}
