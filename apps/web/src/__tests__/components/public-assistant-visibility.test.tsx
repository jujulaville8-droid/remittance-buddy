import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'
const { route, useChat } = vi.hoisted(() => ({ route: { pathname: '/' }, useChat: vi.fn() }))
vi.mock('next/navigation', () => ({
  usePathname: () => route.pathname,
  useSearchParams: () => new URLSearchParams(),
}))
vi.mock('@ai-sdk/react', () => ({ useChat }))
vi.mock('@/components/ai-elements/message', () => ({
  Message: () => null,
  MessageContent: () => null,
  MessageResponse: () => null,
}))
import AskPal, { shouldShowAskPal } from '@/components/AskPal'
beforeEach(() => {
  vi.clearAllMocks()
  vi.stubGlobal('React', React)
})
describe('comparison-only public launcher visibility', () => {
  it.each(['/', '/compare', '/compare/', '/extension', '/extension/setup'])(
    'does not mount assistant on %s',
    (path) => {
      route.pathname = path
      expect(shouldShowAskPal(path)).toBe(false)
      expect(renderToStaticMarkup(<AskPal />)).toBe('')
      expect(useChat).not.toHaveBeenCalled()
    }
  )
  it.each(['/dashboard', '/family', '/alerts', '/compare-help'])(
    'preserves the existing launcher on %s',
    (path) => {
      route.pathname = path
      expect(shouldShowAskPal(path)).toBe(true)
      expect(renderToStaticMarkup(<AskPal />)).toContain('Open Ask Pal')
    }
  )
})
