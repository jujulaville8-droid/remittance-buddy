/**
 * Supabase service-role client for privileged server-side operations
 * (webhooks, crons, migrations). Bypasses RLS — use only for actions
 * the server MUST perform on behalf of a user who isn't in the current
 * request's session (e.g., a Stripe webhook updating another user's
 * subscription state).
 *
 * NEVER import from a client component.
 */

import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) {
    throw new Error(
      'Supabase service client missing env: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY required',
    )
  }
  return createSupabaseClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
