'use client'

import { useCallback, useEffect, useState } from 'react'
import { recipientsStore, type LocalRecipient } from '@/lib/local-db'
import * as recipientsDb from '@/lib/db/recipients'
import type { RecipientRow, PayoutMethod } from '@/lib/db/types'
import { useSessionUser } from './useSessionUser'

/**
 * Unified recipients hook. Uses Supabase when the user is signed in;
 * falls back to localStorage for guests exploring the tool.
 *
 * Returns data in the **local shape** (`LocalRecipient`) regardless of
 * source, so existing consumers don't need to branch on auth state.
 */

function rowToLocal(row: RecipientRow): LocalRecipient {
  return {
    id: row.id,
    fullName: row.full_name,
    relationship: row.relationship,
    country: row.country,
    payoutMethod: row.payout_method,
    gcashNumber: row.gcash_number ?? undefined,
    mayaNumber: row.maya_number ?? undefined,
    bankCode: row.bank_code ?? undefined,
    bankAccountNumber: row.bank_account_number ?? undefined,
    avatarColor: row.avatar_color,
    createdAt: row.created_at,
    lastUsedAt: row.last_used_at,
    sendCount: row.send_count,
  }
}

export type RecipientInput = Omit<
  LocalRecipient,
  'id' | 'createdAt' | 'lastUsedAt' | 'sendCount' | 'avatarColor'
>

export interface UseRecipientsResult {
  readonly recipients: readonly LocalRecipient[]
  readonly loading: boolean
  readonly create: (input: RecipientInput) => Promise<LocalRecipient>
  readonly update: (id: string, patch: Partial<RecipientInput>) => Promise<LocalRecipient | null>
  readonly remove: (id: string) => Promise<void>
  readonly markUsed: (id: string) => Promise<void>
  readonly refresh: () => Promise<void>
}

export function useRecipients(): UseRecipientsResult {
  const { user, loading: sessionLoading } = useSessionUser()
  const [recipients, setRecipients] = useState<LocalRecipient[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      if (user) {
        const rows = await recipientsDb.listRecipients()
        setRecipients(rows.map(rowToLocal))
      } else {
        setRecipients(recipientsStore.list())
      }
    } catch (err) {
      console.warn('[useRecipients] refresh failed:', err)
      setRecipients(recipientsStore.list()) // safe fallback
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (sessionLoading) return
    refresh()
  }, [sessionLoading, refresh])

  const create = useCallback(
    async (input: RecipientInput): Promise<LocalRecipient> => {
      if (user) {
        const row = await recipientsDb.createRecipient({
          full_name: input.fullName,
          relationship: input.relationship,
          country: input.country,
          payout_method: input.payoutMethod as PayoutMethod,
          gcash_number: input.gcashNumber ?? null,
          maya_number: input.mayaNumber ?? null,
          bank_code: input.bankCode ?? null,
          bank_account_number: input.bankAccountNumber ?? null,
        })
        const created = rowToLocal(row)
        setRecipients((prev) => [created, ...prev])
        return created
      }
      const created = recipientsStore.create(input)
      setRecipients((prev) => [created, ...prev])
      return created
    },
    [user],
  )

  const update = useCallback(
    async (id: string, patch: Partial<RecipientInput>): Promise<LocalRecipient | null> => {
      if (user) {
        const row = await recipientsDb.updateRecipient(id, {
          full_name: patch.fullName,
          relationship: patch.relationship,
          country: patch.country,
          payout_method: patch.payoutMethod as PayoutMethod | undefined,
          gcash_number: patch.gcashNumber,
          maya_number: patch.mayaNumber,
          bank_code: patch.bankCode,
          bank_account_number: patch.bankAccountNumber,
        })
        const updated = rowToLocal(row)
        setRecipients((prev) => prev.map((r) => (r.id === id ? updated : r)))
        return updated
      }
      const updated = recipientsStore.update(id, patch as Partial<LocalRecipient>)
      if (updated) setRecipients((prev) => prev.map((r) => (r.id === id ? updated : r)))
      return updated
    },
    [user],
  )

  const remove = useCallback(
    async (id: string): Promise<void> => {
      if (user) {
        await recipientsDb.deleteRecipient(id)
      } else {
        recipientsStore.remove(id)
      }
      setRecipients((prev) => prev.filter((r) => r.id !== id))
    },
    [user],
  )

  const markUsed = useCallback(
    async (id: string): Promise<void> => {
      if (user) {
        await recipientsDb.touchRecipient(id)
      } else {
        recipientsStore.markUsed(id)
      }
      setRecipients((prev) =>
        prev.map((r) =>
          r.id === id
            ? { ...r, sendCount: r.sendCount + 1, lastUsedAt: new Date().toISOString() }
            : r,
        ),
      )
    },
    [user],
  )

  return { recipients, loading, create, update, remove, markUsed, refresh }
}
