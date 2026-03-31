import { describe, it, expect, vi } from 'vitest'

vi.mock('@remit/db', () => ({
  db: { insert: vi.fn(() => ({ values: vi.fn() })) },
  auditLogs: {},
}))

import { getClientIp } from '@/lib/audit'

describe('getClientIp', () => {
  it('returns the first IP from x-forwarded-for header', () => {
    const req = new Request('http://localhost/', {
      headers: { 'x-forwarded-for': '1.2.3.4, 5.6.7.8' },
    })
    expect(getClientIp(req)).toBe('1.2.3.4')
  })

  it('returns a single x-forwarded-for IP', () => {
    const req = new Request('http://localhost/', {
      headers: { 'x-forwarded-for': '10.0.0.1' },
    })
    expect(getClientIp(req)).toBe('10.0.0.1')
  })

  it('falls back to x-real-ip when x-forwarded-for is absent', () => {
    const req = new Request('http://localhost/', {
      headers: { 'x-real-ip': '192.168.1.1' },
    })
    expect(getClientIp(req)).toBe('192.168.1.1')
  })

  it('returns undefined when no IP headers are present', () => {
    const req = new Request('http://localhost/')
    expect(getClientIp(req)).toBeUndefined()
  })
})
