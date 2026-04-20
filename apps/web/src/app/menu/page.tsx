'use client'

import Link from 'next/link'
import { ChevronRight, FileText, Globe, Info, LogIn, LogOut, ShieldCheck, Trophy, User, Users } from 'lucide-react'
import { useSessionUser } from '@/lib/hooks/useSessionUser'
import { createBrowserClient } from '@supabase/ssr'
import { useCallback } from 'react'
import { useRouter } from 'next/navigation'

const APP_VERSION = '0.1.0'

function getSupabaseClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}

export default function MenuPage() {
  const { user, loading } = useSessionUser()
  const router = useRouter()

  const handleSignOut = useCallback(async () => {
    const supabase = getSupabaseClient()
    await supabase.auth.signOut()
    router.refresh()
  }, [router])

  return (
    <main className="min-h-screen bg-background pb-28 pt-8">
      <div className="container max-w-lg">
        <header className="mb-8">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-coral">Menu</div>
          <h1 className="mt-3 font-display text-3xl sm:text-4xl leading-tight text-foreground">
            Account &amp; settings
          </h1>
        </header>

        <section className="space-y-6">
          <MenuSection title="Account">
            {loading ? (
              <div className="rounded-2xl border border-border bg-card p-4 text-sm text-muted-foreground">
                Loading…
              </div>
            ) : user ? (
              <>
                <div className="rounded-2xl border border-border bg-card p-4">
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-full bg-coral/10 text-coral">
                      <User className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-foreground truncate">
                        {user.email ?? 'Signed in'}
                      </div>
                      <div className="text-xs text-muted-foreground">Free plan</div>
                    </div>
                  </div>
                </div>
                <MenuButton onClick={handleSignOut} icon={LogOut} label="Sign out" />
              </>
            ) : (
              <MenuLink href="/sign-in" icon={LogIn} label="Sign in" />
            )}
          </MenuSection>

          <MenuSection title="Your data">
            <MenuLink href="/recipients" icon={Users} label="Recipients" />
            <MenuLink href="/family" icon={Users} label="Family hub" />
          </MenuSection>

          <MenuSection title="Community">
            <MenuLink href="/leaderboard" icon={Trophy} label="Leaderboard" />
          </MenuSection>

          <MenuSection title="About">
            <MenuLink href="/privacy" icon={ShieldCheck} label="Privacy policy" />
            <MenuLink href="/terms" icon={FileText} label="Terms of service" />
            <MenuLink href="#" icon={Info} label="About this app" disabled />
          </MenuSection>

          <MenuSection title="Preferences">
            <MenuLink href="#" icon={Globe} label="Language · English" disabled />
          </MenuSection>

          <p className="pt-4 text-center text-xs text-muted-foreground">
            My Remittance Pal · v{APP_VERSION}
          </p>
        </section>
      </div>
    </main>
  )
}

function MenuSection({ title, children }: { readonly title: string; readonly children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <div className="px-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        {title}
      </div>
      <div className="space-y-1.5">{children}</div>
    </div>
  )
}

function MenuLink({
  href,
  icon: Icon,
  label,
  disabled,
}: {
  readonly href: string
  readonly icon: typeof Users
  readonly label: string
  readonly disabled?: boolean
}) {
  const inner = (
    <div
      className={`flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3.5 transition-colors ${
        disabled ? 'opacity-50' : 'hover:border-foreground/30 active:scale-[0.99]'
      }`}
    >
      <Icon className="h-5 w-5 text-foreground/70" strokeWidth={1.8} />
      <span className="flex-1 text-sm font-medium text-foreground">{label}</span>
      {!disabled && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
    </div>
  )
  if (disabled) return <div>{inner}</div>
  return <Link href={href}>{inner}</Link>
}

function MenuButton({
  onClick,
  icon: Icon,
  label,
}: {
  readonly onClick: () => void
  readonly icon: typeof Users
  readonly label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3.5 text-left transition-colors hover:border-foreground/30 active:scale-[0.99]"
    >
      <Icon className="h-5 w-5 text-foreground/70" strokeWidth={1.8} />
      <span className="flex-1 text-sm font-medium text-foreground">{label}</span>
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </button>
  )
}
