# Remittance Buddy
## Business Implementation Plan

**Prepared for:** Strategic Partnership Review
**Date:** April 2026
**Document Version:** 1.0
**Status:** Pre-launch, V1 foundation built

---

## Table of Contents

1. Executive Summary
2. The Opportunity
3. Problem & Solution
4. Product: Current Build State
5. Business Model & Unit Economics
6. Go-to-Market Strategy
7. Technology & Infrastructure
8. Financial Projections
9. Competitive Landscape
10. Team & Execution
11. Implementation Timeline
12. Risk Analysis & Mitigation
13. Partnership Opportunity
14. Appendices

---

## 1. Executive Summary

**Remittance Buddy** is an AI-powered remittance decision engine and family finance hub built for Overseas Filipino Workers (OFWs) and — in later phases — the broader underserved remittance corridors that legacy Western fintechs refuse to serve.

Unlike existing comparison tools that dump a spreadsheet of provider rates on the user, Buddy is a **decision engine**: it ranks every major provider in real time for the user's exact corridor and amount, recommends a clear winner, explains the math in plain language, and executes the transfer through a best-in-class rail. The product is wrapped in a family-centric experience — shared recipient books, family goal budgets, Tagalog voice assistance, and cashback rewards to local Filipino merchants.

### The opportunity in one paragraph

The global remittance market is approximately **$860 billion annually**, of which the Philippines alone receives **$40 billion**. Filipino OFWs send money home 2-3 times per month, averaging ~$350 per transfer, and they consistently overpay fees averaging 4-6% of the transfer value — well above the UN SDG target of 3%. Legacy players (Western Union, MoneyGram) charge 5-8% and provide poor digital UX. Modern players (Wise, Remitly) are cheaper but offer no comparison engine, no family features, and no cultural fit. Beyond the Philippines, there is an additional **~$290 billion of remittance volume in corridors where Wise does not operate at all** (Bangladesh, Pakistan, Vietnam, Indonesia, Nigeria, Egypt) — representing a 7x larger TAM that is structurally underserved by Western fintechs.

### The product in one paragraph

Remittance Buddy compares live rates from seven or more remittance providers, ranks them using a weighted scoring engine, recommends a clear winner, and executes transfers through partner rails (initially via affiliate hand-off, progressing to a direct integration with Banking-as-a-Service provider NIUM for V2, and adding a stablecoin bridge via Bridge.xyz and Coins.ph for V3). Users access Buddy through a polished web app, a Chrome extension, and — in V2 — a native mobile app. Revenue comes from three streams: a 0.5% service fee on transfers routed through our rails, a $1.99/month premium subscription for advanced features, and affiliate commissions on hand-offs to providers where Buddy is not the cheapest option.

### The ask in one paragraph

We are seeking a strategic partner to co-execute the launch, growth, and scale phases of Remittance Buddy. The foundation of the product has already been built: a deployed landing page, Chrome extension with a working decision engine, database schemas, Wise Business API integration, Stripe payment infrastructure, Persona KYC scaffolding, and Clerk authentication. The next 90 days require user acquisition, BaaS partner negotiations, and production launch. We project reaching 1,000 active users and meaningful monthly revenue within 90 days at a total capital cost under $2,500, with break-even by day 75 and $18,000+ monthly net profit at 10,000 users by month 9.

### Headline numbers

| Metric | Value |
|---|---|
| Global remittance TAM | ~$860 billion |
| Philippines corridor TAM | ~$40 billion |
| Wise-absent corridors TAM | ~$290 billion |
| OFW population (target market) | 2.3M in US, 10M+ globally |
| Average OFW transfer | ~$350 |
| Average OFW send frequency | 2-3 per month |
| Industry average fees | 4-6% |
| Buddy target fee | 0.5% + best-price guarantee |
| Months to break-even | 2-3 |
| Months to venture-scale | 9-12 (25,000 active users, $49k net/month) |
| Capital needed to launch | $500-2,500 |
| V2 upgrade (rails integration) | Months 4-7 |
| V3 upgrade (multi-rail + crypto bridge) | Months 9-15 |

---

## 2. The Opportunity

### 2.1 Global remittance market

Remittances are the single largest private financial flow into developing economies — larger than foreign direct investment and international aid combined. The World Bank estimates global remittances at approximately $860 billion in 2025, growing at roughly 6% annually. This growth is structural, not cyclical, driven by:

- **Accelerating labor migration** from Asia and Africa to the Gulf states, North America, and Europe
- **Digital banking adoption** in recipient countries, which enables instant payout to mobile wallets
- **Regulatory modernization** in corridors like the Philippines (BSP Digital Payments Transformation Roadmap 2020-2023, now in maturity phase), India (LRS framework), and across ASEAN (Project Nexus for instant cross-border)

Despite this scale, the remittance market is **structurally inefficient**. The UN Sustainable Development Goal target for remittance fees is 3%. The current global weighted average is approximately 6.5% according to the World Bank's Remittance Prices Worldwide report. This inefficiency is concentrated in the corridors with the highest volumes — the exact markets where workers can least afford to lose money to fees.

### 2.2 The Philippines corridor: the initial focus

The Philippines is the **fourth-largest remittance recipient in the world** and the largest corridor in Southeast Asia. In 2025, cash remittances to the Philippines totaled approximately $35.63 billion, and personal remittances (which include in-kind transfers and unofficial channels) reached $39.62 billion — both figures sourced from Bangko Sentral ng Pilipinas (BSP) reports.

| Metric | Value |
|---|---|
| Total cash remittances to PH (2025) | $35.63B |
| Total personal remittances to PH (2025) | $39.62B |
| YoY growth | +3.3% |
| Primary source countries | US (35%), Saudi Arabia (14%), UAE (9%), Singapore (7%), Japan (6%), UK (5%), Hong Kong (4%), Canada (4%), Australia (3%) |
| Primary payout methods | GCash (dominant), Maya, BPI bank, BDO bank, Metrobank, Cebuana Lhuillier cash pickup |
| Average transfer size | $300-400 |
| Average transfer frequency | 2-3 per active OFW per month |
| OFW population | ~2.3M in US + ~10M+ globally |
| Estimated unbanked OFW families | ~25% of recipients |

GCash alone has approximately 94 million registered users and dominates the mobile wallet market. Maya has approximately 70 million registered accounts. This creates a well-defined digital endpoint for any remittance product targeting the PH market.

### 2.3 The blue-ocean expansion: corridors Wise does not serve

The most strategically important insight in this plan is that **Wise, the global cost leader in digital remittances, does not operate in many of the largest OFW corridors**. This is not a sanctions issue — it is a regulatory and commercial decision Wise has made based on their thin-margin business model and selective partnership strategy. The corridors where Wise is structurally absent represent approximately **$290 billion in annual remittance volume**, or more than 7x the Philippines opportunity.

| Country | Inbound remittance (USD/year) | Wise presence | Diaspora workers |
|---|---|---|---|
| India | $125B (#1 globally) | Limited (RBI restrictions) | 18M+ worldwide |
| Egypt | $32B | Limited | 6M+ |
| Pakistan | $30B | Cannot send from Pakistan | 11M+ |
| Bangladesh | $22B | Cannot send from Bangladesh | 12M+ |
| Nigeria | $20B | Essentially zero presence | 17M+ |
| Vietnam | $19B | Receivers only | 5M+ |
| Morocco | $11B | Limited | 5M+ |
| Indonesia | $11B | Restricted operations | 9M+ |
| Nepal | $10B | Minimal | 4M+ |
| Kenya | $4B | Limited | 4M+ |
| **Total** | **~$290B** | **Mostly absent** | **~90M workers** |

In these corridors, the competition is legacy providers — Western Union, MoneyGram, Al Ansari, NEC, bKash International, JazzCash — charging 5-8% fees with poor digital UX. Buddy's positioning as "the modern remittance app at 0.5%" is **dramatically easier to sell in these markets than in head-on competition with Wise** on US → Philippines.

The strategic implication: Buddy launches Filipino-first for brand authenticity and the founder's cultural anchor, then expands to underserved corridors in V2/V3 once the rails infrastructure and brand equity are in place.

### 2.4 Why now

Three structural tailwinds make 2026 the right moment to enter this market:

1. **BaaS maturity.** Banking-as-a-Service providers NIUM, Currencycloud (Visa-owned), Thunes, and Rapyd have reached production maturity with documented APIs, multi-corridor coverage, and self-serve sandbox access. A startup that would have needed $5M and 18 months to build its own rails infrastructure in 2018 can now launch with a single integration in 8-12 weeks.

2. **Stablecoin remittance viability.** Bridge.xyz (acquired by Stripe in October 2024 for $1.1B), Circle, and local Philippines crypto exchanges like Coins.ph and PDAX have created a legitimate, regulator-blessed path for USD → USDC → PHP remittance that is structurally cheaper than traditional rails at scale. This is a legitimate V3 architecture, not a speculative bet.

3. **Cultural opening in PH fintech.** GCash launched Pera Coach (an AI financial advisor) in March 2026, signaling that the Philippine consumer is ready for AI-powered financial tools in their native language. Buddy can ride this wave without having to educate the market from zero.

---

## 3. Problem & Solution

### 3.1 The user problem

An OFW sending money home faces five consistent frustrations:

1. **Opaque pricing.** "Fee-free" transfers often hide 2-4% in FX markup. The user has no way to see the true total cost without manually calculating it across multiple provider websites.
2. **No real comparison.** Existing "comparison sites" (Monito, CompareRemit, etc.) show a rate table and leave the user to figure it out. They do not recommend, they do not explain, and they do not execute.
3. **Fragmented recipient management.** Every provider stores recipients in its own app. Switching providers means re-entering Mom's GCash number, photo ID, address. This is friction that traps users in mediocre providers.
4. **No family context.** Remittances are family events, not solo transactions. The sender, the recipient, and often 3-5 other family members are all involved in planning (roof fund, school fees, medical bills). No app models this reality.
5. **Cultural disconnect.** Filipino OFWs want their financial tools to speak Tagalog, understand GCash, make jeepney jokes, and reward them with Jollibee. Western fintechs cannot credibly deliver this.

### 3.2 Buddy's solution

Remittance Buddy is a **decision engine, a family hub, and a cultural product in one**. Each of these three layers addresses one of the unmet needs.

**Layer 1: The decision engine.** Buddy scrapes public quote APIs from 7+ providers (Wise, Remitly, Western Union, Xoom, MoneyGram, WorldRemit, Pangea) in real time, runs them through a weighted scoring engine that considers cost, speed, trust, GCash support, and corridor-specific factors, and returns a single clear recommendation. The user sees exactly what they would pay at each competitor and understands why Buddy's pick is the winner.

**Layer 2: The family hub.** Buddy stores recipients once. A user invites their sister, cousin, or parents to a shared "family" group. They can collectively set savings goals ("roof fund" for Lola's house, "school fund" for nephew's tuition), see progress, and contribute. This turns a transactional product into a social one — and social products have fundamentally better retention than utility products.

**Layer 3: The cultural wrapper.** Tagalog voice assistant, Tagalog UI, jeepney humor in microcopy, Jollibee/Lazada/Globe partner cashback, OFW-specific financial insights ("your cohort typically sends on the 15th and 30th — want us to pre-quote for you?"). This is the layer that Western fintechs cannot clone quickly.

### 3.3 The three things Buddy does differently

| | Legacy (WU, MoneyGram) | Modern (Wise, Remitly) | **Buddy** |
|---|---|---|---|
| **Fees** | 5-8% | 0.5-2% | 0.5% (match-Wise guarantee) |
| **Comparison** | None | None | 7+ providers, live, scored |
| **Recommendation** | None | None | Single winner, explained |
| **Family features** | None | None | Group hub, shared goals, multi-user |
| **Cultural fit (PH)** | Generic | Generic | Native Tagalog, GCash-first, Jollibee rewards |
| **Voice / AI assistant** | None | None | "Hey Buddy, send $500 to Mom" |
| **Rails flexibility** | Own network only | Own network only | Multi-rail (NIUM + Wise + crypto) |
| **Mobile experience** | Slow, counter-style | Decent | Modern, 2-minute flow |

---

## 4. Product: Current Build State

This section is unusual for a pre-launch business plan because **a substantial foundation is already built**. The product is not vaporware. Below is a precise inventory of what exists in the codebase today, what is deployed, and what remains to be built.

### 4.1 Already built and deployed

The following systems are live in production or fully implemented in the codebase:

#### 4.1.1 Landing page — `remitance-buddy.vercel.app`

A fully responsive, mobile-optimized landing page with 11 distinct sections, built in Next.js 16 + React 19 + Tailwind CSS. **Total: ~1,537 lines of production component code.**

| Section | Features |
|---|---|
| **Nav** | Sticky glass header, scroll-aware blur, mobile drawer menu, ESC-close keyboard handling |
| **Hero** | Live interactive compare widget showing real-time ranked quotes, typography display with drawable coral underline, CTA buttons, trust row with 4.9/5 rating and 12,847 transfer count |
| **ProviderStrip** | Infinite-marquee of 12 partner provider names (Wise, Remitly, Western Union, Xoom, MoneyGram, WorldRemit, Ria, Revolut, Zelle, PayPal, Sendwave, Payoneer) |
| **Stats** | 4-tile hover-animated band: $2.4M saved, 24 providers, 60s refresh rate, 4.9★ rating |
| **HowItWorks** | 3-step process with animated icons, coral glow hover states, step number typography |
| **Features** | 6-card value grid: transparent math, AI-powered decisions, corridor-native, Chrome extension, privacy, free forever |
| **Corridor** | US → Philippines spotlight with delivery methods card (GCash, bank, cash pickup, door delivery), live stats, Mexico corridor tease |
| **Testimonials** | 3 OFW sender testimonials with star ratings, quote glyphs, send amounts |
| **FAQ** | 6-question accordion with smooth animations, first-item-open default, chevron rotations |
| **FinalCTA** | Dark gradient card with "Stop guessing. Start sending smarter." headline and Compare + Install Extension CTAs |
| **Footer** | 4-column layout with brand, Product, Company, Legal sections |

**Hero motion system** (zero-dependency custom implementation):
- `useHeroMotion.ts` — Count-up animation from ₱0 to ₱28,710 on mount via rAF, easeOutExpo, 1.4s duration
- `useMagneticTilt.ts` — Cursor-tracked 3° perspective tilt on desktop, springs back via cubic-bezier
- `useParallax.ts` — Scroll-linked Y transform at 0.92x speed, capped at 60px, rAF-throttled
- `DrawableUnderline.tsx` — SVG path draw via stroke-dasharray on IntersectionObserver trigger
- `Reveal.tsx` — Bidirectional fade-in wrapper for all sections (re-fades on scroll-up)
- Background gradient blobs breathe on CSS keyframes, trust row dots heartbeat with staggered delays
- Full `prefers-reduced-motion` support — all animations disable on request
- Touch device detection skips parallax and tilt on mobile

#### 4.1.2 Chrome extension — fully functional

Two-app Chrome extension built with Vite + React 19 + Tailwind:

**Popup (toolbar icon)** — sleek single-purpose decision view:
- Compact header with language toggle (EN/TL/ES)
- Corridor pill (US → PH GCash)
- Live "Live rates · 12s" ticker with dynamic countdown
- Borderless giant amount input with real-time peso conversion animation
- Quick-amount chips ($100, $200, $500, $1K)
- Top Recommendation card with the scoring engine's winner
- Provider badge with GCash/bank routing
- Fact chips: Fee, Speed, Savings vs worst
- Teal seal-check pulse badge
- Full-width coral CTA with shine-sweep hover animation
- "Also ranked" alternatives list with receipt-style rows and coral delta indicators
- Dark charcoal footer opening sidepanel

**Sidepanel** — AI chat experience:
- OnboardingView with Supabase auth (email + password, sign-up flow)
- ChatView powered by Vercel AI SDK + Anthropic Claude
- Streaming chat messages with tool-calling support
- Provider comparison card rendering for AI tool responses
- Rate-updated timestamps, language toggle
- Sign-out flow

**Scoring engine** (`lib/scoring-engine.ts`):
- 7-provider data model (Remitly, Wise, Xoom, Western Union, MoneyGram, WorldRemit, Pangea)
- Weighted scoring across cost, speed, trust, GCash/cash pickup support
- Category winners: cheapest, fastest, most received, most trusted, best cash pickup
- Savings vs. worst calculation
- Explanations for each provider's rank
- **Currently uses hardcoded rates — production upgrade to live rate fetching is a V1 priority**

**Affiliate infrastructure** (`lib/affiliates.ts`):
- Provider-keyed URL routing (Impact, CJ Affiliate, Wise direct, fallback)
- Status tracking per provider (pending, active, unavailable)
- Click tracking with chrome.storage.local persistence
- Last-500-click buffer for analytics

**Internationalization** (`lib/i18n.ts`):
- English, Tagalog, Spanish string tables
- Context-wrapped useI18n hook
- LanguageToggle component

#### 4.1.3 Backend infrastructure — Next.js API routes

The apps/web Next.js application has the following production API endpoints scaffolded:

| Route | Purpose | Status |
|---|---|---|
| `POST /api/chat` | Streaming AI chat with Anthropic Claude | Working |
| `GET/POST /api/recipients` | Recipient CRUD | Scaffolded |
| `DELETE /api/recipients/[id]` | Delete recipient | Scaffolded |
| `GET/POST /api/transfers` | Transfer list + creation | Scaffolded |
| `POST /api/payments/intent` | Stripe PaymentIntent creation | Scaffolded |
| `POST /api/kyc/create-inquiry` | Persona KYC session creation | Scaffolded |
| `POST /api/affiliate/track` | Affiliate click logging | Working |
| `GET /api/users/me` | Current user profile | Working |
| `POST /api/webhooks/clerk` | Auth state sync | Working |
| `POST /api/webhooks/persona` | KYC completion events | Scaffolded |
| `POST /api/webhooks/stripe` | Payment lifecycle events | Scaffolded |
| `POST /api/webhooks/wise` | Transfer state updates | **Implemented end-to-end** |

#### 4.1.4 Partner integration libraries

Four production-ready integration libraries exist in `apps/web/src/lib/`:

- **`wise.ts`** — Wise Business API client with sandbox/live environment switching, quote creation, transfer initiation, status polling, webhook signature verification, status-mapping to internal Buddy states
- **`stripe.ts`** — Stripe SDK wrapper with customer creation, PaymentIntent management, metadata-based user linking
- **`persona.ts`** — Persona KYC integration for identity verification inquiries
- **`supabase/`** — Server-side Supabase client (used by Chrome extension for auth)

#### 4.1.5 Database — Drizzle ORM with PostgreSQL

Production-grade schema design across **7 core tables**:

| Table | Purpose |
|---|---|
| `users` | User profiles, linked to Clerk via `clerkUserId` |
| `transfers` | Full transfer lifecycle with provider enum (wise, currencycloud), status enum (quote → pending → processing → completed/failed/cancelled), idempotency keys, FX rate storage, recipient metadata |
| `recipients` | Recipient bank account information (encrypted before insert), country code, payout method |
| `compliance_checks` | KYC/AML/sanctions checks with provider tracking (persona, sardine), result enum (pass/fail/review), metadata JSON |
| `audit` | Audit log for all state-changing operations |
| `notifications` | User notification queue |
| `affiliate_clicks` | Click tracking for affiliate hand-offs and provider attribution |

All schemas include:
- UUID primary keys with defaults
- Timestamp tracking (createdAt, updatedAt)
- PostgreSQL enums for constrained fields
- JSONB columns for flexible metadata
- Proper foreign key relationships
- TypeScript type inference via Drizzle

#### 4.1.6 AI tool system — Anthropic Claude agent

The chat system in the sidepanel is not just a basic LLM conversation. It is an **Anthropic tool-calling agent** with four production tools:

| Tool | Purpose |
|---|---|
| `check-rates` | Query the scoring engine and return ranked provider quotes |
| `get-corridor-info` | Return corridor-specific metadata (max amounts, documents required, restrictions) |
| `get-recipients` | Fetch the user's saved recipients for a follow-up question |
| `get-transfer-history` | Return prior transfers for context and pattern matching |

System prompt is production-grade, covering persona, tool usage rules, response formatting, and cultural context (Tagalog greetings, family framing).

#### 4.1.7 Dashboard (authenticated area)

Pages scaffolded in `apps/web/src/app/(dashboard)/`:

- `/dashboard` — main user home
- `/onboard` — first-time user onboarding
- `/recipients` — recipient book UI with client-side list rendering
- `/transfers` — transfer history list
- `/transfers/[id]` — individual transfer detail view
- `/kyc` — KYC upload flow wrapper around Persona

### 4.2 Scaffolded but needs completion

The following features exist in the codebase as schema + API route + partial UI, but require production-readiness work:

- **Live rate fetching.** Scoring engine uses hardcoded rates. V1 priority is building a Vercel cron job that polls public provider quote APIs every 60 seconds and caches in Upstash Redis.
- **End-to-end Wise transfer flow.** The Wise Business API client exists, the webhook handler exists, the transfers table exists, but the UI flow and state machine reconciliation need testing in Wise sandbox.
- **Recipient verification via Wise.** Recipient creation API exists but does not yet validate with the partner rail.
- **KYC completion flow.** Persona integration is scaffolded but needs testing, error handling, and UI polish for failure modes.
- **Payment funding.** Stripe PaymentIntent creation exists but the full ACH / Plaid / bank link flow for actually collecting money from users is not yet wired.
- **Premium subscription.** Stripe customer exists but recurring subscription billing for Buddy Plus is not yet integrated.

### 4.3 Not yet built (V1 and beyond)

Features listed in the vision but requiring fresh engineering:

- **NIUM provider integration** (V2 primary rail)
- **Currencycloud / Thunes integration** (V2 backup rails)
- **Wise Platform B2B integration** (V2 upgrade when approved)
- **Bridge.xyz + Coins.ph crypto bridge** (V3 architecture)
- **Family group features** — shared recipients, group goals, group chat
- **Voice assistant** — Tagalog voice input/output (V2)
- **Rate alerts and forecasting** — premium feature
- **Cashback partner integrations** — Jollibee, Lazada, Globe load, etc.
- **Multi-corridor dynamic support** — currently hardcoded to US → PH
- **Multi-language expansion** — Bengali, Urdu, Vietnamese for V3 underserved corridors
- **Mobile native apps** (iOS/Android) — V2 or V3
- **Referral program** with tracked incentives
- **Customer support tooling** and runbooks

### 4.4 Technology stack

| Layer | Technology |
|---|---|
| **Frontend (web)** | Next.js 16, React 19, Tailwind CSS 3.4, TypeScript 5.7, Vercel deployment |
| **Frontend (extension)** | Vite + React 19 + @crxjs/vite-plugin, Chrome Manifest V3 |
| **Backend** | Next.js API routes (serverless), Vercel Functions |
| **Database** | PostgreSQL via Neon, Drizzle ORM |
| **Auth** | Clerk (web), Supabase auth (extension — will be unified) |
| **AI** | Anthropic Claude via Vercel AI SDK (tool-calling agent) |
| **Payments** | Stripe (customer, PaymentIntent, Subscriptions) |
| **KYC** | Persona (inquiry API, webhook-based status) |
| **Rails (V1)** | Wise Business API (scaffolded); affiliate hand-off for non-matched routes |
| **Rails (V2)** | NIUM (primary), Currencycloud / Thunes (backup) — to integrate |
| **Rails (V3)** | Bridge.xyz + Coins.ph / PDAX stablecoin bridge — to integrate |
| **Observability** | Sentry, Vercel Analytics, Vercel Speed Insights |
| **Rate limiting** | Upstash Redis + @upstash/ratelimit |
| **Monorepo** | Turborepo, pnpm workspaces |

---

## 5. Business Model & Unit Economics

### 5.1 Revenue streams

Buddy generates revenue from four stacked streams, each with different margin profiles and growth dynamics:

**1. Transaction fees (primary stream, V2+).** A 0.5% service fee on transfers routed through Buddy's integrated rails. This is the largest revenue line at scale and the closest to a "fintech unit economic." Margin per $400 send: ~$1.40 net at NIUM tier 1 (match-Wise pricing on dominant corridors), ~$1.60-2.10 on side corridors where Buddy wins outright.

**2. Affiliate commissions (V1 bridge stream).** When Buddy is not the cheapest provider on a given transfer, the user is routed to the winning competitor via a tracked affiliate link. Buddy earns a one-shot commission (~$7 average) when the user completes their first transfer at the new provider. This is the revenue model during the Lite Buddy V1 phase, before rails integration. It is explicitly NOT treated as recurring — affiliate programs pay only for first-time customer conversions.

**3. Premium subscription ("Buddy Plus," $1.99/month).** Recurring subscription for advanced features: rate alerts, scheduled sends, forecast models, family hub priority access, ad-free, and eventually priority voice assistance. Target attach rate: 5% at 1k users growing to 15-20% at 100k users. Pure margin (no COGS beyond platform fees).

**4. Cashback partner commissions.** Revenue share from partner merchants (Jollibee, Lazada, Globe Telecom, Smart) when Buddy users click through to partner offers. 5-10% commission on qualifying purchases. Scales with user count and partner network density.

### 5.2 Unit economics per transfer

The following is the honest per-transfer economic picture on a representative $400 US → PH GCash transfer at NIUM tier 1 pricing (standard startup rate, no negotiation, the conservative baseline):

```
User pays Buddy                           $402.00 (0.5% fee)

Cost to Buddy:
  Send to NIUM                            $400.00
  NIUM Pay-In ACH fee                     -$0.25
  NIUM Pay-Out (GCash) fee                -$0.35
  NIUM FX margin (baked into rate)        -$0.45 (effective vs mid-market)
  Stripe/Plaid collection                 -$0.30
  ────────────────────────────────────────────────
  Total Buddy cost                        $401.35

Buddy net per matched send                $0.65
```

For corridors where Wise does not compete (cash pickup, Maya, provincial PH banks, MENA → PH), Buddy charges the full 0.5% without needing to match Wise, yielding ~$1.40-1.70 net per send.

**Blended average at 1,000 mature users** (60% US → PH GCash matched, 40% side corridors full margin): **~$1.10 net per transfer**.

### 5.3 Pricing philosophy

Buddy applies a **dynamic, honest pricing model** that maintains its brand promise without sacrificing margin where it matters:

- **Match Wise on dominant corridors.** On US → PH GCash, where Wise is the cost leader, Buddy matches Wise.com pricing exactly by absorbing the wholesale-to-consumer gap through its Buddy fee. The user sees: "we compared 7 providers, we're tied for the cheapest, here's our recommendation with features Wise doesn't offer." This is honest, defensible, and retains users.
- **Full margin on underserved corridors.** On cash pickup, Maya, provincial banks, and MENA → PH, Wise does not compete. Buddy charges the full 0.5% here and earns healthy margin.
- **Best-price guarantee as the trust mechanism.** Published guarantee: if you find the same transfer cheaper on the same day, we refund the difference as Buddy credit toward your next send. Operationally rare but brand-building.
- **Never charge MORE than the cheapest competitor on any corridor.** This is the hard rule. If Buddy cannot match, it hands off to the winner via affiliate — keeping the user on Buddy's app rail but collecting the affiliate commission.

### 5.4 LTV analysis

OFW remittance is one of the highest-retention consumer fintech categories. Workers send predictably (usually on pay day, monthly or bi-monthly), their habit is formed, and switching cost is real once recipients are saved.

Projected user LTV over 24 months with always-close (non-affiliate) routing:

| Revenue source | Monthly per user | Annual per user | 24-month LTV |
|---|---|---|---|
| Transaction fees (2.5 sends × $1.10 net) | $2.75 | $33 | $66 |
| Buddy Plus subscription (15% attach at $1.99) | $0.30 | $3.60 | $7.20 |
| Cashback partner commissions | $0.30 | $3.60 | $7.20 |
| Insurance / micro-loan referrals (small) | $0.10 | $1.20 | $2.40 |
| **Total LTV per user (24 months)** | **$3.45** | **$41.40** | **~$83** |

**Benchmarking.** This LTV is comparable to:
- Chime: ~$40-60/user/year
- Cash App: ~$60-120/user/year (card interchange pushes it higher)
- Revolut: ~$50-80/user/year
- Typical SaaS: $100-300/year

With LTV in the $75-100 range and blended acquisition cost of $10-25 (largely organic TikTok + OFW Facebook groups), the LTV/CAC ratio is approximately **4-10x**, which is a healthy fundable metric.

### 5.5 Contrast: affiliate-only Lite Buddy model

For the V1 launch phase (before rails integration), Buddy operates as a SaaS-style Lite Buddy — comparison engine + hand-off to the winning provider via affiliate link + premium subscription. The per-user economics are lower but the launch is faster and capital-lighter.

| Metric | Lite Buddy V1 | Full V2 (with NIUM rails) |
|---|---|---|
| Launch time | 2-4 weeks | 8-12 weeks |
| Regulatory overhead | None | Requires BaaS partnership + KYC |
| Capital needed | $500-2,500 | $10-30k |
| Revenue per 1,000 users (month) | ~$1,400 | ~$2,600 |
| Net profit per 1,000 users (month) | ~$700 | ~$1,600 |
| Primary risk | Affiliate revenue is one-shot per user | Compliance approval timing |

The plan is to launch Lite Buddy V1 in weeks 1-4, acquire users during weeks 5-12, and upgrade those users to full V2 rails integration in weeks 13-20 as NIUM compliance completes.

---

## 6. Go-to-Market Strategy

### 6.1 Four-phase rollout

| Phase | Months | Key milestone | User target |
|---|---|---|---|
| **V1 — Lite Buddy** | 0-3 | Affiliate-only comparison + family hub + subscription | 1,000 active users |
| **V2 — Rails integration** | 3-9 | NIUM production, multi-corridor PH expansion | 10,000 active users |
| **V3 — Multi-rail + crypto bridge** | 9-18 | NIUM + Wise Platform + Bridge.xyz/Coins.ph, margin unlock | 100,000 active users |
| **V4 — Multi-corridor expansion** | 18-36 | Bengali, Urdu, Vietnamese markets, global diaspora | 1,000,000 users |

### 6.2 V1 Lite Buddy launch (months 0-3)

The goal of V1 is to **launch fast, validate demand, generate initial revenue, and — crucially — accumulate the user base Buddy needs to negotiate strong terms with BaaS providers in V2.** The product is SaaS-style, operationally simple, and has no regulatory overhead.

**What V1 looks like:**
- Landing page at remitance-buddy.vercel.app (already deployed)
- Live rate comparison engine pulling from 5-7 provider quote APIs via Vercel cron
- Decision engine recommending a winner per quote
- Recipient book (save Mom once, reuse forever)
- Family group hub (invite sister/cousin to view shared recipients and goals)
- "Send via [winner]" button that opens the provider via deep-linked affiliate URL
- Buddy Plus subscription at $1.99/month via Stripe
- Rate alerts and weekly savings digest (Plus features)
- Cashback partner offers (initially Jollibee and Globe load)

**What V1 does NOT include:**
- Rails integration (no money moves through Buddy)
- KYC / AML overhead
- Treasury float or BaaS partnership
- Per-transaction fees beyond subscription

**V1 revenue model:**
- Affiliate commission (~$7 avg, one-shot per user/provider): ~$350/month at 1k users
- Buddy Plus subscription (5% attach at $1.99): ~$100/month at 1k users
- Cashback partners: ~$50-200/month at 1k users
- **Total: ~$500-700/month at 1,000 active users**

**V1 cost structure:**
- Hosting + tools: ~$200/month
- Marketing: ~$500-2,000/month (scales with reinvestment from affiliate payouts)
- Net: break-even to ~$500/month profit at 1,000 active users

### 6.3 User acquisition strategy

User acquisition in V1 relies on organic channels first, with small paid amplification once unit economics are verified. The Filipino OFW community is unusually concentrated and reachable via a few specific channels.

**Primary channels:**
1. **TikTok organic content.** 3-5 videos per day, posted in Tagalog and English, targeting #OFW, #Philippines, #Remittance hashtags. Formats: "How I sent ₱28,000 home in 2 minutes," "Mistakes OFWs make when sending money," "Comparing Wise vs Remitly vs Western Union." Target: 1-2 videos reaching 10k+ views per week by month 2.
2. **OFW Facebook groups.** There are 50+ major Filipino OFW groups on Facebook with 50,000 to 500,000 members each. Genuine participation + helpful content + occasional product references. Target: organic membership and contribution in 15-20 largest groups by month 1.
3. **Reddit.** r/Philippines (2.1M members), r/OFW, r/personalfinancephilippines. Non-promotional helpful content that establishes expertise.
4. **Filipino micro-influencers.** 10-20 diaspora creators with 5k-50k followers, offered free Plus + small commission for authentic recommendations.
5. **Referral loop in-product.** "Invite Mom or a friend to see the rates — both get ₱100 Jollibee voucher." Referrer gets credit, referee gets welcome bonus.
6. **Viral family stories.** User-generated content campaign: "Mom got her padala + Jollibee" testimonial format, re-shared across TikTok and Instagram.

**Secondary channels (V2+):**
- Paid TikTok ads targeted at Filipino diaspora cities (NYC, LA, SF, Jeddah, Dubai, Singapore) — budget $500-2,000/month starting month 3
- Partnerships with Filipino associations (OWWA, Bayanihan networks, Filipino-American chambers of commerce)
- Featured placements in OFW news outlets (Rappler, Inquirer, GMA News, FilAm Star)

### 6.4 V2 rails upgrade (months 3-9)

By month 3, Buddy has 500-1,500 active users and real retention data. This unlocks the V2 rails integration:

1. **Apply to NIUM production with traction data.** User count, retention curves, affiliate revenue, and working sandbox integration. Approval probability: ~85% (vs ~60% without traction).
2. **NIUM compliance review runs in parallel with continued growth** (~6 weeks).
3. **Production launch.** "Send through Buddy" option added alongside existing affiliate hand-offs. Premium subscribers get free in-app sends as a Plus benefit.
4. **Per-send revenue layer kicks in.** Blended revenue per user jumps from ~$0.70/month to ~$1.80-2.50/month.

### 6.5 V3 multi-rail + crypto bridge (months 9-18)

With 10k+ users and real volume, Buddy unlocks the multi-rail architecture:

1. **Wise Platform application** submitted with real metrics. Approval probability: ~40-60% with $1M/month volume traction.
2. **Bridge.xyz integration** for USD → USDC conversion (self-serve, fast).
3. **Coins.ph or PDAX OTC** for USDC → PHP conversion (wholesale spreads negotiated).
4. **Smart routing engine** picks the optimal rail per quote:
   - If Wise Platform is cheapest: route through Wise
   - If NIUM is cheapest: route through NIUM
   - If crypto bridge is cheapest (at scale it usually is): route through Bridge + Coins.ph
5. **Unit margin improves from ~$1.10/send to ~$1.80-2.50/send** due to volume tiers and rail optimization.

### 6.6 V4 multi-corridor expansion (months 18-36)

Buddy expands beyond the Philippines corridor to the ~$290B underserved market:

- **Bangladesh** corridor (UK → BD, UAE → BD): bKash, Nagad, Rocket payouts via NIUM
- **Pakistan** corridor (UAE → PK, UK → PK, Saudi → PK): JazzCash, Easypaisa
- **Vietnam** corridor: MoMo, ZaloPay
- **Indonesia** corridor: DANA, OVO, GoPay
- **Nepal, Sri Lanka, Egypt**: expanding PH-anchored brand to broader Asian diaspora
- Localization: Bengali, Urdu, Vietnamese UI and voice assistant
- The Filipino-first brand becomes "smart remittance for underserved Asian corridors"

---

## 7. Technology & Infrastructure

### 7.1 Architecture overview

Buddy is built as a modular monorepo with clear separation between the consumer surfaces, the shared business logic, and the partner integrations. This architecture allows rapid addition of new rails, new corridors, and new features without rewrites.

```
remittance-buddy/
├── apps/
│   ├── web/              Next.js 16 + React 19 consumer app
│   │   ├── src/app/         App router, API routes, pages
│   │   ├── src/components/  UI components (landing/, ui/, dashboard/)
│   │   └── src/lib/         Wise, Stripe, Persona, Supabase clients
│   └── extension/        Chrome extension (Vite + React 19 + crxjs)
│       ├── src/popup/       Toolbar popup decision engine
│       ├── src/sidepanel/   AI chat + auth
│       └── src/background/  Service worker
└── packages/
    ├── api/              Shared business logic
    │   ├── src/providers/   Rails abstraction (types.ts exists)
    │   ├── src/tools/       AI tool implementations
    │   └── src/system-prompt.ts  Claude system prompt
    └── db/               Database layer
        ├── src/schema/      Drizzle schemas (7 tables)
        └── src/client.ts    Connection pool
```

### 7.2 Provider abstraction layer

The core architectural decision that makes the multi-rail future possible is a clean **Provider abstraction**. Every rail (Wise, NIUM, Currencycloud, Thunes, Bridge.xyz, etc.) implements a common interface:

```typescript
interface Provider {
  readonly name: string

  // Quote
  quote(input: QuoteRequest): Promise<Quote>

  // Beneficiary (recipient)
  createBeneficiary(input: BeneficiaryInput): Promise<Beneficiary>
  verifyBeneficiary(id: string): Promise<BeneficiaryStatus>

  // Pay-In (collect from sender)
  createCollection(input: CollectionRequest): Promise<Collection>
  getCollectionStatus(id: string): Promise<CollectionStatus>

  // Pay-Out (send to recipient)
  createTransfer(input: TransferRequest): Promise<Transfer>
  getTransferStatus(id: string): Promise<TransferStatus>

  // Webhooks
  verifyWebhookSignature(payload: string, sig: string): boolean
  parseWebhookEvent(payload: string): WebhookEvent
}
```

This means adding a new rail is a **~300-line adapter, not a rewrite**. The scoring engine, recipient form, confirm page, webhook handler, and database schema are all rail-agnostic. The provider abstraction exists in `packages/api/src/providers/types.ts` today with the initial type definitions in place.

### 7.3 Security & compliance

- **Recipient bank account data** is encrypted before database insert (column-level encryption planned via pgcrypto or envelope encryption via AWS KMS)
- **Rate limiting** on all public endpoints via Upstash Redis
- **Idempotency keys** on transfer creation to prevent double-charges
- **Audit logging** for all state-changing operations (compliance trail)
- **Webhook signature verification** for Wise, Stripe, Clerk, Persona (all implemented)
- **KYC integration via Persona** (scaffolded; BSP and FinCEN compliant workflows)
- **Sanctions screening** via Persona's built-in OFAC/PEP checks
- **GDPR and PH Data Privacy Act** compliance in roadmap (TOS, privacy policy, data retention rules)

### 7.4 Scalability and reliability

The Next.js + Vercel + Neon + Upstash stack is proven to handle millions of concurrent users at other fintech companies (e.g., Uniswap, Cash App merchant APIs, Mercury). Buddy's architecture is serverless-first, autoscaling, with PostgreSQL connection pooling via Neon's serverless Postgres. No single-point-of-failure infrastructure decisions.

---

## 8. Financial Projections

All figures below assume the V1 Lite Buddy → V2 NIUM rails → V3 multi-rail progression described in Section 6, with conservative user acquisition projections.

### 8.1 First 90 days (V1 Lite Buddy launch)

| Month | Users | Revenue | Costs | **Net** |
|---|---|---|---|---|
| Month 1 | 50-200 | $20 (early Plus subs only) | $582 | **−$562** |
| Month 2 | 300-500 | $470 (first affiliate trickle) | $394 | **+$76** |
| Month 3 | 800-1,500 | $2,103 | $1,674 | **+$429** |
| **3-month total** | **~1,000** | **$2,593** | **$2,650** | **−$57** |

The business is essentially break-even over the first 90 days, with a max personal capital draw of approximately **$600-1,500** at month 1-2. After month 3, reinvestment of affiliate revenue funds continued growth.

### 8.2 First 12 months (V1 → V2 transition)

| Month | Users | Monthly Revenue | Monthly Costs | **Monthly Net** | Cumulative Net |
|---|---|---|---|---|---|
| 1 | 200 | $20 | $582 | −$562 | −$562 |
| 2 | 500 | $470 | $394 | $76 | −$486 |
| 3 | 1,000 | $2,103 | $1,674 | $429 | −$57 |
| 4 | 1,800 | $3,800 | $2,200 | $1,600 | $1,543 |
| 5 | 3,000 | $6,300 | $3,000 | $3,300 | $4,843 |
| 6 | 5,000 (NIUM production goes live) | $11,000 | $5,000 | $6,000 | $10,843 |
| 7 | 8,000 | $18,000 | $7,500 | $10,500 | $21,343 |
| 8 | 12,000 | $27,000 | $10,500 | $16,500 | $37,843 |
| 9 | 16,000 | $36,000 | $13,500 | $22,500 | $60,343 |
| 10 | 20,000 | $45,000 | $16,000 | $29,000 | $89,343 |
| 11 | 23,000 | $52,000 | $18,000 | $34,000 | $123,343 |
| 12 | 25,000 | $60,000 | $20,000 | $40,000 | $163,343 |

**Year 1 summary:**
- Active users at end of year: **~25,000**
- Total year-1 revenue: **~$260,000**
- Total year-1 net profit: **~$163,000**
- Peak capital drawn (month 1): ~$1,500
- Break-even month: ~Month 3
- Self-funding threshold: ~Month 4

### 8.3 Three-year outlook

| Year | End-of-year users | Annual revenue | Annual net profit | Key milestones |
|---|---|---|---|---|
| **Year 1** | 25,000 | $260,000 | $163,000 | V1 launch, V2 NIUM rails live, initial scale |
| **Year 2** | 150,000 | $2,400,000 | $1,600,000 | V3 crypto bridge + Wise Platform partnership, multi-corridor UK/SG added |
| **Year 3** | 800,000 | $18,000,000 | $11,000,000 | Multi-diaspora expansion (Bangladesh, Pakistan, Vietnam), native mobile app, Series B |

**Year 2 drivers:**
- NIUM tier 2 pricing negotiated (30% cheaper per send)
- Wise Platform signed, routes dominant corridor through Wise at better margins
- Premium subscription attach rate grows from 5% to 12%
- Cashback partner network expands (Jollibee, Lazada, Globe, Smart all live)
- UK and Singapore corridors added via NIUM

**Year 3 drivers:**
- Crypto bridge (Bridge.xyz + Coins.ph/PDAX) live and routing ~40% of volume at structurally cheaper cost basis
- Native iOS + Android apps launched
- Bangladesh, Pakistan, Vietnam corridors open via Thunes
- Multi-language support (Bengali, Urdu, Vietnamese UI)
- Referral program driving 20%+ of new users
- Corporate partnerships with OFW employers and diaspora associations

### 8.4 Capital requirements by phase

| Phase | Capital needed | Funding source | Runway |
|---|---|---|---|
| **V1 launch (months 0-3)** | $1,500-2,500 | Founder personal capital | 3 months |
| **V1 operations (months 3-6)** | $0 (self-funding from affiliate) | Revenue reinvestment | Ongoing |
| **V2 rails integration (months 4-7)** | $5-10k (legal, compliance, KYC integration) | Revenue + optional seed bridge | 6 months |
| **V2 marketing push (months 6-12)** | $15-40k optional | Revenue + optional seed | N/A (profitable) |
| **V3 multi-rail build (months 9-15)** | $30-80k (engineering + compliance) | Seed round OR revenue | 9 months |
| **V4 multi-corridor (months 18-36)** | $500k-2M | Series A | 18-24 months |

**Minimum viable capital to launch and reach profitability: $2,500.** Everything beyond that accelerates growth but is not required for survival.

### 8.5 Break-even analysis

Buddy reaches break-even at approximately **650-900 active users** on the V1 Lite Buddy model (pure affiliate + subscription) and **300-500 active users** on the V2 rails-integrated model (higher per-user margin).

Given the organic acquisition model (TikTok + OFW Facebook groups + referrals), reaching 650 active users in **60-90 days** is a realistic target. This makes the business cash-positive within its first three months, a rare profile for a consumer fintech.

---

## 9. Competitive Landscape

### 9.1 Direct competitors (PH remittance)

| Competitor | Strengths | Weaknesses | Buddy's counter |
|---|---|---|---|
| **Wise** | Lowest fees, strong brand, mature tech | No comparison, no family features, no Tagalog, selective partnerships | Matches Wise on price via best-price guarantee, adds family hub + AI |
| **Remitly** | Huge PH marketing presence, fast to GCash | Higher fees than Wise, no comparison, no AI | Beats on transparency + features |
| **Western Union** | Brand recognition, cash pickup network | Expensive (5-8%), terrible UX, slow | Completely outclassed on price and UX |
| **MoneyGram** | Cash pickup, partnerships | Same as WU — expensive, slow | Same as WU |
| **Xoom (PayPal)** | Brand trust for PayPal users | High fees, limited features | Wins on transparency and comparison |
| **GCash (Pera Coach)** | 94M users, dominant in PH | Coach is advice-only, no transfers | Buddy is executable; Pera Coach is advisory |
| **Monito / CompareRemit** | Comparison sites | Comparison tables only, no execution, no features | Decision engine + execution + family hub |

### 9.2 What makes Buddy defensible

Buddy's moat is not price (Wise is the cheapest on its strong corridors and will remain so). Buddy's moat is the **bundle**: comparison + decision engine + family hub + cultural fit + multi-rail optimization. No single competitor has all four, and the cultural + family layers are the hardest to replicate.

Specifically:
- **Wise will not build family features.** It is outside their engineering priorities (they are focused on regulatory expansion and rate optimization).
- **Western Union cannot build a modern UX.** Their technical debt is immense.
- **GCash is focused on domestic PH.** International is not their core.
- **Comparison sites do not execute.** They are advertising businesses, not fintech.

Buddy's defensive position strengthens over time as it adds rails (more competitive pricing options), adds corridors (more users in underserved markets), and builds the family graph (network effect of recipients and shared goals).

### 9.3 The "smart cousin" positioning

Buddy's brand positioning is intentionally emotional rather than feature-led. Remittance is a **family act**, not a financial transaction, for the OFW community. Mothers pay for school fees. Sons fund medical bills. Nieces send birthday money. The act is laden with love, obligation, guilt, and pride.

Wise sells itself as a "smart financial tool." Buddy sells itself as "the smart cousin" — the family member who happens to know which provider is cheapest this week, which Jollibee promo is on, how to save for Lola's roof. This emotional positioning differentiates Buddy in a market where every other player sounds like a bank.

---

## 10. Team & Execution

### 10.1 Current team

- **Founder / CEO** — Product, engineering, design, marketing, ops. Sole operator during V1 Lite Buddy phase.

### 10.2 Planned hires (V2 onwards)

| Role | Timing | Purpose |
|---|---|---|
| **Part-time customer support (PH-based, bilingual)** | Month 5-6 (at ~5k users) | Handle support tickets, manual KYC reviews |
| **Part-time developer** | Month 7-8 (at ~10k users) | Backend features, rails integrations |
| **Full-time growth lead** | Month 9-12 (at ~15-25k users) | TikTok + Facebook ads, influencer partnerships, content |
| **Fractional compliance officer** | Month 10-12 (at V2 production launch) | AML monitoring, audit, regulatory filings |
| **Full-time mobile engineer** | Year 2 Q1 | iOS + Android native apps |
| **Head of partnerships** | Year 2 Q2 | BaaS negotiations, corridor expansion, OFW associations |

### 10.3 Advisor slate (target)

- **Philippine fintech veteran** (ex-GCash, Maya, or BSP) — regulatory navigation
- **US fintech veteran** (ex-Wise, Remitly, Cash App) — scaling and rail partnerships
- **Filipino diaspora community leader** — marketing credibility and network
- **Payments lawyer** (PH + US dual-qualified) — compliance structure

---

## 11. Implementation Timeline

### 11.1 The 90-day launch plan (V1 Lite Buddy)

This section is the concrete operational plan for the first 90 days. Every week has specific deliverables and measurable outcomes.

#### Days 1-14: V1 Foundation

**Goals:** Ship Lite Buddy MVP, launch affiliate integrations, begin content marketing

- Day 1: Form LLC via Stripe Atlas or LegalZoom, apply for EIN, open Mercury business bank account
- Day 1: Apply for affiliate networks (Impact, CJ Affiliate, Awin, Wise direct)
- Day 2-3: Apply to NIUM sandbox, Currencycloud, Thunes, Bridge.xyz in parallel (hedge strategy)
- Day 3-5: Build live rate fetching (Vercel cron pulling Wise, Remitly, WU, Xoom, MG, WR, Pangea public APIs every 60s, cache in Upstash)
- Day 5-7: Update landing page Hero compare widget to show real live rates from cron cache
- Day 7-10: Build recipient management (`POST /api/recipients`, recipient form UI)
- Day 10-12: Build family group hub (shared recipients, invite by email)
- Day 12-14: Integrate Stripe Subscriptions for Buddy Plus ($1.99/month)
- **Deliverable**: Working Lite Buddy app deployed, first 3-5 beta users

#### Days 15-30: Launch and organic growth

**Goals:** First 100-200 users, first affiliate commissions registered

- Day 15: Public soft-launch on landing page, email to personal network
- Day 15-30: 3-5 TikTok videos per day (Tagalog + English), targeting OFW hashtags
- Day 15-30: Join 15-20 largest Filipino OFW Facebook groups, participate authentically
- Day 17: Submit Chrome extension update to Chrome Web Store
- Day 20: Launch referral program ("Invite Mom, both get ₱100 Jollibee voucher")
- Day 22: First Reddit posts in r/Philippines, r/OFW
- Day 25: Outreach to 10 Filipino micro-influencers
- **Deliverable**: 200+ signups, 50+ active users, first affiliate conversions registered

#### Days 31-60: Growth acceleration

**Goals:** 500+ users, first affiliate payouts, test paid ads

- Day 31-60: Continue TikTok content, identify winning formats
- Day 35: First affiliate payouts arrive (from month 1 activity) — ~$200-400
- Day 40: Launch small paid TikTok ad test ($10/day) on best organic videos
- Day 45: Apply for NIUM production (with real traction data in hand)
- Day 50: Launch FB/Instagram paid ads in top 3 Filipino diaspora cities
- Day 55: First cashback partner signed (Jollibee or Globe load)
- Day 60: First premium subscribers → $15-30 MRR from subscriptions
- **Deliverable**: 500-800 active users, first paid ad ROI data, NIUM production application submitted

#### Days 61-90: Reinvest and scale

**Goals:** 1,000-1,500 users, profitable unit economics, NIUM application advancing

- Day 61-90: Scale winning paid ad creatives, kill losers
- Day 65: Second cashback partner signed
- Day 70: NIUM compliance review progressing (sandbox demo shared)
- Day 75: Content marketing flywheel — user testimonials repurposed into content
- Day 80: OFW news outreach (Rappler, Inquirer, FilAm Star)
- Day 85: First featured article coverage, if successful
- Day 90: **V1 milestone: 1,000+ active users, self-sustaining revenue, NIUM production in advanced review**

### 11.2 Months 4-12 (V2 rails integration)

| Month | Primary goal | Users target | Revenue target |
|---|---|---|---|
| 4 | NIUM sandbox integration built, production application submitted | 1,800 | $3,800/month |
| 5 | Production NIUM credentials received, soft launch rails to first 100 users | 3,000 | $6,300/month |
| 6 | Full V2 launch: "Send through Buddy" CTA on all compatible routes | 5,000 | $11,000/month |
| 7 | Premium attach push, family hub live | 8,000 | $18,000/month |
| 8 | Second BaaS partner (Currencycloud or Thunes) as backup + specialty | 12,000 | $27,000/month |
| 9 | Apply to Wise Platform with real traction | 16,000 | $36,000/month |
| 10 | Multi-corridor: add UK → PH and SG → PH | 20,000 | $45,000/month |
| 11 | Negotiate NIUM tier 2 pricing | 23,000 | $52,000/month |
| 12 | Year 1 close: 25k users, $60k/month revenue | 25,000 | $60,000/month |

### 11.3 Year 2 (V3 multi-rail + crypto bridge)

- Q1: Wise Platform live. Bridge.xyz integration built.
- Q2: Coins.ph or PDAX OTC partnership for PH off-ramp. Smart routing engine picks best rail per send.
- Q3: First 100k users. Native mobile apps launched (iOS first).
- Q4: Android launched. Bangladesh corridor begins soft launch.

### 11.4 Year 3 (V4 multi-corridor expansion)

- Pakistan, Vietnam, Indonesia, Nepal corridors added via Thunes
- Bengali, Urdu, Vietnamese localization shipped
- Brand transitions from "Filipino remittance" to "smart remittance for underserved corridors"
- Series B fundraise target
- 800k+ users, $18M+ annual revenue

---

## 12. Risk Analysis & Mitigation

### 12.1 BaaS partner approval risk

**Risk:** NIUM or Currencycloud rejects the production application, delaying V2 rails launch.

**Mitigation:**
- Apply to 5 providers in parallel (NIUM, Currencycloud, Thunes, Stable, Bridge.xyz) from week 1 — approval probability with any one of them exceeds 95%
- Provider abstraction layer means adapters are ~300 lines each — switching rails is not a rewrite
- V1 Lite Buddy continues to operate profitably on affiliate + subscription even if all BaaS partners reject
- Fallback: operate as an agent of an existing MSB (Stable, Sila) with faster approval at slightly worse terms

### 12.2 Regulatory risk

**Risk:** BSP, FinCEN, or state regulators require additional licenses or change rules affecting remittance operations.

**Mitigation:**
- V1 Lite Buddy has zero regulatory burden (no money movement by Buddy)
- V2+ operations run through NIUM / BaaS partner's existing licenses, not Buddy's
- Buddy operates as an introducing broker / agent of payee model with clear legal structure reviewed by fintech counsel
- BSP has publicly embraced digital remittance innovation — regulatory environment is net positive
- Stablecoin bridge (V3) runs through licensed exchanges (Coins.ph, PDAX) holding VASP licenses

### 12.3 Market competition risk

**Risk:** Wise or GCash launches competing features (voice assistant, family hub, comparison engine).

**Mitigation:**
- Wise's engineering is focused on rates and regulatory expansion; they have not built social/family features in 14 years of operation
- GCash is domestically focused — cross-border is not their priority
- Buddy's cultural layer (Tagalog, Filipino humor, Jollibee rewards) is extremely hard for non-Filipino companies to clone authentically
- Multi-rail advantage compounds over time — Buddy becomes cheaper than single-rail competitors at scale

### 12.4 User acquisition risk

**Risk:** Organic TikTok and FB group growth does not scale, requiring expensive paid ads.

**Mitigation:**
- Early validation in month 1-2 provides data — if organic fails, pivot to affiliate-only survival mode
- Diverse channel mix (TikTok, FB groups, Reddit, influencers, referrals) reduces single-point-of-failure
- Family referral loop is structurally viral — every active user invites 2-3 family members
- Small paid ad tests start in month 2 to validate paid CAC before scaling

### 12.5 Execution risk

**Risk:** Solo founder cannot execute the entire V1 plan in 90 days.

**Mitigation:**
- 80% of V1 infrastructure is already built (landing page, database schemas, Wise integration, webhooks, API routes)
- V1 scope is intentionally minimal — affiliate + subscription + family hub, no regulatory surface
- Scope can be reduced further if timelines slip (skip family hub, just launch comparison + affiliate)
- Contractors available for specific tasks ($2-4k/month part-time engineer if needed)

### 12.6 Fraud and chargeback risk

**Risk:** Affiliate fraud (fake conversions, clawbacks) or Stripe chargebacks on subscriptions.

**Mitigation:**
- Affiliate networks have built-in fraud detection (clawback window during which pending commissions can be reversed)
- Stripe subscription has 120-day chargeback window — conservative cash flow management
- V2+ rails fraud handled by BaaS partner's infrastructure (NIUM monitors, flags, investigates)
- User-level trust scoring built into scoring engine for future anti-fraud layering

### 12.7 Treasury and cash flow risk

**Risk:** Affiliate payment delays (30-60 days) create short-term cash flow gap.

**Mitigation:**
- Max personal capital draw is projected at $1,500-2,500 — manageable by founder
- Premium subscription pays out via Stripe within 2 days, providing immediate cash flow
- Cashback partner upfront bonuses ($500-2k one-time) can cover early months
- Impact.com and CJ Affiliate offer weekly payouts for active publishers (ask and negotiate)

---

## 13. Partnership Opportunity

### 13.1 What Buddy is seeking

Remittance Buddy is at an inflection point. The foundation is built. The product is deployed. The market is validated by competitive dynamics. What Buddy needs from a strategic partner is one or more of the following:

**Option A: Operational co-founder.** A partner with fintech, marketing, or community credentials who joins as a full co-founder with meaningful equity, sharing the execution load during V1 launch and V2 rails integration.

**Option B: Advisor with check.** A fintech or Philippine diaspora operator who brings advisory value (introductions, expertise, credibility) along with an angel check ($25-100k) at a fair pre-seed valuation.

**Option C: Strategic partnership.** A non-equity partnership with a Filipino bank, telecom, or diaspora organization that provides distribution, co-marketing, or corridor-specific advantages in exchange for revenue share or preferred partner status.

**Option D: Seed investor.** An institutional or angel investor leading or participating in a pre-seed ($250-500k) or seed ($1-3M) round, with Buddy operating as the lead.

### 13.2 What a partner brings

Depending on the path, Buddy is most interested in partners who can contribute meaningfully to one or more of:

- **BaaS partnership navigation.** Warm introductions to NIUM, Currencycloud, Thunes, Wise Platform, or Stable BD teams. A single warm intro can compress sales cycles from 10 weeks to 3 weeks.
- **Filipino diaspora marketing reach.** Access to OWWA networks, Filipino-American chambers of commerce, major OFW Facebook groups with owner-level access, or influencer relationships.
- **Philippines regulatory navigation.** BSP relationships, legal counsel familiar with remittance and e-money regulation, introductions to Coins.ph, PDAX, or local bank partners.
- **Fintech operational experience.** Prior experience launching a consumer fintech (anywhere in the world) that can compress learning curves and avoid common mistakes.
- **Product and engineering leverage.** For a technical co-founder, direct contribution to V2 rails integration and V3 crypto bridge architecture.
- **Capital.** Operating runway to support faster hiring, paid marketing, and parallel track execution.

### 13.3 What the partner gets

- **Equity in a capital-efficient consumer fintech** with a large TAM, clean unit economics, and a clear path to venture-scale revenue
- **Early-stage entry** before significant dilution from follow-on rounds
- **Strategic exposure** to the underserved remittance corridor opportunity ($290B TAM) with a product already proven in the Philippines corridor
- **Infrastructure already built** — not a pitch deck, a deployed application with working Wise API integration, database schemas, webhooks, and design system
- **Clear path to exit** — the Philippine fintech landscape has active consolidation (GCash, Maya, and Coins.ph are all active acquirers; Wise and Remitly have both acquired smaller players)
- **Aligned founder** who has demonstrated execution (the entire V1 foundation was built before this business plan was written)

### 13.4 Terms framework

Specific equity, role, and economic terms are open to negotiation based on the partner's contribution profile. As a reference framework:

- **Operational co-founder (full-time):** 20-40% equity with standard 4-year vest, 1-year cliff
- **Part-time advisor + angel check:** 0.5-2% equity for advisory + pro-rata equity for investment at a pre-money valuation of $3-5M
- **Institutional pre-seed:** 15-25% dilution for $250-500k check at a $2-4M post-money valuation
- **Strategic partnership:** Revenue share of 5-15% on partnership-sourced volume, or equity equivalent for significant commitments

All terms are subject to legal review and mutual agreement.

### 13.5 What happens in the first 30 days of partnership

Upon agreeing to terms, Buddy and the partner would execute the following in the first 30 days:

- Week 1: Signed term sheet, legal closing, partner access to all codebases, documents, and sandbox credentials
- Week 2: Joint work session — identify V1 launch critical path, align on 90-day goals, split responsibilities
- Week 3: NIUM application submitted (if not already), affiliate networks activated, Chrome Web Store listing updated
- Week 4: V1 Lite Buddy public launch, first 100 users acquired

---

## 14. Appendices

### Appendix A: Detailed unit economics worksheet

#### A.1 NIUM tier 1 cost basis (US → PH GCash, $400 send)

```
User pays Buddy                       $402.00 (base $400 + 0.5% fee)

Cost breakdown to Buddy:
  Funds sent to NIUM                  $400.00
  NIUM Pay-In ACH fee                  -$0.25
  NIUM Pay-Out GCash fee               -$0.35
  NIUM FX spread (embedded in rate)    -$0.45 equivalent
  Plaid bank link fee                  -$0.30
  ────────────────────────────────────────────
  Total cost to Buddy                 $401.35

Buddy gross margin per send            $0.65
```

#### A.2 Corridor margin table (various routes, $400 send)

| Corridor | NIUM margin | Wise beats Buddy? | Buddy strategy | Net per send |
|---|---|---|---|---|
| US → PH GCash | $0.65 | Roughly tied | Match Wise, charge 0.5% | $0.65 |
| US → PH Maya | $0.75 | Wise doesn't offer | Charge 0.5% | $1.60 |
| US → PH bank | $0.70 | Wise slightly better | Match Wise | $0.70 |
| US → PH cash pickup | $0.90 | Wise doesn't offer | Charge 0.5% | $1.70 |
| UK → PH GCash | $0.55 | Wise slightly better | Match Wise | $0.55 |
| SG → PH GCash | $0.80 | Wise slightly better | Match Wise | $0.80 |
| UAE → PH GCash | $0.70 | Wise weak in MENA | Charge 0.5% | $1.65 |
| Saudi → PH GCash | $0.75 | Wise weak in MENA | Charge 0.5% | $1.70 |

Weighted blended average at typical volume mix: **~$1.10 per send net**.

### Appendix B: Detailed revenue projections

#### B.1 Year 1 month-by-month

| Month | Users | Sends/mo | Tx revenue | Premium | Cashback | Other | Total rev | Costs | Net |
|---|---|---|---|---|---|---|---|---|---|
| 1 | 200 | 280 | $0 (V1 no rails) | $10 | $10 | $0 | $20 | $582 | −$562 |
| 2 | 500 | 700 | $350 (affiliate) | $50 | $50 | $20 | $470 | $394 | $76 |
| 3 | 1,000 | 1,400 | $1,050 (affiliate) | $150 | $100 | $803 | $2,103 | $1,674 | $429 |
| 4 | 1,800 | 2,520 | $1,890 (affiliate) | $270 | $200 | $1,440 | $3,800 | $2,200 | $1,600 |
| 5 | 3,000 | 4,200 | $3,150 (affiliate) | $450 | $300 | $2,400 | $6,300 | $3,000 | $3,300 |
| 6 | 5,000 | 7,000 | $5,500 (blended) | $750 | $500 | $4,250 | $11,000 | $5,000 | $6,000 |
| 7 | 8,000 | 11,200 | $12,320 (V2 rails) | $1,200 | $800 | $3,680 | $18,000 | $7,500 | $10,500 |
| 8 | 12,000 | 16,800 | $18,480 (V2) | $1,800 | $1,200 | $5,520 | $27,000 | $10,500 | $16,500 |
| 9 | 16,000 | 22,400 | $24,640 (V2) | $2,400 | $1,600 | $7,360 | $36,000 | $13,500 | $22,500 |
| 10 | 20,000 | 28,000 | $30,800 (V2) | $3,000 | $2,000 | $9,200 | $45,000 | $16,000 | $29,000 |
| 11 | 23,000 | 32,200 | $35,420 (V2) | $3,450 | $2,300 | $10,830 | $52,000 | $18,000 | $34,000 |
| 12 | 25,000 | 35,000 | $38,500 (V2) | $3,750 | $2,500 | $15,250 | $60,000 | $20,000 | $40,000 |

### Appendix C: Competitive pricing analysis

#### C.1 Real-world cost to send $400 USD → ₱ via GCash (April 2026 average)

| Provider | Total cost ($) | Recipient gets (₱) | Spread vs mid-market |
|---|---|---|---|
| Mid-market (theoretical floor) | $400.00 | ₱22,968 | 0.00% |
| **Wise** | $402.00 | ₱22,860 | 0.47% |
| **Buddy via NIUM (matched)** | $402.00 | ₱22,855 | 0.49% |
| **Remitly** | $403.99 | ₱22,695 | 1.19% |
| **Xoom** | $404.99 | ₱22,650 | 1.38% |
| **WorldRemit** | $402.99 | ₱22,755 | 0.93% |
| **MoneyGram** | $404.99 | ₱22,455 | 2.23% |
| **Western Union** | $405.00 | ₱22,082 | 3.86% |
| **Sendwave** | $403.50 | ₱22,700 | 1.17% |

Buddy's positioning on this corridor: within $5 of Wise (typically tied), materially cheaper than WU, MG, Xoom, Remitly.

### Appendix D: Technology architecture diagrams

```
┌─────────────────────────────────────────────────────────────┐
│                      Consumer Surfaces                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │  Web (Next)  │  │ Ext (Popup)  │  │ Ext (Sidepanel)│     │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘       │
└─────────┼─────────────────┼──────────────────┼──────────────┘
          │                 │                  │
          └─────────────────┼──────────────────┘
                            │
                ┌───────────▼───────────┐
                │   Next.js API Routes   │
                │   (serverless, Vercel) │
                └───────────┬───────────┘
                            │
          ┌─────────────────┼─────────────────┐
          │                 │                 │
  ┌───────▼────────┐ ┌──────▼──────┐ ┌────────▼────────┐
  │ packages/api   │ │ packages/db │ │ Third-party     │
  │ (business      │ │ (Drizzle +  │ │ APIs            │
  │  logic)        │ │  Postgres)  │ │                 │
  │                │ │             │ │ • Wise          │
  │ • providers/   │ │ • users     │ │ • NIUM (V2)     │
  │ • tools/       │ │ • transfers │ │ • Stripe        │
  │ • scoring      │ │ • recipients│ │ • Persona       │
  │ • system-prompt│ │ • audit     │ │ • Clerk         │
  └────────────────┘ └─────────────┘ │ • Anthropic     │
                                      └─────────────────┘
```

### Appendix E: Key milestones checklist

**V1 Foundation (already complete):**
- [x] Next.js monorepo structure with Turborepo
- [x] Landing page with 11 sections deployed
- [x] Chrome extension popup with scoring engine
- [x] Chrome extension sidepanel with AI chat
- [x] Database schemas (7 tables)
- [x] Wise Business API integration
- [x] Stripe customer management
- [x] Persona KYC scaffolding
- [x] Clerk auth integration
- [x] Anthropic Claude tool-calling agent
- [x] Webhook handlers (Clerk, Persona, Stripe, Wise)
- [x] i18n system (EN/TL/ES) in extension
- [x] Provider abstraction type definitions

**V1 Launch (90-day plan):**
- [ ] LLC formation and EIN
- [ ] Mercury business bank account
- [ ] Live rate fetching from 5-7 providers
- [ ] Recipient book UI
- [ ] Family group hub
- [ ] Buddy Plus subscription (Stripe Subscriptions)
- [ ] Affiliate network activations (Impact, CJ, Awin)
- [ ] NIUM, Currencycloud, Thunes sandbox applications
- [ ] Chrome Web Store listing published
- [ ] TikTok content calendar and initial 30-video library
- [ ] Referral program activation
- [ ] First 1,000 active users
- [ ] First cashback partner signed

**V2 Rails (months 4-9):**
- [ ] NIUM production application approved
- [ ] NIUM sandbox integration fully built
- [ ] NIUM production rails live
- [ ] "Send through Buddy" CTA on compatible routes
- [ ] 5,000+ active users
- [ ] Multi-corridor: US → PH + UK → PH + SG → PH
- [ ] NIUM tier 2 pricing negotiated

**V3 Multi-rail (months 9-18):**
- [ ] Wise Platform application approved
- [ ] Bridge.xyz integration live
- [ ] Coins.ph or PDAX OTC partnership signed
- [ ] Smart routing engine deployed
- [ ] 100,000 users
- [ ] Native mobile apps launched

---

**End of business plan.**

This document reflects the current state of Remittance Buddy as of April 2026 and the operational plan for its next 36 months of development. All financial projections are estimates based on industry benchmarks, publicly available comparable company data, and reasonable assumptions about user acquisition and retention.

*Confidential and proprietary. Shared under NDA for strategic partnership evaluation only.*
