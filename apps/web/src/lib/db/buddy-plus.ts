/**
 * Buddy Plus subscription state (one row per user).
 * Updated by the Stripe webhook handler; read by UI gates.
 */

import { createClient as createBrowserClient } from '@/lib/supabase/client'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { BuddyPlusRow } from './types'

type Client = ReturnType<typeof createBrowserClient> | SupabaseClient
function client(explicit?: Client): Client {
  return explicit ?? createBrowserClient()
}

export async function getBuddyPlus(supabase?: Client): Promise<BuddyPlusRow | null> {
  const { data, error } = await client(supabase)
    .from('buddy_plus_state')
    .select('*')
    .maybeSingle()
  if (error) throw error
  return (data as BuddyPlusRow | null) ?? null
}

export async function isBuddyPlusActive(supabase?: Client): Promise<boolean> {
  const row = await getBuddyPlus(supabase)
  if (!row?.active) return false
  if (!row.period_end) return true
  return new Date(row.period_end).getTime() > Date.now()
}

export interface BuddyPlusUpsert {
  readonly user_id: string
  readonly active: boolean
  readonly checkout_session_id?: string | null
  readonly subscription_id?: string | null
  readonly period_end?: string | null
}

export async function upsertBuddyPlus(
  input: BuddyPlusUpsert,
  supabase: Client,
): Promise<void> {
  const { error } = await client(supabase)
    .from('buddy_plus_state')
    .upsert(input, { onConflict: 'user_id' })
  if (error) throw error
}
