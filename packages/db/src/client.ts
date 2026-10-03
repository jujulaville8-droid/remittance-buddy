import postgres from 'postgres'
import { drizzle } from 'drizzle-orm/postgres-js'
import * as schema from './schema/index'

const connectionString = process.env.DATABASE_URL!

const sql = postgres(connectionString, {
  connection: {
    application_name: 'remittance-buddy',
  },
})

export const db = drizzle(sql, { schema })
export type Database = typeof db
