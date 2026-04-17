import type { Metadata } from 'next'
import LandingReceipt from '@/components/landing/LandingReceipt'

export const metadata: Metadata = {
  title: "Remittance Buddy — The receipt doesn't lie.",
  description:
    "Every remittance provider says 'low fees, great rates.' We compare all twelve — live, every 60 seconds — and show you the actual pesos your family will hold. Nothing estimated, nothing spun.",
}

export default function HomePage() {
  return <LandingReceipt />
}
