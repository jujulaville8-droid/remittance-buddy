# My Remittance Pal — Session Handoff

**Last updated:** 2026-04-23 (end of session)

## Current phase

**Pre-submission hardening COMPLETE on the code side.** Successfully built and
deployed to iPhone 17 Pro simulator. Next actionable step is Xcode UI wiring
(Phase B of `TESTFLIGHT_RUNBOOK.md`), gated on Apple Developer Organization
enrollment — see `APPLE_ENROLLMENT.md`.

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

### Hard blockers (user-driven, not code)

1. **Apple Developer Organization enrollment** — see `APPLE_ENROLLMENT.md`
   for DUNS process, timeline (1–6 weeks), costs, parallel prep tasks.
2. **Privacy Policy URL + Support URL** live on your domain (public).
3. **MSB licensing or partner-license evidence** — PDF ready for App Review
   response email. Partnership path recommended (Wise / Remitly / Western
   Union / Modulr etc.).
4. **Account deletion flow in-app** — Apple Guideline 5.1.1(v). Must be
   reachable from Settings in ≤2 taps. **NOT YET IMPLEMENTED.** File to
   create: `apps/web/src/app/(dashboard)/settings/delete-account/page.tsx`
   + `DELETE /api/users/me` route.
5. **Designed 1024×1024 app icon** to replace the upscaled placeholder at
   `apps/mobile/ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png`.
6. **3–10 screenshots per device size** captured from real device running
   TestFlight (6.7" iPhone mandatory).

### Code work still recommended before submission

1. **Wire haptics at confirm-transfer tap** — helper exists at
   `apps/web/src/lib/native/index.ts` → `notificationHaptic()`. Call from
   the Send button handler on the transfer confirm page.
2. **Wire native share on transfer receipts** — call `shareReceipt()` from
   a "Share receipt" button on the transfer detail page.
3. **Small smoke test** verifying `/api/push/register` accepts a valid
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
Use parallel-prep time to either:
- Follow `APPLE_ENROLLMENT.md` checklist to start the DUNS request, OR
- Implement the account deletion flow (the remaining hard blocker that's pure
  code work — no external dependencies).

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
