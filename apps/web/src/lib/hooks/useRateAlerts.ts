'use client'

import { useCallback, useEffect, useState } from 'react'
import { rateAlertsStore, type LocalRateAlert } from '@/lib/local-db'
import * as rateAlertsDb from '@/lib/db/rate-alerts'
import type { RateAlertRow, PayoutMethod } from '@/lib/db/types'
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

export type RateAlertInput = Omit<
  LocalRateAlert,
  'id' | 'createdAt' | 'lastTriggeredAt' | 'active'
>

export interface UseRateAlertsResult {
  readonly alerts: readonly LocalRateAlert[]
  readonly loading: boolean
  readonly create: (input: RateAlertInput) => Promise<LocalRateAlert>
  readonly toggle: (id: string, active: boolean) => Promise<void>
  readonly remove: (id: string) => Promise<void>
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

  const create = useCallback(
    async (input: RateAlertInput): Promise<LocalRateAlert> => {
      if (user) {
        const row = await rateAlertsDb.createRateAlert({
          email: input.email,
          corridor: input.corridor,
          source_currency: input.sourceCurrency,
          target_currency: input.targetCurrency,
          target_rate: input.targetRate,
          payout_method: input.payoutMethod as PayoutMethod,
        })
        const created = rowToLocal(row)
        setAlerts((prev) => [created, ...prev])
        return created
      }
      const created = rateAlertsStore.create(input as Omit<LocalRateAlert, 'id' | 'createdAt' | 'lastTriggeredAt'>)
      setAlerts((prev) => [created, ...prev])
      return created
    },
    [user],
  )

  const toggle = useCallback(
    async (id: string, active: boolean): Promise<void> => {
      if (user) {
        await rateAlertsDb.toggleRateAlert(id, active)
      } else {
        rateAlertsStore.setActive(id, active)
      }
      setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, active } : a)))
    },
    [user],
  )

  const remove = useCallback(
    async (id: string): Promise<void> => {
      if (user) {
        await rateAlertsDb.deleteRateAlert(id)
      } else {
        rateAlertsStore.remove(id)
      }
      setAlerts((prev) => prev.filter((a) => a.id !== id))
    },
    [user],
  )

  return { alerts, loading, create, toggle, remove, refresh }
}
