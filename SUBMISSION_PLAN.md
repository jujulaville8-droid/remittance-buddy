# iOS App Store Submission Plan

Goal: get `com.myremittancepal.app` into TestFlight → App Store review → public release.

Owner split:
- **You drive**: Apple Developer enrollment, ASC app record, final "Submit for Review" click
- **I drive**: all code, config, and metadata file changes in this repo

Target submission window: when the 4.2 mitigation checklist below shows all green.

---

## 0. Hard blockers (must resolve before any upload)

| # | Item | Owner | Status |
|---|------|-------|--------|
| 0.1 | Apple Developer Program enrollment — **Organization** tier, DUNS number | You | 🟥 unconfirmed |
| 0.2 | MSB licensing / partner-license evidence ready for App Review notes | You | 🟥 unconfirmed |
| 0.3 | Privacy Policy URL (public, on your domain) | You | 🟥 unconfirmed |
| 0.4 | Support URL (public, on your domain) | You | 🟥 unconfirmed |
| 0.5 | App Store Connect app record created (bundle ID `com.myremittancepal.app`) | You | 🟥 pending 0.1 |

**Why Organization, not Individual:** Apple's review team treats remittance/FX apps
as regulated financial services. Individual Dev accounts routinely get rejected for
"business model incompatible with developer type." DUNS registration is free but
takes 1–5 business days.

---

## 1. Guideline 4.2 mitigation (avoid "Minimum Functionality" reject)

Pure WebView wrappers get rejected. Each item below is a native touchpoint that
justifies the native binary. Need at least 5 shipped.

| # | Item | Status |
|---|------|--------|
| 1.1 | Push notifications (rate alerts + transfer status) — `@capacitor/push-notifications` | 🟥 not added |
| 1.2 | Biometric unlock gate before WebView loads — `@capgo/capacitor-native-biometric` | 🟥 not added |
| 1.3 | Haptics at confirm-transfer and rate-match events — `@capacitor/haptics` | 🟨 installed, not wired |
| 1.4 | Native share sheet for transfer receipts — `@capacitor/share` | 🟥 not added |
| 1.5 | Offline fallback screen (WebView failure → native error UI, not white screen) | 🟥 not implemented |
| 1.6 | Universal Links → transfer detail deep links | 🟥 not configured |
| 1.7 | Native splash screen tuned to web first-paint color | 🟩 already done |

Targeting at least 1.1–1.5 for first submission. 1.6 is nice-to-have post-approval.

---

## 2. Required Info.plist keys

| Key | Value | Purpose |
|-----|-------|---------|
| `ITSAppUsesNonExemptEncryption` | `false` | Export compliance — HTTPS is exempt. Prevents every-upload prompt. |
| `NSFaceIDUsageDescription` | "Unlock My Remittance Pal with Face ID to view your transfers." | Required when using biometric plugin. |
| `NSCameraUsageDescription` | (only if KYC doc-capture uses camera) | Persona SDK will need this. |
| `NSPhotoLibraryUsageDescription` | (only if user uploads existing ID photos) | Persona SDK may need this. |
| `NSUserTrackingUsageDescription` | (only if you do cross-app tracking) | Skip if no tracking — recommended. |

Remove legacy: `UIRequiredDeviceCapabilities` → `armv7` (iOS 11+ is 64-bit).

---

## 3. Required privacy manifest (`PrivacyInfo.xcprivacy`)

Mandatory since May 2024 for apps using "required reason APIs." WKWebView triggers
this. Must declare:

- `NSPrivacyCollectedDataTypes` — what you collect (email, name, bank, location, etc.)
- `NSPrivacyAccessedAPITypes` — required-reason APIs used
- `NSPrivacyTracking` — `false` unless you genuinely cross-app track

File lives at `apps/mobile/ios/App/App/PrivacyInfo.xcprivacy`.

---

## 4. App Store Connect metadata

| Asset | Requirement | Status |
|-------|-------------|--------|
| App icon | 1024×1024 PNG, no alpha, no rounded corners | 🟥 placeholder only |
| Icon asset catalog | All required sizes (20pt 2x/3x, 29pt, 40pt, 60pt 2x/3x + App Store 1024) | 🟥 empty |
| Launch screen | `LaunchScreen.storyboard` | 🟨 exists, not audited |
| Screenshots | 6.7" iPhone (required), 6.5" iPhone (required), 5.5" iPhone (recommended) | 🟥 none |
| App description | <4000 chars; focus on what it does, not marketing fluff | 🟥 not written |
| Keywords | 100 chars total, comma-separated | 🟥 not written |
| Promotional text | 170 chars, editable between reviews | 🟥 not written |
| Age rating | Set in ASC questionnaire — likely 4+ | 🟥 not set |
| Primary category | Finance | — |
| Secondary category | Utilities | — |
| App Privacy questionnaire | Full disclosure of data collection | 🟥 not completed |
| Demo account | App Review needs login credentials | 🟥 not created |
| Review notes | MSB licensing, partner-license info, test corridors | 🟥 not written |

---

## 5. Build + upload sequence (executes after 0–4 green)

```bash
# 1. Sync Capacitor changes
cd apps/mobile
npx cap sync ios

# 2. Install any new pods
cd ios/App && pod install && cd ../..

# 3. Open Xcode
npx cap open ios

# In Xcode:
# - Set Team (Signing & Capabilities)
# - Set Marketing Version (e.g. 1.0.0) and Build (e.g. 1)
# - Select "Any iOS Device (arm64)" destination
# - Product → Archive
# - Window → Organizer → Distribute App → App Store Connect → Upload
```

Then in App Store Connect:
1. Wait for processing (5–30 min)
2. Add build to TestFlight → internal test group
3. Verify on physical device via TestFlight app
4. Fill TestFlight beta info (feedback email, beta app description)
5. Add External Test group + submit for Beta App Review (1–2 day review)
6. Collect at least 3 rounds of internal + external test feedback
7. Create App Store version → attach build → fill metadata from section 4
8. Submit for Review (5–7 day average)

---

## 6. Post-approval

- Set up App Store Connect API key for future Fastlane/fastlane automation
- Document the review-notes-template for faster subsequent versions
- Monitor Sentry / crash reports for production issues in first 72h

---

## Current phase

**Phase 1: Hard blockers + 4.2 mitigation in parallel.**

See `HANDOFF.md` for exactly what's been done vs. what's next.
