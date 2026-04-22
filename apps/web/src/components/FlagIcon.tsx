'use client'

/**
 * Country flag from flagcdn.com (allow-listed in CSP).
 * `code` is the ISO 3166-1 alpha-2 country code, lowercased.
 */
export function FlagIcon({
  code,
  size = 20,
  className,
}: {
  readonly code: string
  readonly size?: number
  readonly className?: string
}) {
  const w = size * 2 // retina source
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`https://flagcdn.com/w${w}/${code.toLowerCase()}.png`}
      srcSet={`https://flagcdn.com/w${w * 2}/${code.toLowerCase()}.png 2x`}
      alt={`${code.toUpperCase()} flag`}
      width={size}
      height={Math.round(size * 0.75)}
      className={`inline-block rounded-[2px] object-cover ${className ?? ''}`}
      style={{ width: size, height: Math.round(size * 0.75) }}
    />
  )
}
