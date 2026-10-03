import type { Metadata } from 'next'
import LandingReceipt from '@/components/landing/LandingReceipt'

export const metadata: Metadata = {
  title: 'My Remittance Pal — Compare options for sending to the Philippines',
  description:
    'Compare reference recipient amounts, included fees and source collection times. Confirm the final offer and payout availability with your chosen provider.',

}

export default function HomePage() {
  return <LandingReceipt />
}
