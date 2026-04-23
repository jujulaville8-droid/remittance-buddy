# iOS App Store Submission Plan

Goal: get `com.myremittancepal.app` into TestFlight → App Store review → public release.

**V1 is referrals-only.** We do not handle money. We do not need MSB licensing
or partner letters. The primary App Store risk is **Guideline 4.2 (Minimum
Functionality)** — Apple aggressively rejects pure affiliate-link apps. The
plan below is built around mitigating that risk.

Owner split:
- **You drive**: Apple Developer enrollment, ASC app record, final "Submit for Review" click
- **I drive**: all code, config, and metadata file changes in this repo

---

## 0. Hard blockers (must resolve before any upload)

| # | Item | Owner | Status |
|---|------|-------|--------|
| 0.1 | Apple Developer Program enrollment (Individual OR Organization) | You | 🟥 unconfirmed |
| 0.2 | Privacy Policy URL (public, on your domain) | You | 🟥 unconfirmed |
| 0.3 | Support URL (public, on your domain) | You | 🟥 unconfirmed |
| 0.4 | "How we make money" / affiliate disclosure page inside the app | You + me | 🟥 not implemented |
| 0.5 | App Store Connect app record created (bundle ID `com.myremittancepal.app`) | You | 🟥 pending 0.1 |
| 0.6 | Account deletion flow in-app (Apple Guideline 5.1.1(v)) | Me | 🟥 not implemented |

**Enrollment tier guidance:** Individual ($99/yr, 24h approval) is sufficient
for a referrals-only product. Organization ($99/yr + DUNS, 1–5 days) is only
required if (a) you want a company name as the App Store Seller, or (b) you're
operating under an LLC for tax/liability reasons regardless of App Store. See
`APPLE_ENROLLMENT.md`.

**Affiliate disclosure isn't optional.** US FTC rules + similar EU/UK/CA
regulations require clear, conspicuous disclosure of material connection.
Apple reviewers also look favorably on transparent affiliate apps and
unfavorably on hidden-affiliate funnels.

---

## 1. Why 4.2 is the ONE risk that matters

Apple's App Review Guideline 4.2 says:

> "Your app should include features, content, and UI that elevate it beyond
> a repackaged website."

Historical reject patterns for apps in our category:
- Pure rate-aggregator with affiliate outbound links → **high reject rate**
- WebView shell over a public website → **high reject rate**
- Affiliate marketing app with no native features → **high reject rate**

Our job is to be **visibly more than a website in a WebView**. Every native
hook in `§2` is specifically about earning the native binary's place.

**Do NOT skip §2 mitigation to save time. Getting rejected for 4.2 burns
5–7 days per review cycle.**

---

## 2. Guideline 4.2 mitigation checklist

Target: at least 6 of these shipped before first submission.

| # | Item | Status |
|---|------|--------|
| 2.1 | Push notifications for rate alerts — `@capacitor/push-notifications` | 🟨 plugin added, APNs wiring done, UX not yet triggered from real alert fire |
| 2.2 | Haptics at "Go to [Provider]" tap + rate-match notification — `@capacitor/haptics` | 🟨 plugin installed, wrapper exists, not yet wired at tap points |
| 2.3 | Native share for "found a great rate" — `@capacitor/share` | 🟨 plugin installed, wrapper exists, not yet wired in UI |
| 2.4 | Offline fallback banner (WebView load failure) — implemented in `NativeShell.tsx` | 🟩 done |
| 2.5 | Biometric unlock (opt-in, for Family Hub) — `@capgo/capacitor-native-biometric` | 🟨 plugin installed, helper exists, not yet exposed as Settings toggle |
| 2.6 | Native splash tuned to web first-paint color | 🟩 done (#14110D) |
| 2.7 | SFSafariViewController for affiliate handoff (via `@capacitor/browser`) | 🟥 not added — currently uses `window.open` which opens Safari |
| 2.8 | Universal Links to open specific comparisons from external shares | 🟥 not configured |

**Gap analysis:** 2.1, 2.2, 2.3 need **code wiring** (plugins are installed,
helpers exist in `apps/web/src/lib/native/index.ts`, but the call sites in the
UI haven't been added). These are small changes — roughly one afternoon of
focused work.

**2.7 is a judgment call.** `window.open` → system Safari is functional and
Apple-acceptable, but `SFSafariViewController` keeps the user "inside" our app
visually (cookies persist, back button returns to our app, affiliate
attribution is cleaner). Worth adding for v1.1 if not v1.

---

## 3. Required Info.plist keys

| Key | Value | Status |
|-----|-------|--------|
| `ITSAppUsesNonExemptEncryption` | `false` | 🟩 done |
| `NSFaceIDUsageDescription` | (set) | 🟩 done |
| `NSCameraUsageDescription` | (set — leftover from planned KYC, harmless) | 🟩 done |
| `NSPhotoLibraryUsageDescription` | (set — same) | 🟩 done |
| `UIBackgroundModes` → `remote-notification` | (set) | 🟩 done |
| `NSUserTrackingUsageDescription` | Not needed — we don't track across apps | — |

**Privacy strings note:** `NSCameraUsageDescription` and
`NSPhotoLibraryUsageDescription` were added for a planned KYC flow that
*won't ship in v1*. They're harmless if unused (iOS only prompts when the API
is invoked). Safe to leave; clean up in v2 if/when we're sure we never need them.

---

## 4. Required privacy manifest (`PrivacyInfo.xcprivacy`)

🟩 **done** — `apps/mobile/ios/App/App/PrivacyInfo.xcprivacy` declares:

- **Data types collected:** email (alerts), name (family hub), device ID
  (push tokens), crash data
- **Tracking:** false
- **Required-reason APIs:** UserDefaults, FileTimestamp, SystemBootTime, DiskSpace

> **Simplification opportunity for v1:** the manifest currently lists
> `NSPrivacyCollectedDataTypePaymentInfo` and `NSPrivacyCollectedDataTypeOtherFinancialInfo`
> — both were for the money-mover story. In referrals-only v1 we don't
> collect payment info or financial info (providers do). **Removing these
> two entries is a surgical, correct change before submission.**

---

## 5. App Store Connect metadata

| Asset | Requirement | Status |
|-------|-------------|--------|
| App icon | 1024×1024 PNG, no alpha, no rounded corners | 🟨 placeholder, replace with designed master |
| Icon asset catalog | 1024 single-size entry | 🟩 done |
| Launch screen | `LaunchScreen.storyboard` with #14110D bg | 🟩 done |
| Screenshots | 6.7" iPhone (required), 6.5" iPhone (required) — 3–10 each | 🟥 none |
| App description | <4000 chars; lead with "compare remittance rates," NOT "send money" | 🟥 not written |
| Keywords | 100 chars comma-separated | 🟥 not written |
| Promotional text | 170 chars, editable between reviews | 🟥 not written |
| Age rating | Likely 4+ (no objectionable content) | 🟥 not set |
| Primary category | **Finance** | — |
| Secondary category | Utilities | — |
| App Privacy questionnaire | Matches PrivacyInfo.xcprivacy | 🟥 not completed |
| Demo account | App Review needs login credentials for Family Hub | 🟥 not created |
| Review notes | See §6 below — **this is critical for 4.2 pre-emption** | 🟥 not written |

---

## 6. App Review Notes — the killer template

**This is the most important metadata field for our app.** It's where we
pre-empt 4.2 rejection by explicitly telling the reviewer what native value
this app provides beyond being a website.

Template (edit bracketed fields, paste into ASC "App Review Information":

```
My Remittance Pal is a rate-comparison and rate-alert app for international
money transfers. We are NOT a money transmitter.

BUSINESS MODEL:
We help overseas workers find the best remittance rate across licensed
providers (Wise, Remitly, [other partners]). Users compare rates inside
our app, then tap through to the chosen provider's own app/website, where
they complete the transfer under that provider's own license and T&Cs.
We earn an affiliate commission paid by the provider. Rankings are by
landed amount to the recipient — never by commission.

WHY THIS IS A NATIVE APP (Guideline 4.2):
- Push notifications for rate alerts (users set a target rate, we push
  when a corridor hits it — core product value, only meaningful natively)
- Haptics on comparison-result tap
- Native share sheet for receipt-style comparisons
- Offline fallback UI when connectivity drops
- Biometric unlock for the saved-recipients Family Hub
- Native splash + launch tuned to the editorial brand

TESTING:
- Test corridor: USD → PHP
- Test account: [email] / [password]
- After login, reviewer can:
  - /compare: input amount and corridor, see ranked provider list
  - /alerts: create a rate alert
  - /family: add a saved recipient (unlocks faster re-runs)
- Tapping "Go to [Provider]" opens the provider's website in Safari — we
  DO NOT process the transfer inside our app

AFFILIATE DISCLOSURE:
- In-app "How we make money" page (Settings → About → Affiliate Disclosure)
- Inline disclosure on each comparison result
- We never rank by commission — rankings are by landed amount to recipient

CONTACT:
- [your support email]
- Privacy: [policy URL]
- Terms: [terms URL]
```

---

## 7. Build + upload sequence (executes after 0–6 green)

```bash
# 1. Sync Capacitor changes (pod install runs automatically)
cd apps/mobile
pnpm exec cap sync ios

# 2. Open Xcode
pnpm exec cap open ios

# In Xcode:
# - Set Team (Signing & Capabilities)
# - Add Push Notifications + Background Modes capabilities
# - Add PrivacyInfo.xcprivacy to target membership
# - Set Marketing Version (e.g. 1.0.0) and Build (e.g. 1)
# - Select "Any iOS Device (arm64)" destination
# - Product → Archive
# - Window → Organizer → Distribute App → App Store Connect → Upload
```

Detailed step-by-step in `TESTFLIGHT_RUNBOOK.md`.

---

## 8. Common rejection patterns for our category

| Reject reason | Your mitigation |
|---------------|-----------------|
| **Guideline 4.2** "Minimum Functionality" / "repackaged website" | §2 checklist; review notes §6 explicitly enumerate native value |
| **Guideline 5.1.1(v)** no in-app account deletion | Implement Settings → Delete Account (hard blocker 0.6) |
| **Guideline 5.1.1** data collection not disclosed | App Privacy matches PrivacyInfo.xcprivacy exactly |
| **Guideline 2.3.1** hidden/misleading features (undisclosed affiliate) | "How we make money" page + inline disclosure (blocker 0.4) |
| **Guideline 3.1.5(a)** unclear payment flow | Review notes explicitly state "we don't process payments"; all transfers complete on provider's site |
| **Guideline 1.4.1** unverified financial claims | Show rates as "indicative / last updated at X"; never "guaranteed"; source label per provider |
| **Guideline 2.1** crashes | TestFlight on physical device for every flow |

---

## Current phase

**Phase 1 — Code hardening COMPLETE on native side. Need now:**

1. **Code wiring:** haptics + native share at their UI touchpoints (§2.2, §2.3)
2. **Account deletion flow:** Settings → Delete Account (§0.6)
3. **Affiliate disclosure page:** Settings → About → How we make money (§0.4)
4. **Privacy manifest trim:** remove payment/financial-info data types (§4 note)
5. **Metadata:** screenshots, description, keywords, review notes (§5, §6)

All of this is code work. No external dependencies, no licensing, no
partnership letters. That's the upside of the referrals-only pivot.

See `HANDOFF.md` for exact file paths to create/modify.
