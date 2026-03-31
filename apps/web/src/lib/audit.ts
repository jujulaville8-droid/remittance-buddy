import { db, auditLogs } from '@remit/db'

interface AuditEvent {
  userId: string
  action: string
  entityType?: string
  entityId?: string
  metadata?: Record<string, unknown>
  ipAddress?: string
}

/**
 * Record a security-relevant event to the audit log.
 * Failures are swallowed so audit logging never breaks the main request flow.
 */
export async function logAuditEvent(event: AuditEvent): Promise<void> {
  try {
    await db.insert(auditLogs).values(event)
  } catch (err) {
    console.error('[audit] Failed to write audit log:', err)
  }
}

/** Extract the client IP from a Next.js Request, preferring forwarded headers. */
export function getClientIp(req: Request): string | undefined {
  const forwarded = req.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0]?.trim()
  return req.headers.get('x-real-ip') ?? undefined
}
