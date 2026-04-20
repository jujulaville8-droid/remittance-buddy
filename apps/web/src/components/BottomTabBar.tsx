'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Bell, Home, Menu, MessageCircle, Scale, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

const TABS = [
  { href: '/dashboard', label: 'Home', icon: Home, match: ['/dashboard'] },
  { href: '/compare', label: 'Compare', icon: Scale, match: ['/compare'] },
  { href: '/chat', label: 'Chat', icon: MessageCircle, match: ['/chat'] },
  { href: '/alerts', label: 'Alerts', icon: Bell, match: ['/alerts'] },
  { href: '/family', label: 'Family', icon: Users, match: ['/family', '/recipients'] },
  { href: '/menu', label: 'Menu', icon: Menu, match: ['/menu'] },
] as const

const HIDDEN_ROUTES = ['/sign-in', '/sign-up']

export function BottomTabBar() {
  const pathname = usePathname() ?? '/'

  if (HIDDEN_ROUTES.some((r) => pathname.startsWith(r))) return null

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur-md"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <ul className="mx-auto flex max-w-lg items-stretch justify-between px-2">
        {TABS.map((tab) => {
          const active = tab.match.some((m) => pathname.startsWith(m))
          const Icon = tab.icon
          return (
            <li key={tab.href} className="flex-1">
              <Link
                href={tab.href}
                className={cn(
                  'flex h-16 flex-col items-center justify-center gap-1 rounded-lg transition-colors',
                  active ? 'text-coral' : 'text-muted-foreground hover:text-foreground',
                )}
                aria-current={active ? 'page' : undefined}
              >
                <Icon className="h-5 w-5" strokeWidth={active ? 2.4 : 1.8} />
                <span className="text-[10px] font-semibold tracking-wide">{tab.label}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
