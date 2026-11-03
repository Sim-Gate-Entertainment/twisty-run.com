# Twisty Race website

Static GitHub Pages website for https://twisty-run.com/. The existing Pages source is `main` / repository root. Keep `CNAME`, `app-ads.txt`, and the separate Puzzle Story legal documents intact.

## Check an edit

Run `node check-site.cjs` and `node --check site.js`. Preview the root with a static HTTP server, then check desktop, 390px and 320px widths, both store links, FAQ, trailer, and privacy page. JavaScript is optional for downloading and reading the page.

## Analytics

Existing GA4 property: `524269432`. Website stream: `16265693613`, measurement ID `G-6KNFERD5PB`. This ID is public configuration, not a credential. Android and iOS streams remain unchanged. Always filter reports by platform or stream so website visitors are not counted as game players.

Google Analytics only loads after the visitor allows it. Enhanced measurement is disabled for this web stream. Manual events are:

- `page_view`: one per permitted page load; the configured page URL excludes query strings and referrer is limited to its origin.
- `store_click`: `store` is `android` or `ios`; `placement` is `hero` or `footer`. This measures outbound intent, not installation.
- `trailer_play`: visitor requested the gameplay player. It does not certify playback completion.

The site stores the visitor's choice locally for 180 days. Analytics choices in the footer supports refusal and later withdrawal. Google signals and advertising personalization remain disabled. The trailer loads youtube-nocookie.com only after the visitor requests it; its ordinary YouTube link works without JavaScript.

Use GA4's Realtime report for a consented live smoke check, then processed Events/Explorations for normal analysis. Custom definitions can take time to appear. A working local event queue does not certify delivery to Google.

## Measure promotion

Use separate labeled links for real gameplay clips. Supported `utm_source` values are `youtube`, `tiktok`, `instagram`, `reddit`, `facebook`, `linkedin`; supported `utm_campaign` values are `escape_clip`, `jump_clip`, `road_clip`. Other query values are not forwarded into custom campaign context. Examples:

- `https://twisty-run.com/?utm_source=youtube&utm_campaign=jump_clip`
- `https://twisty-run.com/?utm_source=instagram&utm_campaign=escape_clip`
- `https://twisty-run.com/?utm_source=reddit&utm_campaign=road_clip`

These are prepared links, not claims that anything has been posted. Compare website visits, store clicks, store-attributed acquisitions and later game return separately. Never treat these aggregate reports as one matched cohort. The Play download buttons carry a fixed website install-referrer label. Apple campaign links require the actual App Store Connect provider token; none was fabricated.

## Acquisition follow-up

Record the actual deployment date alongside the baseline from 3 November 2026. Check Search Console impressions and relevant queries weekly; zero previous Google Search clicks does not mean zero total visits. Evaluate store creatives only once there is useful exposure. The website's three gameplay images were downloaded from the published Google Play listing on 3 November 2026, without inventing gameplay or changing store screenshots.

Prioritize short real gameplay captures showing a narrow escape, a well-timed jump and the finish portal. Put the challenge before the cosmetic shop in proposed store artwork. Capture new platform-correct screenshots on the released build before replacing store assets. No outreach messages or store submissions are part of this website deployment.

## Android measurement investigation

Static checks on 3 November found one matching Android Firebase client, matching generated app/project configuration, an enabled collection path and a real Firebase provider outside the Editor. No source-code defect was established and no game code was changed. ADB reported no connected devices. Do not claim Android transport was repaired from these checks.

Next device check: use the released Android build, enable Firebase DebugView for `com.TumbaGames.TwistyRun`, start the game and an attempt, and verify `first_open` where applicable, `level_start`, and `level_end`/explicit exit. Inspect runtime Firebase dependency initialization and the merged release manifest if events are absent. Do not clear a player's saved data merely to force `first_open`. Compare app version, device test activity and consent with store first opens; do not combine iOS, Android and web.

References: [Google consent implementation](https://developers.google.com/tag-platform/security/guides/consent), [manual page views](https://developers.google.com/analytics/devguides/collection/ga4/views), [SEO starter guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide).
