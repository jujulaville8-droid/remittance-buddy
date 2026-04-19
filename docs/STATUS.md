# Remittance Buddy — Project Status

> **Last updated:** 2026-04-18 (local-dev + PWA shipped; Vercel function hours maxed)
>
> Legend: ✅ done · 🟡 partial / untested · ❌ stubbed (UI only) · 🔴 broken · ⏸ paused

---

## 30-second mental model

**The tool itself is surprisingly real.** 1149 lines of solid React at `/compare`, live scraping of 6 remittance providers, Redis caching, warm cron pre-fetching. You can actually use it.

**Everything around the tool is thinner than it looks.** Dashboard renders but reads localStorage. Recipients never hit the DB. Rate alerts save but never email. Family groups have no backend. Buddy Plus subscription works but unlocks nothing. Send flow is plumbed but end-to-end untested.

**The landing page → tool handoff is sound.** The new editorial landing, PWA install, Capacitor scaffolding, auth (Supabase + CSP fix), sign-up auto-confirm — all just shipped. Can be previewed locally.

---

## System map

```
          ┌─────────────┐           ┌─────────────┐          ┌─────────────┐
          │   LANDING   │   ✅      │   SIGN-UP   │   ✅     │  /COMPARE   │   ✅
          │  (editorial │   →→→→→   │  (Supabase, │   →→→→→  │  (12-prov.  │
          │   receipt)  │           │  auto-conf) │          │  live quote)│
          └─────────────┘           └─────────────┘          └──────┬──────┘
                                                                    │ pick winner
                                                                    ▼
          ┌─────────────┐   🟡     ┌─────────────┐   ✅      ┌─────────────┐
          │  /DASHBOARD │   ←←←    │   /SEND     │   ←←←←←   │   /KYC      │   ✅
          │  (stats UI, │          │  /recipient │          │  (Persona,  │
          │  localStg.) │          │  /confirm   │          │   gated)    │
          └─────────────┘          └──────┬──────┘          └─────────────┘
                                          │ pay
                                          ▼
                               ┌─────────────────┐   🟡
                               │    TRANSFER     │   (Wise + Stripe
                               │  (plumbed but   │    wired, end-to-end
                               │   untested E2E) │    never actually tested)
                               └─────────────────┘
```

---

## Feature-by-feature status

### Core flow

| Feature | Status | Code | Reality |
|---|---|---|---|
| Landing page | ✅ | `components/landing/LandingReceipt.tsx` | New editorial design, live |
| Sign-up / Sign-in | ✅ | `app/sign-{up,in}/` | Supabase, auto-confirm on, working |
| Sign-out | ✅ | — | Supabase default |
| `/compare` tool UI | ✅ | `app/compare/CompareTool.tsx` (1149 lines) | Full UX: corridors, amounts, payout methods, sorts, humanized copy |
| Quote aggregation | ✅ | `api/quotes/`, `@remit/api` | Real Wise + Remitly + Xoom + WU + MoneyGram + WorldRemit |
| Rate cache | ✅ | Upstash Redis, 60s TTL | Pre-warmed every 60s via cron |
| Quote UI debouncing | ✅ | `useLiveQuotes` hook | 400ms, clean state mgmt |
| Affiliate routing | ✅ | `lib/affiliate-routing.ts` | Decides "Buddy executes" vs "handoff to competitor" |
| URL-shareable state | ✅ | `CompareTool` via searchParams | Corridor/amount/payout in URL |

### Auth & security

| Feature | Status | Reality |
|---|---|---|
| Supabase auth | ✅ | Working, CSP fixed, auto-confirm on |
| Email confirmation | ⏸ OFF | Disabled for MVP (no SMTP wired) |
| KYC via Persona | ✅ | Iframe + webhook working; transfers gated |
| CSP | ✅ | Allows Supabase, Google Fonts, Stripe, Wise, Persona |
| Rate limiting | ✅ | Upstash-based, on `/api/transfers` |

### Data layer

| Feature | Status | Reality |
|---|---|---|
| Neon Postgres | ⏸ PAUSED | Schema defined (Drizzle), instance paused for cost |
| Recipients | 🟡 localStorage only | `packages/db` has schema; `POST /api/recipients` stubbed |
| Transfers history | 🟡 localStorage only | Same — DB schema exists, code writes to localStorage |
| Rate alerts | ❌ localStorage only | Never emails — no mailer wired |
| Family groups | ❌ UI only | No API, no DB table used |
| Affiliate click log | ❌ localStorage only | Never syncs to DB |
| Audit log | ❌ | Schema exists, no implementation |

### Payments & transfers

| Feature | Status | Reality |
|---|---|---|
| Stripe checkout (Buddy Plus) | ✅ | Subscription creation works |
| Stripe payment intent (transfer funding) | ✅ | Creation works; not E2E tested with real cards |
| Buddy Plus features | ❌ | UI renders perks; none are gated or delivered |
| Wise API integration | 🟡 | Quote → recipient → transfer plumbed; never run end-to-end |
| Wise webhooks | 🟡 | Handler exists; never received a real event |
| Transfer status UI | 🟡 | `/send/status/:id` exists; untested |

### Notifications

| Feature | Status | Reality |
|---|---|---|
| Email service | ❌ | No Resend/SendGrid/SES configured. .env has no MAIL_* keys |
| Rate alert emails | ❌ | Cron checks, never sends |
| Transfer status emails | ❌ | Same — hook exists, no sender |
| Push notifications | ❌ | Not set up (Firebase/OneSignal not integrated) |

### Mobile & extension

| Surface | Status | Reality |
|---|---|---|
| PWA manifest + SW | ✅ | Just shipped; installable via Safari → Add to Home Screen |
| PWA start_url → /compare | ✅ | App-mode users skip the landing |
| Capacitor iOS project | ✅ scaffolded | Build blocked on Xcode download |
| Capacitor Android project | ✅ scaffolded | Build blocked on Android Studio download |
| Chrome extension (popup/sidepanel) | 🟡 | Built; manifest points at staging URL; not on Chrome Store |
| Extension ↔ app messaging | 🟡 | Wired but localStorage-only for affiliate handoff |

### Other surfaces

| Feature | Status | Reality |
|---|---|---|
| AI onboarding chat (`/onboard`) | 🟡 | Claude via Vercel AI Gateway; uses static provider data, not live quotes |
| `/pricing` page | ✅ | Working, Stripe-linked |
| Dashboard stats | 🟡 | Reads localStorage, displays zeros for new users |
| Dashboard recent transfers | 🟡 | localStorage-driven; empty for new users |

---

## Infrastructure state

| Service | Status | Cost tier | Notes |
|---|---|---|---|
| Vercel | ⚠️ THROTTLED | Hobby | Function-hours maxed → no deploys until reset or upgrade |
| Supabase | ✅ LIVE | Free | Auth working |
| Neon Postgres | ⏸ PAUSED | Free | Paused by cost-save — needs unpausing |
| Upstash Redis | ✅ LIVE | Free | Quote cache |
| Stripe | ✅ LIVE | Pay-as-you-go | Test-mode working |
| Wise | ✅ LIVE | Sandbox | Real API, sandbox creds |
| Persona | ✅ LIVE | Pay-as-you-go | KYC working |
| Sentry | ✅ LIVE | Free | Error tracking |
| Vercel AI Gateway | ✅ LIVE | Free tier | Claude calls work |
| Resend / SendGrid / SES | ❌ NONE | — | No mailer at all |
| Firebase / APNs | ❌ NONE | — | No push setup |

---

## What actually happens when a brand-new user signs up right now

1. Lands on `/compare` (if PWA) or `/` landing ✅
2. Clicks sign-up → Supabase → redirected to `/dashboard` ✅
3. Dashboard shows zeros (no DB data, localStorage empty) ✅
4. Taps "Compare rates" → `/compare` ✅
5. Picks US→PH, $500, GCash → sees real live quotes from 6 providers ✅
6. Taps "Buddy's pick" (Remitly) → redirected to affiliate URL ✅ / `/send/recipient` 🟡
7. Enters recipient details → saved to **localStorage only** 🟡
8. Clicks "Continue" → hits KYC wall ✅
9. Completes KYC via Persona → status flips to approved ✅
10. Returns to confirm transfer → Stripe payment intent created ✅
11. Pays with card → **never been E2E tested with real/test cards** 🟡
12. Wise API creates transfer → **never actually run end-to-end** 🟡
13. User sees `/send/status/:id` → **webhook updates never tested** 🟡
14. User sets a rate alert → saved to localStorage 🟡
15. Rate alert never emails → **no mailer configured** ❌

**Real blockers right now:** recipient DB wiring (step 7), E2E transfer test (steps 11–13), mail service (step 15).

---

## Recommended order to tackle

### P0 — unblock real usage (this week)

1. **Unpause Neon** (or keep localStorage-only for MVP; decide explicitly)
2. **Wire Resend** — 1h of work, $0/month at low volume. Unblocks rate alerts, transfer confirmations, KYC follow-ups
3. **E2E test one real transfer** — sandbox Wise + test Stripe card → verify status updates arrive. If it fails, now's when you find out
4. **Sync recipients to DB** — straightforward once Neon's back; migration helper at `lib/migrate-local-db.ts` exists untested

### P1 — finish the value prop (next week)

5. **Deliver Buddy Plus perks** — you're charging $1.99/mo for nothing right now. Either ship one perk (priority rate-alert delivery? 0% platform fee on sends?) or pull the subscription
6. **Fix the Chrome extension prod manifest** — one-line config pointing at `remitance-buddy.vercel.app` instead of a staging URL
7. **Redesign `/compare` in the editorial language** — this is what you originally asked for. Reusing all the existing logic and data flow

### P2 — polish (after P0/P1 prove demand)

8. Rate-alert email cron actually sends (needs P0 #2 done)
9. Push notifications (iOS + Android) for rate alerts
10. Mobile Capacitor TestFlight + Play Store submission
11. Family hub backend

---

## Dead code / cleanup

- `components/landing/{Hero,SocialProof,ProviderStrip,Features,HowItWorks,Stats,FAQ,FinalCTA}.tsx` — replaced by `LandingReceipt`, now unused. Safe to delete.
- Clerk webhook handler (`api/webhooks/clerk`) — duplicate; auth is Supabase now
- `.env.example` still documents Clerk — needs rewrite for Supabase (already drafted on a branch)
- Unused `Clock` import in dashboard marked "for future"
- Chat API uses static provider data — either delete the tool integration or wire it to `useLiveQuotes`

---

## The honest state of the product

You have a **tool** that works. You have **chrome around it** that doesn't. The gap between "looks like a real product" and "is a real product" is mostly: a database that's paused, a mailer that doesn't exist, and a transfer flow that's never been run end-to-end. Each of those is hours, not weeks.

The hardest thing left isn't engineering — it's deciding **which 3 things matter enough to finish** before you ship for real.
