'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { useSessionUser } from '@/lib/hooks/useSessionUser'
import { NavAuthButtons } from '@/components/NavAuthButtons'
import {
  ShieldCheck,
  ArrowRight,
  Send,
  BarChart3,
  DollarSign,
  Zap,
  Lock,
  Headphones,
  Users,
  Gift,
  Menu,
  X,
  Plus,
  Minus,
  ChevronDown,
  Loader2,
  Sparkles,
} from 'lucide-react'
import { useLiveQuotes } from './useLiveQuotes'
import { useMagneticTilt } from './useMagneticTilt'
import { useParallax } from './useParallax'

export default function LandingReceipt() {
  return (
    <div className="min-h-screen bg-white text-slate-900 overflow-x-clip">
      <TopNav />
      <Hero />
      <TrustFeaturesStrip />
      <StatsStrip />
      <HowItWorks />
      <SplitComparison />
      <CorridorsBoard />
      <PartnersCard />
      <ComparisonChecklist />
      <AppDownload />
      <ReferBanner />
      <FAQ />
      <FinalCTA />
      <SiteFooter />
    </div>
  )
}

/* ---------------------------------------------------------------------------
   Nav
--------------------------------------------------------------------------- */
function TopNav() {
  const [menuOpen, setMenuOpen] = useState(false)
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-100">
      <div className="mx-auto max-w-7xl px-5 lg:px-8 h-[88px] flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 shrink-0">
          <img src="/brand/icon.png" alt="" aria-hidden className="h-14 w-auto" />
          <span className="leading-none">
            <span className="block text-xl font-extrabold tracking-tight">
              <span className="text-[#0A1F4E]">My Remittance </span>
              <span className="text-blue-600">Pal</span>
            </span>
            <span className="mt-1 block text-[11px] font-medium text-slate-500">
              Closer to them, no matter where.
            </span>
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-9">
          <NavLink href="/" active>Home</NavLink>
          <NavLink href="/compare">Compare</NavLink>
          <NavLink href="/#how">How it works</NavLink>
          <NavLink href="/#faq">Help</NavLink>
        </nav>

        <div className="flex items-center gap-3">
          <NavAuthButtons />
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            className="lg:hidden inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700"
          >
            {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>
      {menuOpen && <MobileMenu onClose={() => setMenuOpen(false)} />}
    </header>
  )
}

function NavLink({
  href,
  active,
  children,
}: {
  readonly href: string
  readonly active?: boolean
  readonly children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      className={`relative text-sm font-semibold transition-colors ${
        active ? 'text-blue-600' : 'text-slate-600 hover:text-slate-900'
      }`}
    >
      {children}
      {active && (
        <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 h-0.5 w-6 rounded-full bg-blue-600" />
      )}
    </Link>
  )
}

function MobileMenu({ onClose }: { readonly onClose: () => void }) {
  const links = [
    { href: '/', label: 'Home' },
    { href: '/compare', label: 'Compare' },
    { href: '/#how', label: 'How it works' },
    { href: '/#faq', label: 'Help' },
  ]
  return (
    <div className="lg:hidden border-t border-slate-100 bg-white">
      <nav className="flex flex-col px-5 py-4">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            onClick={onClose}
            className="py-3 text-base font-medium text-slate-700 border-b border-slate-100 last:border-b-0"
          >
            {l.label}
          </Link>
        ))}
      </nav>
    </div>
  )
}

/* ---------------------------------------------------------------------------
   Hero
--------------------------------------------------------------------------- */
function Hero() {
  // Oversize the parallax layer so ±80px translation never exposes gaps
  const parallaxRef = useParallax({ speed: 0.88, maxOffset: 80 })
  return (
    <section className="relative bg-gradient-to-b from-blue-50/80 via-blue-50/30 to-white pt-10 pb-40 lg:pt-16 lg:pb-48 overflow-hidden">
      {/* Full-bleed hero photo — includes the dotted world-map, paper plane,
          and heart decorations already baked in. */}
      <div className="absolute inset-0 pointer-events-none">
        <div ref={parallaxRef} className="absolute -inset-y-20 inset-x-0 will-change-transform">
          <img
            src="/hero-family.png"
            alt=""
            aria-hidden
            className="absolute inset-0 w-full h-full object-cover object-[center_30%]"
          />
        </div>
        {/* Left-side gradient so the copy stays readable over the photo.
            Fades out by ~40% so the photo's subjects remain clear. */}
        <div className="absolute inset-0 bg-gradient-to-r from-white from-20% via-white/70 via-35% to-transparent to-50%" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-5 lg:px-8 grid lg:grid-cols-[1fr_1.1fr] gap-10 lg:gap-12 items-center min-h-[540px]">
        <HeroCopy />
        <HeroVisual />
      </div>
    </section>
  )
}

function HeroCopy() {
  const { user, loading } = useSessionUser()
  const firstName =
    (user?.user_metadata?.full_name as string | undefined)?.split(/\s+/)[0] ??
    user?.email?.split('@')[0] ??
    null

  return (
    <div className="relative z-10 pt-4 lg:pt-0">
      <div className="flex flex-wrap items-center gap-2">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-100 px-3 py-1 text-[11px] font-semibold text-blue-700">
          <ShieldCheck className="h-3.5 w-3.5" />
          Compare before you send.
        </div>
        <div className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 border border-violet-100 px-3 py-1 text-[11px] font-semibold text-violet-700">
          <Sparkles className="h-3.5 w-3.5" />
          Know your options
        </div>
      </div>
      {user && !loading && firstName && (
        <div className="mt-4 text-sm font-semibold text-blue-700">
          Welcome back, {firstName}.
        </div>
      )}

      <h1 className="mt-5 font-display text-[56px] lg:text-[72px] font-bold leading-[1.02] tracking-[-0.03em] text-slate-900">
        Send love.
        <br />
        Know{' '}
        <span className="relative inline-block">
          more.
          <svg
            aria-hidden
            className="absolute left-0 right-0 bottom-[-10px] w-full h-[14px] text-blue-500"
            viewBox="0 0 220 14"
            preserveAspectRatio="none"
            fill="none"
          >
            <path
              d="M4 9 Q 55 2 110 7 T 216 7"
              stroke="currentColor"
              strokeWidth="5"
              strokeLinecap="round"
            />
          </svg>
        </span>
      </h1>

      <p className="mt-8 text-[15px] lg:text-base text-slate-500 leading-relaxed max-w-[440px]">
        Compare available remittance options, fees, and recipient amounts for sending to the
        Philippines. Check each result&rsquo;s source, then confirm the final quote with the provider.
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/compare"
          className="inline-flex items-center gap-2 h-12 px-6 rounded-lg bg-blue-600 text-white font-semibold text-sm shadow-md shadow-blue-600/25 hover:bg-blue-700 transition-colors"
        >
          {user ? 'Open the tool' : 'Compare rates'}
          {user ? <ArrowRight className="h-4 w-4" /> : <BarChart3 className="h-4 w-4" />}
        </Link>
        <Link
          href="#how"
          className="inline-flex items-center gap-2 h-12 px-6 rounded-lg border border-slate-200 bg-white text-blue-600 font-semibold text-sm hover:border-blue-300 transition-colors"
        >
          How it works
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="mt-8 flex items-center gap-3">
        <AvatarStack />
        <div className="text-sm font-semibold text-slate-900">
          Compare without creating an account
        </div>
      </div>
    </div>
  )
}

function AvatarStack() {
  const avatars: { bg: string; skin: string; hair: string; shirt: string }[] = [
    { bg: '#FEF3C7', skin: '#F4C99D', hair: '#3A2418', shirt: '#475569' },
    { bg: '#FCE7F3', skin: '#E2B48C', hair: '#1F1410', shirt: '#334155' },
    { bg: '#DCFCE7', skin: '#D9A67B', hair: '#241511', shirt: '#1E293B' },
  ]
  return (
    <div className="flex -space-x-2" aria-hidden="true">
      {avatars.map((a, i) => (
        <span
          key={i}
          className="relative w-9 h-9 rounded-full ring-2 ring-white overflow-hidden inline-block"
          style={{ background: a.bg }}
        >
          <svg viewBox="0 0 36 36" className="absolute inset-0 w-full h-full">
            <circle cx="18" cy="14" r="7" fill={a.skin} />
            <path d="M10 14 Q10 4 18 4 Q26 4 26 14 L26 11 Q18 6 10 12 Z" fill={a.hair} />
            <path d="M3 36 Q3 24 18 23 Q33 24 33 36 Z" fill={a.shirt} />
          </svg>
        </span>
      ))}
      <div className="w-9 h-9 rounded-full ring-2 ring-white bg-blue-600 text-white grid place-items-center">
        <Users className="h-4 w-4" />
      </div>
    </div>
  )
}

function PortraitAvatar({
  bg,
  skin,
  hair,
  shirt,
  className,
}: {
  readonly bg: string
  readonly skin: string
  readonly hair: string
  readonly shirt: string
  readonly className?: string
}) {
  return (
    <span
      className={`relative rounded-full overflow-hidden inline-block ${className ?? 'w-9 h-9'}`}
      style={{ background: bg }}
    >
      <svg viewBox="0 0 36 36" className="absolute inset-0 w-full h-full">
        <circle cx="18" cy="14" r="7" fill={skin} />
        <path d="M10 14 Q10 4 18 4 Q26 4 26 14 L26 11 Q18 6 10 12 Z" fill={hair} />
        <path d="M3 36 Q3 24 18 23 Q33 24 33 36 Z" fill={shirt} />
      </svg>
    </span>
  )
}

function HeroVisual() {
  return (
    <div className="relative h-[420px] lg:h-[540px]">
      <MiniQuoteTool />

      {/* Choice badge (mid-right over the photo) */}
      <div className="absolute bottom-8 right-0 flex items-center gap-2 rounded-xl bg-white border border-slate-100 shadow-card-lg px-3 py-2 z-20">
        <span className="grid place-items-center w-9 h-9 rounded-lg bg-blue-50 text-blue-600">
          <ShieldCheck className="h-4 w-4" />
        </span>
        <div className="text-[11px] leading-tight">
          <div className="font-medium text-slate-500">Your next step</div>
          <div className="font-bold text-blue-600">You choose</div>
        </div>
      </div>
    </div>
  )
}

const SOURCE_CURRENCIES = [
  { code: 'USD', flag: '🇺🇸', corridor: 'US-PH' },
  { code: 'CAD', flag: '🇨🇦', corridor: 'CA-PH' },
  { code: 'GBP', flag: '🇬🇧', corridor: 'UK-PH' },
  { code: 'SGD', flag: '🇸🇬', corridor: 'SG-PH' },
  { code: 'AED', flag: '🇦🇪', corridor: 'AE-PH' },
] as const

type CurrencyCode = (typeof SOURCE_CURRENCIES)[number]['code']

function MiniQuoteTool() {
  const [amount, setAmount] = useState<number>(1000)
  const [code, setCode] = useState<CurrencyCode>('USD')
  const [currencyOpen, setCurrencyOpen] = useState(false)

  const active = useMemo(
    () => SOURCE_CURRENCIES.find((c) => c.code === code) ?? SOURCE_CURRENCIES[0],
    [code],
  )

  const { quotes, loading, error, cached } = useLiveQuotes({
    corridor: active.corridor,
    sourceCurrency: active.code,
    targetCurrency: 'PHP',
    sourceAmount: amount,
    payoutMethod: 'gcash',
  })

  // Never show an old request or an invented number as the current quote.
  const matchingQuotes = quotes.filter((quote) =>
    quote.corridor === active.corridor &&
    quote.sourceCurrency === active.code &&
    quote.targetCurrency === 'PHP' &&
    quote.sourceAmount === amount &&
    Number.isFinite(quote.targetAmount) &&
    quote.targetAmount > 0,
  )
  const best = !loading && !error ? matchingQuotes[0] : undefined
  const sourceLabel = best
    ? best.source === 'fallback' ? 'Estimate'
      : cached || best.source === 'cached' ? 'Cached reference'
      : best.source === 'live-api' ? 'Provider API quote'
      : 'Reference quote'
    : loading ? 'Checking quotes' : 'No quote available'
  const quotedAt = best?.collectedAt ? new Date(best.collectedAt) : null
  const hasValidTimestamp = quotedAt !== null && Number.isFinite(quotedAt.getTime())

  const tiltRef = useMagneticTilt({ maxDeg: 5, perspective: 1100 })

  const continueHref =
    `/compare?corridor=${active.corridor}` +
    `&amount=${amount}` +
    `&payout=gcash`

  return (
    <div
      ref={tiltRef}
      className="absolute top-2 right-0 w-[260px] rounded-2xl bg-white border border-slate-100 shadow-card-lg p-4 z-20 will-change-transform"
    >
      <div className="flex items-center justify-between">
        <label htmlFor="hero-amount" className="text-[11px] font-medium text-slate-500">You send</label>
        {loading && <Loader2 className="h-3 w-3 text-slate-400 animate-spin" />}
      </div>
      <div className="mt-1 flex items-center gap-2">
        <input
          id="hero-amount"
          type="text"
          inputMode="decimal"
          value={amount.toLocaleString()}
          onChange={(e) => {
            const raw = e.target.value.replace(/[^0-9.]/g, '')
            const value = Number(raw)
            setAmount(Number.isFinite(value) ? Math.min(value, 1_000_000) : 0)
          }}
          className="flex-1 bg-transparent text-xl font-bold tabular-nums text-slate-900 outline-none min-w-0"
        />
        <CurrencyPicker
          active={active}
          open={currencyOpen}
          setOpen={setCurrencyOpen}
          setCode={setCode}
        />
      </div>

      <div className="mt-3 flex items-center justify-between">
        <span className="text-[11px] font-medium text-slate-500">Recipient amount</span>
        <span className="text-[10px] font-semibold text-slate-500" role="status">
          {sourceLabel}
        </span>
      </div>
      <div className="mt-1 flex items-center justify-between gap-2">
        <div className="text-xl font-bold tabular-nums text-slate-900">
          {best ? best.targetAmount.toLocaleString(undefined, { maximumFractionDigits: 2 }) : '—'}
        </div>
        <span className="flex items-center gap-1 h-8 px-2 rounded-lg bg-slate-50 text-xs font-bold text-slate-900 shrink-0">
          <span aria-hidden className="text-sm">🇵🇭</span>
          PHP
        </span>
      </div>

      <div className="mt-3 text-[11px] text-slate-500 leading-relaxed">
        {best ? (
          <>
            <span className="font-semibold text-slate-900">{best.provider}</span>
            {best.sourceName && <span> · {best.sourceName}</span>}
            {hasValidTimestamp ? <> · Source time {quotedAt!.toLocaleString()}</> : <> · Source time unavailable</>}
            <span className="block mt-1">Indicative only. Confirm fees and the final amount with the provider.</span>
            {!best.payoutVerified && <span className="block mt-1">GCash payout availability is not verified.</span>}
          </>
        ) : (
          <span>{error ? 'Quotes are unavailable. Try the comparison tool again.' : 'Choose an amount to check available options.'}</span>
        )}
      </div>

      <Link
        href={continueHref}
        className="mt-4 flex items-center justify-center gap-1.5 h-10 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors"
      >
        {best ? `See ${matchingQuotes.length} available quotes` : 'Open comparison tool'}
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  )
}

function CurrencyPicker({
  active,
  open,
  setOpen,
  setCode,
}: {
  readonly active: (typeof SOURCE_CURRENCIES)[number]
  readonly open: boolean
  readonly setOpen: (o: boolean) => void
  readonly setCode: (c: CurrencyCode) => void
}) {
  return (
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-label="Choose sending currency"
        aria-expanded={open}
        className="flex items-center gap-1 h-8 px-2 rounded-lg bg-slate-50 text-xs font-bold text-slate-900 hover:bg-slate-100 transition-colors"
      >
        <span aria-hidden className="text-sm leading-none">
          {active.flag}
        </span>
        {active.code}
        <ChevronDown className="h-3 w-3 text-slate-400" />
      </button>
      {open && (
        <>
          <button
            type="button"
            aria-label="Close currency picker"
            className="fixed inset-0 z-30"
            onClick={() => setOpen(false)}
          />
          <ul className="absolute right-0 top-full mt-1 w-32 rounded-lg bg-white border border-slate-100 shadow-card-lg py-1 z-40">
            {SOURCE_CURRENCIES.map((c) => (
              <li key={c.code}>
                <button
                  type="button"
                  onClick={() => {
                    setCode(c.code)
                    setOpen(false)
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold hover:bg-slate-50 ${
                    c.code === active.code ? 'text-blue-600' : 'text-slate-700'
                  }`}
                >
                  <span aria-hidden className="text-sm">{c.flag}</span>
                  {c.code}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}


/* ---------------------------------------------------------------------------
   Trust features strip (single white card overlapping hero bottom)
--------------------------------------------------------------------------- */
function TrustFeaturesStrip() {
  const features = [
    {
      icon: DollarSign,
      title: 'Compare recipient amounts',
      body: 'Review the quoted amount alongside the fee and exchange rate.',
    },
    {
      icon: Zap,
      title: 'Review delivery estimates',
      body: 'Delivery depends on the provider, payout method, and verification.',
    },
    {
      icon: Lock,
      title: 'Check the quote source',
      body: 'Provider quotes, cached data, and estimates are not interchangeable.',
    },
    {
      icon: Headphones,
      title: 'Keep control',
      body: 'Confirm eligibility, terms, and the final price on the provider’s site.',
    },
  ]
  return (
    <div className="relative z-20 -mt-28 lg:-mt-36 px-5 lg:px-8">
      <div className="mx-auto max-w-6xl rounded-2xl bg-white border border-slate-100 shadow-card-lg p-6 lg:p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
        {features.map((f) => (
          <div key={f.title} className="flex items-start gap-4">
            <div className="grid place-items-center w-11 h-11 rounded-full bg-blue-50 text-blue-600 shrink-0">
              <f.icon className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900">{f.title}</div>
              <div className="mt-1 text-xs text-slate-500 leading-snug">{f.body}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ---------------------------------------------------------------------------
   How it works
--------------------------------------------------------------------------- */
function HowItWorks() {
  const steps = [
    {
      n: 1,
      icon: DollarSign,
      title: 'Tell us the amount.',
      body: 'Enter your send amount, currency, and preferred payout method. You can browse the comparison tool without an account.',
      tag: 'No signup required',
    },
    {
      n: 2,
      icon: BarChart3,
      title: 'Review available options.',
      body: 'Compare the recipient amount, fees, delivery estimate, and data source. Availability varies by route; some results may be estimates.',
      tag: 'Check source and timing',
    },
    {
      n: 3,
      icon: ArrowRight,
      title: 'Confirm with your provider.',
      body: 'Choose an option, then review the provider’s own quote and terms before sending. Rates can change; a comparison is not a booked transfer.',
      tag: 'You stay in control',
    },
  ]
  return (
    <section id="how" className="py-20 lg:py-28 bg-white">
      <div className="mx-auto max-w-6xl px-5 lg:px-8 text-center">
        <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-blue-600">
          Three steps · compare with context
        </div>
        <h2 className="mt-3 font-display text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 max-w-2xl mx-auto">
          Type an amount. We do the mathematical donkey work.
        </h2>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-[1fr_auto_1fr_auto_1fr] gap-6 items-stretch">
          {steps.map((s, i) => (
            <StepFragment key={s.n} step={s} last={i === steps.length - 1} />
          ))}
        </div>
      </div>
    </section>
  )
}

function StepFragment({
  step,
  last,
}: {
  readonly step: { n: number; icon: typeof Send; title: string; body: string; tag: string }
  readonly last: boolean
}) {
  const Icon = step.icon
  return (
    <>
      <div className="relative rounded-2xl border border-slate-100 bg-slate-50/40 p-6 text-center h-full flex flex-col">
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 grid place-items-center w-8 h-8 rounded-full bg-blue-600 text-white text-xs font-bold shadow-md shadow-blue-600/20">
          {step.n}
        </div>
        <div className="mt-4 mx-auto w-14 h-14 grid place-items-center">
          <Icon className="h-9 w-9 text-blue-600" strokeWidth={1.5} />
        </div>
        <div className="mt-4 text-base font-bold text-slate-900">{step.title}</div>
        <div className="mt-2 text-xs text-slate-500 leading-relaxed max-w-[260px] mx-auto flex-1">
          {step.body}
        </div>
        <div className="mt-4 inline-flex items-center justify-center gap-1.5 mx-auto px-3 py-1 rounded-full bg-blue-50 text-[10px] font-bold uppercase tracking-wider text-blue-700">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
          {step.tag}
        </div>
      </div>
      {!last && (
        <div className="hidden md:grid place-items-center text-slate-300">
          <ArrowRight className="h-5 w-5" />
        </div>
      )}
    </>
  )
}

/* ---------------------------------------------------------------------------
   Partners card
--------------------------------------------------------------------------- */
function PartnersCard() {
  return (
    <section className="pb-20 bg-white">
      <div className="mx-auto max-w-6xl px-5 lg:px-8">
        <div className="rounded-2xl border border-slate-100 bg-white shadow-card px-6 py-6 lg:px-10 flex flex-wrap items-center justify-between gap-6">
          <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500 leading-snug max-w-[180px]">
            Payout options
            <br />
            to check with providers
          </div>
          <div className="flex flex-wrap items-center gap-x-10 gap-y-5">
            <PartnerLogoGCash />
            <PartnerLogoMaya />
            <PartnerLogoBDO />
            <PartnerLogoBPI />
            <PartnerLogoMetrobank />
            <PartnerLogoCebuana />
          </div>
          <p className="w-full text-[11px] text-slate-500">
            Names shown for reference only, not an endorsement or partnership. Availability varies by provider and route.
          </p>
        </div>
      </div>
    </section>
  )
}

function PartnerLogoGCash() {
  return (
    <span className="flex items-center gap-2">
      <span className="grid place-items-center w-6 h-6 rounded-full border-2 border-blue-500 text-blue-500">
        <span className="text-[10px] font-black">(</span>
      </span>
      <span className="text-xl font-extrabold text-blue-500 tracking-tight">GCash</span>
    </span>
  )
}
function PartnerLogoMaya() {
  return (
    <span className="text-2xl font-black italic text-emerald-500 tracking-tight lowercase">
      maya
    </span>
  )
}
function PartnerLogoBDO() {
  return (
    <span className="text-2xl font-black tracking-tight">
      <span className="text-blue-700">B</span>
      <span className="text-blue-700">D</span>
      <span className="text-amber-500">O</span>
    </span>
  )
}
function PartnerLogoBPI() {
  return (
    <span className="flex items-center gap-1.5">
      <span className="grid place-items-center w-5 h-5 text-amber-500">
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-full h-full">
          <path d="M4 6 L7 9 L10 4 L13 9 L16 6 L15 14 L5 14 Z" />
        </svg>
      </span>
      <span className="text-xl font-black text-rose-700 tracking-tight">BPI</span>
    </span>
  )
}
function PartnerLogoMetrobank() {
  return (
    <span className="flex items-center gap-1.5">
      <svg viewBox="0 0 20 20" className="w-5 h-5 text-blue-700" fill="currentColor">
        <path d="M3 14 L10 5 L17 14 L15 14 L15 10 L5 10 L5 14 Z" />
      </svg>
      <span className="text-lg font-black text-blue-700 tracking-tight">Metrobank</span>
    </span>
  )
}
function PartnerLogoCebuana() {
  return (
    <span className="text-center leading-none">
      <span className="block text-lg font-black italic text-rose-700 tracking-tight">CEBUANA</span>
      <span className="block text-[9px] font-bold uppercase tracking-[0.2em] text-rose-700/70 mt-0.5">
        Lhuillier
      </span>
    </span>
  )
}

/* ---------------------------------------------------------------------------
   Testimonials
--------------------------------------------------------------------------- */
function ComparisonChecklist() {
  const checks = [
    {
      label: 'Amount',
      title: 'What arrives?',
      body: 'Compare the amount your recipient gets after the quoted fees. A headline exchange rate does not tell the whole story.',
    },
    {
      label: 'Timing',
      title: 'When does it arrive?',
      body: 'Check the delivery estimate for your payout method. Verification, funding, weekends, and provider limits can affect timing.',
    },
    {
      label: 'Source',
      title: 'What is confirmed?',
      body: 'Check whether a result is a provider quote, cached data, or an estimate. The provider’s checkout gives the final terms.',
    },
  ]
  return (
    <section className="py-20 bg-white">
      <div className="mx-auto max-w-6xl px-5 lg:px-8 grid lg:grid-cols-[1fr_2.2fr] gap-12 items-start">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-blue-600">
            Before you send
          </div>
          <h2 className="mt-3 font-display text-3xl lg:text-4xl font-bold tracking-tight text-slate-900">
            Three checks that matter.
          </h2>
          <p className="mt-4 text-sm text-slate-500 leading-relaxed max-w-xs">
            Use the comparison as a starting point, then review the details with your chosen provider.
          </p>
          <Link href="/compare" className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:underline">
            Open comparison <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {checks.map((item) => (
            <div key={item.label} className="rounded-2xl border border-slate-100 bg-white shadow-card p-5 flex flex-col">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-blue-600">{item.label}</span>
              <h3 className="mt-3 text-base font-bold text-slate-900">{item.title}</h3>
              <p className="mt-3 text-sm text-slate-700 leading-relaxed flex-1">{item.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ---------------------------------------------------------------------------
   Comparison reminder banner
--------------------------------------------------------------------------- */
function ReferBanner() {
  return (
    <section className="pb-10 px-5 lg:px-8">
      <div className="mx-auto max-w-6xl rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-6 lg:px-10 lg:py-8 flex flex-wrap items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <span className="grid place-items-center w-12 h-12 rounded-xl bg-white/15 text-white">
            <Gift className="h-6 w-6" />
          </span>
          <div>
            <div className="text-lg lg:text-xl font-bold leading-tight">
              A little comparison goes a long way
            </div>
            <div className="mt-1 text-sm text-blue-100">
              Review the recipient amount and fees before your next transfer.
            </div>
          </div>
        </div>
        <Link
          href="/compare"
          className="inline-flex items-center gap-2 h-11 px-5 rounded-lg bg-white text-blue-700 font-semibold text-sm hover:bg-blue-50 transition-colors"
        >
          Compare options <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  )
}

/* ---------------------------------------------------------------------------
   FAQ
--------------------------------------------------------------------------- */
function FAQ() {
  const items = [
    {
      q: 'Is My Remittance Pal free to compare?',
      a: 'You can use the public comparison tool without paying or creating an account. A provider may charge transfer fees; check its final quote and terms before you send.',
    },
    {
      q: 'Are all the rates live?',
      a: 'No. Results may come from provider APIs, public pages, cached data, or estimates. Check the source and timestamp shown with each quote. Estimates are for comparison only, and a fresh timestamp does not make an estimate a live provider offer.',
    },
    {
      q: 'Why focus on the Philippines?',
      a: 'The comparison tool focuses on sending money to the Philippines, with options such as bank deposits, GCash, Maya, and cash pickup. Availability depends on the sending country and provider.',
    },
    {
      q: 'Do I need an account?',
      a: 'No account is needed to browse comparisons. Personal features such as saved recipients, family groups, and rate-alert settings require sign-in.',
    },
    {
      q: 'Which providers do you cover?',
      a: 'The options shown depend on your corridor, amount, payout method, and the data currently available. Coverage is not exhaustive. Check with the provider that it supports your exact transfer.',
    },
    {
      q: 'Does Pal handle my transfer?',
      a: 'The comparison tool does not book or guarantee a transfer. You review the final quote and complete any transfer with your chosen provider. Check that provider’s regulatory status, eligibility, fees, and terms for your location.',
    },
  ]
  return (
    <section id="faq" className="py-20 bg-white">
      <div className="mx-auto max-w-3xl px-5 lg:px-8">
        <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-blue-600 text-center">
          FAQ · know before you send
        </div>
        <h2 className="mt-3 font-display text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 text-center">
          The ones you actually ask.
        </h2>
        <p className="mt-3 text-sm text-slate-500 text-center max-w-lg mx-auto">
          A few important details about comparison data and provider quotes.
        </p>
        <div className="mt-10 space-y-3">
          {items.map((it) => (
            <FAQItem key={it.q} q={it.q} a={it.a} />
          ))}
        </div>
      </div>
    </section>
  )
}

function FAQItem({ q, a }: { readonly q: string; readonly a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="rounded-2xl border border-slate-100 bg-white">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-left"
        aria-expanded={open}
      >
        <span className="text-sm font-semibold text-slate-900">{q}</span>
        {open ? (
          <Minus className="h-4 w-4 text-blue-600 shrink-0" />
        ) : (
          <Plus className="h-4 w-4 text-blue-600 shrink-0" />
        )}
      </button>
      {open && <div className="px-5 pb-4 text-sm text-slate-600 leading-relaxed">{a}</div>}
    </div>
  )
}

/* ---------------------------------------------------------------------------
   Comparison guide strip
--------------------------------------------------------------------------- */
function StatsStrip() {
  const cells = [
    { k: 'Compare costs', v: 'Fees', d: 'Review the exchange rate and transfer fee together.' },
    { k: 'Recipient amount', v: 'PHP', d: 'See the quoted amount that would arrive in pesos.' },
    { k: 'Data matters', v: 'Source', d: 'Check whether a result is quoted, cached, or estimated.' },
    { k: 'Final choice', v: 'You', d: 'Confirm the provider’s final quote before sending.' },
  ]
  return (
    <section className="py-16 lg:py-20 bg-white">
      <div className="mx-auto max-w-6xl px-5 lg:px-8 grid grid-cols-2 lg:grid-cols-4 gap-8">
        {cells.map((c) => (
          <div key={c.k} className="border-l-2 border-blue-100 pl-5">
            <div className="text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-500">
              {c.k}
            </div>
            <div className="mt-2 font-display text-4xl lg:text-5xl font-bold tabular-nums text-slate-900">
              {c.v}
            </div>
            <div className="mt-2 text-xs text-slate-500 leading-snug max-w-[200px]">
              {c.d}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

/* ---------------------------------------------------------------------------
   Illustrative comparison — fictional providers
--------------------------------------------------------------------------- */
function SplitComparison() {
  return (
    <section className="py-20 lg:py-28 bg-slate-50/70">
      <div className="mx-auto max-w-6xl px-5 lg:px-8">
        <div className="text-center max-w-2xl mx-auto">
          <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-blue-600">
            Illustrative example · fictional providers
          </div>
          <h2 className="mt-3 font-display text-3xl lg:text-4xl font-bold tracking-tight text-slate-900">
            Same budget. Different recipient amounts.
          </h2>
          <p className="mt-4 text-sm text-slate-500">These invented figures explain the calculation. They are not current rates or a savings promise.</p>
        </div>

        <div className="mt-12 grid lg:grid-cols-[1fr_auto_1fr] gap-6 items-stretch">
          <CompareCard
            tone="them"
            tag="Example A"
            title="Fictional provider A"
            subtitle="$500 total budget. Fee deducted first."
            rows={[
              { l: 'Example rate', v: '₱55.00 / USD', bad: true },
              { l: 'Transfer fee', v: '$5.00', bad: true },
              { l: 'Amount converted', v: '$495.00' },
              { l: 'Calculation', v: '$495 × ₱55.00' },
            ]}
            bottom={{ l: 'Example recipient amount', v: '₱27,225' }}
          />

          <div className="hidden lg:grid place-items-center text-slate-400 font-display text-2xl italic">
            vs.
          </div>

          <CompareCard
            tone="us"
            tag="Example B"
            title="Fictional provider B"
            subtitle="$500 total budget. Fee deducted first."
            rows={[
              { l: 'Example rate', v: '₱56.00 / USD', good: true },
              { l: 'Transfer fee', v: '$2.00', good: true },
              { l: 'Amount converted', v: '$498.00' },
              { l: 'Calculation', v: '$498 × ₱56.00' },
            ]}
            bottom={{ l: 'Example recipient amount', v: '₱27,888', highlight: true }}
          />
        </div>

        <div className="mt-8 rounded-2xl bg-white border border-slate-100 shadow-card p-6 lg:p-7 flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm text-slate-600 max-w-xl leading-relaxed">
            In this example, provider B delivers 663 more pesos. Actual differences depend on the
            rate, fees, payout method, and eligibility at the time you send.
          </p>
          <div className="font-display text-3xl lg:text-4xl font-bold text-blue-600 tabular-nums">
            +₱663 example
          </div>
        </div>
      </div>
    </section>
  )
}

function CompareCard({
  tone,
  tag,
  title,
  subtitle,
  rows,
  bottom,
}: {
  readonly tone: 'them' | 'us'
  readonly tag: string
  readonly title: string
  readonly subtitle: string
  readonly rows: readonly { l: string; v: string; bad?: boolean; good?: boolean }[]
  readonly bottom: { l: string; v: string; highlight?: boolean }
}) {
  const isUs = tone === 'us'
  return (
    <div
      className={`relative rounded-2xl p-6 lg:p-7 border ${
        isUs
          ? 'border-blue-200 bg-white shadow-card-lg'
          : 'border-slate-200 bg-slate-50'
      }`}
    >
      <span
        className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded ${
          isUs ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-600'
        }`}
      >
        {tag}
      </span>
      <div className="mt-3 font-display text-xl lg:text-2xl font-bold text-slate-900">
        {title}
      </div>
      <div className="text-sm text-slate-500">{subtitle}</div>

      <div className="mt-5 space-y-2.5 text-sm">
        {rows.map((r) => (
          <div key={r.l} className="flex items-center justify-between">
            <span className="text-slate-600">{r.l}</span>
            <span
              className={`font-semibold tabular-nums ${
                r.bad ? 'text-rose-600' : r.good ? 'text-emerald-600' : 'text-slate-900'
              }`}
            >
              {r.v}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-5 pt-4 border-t border-slate-200 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {bottom.l}
        </span>
        <span
          className={`font-display text-2xl lg:text-3xl font-bold tabular-nums ${
            bottom.highlight ? 'text-blue-600' : 'text-slate-900'
          }`}
        >
          {bottom.v}
        </span>
      </div>
    </div>
  )
}

/* ---------------------------------------------------------------------------
   Corridors departures board
--------------------------------------------------------------------------- */
function CorridorsBoard() {
  const rows = [
    { code: 'US-PH', name: 'United States', pair: 'USD → PHP' },
    { code: 'UK-PH', name: 'United Kingdom', pair: 'GBP → PHP' },
    { code: 'SG-PH', name: 'Singapore', pair: 'SGD → PHP' },
    { code: 'AE-PH', name: 'UAE', pair: 'AED → PHP' },
    { code: 'SA-PH', name: 'Saudi Arabia', pair: 'SAR → PHP' },
    { code: 'CA-PH', name: 'Canada', pair: 'CAD → PHP' },
    { code: 'AU-PH', name: 'Australia', pair: 'AUD → PHP' },
  ] as const
  return (
    <section id="corridors" className="py-20 lg:py-28 bg-white">
      <div className="mx-auto max-w-6xl px-5 lg:px-8">
        <div className="grid lg:grid-cols-[1fr_1.2fr] gap-8 items-end">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-blue-600">Sending corridors</div>
            <h2 className="mt-3 font-display text-3xl lg:text-4xl font-bold tracking-tight text-slate-900">Start with where you send from.</h2>
          </div>
          <p className="text-sm text-slate-500 leading-relaxed">
            Choose a route to the Philippines to check available comparison data. A listed corridor does not guarantee that a provider can accept your transfer or supply a live quote.
          </p>
        </div>
        <div className="mt-10 rounded-2xl border border-slate-100 bg-white shadow-card overflow-hidden">
          {rows.map((row) => (
            <Link key={row.code} href={`/compare?corridor=${row.code}`} className="grid grid-cols-[1fr_auto] md:grid-cols-[100px_1fr_120px_150px] gap-4 px-5 py-4 border-b border-slate-100 last:border-b-0 items-center text-sm hover:bg-blue-50 transition-colors">
              <span className="hidden md:block font-mono text-xs font-bold text-slate-900">{row.code}</span>
              <span className="font-semibold text-slate-900">{row.name} → Philippines</span>
              <span className="hidden md:block text-xs text-slate-500 font-mono">{row.pair}</span>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600">Check options <ArrowRight className="h-3.5 w-3.5" /></span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ---------------------------------------------------------------------------
   Family feature — organize recipients and goals
--------------------------------------------------------------------------- */
export function FamilyFeature() {
  const perks = [
    {
      icon: Users,
      title: 'Organize family groups',
      body: 'Keep a group record for the people you support.',
    },
    {
      icon: Gift,
      title: 'Shared recipients',
      body: 'Keep recipient records together for your own planning.',
    },
    {
      icon: DollarSign,
      title: 'Plan toward a goal',
      body: 'Record a target for a family expense. A goal does not collect or transfer funds.',
    },
  ]
  return (
    <section id="family" className="py-20 lg:py-28 bg-gradient-to-br from-blue-50 via-blue-50/40 to-white">
      <div className="mx-auto max-w-6xl px-5 lg:px-8 grid lg:grid-cols-[1fr_1fr] gap-12 items-center">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-blue-600">
            Family · together
          </div>
          <h2 className="mt-3 font-display text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 max-w-md">
            The whole pamilya, one dashboard.
          </h2>
          <p className="mt-5 text-sm lg:text-base text-slate-500 leading-relaxed max-w-lg">
            Organize recipient records and family goals in one place. Personal features require
            sign-in. The illustration shows sample people and amounts, not completed transfers.
          </p>

          <div className="mt-8 space-y-4">
            {perks.map((p) => (
              <div key={p.title} className="flex items-start gap-3">
                <span className="grid place-items-center w-9 h-9 rounded-lg bg-blue-100 text-blue-600 shrink-0">
                  <p.icon className="h-4 w-4" />
                </span>
                <div>
                  <div className="text-sm font-bold text-slate-900">{p.title}</div>
                  <div className="mt-0.5 text-xs text-slate-500 leading-relaxed">{p.body}</div>
                </div>
              </div>
            ))}
          </div>

          <Link
            href="/family"
            className="mt-8 inline-flex items-center gap-2 h-12 px-6 rounded-lg bg-blue-600 text-white font-semibold text-sm shadow-md shadow-blue-600/25 hover:bg-blue-700 transition-colors"
          >
            Create a family group
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <FamilyGraphic />
      </div>
    </section>
  )
}

function FamilyGraphic() {
  return (
    <div className="relative h-[420px]">
      <div className="absolute bottom-0 inset-x-0 text-center text-[11px] font-semibold text-slate-500">Illustration · sample people and amounts</div>
      {/* Central card: mama */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[220px] rounded-2xl bg-white border border-slate-100 shadow-card-lg p-5 z-20 text-center">
        <div className="mx-auto w-12 h-12 rounded-full bg-blue-100 grid place-items-center">
          <PortraitAvatar
            bg="#DBEAFE"
            skin="#E5B58C"
            hair="#2E1E15"
            shirt="#1E40AF"
            className="w-12 h-12"
          />
        </div>
        <div className="mt-3 text-sm font-bold text-slate-900">Mama · Batangas</div>
        <div className="mt-1 text-[11px] text-slate-500">GCash · +63 917 ••• 4567</div>
        <div className="mt-3 inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          Shared with 4
        </div>
      </div>

      {/* Surrounding senders */}
      <FamilyNode
        className="top-6 left-8"
        name="Maricel"
        city="Queens, NY"
        contrib="₱12,400"
        avatar={{ bg: '#FEF3C7', skin: '#F4C99D', hair: '#3A2418', shirt: '#475569' }}
      />
      <FamilyNode
        className="top-6 right-8"
        name="Jomari"
        city="Dubai"
        contrib="₱8,900"
        avatar={{ bg: '#FCE7F3', skin: '#E2B48C', hair: '#1F1410', shirt: '#334155' }}
      />
      <FamilyNode
        className="bottom-6 left-8"
        name="Lorna"
        city="Toronto"
        contrib="₱6,200"
        avatar={{ bg: '#DCFCE7', skin: '#D9A67B', hair: '#241511', shirt: '#1E293B' }}
      />
      <FamilyNode
        className="bottom-6 right-8"
        name="Tita Rose"
        city="Singapore"
        contrib="₱4,500"
        avatar={{ bg: '#EDE9FE', skin: '#DDB08E', hair: '#2A1810', shirt: '#4C1D95' }}
      />

      {/* Connecting lines */}
      <svg
        aria-hidden
        className="absolute inset-0 w-full h-full pointer-events-none text-blue-200"
        viewBox="0 0 600 420"
        fill="none"
      >
        <path d="M90 70 Q 200 150 300 210" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 6" />
        <path d="M510 70 Q 400 150 300 210" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 6" />
        <path d="M90 350 Q 200 280 300 210" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 6" />
        <path d="M510 350 Q 400 280 300 210" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 6" />
      </svg>
    </div>
  )
}

function FamilyNode({
  className,
  name,
  city,
  contrib,
  avatar,
}: {
  readonly className: string
  readonly name: string
  readonly city: string
  readonly contrib: string
  readonly avatar: { bg: string; skin: string; hair: string; shirt: string }
}) {
  return (
    <div
      className={`absolute w-[150px] rounded-xl bg-white border border-slate-100 shadow-card p-3 z-10 ${className}`}
    >
      <div className="flex items-center gap-2">
        <PortraitAvatar {...avatar} className="w-8 h-8" />
        <div className="min-w-0">
          <div className="text-xs font-bold text-slate-900 truncate">{name}</div>
          <div className="text-[10px] text-slate-500 truncate">{city}</div>
        </div>
      </div>
      <div className="mt-2 text-[10px] font-semibold text-slate-500">Example contribution</div>
      <div className="text-sm font-bold tabular-nums text-blue-600">{contrib}</div>
    </div>
  )
}

/* ---------------------------------------------------------------------------
   App download
--------------------------------------------------------------------------- */
function AppDownload() {
  return (
    <section className="py-20 lg:py-28 bg-slate-50/70">
      <div className="mx-auto max-w-6xl px-5 lg:px-8 grid lg:grid-cols-[1.1fr_1fr] gap-12 items-center">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-blue-600">
            Use the web comparison tool
          </div>
          <h2 className="mt-3 font-display text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 max-w-lg">
            Compare from your browser.
          </h2>
          <p className="mt-5 text-sm lg:text-base text-slate-500 leading-relaxed max-w-lg">
            Open Pal on your phone or computer to check available options. Native iOS and Android
            downloads are not available here. The phone illustration shows fictional example data.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/compare" className="inline-flex items-center gap-3 h-14 px-5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-colors">
              Open web comparison <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>

        <AppMockup />
      </div>
    </section>
  )
}

function AppMockup() {
  return (
    <div className="relative mx-auto w-[280px] h-[560px]">
      <div className="absolute inset-0 rounded-[44px] bg-slate-900 shadow-card-lg p-3">
        <div className="absolute inset-x-[35%] top-0 h-6 bg-slate-900 rounded-b-2xl z-20" />
        <div className="relative rounded-[32px] bg-gradient-to-b from-blue-50 to-white h-full p-5 overflow-hidden">
          <div className="flex items-center justify-between text-[10px] font-semibold text-slate-600">
            <span>9:41</span>
            <span>●●● 5G ▪</span>
          </div>
          <div className="mt-5 font-display text-lg font-bold text-slate-900">
            Illustrative preview
          </div>
          <div className="mt-4 rounded-2xl bg-white border border-slate-100 shadow-card p-4">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Example recipient amount
            </div>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-2xl font-bold text-slate-900">₱</span>
              <span className="font-display text-4xl font-bold text-slate-900 tabular-nums">
                28,410
              </span>
            </div>
            <div className="mt-2 flex justify-between text-[10px] text-slate-500">
              <span>Example: $500 USD</span>
              <span>Not a live quote</span>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <MiniProviderRow bg="#DBEAFE" color="#1E40AF" short="A" name="Example A" amt="₱28,410" winner />
            <MiniProviderRow bg="#DCFCE7" color="#047857" short="B" name="Example B" amt="₱28,084" />
            <MiniProviderRow bg="#FEE2E2" color="#B91C1C" short="C" name="Example C" amt="₱27,782" />
          </div>
        </div>
      </div>
    </div>
  )
}

function MiniProviderRow({
  bg,
  color,
  short,
  name,
  amt,
  winner,
}: {
  readonly bg: string
  readonly color: string
  readonly short: string
  readonly name: string
  readonly amt: string
  readonly winner?: boolean
}) {
  return (
    <div
      className={`flex items-center justify-between rounded-xl p-2.5 ${
        winner ? 'bg-blue-50 border border-blue-200' : 'bg-white border border-slate-100'
      }`}
    >
      <div className="flex items-center gap-2">
        <div
          className="grid place-items-center w-8 h-8 rounded-lg text-[10px] font-bold"
          style={{ background: bg, color }}
        >
          {short}
        </div>
        <div className="text-sm font-semibold text-slate-900">{name}</div>
      </div>
      <div className="text-sm font-bold tabular-nums text-slate-900">{amt}</div>
    </div>
  )
}

/* ---------------------------------------------------------------------------
   Final CTA
--------------------------------------------------------------------------- */
function FinalCTA() {
  return (
    <section className="py-20 lg:py-28 bg-slate-900 text-white">
      <div className="mx-auto max-w-6xl px-5 lg:px-8 grid lg:grid-cols-[1fr_1.3fr] gap-10 items-center">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-blue-400">
            Know your options
          </div>
          <h2 className="mt-3 font-display text-4xl lg:text-5xl font-bold tracking-tight leading-[1.05]">
            Send smarter,
            <br />
            every payday.
          </h2>
        </div>
        <div>
          <p className="text-base text-slate-300 leading-relaxed max-w-xl">
            Free to compare. No account needed. Review available options, understand the source
            of each quote, and confirm the final amount with your provider before sending.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/compare"
              className="inline-flex items-center gap-2 h-12 px-6 rounded-lg bg-blue-500 text-white font-semibold text-sm hover:bg-blue-400 transition-colors"
            >
              Compare rates now <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="#how"
              className="inline-flex items-center gap-2 h-12 px-6 rounded-lg border border-white/20 text-white font-semibold text-sm hover:bg-white/10 transition-colors"
            >
              See how it works
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------------------------------------------------------------------------
   Footer
--------------------------------------------------------------------------- */
function SiteFooter() {
  const sections = [
    {
      title: 'Product',
      links: [
        ['Compare', '/compare'],
        ['How it works', '/#how'],
        ['Comparison method', '/compare'],
        ['Dashboard', '/dashboard'],
      ],
    },
    {
      title: 'Company',
      links: [
        ['How it works', '/#how'],
        ['FAQ', '/#faq'],
      ],
    },
    {
      title: 'Legal',
      links: [
        ['Privacy', '/privacy'],
        ['Terms', '/terms'],
        ['Extension privacy', '/extension-privacy'],
      ],
    },
  ] as const
  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="mx-auto max-w-7xl px-5 lg:px-8 py-14 grid md:grid-cols-[1.3fr_1fr_1fr_1fr] gap-10">
        <div>
          <Link href="/" className="inline-flex items-center gap-2.5">
            <img src="/brand/icon.png" alt="" aria-hidden className="h-11 w-auto" />
            <span className="text-xl font-extrabold tracking-tight">
              <span className="text-white">My Remittance </span>
              <span className="text-blue-400">Pal</span>
            </span>
          </Link>
          <p className="mt-4 text-sm text-slate-400 max-w-xs leading-relaxed">
            A comparison tool for sending money to the Philippines. Review options, then confirm
            your quote with the provider you choose.
          </p>
        </div>
        {sections.map((s) => (
          <div key={s.title}>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {s.title}
            </div>
            <ul className="mt-4 space-y-2.5">
              {s.links.map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-slate-300 hover:text-white transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-slate-800">
        <div className="mx-auto max-w-7xl px-5 lg:px-8 py-6 text-xs text-slate-500">
          © {new Date().getFullYear()} My Remittance Pal. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
