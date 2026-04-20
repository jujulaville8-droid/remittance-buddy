'use client'

import { useCallback, useEffect, useState } from 'react'
import { familyGroupsStore, type LocalFamilyGroup } from '@/lib/local-db'
import * as familyGroupsDb from '@/lib/db/family-groups'
import type { FamilyGroupRow } from '@/lib/db/types'
import { useSessionUser } from './useSessionUser'

function rowToLocal(row: FamilyGroupRow): LocalFamilyGroup {
  return {
    id: row.id,
    name: row.name,
    members: [], // members + recipients fetched lazily via dedicated calls
    goal:
      row.goal_label && row.goal_target_amount && row.goal_currency
        ? {
            label: row.goal_label,
            targetAmount: Number(row.goal_target_amount),
            currency: row.goal_currency,
          }
        : null,
    recipientIds: [],
    createdAt: row.created_at,
  }
}

export type FamilyGroupInput = Omit<LocalFamilyGroup, 'id' | 'createdAt'>

export interface UseFamilyGroupsResult {
  readonly groups: readonly LocalFamilyGroup[]
  readonly loading: boolean
  readonly create: (input: FamilyGroupInput) => Promise<LocalFamilyGroup>
  readonly remove: (id: string) => Promise<void>
  readonly refresh: () => Promise<void>
}

export function useFamilyGroups(): UseFamilyGroupsResult {
  const { user, loading: sessionLoading } = useSessionUser()
  const [groups, setGroups] = useState<LocalFamilyGroup[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      if (user) {
        const rows = await familyGroupsDb.listFamilyGroups()
        setGroups(rows.map(rowToLocal))
      } else {
        setGroups(familyGroupsStore.list())
      }
    } catch (err) {
      console.warn('[useFamilyGroups] refresh failed:', err)
      setGroups(familyGroupsStore.list())
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (sessionLoading) return
    refresh()
  }, [sessionLoading, refresh])

  const create = useCallback(
    async (input: FamilyGroupInput): Promise<LocalFamilyGroup> => {
      if (user) {
        const row = await familyGroupsDb.createFamilyGroup({
          name: input.name,
          goal_label: input.goal?.label ?? null,
          goal_target_amount: input.goal?.targetAmount ?? null,
          goal_currency: input.goal?.currency ?? null,
        })
        const created = rowToLocal(row)
        setGroups((prev) => [created, ...prev])
        return created
      }
      const created = familyGroupsStore.create(input)
      setGroups((prev) => [created, ...prev])
      return created
    },
    [user],
  )

  const remove = useCallback(
    async (id: string): Promise<void> => {
      if (user) {
        await familyGroupsDb.deleteFamilyGroup(id)
      } else {
        familyGroupsStore.remove(id)
      }
      setGroups((prev) => prev.filter((g) => g.id !== id))
    },
    [user],
  )

  return { groups, loading, create, remove, refresh }
}
