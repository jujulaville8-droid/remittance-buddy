/**
 * Affiliate clicks — append-only log used for attribution.
 * Anonymous visitors may insert (user_id null); authed users see their own.
 */

import { createClient as createBrowserClient } from '@/lib/supabase/client'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { AffiliateContext, AffiliateClickRow } from './types'

type Client = ReturnType<typeof createBrowserClient> | SupabaseClient
function client(explicit?: Client): Client {
  return explicit ?? createBrowserClient()
}

export interface AffiliateClickInput {
  readonly provider: string
  readonly amount: number
  readonly affiliate_url: string
  readonly context: AffiliateContext
}

export async function logAffiliateClick(
  input: AffiliateClickInput,
  supabase?: Client,
): Promise<void> {
  const { error } = await client(supabase).from('affiliate_clicks').insert(input)
  // Don't throw — tracking shouldn't break the click-through UX.
  if (error) console.warn('[affiliate-clicks] log failed:', error.message)
}

export async function listMyAffiliateClicks(
  supabase?: Client,
  limit = 50,
): Promise<AffiliateClickRow[]> {
  const { data, error } = await client(supabase)
    .from('affiliate_clicks')
    .select('*')
    .order('clicked_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return (data ?? []) as AffiliateClickRow[]
}
