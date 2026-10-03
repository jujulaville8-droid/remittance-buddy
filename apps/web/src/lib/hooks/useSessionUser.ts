'use client'

import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'

/**
 * Returns the currently-authenticated Supabase user, or null for guests.
 * Updates live via Supabase's onAuthStateChange subscription so sign-in
 * or sign-out propagates without a page reload.
 */
export function useSessionUser(): { user: User | null; loading: boolean; refresh: () => void } {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [revision, setRevision] = useState(0)

  useEffect(() => {
    // Public comparison pages must work without account services configured.
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      setLoading(false)
      return
    }

    const supabase = createClient()
    let mounted = true

    supabase.auth.getUser().then(({ data }) => {
      if (!mounted) return
      setUser(data.user)
      setLoading(false)
    })

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return
      setUser(session?.user ?? null)
    })

    return () => {
      mounted = false
      sub.subscription.unsubscribe()
    }
  }, [revision])

  return { user, loading, refresh: () => setRevision(value => value + 1) }
}
