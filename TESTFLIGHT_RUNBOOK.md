# TestFlight → App Store Runbook

Exact commands + Xcode UI steps to get `com.myremittancepal.app` from the current repo state to a live TestFlight build, then to App Store review.

**You drive, I scripted. Run these in order.**

---

## Phase A — install new plugin dependencies

```bash
cd /Users/gimchiflow/Business/my-remittance-pal

# Install JS-side packages added to apps/web and apps/mobile package.json
pnpm install

# Sync Capacitor config + plugins into native iOS project
cd apps/mobile
npx cap sync ios

# Install new CocoaPods (push-notifications, share, network, biometric, etc.)
cd ios/App
pod install
cd -
```

**Verify:** `pod install` output should show new pods added:
- `CapacitorPushNotifications`
- `CapacitorShare`
- `CapacitorNetwork`
- `CapgoCapacitorNativeBiometric`

If `pod install` fails with "compatible version not found," the plugin version
in `package.json` is wrong — tell me, I'll pin to an exact version that resolves.

---

## Phase B — Xcode UI setup (one-time, ~15 min)

Open the project:

```bash
cd /Users/gimchiflow/Business/my-remittance-pal/apps/mobile
npx cap open ios
```

In Xcode:

### B.1 — Signing & Capabilities

1. Select the **App** target in the left sidebar
2. Go to **Signing & Capabilities** tab
3. **Team:** select your Apple Developer Organization team
4. **Bundle Identifier:** confirm `com.myremittancepal.app`
5. Click **+ Capability** → add these three:
   - **Push Notifications**
   - **Background Modes** → tick ✅ *Remote notifications*
   - **Sign In with Apple** (add only if you plan to offer Apple login)

Adding **Push Notifications** capability will automatically create/link the
entitlements file — but I already created `App.entitlements` with the right
`aps-environment=development` key. Xcode may prompt to replace it; choose
"Keep Existing" or confirm the path is `App/App.entitlements`.

### B.2 — Add `PrivacyInfo.xcprivacy` to target membership

1. In Project Navigator, find `App/PrivacyInfo.xcprivacy` (right-click → Add Files
   to "App"... if it doesn't appear)
2. Select the file → in the right sidebar (File Inspector) → under "Target
   Membership," tick ✅ **App**
3. Under "Localization," leave as-is

### B.3 — Add icon + verify launch screen

1. In `Assets.xcassets` → `AppIcon`, verify the new `AppIcon-512@2x.png` shows
   as the 1024 slot. If Xcode complains about format, delete and re-drag the PNG.
2. Open `Base.lproj/LaunchScreen.storyboard` — preview should show solid warm
   ink color (`#14110D`). If still white, use **Editor → Refresh All Views**.

### B.4 — Version + build number

1. In the **General** tab:
   - **Version:** `1.0.0` (marketing version, shown in store)
   - **Build:** `1` (increment every TestFlight upload)

---

## Phase C — first archive + TestFlight upload

1. **Destination:** top toolbar → select **Any iOS Device (arm64)**
2. **Menu:** Product → Archive
3. Wait ~3–5 min for archive to finish
4. **Organizer opens automatically** → select your archive
5. Click **Distribute App** → **App Store Connect** → **Upload**
6. Follow prompts: include symbols ✅, manage version automatically ✅
7. Wait for upload (5–15 min depending on bandwidth)

If upload fails with "Invalid Bundle":
- Most common cause: app icon has alpha or wrong size → re-check `AppIcon-512@2x.png`
  is 1024×1024 RGB (no alpha). The one I generated is correct.
- Second cause: privacy manifest missing data type declaration → check file is in
  target membership (Phase B.2).

---

## Phase D — App Store Connect metadata

Log into [appstoreconnect.apple.com](https://appstoreconnect.apple.com):

### D.1 — Create app record (first time only)

1. **My Apps** → **+** → **New App**
2. Platform: iOS
3. Name: **My Remittance Pal**
4. Primary Language: English (U.S.)
5. Bundle ID: select `com.myremittancepal.app` (appears after Phase C upload succeeds)
6. SKU: `myremittancepal-ios-001`
7. User Access: Full Access

### D.2 — TestFlight: wait for build to process

Builds take 5–30 min to process after upload. Refresh TestFlight tab.

When build appears:
- Click it → fill **Export Compliance** → "No" for non-exempt encryption (we
  set `ITSAppUsesNonExemptEncryption=false` in Info.plist so this is pre-answered)
- Click **Internal Testing** → create group **"Internal"** → add yourself by Apple ID
- Install via **TestFlight app on iPhone** → verify app launches, can reach
  WebView, push permission prompt works

### D.3 — Fill App Privacy (nutrition label)

**App Information → App Privacy → Get Started / Edit:**

Declare data collection to match `PrivacyInfo.xcprivacy`:

| Data Type | Linked to User | Used for Tracking | Purpose |
|-----------|---------------|-------------------|---------|
| Email Address | Yes | No | App Functionality |
| Name | Yes | No | App Functionality |
| Device ID | Yes | No | App Functionality, Analytics |
| Crash Data | No | No | App Functionality |

> **Pivot note:** earlier drafts of this table listed Payment Info + Other
> Financial Info. V1 is referrals-only — we don't collect payment info.
> Providers do. Match this table to the same trim in `PrivacyInfo.xcprivacy`.

### D.4 — App Review Information (CRITICAL — pre-empts Guideline 4.2 reject)

**App Information → App Review Information:**

- **Sign-in required:** Yes (only for Family Hub + saving rate alerts)
- **Demo account:**
  - Email: (create a test account in your app)
  - Password: (dummy password)
- **Notes:** paste this template, fill in bracketed fields:

```text
My Remittance Pal is a RATE-COMPARISON and RATE-ALERT app for international
money transfers. We are NOT a money transmitter. We handle NO customer funds.

BUSINESS MODEL:
We help overseas workers find the best remittance rate across licensed
providers (Wise, Remitly, [other partners you're signed up with]).
Users compare rates inside our app, then tap through to the chosen
provider's own app/website, where they complete the transfer under that
provider's own license and T&Cs. We earn an affiliate commission paid
by the provider. Rankings are by landed amount to the recipient —
never by commission.

WHY THIS IS A NATIVE APP (Guideline 4.2 pre-emption):
- Push notifications for rate alerts (users set a target rate; we push
  when a corridor hits it + provide a one-tap affiliate link — this
  functionality is only meaningful natively)
- Haptics on comparison result tap + alert fire
- Native share sheet for "found a great rate" receipts
- Offline fallback UI when connectivity drops
- Biometric unlock (opt-in) for the saved-recipients Family Hub
- Native splash + launch tuned to our editorial brand

TESTING (USD → PHP corridor works end-to-end):
- Test account: [email above] / [password]
- After login, reviewer can:
  - /compare: enter amount + corridor → ranked provider table
  - /alerts: create a rate alert for a corridor
  - /family: add a saved recipient
- Tapping "Go to [Provider]" opens Safari with the provider's own site.
  WE DO NOT process or touch the transfer inside our app.

AFFILIATE DISCLOSURE (FTC + Apple policy compliance):
- In-app disclosure page: Settings → About → How We Make Money
- Inline disclosure on every comparison result
- Rankings are by landed amount; we never weight by commission.

CONTACT:
- Support: [your support email]
- Privacy: [policy URL]
- Terms: [terms URL]
```

### D.5 — Version metadata

**iOS App → 1.0.0 Prepare for Submission:**

- **Screenshots** (required):
  - 6.7" iPhone (iPhone 15 Pro Max / 16 Pro Max) — 1290×2796 px — min 3, max 10
  - 6.5" iPhone — can reuse 6.7" if Apple allows (check current requirements)
- **Description** (up to 4000 chars) — write as plain editorial, not marketing
- **Keywords** — 100 chars comma-separated, e.g.:
  `remittance,peso,PHP,pinoy,balikbayan,send money,FX,wise,transfer,exchange`
- **Support URL:** (your domain)
- **Marketing URL:** optional
- **Promotional text** — 170 chars, editable later without re-review

**Build:** scroll to "Build" section → **+ Select a Build** → pick uploaded build

---

## Phase E — external TestFlight (recommended before App Store)

1. **TestFlight → External Groups → +** → **"External Beta"**
2. Add 2–5 people (friends or yourself on second Apple ID)
3. Submit for **Beta App Review** (required for external testing; 1–2 day review)
4. Once approved, invitees get an email with TestFlight link
5. Collect feedback for 3–5 days minimum

---

## Phase F — submit for App Store review

When external TestFlight looks clean:

1. Back in **iOS App → 1.0.0** → top right **Submit for Review**
2. Answer the review questionnaire:
   - Export compliance: No non-exempt encryption
   - Content rights: Yes, I own or have license
   - Advertising identifier: No
3. Click **Submit**

**Average review time:** 5–7 days for first submission. For our category
(referrals-only rate comparison), the common follow-up from reviewers is:

- Guideline 4.2 questions — "what does the native app do that a website
  wouldn't?" → point them at the review notes + native-functionality bullet list
- Guideline 2.3.1 questions — "describe your business model" → point them at
  the affiliate disclosure page in-app

If asked for "financial licensing," reply: "My Remittance Pal is a rate-
comparison and rate-alert app. We do not process transfers, hold customer
funds, or operate as a money transmitter. All transfers are executed on
third-party licensed providers' own infrastructure (Wise, Remitly, etc.)
under their own licenses."

---

## Phase G — common rejection patterns + mitigations

| Reject reason | Your mitigation |
|---------------|-----------------|
| **Guideline 4.2** "Minimum Functionality" (WebView wrapper / affiliate-link aggregator) | §D.4 review notes enumerate native functionality; push + haptics + share + offline + biometric all wired |
| **Guideline 2.3.1** hidden/misleading business model | "How we make money" disclosure page + inline disclosure on every result |
| **Guideline 3.1.5(a)** unclear payment flow | Review notes explicitly state "we don't process payments"; all transfers complete on provider's site, outside our app |
| **Guideline 5.1.1** data collection not disclosed | App Privacy matches `PrivacyInfo.xcprivacy` exactly (remove Payment/Financial Info entries — referrals-only) |
| **Guideline 5.1.1(v)** no account deletion in-app | Settings → Delete Account must be reachable in ≤2 taps (CURRENTLY MISSING — see HANDOFF) |
| **Guideline 2.1** crashes or broken flows | Test every path on physical device via TestFlight first |
| **Guideline 1.4.1** unverified financial claims | Show rates as "indicative / last updated at X"; never "guaranteed"; source label per provider |

---

## Remaining TODOs (before Phase F)

- [ ] **Account deletion flow in-app** — Guideline 5.1.1(v) hard requirement.
  Must be reachable from Settings in ≤2 taps. Not yet implemented.
- [ ] **"How we make money" disclosure page** — Settings → About → Affiliate
  Disclosure. Required by FTC + helpful for Apple 4.2 / 2.3.1 pre-emption.
- [ ] **Inline affiliate disclosure** on each comparison result next to the
  "Go to [Provider]" button.
- [ ] **Privacy Policy URL + Support URL** — public, on your domain,
  reachable before submission.
- [ ] **Wire haptics at "Go to [Provider]" tap** — helper `notificationHaptic()`
  exists at `apps/web/src/lib/native/index.ts`. Call from the result tap handler.
- [ ] **Wire native share** on rate-alert-hit screen + comparison result —
  helper `shareReceipt()` exists at the same path.
- [ ] **Trim `PrivacyInfo.xcprivacy`** to remove `NSPrivacyCollectedDataTypePaymentInfo`
  and `NSPrivacyCollectedDataTypeOtherFinancialInfo` entries (money-mover
  leftovers).
- [ ] **Screenshots** — 3–10 per required device size, captured from
  TestFlight build on real device, not simulator mock-ups.
- [ ] **Replace placeholder app icon** — the 1024×1024 I generated is
  upscaled from `icon-512.png`. Get a designed master from Figma before
  Phase F; Apple does notice icon quality on review.

**Removed from earlier TODO (no longer needed in v1):** MSB licensing /
partner-license PDF, FinCEN registration evidence, state money transmitter
licensing. Referrals-only collapses all of these.
