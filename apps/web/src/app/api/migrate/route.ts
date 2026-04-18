/**
 * POST /api/migrate — push a localStorage payload into Supabase Postgres.
 *
 * Auth: reads the Supabase session from cookies via `lib/supabase/server`.
 * RLS then scopes every insert to `auth.uid() = user_id` automatically.
 *
 * Idempotency: we onConflict-ignore on the primary key. Client-generated
 * UUIDs become Postgres PKs, so replaying the same payload is a no-op.
 *
 * Tolerance: one bad row doesn't abort the rest — each slice reports
 * counts + errors independently.
 */

import { NextResponse } from 'next/server'
import { z } from 'zod'
import * as Sentry from '@sentry/nextjs'
import { createClient } from '@/lib/supabase/server'

const recipientSchema = z.object({
  id: z.string(),
  fullName: z.string(),
  relationship: z.string().nullable(),
  country: z.string(),
  payoutMethod: z.enum(['gcash', 'maya', 'bank', 'cash_pickup']),
  gcashNumber: z.string().optional(),
  mayaNumber: z.string().optional(),
  bankCode: z.string().optional(),
  bankAccountNumber: z.string().optional(),
  avatarColor: z.string(),
  createdAt: z.string(),
  lastUsedAt: z.string().nullable(),
  sendCount: z.number(),
})

const transferSchema = z.object({
  id: z.string(),
  recipientId: z.string(),
  recipientName: z.string(),
  sourceAmount: z.number(),
  sourceCurrency: z.string(),
  targetAmount: z.number(),
  targetCurrency: z.string(),
  exchangeRate: z.number(),
  providerFee: z.number(),
  buddyFee: z.number(),
  totalCost: z.number(),
  provider: z.string(),
  providerSlug: z.string(),
  status: z.enum([
    'quote',
    'awaiting_payment',
    'payment_received',
    'processing',
    'delivered',
    'failed',
    'cancelled',
  ]),
  statusHistory: z.array(z.object({ status: z.string(), at: z.string() })),
  createdAt: z.string(),
  updatedAt: z.string(),
  deliveredAt: z.string().nullable(),
})

const affiliateClickSchema = z.object({
  id: z.string(),
  provider: z.string(),
  amount: z.number(),
  affiliateUrl: z.string(),
  context: z.enum(['popup', 'hero', 'compare', 'sidepanel']),
  clickedAt: z.string(),
  synced: z.boolean().optional(),
})

const familyGroupSchema = z.object({
  id: z.string(),
  name: z.string(),
  members: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      role: z.enum(['owner', 'member']),
    }),
  ),
  goal: z
    .object({
      label: z.string(),
      targetAmount: z.number(),
      currency: z.string(),
    })
    .nullable(),
  recipientIds: z.array(z.string()),
  createdAt: z.string(),
})

const rateAlertSchema = z.object({
  id: z.string(),
  email: z.string(),
  corridor: z.string(),
  sourceCurrency: z.string(),
  targetCurrency: z.string(),
  targetRate: z.number(),
  payoutMethod: z.enum(['gcash', 'maya', 'bank', 'cash_pickup']),
  active: z.boolean(),
  createdAt: z.string(),
  lastTriggeredAt: z.string().nullable(),
})

const payloadSchema = z.object({
  recipients: z.array(recipientSchema),
  transfers: z.array(transferSchema),
  affiliateClicks: z.array(affiliateClickSchema),
  familyGroups: z.array(familyGroupSchema),
  rateAlerts: z.array(rateAlertSchema),
  clientVersion: z.string(),
  generatedAt: z.string(),
})

type Payload = z.infer<typeof payloadSchema>

interface MigrationReport {
  ok: boolean
  migratedAt: string
  counts: Record<'recipients' | 'transfers' | 'affiliateClicks' | 'familyGroups' | 'rateAlerts', number>
  errors: string[]
}

type Supa = Awaited<ReturnType<typeof createClient>>

async function insertRecipients(
  supabase: Supa,
  userId: string,
  rows: Payload['recipients'],
  errors: string[],
): Promise<number> {
  if (rows.length === 0) return 0
  try {
    const payload = rows.map((r) => ({
      id: r.id,
      user_id: userId,
      full_name: r.fullName,
      relationship: r.relationship,
      country: r.country,
      payout_method: r.payoutMethod,
      gcash_number: r.gcashNumber ?? null,
      maya_number: r.mayaNumber ?? null,
      bank_code: r.bankCode ?? null,
      bank_account_number: r.bankAccountNumber ?? null,
      avatar_color: r.avatarColor,
      send_count: r.sendCount,
      last_used_at: r.lastUsedAt,
      created_at: r.createdAt,
    }))
    const { error, count } = await supabase
      .from('recipients')
      .upsert(payload, { onConflict: 'id', ignoreDuplicates: true, count: 'exact' })
    if (error) throw error
    return count ?? payload.length
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    errors.push(`recipients: ${msg}`)
    Sentry.captureException(err, { tags: { migrate: 'recipients' } })
    return 0
  }
}

async function insertTransfers(
  supabase: Supa,
  userId: string,
  rows: Payload['transfers'],
  errors: string[],
): Promise<number> {
  if (rows.length === 0) return 0
  try {
    const payload = rows.map((t) => ({
      id: t.id,
      user_id: userId,
      recipient_id: t.recipientId,
      recipient_name: t.recipientName,
      source_amount: t.sourceAmount,
      source_currency: t.sourceCurrency,
      target_amount: t.targetAmount,
      target_currency: t.targetCurrency,
      exchange_rate: t.exchangeRate,
      provider_fee: t.providerFee,
      buddy_fee: t.buddyFee,
      total_cost: t.totalCost,
      provider: t.provider,
      provider_slug: t.providerSlug,
      status: t.status,
      status_history: t.statusHistory,
      created_at: t.createdAt,
      updated_at: t.updatedAt,
      delivered_at: t.deliveredAt,
    }))
    const { error, count } = await supabase
      .from('transfers')
      .upsert(payload, { onConflict: 'id', ignoreDuplicates: true, count: 'exact' })
    if (error) throw error
    return count ?? payload.length
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    errors.push(`transfers: ${msg}`)
    Sentry.captureException(err, { tags: { migrate: 'transfers' } })
    return 0
  }
}

async function insertAffiliateClicks(
  supabase: Supa,
  userId: string,
  rows: Payload['affiliateClicks'],
  errors: string[],
): Promise<number> {
  if (rows.length === 0) return 0
  try {
    const payload = rows.map((c) => ({
      id: c.id,
      user_id: userId,
      provider: c.provider,
      amount: c.amount,
      affiliate_url: c.affiliateUrl,
      context: c.context,
      clicked_at: c.clickedAt,
    }))
    const { error, count } = await supabase
      .from('affiliate_clicks')
      .upsert(payload, { onConflict: 'id', ignoreDuplicates: true, count: 'exact' })
    if (error) throw error
    return count ?? payload.length
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    errors.push(`affiliateClicks: ${msg}`)
    Sentry.captureException(err, { tags: { migrate: 'affiliateClicks' } })
    return 0
  }
}

async function insertFamilyGroups(
  supabase: Supa,
  userId: string,
  rows: Payload['familyGroups'],
  errors: string[],
): Promise<number> {
  if (rows.length === 0) return 0
  try {
    const groupPayload = rows.map((g) => ({
      id: g.id,
      owner_id: userId,
      name: g.name,
      goal_label: g.goal?.label ?? null,
      goal_target_amount: g.goal?.targetAmount ?? null,
      goal_currency: g.goal?.currency ?? null,
      created_at: g.createdAt,
    }))
    const { error: groupErr } = await supabase
      .from('family_groups')
      .upsert(groupPayload, { onConflict: 'id', ignoreDuplicates: true })
    if (groupErr) throw groupErr

    // Member + recipient join rows are idempotent via composite PKs
    for (const g of rows) {
      const members = g.members.map((m) => ({
        group_id: g.id,
        user_id: m.id,
        role: m.role,
      }))
      if (members.length > 0) {
        await supabase
          .from('family_group_members')
          .upsert(members, { onConflict: 'group_id,user_id', ignoreDuplicates: true })
      }
      const recipients = g.recipientIds.map((rid) => ({
        group_id: g.id,
        recipient_id: rid,
      }))
      if (recipients.length > 0) {
        await supabase
          .from('family_group_recipients')
          .upsert(recipients, { onConflict: 'group_id,recipient_id', ignoreDuplicates: true })
      }
    }
    return rows.length
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    errors.push(`familyGroups: ${msg}`)
    Sentry.captureException(err, { tags: { migrate: 'familyGroups' } })
    return 0
  }
}

async function insertRateAlerts(
  supabase: Supa,
  userId: string,
  rows: Payload['rateAlerts'],
  errors: string[],
): Promise<number> {
  if (rows.length === 0) return 0
  try {
    const payload = rows.map((a) => ({
      id: a.id,
      user_id: userId,
      email: a.email,
      corridor: a.corridor,
      source_currency: a.sourceCurrency,
      target_currency: a.targetCurrency,
      target_rate: a.targetRate,
      payout_method: a.payoutMethod,
      active: a.active,
      last_triggered_at: a.lastTriggeredAt,
      created_at: a.createdAt,
    }))
    const { error, count } = await supabase
      .from('rate_alerts')
      .upsert(payload, { onConflict: 'id', ignoreDuplicates: true, count: 'exact' })
    if (error) throw error
    return count ?? payload.length
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    errors.push(`rateAlerts: ${msg}`)
    Sentry.captureException(err, { tags: { migrate: 'rateAlerts' } })
    return 0
  }
}

export async function POST(req: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = payloadSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', issues: parsed.error.issues },
      { status: 400 },
    )
  }

  const payload = parsed.data
  const errors: string[] = []

  const counts = {
    recipients: await insertRecipients(supabase, user.id, payload.recipients, errors),
    transfers: await insertTransfers(supabase, user.id, payload.transfers, errors),
    affiliateClicks: await insertAffiliateClicks(supabase, user.id, payload.affiliateClicks, errors),
    familyGroups: await insertFamilyGroups(supabase, user.id, payload.familyGroups, errors),
    rateAlerts: await insertRateAlerts(supabase, user.id, payload.rateAlerts, errors),
  }

  const report: MigrationReport = {
    ok: errors.length === 0,
    migratedAt: new Date().toISOString(),
    counts,
    errors,
  }

  return NextResponse.json(report)
}
