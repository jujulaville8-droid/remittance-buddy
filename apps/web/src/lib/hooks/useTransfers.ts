'use client'

import { useCallback, useEffect, useState } from 'react'
import { transfersStore, type LocalTransfer, type LocalTransferStatus } from '@/lib/local-db'
import * as transfersDb from '@/lib/db/transfers'
import type { TransferRow } from '@/lib/db/types'
import { useSessionUser } from './useSessionUser'

function rowToLocal(row: TransferRow): LocalTransfer {
  return {
    id: row.id,
    recipientId: row.recipient_id ?? '',
    recipientName: row.recipient_name,
    sourceAmount: Number(row.source_amount),
    sourceCurrency: row.source_currency,
    targetAmount: Number(row.target_amount),
    targetCurrency: row.target_currency,
    exchangeRate: Number(row.exchange_rate),
    providerFee: Number(row.provider_fee),
    buddyFee: Number(row.buddy_fee),
    totalCost: Number(row.total_cost),
    provider: row.provider,
    providerSlug: row.provider_slug,
    status: row.status,
    statusHistory: row.status_history as ReadonlyArray<{ status: LocalTransferStatus; at: string }>,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deliveredAt: row.delivered_at,
  }
}

export interface UseTransfersResult {
  readonly transfers: readonly LocalTransfer[]
  readonly loading: boolean
  readonly refresh: () => Promise<void>
}

export function useTransfers(): UseTransfersResult {
  const { user, loading: sessionLoading } = useSessionUser()
  const [transfers, setTransfers] = useState<LocalTransfer[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      if (user) {
        const rows = await transfersDb.listTransfers()
        setTransfers(rows.map(rowToLocal))
      } else {
        setTransfers(transfersStore.list())
      }
    } catch (err) {
      console.warn('[useTransfers] refresh failed:', err)
      setTransfers(transfersStore.list())
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (sessionLoading) return
    refresh()
  }, [sessionLoading, refresh])

  return { transfers, loading, refresh }
}
