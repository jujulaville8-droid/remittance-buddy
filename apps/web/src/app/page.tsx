import type { Metadata } from 'next'
import { Nav } from '@/components/landing/Nav'
import { Hero } from '@/components/landing/Hero'
import { ProviderStrip } from '@/components/landing/ProviderStrip'
import { Stats } from '@/components/landing/Stats'
import { HowItWorks } from '@/components/landing/HowItWorks'
import { Features } from '@/components/landing/Features'
import { Corridor } from '@/components/landing/Corridor'
import { Testimonials } from '@/components/landing/Testimonials'
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
      <ProviderStrip />
      <Reveal>
        <Stats />
      </Reveal>
      <Reveal>
        <HowItWorks />
      </Reveal>
      <Reveal>
        <Features />
      </Reveal>
      <Reveal>
        <Corridor />
      </Reveal>
      <Reveal>
        <Testimonials />
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
