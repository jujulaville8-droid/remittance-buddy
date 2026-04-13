'use client'

import { useEffect, useRef, type RefObject } from 'react'

interface UseParallaxOptions {
  /** Speed multiplier. 1 = scroll-locked, 0.85 = slightly slower than scroll, 1.15 = faster. */
  readonly speed?: number
  readonly maxOffset?: number
}

const isTouchDevice = (): boolean => {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(pointer: coarse)').matches
}

const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Translates the target element on Y axis based on scroll position.
 * Skips on touch devices and when reduced motion is preferred.
 */
export function useParallax({
  speed = 0.92,
  maxOffset = 80,
}: UseParallaxOptions = {}): RefObject<HTMLDivElement | null> {
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (isTouchDevice() || prefersReducedMotion()) return

    let ticking = false
    const offsetFactor = 1 - speed

    const update = () => {
      const rect = el.getBoundingClientRect()
      // distance scrolled since the element came into top of viewport
      const scrolled = -rect.top
      const offset = Math.max(-maxOffset, Math.min(maxOffset, scrolled * offsetFactor))
      el.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0)`
      ticking = false
    }

    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(update)
        ticking = true
      }
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [speed, maxOffset])

  return ref
}
