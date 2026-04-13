'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface RevealProps {
  readonly children: ReactNode
  readonly className?: string
  readonly delay?: number
  readonly as?: 'div' | 'section'
  /**
   * If true, re-fades out when the element leaves the viewport so it animates
   * back in on scroll-up. Default true for hero/marketing sections — feels alive.
   */
  readonly bidirectional?: boolean
}

export function Reveal({
  children,
  className,
  delay = 0,
  as: Tag = 'div',
  bidirectional = true,
}: RevealProps) {
  const ref = useRef<HTMLElement | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true)
      return
    }
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return
        if (entry.isIntersecting) {
          setVisible(true)
        } else if (bidirectional) {
          setVisible(false)
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [bidirectional])

  return (
    <Tag
      ref={ref as React.Ref<HTMLDivElement & HTMLElement>}
      className={cn(
        'transition-all duration-700 ease-out will-change-transform',
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8',
        className,
      )}
      style={{ transitionDelay: visible ? `${delay}ms` : '0ms' }}
    >
      {children}
    </Tag>
  )
}
