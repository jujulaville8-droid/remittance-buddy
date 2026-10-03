import { beforeEach, describe, expect, it, vi } from 'vitest'

const { createClient, setState } = vi.hoisted(() => ({ createClient: vi.fn(), setState: vi.fn() }))
vi.mock('@/lib/supabase/client', () => ({ createClient }))
vi.mock('react', () => ({
  useState: (value: unknown) => [value, setState],
  useEffect: (effect: () => unknown) => effect(),
}))

import { useSessionUser } from '@/lib/hooks/useSessionUser'

beforeEach(() => vi.clearAllMocks())

describe('public page account state without Supabase configuration', () => {
  it.each([
    ['', ''],
    ['https://example.supabase.co', ''],
    ['', 'test-public-key'],
  ])('finishes guest loading without creating a client (%s, %s)', (url, key) => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', url)
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', key)
    useSessionUser()
    expect(createClient).not.toHaveBeenCalled()
    expect(setState).toHaveBeenCalledWith(false)
  })
})
