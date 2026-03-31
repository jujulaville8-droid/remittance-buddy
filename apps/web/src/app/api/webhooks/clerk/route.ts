import { headers } from 'next/headers'
import { Webhook } from 'svix'
import type { WebhookEvent } from '@clerk/nextjs/server'
import { db, users } from '@remit/db'
import { eq } from 'drizzle-orm'
import { logAuditEvent } from '@/lib/audit'

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET
  if (!WEBHOOK_SECRET) {
    return Response.json({ error: 'Webhook secret not configured' }, { status: 500 })
  }

  const headerPayload = await headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return Response.json({ error: 'Missing svix headers' }, { status: 400 })
  }

  // Use raw body text for signature verification — re-stringifying parsed JSON
  // can alter whitespace/key order and break the HMAC check.
  const body = await req.text()

  const wh = new Webhook(WEBHOOK_SECRET)
  let event: WebhookEvent

  try {
    event = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent
  } catch {
    return Response.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'user.created') {
    const { id, email_addresses, first_name, last_name } = event.data
    const primaryEmail = email_addresses.find((e) => e.id === event.data.primary_email_address_id)
    if (primaryEmail) {
      await db.insert(users).values({
        id,
        email: primaryEmail.email_address,
        fullName: `${first_name ?? ''} ${last_name ?? ''}`.trim() || 'Unknown',
        countryOfResidence: 'US', // updated during onboarding
      })
      await logAuditEvent({
        userId: id,
        action: 'user.created',
        entityType: 'user',
        entityId: id,
        metadata: { email: primaryEmail.email_address },
      })
    }
  }

  if (event.type === 'user.deleted') {
    const { id } = event.data
    if (id) {
      await db.delete(users).where(eq(users.id, id))
      await logAuditEvent({
        userId: id,
        action: 'user.deleted',
        entityType: 'user',
        entityId: id,
        metadata: {},
      })
    }
  }

  return Response.json({ received: true })
}
