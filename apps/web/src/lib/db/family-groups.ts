/**
 * Family groups — shared sending pools.
 * Owner creates; members can view; recipients link into the group.
 */

import { createClient as createBrowserClient } from '@/lib/supabase/client'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { FamilyGroupRow, FamilyGroupMemberRow, RecipientRow } from './types'

type Client = ReturnType<typeof createBrowserClient> | SupabaseClient
function client(explicit?: Client): Client {
  return explicit ?? createBrowserClient()
}

export interface FamilyGroupInput {
  readonly name: string
  readonly goal_label?: string | null
  readonly goal_target_amount?: number | null
  readonly goal_currency?: string | null
}

export async function listFamilyGroups(supabase?: Client): Promise<FamilyGroupRow[]> {
  const { data, error } = await client(supabase)
    .from('family_groups')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as FamilyGroupRow[]
}

export async function createFamilyGroup(
  input: FamilyGroupInput,
  supabase?: Client,
): Promise<FamilyGroupRow> {
  const sb = client(supabase)
  const { data: group, error } = await sb
    .from('family_groups')
    .insert({
      name: input.name,
      goal_label: input.goal_label ?? null,
      goal_target_amount: input.goal_target_amount ?? null,
      goal_currency: input.goal_currency ?? null,
    })
    .select('*')
    .single()
  if (error) throw error
  // Auto-add creator as owner member
  const { data: user } = await sb.auth.getUser()
  if (user.user) {
    await sb.from('family_group_members').insert({
      group_id: (group as FamilyGroupRow).id,
      user_id: user.user.id,
      role: 'owner',
    })
  }
  return group as FamilyGroupRow
}

export async function updateFamilyGroup(
  id: string,
  patch: Partial<FamilyGroupInput>,
  supabase?: Client,
): Promise<FamilyGroupRow> {
  const { data, error } = await client(supabase)
    .from('family_groups')
    .update(patch)
    .eq('id', id)
    .select('*')
    .single()
  if (error) throw error
  return data as FamilyGroupRow
}

export async function deleteFamilyGroup(id: string, supabase?: Client): Promise<void> {
  const { error } = await client(supabase).from('family_groups').delete().eq('id', id)
  if (error) throw error
}

export async function listGroupMembers(
  groupId: string,
  supabase?: Client,
): Promise<FamilyGroupMemberRow[]> {
  const { data, error } = await client(supabase)
    .from('family_group_members')
    .select('*')
    .eq('group_id', groupId)
  if (error) throw error
  return (data ?? []) as FamilyGroupMemberRow[]
}

export async function addGroupMember(
  groupId: string,
  userId: string,
  role: 'owner' | 'member' = 'member',
  supabase?: Client,
): Promise<void> {
  const { error } = await client(supabase).from('family_group_members').insert({
    group_id: groupId,
    user_id: userId,
    role,
  })
  if (error) throw error
}

export async function removeGroupMember(
  groupId: string,
  userId: string,
  supabase?: Client,
): Promise<void> {
  const { error } = await client(supabase)
    .from('family_group_members')
    .delete()
    .eq('group_id', groupId)
    .eq('user_id', userId)
  if (error) throw error
}

export async function linkRecipientToGroup(
  groupId: string,
  recipientId: string,
  supabase?: Client,
): Promise<void> {
  const { error } = await client(supabase)
    .from('family_group_recipients')
    .insert({ group_id: groupId, recipient_id: recipientId })
  if (error) throw error
}

export async function unlinkRecipientFromGroup(
  groupId: string,
  recipientId: string,
  supabase?: Client,
): Promise<void> {
  const { error } = await client(supabase)
    .from('family_group_recipients')
    .delete()
    .eq('group_id', groupId)
    .eq('recipient_id', recipientId)
  if (error) throw error
}

export async function listGroupRecipients(
  groupId: string,
  supabase?: Client,
): Promise<RecipientRow[]> {
  const { data, error } = await client(supabase)
    .from('family_group_recipients')
    .select('recipients(*)')
    .eq('group_id', groupId)
  if (error) throw error
  return (data ?? []).flatMap((row: { recipients: RecipientRow | RecipientRow[] | null }) => {
    if (!row.recipients) return []
    return Array.isArray(row.recipients) ? row.recipients : [row.recipients]
  })
}
