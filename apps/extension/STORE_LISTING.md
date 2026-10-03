# My Remittance Pal — draft Chrome Web Store listing

Version 0.3.0 is an unpublished review build. Do not submit until the matching
comparison API and privacy page are deployed, commercial data-display permission
is confirmed, the extension has been loaded in Chrome, and the tests/checklist below pass.

## Description
Compare reference amounts and fees for sending to the Philippines. Enter a total
send budget, choose a sending country, and inspect source collection times.
Rankings use recipient PHP amounts in the available source set. Confirm the final
rate, fee, payment method, payout availability and delivery with the provider.

The source is Wise comparison data, which may include previously collected
provider prices. Coverage varies by corridor. This is not every provider, a live
executable offer, a guaranteed saving, or a payout-specific quote. No estimated
provider prices are substituted when data is unavailable.

The popup and side panel need no account. Pal does not move money. Provider links
are ordinary public links; no affiliate approval or commission is claimed.

## Permissions
- storage: save corridor and payout preferences locally
- sidePanel: expanded comparison UI
- https://remitance-buddy.vercel.app/*: retrieve the public comparison API

No wildcard website access, notifications, alarms, background polling or click
uploads. Legacy account/chat components remain in source but are not entry points.

## Privacy and data handling
The extension sends amount, currencies, corridor and payout preference to the
comparison API. Hosting infrastructure can receive connection metadata. Server
error reporting may include request metadata and quote parameters. Do not answer
“no data collection” on a store form without assessing Google's current definitions
and these server practices. Provider sites have their own policies.

Privacy URL for review: https://remitance-buddy.vercel.app/extension-privacy
Homepage: https://remitance-buddy.vercel.app/
The live pages may differ until this branch is approved and deployed.

## Package
From repository root: pnpm --filter @remit/extension build
Package the contents of apps/extension/dist, not the source manifest.

## Release gates
- [ ] Commercial permission for comparison API display/caching and branding confirmed
- [ ] Matching backend and policy deployed with original source timestamps
- [ ] Chrome load-unpacked test, popup and side panel verified
- [ ] Default corridor and payout persist after closing and reopening
- [ ] Empty, offline, invalid, rapid-input and stale-source cases tested
- [ ] Provider handoffs use reviewed URLs, no unauthorized affiliate parameters
- [ ] Store data-use answers reflect actual hosting/error-reporting behavior
- [ ] Accurate screenshots captured from final production build
- [ ] Support channel and brand/domain ownership confirmed
- [ ] User approves publication and any store agreement or fee
