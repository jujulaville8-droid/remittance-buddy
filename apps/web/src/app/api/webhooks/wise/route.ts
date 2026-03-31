import { headers } from 'next/headers'
import { db, transfers } from '@remit/db'
import { eq } from 'drizzle-orm'
import { verifyWiseWebhookSignature, mapWiseStatusToTransferStatus } from '@/lib/wise'
import type { WiseTransferStatus } from '@/lib/wise'

interface WiseWebhookEvent {
  event_type: string
  schema_version: string
  sent_at: string
  data: {
    resource: {
      type: string
      id: number
      profile_id: number
      account_id: number
    }
    current_state: WiseTransferStatus
    previous_state: WiseTransferStatus
    occurred_at: string
  }
}

export async function POST(req: Request) {
  const headerPayload = await headers()
  const signature = headerPayload.get('x-signature-sha256') ?? ''

  const rawBody = await req.text()

  const isValid = await verifyWiseWebhookSignature(rawBody, signature)
  if (!isValid) {
    return Response.json({ error: 'Invalid signature' }, { status: 401 })
  }

  let event: WiseWebhookEvent
  try {
    event = JSON.parse(rawBody) as WiseWebhookEvent
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (event.event_type !== 'transfers#state-change') {
    return Response.json({ received: true })
  }

  const wiseTransferId = String(event.data.resource.id)
  const wiseStatus = event.data.current_state
  const transferStatus = mapWiseStatusToTransferStatus(wiseStatus)

  await db
    .update(transfers)
    .set({
      status: transferStatus,
      updatedAt: new Date(),
    })
    .where(eq(transfers.providerTransferId, wiseTransferId))

  console.info(
    `[wise webhook] transfer ${wiseTransferId}: ${event.data.previous_state} → ${wiseStatus} (${transferStatus})`,
  )

  return Response.json({ received: true })
}
