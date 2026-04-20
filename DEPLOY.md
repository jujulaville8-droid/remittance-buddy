# My Remittance Pal — Deploy to Demo

End-to-end path from this repo to: (1) a public web URL on Vercel, (2) an iOS build running in the Simulator, (3) an Android build in the Emulator.

## Prereqs you already have

- Xcode installed
- Android Studio installed
- pnpm 9 (corepack-managed)
- Node 20+

## Prereqs you may need to set up

- Supabase project with the migrations applied
- Vercel account (free tier is enough)

---

## 1. Supabase (backend)

### 1.1 Apply the migrations

Open your Supabase project -> **SQL Editor** -> **New query**. Paste the contents of each migration file, in order, and run:

1. `packages/db/migrations/0000_wonderful_sabretooth.sql`
2. `packages/db/migrations/0001_platform_init.sql`

The migrations are idempotent (guarded with `exception when duplicate_object`), so rerunning is safe.

### 1.2 Paste the keys into `.env.local`

Create `apps/web/.env.local` with values from **Project Settings -> API**:

```
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_xxx
SUPABASE_SERVICE_ROLE_KEY=sb_secret_xxx
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

---

## 2. Local web (smoke test)

```bash
pnpm install
cd apps/web
PORT=3001 pnpm next dev --turbopack
```

Open http://localhost:3001 — you should see the editorial landing page (receipt calculator, Filipino-family copy, Tagalog greeting). Walk through:

- `/` — landing
- `/compare` — rate comparison tool (fill in amount, pick corridor + payout)
- `/alerts` — rate alert signup (guest-visible)
- `/family` — family hub (requires sign in)
- `/sign-in`, `/sign-up` — Supabase auth

If the page 500s, re-check `.env.local`. If `/api/quotes` returns empty, Upstash Redis isn't configured — harmless, quotes fall through to live fetches.

---

## 3. Vercel (public web)

### 3.1 First deploy

```bash
# From repo root
npx vercel@latest login    # one time
npx vercel@latest          # follow prompts; pick project name "my-remittance-pal"
```

This deploys to a preview URL like `my-remittance-pal-<hash>.vercel.app`. Connect it to the `main` branch by running `npx vercel --prod` or by linking in the Vercel dashboard.

### 3.2 Add production env vars

In the Vercel dashboard -> **Settings -> Environment Variables**, add the same three Supabase keys from step 1.2 (set scope to **Production, Preview, Development**).

Redeploy with `npx vercel --prod`.

### 3.3 Confirm the project URL

After deploy, note the canonical URL — likely `https://my-remittance-pal.vercel.app`. If Vercel gives a different URL (someone already owns the name), update `apps/mobile/capacitor.config.ts` `server.url` to match, and commit.

---

## 4. Capacitor sync (mobile point at live URL)

```bash
cd apps/mobile
pnpm install
npx cap sync
```

`cap sync` copies the latest `capacitor.config.ts` into the native iOS + Android projects. After this, your native apps know to load the Vercel URL at launch.

---

## 5. iOS Simulator

```bash
# From apps/mobile
cd ios/App
pod install            # first time only; installs Capacitor native deps
cd -
npx cap open ios       # opens Xcode
```

In Xcode:

1. Select a simulator from the scheme dropdown (iPhone 16 works)
2. Click **Run** (Cmd-R)
3. The app boots with the splash screen, then loads the Vercel URL inside the WebView

Expected time: first build ~3 min, subsequent ~30 sec.

---

## 6. Android Emulator

```bash
# From apps/mobile
npx cap open android   # opens Android Studio
```

In Android Studio:

1. **Device Manager** -> create a Pixel 7 Pro emulator with API 34 if you don't have one
2. Click **Run** (green triangle)
3. App boots on the emulator with the Vercel URL

Expected time: first Gradle sync ~5 min, subsequent builds ~30 sec.

---

## 7. Physical iPhone / Android (optional, no store accounts needed)

### iPhone side-load (7-day free provisioning)

- Plug iPhone into Mac via USB
- Trust the computer on the phone
- In Xcode, select your iPhone from the scheme dropdown
- **Signing & Capabilities** -> Team: use your personal Apple ID (free)
- Click **Run**. First time: iPhone prompts you to trust the developer certificate in Settings -> General -> VPN & Device Management

### Android side-load

- Plug Android phone via USB, enable Developer Options + USB Debugging
- In Android Studio, phone appears in device list
- Click **Run**. App installs as a debug build

---

## 8. Cron jobs (rate alerts)

`apps/web/vercel.json` already declares two crons:

- `/api/cron/refresh-rates` every 5 minutes
- `/api/cron/check-alerts` every 15 minutes

Vercel picks these up automatically on deploy. No manual setup needed. Set a `CRON_SECRET` env var to lock the endpoints down to Vercel's invocations only.

---

## Troubleshooting

| Symptom | Likely cause |
|---|---|
| Every page returns 500 locally | Supabase env vars missing or typo'd |
| `pnpm install` warns about `pnpm@9 vs 10` | Harmless; corepack enforces pnpm 9 inside the repo |
| Xcode "No team found" | Sign in with your Apple ID in Xcode -> Settings -> Accounts |
| Android emulator says "Can't reach server" | Check capacitor.config.ts url; emulator uses `10.0.2.2` for localhost, but production URL should just work |
| Vercel build fails on `@sentry/nextjs` | Needs `SENTRY_*` env vars in production; set empty or unset if you don't want Sentry |

---

## What's NOT in this demo

- TestFlight distribution (requires Apple Developer $99/yr)
- Play Store listing (requires Google Play Console $25 one-time)
- Push notifications for rate alerts (Capacitor plugin not yet added)
- Native share sheet (Capacitor plugin not yet added)
- Universal Links / App Links (not yet configured)

These are documented in the plan and unlock in Phase 4 once the demo validates.
