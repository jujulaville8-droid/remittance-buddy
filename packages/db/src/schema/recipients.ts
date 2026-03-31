import { pgTable, text, timestamp, uuid, jsonb, boolean } from 'drizzle-orm/pg-core'
import { users } from './users'

export const recipients = pgTable('recipients', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(), // Full legal name
  nickname: text('nickname'), // Optional alias, e.g. "Mom"
  country: text('country').notNull(), // ISO 3166-1 alpha-2
  bankAccount: jsonb('bank_account').notNull(), // { type: string, details: Record<string, string> }
  isDefault: boolean('is_default').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export type Recipient = typeof recipients.$inferSelect
export type NewRecipient = typeof recipients.$inferInsert
