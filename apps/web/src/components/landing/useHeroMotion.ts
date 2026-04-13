'use client'

import { useEffect, useRef, useState } from 'react'

interface HeroMotionState {
  readonly displayedAmount: number
  readonly secondsAgo: number
  readonly isFlashing: boolean
}

interface UseHeroMotionOptions {
  readonly target: number
  readonly mountDuration?: number
  readonly jitterIntervalMs?: number
  readonly jitterMagnitude?: number
}

const easeOutExpo = (t: number): number => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t))

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function useHeroMotion({
  target,
  mountDuration = 1400,
  jitterIntervalMs = 8000,
  jitterMagnitude = 22,
}: UseHeroMotionOptions): HeroMotionState {
  const [displayedAmount, setDisplayedAmount] = useState(target)
  const [secondsAgo, setSecondsAgo] = useState(0)
  const [isFlashing, setIsFlashing] = useState(false)
  const targetRef = useRef(target)
  const mountedAtRef = useRef(0)
  const lastJitterRef = useRef(0)

  // Mount count-up
  useEffect(() => {
    targetRef.current = target
    mountedAtRef.current = performance.now()

    if (prefersReducedMotion()) {
      setDisplayedAmount(target)
      return
    }

    setDisplayedAmount(0)
    let raf = 0
    const startedAt = performance.now()

    const tick = (now: number) => {
      const p = Math.min(1, (now - startedAt) / mountDuration)
      const v = Math.round(target * easeOutExpo(p))
      setDisplayedAmount(v)
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, mountDuration])

  // Live ticker + periodic jitter
  useEffect(() => {
    if (prefersReducedMotion()) return

    const id = setInterval(() => {
      const elapsed = Math.floor((performance.now() - mountedAtRef.current) / 1000)
      setSecondsAgo(elapsed - lastJitterRef.current)

      if (elapsed - lastJitterRef.current >= Math.floor(jitterIntervalMs / 1000)) {
        lastJitterRef.current = elapsed
        setIsFlashing(true)

        // Soft jitter — drift the displayed value by ±jitterMagnitude
        const drift = Math.round((Math.random() - 0.5) * 2 * jitterMagnitude)
        const startVal = targetRef.current
        const endVal = targetRef.current + drift
        targetRef.current = endVal

        const t0 = performance.now()
        const animate = (now: number) => {
          const p = Math.min(1, (now - t0) / 600)
          const v = Math.round(startVal + (endVal - startVal) * easeOutExpo(p))
          setDisplayedAmount(v)
          if (p < 1) requestAnimationFrame(animate)
          else setIsFlashing(false)
        }
        requestAnimationFrame(animate)

        // Reset visible "Live rates · 0s" tick after the flash
        setTimeout(() => setSecondsAgo(0), 50)
      }
    }, 1000)

    return () => clearInterval(id)
  }, [jitterIntervalMs, jitterMagnitude])

  return { displayedAmount, secondsAgo, isFlashing }
}
