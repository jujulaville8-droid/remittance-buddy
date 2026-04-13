'use client'

import { useEffect, useRef, type RefObject } from 'react'

interface UseMagneticTiltOptions {
  readonly maxDeg?: number
  readonly perspective?: number
  readonly springMs?: number
}

const isTouchDevice = (): boolean => {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(pointer: coarse)').matches
}

const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function useMagneticTilt({
  maxDeg = 4,
  perspective = 1200,
  springMs = 600,
}: UseMagneticTiltOptions = {}): RefObject<HTMLDivElement | null> {
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (isTouchDevice() || prefersReducedMotion()) return

    let raf = 0
    let pendingX = 0
    let pendingY = 0

    const apply = () => {
      el.style.transform = `perspective(${perspective}px) rotateX(${pendingY}deg) rotateY(${pendingX}deg)`
      raf = 0
    }

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect()
      const cx = rect.width / 2
      const cy = rect.height / 2
      const dx = ((e.clientX - rect.left - cx) / cx) * maxDeg
      const dy = ((e.clientY - rect.top - cy) / cy) * -maxDeg
      pendingX = dx
      pendingY = dy
      el.style.transition = 'transform 80ms ease-out'
      if (!raf) raf = requestAnimationFrame(apply)
    }

    const onLeave = () => {
      if (raf) cancelAnimationFrame(raf)
      raf = 0
      el.style.transition = `transform ${springMs}ms cubic-bezier(0.34, 1.56, 0.64, 1)`
      el.style.transform = `perspective(${perspective}px) rotateX(0deg) rotateY(0deg)`
    }

    el.addEventListener('mousemove', onMove)
    el.addEventListener('mouseleave', onLeave)
    return () => {
      el.removeEventListener('mousemove', onMove)
      el.removeEventListener('mouseleave', onLeave)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [maxDeg, perspective, springMs])

  return ref
}
