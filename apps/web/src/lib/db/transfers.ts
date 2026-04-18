/**
 * Transfers — Supabase-backed CRUD.
 * RLS scoped to auth.uid() = user_id.
 */

import { createClient as createBrowserClient } from '@/lib/supabase/client'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { TransferRow, TransferStatus } from './types'

type Client = ReturnType<typeof createBrowserClient> | SupabaseClient
function client(explicit?: Client): Client {
  return explicit ?? createBrowserClient()
}

export async function listTransfers(supabase?: Client, limit = 50): Promise<TransferRow[]> {
  const { data, error } = await client(supabase)
    .from('transfers')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return (data ?? []) as TransferRow[]
}

export async function getTransfer(id: string, supabase?: Client): Promise<TransferRow | null> {
  const { data, error } = await client(supabase)
    .from('transfers')
    .select('*')
    .eq('id', id)
    .maybeSingle()
  if (error) throw error
  return (data as TransferRow | null) ?? null
}

export interface TransferInput {
  readonly recipient_id?: string | null
  readonly recipient_name: string
  readonly source_amount: number
  readonly source_currency: string
  readonly target_amount: number
  readonly target_currency: string
  readonly exchange_rate: number
  readonly provider_fee: number
  readonly buddy_fee: number
  readonly total_cost: number
  readonly provider: string
  readonly provider_slug: string
  readonly status?: TransferStatus
}

export async function createTransfer(
  input: TransferInput,
  supabase?: Client,
): Promise<TransferRow> {
  const status: TransferStatus = input.status ?? 'quote'
  const { data, error } = await client(supabase)
    .from('transfers')
    .insert({
      recipient_id: input.recipient_id ?? null,
      recipient_name: input.recipient_name,
      source_amount: input.source_amount,
      source_currency: input.source_currency,
      target_amount: input.target_amount,
      target_currency: input.target_currency,
      exchange_rate: input.exchange_rate,
      provider_fee: input.provider_fee,
      buddy_fee: input.buddy_fee,
      total_cost: input.total_cost,
      provider: input.provider,
      provider_slug: input.provider_slug,
      status,
      status_history: [{ status, at: new Date().toISOString() }],
    })
    .select('*')
    .single()
  if (error) throw error
  return data as TransferRow
}

/** Append a new status event to status_history and update the status field. */
export async function advanceTransferStatus(
  id: string,
  next: TransferStatus,
  supabase?: Client,
): Promise<TransferRow> {
  const sb = client(supabase)
  const { data: current, error: readErr } = await sb
    .from('transfers')
    .select('status_history')
    .eq('id', id)
    .single()
  if (readErr) throw readErr
  const history = Array.isArray((current as { status_history?: unknown }).status_history)
    ? ((current as { status_history: unknown[] }).status_history as Array<{ status: TransferStatus; at: string }>)
    : []
  const nextHistory = [...history, { status: next, at: new Date().toISOString() }]
  const patch: Record<string, unknown> = { status: next, status_history: nextHistory }
  if (next === 'delivered') patch.delivered_at = new Date().toISOString()
  const { data, error } = await sb
    .from('transfers')
    .update(patch)
    .eq('id', id)
    .select('*')
    .single()
  if (error) throw error
  return data as TransferRow
}
