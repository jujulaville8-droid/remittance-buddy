# My Remittance Pal — Session Handoff

**Last updated:** 2026-04-23 (end of session)

## Current phase

**Pre-submission hardening COMPLETE on the native side. Product framing
pivoted: V1 is REFERRALS-ONLY — we don't handle money, so the earlier
money-transmitter submission story no longer applies.** All four submission
docs were rewritten on 2026-04-23 to reflect this; see `CLAUDE.md` +
`SUBMISSION_PLAN.md` + `APPLE_ENROLLMENT.md` + `TESTFLIGHT_RUNBOOK.md`.

Successfully built + deployed to iPhone 17 Pro simulator earlier this session.
Next actionable step is either (a) the remaining code work (account deletion,
affiliate disclosure page, haptics/share wiring) or (b) Apple Developer
enrollment — **Individual tier is now sufficient** (was Organization under
the old framing). See `APPLE_ENROLLMENT.md`.

## ✅ Completed this session

### Project memory (Track 1)

- `CLAUDE.md` — product DNA + operations discipline
- `SUBMISSION_PLAN.md` — roadmap with hard blockers, 4.2 mitigation, metadata
- `TESTFLIGHT_RUNBOOK.md` — Phase A → F commands and Xcode steps
- `APPLE_ENROLLMENT.md` — Organization tier walkthrough, DUNS, timeline, costs
- This `HANDOFF.md`

### Shell hardening (Track 2)

- Added deps to `apps/web/package.json` and `apps/mobile/package.json`:
  `@capacitor/core`, `@capacitor/network`, `@capacitor/push-notifications`,
  `@capacitor/share`, `@capgo/capacitor-native-biometric`
- `apps/web/src/lib/native/index.ts` — safe wrappers (haptic, share, push
  registration, connectivity subscription, biometric verify). No-ops on web/SSR.
- `apps/web/src/components/native/NativeShell.tsx` — mounts in root layout,
  registers push token on boot, shows offline banner when WebView loses
  connectivity. Deliberately does NOT gate UI with biometric.
- Wired `<NativeShell />` into `apps/web/src/app/layout.tsx`
- `apps/web/src/app/api/push/register/route.ts` — Upstash-backed token
  registry matching the existing `/api/alerts` pattern.

### iOS native (Track 3)

- **Info.plist** — export compliance (`ITSAppUsesNonExemptEncryption=false`),
  privacy usage strings (FaceID, Camera, PhotoLibrary), `UIBackgroundModes →
  remote-notification`, legacy `armv7` → `arm64`, portrait-only on iPhone.
- **App.entitlements** created with `aps-environment=development`.
- **PrivacyInfo.xcprivacy** created — email, name, payment info, financial
  info, device ID, crash data; UserDefaults + FileTimestamp + SystemBootTime
  + DiskSpace required-reason APIs declared.
- **AppDelegate.swift** — APNs token handlers forwarding to Capacitor.
- **LaunchScreen.storyboard** — solid warm ink `#14110D` (fixes white flash).
- **AppIcon-512@2x.png** — 1024×1024 RGB no-alpha placeholder generated from
  `icon-512.png`. **Replace with designed master before final submission.**
- **Splash.imageset/Contents.json** — cleaned to drop missing-file references.

### Install + sync + pod install (Runbook Phase A)

- `pnpm install` ran, pulled 5 new Capacitor plugins into the monorepo.
- `pnpm exec cap sync ios` ran — 9 plugins picked up, pods auto-installed.
- `pnpm exec cap run ios --target <iPhone 17 Pro UDID>` built + deployed.
  User confirmed: **"looks good"** — WebView loaded, splash correct, no
  native-side errors in the 30-min monitor window.

## ⏳ Remaining work

### Hard blockers (mix of user + code work)

1. **Apple Developer enrollment — Individual tier (recommended for v1)**.
   24-hour approval, $99/yr. See `APPLE_ENROLLMENT.md`. Organization only
   needed if you want an entity-branded seller name.
2. **Privacy Policy URL + Support URL** live on your domain (public).
3. **Account deletion flow in-app** — Apple Guideline 5.1.1(v). Must be
   reachable from Settings in ≤2 taps. **NOT YET IMPLEMENTED.** Suggested
   path: `apps/web/src/app/(dashboard)/settings/delete-account/page.tsx`
   + `DELETE /api/users/me` route that calls Supabase auth admin delete.
4. **"How we make money" affiliate disclosure page** — Settings → About →
   Affiliate Disclosure. Required by FTC + pre-empts Apple Guideline 2.3.1.
   Also add inline disclosure line on each comparison result near the
   "Go to [Provider]" button.
5. **Designed 1024×1024 app icon** to replace the upscaled placeholder at
   `apps/mobile/ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png`.
6. **3–10 screenshots per device size** captured from real device running
   TestFlight (6.7" iPhone mandatory).

**Removed from hard blockers (no longer apply in referrals-only v1):**
MSB licensing, partner-license evidence, FinCEN registration, state money
transmitter licenses, DUNS number (unless you want Organization tier for
other reasons).

### Code work still recommended before submission

1. **Wire haptics at "Go to [Provider]" tap** — helper
   `apps/web/src/lib/native/index.ts` → `notificationHaptic()`. Call from
   the result-row tap handler (likely in `apps/web/src/app/compare/CompareTool.tsx`
   or wherever `handleAffiliateHandoff` fires).
2. **Wire native share for rate-match events** — call `shareReceipt()`
   from a "Share this rate" button on comparison results or rate-alert-hit
   notifications.
3. **Consider swapping `window.open` for `@capacitor/browser`** in
   `apps/web/src/lib/affiliate-routing.ts::handleAffiliateHandoff`. On iOS,
   Capacitor's Browser plugin uses `SFSafariViewController` — cookies persist
   across sessions (better affiliate attribution), user stays visually inside
   our app, and the back button returns to our UI. One-line change.
4. **Trim `PrivacyInfo.xcprivacy`** — remove `NSPrivacyCollectedDataTypePaymentInfo`
   and `NSPrivacyCollectedDataTypeOtherFinancialInfo` (money-mover leftovers
   from before the pivot).
5. **Delete or flag dead code** — `apps/web/src/lib/wise.ts` (Wise Business
   API client, unused in v1) and `apps/web/src/lib/persona.ts` (KYC adapter,
   unused in v1). Safe to delete or park under a `legacy/` directory.
6. **Small smoke test** verifying `/api/push/register` accepts a valid
   payload (returns `{ok:true, stored:true|false}`).

### Xcode UI wiring (Runbook Phase B) — blocked on enrollment

When Apple enrollment clears:

- Open Xcode via `pnpm exec cap open ios` from `apps/mobile/`
- Signing & Capabilities → set Team, add **Push Notifications** + **Background
  Modes** (Remote notifications), optionally Sign In with Apple
- Add `PrivacyInfo.xcprivacy` to App target membership
- Verify `CODE_SIGN_ENTITLEMENTS` points at `App/App.entitlements`
- Set Version 1.0.0, Build 1
- Then Phases C–F of `TESTFLIGHT_RUNBOOK.md` (archive → upload → TestFlight →
  App Store).

## Exact next step when resuming

Depends on what's ready:

**If enrollment NOT yet done:**
Use parallel-prep time to tackle pure-code blockers (no external dependencies
in the referrals-only model):
- Implement the account deletion flow
- Implement the "How we make money" affiliate disclosure page + inline
  disclosure
- Wire haptics + native share at their UI touchpoints
- Trim `PrivacyInfo.xcprivacy` payment/financial entries

Then start Apple Developer Individual enrollment (~24h approval) per
`APPLE_ENROLLMENT.md`.

**If enrollment DONE:**
```bash
cd /Users/gimchiflow/Business/my-remittance-pal/apps/mobile
pnpm exec cap open ios
```
Then follow `TESTFLIGHT_RUNBOOK.md` Phase B.

## State of services at session end

- ✅ Next.js dev server on `:3011` — **killed** (port free)
- ✅ `capacitor.config.ts` — reverted to prod Vercel URL
- ✅ All session files committed to git (see commit `feat(mobile): harden
  iOS shell for App Store submission`)
- ℹ️ iPhone 17 Pro simulator still has the `App.app` installed — points at
  `http://localhost:3011/dashboard` (localhost won't respond until dev server
  restarts). Reinstall via `cap run ios` next session to pick up prod URL.

## Files changed this session

**New (11):**
- `CLAUDE.md`
- `SUBMISSION_PLAN.md`
- `TESTFLIGHT_RUNBOOK.md`
- `APPLE_ENROLLMENT.md`
- `HANDOFF.md`
- `apps/web/src/lib/native/index.ts`
- `apps/web/src/components/native/NativeShell.tsx`
- `apps/web/src/app/api/push/register/route.ts`
- `apps/mobile/ios/App/App/App.entitlements`
- `apps/mobile/ios/App/App/PrivacyInfo.xcprivacy`
- `apps/mobile/ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png`

**Modified (7 hand-edited + 3 auto-regenerated):**
- `apps/web/package.json`
- `apps/web/src/app/layout.tsx`
- `apps/mobile/package.json`
- `apps/mobile/ios/App/App/Info.plist`
- `apps/mobile/ios/App/App/AppDelegate.swift`
- `apps/mobile/ios/App/App/Base.lproj/LaunchScreen.storyboard`
- `apps/mobile/ios/App/App/Assets.xcassets/Splash.imageset/Contents.json`
- `pnpm-lock.yaml` *(auto)*
- `apps/mobile/ios/App/Podfile` *(auto from cap sync)*
- `apps/mobile/ios/App/Podfile.lock` *(auto from pod install)*
