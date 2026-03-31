import { pgTable, text, timestamp, pgEnum } from 'drizzle-orm/pg-core'

export const kycStatusEnum = pgEnum('kyc_status', [
  'pending',
  'in_review',
  'approved',
  'rejected',
])

export const riskLevelEnum = pgEnum('risk_level', ['low', 'medium', 'high'])

export const users = pgTable('users', {
  id: text('id').primaryKey(), // Clerk user ID
  email: text('email').notNull().unique(),
  phone: text('phone'),
  fullName: text('full_name').notNull(),
  countryOfResidence: text('country_of_residence').notNull(),
  kycStatus: kycStatusEnum('kyc_status').notNull().default('pending'),
  kycProviderRef: text('kyc_provider_ref'),
  riskLevel: riskLevelEnum('risk_level').notNull().default('low'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
