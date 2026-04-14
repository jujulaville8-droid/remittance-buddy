'use client'

import { Children, cloneElement, isValidElement, useEffect, useRef, useState, type ReactNode, type CSSProperties } from 'react'
import { cn } from '@/lib/utils'

interface RevealProps {
  readonly children: ReactNode
  readonly className?: string
  /** Base delay in ms before the element animates in. */
  readonly delay?: number
  /** Wrapper element. Defaults to `div`. */
  readonly as?: 'div' | 'section'
  /**
   * When true, re-fades the element out as it leaves the viewport so it
   * animates back in on scroll-up. Default false — one-shot reveals feel
   * calmer and more editorial once the visitor has seen the section.
   */
  readonly bidirectional?: boolean
  /**
   * When true, stagger direct children: each child receives an increasing
   * transition delay so grids and lists cascade in. Requires children to
   * be real React elements — plain strings are skipped.
   */
  readonly stagger?: boolean
  /** Per-child delay step in ms when stagger is enabled. Default 80ms. */
  readonly staggerStep?: number
  /** Initial vertical offset before the reveal. Default 32px. */
  readonly offset?: number
}

// Unhurried cubic-bezier — close to out-expo, matches the rhythm of polished
// editorial landing pages. Avoids the "snap in" feel of ease-out.
const EASING = 'cubic-bezier(0.22, 1, 0.36, 1)'
const DURATION = 900

export function Reveal({
  children,
  className,
  delay = 0,
  as: Tag = 'div',
  bidirectional = false,
  stagger = false,
  staggerStep = 80,
  offset = 32,
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
          if (!bidirectional) observer.unobserve(el)
        } else if (bidirectional) {
          setVisible(false)
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -10% 0px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [bidirectional])

  const baseStyle: CSSProperties = {
    transitionProperty: 'opacity, transform',
    transitionDuration: `${DURATION}ms`,
    transitionTimingFunction: EASING,
    transitionDelay: visible ? `${delay}ms` : '0ms',
    opacity: visible ? 1 : 0,
    transform: visible ? 'translate3d(0,0,0)' : `translate3d(0, ${offset}px, 0)`,
    willChange: 'opacity, transform',
  }

  if (stagger) {
    const items = Children.toArray(children).map((child, i) => {
      if (!isValidElement(child)) return child
      const existing = (child.props as { style?: CSSProperties }).style ?? {}
      const staggered: CSSProperties = {
        transitionProperty: 'opacity, transform',
        transitionDuration: `${DURATION}ms`,
        transitionTimingFunction: EASING,
        transitionDelay: visible ? `${delay + i * staggerStep}ms` : '0ms',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translate3d(0,0,0)' : `translate3d(0, ${offset}px, 0)`,
        willChange: 'opacity, transform',
      }
      return cloneElement(child as React.ReactElement<{ style?: CSSProperties }>, {
        style: { ...existing, ...staggered },
      })
    })
    return (
      <Tag ref={ref as React.Ref<HTMLDivElement & HTMLElement>} className={className}>
        {items}
      </Tag>
    )
  }

  return (
    <Tag
      ref={ref as React.Ref<HTMLDivElement & HTMLElement>}
      className={cn(className)}
      style={baseStyle}
    >
      {children}
    </Tag>
  )
}
