# Remittance Buddy — Local Setup

Everything you need to get from a fresh `git clone` to a running dev server at `http://localhost:3001`.

## Prerequisites

- **Node** 20+ (check: `node --version`)
- **pnpm** 9 — activate via corepack: `corepack enable && corepack prepare pnpm@9.0.0 --activate`
- A macOS or Linux shell

## 1. Clone + install

```bash
git clone git@github.com:jujulaville8-droid/remittance-buddy.git
cd remittance-buddy
pnpm install
```

The `.npmrc` in the repo hoists React + Next so the pnpm workspace doesn't produce duplicate-module hydration errors.

## 2. Create `apps/web/.env.local`

Minimum env to run locally against the shared Supabase project:

```
NEXT_PUBLIC_SUPABASE_URL=https://jrthcnggvzbzidmzepqc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon_key>
SUPABASE_SERVICE_ROLE_KEY=<service_role_key>
```

Grab the keys from the Supabase dashboard → Project Settings → API, or regenerate fresh ones.

Optional envs (features that need them):

- `STRIPE_SECRET_KEY` + `STRIPE_BUDDY_PLUS_PRICE_ID` — billing flows
- `WISE_API_KEY` + `WISE_PROFILE_ID` + `WISE_ENV=sandbox` — (unused in V1 affiliate-only mode, legacy)
- `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` — quote cache
- `PERSONA_API_KEY` — KYC (unused in V1)
- `RESEND_API_KEY` — email (not yet wired)

Missing any of these only disables the feature that uses it; the app still runs.

## 3. Start dev server

```bash
cd apps/web
PORT=3001 pnpm next dev --turbopack
```

Open `http://localhost:3001`.

- Port 3000 is often taken by another project; we default to 3001.
- Turbopack's on for speed; drop `--turbopack` if you hit a bundler-specific bug.

## 4. Test login (pre-created)

| | |
|---|---|
| Email | `julian@remittance-buddy.test` |
| Password | `RemitBuddy2026!` |

Auto-confirmed via Supabase admin API, no email verification needed. Use this to smoke-test the authed routes (`/dashboard`, `/family`, `/alerts`, the recipient save flow).

## 5. Useful branches

- `main` — landing + previously-deployed tool
- `feat/platform-build-out` — everything from the V1 honesty + Plus-enforcement pass. Merge when Vercel function hours reset.

## 6. Common gotchas

**Hydration error: "Cannot read properties of null (reading 'useInsertionEffect')"**
Duplicate React. Run `rm -rf node_modules apps/*/node_modules packages/*/node_modules && pnpm install --ignore-scripts` to re-hoist.

**Port 3001 already in use**
`lsof -i :3001 -t | xargs kill -9`

**500 on every route with middleware error**
Supabase env vars missing — re-check `apps/web/.env.local`.

**CSP console errors for analytics scripts**
Expected in dev when Vercel Analytics tries to load. Harmless.

## 7. Mobile (Capacitor)

Capacitor wraps the web app as a native iOS/Android shell in `apps/mobile/`. Remote-mode — loads the live Vercel URL inside a WebView. Blocked on Xcode / Android Studio install.

- **Xcode**: `apps.apple.com/app/xcode/id497799835` (~15 GB)
- **Android Studio**: `developer.android.com/studio`
- **iOS dev account** ($99/yr) — only needed for TestFlight / App Store, NOT for running on the Simulator or side-loading to your own iPhone
- **Android dev account** ($25 one-time) — only needed for Play Store

Once both installed:
```bash
cd apps/mobile
sudo gem install cocoapods
cd ios/App && pod install && cd -
npx cap open ios        # opens Xcode
npx cap open android    # opens Android Studio
```

## 8. Supabase project

- URL: `https://jrthcnggvzbzidmzepqc.supabase.co`
- Auth: email/password with email confirmation disabled for MVP
- Schema: see `packages/db/migrations/0001_platform_init.sql`
- RLS enforced on all tables; every row is scoped to `auth.uid() = user_id`
- Management API access: rotate the PAT and do not commit it
