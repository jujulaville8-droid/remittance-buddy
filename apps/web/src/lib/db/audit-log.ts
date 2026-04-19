/**
 * Audit log — append-only activity trail.
 * Writes usually come from server routes with the service role client;
 * users can read their own rows via the RLS policy.
 */

import { createClient as createBrowserClient } from '@/lib/supabase/client'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { AuditLogRow } from './types'

type Client = ReturnType<typeof createBrowserClient> | SupabaseClient
function client(explicit?: Client): Client {
  return explicit ?? createBrowserClient()
}

export interface AuditEvent {
  readonly action: string
  readonly entity_type?: string
  readonly entity_id?: string
  readonly metadata?: Record<string, unknown>
  readonly user_id?: string | null
}

/**
 * Write an audit event. Fire-and-forget by design — never bubble failures
 * up to the caller. Logging gaps are acceptable; transactional breakage is not.
 */
export async function audit(event: AuditEvent, supabase?: Client): Promise<void> {
  try {
    await client(supabase).from('audit_log').insert({
      action: event.action,
      entity_type: event.entity_type ?? null,
      entity_id: event.entity_id ?? null,
      metadata: event.metadata ?? {},
      user_id: event.user_id ?? null,
    })
  } catch (err) {
    console.warn('[audit] insert failed:', err)
  }
}

export async function listMyAuditLog(supabase?: Client, limit = 100): Promise<AuditLogRow[]> {
  const { data, error } = await client(supabase)
    .from('audit_log')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return (data ?? []) as AuditLogRow[]
}
