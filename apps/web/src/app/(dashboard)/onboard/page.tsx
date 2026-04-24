import type { Metadata } from 'next'
import { OnboardingChat } from '@/components/chat'

export const metadata: Metadata = {
  title: 'Get Started',
  description: 'Set up your account and make your first transfer with the help of your AI assistant.',
}

export default function OnboardPage() {
  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col sm:h-screen">
      {/* Header */}
      <div className="shrink-0 border-b px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-2xl items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/icon.png" alt="" aria-hidden className="h-10 w-auto" />
          <div>
            <p className="text-sm font-semibold">My Remittance Pal</p>
            <p className="text-xs text-muted-foreground">Onboarding assistant · always online</p>
          </div>
        </div>
      </div>

      {/* Chat */}
      <div className="min-h-0 flex-1">
        <OnboardingChat />
      </div>
    </div>
  )
}
