/**
 * Recipients — Supabase-backed CRUD.
 *
 * Client-side: uses the browser Supabase client; RLS ensures only the
 * authed user's rows are touched.
 * Server-side: pass a pre-created server client (from lib/supabase/server).
 */

import { createClient as createBrowserClient } from '@/lib/supabase/client'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { PayoutMethod, RecipientRow } from './types'

type Client = ReturnType<typeof createBrowserClient> | SupabaseClient

function client(explicit?: Client): Client {
  return explicit ?? createBrowserClient()
}

export async function listRecipients(supabase?: Client): Promise<RecipientRow[]> {
  const { data, error } = await client(supabase)
    .from('recipients')
    .select('*')
    .order('last_used_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as RecipientRow[]
}

export async function getRecipient(
  id: string,
  supabase?: Client,
): Promise<RecipientRow | null> {
  const { data, error } = await client(supabase)
    .from('recipients')
    .select('*')
    .eq('id', id)
    .maybeSingle()
  if (error) throw error
  return (data as RecipientRow | null) ?? null
}

export interface RecipientInput {
  readonly full_name: string
  readonly relationship?: string | null
  readonly country: string
  readonly payout_method: PayoutMethod
  readonly gcash_number?: string | null
  readonly maya_number?: string | null
  readonly bank_code?: string | null
  readonly bank_account_number?: string | null
  readonly avatar_color?: string
}

export async function createRecipient(
  input: RecipientInput,
  supabase?: Client,
): Promise<RecipientRow> {
  const { data, error } = await client(supabase)
    .from('recipients')
    .insert({
      full_name: input.full_name,
      relationship: input.relationship ?? null,
      country: input.country,
      payout_method: input.payout_method,
      gcash_number: input.gcash_number ?? null,
      maya_number: input.maya_number ?? null,
      bank_code: input.bank_code ?? null,
      bank_account_number: input.bank_account_number ?? null,
      avatar_color: input.avatar_color ?? 'bg-coral-500',
    })
    .select('*')
    .single()
  if (error) throw error
  return data as RecipientRow
}

export async function updateRecipient(
  id: string,
  patch: Partial<RecipientInput>,
  supabase?: Client,
): Promise<RecipientRow> {
  const { data, error } = await client(supabase)
    .from('recipients')
    .update(patch)
    .eq('id', id)
    .select('*')
    .single()
  if (error) throw error
  return data as RecipientRow
}

export async function deleteRecipient(id: string, supabase?: Client): Promise<void> {
  const { error } = await client(supabase).from('recipients').delete().eq('id', id)
  if (error) throw error
}

/** Bump send_count + last_used_at when a recipient is used in a transfer. */
export async function touchRecipient(id: string, supabase?: Client): Promise<void> {
  const sb = client(supabase)
  const { data: current } = await sb
    .from('recipients')
    .select('send_count')
    .eq('id', id)
    .single()
  if (!current) return
  const { error } = await sb
    .from('recipients')
    .update({
      send_count: (current as { send_count: number }).send_count + 1,
      last_used_at: new Date().toISOString(),
    })
    .eq('id', id)
  if (error) throw error
}
