'use client'

import { useSearchParams } from 'next/navigation'
import { ComparisonCanvas, CORRIDORS, PAYOUTS } from '@/components/landing/ComparisonCanvas'
import styles from '@/components/landing/ClearCanvas.module.css'

export function CompareTool() {
  const params = useSearchParams()
  const corridor = CORRIDORS.find((item) => item.id === params.get('corridor'))?.id ?? 'CA-PH'
  const amount = params.get('amount') ?? '100'
  const payout = PAYOUTS.find((item) => item.id === params.get('payout'))?.id ?? 'bank'
  return (
    <div id="comparison-content" className={styles.canvas} tabIndex={-1}>
      <ComparisonCanvas
        key={`${corridor}:${amount}:${payout}`}
        variant="compare"
        initialCorridor={corridor}
        initialAmount={amount}
        initialPayout={payout}
      />
    </div>
  )
}
