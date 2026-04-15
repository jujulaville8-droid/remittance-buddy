import { Suspense } from 'react'
import { CompareTool } from './CompareTool'

export default function ComparePage() {
  return (
    <Suspense fallback={null}>
      <CompareTool />
    </Suspense>
  )
}
