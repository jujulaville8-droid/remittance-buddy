'use client'

import { useEffect, useMemo, useState } from 'react'
import { X, Search } from 'lucide-react'
import { CURRENCIES, POPULAR_SOURCE_CODES, type Currency } from '@/lib/currencies'

interface Props {
  readonly open: boolean
  readonly selectedCode: string
  readonly excludeCode?: string
  readonly onSelect: (code: string) => void
  readonly onClose: () => void
}

export function CurrencyPicker({ open, selectedCode, excludeCode, onSelect, onClose }: Props) {
  const [query, setQuery] = useState('')

  useEffect(() => {
    if (!open) setQuery('')
  }, [open])

  useEffect(() => {
    if (!open) return
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const base = excludeCode ? CURRENCIES.filter((c) => c.code !== excludeCode) : CURRENCIES
    if (!q) return base
    return base.filter((c) => c.code.toLowerCase().includes(q) || c.name.toLowerCase().includes(q))
  }, [query, excludeCode])

  const popular = useMemo(() => {
    if (query.trim()) return []
    return POPULAR_SOURCE_CODES
      .filter((code) => code !== excludeCode)
      .map((code) => CURRENCIES.find((c) => c.code === code))
      .filter((c): c is Currency => c !== undefined)
  }, [query, excludeCode])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50"
      role="dialog"
      aria-modal="true"
      aria-label="Select currency"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute inset-0 bg-foreground/40"
      />

      <div
        className="absolute inset-x-0 bottom-0 max-h-[85vh] rounded-t-3xl bg-background shadow-level-4 flex flex-col"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <h2 className="text-base font-semibold text-foreground">Select currency</h2>
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-full bg-muted text-muted-foreground active:scale-95"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-5 pb-3">
          <label className="flex items-center gap-2 rounded-xl border border-border bg-muted/60 px-3 h-11">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search currency"
              className="flex-1 bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground"
              style={{ fontSize: '16px' }}
              autoFocus
            />
          </label>
        </div>

        <div className="flex-1 overflow-y-auto px-2 pb-2">
          {popular.length > 0 ? (
            <>
              <Label>Popular</Label>
              <ul className="mb-3">
                {popular.map((c) => (
                  <CurrencyRow
                    key={c.code}
                    currency={c}
                    selected={c.code === selectedCode}
                    onSelect={() => {
                      onSelect(c.code)
                      onClose()
                    }}
                  />
                ))}
              </ul>
              <Label>All currencies</Label>
            </>
          ) : null}

          <ul>
            {filtered.map((c) => (
              <CurrencyRow
                key={c.code}
                currency={c}
                selected={c.code === selectedCode}
                onSelect={() => {
                  onSelect(c.code)
                  onClose()
                }}
              />
            ))}
            {filtered.length === 0 ? (
              <li className="px-3 py-6 text-center text-sm text-muted-foreground">
                No matches for "{query}"
              </li>
            ) : null}
          </ul>
        </div>
      </div>
    </div>
  )
}

function Label({ children }: { readonly children: React.ReactNode }) {
  return (
    <div className="px-3 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
      {children}
    </div>
  )
}

function CurrencyRow({
  currency,
  selected,
  onSelect,
}: {
  readonly currency: Currency
  readonly selected: boolean
  readonly onSelect: () => void
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onSelect}
        className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${
          selected ? 'bg-muted' : 'hover:bg-muted/60'
        }`}
      >
        <span className="text-xl leading-none">{currency.flag}</span>
        <span className="flex-1 min-w-0">
          <span className="block text-sm font-semibold text-foreground">{currency.code}</span>
          <span className="block text-[11px] text-muted-foreground truncate">{currency.name}</span>
        </span>
        {selected ? <span className="h-2 w-2 rounded-full bg-foreground" /> : null}
      </button>
    </li>
  )
}
