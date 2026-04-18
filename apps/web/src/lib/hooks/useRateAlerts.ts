'use client'

import { useCallback, useEffect, useState } from 'react'
import { rateAlertsStore, type LocalRateAlert } from '@/lib/local-db'
import * as rateAlertsDb from '@/lib/db/rate-alerts'
import type { RateAlertRow } from '@/lib/db/types'
import { useSessionUser } from './useSessionUser'

function rowToLocal(row: RateAlertRow): LocalRateAlert {
  return {
    id: row.id,
    email: row.email,
    corridor: row.corridor,
    sourceCurrency: row.source_currency,
    targetCurrency: row.target_currency,
    targetRate: Number(row.target_rate),
    payoutMethod: row.payout_method,
    active: row.active,
    createdAt: row.created_at,
    lastTriggeredAt: row.last_triggered_at,
  }
}

export interface UseRateAlertsResult {
  readonly alerts: readonly LocalRateAlert[]
  readonly loading: boolean
  readonly refresh: () => Promise<void>
}

export function useRateAlerts(): UseRateAlertsResult {
  const { user, loading: sessionLoading } = useSessionUser()
  const [alerts, setAlerts] = useState<LocalRateAlert[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      if (user) {
        const rows = await rateAlertsDb.listRateAlerts()
        setAlerts(rows.map(rowToLocal))
      } else {
        setAlerts(rateAlertsStore.list())
      }
    } catch (err) {
      console.warn('[useRateAlerts] refresh failed:', err)
      setAlerts(rateAlertsStore.list())
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (sessionLoading) return
    refresh()
  }, [sessionLoading, refresh])

  return { alerts, loading, refresh }
}
