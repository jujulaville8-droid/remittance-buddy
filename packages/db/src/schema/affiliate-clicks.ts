import { pgTable, text, timestamp, uuid, decimal } from 'drizzle-orm/pg-core'

export const affiliateClicks = pgTable('affiliate_clicks', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id'),
  provider: text('provider').notNull(),
  network: text('network'), // 'impact' | 'cj' | 'wise-direct' | 'none'
  context: text('context').notNull(), // 'popup' | 'chat' | 'comparison'
  corridor: text('corridor').notNull().default('USD-PHP'),
  amountUsd: decimal('amount_usd', { precision: 12, scale: 2 }),
  affiliateUrl: text('affiliate_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export type AffiliateClick = typeof affiliateClicks.$inferSelect
export type NewAffiliateClick = typeof affiliateClicks.$inferInsert
