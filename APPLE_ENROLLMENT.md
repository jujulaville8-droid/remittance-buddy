# Apple Developer Program Enrollment — Organization Tier

Enrollment walkthrough for getting `com.myremittancepal.app` onto the App Store.
**Must be Organization tier, not Individual** — remittance apps are treated
as regulated financial services and Individual accounts routinely get rejected
on business-model grounds.

---

## Why Organization (not Individual)

Apple's App Review treats money-transfer apps as financial services under
Guidelines 1.4 and 5.0. Two practical consequences:

1. **The "Seller" on your App Store listing** must plausibly match the entity
   handling the money. Individual listings for a remittance product look like
   an unlicensed person moving money → rejected.
2. **Partner-MSB / FinCEN licensing is the common path.** Reviewers will ask
   for partnership letters or FinCEN MSB ID during App Review, and those
   documents name a business entity. Individual enrollment has no entity to tie
   that documentation to.

Short version: Individual saves the DUNS step but guarantees a rejection loop.
Don't skip to save a week — it costs 2+ weeks on the back end.

---

## Prerequisites — have ALL of these before starting enrollment

| Item | Why | Notes |
|------|-----|-------|
| Registered legal entity | DUNS requires a legal name, not a DBA | LLC, C-Corp, Sole Prop all work |
| Legal entity name that matches bank + state filing **exactly** | D&B matches on "DEF Corp" vs "D.E.F. Corp" | Mismatch = 2–4 week resolution loop |
| Business phone number | Apple calls to verify | Google Voice / VOIP works if it rings to a human |
| Business address | D&B + Apple require it | Home address works for LLC if it matches state filing |
| Business website | Apple verifies domain ownership | Can be a one-page landing site |
| Business email on that domain | `you@myremittancepal.com` — not Gmail | Required for enrollment + App Review correspondence |
| Apple ID with 2FA enabled | Non-negotiable since 2019 | Use the same Apple ID that owns the bundle ID |
| Credit card for $99/yr | Billed on enrollment day | After DUNS clears, not before |
| Authority to bind the entity | Apple verifies owner/officer status | You'll sign a legal agreement |

---

## Step-by-step enrollment flow

### Step 1 — Get or look up your DUNS number (1–5 business days typical)

1. Go to [developer.apple.com/enroll](https://developer.apple.com/enroll) → Start Enrollment
2. Pick **Organization**
3. Apple asks if you already have a DUNS number
   - **Yes:** enter it; Apple verifies against D&B records
   - **No:** Apple routes you to a **free** DUNS lookup/request page (partnership
     with D&B — do not pay D&B's upsold "DUNS File" service)
4. Fill in your legal entity details exactly as they appear on state filing
5. Submit — email arrives in 1–5 business days with your DUNS number

**Common snag:** D&B doesn't have your entity yet (typical for LLCs < 6 months
old) or has a name variant ("ABC Limited Liability Company" vs "ABC LLC"). If
this happens, D&B emails you to correct records — this loop can take 2–4 weeks.

> **Start this step first**, independent of everything else. It's the longest
> pole in the tent.

### Step 2 — Fill out the Apple enrollment form (~30 min, after DUNS)

- Legal entity name (must match DUNS record)
- Headquarters address (must match DUNS)
- Website, phone, work email
- **Role:** Owner / Founder / CEO — you must be an authorized signatory
- Upload proof of authority if asked (articles of incorporation, operating agreement)

### Step 3 — Apple verification call (1–3 business days)

- Apple calls the business phone number you listed
- Short interview: who you are, what the app does, confirm your authority
- They may ask what "My Remittance Pal" does and whether you're a licensed MSB
- **Have your MSB partner letter or FinCEN registration ready to reference**

### Step 4 — Sign agreement + pay (same day as verification)

- Apple sends the Developer Program License Agreement via DocuSign-style flow
- You sign → they charge the card → enrollment email with ASC access arrives

### Step 5 — Post-enrollment setup (~30 min, once you're in)

- Log into [appstoreconnect.apple.com](https://appstoreconnect.apple.com)
- Create app record for `com.myremittancepal.app`
- Generate **APNs Authentication Key** (Keys → + → Apple Push Notifications
  service) — one key works forever, $0
- Invite yourself as Admin + create TestFlight Internal group
- (Optional) Connect ASC to Xcode Cloud for CI

---

## Realistic timeline

| Phase | Time | Can parallelize with |
|-------|------|---------------------|
| Entity registration (if you don't have one) | 1–14 days | Nothing — first domino |
| DUNS request via Apple | 1–5 days typical, 2–4 weeks worst | "Parallel prep" below |
| Apple enrollment form → verification call | 1–3 days | "Parallel prep" below |
| License agreement + payment | 1 day | — |
| **Total best case** | **3 business days** | |
| **Total realistic** | **1–2 weeks** | |
| **Total if DUNS has issues** | **4–6 weeks** | |

---

## Parallel prep — things to do while Apple's side is processing

### While DUNS processes (1–5 days → 4 weeks)

- [ ] Spin up `myremittancepal.com` if not live yet
- [ ] Publish a Privacy Policy URL (public on the domain)
- [ ] Publish a Support URL (public on the domain)
- [ ] Nail down MSB licensing:
  - **Partnership path (recommended for solo founder):** written partnership
    letter from a licensed MSB (Wise, Remitly, Western Union, Modulr, etc.)
    naming your entity as agent/sub-agent
  - **Direct path:** your own FinCEN MSB registration (free filing, 1–2 weeks)
    + state money transmitter licenses ($1M+ bonds, 6–18 months, 49 states —
    not feasible for most solo founders)
- [ ] Get the designed 1024×1024 app icon made (replace the placeholder in
  `apps/mobile/ios/App/App/Assets.xcassets/AppIcon.appiconset/`)

### While Apple verifies (1–3 days)

- [ ] Write App Review notes template (template in `TESTFLIGHT_RUNBOOK.md` §D.4)
- [ ] Implement in-app **account deletion flow** (Apple Guideline 5.1.1(v) —
  still unimplemented; see `HANDOFF.md` "Hard blockers" for file paths)
- [ ] Capture 3–10 TestFlight-ready screenshots per required device size
  (6.7" iPhone mandatory) from a real device

---

## Costs

| Item | Cost |
|------|------|
| DUNS number | $0 via Apple partnership |
| Apple Developer Program | $99 / year, auto-renews |
| Entity registration (if needed) | $50–$800 depending on state |
| Business domain + email | $10–$50 / year |
| MSB partner setup (if using partnership path) | typically $0–$5k one-time + revenue share |
| FinCEN MSB registration (if DIY, not partner) | $0 filing + $5k–$20k legal/compliance |
| **Total to start (with MSB partner)** | **$99–$150/yr** |

---

## Red flags that slow things down for remittance apps

1. **"Finance" apps are auto-flagged for extra review.** Apple's compliance
   team reads these more carefully. Have MSB partner letter or FinCEN MSB ID
   ready from day one.
2. **Individual enrollment is a near-guaranteed reject** for money transfer.
   Don't try to save the DUNS step by enrolling as Individual — you'll waste 2
   weeks when the first submission gets rejected for "business model."
3. **Name mismatches** between bank, entity, DUNS, and ASC seller name cause
   Developer Support tickets that take 3–7 days each. Align these up front.
4. **State money transmitter licenses.** If you're not partnering with a
   licensed MSB, you need state-by-state licensing to operate legally in the
   US. Apple will ask about this during review. **Partnering is almost always
   the right call for a solo founder.**
5. **DBA confusion.** If your LLC is "Acme Holdings LLC" but you operate as
   "My Remittance Pal," make sure the DUNS record lists **both** (legal name
   with DBA annotation). Otherwise ASC Seller Name won't match DUNS and the
   store listing looks off.

---

## When you start enrollment — checklist

Copy this to your task manager:

```
[ ] Confirm legal entity registered with state
[ ] Confirm business phone rings to a human
[ ] Confirm myremittancepal.com (or whatever domain) is live
[ ] Confirm business email on that domain works
[ ] Apple ID has 2FA on — same Apple ID that owns bundle ID
[ ] Credit card available for $99 charge
[ ] Start at https://developer.apple.com/enroll → Organization
[ ] Submit DUNS request through Apple's form
[ ] Wait 1–5 business days for DUNS email
[ ] Fill enrollment form (entity details, role, upload authority proof)
[ ] Receive Apple verification call — answer with MSB licensing story ready
[ ] Sign agreement, pay $99
[ ] Create ASC app record for com.myremittancepal.app
[ ] Generate APNs Authentication Key (Keys → +)
[ ] Invite yourself as Admin, create TestFlight Internal group
```

Once all boxes are checked, continue from Phase B of `TESTFLIGHT_RUNBOOK.md`
(Xcode UI setup).
