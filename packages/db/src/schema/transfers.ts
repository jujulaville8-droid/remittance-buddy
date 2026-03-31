import { pgTable, text, integer, timestamp, pgEnum, jsonb, uuid } from 'drizzle-orm/pg-core'
import { users } from './users'

export const transferStatusEnum = pgEnum('transfer_status', [
  'quote',
  'pending',
  'processing',
  'completed',
  'failed',
  'cancelled',
])

export const transferProviderEnum = pgEnum('transfer_provider', ['wise', 'currencycloud'])

export const transfers = pgTable('transfers', {
  id: uuid('id').primaryKey().defaultRandom(),
  senderId: text('sender_id')
    .notNull()
    .references(() => users.id),
  sourceCurrency: text('source_currency').notNull(), // e.g. "USD"
  sourceAmountCents: integer('source_amount_cents').notNull(),
  targetCurrency: text('target_currency').notNull(), // e.g. "MXN"
  targetAmountCents: integer('target_amount_cents').notNull(),
  fxRate: text('fx_rate').notNull(), // stored as string to avoid float precision issues
  feeCents: integer('fee_cents').notNull().default(0),
  recipientName: text('recipient_name').notNull(),
  recipientCountry: text('recipient_country').notNull(),
  recipientBankAccount: jsonb('recipient_bank_account').notNull(), // encrypted before insert
  status: transferStatusEnum('status').notNull().default('quote'),
  provider: transferProviderEnum('provider').notNull().default('wise'),
  providerTransferId: text('provider_transfer_id'),
  complianceCheckId: text('compliance_check_id'),
  idempotencyKey: text('idempotency_key').notNull().unique(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export type Transfer = typeof transfers.$inferSelect
export type NewTransfer = typeof transfers.$inferInsert
