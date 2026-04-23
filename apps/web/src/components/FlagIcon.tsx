'use client'

/**
 * Country flag from flagcdn.com (allow-listed in CSP).
 * `code` is the ISO 3166-1 alpha-2 country code, lowercased.
 *
 * flagcdn only serves a fixed set of widths; asking for w44 or w32 404s.
 * We pick the smallest supported width that's >= the requested CSS width
 * at 2x DPR, so the image stays crisp on retina without over-downloading.
 */

const CDN_WIDTHS = [20, 40, 80, 160, 240, 320, 480, 640, 960, 1280] as const

function pickWidth(target: number): number {
  for (const w of CDN_WIDTHS) {
    if (w >= target) return w
  }
  return CDN_WIDTHS[CDN_WIDTHS.length - 1]
}

export function FlagIcon({
  code,
  size = 20,
  className,
}: {
  readonly code: string
  readonly size?: number
  readonly className?: string
}) {
  const slug = code.toLowerCase()
  const w1x = pickWidth(size * 2) // retina source at 1x CSS-pixel display
  const w2x = pickWidth(size * 4)
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`https://flagcdn.com/w${w1x}/${slug}.png`}
      srcSet={`https://flagcdn.com/w${w2x}/${slug}.png 2x`}
      alt={`${code.toUpperCase()} flag`}
      width={size}
      height={Math.round(size * 0.75)}
      className={`inline-block rounded-[2px] object-cover ${className ?? ''}`}
      style={{ width: size, height: Math.round(size * 0.75) }}
    />
  )
}
