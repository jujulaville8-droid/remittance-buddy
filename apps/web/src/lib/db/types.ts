/**
 * Row types for the platform tables.
 * Mirror columns from packages/db/migrations/0001_platform_init.sql.
 * Keep in sync manually (we're not generating from Postgres yet).
 */

export type PayoutMethod = 'gcash' | 'maya' | 'bank' | 'cash_pickup'

export type TransferStatus =
  | 'quote'
  | 'awaiting_payment'
  | 'payment_received'
  | 'processing'
  | 'delivered'
  | 'failed'
  | 'cancelled'

export type AffiliateContext = 'popup' | 'hero' | 'compare' | 'sidepanel'

export interface RecipientRow {
  readonly id: string
  readonly user_id: string
  readonly full_name: string
  readonly relationship: string | null
  readonly country: string
  readonly payout_method: PayoutMethod
  readonly gcash_number: string | null
  readonly maya_number: string | null
  readonly bank_code: string | null
  readonly bank_account_number: string | null
  readonly avatar_color: string
  readonly send_count: number
  readonly last_used_at: string | null
  readonly created_at: string
}

export interface TransferRow {
  readonly id: string
  readonly user_id: string
  readonly recipient_id: string | null
  readonly recipient_name: string
  readonly source_amount: string // numeric comes back as string from pg
  readonly source_currency: string
  readonly target_amount: string
  readonly target_currency: string
  readonly exchange_rate: string
  readonly provider_fee: string
  readonly buddy_fee: string
  readonly total_cost: string
  readonly provider: string
  readonly provider_slug: string
  readonly provider_transfer_id: string | null
  readonly status: TransferStatus
  readonly status_history: ReadonlyArray<{ readonly status: TransferStatus; readonly at: string }>
  readonly delivered_at: string | null
  readonly created_at: string
  readonly updated_at: string
}

export interface RateAlertRow {
  readonly id: string
  readonly user_id: string
  readonly email: string
  readonly corridor: string
  readonly source_currency: string
  readonly target_currency: string
  readonly target_rate: string
  readonly payout_method: PayoutMethod
  readonly active: boolean
  readonly last_triggered_at: string | null
  readonly created_at: string
}

export interface AffiliateClickRow {
  readonly id: string
  readonly user_id: string | null
  readonly provider: string
  readonly amount: string
  readonly affiliate_url: string
  readonly context: AffiliateContext
  readonly clicked_at: string
}

export interface FamilyGroupRow {
  readonly id: string
  readonly owner_id: string
  readonly name: string
  readonly goal_label: string | null
  readonly goal_target_amount: string | null
  readonly goal_currency: string | null
  readonly created_at: string
}

export interface FamilyGroupMemberRow {
  readonly group_id: string
  readonly user_id: string
  readonly role: 'owner' | 'member'
  readonly added_at: string
}

export interface AuditLogRow {
  readonly id: string
  readonly user_id: string | null
  readonly action: string
  readonly entity_type: string | null
  readonly entity_id: string | null
  readonly metadata: Record<string, unknown>
  readonly created_at: string
}

export interface BuddyPlusRow {
  readonly user_id: string
  readonly active: boolean
  readonly checkout_session_id: string | null
  readonly subscription_id: string | null
  readonly period_end: string | null
  readonly updated_at: string
}
