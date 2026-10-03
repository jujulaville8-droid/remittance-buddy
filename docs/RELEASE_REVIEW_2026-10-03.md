# Comparison-only launch repair — 3 October 2026

## Scope

This revision prepares an honest reference-comparison website and Chrome extension
for review. It does not establish affiliate approval, a money-transfer partnership,
a regulated service, or Chrome Web Store publication.

## Changed

- Public comparison without account-service dependency
- Removed unsupported customers, savings, reviews and guarantees; original-source times shown
- Wise comparison prices retain their collection timestamps; send budget includes the listed fee
- No synthetic provider-price fallback; missing payout/funding verification and old data are disclosed
- Default ranking uses reference PHP received; unknown provider links are inactive
- Extension v0.3.0 shares popup/panel flow, narrower exact-host permissions, no background click uploads
- Temporary session amount and persistent preferences support repeat/panel use
- Transfer/payment/KYC and paid-plan endpoints default off; legacy code is retained
- Sentry source-map upload and build telemetry disabled
- Corrected CI, declared missing build/type dependencies, added regression tests
- Self-hosted existing fonts replace build-time Google Fonts downloads
- Scheduled background jobs are not enabled for this launch; retained cron routes require a secret

## Initial repair checks

- 150 web tests + 4 API aggregation tests passed
- All four workspace type-check tasks passed
- Web and extension production builds passed
- Web ESLint passed with four existing image-optimization warnings
- Extension compiled bundle contains no Supabase/auth or affiliate-click uploader
- Actual Chrome installation, layout, keyboard behavior and popup/panel interaction remain pending
- Public preview and production smoke tests are required after deployment

## Safe launch configuration

ENABLE_TRANSFER_EXECUTION and ENABLE_PAID_PLANS require the exact value `true` to
enable their respective legacy paths. Leave both unset or false for comparison-only
launch. They are not a substitute for commercial/legal and sandbox lifecycle review.

The extension normally calls https://remitance-buddy.vercel.app. A test package can
be built with EXTENSION_API_ORIGIN set to one verified HTTPS Vercel preview origin.
That origin is compiled into the runtime and the sole manifest host permission.
There is no arbitrary runtime destination override.

## Chrome test checklist

Use a dedicated test profile and load the generated dist directory unpacked only
with the tester's approval. Confirm storage + sidePanel and the exact API host.
Test popup, Full panel, settings, route/payout changes, amount persistence,
invalid/empty/rapid input, request failure, old/unknown source timestamps, and
provider links. Confirm API responses come from the matching deployment.
Do not create accounts, submit recipient data, pay or initiate transfers for these tests.

## Remaining release decisions

- Complete installed-Chrome testing before extension distribution
- Confirm data-display/cache/branding permissions and any affiliate acceptance
- Confirm operator identity and private support/privacy contact details before commercial launch
- Review retained account/data-rights workflows and legal pages before collecting customer data
- Rotate the previously published test credential with the account owner; removing it here does not erase history
- Review legacy paid-plan entitlement logic before ever enabling paid plans
- Complete the selected Concept A visual review before publishing the redesign

## Selected Concept A implementation

The local redesign follows the selected Clear Canvas image: cool-white canvas,
navy text, restrained blue actions, a separate original coastal illustration,
native comparison controls, and equal-weight reference cards. Existing My
Remittance Pal branding and the landing/compare defaults are retained.

- Shared landing and comparison surface preserves original collection time,
  fee-inclusive budgets, payout uncertainty, and ordinary allowlisted links
- Same-query refreshes keep prior values with an explicit refreshing notice;
  changed route, amount or payout never inherits another query's results
- Extension popup, side panel and options share the selected blue-canvas style;
  the Full panel action remains in the header
- Narrow extension panels wrap the recipient amount rather than clipping it
- Public landing, comparison and extension pages omit the legacy Ask Pal
  launcher; account-page behavior and the backend remain intact
- No new dependency or copied third-party component was introduced

Combined local verification: 242 web tests and 4 API tests passed; all four
workspace type-checks passed; web ESLint passed without warnings; Next's
production build generated all 37 pages; extension Vite build passed. The
automated web suite includes 29 extension presentation/contract assertions,
seven actual quote-hook lifecycle tests, and nine public-assistant visibility
tests. These checks do not replace rendered or installed-Chrome QA.

CI now runs on the existing review branch as well as main and pull requests,
uses Node 24 to match the verified Vercel project, and includes the API tests.

### Preview package and remaining QA

The Concept A review ZIP is version 3 of the existing private review artifact,
154,272 bytes, SHA-256
`0398ba18be5ec7bd5309b92d0565654e7090f06eadd7a38797d63b56e958f493`.
It is named **My Remittance Pal — preview test**, version 0.3.0, with only
`storage` and `sidePanel` permissions. Its sole host is the already verified
baseline preview:
`https://remitance-buddy-1y3vnm9w0-jujulaville8-droids-projects.vercel.app/*`.
It has no content scripts or affiliate-click upload/auth bundle.

The previous installed-Chrome iteration passed 64 displayed amount/ranking
checks plus preferences, timestamps, rapid-input isolation and offline recovery.
The three earlier bugs (preset clipping, raw network errors, missing control IDs)
were verified fixed. Its remaining 200% narrow-panel recipient amount clipping
is addressed in Concept A and requires an installed retest of this new package.

Before redesign publication, verify an authorized public preview at desktop,
tablet, 320/375/390px widths and 200% zoom; keyboard/touch interaction, source
states, navigation, and transferred image size must be checked. The preview
publication and this visual QA are pending. Production and Chrome Web Store
publication have not occurred.

Independent source review found one unconfirmed P2 risk: a popup viewport shorter
than the inner 600 CSS-pixel scrolling cap may leave bottom content unreachable
because outer scrolling is hidden. Check the final provider action and disclaimer
at 200% zoom and in a height-constrained window during the installed retest.
No other actionable issue was found in quote isolation, source ages, provider
destinations, settings, or the selected composition.

### Installed Concept A retest — 3 October, 17:04 UTC

The version-3 package was installed in the authorized Mac Chrome test. The selected
styling, keyboard interaction, validation, saved preferences, source/payout caveats
and final disclaimer were verified. The popup remained scrollable in a short
window. The earlier PHP amount clipping was fixed for the AUD 1,000 / Maya case at
200% zoom in an approximately 360px side panel.

Exactly 320px panel width and popup-specific 200% zoom remain unverified. The
static popup-height concern was not reproduced in the short-window test, but the
separate zoom case remains a release check. Controls were stopped and test
defaults restored; the preview extension remains enabled. These results concern
comparison UI only and do not verify a money-transfer lifecycle.
