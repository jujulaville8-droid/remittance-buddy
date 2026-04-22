'use client'

import { Suspense, useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, ArrowRight, Sparkles, Eye, EyeOff, Check } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useSessionUser } from '@/lib/hooks/useSessionUser'

export default function SignUpPage() {
  return (
    <Suspense fallback={null}>
      <SignUpPageInner />
    </Suspense>
  )
}

function SignUpPageInner() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const rawNext = searchParams.get('next') ?? ''
  const next = rawNext.startsWith('/') && !rawNext.startsWith('//') ? rawNext : '/dashboard'
  const { user, loading: sessionLoading } = useSessionUser()

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
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    })
    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }
    router.push(next)
    router.refresh()
  }

  const perks = [
    'Free forever to compare rates',
    'Live quotes from 12+ providers',
    'Rate alerts + family groups',
    'Ask Pal — AI concierge, 24/7',
  ]

  return (
    <main className="min-h-screen grid lg:grid-cols-[1.05fr_1fr] bg-white text-slate-900">
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
          <h2 className="font-display text-3xl xl:text-4xl leading-[1.15] tracking-tight">
            Find the cheapest route home in seconds.
          </h2>
          <ul className="space-y-3">
            {perks.map((p) => (
              <li key={p} className="flex items-center gap-3 text-sm text-blue-100">
                <span className="grid place-items-center w-5 h-5 rounded-full bg-white/20">
                  <Check className="h-3 w-3" />
                </span>
                {p}
              </li>
            ))}
          </ul>

          <div className="pt-6 border-t border-white/15 text-xs text-blue-200 leading-relaxed max-w-sm">
            Pal is a comparison engine — we don&rsquo;t hold your money. We earn a small referral
            fee from the provider you pick.
          </div>
        </div>
      </aside>

      <section className="flex flex-col px-6 py-8 sm:px-10 lg:px-16 xl:px-24 lg:py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors w-fit"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        <div className="flex-1 flex flex-col justify-center max-w-md w-full mx-auto py-10">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 border border-violet-100 px-3 py-1 text-[11px] font-semibold text-violet-700 w-fit">
            <Sparkles className="h-3.5 w-3.5" />
            Create your account
          </div>
          <h1 className="mt-4 font-display text-4xl lg:text-5xl font-bold tracking-tight text-slate-900">
            Send smarter. Start free.
          </h1>
          <p className="mt-3 text-sm lg:text-base text-slate-500 leading-relaxed">
            One account for the comparison tool, rate alerts, and your family group.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            {error && (
              <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="fullName" className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                Full name
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                autoComplete="name"
                placeholder="Jane Dela Cruz"
                className="mt-2 block w-full h-12 rounded-lg border border-slate-200 bg-white px-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
              />
            </div>

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
              <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                Password
              </label>
              <div className="relative mt-2">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  autoComplete="new-password"
                  placeholder="At least 6 characters"
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
              {loading ? 'Creating account…' : (
                <>
                  Create account
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-sm text-slate-500 text-center">
            Already have an account?{' '}
            <Link href="/sign-in" className="font-semibold text-blue-600 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </section>
    </main>
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
