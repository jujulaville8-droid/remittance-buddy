import { pgTable, text, timestamp, jsonb, uuid } from 'drizzle-orm/pg-core'

export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull(),
  action: text('action').notNull(), // e.g. 'transfer.created', 'payment.initiated', 'kyc.created'
  entityType: text('entity_type'), // 'transfer' | 'payment' | 'kyc' | 'user'
  entityId: text('entity_id'),
  metadata: jsonb('metadata'),
  ipAddress: text('ip_address'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export type AuditLog = typeof auditLogs.$inferSelect
export type NewAuditLog = typeof auditLogs.$inferInsert
