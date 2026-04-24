'use client'

import { useState } from 'react'

/**
 * Renders a provider's brand logo from /public/providers/<slug>.svg if
 * available, with a coloured-tile fallback (brand colour + initials)
 * when the asset is missing.
 *
 * Keep the coloured-tile palette deterministic per slug so the same
 * provider always gets the same fallback — prevents flickering across
 * re-renders and keeps the UI stable as new providers land.
 */

interface ProviderBrand {
  readonly bg: string
  readonly fg: string
}

const BRAND_COLOURS: Record<string, ProviderBrand> = {
  wise: { bg: '#9FE870', fg: '#163300' },
  gcash: { bg: '#007DFE', fg: '#FFFFFF' },
  maya: { bg: '#00B74F', fg: '#FFFFFF' },
  remitly: { bg: '#1F3A93', fg: '#FFFFFF' },
  'western-union': { bg: '#FFCC00', fg: '#1A1A1A' },
  westernunion: { bg: '#FFCC00', fg: '#1A1A1A' },
  xoom: { bg: '#003087', fg: '#FFFFFF' },
  worldremit: { bg: '#E51D50', fg: '#FFFFFF' },
  moneygram: { bg: '#C8102E', fg: '#FFFFFF' },
  ria: { bg: '#E4002B', fg: '#FFFFFF' },
  sendwave: { bg: '#00B4A0', fg: '#FFFFFF' },
  payoneer: { bg: '#FF4F00', fg: '#FFFFFF' },
  revolut: { bg: '#0075EB', fg: '#FFFFFF' },
  zelle: { bg: '#6D1ED4', fg: '#FFFFFF' },
  paypal: { bg: '#00457C', fg: '#FFFFFF' },
}

function slugify(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return name.slice(0, 2).toUpperCase()
}

export function ProviderLogo({
  name,
  slug,
  size = 56,
  className,
  logoUrl,
}: {
  readonly name: string
  readonly slug?: string
  readonly size?: number
  readonly className?: string
  readonly logoUrl?: string
}) {
  const resolvedSlug = slug ?? slugify(name)
  const brand = BRAND_COLOURS[resolvedSlug] ?? { bg: '#E2E8F0', fg: '#0F172A' }

  // Try upstream URL first (provided by Wise Comparisons response), then
  // fall back to our local /public/providers/<slug>.svg, then to a coloured
  // tile with the provider's initials. Each failure advances to the next.
  const sources: string[] = []
  if (logoUrl) sources.push(logoUrl)
  sources.push(`/providers/${resolvedSlug}.svg`)
  const [sourceIndex, setSourceIndex] = useState(0)
  const allFailed = sourceIndex >= sources.length

  const inner = allFailed ? (
    <span
      className="grid place-items-center rounded-xl font-extrabold"
      style={{
        width: size,
        height: size,
        background: brand.bg,
        color: brand.fg,
        fontSize: Math.max(14, Math.round(size * 0.36)),
      }}
      aria-label={name}
    >
      {initials(name)}
    </span>
  ) : (
    <span
      className="grid place-items-center rounded-xl overflow-hidden bg-white"
      style={{ width: size, height: size }}
      aria-label={name}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        key={sources[sourceIndex]}
        src={sources[sourceIndex]}
        alt=""
        aria-hidden
        onError={() => setSourceIndex((i) => i + 1)}
        className="w-4/5 h-4/5 object-contain"
      />
    </span>
  )

  return className ? <span className={className}>{inner}</span> : inner
}
