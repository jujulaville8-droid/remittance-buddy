'use client'

import { useCallback, useEffect, useState } from 'react'
import { buddyPlusStore, type LocalBuddyPlusState } from '@/lib/local-db'
import * as buddyPlusDb from '@/lib/db/buddy-plus'
import type { BuddyPlusRow } from '@/lib/db/types'
import { useSessionUser } from './useSessionUser'

function rowToLocal(row: BuddyPlusRow | null): LocalBuddyPlusState | null {
  if (!row) return null
  return {
    active: row.active,
    checkoutSessionId: row.checkout_session_id,
    subscriptionId: row.subscription_id,
    periodEnd: row.period_end,
  }
}

export interface UseBuddyPlusResult {
  readonly state: LocalBuddyPlusState | null
  readonly isActive: boolean
  readonly loading: boolean
  readonly refresh: () => Promise<void>
}

export function useBuddyPlus(): UseBuddyPlusResult {
  const { user, loading: sessionLoading } = useSessionUser()
  const [state, setState] = useState<LocalBuddyPlusState | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      if (user) {
        const row = await buddyPlusDb.getBuddyPlus()
        setState(rowToLocal(row))
      } else {
        setState(buddyPlusStore.get())
      }
    } catch (err) {
      console.warn('[useBuddyPlus] refresh failed:', err)
      setState(buddyPlusStore.get())
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (sessionLoading) return
    refresh()
  }, [sessionLoading, refresh])

  const isActive = Boolean(
    state?.active &&
      (!state.periodEnd || new Date(state.periodEnd).getTime() > Date.now()),
  )

  return { state, isActive, loading, refresh }
}
