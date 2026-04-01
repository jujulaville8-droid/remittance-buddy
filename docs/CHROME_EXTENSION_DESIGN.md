# Remittance Buddy — Chrome Extension Design Doc

**Status:** Draft
**Author:** Julian Laville
**Date:** 2026-03-31

---

## 1. Overview

Remittance Buddy is a Chrome extension that acts as an AI-powered remittance concierge. It helps users find the best rates, speeds, and methods to send money internationally by comparing across multiple providers (Wise, Remitly, MoneyGram, Western Union, etc.).

**We are an aggregator, not a money transmitter.** We do not process funds. We route users to the best provider for their corridor and earn referral/affiliate commissions per transfer.

### Value Proposition

- "Kayak for remittances" — compare rates across providers in real time
- AI chat concierge that understands corridor-specific rules, fees, and speed
- Browser-native: always one click away while browsing
- No app download required

### Competitive Landscape

| Competitor | Format | AI | Gap |
|-----------|--------|-----|-----|
| Monito | Web comparison | No | Static tables, no personalization |
| SaveOnSend | Blog + compare | No | Dated UX, informational only |
| Exiap | Web comparison | No | No chat, no browser extension |

**No one combines AI + browser extension + remittance aggregation.** We are first-mover in this intersection.

---

## 2. Architecture Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| UI Surface | Side Panel + Popup | Chat needs persistent space; quick actions need speed |
| Web App Integration | Hybrid | Native extension UI for core flows, shared types from monorepo |
| Backend Strategy | Shared API package | DRY AI/data logic, separate auth flows |
| Authentication | OAuth + chrome.storage | Secure first login, fast returning sessions |
| AI Model | Tool-calling agent | Real utility (check rates, lookup transfers) |
| Monetization | Free | Revenue from affiliate commissions per transfer |

---

## 3. Monorepo Structure

```
remittance-buddy/
├── apps/
│   ├── web/                    # Existing Next.js web app (landing, dashboard, history)
│   └── extension/              # NEW — Chrome extension
│       ├── manifest.json       # Manifest V3
│       ├── src/
│       │   ├── sidepanel/      # React app for side panel (AI chat, onboarding, transfers)
│       │   ├── popup/          # React app for popup (quick status, rate check, send shortcut)
│       │   ├── background/     # Service worker (auth token management, alarms, notifications)
│       │   ├── content/        # Content scripts (optional — rate detection on provider sites)
│       │   └── shared/         # Shared extension utilities (storage, messaging)
│       ├── public/
│       │   └── icons/          # Extension icons (16, 32, 48, 128)
│       ├── vite.config.ts      # Vite build for extension (CRXJS or custom)
│       ├── package.json
│       └── tsconfig.json
│
├── packages/
│   ├── db/                     # Existing — Drizzle ORM + Neon
│   ├── typescript-config/      # Existing — shared tsconfig
│   └── api/                    # NEW — shared API logic
│       ├── src/
│       │   ├── ai/             # AI SDK tool definitions, system prompts
│       │   │   ├── tools/      # check-rates, lookup-transfer, get-recipients, etc.
│       │   │   ├── system-prompt.ts
│       │   │   └── agent.ts    # Agent configuration
│       │   ├── providers/      # Remittance provider integrations
│       │   │   ├── wise.ts
│       │   │   ├── remitly.ts
│       │   │   ├── moneygram.ts
│       │   │   └── types.ts    # Shared provider response types
│       │   ├── services/       # Business logic
│       │   │   ├── comparison.ts   # Rate comparison engine
│       │   │   ├── corridors.ts    # Country pair rules/requirements
│       │   │   └── transfers.ts    # Transfer tracking
│       │   └── index.ts
│       ├── package.json
│       └── tsconfig.json
```

---

## 4. Extension UI Design

### 4.1 Side Panel (Primary Surface)

The side panel is where the AI chat experience lives. It opens via the extension icon or a keyboard shortcut.

**Screens:**

1. **Onboarding** — First-time setup: name, default send/receive countries, preferred providers
2. **Chat** — AI concierge conversation. The main interaction surface.
3. **Transfer Flow** — When the AI initiates a transfer, a structured form appears inline in chat:
   - Amount + currency selection
   - Recipient selection (from saved) or new
   - Provider comparison cards (rate, fee, speed, total cost)
   - "Send with [Provider]" button → opens provider in new tab with pre-filled params
4. **History** — Recent comparisons and transfers (deep-links to web app for full details)

**Layout:**
```
┌──────────────────────────┐
│  Remittance Buddy    [⚙] │  ← Header with settings
├──────────────────────────┤
│                          │
│  AI Chat Messages        │  ← Scrollable message area
│                          │
│  ┌────────────────────┐  │
│  │ Rate Comparison    │  │  ← Inline tool result cards
│  │ Wise: $1 = ₱58.32 │  │
│  │ Remitly: ₱57.98   │  │
│  └────────────────────┘  │
│                          │
├──────────────────────────┤
│  [Type a message...]  [→]│  ← Input area
└──────────────────────────┘
```

### 4.2 Popup (Quick Actions)

Small popup (400x500px) when clicking the extension icon. For users who don't need the full chat.

**Sections:**

1. **Quick Rate Check** — Two dropdowns (send/receive country), amount input, instant comparison
2. **Recent Transfers** — Last 3 transfers with status
3. **"Open Chat"** — Button to open the side panel

```
┌─────────────────────────┐
│  💸 Quick Rate Check     │
│  Send: [USD ▼] [$500  ] │
│  To:   [PHP ▼]          │
│  ─────────────────────── │
│  Wise     ₱29,160  2min │
│  Remitly  ₱28,990  1hr  │
│  WU       ₱28,500  10m  │
│  ─────────────────────── │
│  Recent Transfers        │
│  • $200 → PHP — Done ✓  │
│  • $500 → INR — Pending │
│  ─────────────────────── │
│  [Open AI Chat →]        │
└─────────────────────────┘
```

---

## 5. AI Agent Design

### 5.1 System Prompt

The AI is a remittance concierge. It:
- Compares rates across providers for any corridor
- Explains fees, speed, and payment method trade-offs
- Knows corridor-specific requirements (documents, limits, restricted countries)
- Guides users through the transfer flow
- Never gives financial advice; always shows data and lets the user decide

### 5.2 Tools (AI SDK Tool Calling)

| Tool | Description | Parameters |
|------|-------------|------------|
| `checkRates` | Compare rates across providers | `sendCurrency`, `receiveCurrency`, `amount`, `paymentMethod?` |
| `getProviderDetails` | Get detailed info about a provider | `provider`, `corridor` |
| `lookupTransfer` | Check status of a past transfer | `transferId` or `provider` + `reference` |
| `getRecipients` | List user's saved recipients | `country?` |
| `getCorridorInfo` | Get requirements for a country pair | `sendCountry`, `receiveCountry` |
| `getTransferHistory` | List recent transfers | `limit?`, `status?` |

### 5.3 Model Configuration

```typescript
// packages/api/src/ai/agent.ts
import { Agent, stepCountIs } from 'ai';

const remittanceAgent = new Agent({
  model: 'anthropic/claude-sonnet-4.6',  // via AI Gateway
  instructions: SYSTEM_PROMPT,
  tools: { checkRates, getProviderDetails, lookupTransfer, ... },
  stopWhen: stepCountIs(5),
});
```

---

## 6. Authentication Flow

### 6.1 First Login (OAuth)

```
1. User clicks "Sign In" in side panel
2. Extension opens new tab → web app /auth/extension-callback
3. User authenticates via Clerk (Google, email, etc.)
4. Web app generates a short-lived token
5. Token passed back to extension via chrome.runtime.sendMessage
6. Extension stores refresh token in chrome.storage.session
7. Side panel shows authenticated state
```

### 6.2 Returning User

```
1. Extension service worker checks chrome.storage.session for token
2. If valid → auto-authenticate, show chat
3. If expired → silent refresh via stored refresh token
4. If no token → show sign-in screen
```

### 6.3 Security

- Tokens stored in `chrome.storage.session` (cleared when browser closes)
- Refresh tokens in `chrome.storage.local` (encrypted by Chrome)
- All API calls use HTTPS + Bearer token
- Rate limiting via Upstash Redis (already in stack)

---

## 7. Provider Integration Strategy

### 7.1 Phase 1 — Affiliate API Integrations

| Provider | API Type | Affiliate Program |
|----------|----------|-------------------|
| Wise | Public API (rate quotes) | Wise Affiliates (CPA model) |
| Remitly | Partner API | Remitly Affiliate Program |
| MoneyGram | Public API | MoneyGram Partners |
| Western Union | Rate scraping (no public API) | WU Affiliate Program |
| OFX | Partner API | OFX Partners |

### 7.2 Rate Comparison Engine

```typescript
// packages/api/src/services/comparison.ts
interface RateQuote {
  provider: string;
  sendAmount: number;
  sendCurrency: string;
  receiveAmount: number;
  receiveCurrency: string;
  exchangeRate: number;
  fee: number;
  totalCost: number;        // sendAmount + fee
  deliveryTime: string;     // "instant", "1-2 hours", "1-3 days"
  paymentMethods: string[]; // "bank", "card", "cash"
  affiliateUrl: string;     // Tracked referral URL
}

// Fetch rates from all providers in parallel, normalize, sort by totalCost
```

---

## 8. Data Model Extensions

New tables in `packages/db` for extension-specific data:

```sql
-- Rate comparison cache (avoid hitting provider APIs on every request)
CREATE TABLE rate_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  send_currency TEXT NOT NULL,
  receive_currency TEXT NOT NULL,
  amount DECIMAL NOT NULL,
  provider TEXT NOT NULL,
  exchange_rate DECIMAL NOT NULL,
  fee DECIMAL NOT NULL,
  receive_amount DECIMAL NOT NULL,
  delivery_time TEXT,
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL
);

-- User corridor preferences
CREATE TABLE corridor_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  send_country TEXT NOT NULL,
  receive_country TEXT NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Transfer click-throughs (for affiliate tracking)
CREATE TABLE affiliate_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  provider TEXT NOT NULL,
  corridor TEXT NOT NULL,
  amount DECIMAL NOT NULL,
  affiliate_url TEXT NOT NULL,
  clicked_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## 9. Build & Distribution

### 9.1 Build Pipeline

The extension uses Vite with CRXJS plugin for Manifest V3 builds:

```
turbo build --filter=@remit/extension
  → Vite bundles sidepanel, popup, background, content scripts
  → Outputs to apps/extension/dist/
  → dist/ is a loadable Chrome extension
```

### 9.2 turbo.json Addition

```json
{
  "build": {
    "dependsOn": ["^build"],
    "inputs": ["$TURBO_DEFAULT$", ".env*"],
    "outputs": [".next/**", "!.next/cache/**", "dist/**"]
  }
}
```

The existing `dist/**` output pattern already covers the extension build.

### 9.3 Distribution

- **Development**: Load unpacked from `apps/extension/dist/`
- **Chrome Web Store**: Publish via Chrome Developer Dashboard
- **Auto-update**: Chrome handles updates automatically once published
- **CI/CD**: GitHub Actions → build → zip → upload to Web Store API

---

## 10. Tech Stack Summary

| Layer | Technology |
|-------|-----------|
| Extension Framework | Manifest V3 + Vite (CRXJS) |
| UI Framework | React 19 + TypeScript |
| Styling | Tailwind CSS + shadcn/ui (dark mode default) |
| AI | AI SDK v6 + AI Gateway (OIDC auth) |
| AI Model | anthropic/claude-sonnet-4.6 (via gateway) |
| Auth | Clerk (OAuth flow) + chrome.storage |
| Database | Neon Postgres + Drizzle ORM |
| Rate Limiting | Upstash Redis |
| Build | Vite + CRXJS + Turborepo |
| Backend | Next.js API routes (web) + shared packages/api |
| Fonts | Geist Sans / Geist Mono |

---

## 11. Implementation Phases

### Phase 1 — Foundation (Week 1-2)
- [ ] Scaffold `apps/extension` with Manifest V3 + Vite + React
- [ ] Scaffold `packages/api` with shared types and service stubs
- [ ] Side panel shell with basic chat UI (AI Elements)
- [ ] Popup shell with quick rate check form
- [ ] Background service worker with auth token management
- [ ] Wire up AI SDK with tool-calling agent (no real provider data yet)
- [ ] Integrate Turborepo build pipeline

### Phase 2 — Provider Integrations (Week 3-4)
- [ ] Wise API integration (rate quotes)
- [ ] Remitly API integration
- [ ] MoneyGram API integration
- [ ] Rate comparison engine with caching
- [ ] Wire tools to real provider data
- [ ] Affiliate URL generation and tracking

### Phase 3 — Full Experience (Week 5-6)
- [ ] Clerk OAuth flow for extension auth
- [ ] Saved recipients management
- [ ] Transfer history (extension ↔ web app)
- [ ] Corridor-specific knowledge base
- [ ] Rate alert notifications (chrome.alarms)
- [ ] Polished UI with shadcn/ui components

### Phase 4 — Launch Prep (Week 7-8)
- [ ] Chrome Web Store listing (screenshots, description, privacy policy)
- [ ] E2E testing with Playwright
- [ ] Performance optimization (bundle size, startup time)
- [ ] Analytics integration (@vercel/analytics)
- [ ] Beta testing with target users
- [ ] Web Store submission and review

---

## 12. Open Questions

1. **Provider API access** — Some providers (Western Union) don't have public rate APIs. Do we scrape, use a data provider (like ExchangeRateAPI), or skip them initially?
2. **Affiliate agreements** — Need to apply to each provider's affiliate program. Timeline varies (1-4 weeks approval).
3. **Content scripts** — Should the extension detect when a user is on a provider's site and show a "compare rates" overlay? Adds value but increases permission scope.
4. **Mobile companion** — Should there be a React Native app later, or is the web app + extension sufficient for MVP?
5. **Rate data freshness** — How stale is acceptable? Real-time on every query vs. cached for 5-15 minutes?
