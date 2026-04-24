'use client'

import { useEffect, useState } from 'react'
import { TrendingUp, TrendingDown, Minus, Activity } from 'lucide-react'

interface RatePoint {
  readonly value: number
  readonly time: number
}

interface RateInsight {
  readonly points: readonly RatePoint[]
  readonly current: number
  readonly min30d: number
  readonly max30d: number
  readonly avg30d: number
  readonly pctVsAvg: number
  readonly trend: 'rising' | 'falling' | 'flat'
  readonly trend7dPct: number
  readonly signal: 'good-time' | 'wait' | 'neutral'
  readonly rationale: string
}

interface HistoryResponse {
  readonly points: readonly RatePoint[]
  readonly insight: RateInsight | null
}

const SIGNAL_STYLES: Record<
  RateInsight['signal'],
  { tone: string; label: string; dot: string }
> = {
  'good-time': {
    tone: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    label: 'Good time to send',
    dot: 'bg-emerald-500',
  },
  wait: {
    tone: 'bg-amber-50 text-amber-800 border-amber-200',
    label: 'Consider waiting',
    dot: 'bg-amber-500',
  },
  neutral: {
    tone: 'bg-slate-50 text-slate-700 border-slate-200',
    label: 'Neutral — send when ready',
    dot: 'bg-slate-400',
  },
}

export function RateHistoryPanel({
  sourceCurrency,
  targetCurrency,
}: {
  readonly sourceCurrency: string
  readonly targetCurrency: string
}) {
  const [data, setData] = useState<HistoryResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    fetch(
      `/api/rates/history?sourceCurrency=${sourceCurrency}&targetCurrency=${targetCurrency}&days=30`,
    )
      .then((r) => {
        if (!r.ok) throw new Error(`History API returned ${r.status}`)
        return r.json() as Promise<HistoryResponse>
      })
      .then((d) => {
        if (!cancelled) setData(d)
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load history')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [sourceCurrency, targetCurrency])

  if (loading) {
    return (
      <div className="mt-5 rounded-2xl border border-slate-100 bg-white shadow-card p-5 lg:p-6 animate-pulse">
        <div className="h-4 w-48 rounded bg-slate-100" />
        <div className="mt-4 h-24 rounded bg-slate-50" />
      </div>
    )
  }
  if (error || !data?.insight) {
    // Non-blocking — if we can't load history, just hide the panel rather than
    // showing a broken UI above the provider list
    return null
  }

  const { insight } = data
  const style = SIGNAL_STYLES[insight.signal]
  const TrendIcon =
    insight.trend === 'rising' ? TrendingUp : insight.trend === 'falling' ? TrendingDown : Minus
  const pctVsAvgFormatted = `${insight.pctVsAvg > 0 ? '+' : ''}${(insight.pctVsAvg * 100).toFixed(2)}%`
  const trend7dFormatted = `${insight.trend7dPct > 0 ? '+' : ''}${(insight.trend7dPct * 100).toFixed(2)}%`

  return (
    <div className="mt-5 rounded-2xl border border-slate-100 bg-white shadow-card p-5 lg:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <Activity className="h-3.5 w-3.5" />
            30-day rate history — {sourceCurrency}/{targetCurrency}
          </div>
          <div className="mt-1 text-base lg:text-lg font-bold text-slate-900">
            {insight.rationale}
          </div>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 h-8 px-3 rounded-full border text-xs font-bold ${style.tone}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
          {style.label}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-slate-100 pt-4">
        <Stat label="Current" value={insight.current.toFixed(4)} />
        <Stat
          label="30-day avg"
          value={insight.avg30d.toFixed(4)}
          sub={`${pctVsAvgFormatted} vs now`}
          subTone={insight.pctVsAvg > 0 ? 'text-emerald-600' : insight.pctVsAvg < 0 ? 'text-amber-600' : 'text-slate-500'}
        />
        <Stat label="30-day low" value={insight.min30d.toFixed(4)} />
        <Stat
          label="7-day trend"
          value={<TrendIcon className="h-5 w-5 inline text-slate-700" />}
          sub={trend7dFormatted}
          subTone={
            insight.trend === 'rising'
              ? 'text-emerald-600'
              : insight.trend === 'falling'
                ? 'text-amber-600'
                : 'text-slate-500'
          }
        />
      </div>

      <div className="mt-5 -mx-1">
        <SparkLine points={insight.points} signal={insight.signal} />
      </div>
    </div>
  )
}

function Stat({
  label,
  value,
  sub,
  subTone,
}: {
  readonly label: string
  readonly value: React.ReactNode
  readonly sub?: string
  readonly subTone?: string
}) {
  return (
    <div>
      <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
        {label}
      </div>
      <div className="mt-1 text-lg font-bold tabular-nums text-slate-900">{value}</div>
      {sub && (
        <div className={`text-[11px] font-semibold ${subTone ?? 'text-slate-500'}`}>{sub}</div>
      )}
    </div>
  )
}

function SparkLine({
  points,
  signal,
}: {
  readonly points: readonly RatePoint[]
  readonly signal: RateInsight['signal']
}) {
  if (points.length < 2) return null

  const width = 800
  const height = 120
  const padX = 4
  const padY = 8

  const values = points.map((p) => p.value)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1

  const stepX = (width - padX * 2) / (points.length - 1)
  const xy = (i: number) => ({
    x: padX + i * stepX,
    y: padY + (height - padY * 2) * (1 - (values[i]! - min) / range),
  })

  const line = points
    .map((_, i) => {
      const { x, y } = xy(i)
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')

  const first = xy(0)
  const last = xy(points.length - 1)
  const area = `M${first.x},${height - padY} ${line} L${last.x},${height - padY} Z`

  const stroke =
    signal === 'good-time' ? '#10b981' : signal === 'wait' ? '#f59e0b' : '#2563eb'
  const fillStart =
    signal === 'good-time' ? '#10b98133' : signal === 'wait' ? '#f59e0b33' : '#2563eb33'

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className="block w-full h-24"
      aria-hidden
    >
      <defs>
        <linearGradient id="rhp-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={fillStart} />
          <stop offset="100%" stopColor={fillStart} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#rhp-grad)" />
      <path d={line} fill="none" stroke={stroke} strokeWidth="2.5" strokeLinejoin="round" />
      <circle cx={last.x} cy={last.y} r="4" fill={stroke} stroke="#ffffff" strokeWidth="2" />
    </svg>
  )
}
