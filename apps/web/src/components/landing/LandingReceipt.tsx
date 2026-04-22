'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import {
  ShieldCheck,
  ArrowRight,
  Send,
  BarChart3,
  DollarSign,
  Zap,
  Lock,
  Headphones,
  UserPlus,
  Users,
  Check,
  Star,
  Gift,
  Menu,
  X,
  Plus,
  Minus,
  ChevronDown,
  Loader2,
} from 'lucide-react'
import { useLiveQuotes } from './useLiveQuotes'

export default function LandingReceipt() {
  return (
    <div className="min-h-screen bg-white text-slate-900 overflow-x-clip">
      <TopNav />
      <Hero />
      <TrustFeaturesStrip />
      <HowItWorks />
      <PartnersCard />
      <Testimonials />
      <ReferBanner />
      <FAQ />
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
          <NavLink href="/compare">Send Money</NavLink>
          <NavLink href="/dashboard">Track Transfer</NavLink>
          <NavLink href="/pricing">Rates &amp; Fees</NavLink>
          <NavLink href="/pricing#faq">Help Center</NavLink>
          <NavLink href="/#why">About Us</NavLink>
        </nav>

        <div className="flex items-center gap-3">
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
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
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
    { href: '/compare', label: 'Send Money' },
    { href: '/dashboard', label: 'Track Transfer' },
    { href: '/pricing', label: 'Rates & Fees' },
    { href: '/pricing#faq', label: 'Help Center' },
    { href: '/#why', label: 'About Us' },
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
  return (
    <section className="relative bg-gradient-to-b from-blue-50/80 via-blue-50/30 to-white pt-10 pb-40 lg:pt-16 lg:pb-48 overflow-hidden">
      {/* Full-bleed hero photo — includes the dotted world-map, paper plane,
          and heart decorations already baked in. */}
      <div className="absolute inset-0 pointer-events-none">
        <img
          src="/hero-family.png"
          alt=""
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover object-[center_30%]"
        />
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
  return (
    <div className="relative z-10 pt-4 lg:pt-0">
      <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-100 px-3 py-1 text-[11px] font-semibold text-blue-700">
        <ShieldCheck className="h-3.5 w-3.5" />
        Secure. Fast. Reliable.
      </div>

      <h1 className="mt-5 font-display text-[56px] lg:text-[72px] font-bold leading-[1.02] tracking-[-0.03em] text-slate-900">
        Send love.
        <br />
        Receive{' '}
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

      <p className="mt-8 text-[15px] lg:text-base text-slate-500 leading-relaxed max-w-[420px]">
        Remittance Buddy makes it easy to send money to your loved ones anytime, anywhere with the
        best rates and zero hidden fees.
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/compare"
          className="inline-flex items-center gap-2 h-12 px-6 rounded-lg bg-blue-600 text-white font-semibold text-sm shadow-md shadow-blue-600/25 hover:bg-blue-700 transition-colors"
        >
          Send Money Now
          <Send className="h-4 w-4" />
        </Link>
        <Link
          href="/compare"
          className="inline-flex items-center gap-2 h-12 px-6 rounded-lg border border-slate-200 bg-white text-blue-600 font-semibold text-sm hover:border-blue-300 transition-colors"
        >
          Check Rates
          <BarChart3 className="h-4 w-4" />
        </Link>
      </div>

      <div className="mt-8 flex items-center gap-3">
        <AvatarStack />
        <div className="text-sm font-semibold text-slate-900">
          Trusted by 10,000+ happy customers worldwide
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
    <div className="flex -space-x-2">
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
        <span className="text-[10px] font-bold leading-none tracking-tight">10K+</span>
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

      {/* Secure badge (mid-right over the photo) */}
      <div className="absolute bottom-8 right-0 flex items-center gap-2 rounded-xl bg-white border border-slate-100 shadow-card-lg px-3 py-2 z-20">
        <span className="grid place-items-center w-9 h-9 rounded-lg bg-blue-50 text-blue-600">
          <ShieldCheck className="h-4 w-4" />
        </span>
        <div className="text-[11px] leading-tight">
          <div className="font-medium text-slate-500">Your money is</div>
          <div className="font-bold text-blue-600">100% Secure</div>
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

  const { quotes, loading } = useLiveQuotes({
    corridor: active.corridor,
    sourceCurrency: active.code,
    targetCurrency: 'PHP',
    sourceAmount: amount,
    payoutMethod: 'gcash',
  })

  const best = quotes[0]
  const receiveAmount = best?.targetAmount ?? amount * 56.85
  const providerName = best?.provider

  const continueHref =
    `/compare?corridor=${active.corridor}` +
    `&amount=${amount}` +
    `&payout=gcash`

  return (
    <div className="absolute top-2 right-0 w-[260px] rounded-2xl bg-white border border-slate-100 shadow-card-lg p-4 z-20">
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-medium text-slate-500">You send</label>
        {loading && <Loader2 className="h-3 w-3 text-slate-400 animate-spin" />}
      </div>
      <div className="mt-1 flex items-center gap-2">
        <input
          type="text"
          inputMode="decimal"
          value={amount.toLocaleString()}
          onChange={(e) => {
            const raw = e.target.value.replace(/[^0-9.]/g, '')
            setAmount(Number(raw) || 0)
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

      <div className="mt-3 text-[11px] font-medium text-slate-500">They receive</div>
      <div className="mt-1 flex items-center justify-between gap-2">
        <div className="text-xl font-bold tabular-nums text-slate-900">
          {receiveAmount.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </div>
        <span className="flex items-center gap-1 h-8 px-2 rounded-lg bg-slate-50 text-xs font-bold text-slate-900 shrink-0">
          <span aria-hidden className="text-sm">🇵🇭</span>
          PHP
        </span>
      </div>

      <div className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600">
        <span className="grid place-items-center w-4 h-4 rounded-full bg-emerald-500">
          <Check className="h-2.5 w-2.5 text-white" />
        </span>
        {providerName ? (
          <>
            Best via <span className="text-slate-900">{providerName}</span>
          </>
        ) : (
          'Best rate guaranteed'
        )}
      </div>

      <Link
        href={continueHref}
        className="mt-4 flex items-center justify-center gap-1.5 h-10 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors"
      >
        {quotes.length > 0 ? `See all ${quotes.length} quotes` : 'Compare all providers'}
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
      title: 'Best Exchange Rates',
      body: 'We offer competitive rates so your loved ones receive more.',
    },
    {
      icon: Zap,
      title: 'Fast & Reliable',
      body: 'Quick transfers to banks, wallets, and cash pick-up locations.',
    },
    {
      icon: Lock,
      title: 'Secure Transactions',
      body: 'Your money and data are protected with advanced security.',
    },
    {
      icon: Headphones,
      title: '24/7 Customer Support',
      body: "We're here to help you anytime, anywhere.",
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
      icon: UserPlus,
      title: 'Create an Account',
      body: 'Sign up for free and verify your identity.',
    },
    {
      n: 2,
      icon: Send,
      title: 'Send Money',
      body: 'Enter amount, choose destination and payout method.',
    },
    {
      n: 3,
      icon: Users,
      title: 'Your Loved One Receives',
      body: 'They get the money instantly or within minutes.',
    },
  ]
  return (
    <section id="how" className="py-20 lg:py-28 bg-white">
      <div className="mx-auto max-w-6xl px-5 lg:px-8 text-center">
        <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-blue-600">
          How it works
        </div>
        <h2 className="mt-3 font-display text-3xl lg:text-4xl font-bold tracking-tight text-slate-900">
          Send Money in 3 Simple Steps
        </h2>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-[1fr_auto_1fr_auto_1fr] gap-6 items-center">
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
  readonly step: { n: number; icon: typeof Send; title: string; body: string }
  readonly last: boolean
}) {
  const Icon = step.icon
  return (
    <>
      <div className="relative rounded-2xl border border-slate-100 bg-slate-50/40 p-6 text-center">
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 grid place-items-center w-8 h-8 rounded-full bg-blue-600 text-white text-xs font-bold shadow-md shadow-blue-600/20">
          {step.n}
        </div>
        <div className="mt-4 mx-auto w-14 h-14 grid place-items-center">
          <Icon className="h-10 w-10 text-blue-600" strokeWidth={1.5} />
        </div>
        <div className="mt-4 text-base font-bold text-slate-900">{step.title}</div>
        <div className="mt-1.5 text-xs text-slate-500 leading-relaxed max-w-[220px] mx-auto">
          {step.body}
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
            Send money to
            <br />
            trusted partners
          </div>
          <div className="flex flex-wrap items-center gap-x-10 gap-y-5">
            <PartnerLogoGCash />
            <PartnerLogoMaya />
            <PartnerLogoBDO />
            <PartnerLogoBPI />
            <PartnerLogoMetrobank />
            <PartnerLogoCebuana />
          </div>
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
function Testimonials() {
  const reviews = [
    {
      quote: 'Best rates and super fast transactions. Highly recommended!',
      name: 'Mark D.',
      country: 'USA',
      portrait: { bg: '#DBEAFE', skin: '#E5B58C', hair: '#2E1E15', shirt: '#1E3A8A' },
    },
    {
      quote: 'Remittance Buddy made sending money so easy and stress-free.',
      name: 'Janice P.',
      country: 'Canada',
      portrait: { bg: '#FCE7F3', skin: '#E8B79A', hair: '#3A2418', shirt: '#334155' },
    },
    {
      quote: 'My family receives the money in minutes. Thank you Remittance Buddy!',
      name: 'Robert T.',
      country: 'Australia',
      portrait: { bg: '#DCFCE7', skin: '#D9A67B', hair: '#241511', shirt: '#1E293B' },
    },
  ]
  return (
    <section className="py-20 bg-white">
      <div className="mx-auto max-w-6xl px-5 lg:px-8 grid lg:grid-cols-[1fr_2.2fr] gap-12 items-start">
        <div>
          <h2 className="font-display text-3xl lg:text-4xl font-bold tracking-tight text-slate-900">
            Trusted by
            <br />
            Thousands
          </h2>
          <p className="mt-4 text-sm text-slate-500 leading-relaxed max-w-xs">
            Join thousands of satisfied customers who trust Remittance Buddy for their money
            transfers.
          </p>
          <Link
            href="#"
            className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:underline"
          >
            View all reviews <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {reviews.map((r) => (
            <div
              key={r.name}
              className="rounded-2xl border border-slate-100 bg-white shadow-card p-5"
            >
              <div className="flex items-center gap-0.5 text-amber-400">
                {[0, 1, 2, 3, 4].map((i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-current" />
                ))}
              </div>
              <p className="mt-3 text-sm text-slate-700 leading-relaxed">&ldquo;{r.quote}&rdquo;</p>
              <div className="mt-4 flex items-center gap-2.5">
                <PortraitAvatar {...r.portrait} />
                <div>
                  <div className="text-sm font-bold text-slate-900 leading-tight">{r.name}</div>
                  <div className="text-xs text-slate-500">{r.country}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ---------------------------------------------------------------------------
   Refer-a-friend banner
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
              Refer a friend and earn rewards!
            </div>
            <div className="mt-1 text-sm text-blue-100">
              Invite your friends and earn cash rewards on every successful referral.
            </div>
          </div>
        </div>
        <Link
          href="#"
          className="inline-flex items-center gap-2 h-11 px-5 rounded-lg bg-white text-blue-700 font-semibold text-sm hover:bg-blue-50 transition-colors"
        >
          Learn More <ArrowRight className="h-4 w-4" />
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
      q: 'Is Remittance Buddy free?',
      a: 'Yes. Comparing rates is always free. We earn a small commission from the provider you pick.',
    },
    {
      q: 'How fresh are the rates?',
      a: 'Mid-market rates refresh every 60 seconds. Provider quotes are live at the moment you send.',
    },
    {
      q: 'Do you handle my money?',
      a: 'No. We never touch your money. We hand you off to the provider, who processes the transfer.',
    },
    {
      q: 'Which countries do you support?',
      a: 'Canada, US, UK, UAE, Saudi, Singapore sending to the Philippines. More coming.',
    },
  ]
  return (
    <section id="faq" className="py-20 bg-white">
      <div className="mx-auto max-w-3xl px-5 lg:px-8">
        <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-blue-600 text-center">
          Frequently asked
        </div>
        <h2 className="mt-3 font-display text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 text-center">
          Questions we hear a lot.
        </h2>
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
   Footer
--------------------------------------------------------------------------- */
function SiteFooter() {
  const sections = [
    {
      title: 'Product',
      links: [
        ['Compare', '/compare'],
        ['Rate Alerts', '/alerts'],
        ['Buddy Plus', '/pricing'],
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
            Closer to them, no matter where.
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
          © {new Date().getFullYear()} Remittance Buddy. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
