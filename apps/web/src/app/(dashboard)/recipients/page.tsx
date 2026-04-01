import { createClient } from '@/lib/supabase/server'
import { db, recipients } from '@remit/db'
import { eq } from 'drizzle-orm'
import Link from 'next/link'
import { RecipientsClient } from './recipients-client'

export default async function RecipientsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const userId = user.id

  const rows = await db.query.recipients.findMany({
    where: eq(recipients.userId, userId),
    orderBy: (r, { desc }) => [desc(r.createdAt)],
  })

  return (
    <main className="p-8 max-w-3xl">
      <div className="mb-4">
        <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">
          ← Back to dashboard
        </Link>
      </div>
      <RecipientsClient initialRecipients={rows} />
    </main>
  )
}
