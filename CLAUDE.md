# My Remittance Pal

**Rate-comparison tool + affiliate handoff** for the Filipino diaspora (and
expanding corridors). V1 is a **pure referrals product**: we show the best
real-time rate across legitimate remittance providers and hand the user off
via a tracked affiliate link. **We handle no money. We move no money. We are
not a money transmitter.**

---

# Part 1 — Product DNA

> Read this first. When a product decision is ambiguous, the answer comes from
> here.

## Product Purpose

Filipino/Latinx overseas workers burn 3–8% on every remittance because they
don't know which provider has the best rate for their corridor on that day.
We solve this with a **receipt-style rate comparison** and a **one-tap
handoff** to the winning provider. Our revenue is affiliate commission paid
by the provider when the user completes a transfer on their site.

Three anchors:

1. **"Know what you'll actually get before you click."** On-screen receipt
   math: exchange rate, fee, and landed PHP amount, side-by-side across
   providers. No "up to" marketing language.
2. **"Family-first UX."** Editorial copy in Tagalog / Filipino-English warmth,
   not banking sterility. Recipients are named, not numbered.
3. **"The receipt that works while you sleep."** Rate alerts fire when a
   corridor crosses a target; the user gets a push notification and a one-tap
   affiliate link.

## Target Persona

- Filipina/o overseas worker sending money home monthly (primary)
- Latinx family sending USA → MX / Central America corridor (expansion)
- Sends $200–$2,000 per transfer, 1–4 times/month
- Tech-comfortable: uses apps, trusts phone-based banking, wants an Uber-style
  "here's the best, tap to go" experience
- Has at least one existing remittance app (GCash, Remitly, Wise) and isn't
  opposed to trying a new one if we're the one showing them a better rate

## What V1 IS

- Rate-comparison calculator: amount + corridor → table of providers ranked by
  landed amount
- Rate alerts: user sets a target rate, we push a notification when a corridor
  hits it + one-tap affiliate link
- Family hub: saved recipients + preferred payout methods (GCash, Maya, bank,
  cash pickup) so re-runs of the comparison are instant
- Editorial content: corridor guides, "best provider for X" posts — SEO-
  and App-Store-discovery fuel
- Affiliate click tracking so we can see which providers convert

## What V1 IS NOT

**V1 refuses to be these things — not "scope-down," NO.**

- ❌ **A money transmitter.** We never hold customer funds. We never initiate
  transfers on behalf of users. Every transfer is completed on the provider's
  site/app under their own T&Cs and their own license.
- ❌ **A payment processor.** No Stripe funding, no card-on-file, no IAP. The
  only thing the user does inside our app is compare and tap "Go to [Provider]".
- ❌ **A KYC/AML platform.** Providers handle their own compliance. We don't
  store ID documents, don't ask for SSNs, don't do identity verification.
- ❌ **A neobank.** No stored balances, no debit cards, no yield. We pass
  users through to licensed rails; we are outside the regulated perimeter.
- ❌ **Dark-pattern affiliate spam.** All affiliate relationships are
  disclosed on the About page and inline on the comparison result. We rank
  by landed amount, not by commission rate. Ever.

> **Why this distinction matters for App Store review:** Apple's App Review
> team reads remittance apps as financial services. We pre-empt that read by
> making the "we're a comparison platform, not a money mover" framing explicit
> in review notes, on our About page, and in every affiliate disclosure.

## Product Principles

### 1. Rank by landed amount, never by commission

The ranking algorithm in `apps/web/src/lib/affiliate-routing.ts` accepts
**already-ranked quotes**. Quotes are ranked by `targetAmount desc` in the
quote fetcher. Adding a "commission weight" to that sort is a trust-destroying
anti-pattern and a ban-worthy move. If a provider pays 2x commission but gives
the user $0.50 less on the transfer, they lose the ranking.

### 2. AI as accelerant, not bouncer

Rate alerts fire automatically. Corridor suggestions auto-fill from recent
searches. The AI helper (if/when shipped) drafts comparison explanations —
never asks "are you sure?" and never gates an action.

### 3. Native-app-for-a-reason (Guideline 4.2 defense)

This ships as a native iOS/Android binary wrapping a Next.js WebView. The
binary must earn its place because pure-WebView affiliate-link apps are one
of Apple's most-rejected categories. We earn it with:

- Push notifications for rate alerts (core product value)
- Native share for "found a great rate" referrals
- Haptics on result tap + alert fire
- Offline banner when the WebView loses connectivity
- Biometric unlock (opt-in) for the Family Hub
- Native splash tuned to web first-paint

See `SUBMISSION_PLAN.md` §2 for the 4.2 mitigation checklist.

### 4. Disclose the affiliate relationship transparently

FTC requires material-connection disclosure on affiliate links (US) and
similar rules exist in EU/UK/CA. Beyond legal compliance, it's the trust move.

- **About page:** "How we make money" — clearly explains the affiliate model
- **Comparison result:** small "We earn commission when you transfer through
  a linked provider" line near the "Go to [Provider]" button
- **Rankings:** never influenced by commission rate; we say so in the About page

### 5. Own your data, always

Full recipient list + alert history + comparison history export as CSV/JSON.
Account deletion is a two-tap operation inside Settings (Apple Guideline
5.1.1(v) hard requirement).

## Decision Framework

When principles conflict:

**Referrals-integrity > native-functionality > <10s actions > own-your-data > ship-it**

Worked examples:

- **"Should we include provider X even though their affiliate payout is 3x?"**
  Only if they rank competitively on landed amount. If their rates are worse,
  they don't ship. Ranking integrity wins. → Depends on rates.
- **"Should we add an 'In-app checkout' that lets users fund via Stripe?"**
  Violates "no payment processor" anti-goal. Pushes us into MSB licensing
  territory. → **No, defer to v2+.**
- **"Add a 'we got you the best rate' banner on the result page?"**
  Fine if truthful (we did rank by landed amount). Ship. → **Yes.**

---

# Part 2 — Operations

## Repo Layout

```text
my-remittance-pal/
├── apps/
│   ├── web/           — Next.js 16 (App Router, Turbopack). Deployed on Vercel.
│   │   └── src/lib/affiliate-routing.ts   — core handoff logic
│   └── mobile/        — Capacitor 6 shell (iOS + Android). Remote mode.
│       ├── ios/App/   — Xcode workspace, Pods installed
│       └── capacitor.config.ts  — points at https://my-remittance-pal.vercel.app/dashboard
├── packages/
│   ├── api/           — shared API client
│   ├── db/            — Drizzle ORM + Supabase migrations (alerts, recipients)
│   └── typescript-config/
├── DEPLOY.md          — demo deploy recipe (local + Vercel + sim)
├── SUBMISSION_PLAN.md — iOS App Store submission roadmap
├── TESTFLIGHT_RUNBOOK.md — Phase-by-phase submission commands + Xcode steps
├── APPLE_ENROLLMENT.md — Individual-tier enrollment walkthrough
└── HANDOFF.md         — current session state
```

## Tech Stack

| Layer            | Choice                                                   |
| ---------------- | -------------------------------------------------------- |
| Web framework    | Next.js 16 (App Router, Turbopack)                       |
| Mobile wrapper   | Capacitor 6 (iOS 13+ deployment target)                  |
| Bundle ID        | `com.myremittancepal.app`                                |
| Language         | TypeScript (strict)                                      |
| UI               | shadcn/ui + Tailwind CSS + Geist                         |
| AI (helper copy) | Vercel AI SDK v6 + AI Gateway (`anthropic/claude-sonnet-4.6`) |
| Database         | Supabase Postgres                                        |
| Auth             | Supabase Auth (for alerts + family hub)                  |
| **Payments**     | **None. Referrals only in v1.**                          |
| Affiliate rails  | Direct affiliate URLs per provider (Wise, Remitly, etc.) |
| Click tracking   | `/api/affiliate/track` → local DB + Upstash              |
| Hosting          | Vercel                                                   |
| Monorepo         | Turborepo + pnpm workspaces (pnpm 9)                     |

> **Legacy/dead code warning:** `apps/web/src/lib/wise.ts` exists from earlier
> experiments with Wise Business API. It's unused in the V1 referrals flow —
> safe to delete when doing cleanup. Same for the `persona.ts` KYC adapter:
> not called in V1 code paths.

## Deployment Target

**Web:** `https://my-remittance-pal.vercel.app` on Vercel. Mobile shell loads this URL.

**iOS:** Capacitor native shell in `apps/mobile/ios/App/`. Bundle ID
`com.myremittancepal.app`. Ships to TestFlight then App Store.

**Android:** Capacitor native shell in `apps/mobile/android/`. Ships to Play Console.

## Working Style (inherited from root CLAUDE.md — Karpathy discipline)

- **Think before coding.** State assumptions; present alternatives; ask when unclear.
- **Simplicity first.** Minimum code to solve the problem. No speculative abstractions.
- **Surgical changes.** Every changed line traces to the user's request. No adjacent
  "improvements." Don't refactor while shipping.
- **Goal-driven execution.** Transform vague tasks into verifiable goals; state a
  numbered plan with verify steps.

## Verification

After any web change: `cd apps/web && pnpm lint && pnpm build` must pass.

After any mobile native change: `cd apps/mobile && pnpm exec cap sync ios` must
succeed without errors, and the app must build in Xcode (Cmd+B) before
considering done.

After any plugin addition: `pnpm install` at repo root, then
`cd apps/mobile && pnpm exec cap sync ios` (pod install runs automatically
from the sync hook).

## Session Handoffs

Update `HANDOFF.md` before context runs low: (1) what was completed, (2) what
remains, (3) exact next steps with file paths. Do this proactively.

## Project Scope (Read-only boundary)

When working on this repo, ONLY read and modify files within
`/Users/gimchiflow/Business/my-remittance-pal/`. Reading other repos for
reference is fine; writing to them is not.
