'use client'

import { useEffect, useRef } from 'react'
import { ensureMigrated } from '@/lib/migrate-local-db'
import { useSessionUser } from '@/lib/hooks/useSessionUser'

/**
 * Mount once at the app root. When the user signs in, fires a one-shot
 * migration of any localStorage data (built up pre-auth) into their
 * Supabase tables. No-ops after success via the state flag in
 * migrate-local-db.ts.
 */
export default function MigrationBridge() {
  const { user, loading } = useSessionUser()
  const ran = useRef(false)

  useEffect(() => {
    if (loading || !user || ran.current) return
    ran.current = true
    ensureMigrated()
      .then((report) => {
        if (report) {
          console.info('[migrate] ok:', report.counts)
        }
      })
      .catch((err) => {
        console.warn('[migrate] failed:', err)
      })
  }, [user, loading])

  return null
}
