import { NextResponse } from 'next/server'
import { z } from 'zod'
import { buildRateInsight, fetchRateHistory } from '@remit/api'

const querySchema = z.object({
  sourceCurrency: z.string().length(3).toUpperCase(),
  targetCurrency: z.string().length(3).toUpperCase(),
  days: z.coerce.number().int().min(7).max(365).default(30),
})

export async function GET(req: Request) {
  const url = new URL(req.url)
  const parsed = querySchema.safeParse({
    sourceCurrency: url.searchParams.get('sourceCurrency'),
    targetCurrency: url.searchParams.get('targetCurrency'),
    days: url.searchParams.get('days') ?? '30',
  })

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid query parameters', details: parsed.error.issues },
      { status: 400 },
    )
  }

  try {
    const points = await fetchRateHistory(
      parsed.data.sourceCurrency,
      parsed.data.targetCurrency,
      parsed.data.days,
    )
    const insight = buildRateInsight(points)
    return NextResponse.json(
      { points, insight },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
        },
      },
    )
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to fetch rate history' },
      { status: 500 },
    )
  }
}
