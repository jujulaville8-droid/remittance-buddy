# My Remittance Pal

AI-assisted international money transfers with a "Filipino-family" editorial voice.
Capacitor-wrapped native mobile shell around a Next.js 16 web app hosted on Vercel.

---

# Part 1 — Product DNA

> Read this first. When a product decision is ambiguous, the answer comes from here.

## Product Purpose

Remittance tool that collapses the "rate shop → sign up → upload ID → wait" Western
Union / Wise / Remitly dance into **one calm tab** with an AI assistant doing the
FX comparison, compliance prep, and reminder chasing in the background.

Core promises:

1. **Know what you'll actually get before you commit.** On-device fee + FX margin
   disclosure *before* any redirect. Receipt-style clarity.
2. **Family-first UX.** Recipients are named, not numbered. Tagalog/Spanish/Filipino
   warmth over fintech sterility. Editorial copy, not banking copy.
3. **AI handles the boring part.** Rate alerts, document checklists, follow-ups —
   never requires the user's permission to do something it was asked to do.

## Target Persona

- Filipina/o overseas worker sending money home monthly
- Latinx family sending across USA → MX/Central America corridor
- Tech-comfortable enough for a phone app, not tech-obsessed
- Allergic to "hidden fees" framing; paid FX margins once, learned the lesson
- Sends $200–$2,000 per transfer, 1–4 times/month

## Product Principles

### 1. Fee + FX honesty on-device

Show the all-in landed amount in the recipient's currency on the same screen as
the input amount. Never route a user to checkout before they see the full math.

### 2. AI as accelerant, not bouncer

Rate alerts fire automatically. Compliance draft questions are pre-filled. The
AI never says "are you sure?" — it acts and shows its work.

### 3. Native-app-for-a-reason

This ships as a native iOS/Android binary wrapping a WebView — which means
every native surface must earn its place: push notifications for rate alerts,
biometric gate before account view, haptics at confirmation, native share for
receipts, offline fallback screen. A pure WebView-shell violates Apple 4.2 and
will get rejected. See `SUBMISSION_PLAN.md` for the 4.2 mitigation checklist.

### 4. Own your data, always

Full transfer history + recipient list export as CSV/JSON. Account deletion
is a two-tap operation inside the app (Apple 5.1.1(v) requires this).

## Non-goals / Anti-patterns

- ❌ **In-app payments via IAP.** Real money transfers are outside IAP scope
  (Apple Guideline 3.1.5(a) — physical/real-world services). Do NOT charge
  transfer fees through StoreKit.
- ❌ **Becoming a bank.** No stored balances, no debit cards, no yield. Pass-through
  rails only (Wise, Stripe), clear partner-licensed disclaimers.
- ❌ **Push spam.** Push notifications only for: (1) rate alerts the user set up,
  (2) transfer status changes, (3) compliance action-required. Nothing marketing.
- ❌ **Dark pattern fees.** All margin + fixed-fee disclosure visible pre-checkout.

---

# Part 2 — Operations

## Repo Layout

```text
my-remittance-pal/
├── apps/
│   ├── web/           — Next.js 16 (App Router, Turbopack). Deployed on Vercel.
│   └── mobile/        — Capacitor 6 shell (iOS + Android). Remote mode.
│       ├── ios/App/   — Xcode workspace, Pods installed
│       ├── android/   — Gradle project
│       └── capacitor.config.ts  — points at https://my-remittance-pal.vercel.app/dashboard
├── packages/
│   ├── api/           — shared API client
│   ├── db/            — Drizzle ORM + Supabase/Neon migrations
│   └── typescript-config/
├── DEPLOY.md          — demo deploy recipe (local + Vercel + sim)
├── SUBMISSION_PLAN.md — iOS App Store submission roadmap
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
| AI               | Vercel AI SDK v6 + AI Gateway (`anthropic/claude-sonnet-4.6`) |
| Database         | Supabase Postgres (per DEPLOY.md) — README.md says Neon; Supabase is current |
| Auth             | Supabase Auth                                            |
| Payments         | Stripe (funding) + Wise API (payout)                     |
| KYC              | Persona (not yet wired)                                  |
| AML              | Sardine (not yet wired)                                  |
| Hosting          | Vercel                                                   |
| Monorepo         | Turborepo + pnpm workspaces (pnpm 9)                     |

> Note: README.md describes the original Neon + Clerk stack. Actual code under
> `apps/web/` uses Supabase per `DEPLOY.md`. Trust the code + DEPLOY.md over README.

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

After any mobile native change: `cd apps/mobile && npx cap sync ios` must succeed
without errors, and the app must build in Xcode (Cmd+B) before considering done.

After any plugin addition: `pnpm install` at repo root, then `cd apps/mobile/ios/App
&& pod install`, then `npx cap sync ios` from `apps/mobile/`.

## Session Handoffs

Update `HANDOFF.md` before context runs low: (1) what was completed, (2) what
remains, (3) exact next steps with file paths. Do this proactively.

## Project Scope (Read-only boundary)

When working on this repo, ONLY read and modify files within
`/Users/gimchiflow/Business/my-remittance-pal/`. Reading other repos for
reference is fine; writing to them is not.
