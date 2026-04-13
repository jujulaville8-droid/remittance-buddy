'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * SVG wavy underline that draws itself in when it enters the viewport.
 * Uses CSS keyframes via the .motion-draw utility class so reduced-motion
 * users get the fully-drawn line without animation.
 */
export function DrawableUnderline() {
  const ref = useRef<SVGPathElement | null>(null)
  const [drawn, setDrawn] = useState(false)

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') {
      setDrawn(true)
      return
    }
    const node = ref.current
    if (!node) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          // small delay so it fires after the headline letters land
          setTimeout(() => setDrawn(true), 600)
          observer.disconnect()
        }
      },
      { threshold: 0.4 },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <svg
      aria-hidden
      viewBox="0 0 300 16"
      className="absolute -bottom-1 left-0 w-full h-3 text-coral/40"
      preserveAspectRatio="none"
    >
      <path
        ref={ref}
        d="M2 12 Q 75 2 150 8 T 298 6"
        stroke="currentColor"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
        className="motion-draw"
        data-drawn={drawn}
      />
    </svg>
  )
}
