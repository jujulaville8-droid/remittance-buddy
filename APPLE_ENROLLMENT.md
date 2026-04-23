# Apple Developer Program Enrollment

Enrollment walkthrough for getting `com.myremittancepal.app` onto the App Store.

**V1 is referrals-only — we are NOT a money transmitter.** This reshapes
enrollment compared to the earlier "money-mover" framing. Individual
enrollment is sufficient; Organization is optional upgrade.

---

## Individual vs. Organization — which tier?

| Tier | Cost | Timeline | When to pick |
|------|------|----------|-------------|
| **Individual** | $99/yr | 24-hour approval | Your name appears as the App Store Seller. Fine for referrals-only product. **Default choice for a solo v1 launch.** |
| **Organization** | $99/yr + DUNS (free) | 1–5 business days (often 1–2 weeks for new entities) | Your LLC/Corp appears as the App Store Seller. Pick this if: (a) you already have an incorporated entity, (b) you want brand separation from your personal name, (c) you plan to add team members with Admin/Developer roles later. |

**Why Individual works for v1 (contrary to earlier docs):**
- We're not a licensed money transmitter — no MSB partner letter / FinCEN
  registration to tie to an entity
- We don't handle customer funds — no PCI / financial-services regulatory
  surface
- We're a comparison + affiliate platform — same category as CardRatings,
  NerdWallet, or any affiliate-driven review site (many of which ship under
  Individual accounts)

**Why you might still pick Organization:**
- You already operate under an LLC for tax/liability reasons
- You want the App Store Seller name to be "My Remittance Pal LLC" not your
  legal name
- You're planning to hire and want to invite team members

**What CHANGED from earlier docs:** The earlier version of this file said
"Organization is required — Individual will get rejected." That was based on
the assumption we were a money mover. For referrals-only v1, that's wrong.

---

## Individual enrollment path (fastest — recommended for v1)

### Prerequisites

| Item | Why | Notes |
|------|-----|-------|
| Apple ID with 2FA enabled | Non-negotiable | Use the Apple ID that owns the bundle ID |
| Valid legal name (personal) | Shown as App Store Seller | Will be on the public store listing |
| Credit card for $99/yr | Charged on enrollment approval | Auto-renews annually |
| US / eligible country | Apple restricts enrollment by country | Check the [supported countries list](https://developer.apple.com/support/enrollment/) |

### Step-by-step

1. Go to [developer.apple.com/enroll](https://developer.apple.com/enroll)
2. Click **Start Your Enrollment**
3. Sign in with the Apple ID that owns `com.myremittancepal.app`
4. Select **Individual / Sole Proprietor**
5. Fill out personal info (legal name, phone, address)
6. Accept the Developer Program License Agreement
7. Pay $99 with credit card
8. **Approval typically within 24 hours.** Email from Apple confirms access.

### Post-approval setup (~30 min)

- Log into [appstoreconnect.apple.com](https://appstoreconnect.apple.com)
- **My Apps → +** → create app record:
  - Platform: iOS
  - Name: **My Remittance Pal**
  - Primary Language: English (U.S.)
  - Bundle ID: select `com.myremittancepal.app`
  - SKU: `myremittancepal-ios-001`
- **Keys → +** → create **APNs Authentication Key** for push notifications
  (one key, works forever, free)
- Back in Xcode: **Signing & Capabilities → Team** → select your personal
  team; Xcode auto-provisions certs and profiles

---

## Organization enrollment path (if you choose it)

### Extra prerequisites

| Item | Why | Notes |
|------|-----|-------|
| Registered legal entity | Apple requires a legal business | LLC, C-Corp, Sole Prop-with-EIN all work |
| **DUNS number** | Apple verifies entity existence via Dun & Bradstreet | **Free via Apple's partnership** — do NOT pay D&B's upsold services |
| Business phone | Apple calls to verify | Google Voice / VOIP fine if it rings to a human |
| Business address | Must match DUNS record | Home address works if it matches state filing |
| Authority to bind the entity | You sign a legal agreement | Must be Owner / Founder / CEO |

### Extra steps

Before the normal flow:
1. Request DUNS via Apple's enrollment form (free path, uses D&B partnership)
2. Wait 1–5 business days for DUNS email (occasionally 2–4 weeks if D&B's
   records don't match your state filing exactly)
3. Then the normal enrollment form, plus an Apple verification phone call
4. Agreement + payment

### Common Organization snags

1. **Name mismatches.** "Acme LLC" vs "Acme Limited Liability Company" — D&B
   is strict. Match your state filing exactly.
2. **New entities (<6 months old).** D&B may not have you in their database
   yet; enrollment resolves this but adds 2–4 weeks.
3. **DBA confusion.** If you operate as "My Remittance Pal" under "Acme LLC,"
   make sure DUNS record lists both.

---

## Realistic timeline

| Path | Best case | Typical | Worst case |
|------|-----------|---------|------------|
| Individual | 1 day | 1 day | 3 days (if Apple manually reviews) |
| Organization (existing DUNS) | 3 days | 1 week | 2 weeks |
| Organization (new DUNS) | 1 week | 2 weeks | 4–6 weeks |

**Recommendation for v1 launch:** Individual. Get the app shipped. Upgrade
to Organization later if/when you want an entity-branded listing. Apple does
allow tier upgrades post-enrollment (it's not a fresh process).

---

## Costs

| Item | Cost |
|------|------|
| Apple Developer Program (Individual OR Organization) | $99 / year |
| DUNS number (Organization path) | $0 via Apple partnership |
| Entity registration (Organization path, if you don't have one) | $50–$800 state fees |
| Business domain + email (required anyway for App Store) | $10–$50 / year |
| **Total for Individual path** | **$99 / year + domain costs** |
| **Total for Organization path** | **$99 / year + entity + domain** |

No MSB registration, no state money transmitter licenses, no partner-MSB
setup — none of those apply to a referrals-only product.

---

## When you start enrollment — checklist

### For Individual tier

```
[ ] Apple ID has 2FA on — same Apple ID that owns bundle ID
[ ] Legal name + personal address ready
[ ] Credit card available for $99 charge
[ ] Start at https://developer.apple.com/enroll → Individual
[ ] Sign agreement, pay $99
[ ] Wait ~24h for approval email
[ ] Create App Store Connect app record for com.myremittancepal.app
[ ] Generate APNs Authentication Key (Keys → +)
[ ] Set Team in Xcode (Signing & Capabilities)
```

### For Organization tier

```
[ ] Confirm legal entity registered with state
[ ] Confirm business phone rings to a human
[ ] Confirm myremittancepal.com (or chosen domain) is live
[ ] Confirm business email on that domain works
[ ] Apple ID has 2FA on
[ ] Credit card available
[ ] Start at https://developer.apple.com/enroll → Organization
[ ] Submit DUNS request through Apple's form
[ ] Wait 1–5 business days for DUNS email
[ ] Fill enrollment form (entity details, role, upload authority proof)
[ ] Receive Apple verification call
[ ] Sign agreement, pay $99
[ ] Create ASC app record for com.myremittancepal.app
[ ] Generate APNs Authentication Key
[ ] Set Team in Xcode
```

Once enrolled, resume from Phase B of `TESTFLIGHT_RUNBOOK.md` (Xcode UI setup).

---

## What you can do in parallel (regardless of tier)

- [ ] Spin up `myremittancepal.com` if not live yet
- [ ] Publish a Privacy Policy URL (public on the domain)
- [ ] Publish a Support URL (public on the domain)
- [ ] Sign up for the affiliate programs you want to feature:
  - Wise Platform Affiliates
  - Remitly referral program
  - Western Union affiliate (if they accept you)
  - (Others — check the About/Legal page for who we're using)
- [ ] Get a designed 1024×1024 app icon (replace the placeholder I generated)
- [ ] Draft app description copy leading with "compare remittance rates,"
  NOT "send money"

None of the above needs MSB licensing, FinCEN registration, or partner
letters. Referrals-only dramatically shrinks the compliance surface.
