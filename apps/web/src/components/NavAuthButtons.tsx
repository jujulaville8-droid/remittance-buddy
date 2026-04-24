'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useSessionUser } from '@/lib/hooks/useSessionUser'
import { createClient } from '@/lib/supabase/client'

/**
 * Shared right-side nav auth buttons — swaps between
 * "Log In + Sign Up" (guest) and "Open the tool + Sign out + avatar" (authed).
 *
 * Used by:
 *   - apps/web/src/components/landing/LandingReceipt.tsx (landing TopNav)
 *   - apps/web/src/components/landing/Nav.tsx (tool-area nav)
 */
export function NavAuthButtons() {
  const { user, loading } = useSessionUser()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    // Hard reload so middleware re-evaluates and any protected state clears
    window.location.href = '/'
  }

  if (loading) {
    return <div className="h-10 w-28 rounded-lg bg-slate-100 animate-pulse hidden md:block" />
  }

  if (user) {
    const display = (user.user_metadata?.full_name as string | undefined) ?? user.email ?? '?'
    const avatarUrl =
      (user.user_metadata?.avatar_url as string | undefined) ??
      (user.user_metadata?.picture as string | undefined) ??
      null
    const initials = getInitials(display)
    return (
      <>
        <Link
          href="/dashboard"
          className="hidden md:inline-flex items-center justify-center h-10 px-5 rounded-lg bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700 shadow-sm transition-colors"
        >
          Open the tool
        </Link>
        <button
          type="button"
          onClick={handleSignOut}
          className="hidden md:inline-flex items-center justify-center h-10 px-4 rounded-lg border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:border-slate-300 hover:text-slate-900 transition-colors"
        >
          Sign out
        </button>
        <Avatar url={avatarUrl} initials={initials} label={display} />
      </>
    )
  }

  return (
    <>
      <Link
        href="/sign-in"
        className="hidden md:inline-flex items-center justify-center h-10 px-5 rounded-lg border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:border-slate-300 hover:text-slate-900 transition-colors"
      >
        Log In
      </Link>
      <Link
        href="/sign-up"
        className="inline-flex items-center justify-center h-10 px-5 rounded-lg bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700 shadow-sm transition-colors"
      >
        Sign Up
      </Link>
    </>
  )
}

function Avatar({
  url,
  initials,
  label,
}: {
  readonly url: string | null
  readonly initials: string
  readonly label: string
}) {
  const [failed, setFailed] = useState(false)
  const showImg = url && !failed
  return (
    <Link
      href="/dashboard"
      aria-label={`${label} — open dashboard`}
      title={label}
      className="relative grid place-items-center w-10 h-10 rounded-full bg-blue-600 text-white text-sm font-bold ring-2 ring-white shadow-sm overflow-hidden hover:ring-blue-100 transition-all"
    >
      {showImg ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt=""
          aria-hidden
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <span>{initials}</span>
      )}
    </Link>
  )
}

export function getInitials(name: string): string {
  const trimmed = name.trim()
  if (!trimmed) return '?'
  const parts = trimmed.split(/\s+/).filter(Boolean)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  const word = parts[0]
  if (word.includes('@')) return word[0].toUpperCase()
  return word.slice(0, 2).toUpperCase()
}
