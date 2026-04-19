/**
 * Rate alerts — Supabase-backed CRUD.
 * Cron scans the `active=true` rows and computes matches.
 */

import { createClient as createBrowserClient } from '@/lib/supabase/client'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { PayoutMethod, RateAlertRow } from './types'

type Client = ReturnType<typeof createBrowserClient> | SupabaseClient
function client(explicit?: Client): Client {
  return explicit ?? createBrowserClient()
}

export async function listRateAlerts(supabase?: Client): Promise<RateAlertRow[]> {
  const { data, error } = await client(supabase)
    .from('rate_alerts')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as RateAlertRow[]
}

export interface RateAlertInput {
  readonly email: string
  readonly corridor: string
  readonly source_currency: string
  readonly target_currency: string
  readonly target_rate: number
  readonly payout_method: PayoutMethod
}

export async function createRateAlert(
  input: RateAlertInput,
  supabase?: Client,
): Promise<RateAlertRow> {
  const { data, error } = await client(supabase)
    .from('rate_alerts')
    .insert({ ...input, active: true })
    .select('*')
    .single()
  if (error) throw error
  return data as RateAlertRow
}

export async function toggleRateAlert(
  id: string,
  active: boolean,
  supabase?: Client,
): Promise<void> {
  const { error } = await client(supabase)
    .from('rate_alerts')
    .update({ active })
    .eq('id', id)
  if (error) throw error
}

export async function deleteRateAlert(id: string, supabase?: Client): Promise<void> {
  const { error } = await client(supabase).from('rate_alerts').delete().eq('id', id)
  if (error) throw error
}

export async function markRateAlertTriggered(
  id: string,
  supabase?: Client,
): Promise<void> {
  const { error } = await client(supabase)
    .from('rate_alerts')
    .update({ last_triggered_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw error
}

/** Cron helper — pulls every active alert across all users (service role only). */
export async function listAllActiveAlerts(
  serviceClient: SupabaseClient,
): Promise<RateAlertRow[]> {
  const { data, error } = await serviceClient
    .from('rate_alerts')
    .select('*')
    .eq('active', true)
  if (error) throw error
  return (data ?? []) as RateAlertRow[]
}
