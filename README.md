# Remittance Buddy

AI-powered international money transfers. Fast, transparent, and compliant.

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript (strict) |
| UI | shadcn/ui + Tailwind CSS + Geist fonts |
| AI | Vercel AI SDK v6 + AI Gateway (`anthropic/claude-sonnet-4.6`) |
| Database | Neon Postgres + Drizzle ORM |
| Cache / Rate limit | Upstash Redis |
| Storage | Vercel Blob (KYC docs) |
| Auth | Clerk v7 (Core 3) |
| Payments | Stripe + Wise API |
| KYC | Persona |
| AML / Fraud | Sardine |
| Hosting | Vercel |
| Monorepo | Turborepo + pnpm workspaces |

## Repository Structure

```
remittance-buddy/
├── apps/
│   └── web/                  # Next.js 16 application
│       ├── src/
│       │   ├── app/          # App Router pages & API routes
│       │   │   ├── (dashboard)/  # Protected dashboard routes
│       │   │   ├── api/          # Route handlers
│       │   │   │   ├── chat/         # AI streaming chat
│       │   │   │   ├── transfers/    # Transfer CRUD
│       │   │   │   ├── users/        # User profile
│       │   │   │   └── webhooks/     # Clerk, Wise, Persona webhooks
│       │   │   ├── sign-in/
│       │   │   └── sign-up/
│       │   ├── lib/          # Shared utilities (rate-limit, utils)
│       │   └── middleware.ts # Clerk auth middleware
│       ├── next.config.ts
│       └── tailwind.config.ts
└── packages/
    ├── db/                   # Drizzle ORM schema + Neon client
    │   └── src/schema/       # users, transfers, compliance, notifications
    └── typescript-config/    # Shared tsconfig presets
```

## Prerequisites

- Node.js 20+
- pnpm 9+
- Vercel CLI (`npm i -g vercel@latest`)
- Accounts: Vercel, Neon, Clerk, Upstash, Stripe, Wise, Persona, Sardine

## Local Development Setup

### 1. Clone and install

```bash
git clone <repo-url> remittance-buddy
cd remittance-buddy
pnpm install
```

### 2. Link to Vercel project

```bash
vercel link
```

### 3. Provision services via Vercel Marketplace

```bash
# Neon Postgres (database)
vercel integration add neon

# Clerk (auth) — NOTE: requires manual terms acceptance in terminal
vercel integration add clerk
# After CLI, complete Clerk setup in Vercel Dashboard to connect the project

# Upstash Redis (cache/rate limiting)
vercel integration add upstash
```

### 4. Pull environment variables

```bash
vercel env pull .env.local
```

This also provisions `VERCEL_OIDC_TOKEN` for the AI Gateway — no manual API keys needed.

### 5. Add remaining secrets manually

Copy `.env.example` and fill in values not provisioned by Marketplace:

```bash
cp .env.example .env.local
# Edit .env.local — add Wise, Stripe, Persona, Sardine keys
```

Add them to Vercel:

```bash
vercel env add WISE_API_KEY
vercel env add STRIPE_SECRET_KEY
# ... etc
```

### 6. Set Clerk routing env vars

```bash
vercel env add NEXT_PUBLIC_CLERK_SIGN_IN_URL
# value: /sign-in

vercel env add NEXT_PUBLIC_CLERK_SIGN_UP_URL
# value: /sign-up
```

### 7. Run database migrations

```bash
cd packages/db
pnpm db:push       # push schema to Neon (development)
# pnpm db:migrate  # apply migrations (production)
```

### 8. Start development server

```bash
# From repo root
pnpm dev
```

App runs at [http://localhost:3000](http://localhost:3000).

## CI/CD

GitHub Actions workflow (`.github/workflows/ci.yml`) runs on every PR and push to `main`:

| Step | Trigger |
|------|---------|
| Lint + Type-check + Test | All PRs and pushes |
| Deploy Preview | PRs (after CI passes) |
| Deploy Production | Push to `main` (after CI passes) |

### Required GitHub Secrets

| Secret | Description |
|--------|-------------|
| `VERCEL_TOKEN` | Vercel personal access token |
| `VERCEL_ORG_ID` | Vercel team/org ID (from `.vercel/project.json`) |
| `VERCEL_PROJECT_ID` | Vercel project ID (from `.vercel/project.json`) |
| `TURBO_TOKEN` | Turborepo remote cache token |

### Required GitHub Variables

| Variable | Description |
|----------|-------------|
| `TURBO_TEAM` | Turborepo team slug |

## Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start all apps in development mode |
| `pnpm build` | Build all apps and packages |
| `pnpm lint` | Lint all workspaces |
| `pnpm type-check` | Type-check all workspaces |
| `pnpm test` | Run all tests |
| `pnpm format` | Format all files with Prettier |
| `pnpm format:check` | Check formatting |

Run a single app:
```bash
cd apps/web && pnpm dev
```

Run DB scripts:
```bash
cd packages/db
pnpm db:push       # sync schema (dev)
pnpm db:migrate    # run migrations
pnpm db:studio     # open Drizzle Studio
```

## Environment Variables Reference

See `.env.example` for the full list with comments.

Key variables that are **auto-provisioned** via Vercel Marketplace:
- `DATABASE_URL` — Neon Postgres
- `CLERK_SECRET_KEY` / `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` — Clerk
- `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` — Upstash
- `VERCEL_OIDC_TOKEN` — AI Gateway (no provider API keys needed)

## Architecture Notes

- **AI Gateway**: all AI calls use `model: 'anthropic/claude-sonnet-4.6'` — routed through Vercel AI Gateway with automatic OIDC auth. No `ANTHROPIC_API_KEY` needed.
- **Compliance flow**: Transfer → Sardine AML → Sardine sanctions → KYC check → Wise API
- **PII**: bank account data encrypted at application layer before writing to Postgres
- **Idempotency**: all transfer mutations use a `idempotency_key` (UUID) to prevent double-sends
- **Rate limiting**: Upstash Redis sliding window on all API routes (20 req/10s general, 5 req/60s transfers)

## Next Steps (Subsequent Tasks)

- [ ] Implement KYC flow (Persona integration)
- [ ] Implement transfer creation with Wise API
- [ ] Add AI onboarding assistant UI (AI Elements)
- [ ] Set up Sardine AML checks
- [ ] Add Stripe funding flow
- [ ] Add push notifications
- [ ] Wire Sentry for error tracking
