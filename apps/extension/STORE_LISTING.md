# Chrome Web Store Listing — Remittance Buddy

Use this file as the submission source of truth. Copy each block into the
Chrome Web Store Developer Dashboard when publishing.

## Store name
Remittance Buddy — Smart money transfer comparison

## Short description (132 chars max)
Compare live rates from every major remittance provider in real time. Save $23+ per transfer to the Philippines.

## Category
Productivity

## Language
English

## Detailed description

**Stop guessing which transfer service is cheapest. Start knowing.**

Remittance Buddy is a decision engine for international money transfers. We compare every major provider in real time — Wise, Remitly, Xoom, MoneyGram, Western Union, WorldRemit and more — and tell you which route saves your family the most, in plain language, with the math shown.

**How it works**
1. Click the extension icon, enter the amount you want to send
2. We fetch live rates from every provider on the spot
3. See the ranked results with fees, exchange rates, and recipient amounts
4. Pick the winner — we explain why it won

**Why we built this**
Most comparison sites hand you a spreadsheet and leave. We rank the options for your exact amount and corridor, pick a winner, and explain why it won in one sentence. You leave knowing what to do.

**Built for the Philippines corridor first**
GCash is the #1 delivery method for remittances to the Philippines. Most comparison sites rank providers using global averages and get it wrong for PH. We tuned our ranking for the corridors real senders actually use:

- US → Philippines
- UK → Philippines
- Singapore → Philippines
- UAE → Philippines
- Saudi Arabia → Philippines

**What makes us different**
- Live rates refreshed every 60 seconds — not cached from last week
- Honest fee breakdown — we show the provider fee, the FX spread, and what actually arrives
- Corridor-native scoring — tuned for real payout methods (GCash, Maya, bank, cash pickup)
- Zero tracking — no accounts, no emails, no data collection

**Privacy**
We collect nothing about you personally. No name, no email, no browsing history, no tracking. The only thing stored locally is your default corridor and payout preference. Full policy: https://remittancebuddy.com/extension-privacy

**Questions or feedback?**
Email hello@remittancebuddy.com or visit remittancebuddy.com

---

## Screenshots needed (1280x800 or 640x400)
1. Popup showing live quote comparison with winner highlighted
2. Side panel with full provider ranking + explanations
3. Options page with preference settings
4. Close-up of the "You save $X" pill and fee breakdown
5. Corridor selector showing PH + other supported destinations

## Promotional images
- Small tile: 440x280
- Large tile: 920x680
- Marquee: 1400x560

## Support email
support@remittancebuddy.com

## Privacy policy URL
https://remittancebuddy.com/extension-privacy
(Or the current Vercel URL: https://remitance-buddy-ey2a2pix9-jujulaville8-droids-projects.vercel.app/extension-privacy)

## Homepage URL
https://remittancebuddy.com

## Permissions justification (for review)

**storage** — Required to save the user's default corridor and payout method between sessions via chrome.storage.local. All data stays on the user's device.

**sidePanel** — Required to render the full comparison experience in Chrome's side panel when the user clicks the extension icon. This is the primary UI surface for the extension.

**alarms** — Required to schedule background rate refreshes so the cached quote in the popup doesn't go stale while the user is browsing.

**notifications** — Required to deliver rate alerts the user opts into (future feature — users can disable alerts entirely from the options page).

**host_permissions (Vercel URLs)** — Required to call our public rate comparison API, which fetches and aggregates provider quotes server-side. No third-party domains are contacted directly from the extension.

## Data use disclosure (Chrome Web Store form)
- **Personally identifiable information**: No
- **Health information**: No
- **Financial and payment information**: No — we only accept a USD amount the user types; no card, bank, or account details
- **Authentication information**: No
- **Personal communications**: No
- **Location**: No
- **Web history**: No
- **User activity**: No (we do not track clicks, form data, or page views)
- **Website content**: No

We certify that:
- We do not sell user data to third parties
- We do not use or transfer user data for purposes unrelated to our item's single purpose
- We do not use or transfer user data to determine creditworthiness or for lending purposes

## Single purpose
The single purpose of this extension is to compare live money transfer rates across multiple providers and help users pick the cheapest and fastest option for sending money internationally.

## Version history

### 0.2.0 (April 2026)
- Add options page for default corridor / payout / API URL override
- Switch to production API hosted on Vercel
- Add rate alerts notification scaffold
- Update store listing and privacy disclosures for submission

### 0.1.0 (April 2026)
- Initial popup with live rate comparison
- Side panel with full ranking and explanations
- Local scoring engine fallback when API is unreachable

## Build + package checklist
Before uploading the ZIP to the Web Store:

```bash
cd apps/extension
pnpm build
cd dist
zip -r ../remittance-buddy-v0.2.0.zip .
```

- [ ] manifest.json version bumped
- [ ] Privacy policy live at /extension-privacy
- [ ] API URL points to production Vercel
- [ ] All 4 icon sizes present (16, 32, 48, 128)
- [ ] Screenshots captured (5 images, 1280x800)
- [ ] Store description + short description ready
- [ ] Permissions justification written
- [ ] Data use disclosure answered
