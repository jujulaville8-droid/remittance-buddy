'use client'

import { Suspense, useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, ArrowRight, ShieldCheck, Eye, EyeOff } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useSessionUser } from '@/lib/hooks/useSessionUser'

export default function SignInPage() {
  return (
    <Suspense fallback={null}>
      <SignInPageInner />
    </Suspense>
  )
}

function SignInPageInner() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  // Only accept same-origin paths for `next` so it can't be used as an open redirect
  const rawNext = searchParams.get('next') ?? ''
  const next = rawNext.startsWith('/') && !rawNext.startsWith('//') ? rawNext : '/dashboard'
  const { user, loading: sessionLoading } = useSessionUser()

  // Already signed in? Bounce to the intended destination (or dashboard).
  useEffect(() => {
    if (!sessionLoading && user) {
      router.replace(next)
    }
  }, [user, sessionLoading, next, router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const supabase = createClient()
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
    if (signInError) {
      setError(signInError.message)
      setLoading(false)
      return
    }
    router.push(next)
    router.refresh()
  }

  return (
    <main className="min-h-screen grid lg:grid-cols-[1.05fr_1fr] bg-white text-slate-900">
      {/* Left: brand panel */}
      <aside className="relative hidden lg:flex flex-col justify-between p-10 xl:p-14 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 text-white overflow-hidden">
        <BackdropDots />

        <Link href="/" className="relative z-10 inline-flex items-center gap-2.5 w-fit">
          <Image
            src="/brand/icon.png"
            alt=""
            aria-hidden
            width={44}
            height={44}
            className="h-11 w-auto bg-white rounded-lg p-1"
          />
          <span className="leading-none">
            <span className="block text-lg font-extrabold tracking-tight text-white">
              My Remittance <span className="text-blue-200">Pal</span>
            </span>
            <span className="mt-0.5 block text-[10px] font-medium text-blue-200">
              Closer to them, no matter where.
            </span>
          </span>
        </Link>

        <div className="relative z-10 space-y-8">
          <blockquote className="font-display text-3xl xl:text-4xl leading-[1.15] tracking-tight">
            &ldquo;Naka-save ako ng $84 last month lang. Pal found a route my bank never showed me.&rdquo;
          </blockquote>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 grid place-items-center font-bold text-sm">
              MC
            </div>
            <div>
              <div className="font-semibold text-sm">Maricel C.</div>
              <div className="text-xs text-blue-200">RN · Queens, NY → Batangas</div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-5 pt-6 border-t border-white/15">
            <StatTile k="47,218" v="senders this month" />
            <StatTile k="$2.4M" v="saved this year" />
            <StatTile k="60s" v="live-rate refresh" />
          </div>
        </div>
      </aside>

      {/* Right: form */}
      <section className="flex flex-col px-6 py-8 sm:px-10 lg:px-16 xl:px-24 lg:py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors w-fit"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        <div className="flex-1 flex flex-col justify-center max-w-md w-full mx-auto py-10">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-100 px-3 py-1 text-[11px] font-semibold text-blue-700 w-fit">
            <ShieldCheck className="h-3.5 w-3.5" />
            Secure sign-in
          </div>
          <h1 className="mt-4 font-display text-4xl lg:text-5xl font-bold tracking-tight text-slate-900">
            Welcome back.
          </h1>
          <p className="mt-3 text-sm lg:text-base text-slate-500 leading-relaxed">
            Sign in to see live rates, manage recipients, and watch your family group.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            {error && (
              <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="you@example.com"
                className="mt-2 block w-full h-12 rounded-lg border border-slate-200 bg-white px-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Password
                </label>
                <Link href="/sign-in" className="text-xs font-semibold text-blue-600 hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative mt-2">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="block w-full h-12 rounded-lg border border-slate-200 bg-white pl-4 pr-11 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-lg bg-blue-600 text-white font-semibold text-sm shadow-md shadow-blue-600/25 hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? 'Signing in…' : (
                <>
                  Sign in
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-sm text-slate-500 text-center">
            Don&apos;t have an account?{' '}
            <Link href="/sign-up" className="font-semibold text-blue-600 hover:underline">
              Create one
            </Link>
          </p>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Pal is a comparison engine, not a money transmitter. We never see your banking
              credentials — you sign in with the provider you choose.
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}

function StatTile({ k, v }: { readonly k: string; readonly v: string }) {
  return (
    <div>
      <div className="font-display text-2xl font-bold tabular-nums text-white">{k}</div>
      <div className="mt-1 text-[10px] font-medium text-blue-200 leading-snug">{v}</div>
    </div>
  )
}

function BackdropDots() {
  return (
    <div
      aria-hidden
      className="absolute inset-0 opacity-[0.18] pointer-events-none"
      style={{
        backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
        backgroundSize: '18px 18px',
      }}
    />
  )
}
