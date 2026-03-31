import { pgTable, text, timestamp, pgEnum, jsonb, uuid } from 'drizzle-orm/pg-core'

export const checkTypeEnum = pgEnum('check_type', ['kyc', 'aml', 'sanctions'])
export const checkResultEnum = pgEnum('check_result', ['pass', 'fail', 'review'])

export const complianceChecks = pgTable('compliance_checks', {
  id: uuid('id').primaryKey().defaultRandom(),
  entityType: text('entity_type').notNull(), // 'user' | 'transfer'
  entityId: text('entity_id').notNull(),
  checkType: checkTypeEnum('check_type').notNull(),
  provider: text('provider').notNull(), // 'persona' | 'sardine'
  providerRef: text('provider_ref'),
  result: checkResultEnum('result').notNull(),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export type ComplianceCheck = typeof complianceChecks.$inferSelect
export type NewComplianceCheck = typeof complianceChecks.$inferInsert
