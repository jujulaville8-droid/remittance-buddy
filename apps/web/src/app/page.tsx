import type { Metadata } from 'next'
import { Nav } from '@/components/landing/Nav'
import { Hero } from '@/components/landing/Hero'
import { SocialProof } from '@/components/landing/SocialProof'
import { ProviderStrip } from '@/components/landing/ProviderStrip'
import { Features } from '@/components/landing/Features'
import { HowItWorks } from '@/components/landing/HowItWorks'
import { Stats } from '@/components/landing/Stats'
import { FAQ } from '@/components/landing/FAQ'
import { FinalCTA } from '@/components/landing/FinalCTA'
import { Footer } from '@/components/landing/Footer'
import { Reveal } from '@/components/landing/Reveal'

export const metadata: Metadata = {
  title: 'Remittance Buddy — Send Money to the Philippines',
  description:
    'A decision engine for international money transfers. We rank every provider for your corridor and amount, show the math, and tell you which one actually wins.',
}

export default function HomePage() {
  return (
    <main className="relative min-h-screen bg-background text-foreground overflow-x-hidden">
      <Nav />
      <Hero />
      <Reveal>
        <SocialProof />
      </Reveal>
      <Reveal>
        <ProviderStrip />
      </Reveal>
      <Reveal>
        <Features />
      </Reveal>
      <Reveal>
        <HowItWorks />
      </Reveal>
      <Reveal>
        <Stats />
      </Reveal>
      <Reveal>
        <FAQ />
      </Reveal>
      <Reveal>
        <FinalCTA />
      </Reveal>
      <Footer />
    </main>
  )
}
