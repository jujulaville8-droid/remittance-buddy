# Chrome Extension Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Chrome extension (Manifest V3) with a side panel AI chat concierge and a popup for quick rate checks, integrated into the existing remittance-buddy monorepo.

**Architecture:** The extension is a new `apps/extension` app in the Turborepo monorepo. A new `packages/api` package extracts shared AI tools and provider logic from `apps/web`. The extension uses React 19 + Vite + CRXJS for building, communicates with the existing Next.js API routes for data, and shares TypeScript types via workspace packages.

**Tech Stack:** Manifest V3, React 19, Vite + CRXJS, Tailwind CSS, AI SDK v6, Clerk (OAuth), chrome.storage API, Turborepo

**Spec:** `docs/CHROME_EXTENSION_DESIGN.md`

---

## File Structure

```
apps/extension/                    # NEW — Chrome extension app
├── manifest.json                  # Manifest V3 config
├── package.json
├── tsconfig.json
├── vite.config.ts                 # Vite + CRXJS plugin
├── tailwind.config.ts
├── postcss.config.js
├── src/
│   ├── sidepanel/
│   │   ├── index.html             # Side panel entry HTML
│   │   ├── main.tsx               # React root mount
│   │   ├── App.tsx                # Side panel router (onboarding vs chat)
│   │   ├── ChatView.tsx           # AI chat interface
│   │   └── OnboardingView.tsx     # First-time setup
│   ├── popup/
│   │   ├── index.html             # Popup entry HTML
│   │   ├── main.tsx               # React root mount
│   │   └── App.tsx                # Quick rate check + recent transfers
│   ├── background/
│   │   └── service-worker.ts      # Auth token management, side panel open
│   ├── components/
│   │   ├── RateCard.tsx           # Provider rate comparison card
│   │   ├── TransferItem.tsx       # Transfer history list item
│   │   ├── CurrencySelect.tsx     # Currency dropdown
│   │   ├── LoadingDots.tsx        # Typing indicator
│   │   └── ui/                    # Shared UI primitives (button, input, etc.)
│   │       ├── button.tsx
│   │       └── input.tsx
│   ├── lib/
│   │   ├── api-client.ts          # Fetch wrapper with auth headers
│   │   ├── storage.ts             # chrome.storage helpers (get/set tokens)
│   │   ├── auth.ts                # OAuth flow + token refresh
│   │   └── constants.ts           # API base URL, storage keys
│   ├── types/
│   │   └── index.ts               # Extension-specific types
│   └── styles/
│       └── globals.css            # Tailwind directives + extension styles

packages/api/                      # NEW — shared API logic
├── package.json
├── tsconfig.json
└── src/
    ├── index.ts                   # Public exports
    ├── tools/                     # AI SDK tool definitions
    │   ├── check-rates.ts         # Compare rates across providers
    │   ├── get-recipients.ts      # List saved recipients
    │   ├── get-transfer-history.ts
    │   ├── get-corridor-info.ts
    │   └── index.ts               # Re-exports all tools
    ├── providers/                  # Provider API clients
    │   ├── types.ts               # RateQuote, ProviderConfig interfaces
    │   ├── wise.ts                # Wise rate fetching
    │   └── index.ts
    └── system-prompt.ts           # AI agent system prompt
```

**Files modified in existing code:**
- `turbo.json` — no changes needed (dist/** already in outputs)
- `pnpm-workspace.yaml` — no changes needed (packages/* already included)
- `apps/web/src/app/api/chat/route.ts` — refactor to import tools from `@remit/api`

---

## Task 1: Scaffold Extension App

**Files:**
- Create: `apps/extension/package.json`
- Create: `apps/extension/tsconfig.json`
- Create: `apps/extension/manifest.json`
- Create: `apps/extension/vite.config.ts`
- Create: `apps/extension/tailwind.config.ts`
- Create: `apps/extension/postcss.config.js`
- Create: `apps/extension/src/styles/globals.css`

- [ ] **Step 1: Create package.json**

```json
{
  "name": "@remit/extension",
  "version": "0.0.0",
  "private": true,
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "@ai-sdk/react": "^3.0.143",
    "@remit/api": "workspace:*",
    "@remit/db": "workspace:*",
    "ai": "^6.0.141",
    "clsx": "^2.1.1",
    "lucide-react": "^0.475.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "tailwind-merge": "^2.6.0"
  },
  "devDependencies": {
    "@crxjs/vite-plugin": "^2.0.0-beta.28",
    "@remit/typescript-config": "workspace:*",
    "@types/chrome": "^0.0.287",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "@vitejs/plugin-react": "^4.3.4",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.5.1",
    "tailwindcss": "^3.4.17",
    "typescript": "^5.7.2"
  }
}
```

- [ ] **Step 2: Create tsconfig.json**

```json
{
  "extends": "@remit/typescript-config/react-library.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src",
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    },
    "types": ["chrome"]
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

- [ ] **Step 3: Create manifest.json (Manifest V3)**

```json
{
  "manifest_version": 3,
  "name": "Remittance Buddy",
  "description": "AI-powered remittance concierge — compare rates, send money smarter",
  "version": "0.1.0",
  "permissions": [
    "sidePanel",
    "storage",
    "alarms",
    "notifications"
  ],
  "host_permissions": [
    "http://localhost:3000/*"
  ],
  "action": {
    "default_popup": "src/popup/index.html",
    "default_icon": {
      "16": "icons/icon-16.png",
      "32": "icons/icon-32.png",
      "48": "icons/icon-48.png",
      "128": "icons/icon-128.png"
    }
  },
  "side_panel": {
    "default_path": "src/sidepanel/index.html"
  },
  "background": {
    "service_worker": "src/background/service-worker.ts",
    "type": "module"
  },
  "icons": {
    "16": "icons/icon-16.png",
    "32": "icons/icon-32.png",
    "48": "icons/icon-48.png",
    "128": "icons/icon-128.png"
  }
}
```

- [ ] **Step 4: Create vite.config.ts**

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { crx } from '@crxjs/vite-plugin';
import { resolve } from 'path';
import manifest from './manifest.json';

export default defineConfig({
  plugins: [
    react(),
    crx({ manifest }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        sidepanel: resolve(__dirname, 'src/sidepanel/index.html'),
        popup: resolve(__dirname, 'src/popup/index.html'),
      },
    },
  },
});
```

- [ ] **Step 5: Create Tailwind + PostCSS config**

`tailwind.config.ts`:
```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Geist Sans', 'system-ui', 'sans-serif'],
        mono: ['Geist Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};

export default config;
```

`postcss.config.js`:
```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

`src/styles/globals.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --background: 0 0% 7%;
  --foreground: 0 0% 95%;
  --muted: 0 0% 15%;
  --muted-foreground: 0 0% 65%;
  --border: 0 0% 20%;
  --accent: 217 91% 60%;
  --destructive: 0 84% 60%;
}

body {
  @apply bg-[hsl(var(--background))] text-[hsl(var(--foreground))] font-sans antialiased;
  min-width: 360px;
}
```

- [ ] **Step 6: Create placeholder icon files**

Run:
```bash
mkdir -p apps/extension/icons
# Generate simple placeholder SVG-based PNGs (will replace with real icons later)
for size in 16 32 48 128; do
  convert -size ${size}x${size} xc:'#3B82F6' -fill white -gravity center \
    -pointsize $((size/2)) -annotate 0 'R' apps/extension/icons/icon-${size}.png 2>/dev/null || \
  echo "placeholder" > apps/extension/icons/icon-${size}.png
done
```

- [ ] **Step 7: Install dependencies**

Run: `cd /Users/julianlaville/Desktop/remitance-buddy && pnpm install`

- [ ] **Step 8: Verify TypeScript compiles**

Run: `cd apps/extension && pnpm type-check`
Expected: No errors (no source files yet besides config)

- [ ] **Step 9: Commit**

```bash
git add apps/extension/
git commit -m "feat: scaffold Chrome extension app with Manifest V3 + Vite + CRXJS"
```

---

## Task 2: Scaffold Shared API Package

**Files:**
- Create: `packages/api/package.json`
- Create: `packages/api/tsconfig.json`
- Create: `packages/api/src/index.ts`
- Create: `packages/api/src/providers/types.ts`
- Create: `packages/api/src/system-prompt.ts`
- Create: `packages/api/src/tools/index.ts`

- [ ] **Step 1: Create package.json**

```json
{
  "name": "@remit/api",
  "version": "0.0.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "type-check": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "@remit/db": "workspace:*",
    "ai": "^6.0.141",
    "zod": "^3.24.1"
  },
  "devDependencies": {
    "@remit/typescript-config": "workspace:*",
    "typescript": "^5.7.2",
    "vitest": "^3.0.5"
  }
}
```

- [ ] **Step 2: Create tsconfig.json**

```json
{
  "extends": "@remit/typescript-config/base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

- [ ] **Step 3: Create provider types**

`packages/api/src/providers/types.ts`:
```typescript
export interface RateQuote {
  readonly provider: string;
  readonly sendAmount: number;
  readonly sendCurrency: string;
  readonly receiveAmount: number;
  readonly receiveCurrency: string;
  readonly exchangeRate: number;
  readonly fee: number;
  readonly totalCost: number;
  readonly deliveryTime: string;
  readonly paymentMethods: readonly string[];
  readonly affiliateUrl: string;
}

export interface ProviderConfig {
  readonly name: string;
  readonly slug: string;
  readonly apiBaseUrl: string;
  readonly supportedCorridors: readonly string[];
}

export interface CorridorInfo {
  readonly sendCountry: string;
  readonly receiveCountry: string;
  readonly providers: readonly string[];
  readonly maxAmountUsd: number;
  readonly documentsRequired: readonly string[];
  readonly restrictions: readonly string[];
}
```

- [ ] **Step 4: Create system prompt**

`packages/api/src/system-prompt.ts`:
```typescript
export function buildSystemPrompt(context: {
  readonly userName?: string;
  readonly kycStatus?: string;
}): string {
  return `You are Remittance Buddy, an AI concierge that helps people send money internationally.

You compare rates across providers (Wise, Remitly, MoneyGram, Western Union, OFX) to find the best deal for each transfer.

${context.userName ? `The user's name is ${context.userName}.` : ''}
${context.kycStatus ? `Their KYC status is: ${context.kycStatus}.` : ''}

Your capabilities:
- Compare exchange rates and fees across providers in real time
- Explain corridor-specific requirements (documents, limits, restricted countries)
- Look up saved recipients and transfer history
- Guide users to the best provider for their specific needs

Rules:
- Always show concrete numbers (rates, fees, total cost, delivery time)
- Never give financial advice — show data and let the user decide
- If a corridor is restricted or unavailable, explain why clearly
- Be concise and helpful — users want answers, not essays
- When comparing providers, sort by total cost (amount + fees) by default`;
}
```

- [ ] **Step 5: Create tool stubs**

`packages/api/src/tools/index.ts`:
```typescript
export { checkRatesTool } from './check-rates';
export { getRecipientsTool } from './get-recipients';
export { getTransferHistoryTool } from './get-transfer-history';
export { getCorridorInfoTool } from './get-corridor-info';
```

Create stub for `packages/api/src/tools/check-rates.ts`:
```typescript
import { tool } from 'ai';
import { z } from 'zod';
import type { RateQuote } from '../providers/types';

export const checkRatesTool = tool({
  description: 'Compare exchange rates and fees across remittance providers for a given corridor and amount',
  inputSchema: z.object({
    sendCurrency: z.string().length(3).describe('ISO 4217 currency code to send from (e.g. USD)'),
    receiveCurrency: z.string().length(3).describe('ISO 4217 currency code to receive (e.g. PHP)'),
    amount: z.number().positive().describe('Amount to send in sendCurrency'),
    paymentMethod: z.enum(['bank', 'card', 'cash']).optional().describe('Preferred payment method'),
  }),
  outputSchema: z.object({
    quotes: z.array(z.object({
      provider: z.string(),
      sendAmount: z.number(),
      sendCurrency: z.string(),
      receiveAmount: z.number(),
      receiveCurrency: z.string(),
      exchangeRate: z.number(),
      fee: z.number(),
      totalCost: z.number(),
      deliveryTime: z.string(),
      paymentMethods: z.array(z.string()),
      affiliateUrl: z.string(),
    })),
    cheapest: z.string(),
    fastest: z.string(),
  }),
  execute: async ({ sendCurrency, receiveCurrency, amount }) => {
    // TODO: Wire to real provider APIs in Phase 2
    // For now, return mock data so the chat UI works end-to-end
    const mockQuotes: RateQuote[] = [
      {
        provider: 'Wise',
        sendAmount: amount,
        sendCurrency,
        receiveAmount: amount * 58.32,
        receiveCurrency,
        exchangeRate: 58.32,
        fee: 4.50,
        totalCost: amount + 4.50,
        deliveryTime: 'Instant',
        paymentMethods: ['bank', 'card'],
        affiliateUrl: `https://wise.com/send?amount=${amount}&source=${sendCurrency}&target=${receiveCurrency}`,
      },
      {
        provider: 'Remitly',
        sendAmount: amount,
        sendCurrency,
        receiveAmount: amount * 57.98,
        receiveCurrency,
        exchangeRate: 57.98,
        fee: 3.99,
        totalCost: amount + 3.99,
        deliveryTime: '1-2 hours',
        paymentMethods: ['bank', 'card'],
        affiliateUrl: `https://remitly.com/send?amount=${amount}`,
      },
      {
        provider: 'Western Union',
        sendAmount: amount,
        sendCurrency,
        receiveAmount: amount * 56.80,
        receiveCurrency,
        exchangeRate: 56.80,
        fee: 7.99,
        totalCost: amount + 7.99,
        deliveryTime: 'Minutes (cash pickup)',
        paymentMethods: ['bank', 'card', 'cash'],
        affiliateUrl: `https://westernunion.com/send?amount=${amount}`,
      },
    ];

    const sorted = [...mockQuotes].sort((a, b) => a.totalCost - b.totalCost);
    const fastest = [...mockQuotes].sort((a, b) =>
      a.deliveryTime.includes('Instant') ? -1 : 1
    )[0];

    return {
      quotes: sorted,
      cheapest: sorted[0].provider,
      fastest: fastest.provider,
    };
  },
});
```

Create stub `packages/api/src/tools/get-recipients.ts`:
```typescript
import { tool } from 'ai';
import { z } from 'zod';

export const getRecipientsTool = tool({
  description: 'List saved recipients for the current user, optionally filtered by country',
  inputSchema: z.object({
    country: z.string().optional().describe('ISO country code to filter by'),
  }),
  // execute is injected at route level with DB access
});
```

Create stub `packages/api/src/tools/get-transfer-history.ts`:
```typescript
import { tool } from 'ai';
import { z } from 'zod';

export const getTransferHistoryTool = tool({
  description: 'Get recent transfer history for the current user',
  inputSchema: z.object({
    limit: z.number().min(1).max(20).optional().default(5).describe('Number of transfers to return'),
    status: z.enum(['quote', 'pending', 'processing', 'completed', 'failed', 'cancelled']).optional(),
  }),
  // execute is injected at route level with DB access
});
```

Create stub `packages/api/src/tools/get-corridor-info.ts`:
```typescript
import { tool } from 'ai';
import { z } from 'zod';

export const getCorridorInfoTool = tool({
  description: 'Get requirements and restrictions for sending money between two countries',
  inputSchema: z.object({
    sendCountry: z.string().length(2).describe('ISO 3166-1 alpha-2 send country'),
    receiveCountry: z.string().length(2).describe('ISO 3166-1 alpha-2 receive country'),
  }),
  execute: async ({ sendCountry, receiveCountry }) => {
    // TODO: Build corridor knowledge base in Phase 3
    return {
      sendCountry,
      receiveCountry,
      providers: ['Wise', 'Remitly', 'Western Union'],
      maxAmountUsd: 50000,
      documentsRequired: sendCountry === 'US'
        ? ['Government-issued ID', 'Proof of address (for transfers > $3,000)']
        : ['Government-issued ID'],
      restrictions: [],
      notes: `Standard corridor. Most major providers support ${sendCountry} → ${receiveCountry}.`,
    };
  },
});
```

- [ ] **Step 6: Create index.ts**

`packages/api/src/index.ts`:
```typescript
export { checkRatesTool, getRecipientsTool, getTransferHistoryTool, getCorridorInfoTool } from './tools';
export { buildSystemPrompt } from './system-prompt';
export type { RateQuote, ProviderConfig, CorridorInfo } from './providers/types';
```

- [ ] **Step 7: Install and verify**

Run:
```bash
cd /Users/julianlaville/Desktop/remitance-buddy && pnpm install
cd packages/api && pnpm type-check
```
Expected: No type errors

- [ ] **Step 8: Commit**

```bash
git add packages/api/
git commit -m "feat: scaffold shared API package with AI tools and provider types"
```

---

## Task 3: Build Extension Service Worker (Background)

**Files:**
- Create: `apps/extension/src/background/service-worker.ts`
- Create: `apps/extension/src/lib/storage.ts`
- Create: `apps/extension/src/lib/constants.ts`
- Create: `apps/extension/src/lib/auth.ts`
- Create: `apps/extension/src/lib/api-client.ts`

- [ ] **Step 1: Create constants**

`apps/extension/src/lib/constants.ts`:
```typescript
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'remit_auth_token',
  REFRESH_TOKEN: 'remit_refresh_token',
  USER_PROFILE: 'remit_user_profile',
  ONBOARDING_COMPLETE: 'remit_onboarding_complete',
} as const;
```

- [ ] **Step 2: Create storage helpers**

`apps/extension/src/lib/storage.ts`:
```typescript
import { STORAGE_KEYS } from './constants';

export async function getSessionValue<T>(key: string): Promise<T | null> {
  const result = await chrome.storage.session.get(key);
  return (result[key] as T) ?? null;
}

export async function setSessionValue<T>(key: string, value: T): Promise<void> {
  await chrome.storage.session.set({ [key]: value });
}

export async function getLocalValue<T>(key: string): Promise<T | null> {
  const result = await chrome.storage.local.get(key);
  return (result[key] as T) ?? null;
}

export async function setLocalValue<T>(key: string, value: T): Promise<void> {
  await chrome.storage.local.set({ [key]: value });
}

export async function clearAuth(): Promise<void> {
  await chrome.storage.session.remove(STORAGE_KEYS.AUTH_TOKEN);
  await chrome.storage.local.remove(STORAGE_KEYS.REFRESH_TOKEN);
  await chrome.storage.local.remove(STORAGE_KEYS.USER_PROFILE);
}
```

- [ ] **Step 3: Create auth module**

`apps/extension/src/lib/auth.ts`:
```typescript
import { API_BASE_URL, STORAGE_KEYS } from './constants';
import { getSessionValue, setSessionValue, getLocalValue, setLocalValue, clearAuth } from './storage';

interface AuthTokens {
  readonly accessToken: string;
  readonly refreshToken: string;
  readonly expiresAt: number;
}

interface UserProfile {
  readonly id: string;
  readonly email: string;
  readonly fullName: string | null;
}

export async function getAccessToken(): Promise<string | null> {
  const token = await getSessionValue<string>(STORAGE_KEYS.AUTH_TOKEN);
  if (token) return token;

  // Try silent refresh
  const refreshToken = await getLocalValue<string>(STORAGE_KEYS.REFRESH_TOKEN);
  if (!refreshToken) return null;

  try {
    const refreshed = await refreshAccessToken(refreshToken);
    await setSessionValue(STORAGE_KEYS.AUTH_TOKEN, refreshed.accessToken);
    await setLocalValue(STORAGE_KEYS.REFRESH_TOKEN, refreshed.refreshToken);
    return refreshed.accessToken;
  } catch {
    await clearAuth();
    return null;
  }
}

export async function handleAuthCallback(tokens: AuthTokens, profile: UserProfile): Promise<void> {
  await setSessionValue(STORAGE_KEYS.AUTH_TOKEN, tokens.accessToken);
  await setLocalValue(STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken);
  await setLocalValue(STORAGE_KEYS.USER_PROFILE, profile);
}

export async function isAuthenticated(): Promise<boolean> {
  const token = await getAccessToken();
  return token !== null;
}

export async function getUserProfile(): Promise<UserProfile | null> {
  return getLocalValue<UserProfile>(STORAGE_KEYS.USER_PROFILE);
}

async function refreshAccessToken(refreshToken: string): Promise<AuthTokens> {
  const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });

  if (!response.ok) throw new Error('Token refresh failed');
  return response.json() as Promise<AuthTokens>;
}

export function getOAuthUrl(): string {
  const redirectUrl = chrome.identity.getRedirectURL('callback');
  return `${API_BASE_URL}/sign-in?redirect_url=${encodeURIComponent(redirectUrl)}&source=extension`;
}

export { clearAuth };
```

- [ ] **Step 4: Create API client**

`apps/extension/src/lib/api-client.ts`:
```typescript
import { API_BASE_URL } from './constants';
import { getAccessToken } from './auth';

interface ApiOptions {
  readonly method?: string;
  readonly body?: unknown;
  readonly headers?: Record<string, string>;
}

export async function apiClient<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const token = await getAccessToken();

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...(options.body ? { body: JSON.stringify(options.body) } : {}),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error((error as { message: string }).message);
  }

  return response.json() as Promise<T>;
}
```

- [ ] **Step 5: Create service worker**

`apps/extension/src/background/service-worker.ts`:
```typescript
import { isAuthenticated } from '../lib/auth';

// Open side panel when extension icon is clicked (while holding Alt/Option)
// Default click opens the popup
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: false });

// Listen for messages from popup/sidepanel
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'OPEN_SIDE_PANEL') {
    chrome.sidePanel.open({ windowId: message.windowId }).then(() => {
      sendResponse({ success: true });
    });
    return true; // async response
  }

  if (message.type === 'CHECK_AUTH') {
    isAuthenticated().then((authenticated) => {
      sendResponse({ authenticated });
    });
    return true;
  }

  if (message.type === 'AUTH_CALLBACK') {
    // Handle OAuth callback from web app
    import('../lib/auth').then(({ handleAuthCallback }) => {
      handleAuthCallback(message.tokens, message.profile).then(() => {
        sendResponse({ success: true });
      });
    });
    return true;
  }
});

// Set up rate check alarm (every 30 minutes for cached rates)
chrome.alarms.create('refresh-rates', { periodInMinutes: 30 });

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'refresh-rates') {
    // TODO: Refresh cached rates for user's default corridor
    console.log('[RemitBuddy] Rate refresh alarm fired');
  }
});
```

- [ ] **Step 6: Verify types compile**

Run: `cd /Users/julianlaville/Desktop/remitance-buddy/apps/extension && pnpm type-check`
Expected: No errors

- [ ] **Step 7: Commit**

```bash
git add apps/extension/src/background/ apps/extension/src/lib/
git commit -m "feat: extension service worker with auth, storage, and API client"
```

---

## Task 4: Build Side Panel Chat UI

**Files:**
- Create: `apps/extension/src/sidepanel/index.html`
- Create: `apps/extension/src/sidepanel/main.tsx`
- Create: `apps/extension/src/sidepanel/App.tsx`
- Create: `apps/extension/src/sidepanel/ChatView.tsx`
- Create: `apps/extension/src/sidepanel/OnboardingView.tsx`
- Create: `apps/extension/src/components/RateCard.tsx`
- Create: `apps/extension/src/components/LoadingDots.tsx`
- Create: `apps/extension/src/components/ui/button.tsx`
- Create: `apps/extension/src/components/ui/input.tsx`

- [ ] **Step 1: Create side panel HTML entry**

`apps/extension/src/sidepanel/index.html`:
```html
<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Remittance Buddy</title>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="./main.tsx"></script>
</body>
</html>
```

- [ ] **Step 2: Create React mount**

`apps/extension/src/sidepanel/main.tsx`:
```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import '../styles/globals.css';

const root = document.getElementById('root');
if (root) {
  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}
```

- [ ] **Step 3: Create UI primitives**

`apps/extension/src/components/ui/button.tsx`:
```tsx
import { type ButtonHTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  readonly variant?: 'primary' | 'secondary' | 'ghost';
  readonly size?: 'sm' | 'md' | 'lg';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => (
    <button
      ref={ref}
      className={clsx(
        'inline-flex items-center justify-center rounded-lg font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]',
        'disabled:pointer-events-none disabled:opacity-50',
        {
          'bg-[hsl(var(--accent))] text-white hover:bg-[hsl(var(--accent))]/90': variant === 'primary',
          'bg-[hsl(var(--muted))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))]/80': variant === 'secondary',
          'hover:bg-[hsl(var(--muted))]': variant === 'ghost',
        },
        {
          'h-8 px-3 text-sm': size === 'sm',
          'h-10 px-4 text-sm': size === 'md',
          'h-12 px-6 text-base': size === 'lg',
        },
        className
      )}
      {...props}
    />
  )
);
Button.displayName = 'Button';
```

`apps/extension/src/components/ui/input.tsx`:
```tsx
import { type InputHTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={clsx(
        'flex h-10 w-full rounded-lg border border-[hsl(var(--border))]',
        'bg-transparent px-3 py-2 text-sm',
        'placeholder:text-[hsl(var(--muted-foreground))]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    />
  )
);
Input.displayName = 'Input';
```

- [ ] **Step 4: Create LoadingDots component**

`apps/extension/src/components/LoadingDots.tsx`:
```tsx
export function LoadingDots() {
  return (
    <div className="flex items-center gap-1 px-3 py-2">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="h-2 w-2 rounded-full bg-[hsl(var(--muted-foreground))] animate-bounce"
          style={{ animationDelay: `${i * 150}ms` }}
        />
      ))}
    </div>
  );
}
```

- [ ] **Step 5: Create RateCard component**

`apps/extension/src/components/RateCard.tsx`:
```tsx
import { ExternalLink } from 'lucide-react';

interface RateCardProps {
  readonly provider: string;
  readonly receiveAmount: number;
  readonly receiveCurrency: string;
  readonly exchangeRate: number;
  readonly fee: number;
  readonly deliveryTime: string;
  readonly affiliateUrl: string;
  readonly isCheapest?: boolean;
  readonly isFastest?: boolean;
}

export function RateCard({
  provider,
  receiveAmount,
  receiveCurrency,
  exchangeRate,
  fee,
  deliveryTime,
  affiliateUrl,
  isCheapest,
  isFastest,
}: RateCardProps) {
  return (
    <div className="rounded-lg border border-[hsl(var(--border))] p-3 hover:border-[hsl(var(--accent))]/50 transition-colors">
      <div className="flex items-center justify-between mb-2">
        <span className="font-medium">{provider}</span>
        <div className="flex gap-1">
          {isCheapest && (
            <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">Cheapest</span>
          )}
          {isFastest && (
            <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">Fastest</span>
          )}
        </div>
      </div>
      <div className="text-lg font-mono font-semibold">
        {receiveAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })} {receiveCurrency}
      </div>
      <div className="flex items-center justify-between mt-1 text-xs text-[hsl(var(--muted-foreground))]">
        <span>Rate: {exchangeRate} | Fee: ${fee.toFixed(2)}</span>
        <span>{deliveryTime}</span>
      </div>
      <a
        href={affiliateUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 flex items-center justify-center gap-1 w-full h-8 rounded-md bg-[hsl(var(--accent))] text-white text-sm font-medium hover:bg-[hsl(var(--accent))]/90 transition-colors"
      >
        Send with {provider} <ExternalLink className="h-3 w-3" />
      </a>
    </div>
  );
}
```

- [ ] **Step 6: Create ChatView**

`apps/extension/src/sidepanel/ChatView.tsx`:
```tsx
import { useRef, useEffect, useState } from 'react';
import { useChat, type UIMessage } from '@ai-sdk/react';
import { DefaultChatTransport } from '@ai-sdk/react';
import { Send } from 'lucide-react';
import { Button } from '../components/ui/button';
import { RateCard } from '../components/RateCard';
import { LoadingDots } from '../components/LoadingDots';
import { API_BASE_URL } from '../lib/constants';
import { getAccessToken } from '../lib/auth';

export function ChatView() {
  const [inputValue, setInputValue] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const { messages, status, sendMessage } = useChat({
    transport: new DefaultChatTransport({
      api: `${API_BASE_URL}/api/chat`,
      headers: async () => {
        const token = await getAccessToken();
        return token ? { Authorization: `Bearer ${token}` } : {};
      },
    }),
  });

  const isLoading = status === 'streaming' || status === 'submitted';

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  function handleSubmit() {
    const text = inputValue.trim();
    if (!text || isLoading) return;
    setInputValue('');
    sendMessage({ text });
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[hsl(var(--border))]">
        <h1 className="text-sm font-semibold">Remittance Buddy</h1>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-[hsl(var(--muted-foreground))] mt-8">
            <p className="text-lg font-medium mb-2">Hey! Where are you sending money?</p>
            <p className="text-sm">I'll find you the best rate across all providers.</p>
          </div>
        )}
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        {isLoading && messages.at(-1)?.role !== 'assistant' && <LoadingDots />}
      </div>

      {/* Input */}
      <div className="border-t border-[hsl(var(--border))] p-3">
        <div className="flex gap-2">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            placeholder="Send $500 to the Philippines..."
            className="flex-1 resize-none rounded-lg border border-[hsl(var(--border))] bg-transparent px-3 py-2 text-sm placeholder:text-[hsl(var(--muted-foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] min-h-[40px] max-h-[120px]"
            rows={1}
          />
          <Button onClick={handleSubmit} disabled={isLoading || !inputValue.trim()} size="sm">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ message }: { readonly message: UIMessage }) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
          isUser
            ? 'bg-[hsl(var(--accent))] text-white'
            : 'bg-[hsl(var(--muted))]'
        }`}
      >
        {message.parts.map((part, i) => {
          if (part.type === 'text') {
            return <p key={i} className="whitespace-pre-wrap">{part.text}</p>;
          }
          if (part.type === 'tool-checkRates') {
            if (part.state === 'result') {
              const result = part.output as {
                quotes: Array<{
                  provider: string;
                  receiveAmount: number;
                  receiveCurrency: string;
                  exchangeRate: number;
                  fee: number;
                  deliveryTime: string;
                  affiliateUrl: string;
                }>;
                cheapest: string;
                fastest: string;
              };
              return (
                <div key={i} className="space-y-2 mt-2">
                  {result.quotes.map((quote) => (
                    <RateCard
                      key={quote.provider}
                      {...quote}
                      isCheapest={quote.provider === result.cheapest}
                      isFastest={quote.provider === result.fastest}
                    />
                  ))}
                </div>
              );
            }
            return <LoadingDots key={i} />;
          }
          // Handle other tool calls generically
          if (part.type.startsWith('tool-') && 'state' in part) {
            if (part.state === 'call') {
              const toolName = part.type.replace('tool-', '');
              return (
                <div key={i} className="text-xs text-[hsl(var(--muted-foreground))] italic">
                  Looking up {toolName.replace(/([A-Z])/g, ' $1').toLowerCase()}...
                </div>
              );
            }
          }
          return null;
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 7: Create OnboardingView**

`apps/extension/src/sidepanel/OnboardingView.tsx`:
```tsx
import { Button } from '../components/ui/button';
import { getOAuthUrl } from '../lib/auth';

export function OnboardingView() {
  function handleSignIn() {
    chrome.tabs.create({ url: getOAuthUrl() });
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen px-6 text-center">
      <div className="text-4xl mb-4">💸</div>
      <h1 className="text-xl font-semibold mb-2">Remittance Buddy</h1>
      <p className="text-[hsl(var(--muted-foreground))] text-sm mb-6 max-w-[280px]">
        Compare rates across Wise, Remitly, Western Union and more. Find the cheapest way to send money home.
      </p>
      <Button onClick={handleSignIn} size="lg" className="w-full max-w-[280px]">
        Sign in to get started
      </Button>
      <p className="text-xs text-[hsl(var(--muted-foreground))] mt-4">
        Free to use. We earn a small commission from providers.
      </p>
    </div>
  );
}
```

- [ ] **Step 8: Create side panel App**

`apps/extension/src/sidepanel/App.tsx`:
```tsx
import { useState, useEffect } from 'react';
import { ChatView } from './ChatView';
import { OnboardingView } from './OnboardingView';
import { isAuthenticated } from '../lib/auth';

export function App() {
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    isAuthenticated().then(setAuthed);

    // Listen for auth state changes
    const listener = (message: { type: string }) => {
      if (message.type === 'AUTH_STATE_CHANGED') {
        isAuthenticated().then(setAuthed);
      }
    };
    chrome.runtime.onMessage.addListener(listener);
    return () => chrome.runtime.onMessage.removeListener(listener);
  }, []);

  if (authed === null) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="h-6 w-6 border-2 border-[hsl(var(--accent))] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return authed ? <ChatView /> : <OnboardingView />;
}
```

- [ ] **Step 9: Verify types compile**

Run: `cd /Users/julianlaville/Desktop/remitance-buddy/apps/extension && pnpm type-check`

- [ ] **Step 10: Commit**

```bash
git add apps/extension/src/sidepanel/ apps/extension/src/components/
git commit -m "feat: side panel with AI chat, rate cards, and onboarding flow"
```

---

## Task 5: Build Popup UI

**Files:**
- Create: `apps/extension/src/popup/index.html`
- Create: `apps/extension/src/popup/main.tsx`
- Create: `apps/extension/src/popup/App.tsx`
- Create: `apps/extension/src/components/CurrencySelect.tsx`
- Create: `apps/extension/src/components/TransferItem.tsx`

- [ ] **Step 1: Create popup HTML entry**

`apps/extension/src/popup/index.html`:
```html
<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Remittance Buddy</title>
</head>
<body>
  <div id="root" style="width: 400px; height: 500px;"></div>
  <script type="module" src="./main.tsx"></script>
</body>
</html>
```

- [ ] **Step 2: Create React mount**

`apps/extension/src/popup/main.tsx`:
```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import '../styles/globals.css';

const root = document.getElementById('root');
if (root) {
  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}
```

- [ ] **Step 3: Create CurrencySelect**

`apps/extension/src/components/CurrencySelect.tsx`:
```tsx
import { type SelectHTMLAttributes } from 'react';
import { clsx } from 'clsx';

const COMMON_CURRENCIES = [
  { code: 'USD', name: 'US Dollar', flag: '🇺🇸' },
  { code: 'EUR', name: 'Euro', flag: '🇪🇺' },
  { code: 'GBP', name: 'British Pound', flag: '🇬🇧' },
  { code: 'CAD', name: 'Canadian Dollar', flag: '🇨🇦' },
  { code: 'AUD', name: 'Australian Dollar', flag: '🇦🇺' },
  { code: 'PHP', name: 'Philippine Peso', flag: '🇵🇭' },
  { code: 'INR', name: 'Indian Rupee', flag: '🇮🇳' },
  { code: 'MXN', name: 'Mexican Peso', flag: '🇲🇽' },
  { code: 'NGN', name: 'Nigerian Naira', flag: '🇳🇬' },
  { code: 'PKR', name: 'Pakistani Rupee', flag: '🇵🇰' },
  { code: 'BDT', name: 'Bangladeshi Taka', flag: '🇧🇩' },
  { code: 'VND', name: 'Vietnamese Dong', flag: '🇻🇳' },
  { code: 'BRL', name: 'Brazilian Real', flag: '🇧🇷' },
  { code: 'KES', name: 'Kenyan Shilling', flag: '🇰🇪' },
  { code: 'GHS', name: 'Ghanaian Cedi', flag: '🇬🇭' },
] as const;

interface CurrencySelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  readonly label: string;
}

export function CurrencySelect({ label, className, ...props }: CurrencySelectProps) {
  return (
    <div>
      <label className="text-xs text-[hsl(var(--muted-foreground))] mb-1 block">{label}</label>
      <select
        className={clsx(
          'w-full h-10 rounded-lg border border-[hsl(var(--border))] bg-transparent px-3 text-sm',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]',
          className
        )}
        {...props}
      >
        {COMMON_CURRENCIES.map((c) => (
          <option key={c.code} value={c.code}>
            {c.flag} {c.code} — {c.name}
          </option>
        ))}
      </select>
    </div>
  );
}
```

- [ ] **Step 4: Create TransferItem**

`apps/extension/src/components/TransferItem.tsx`:
```tsx
import { CheckCircle, Clock, XCircle } from 'lucide-react';

interface TransferItemProps {
  readonly amount: number;
  readonly currency: string;
  readonly receiveCurrency: string;
  readonly status: string;
  readonly date: string;
}

const STATUS_CONFIG = {
  completed: { icon: CheckCircle, color: 'text-green-400', label: 'Done' },
  pending: { icon: Clock, color: 'text-yellow-400', label: 'Pending' },
  processing: { icon: Clock, color: 'text-blue-400', label: 'Processing' },
  failed: { icon: XCircle, color: 'text-red-400', label: 'Failed' },
} as const;

export function TransferItem({ amount, currency, receiveCurrency, status, date }: TransferItemProps) {
  const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.pending;
  const Icon = config.icon;

  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-2">
        <Icon className={`h-4 w-4 ${config.color}`} />
        <div>
          <div className="text-sm font-medium">
            ${amount.toLocaleString()} {currency} → {receiveCurrency}
          </div>
          <div className="text-xs text-[hsl(var(--muted-foreground))]">{date}</div>
        </div>
      </div>
      <span className={`text-xs ${config.color}`}>{config.label}</span>
    </div>
  );
}
```

- [ ] **Step 5: Create popup App**

`apps/extension/src/popup/App.tsx`:
```tsx
import { useState } from 'react';
import { ArrowRight, MessageSquare } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { CurrencySelect } from '../components/CurrencySelect';
import { RateCard } from '../components/RateCard';
import { TransferItem } from '../components/TransferItem';

interface Quote {
  readonly provider: string;
  readonly receiveAmount: number;
  readonly receiveCurrency: string;
  readonly exchangeRate: number;
  readonly fee: number;
  readonly deliveryTime: string;
  readonly affiliateUrl: string;
}

export function App() {
  const [sendCurrency, setSendCurrency] = useState('USD');
  const [receiveCurrency, setReceiveCurrency] = useState('PHP');
  const [amount, setAmount] = useState('500');
  const [quotes, setQuotes] = useState<readonly Quote[]>([]);
  const [loading, setLoading] = useState(false);

  async function handleCheck() {
    setLoading(true);
    try {
      // TODO: Call real API in Phase 2
      // For now, mock data
      setQuotes([
        {
          provider: 'Wise',
          receiveAmount: Number(amount) * 58.32,
          receiveCurrency,
          exchangeRate: 58.32,
          fee: 4.50,
          deliveryTime: 'Instant',
          affiliateUrl: '#',
        },
        {
          provider: 'Remitly',
          receiveAmount: Number(amount) * 57.98,
          receiveCurrency,
          exchangeRate: 57.98,
          fee: 3.99,
          deliveryTime: '1-2 hours',
          affiliateUrl: '#',
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function openSidePanel() {
    chrome.windows.getCurrent((window) => {
      if (window.id) {
        chrome.runtime.sendMessage({ type: 'OPEN_SIDE_PANEL', windowId: window.id });
      }
    });
  }

  return (
    <div className="flex flex-col h-full p-4">
      {/* Rate Check */}
      <h2 className="text-sm font-semibold mb-3">Quick Rate Check</h2>
      <div className="space-y-2 mb-3">
        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <CurrencySelect label="Send" value={sendCurrency} onChange={(e) => setSendCurrency(e.target.value)} />
          </div>
          <ArrowRight className="h-4 w-4 mb-2.5 text-[hsl(var(--muted-foreground))] shrink-0" />
          <div className="flex-1">
            <CurrencySelect label="Receive" value={receiveCurrency} onChange={(e) => setReceiveCurrency(e.target.value)} />
          </div>
        </div>
        <div className="flex gap-2">
          <Input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Amount"
            min="1"
          />
          <Button onClick={handleCheck} disabled={loading || !amount}>
            {loading ? '...' : 'Compare'}
          </Button>
        </div>
      </div>

      {/* Quotes */}
      {quotes.length > 0 && (
        <div className="space-y-2 mb-4 max-h-[200px] overflow-y-auto">
          {quotes.map((quote) => (
            <RateCard
              key={quote.provider}
              {...quote}
              isCheapest={quote.provider === quotes[0].provider}
            />
          ))}
        </div>
      )}

      {/* Divider */}
      <div className="border-t border-[hsl(var(--border))] my-3" />

      {/* Recent Transfers */}
      <h2 className="text-sm font-semibold mb-2">Recent Transfers</h2>
      <div className="flex-1 overflow-y-auto">
        <TransferItem amount={200} currency="USD" receiveCurrency="PHP" status="completed" date="Mar 28" />
        <TransferItem amount={500} currency="USD" receiveCurrency="INR" status="pending" date="Mar 30" />
      </div>

      {/* Open Chat */}
      <Button variant="secondary" onClick={openSidePanel} className="w-full mt-3">
        <MessageSquare className="h-4 w-4 mr-2" />
        Open AI Chat
      </Button>
    </div>
  );
}
```

- [ ] **Step 6: Verify types compile**

Run: `cd /Users/julianlaville/Desktop/remitance-buddy/apps/extension && pnpm type-check`

- [ ] **Step 7: Commit**

```bash
git add apps/extension/src/popup/ apps/extension/src/components/CurrencySelect.tsx apps/extension/src/components/TransferItem.tsx
git commit -m "feat: popup with quick rate check, transfer history, and chat launcher"
```

---

## Task 6: Build and Load Extension in Chrome

- [ ] **Step 1: Build the extension**

Run:
```bash
cd /Users/julianlaville/Desktop/remitance-buddy && pnpm install
cd apps/extension && pnpm build
```
Expected: Vite outputs to `apps/extension/dist/` with manifest.json, JS bundles, HTML files

- [ ] **Step 2: Fix any build errors**

If CRXJS has issues, check:
- manifest.json paths are correct
- Vite config input paths match HTML files
- All imports resolve

- [ ] **Step 3: Load unpacked in Chrome**

Manual step for the user:
1. Open Chrome → `chrome://extensions`
2. Enable "Developer mode" (top right)
3. Click "Load unpacked"
4. Select `apps/extension/dist/`
5. Extension icon should appear in toolbar

- [ ] **Step 4: Verify popup opens**

Click extension icon → popup should render with rate check form

- [ ] **Step 5: Verify side panel opens**

Click "Open AI Chat" in popup → side panel should open with onboarding or chat view

- [ ] **Step 6: Test dev mode**

Run: `cd apps/extension && pnpm dev`
Expected: Vite dev server with HMR for the extension

- [ ] **Step 7: Commit any build fixes**

```bash
git add -A apps/extension/
git commit -m "fix: extension build configuration and dev mode"
```

---

## Task 7: Wire Chat to Existing API

**Files:**
- Modify: `apps/web/src/app/api/chat/route.ts` — add CORS headers for extension origin

- [ ] **Step 1: Add CORS support for extension**

The extension needs to call the web app's `/api/chat` endpoint. Add CORS headers.

Read `apps/web/src/app/api/chat/route.ts` first, then add an OPTIONS handler and CORS headers to the POST response:

Add at the top of the file:
```typescript
const ALLOWED_ORIGINS = [
  'chrome-extension://', // Chrome extension
];

function getCorsHeaders(origin: string | null): Record<string, string> {
  const isAllowed = origin && ALLOWED_ORIGINS.some((allowed) => origin.startsWith(allowed));
  if (!isAllowed) return {};
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}
```

Add OPTIONS handler:
```typescript
export async function OPTIONS(request: Request) {
  const origin = request.headers.get('origin');
  return new Response(null, { status: 204, headers: getCorsHeaders(origin) });
}
```

Add CORS headers to the POST response (wrap the return):
```typescript
// In POST handler, before returning:
const corsHeaders = getCorsHeaders(request.headers.get('origin'));
// Pass corsHeaders into toUIMessageStreamResponse or create a new Response with headers
```

- [ ] **Step 2: Test chat from extension side panel**

1. Start web app: `cd apps/web && pnpm dev`
2. Load extension in Chrome
3. Open side panel
4. Type a message — should stream through to the AI

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/app/api/chat/route.ts
git commit -m "feat: add CORS support for Chrome extension origin"
```

---

## Task 8: End-to-End Smoke Test

- [ ] **Step 1: Start the web app**

Run: `cd /Users/julianlaville/Desktop/remitance-buddy/apps/web && pnpm dev`

- [ ] **Step 2: Build and load the extension**

Run: `cd /Users/julianlaville/Desktop/remitance-buddy/apps/extension && pnpm build`
Load unpacked in Chrome from `dist/`

- [ ] **Step 3: Test popup flow**
- Click extension icon
- Select USD → PHP, enter $500
- Click Compare
- Verify mock rate cards appear

- [ ] **Step 4: Test side panel flow**
- Click "Open AI Chat" in popup
- Verify side panel opens
- Type "Compare rates for sending $500 to the Philippines"
- Verify AI responds with rate comparison cards

- [ ] **Step 5: Test auth flow (if Clerk is configured)**
- Side panel should show onboarding/sign-in if not authenticated
- After sign-in, should show chat view

- [ ] **Step 6: Document any issues found**

Create a list of issues/TODOs for Phase 2

- [ ] **Step 7: Final commit**

```bash
git add -A
git commit -m "feat: Chrome extension Phase 1 complete — chat, popup, rate comparison"
```

---

## Phase 2 Preview (Next Plan)

After Phase 1 is working and interactive:

1. Wire `checkRates` tool to real Wise API (already have `apps/web/src/lib/wise.ts`)
2. Add Remitly and MoneyGram API integrations
3. Build the rate cache (Neon Postgres table + Drizzle migration)
4. Implement real OAuth flow with Clerk
5. Add affiliate URL tracking
6. Polish UI (loading states, error handling, empty states)
