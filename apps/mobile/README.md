# @remit/mobile

Native iOS + Android shell built with [Capacitor](https://capacitorjs.com). Remote mode — the app loads `https://remitance-buddy.vercel.app` in a `WKWebView` / `WebView` with native chrome around it.

## One-time setup

You'll need these installed before you can build:

- **Xcode** (latest, from Mac App Store) — required for iOS builds
- **CocoaPods** — `sudo gem install cocoapods` (needs Ruby ≥ 2.6)
- **Android Studio** (latest) — required for Android builds
- **Apple Developer account** ($99/yr) — required for TestFlight / App Store
- **Google Play Developer account** ($25 one-time) — required for Play Store

## Install JS deps

From the repo root:

```bash
pnpm install
```

## Run on iOS Simulator

```bash
cd apps/mobile
# First time only — install native pods
cd ios/App && pod install && cd -
# Open in Xcode and hit ▶
npx cap open ios
```

Or from the CLI without Xcode UI:

```bash
npx cap run ios
```

## Run on Android Emulator

```bash
cd apps/mobile
npx cap open android
# or
npx cap run android
```

## Pushing web changes

Because we're in **remote mode** (see `capacitor.config.ts`), the mobile app always loads the latest Vercel deploy. **Web changes go live instantly for mobile users too** — no rebuild / resubmit cycle.

When you want to ship an offline-capable version, flip `server.url` → point `webDir` at a static export of `apps/web`, and run:

```bash
pnpm --filter @remit/web build
npx cap sync
```

## Native changes

Anything inside `ios/` or `android/` (bundle ID, signing config, native plugin code, app icons, splash screens) needs to be committed and requires a new TestFlight / Play Store build.

## App metadata

- **Bundle ID / App ID:** `com.myremittancepal.app`
- **App name:** My Remittance Pal
- **Theme color:** `#14110D` (warm ink)
- **Splash bg:** `#14110D`

Defined in `capacitor.config.ts`. Change there and run `npx cap sync` to propagate.
