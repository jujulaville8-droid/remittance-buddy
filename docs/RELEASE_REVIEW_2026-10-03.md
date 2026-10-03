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

## Local checks
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
- Landing visual modernization is a separate ongoing design pass
