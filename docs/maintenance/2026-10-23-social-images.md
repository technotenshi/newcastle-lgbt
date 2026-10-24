# Missing static social images — 2026-10-23

Status: fixed in the working tree on 2026-10-23, pending commit and merge. Tracked in [GitHub issue #437](https://github.com/technotenshi/newcastle-lgbt/issues/437). Priority was high; broken public social-preview resources.

## Resolution

- `composables/useSocialImage.ts` builds the social image URL and registers the same IPX path with `prerenderRoutes`. All six pages use it.
- Root causes: Nitro's crawler only follows `href` attributes, so URLs that appear only in `<meta content>` were never generated; and the modifier string `w_1200&h_630&fit_cover` never produced 1200x630, because IPX treats `w_` and `h_` as separate single-axis resizes and ignores `fit` for them. The emitted modifier is now `f_webp&s_1200x630&fit_cover&enlarge`.
- `scripts/verify-social-images.mjs` runs in CI after the build and fails on a missing, empty, non-image or non-1200x630 social image, and when it finds no social image URLs at all.
- Verified in Docker: the script exited 1 with 46 of 46 missing before the fix and exits 0 after it; the output has 624 IPX files (578 plus 46).
- The inventory below is the historical record of the old URLs. Those exact paths are intentionally not generated any more, since the modifier changed. They never served an image (they returned 404), so no working link is lost. Compare against the URLs the script reports, not against this table.

## Evidence and impact

The production build emits 51 content pages with valid OG/Twitter metadata, but all 46 distinct social-image URLs referenced by those pages are absent from `.output/public` and return HTTP 404 from a static server. The same URLs are used by news Article structured data. Sharing these pages cannot reliably display the intended preview image.

A full build of dependency commit `49439f0` produces 687 routes and 578 IPX assets. All 578 generated image files and 117 distinct rendered-page image URLs return HTTP 200. This isolates the missing variants to social images rather than a general IPX failure. The baseline comparison establishes history only; it does not resolve or deprioritize the defect.

## Proposed fix

The likely cause is that manually constructed IPX URLs in SEO metadata are not explicitly registered with the prerenderer. `useSeoMeta` declares the URL but does not itself guarantee an image file is generated.

1. Add a small shared helper for the existing social-image pattern. Build the local IPX path once, register that exact path through Nuxt's `prerenderRoutes` during server prerendering, and derive the public absolute URL from the same path. Keep URL modifiers and filenames identical between registration and emitted metadata.
2. Use the helper in `pages/index.vue`, `pages/news/index.vue`, `pages/events/index.vue`, `pages/council-members/index.vue`, `pages/organizations/index.vue`, and `pages/news/[year]/[month]/[day]/[slug].vue`. For the news page, register after the article's awaited content and fallback image are resolved, within a valid Nuxt context. Cover fallback images as well as article-specific images.
3. Retain Nuxt Image 2.0.0 and disabled nuxt-og-image generation: this fix queues the existing IPX derivatives. A renderer/module upgrade is unnecessary for this defect.
4. Add a build-output verification script and run it in CI after the full static build. Parse every prerendered HTML document, collect and deduplicate local `og:image` and `twitter:image` URLs, map their decoded paths safely into `.output/public`, and fail if any file is missing. Smoke-test those URLs over a static HTTP server, asserting 200, an image content type, and nonempty bytes. An HTML metadata-presence check alone is insufficient.

Nuxt documents that [`prerenderRoutes`](https://nuxt.com/docs/4.x/api/utils/prerender-routes) can register paths absent from linked HTML, and must run within Nuxt context during prerendering. Confirm the helper against the installed Nuxt 4.5.2 API before implementation.

## Reproduction

```sh
docker compose run --rm --no-deps app yarn build
```

Serve `.output/public` with the installed `serve` package, then request any inventory URL below. The current result is 404 even though its referring HTML page returns 200. For example:

```text
/_ipx/f_webp&w_1200&h_630&fit_cover/images/news/20260904-01-anti-lgbtq-ballot-campaign.png
```

Use an exact path from the inventory if article naming changes.

## Acceptance criteria

- [ ] The production build generates all social-image variants referenced by every published page, including default/fallback images.
- [ ] Every distinct local OG/Twitter image URL returns HTTP 200 with image content from a static-only server. At this snapshot, all 46 inventory URLs must pass.
- [ ] Generated social images have the intended 1200×630 dimensions, verified from image bytes.
- [ ] Existing 578 generated IPX paths and rendered-page images remain functional; additional generated variants are expected.
- [ ] No missing social image can pass the new CI check; demonstrate failure against the current output and success against the fixed output.
- [ ] Docker immutable installation, lint and full static build pass. Content pages, sitemap, robots, RSS, canonical and social metadata remain valid.

## Missing URL inventory (historical, old modifier)

The following 46 distinct URL paths were extracted from generated page metadata. Representative referring pages are included; shared fallback images can have multiple referrers.

| Missing image path | Referring page(s) |
| --- | --- |
| `/_ipx/f_webp&w_1200&h_630&fit_cover/images/20241015-01-councilmember-tallman-resigns-ethics-dispute-newcastle-council-divisions.png` | `/news/2024/10/15/councilmember-tallman-resigns-ethics-dispute-newcastle-council-divisions/` |
| `/_ipx/f_webp&w_1200&h_630&fit_cover/images/20241021-01-why-electing-trump-in-2024-would-threaten-democracy.png` | `/news/2024/10/21/why-electing-trump-in-2024-would-threaten-democracy/` |
| `/_ipx/f_webp&w_1200&h_630&fit_cover/images/K59bqmorPm9qeV7qbg4Dozml.webp` | `/`, `/organizations/`, `/council-members/`, `/news/`, `/events/` |
| `/_ipx/f_webp&w_1200&h_630&fit_cover/images/decision-reversal.webp` | `/news/2024/06/18/newcastle-flips-decision/` |
| `/_ipx/f_webp&w_1200&h_630&fit_cover/images/img1.webp` | `/news/2024/06/04/newcastle-votes-against-flag/` |
| `/_ipx/f_webp&w_1200&h_630&fit_cover/images/lake-celebration.webp` | `/news/2024/06/18/newcastle-pride-celebration/` |
| `/_ipx/f_webp&w_1200&h_630&fit_cover/images/newcastle-city-council-inclusivity-ethical-leadership-analysis.png` | `/news/2024/10/01/newcastle-city-council-inclusivity-ethical-leadership-analysis/` |
| `/_ipx/f_webp&w_1200&h_630&fit_cover/images/newcastle-council-debate-inclusivity-ethical-governance.png` | `/news/2024/10/01/newcastle-council-debate-inclusivity-ethical-governance/` |
| `/_ipx/f_webp&w_1200&h_630&fit_cover/images/newcstle-city-council.webp` | `/news/2024/06/13/open-letter-and-mayor-reply/`, `/news/2024/06/18/clark-speech-critical-analysis/` |
| `/_ipx/f_webp&w_1200&h_630&fit_cover/images/news/2024-newcastle-election-results-analysis-lgbtq-implications.png` | `/news/2024/11/06/2024-newcastle-election-results-analysis-lgbtq-implications/` |
| `/_ipx/f_webp&w_1200&h_630&fit_cover/images/news/20241021-02-newcastle-remembers-tony-ventrella.png` | `/news/2024/10/21/newcastle-remembers-tony-ventrella/` |
| `/_ipx/f_webp&w_1200&h_630&fit_cover/images/news/20241025-01-election-guide.png` | `/news/2024/10/25/2024-election-guide-endorsements/` |
| `/_ipx/f_webp&w_1200&h_630&fit_cover/images/news/20241113-01-transgender-awareness-week-2024.png` | `/news/2024/11/13/transgender-awareness-week-2024/` |
| `/_ipx/f_webp&w_1200&h_630&fit_cover/images/news/20241119-01-november-meetings-budget-adoption-feature.png` | `/news/2024/11/19/november-meetings-budget-adoption/` |
| `/_ipx/f_webp&w_1200&h_630&fit_cover/images/news/20241203-01-jim-quigg-appointed-to-council-feature.png` | `/news/2024/12/03/jim-quigg-appointed-to-council/` |
| `/_ipx/f_webp&w_1200&h_630&fit_cover/images/news/20250126-01-proposed-legislation-threatens-gender-affirming-care-wa-feature.png` | `/news/2025/01/26/proposed-legislation-threatens-gender-affirming-care-wa/` |
| `/_ipx/f_webp&w_1200&h_630&fit_cover/images/news/20250228-01-newcastle-mayor-climate-equity-attack.png` | `/news/2025/02/28/newcastle-mayor-climate-equity-attack/` |
| `/_ipx/f_webp&w_1200&h_630&fit_cover/images/news/20250301-01-lgbtq-eastside-community-survey.png` | `/news/2025/03/01/lgbtq-eastside-community-survey/` |
| `/_ipx/f_webp&w_1200&h_630&fit_cover/images/news/20250331-01-transgender-day-of-visibility-2025.png` | `/news/2025/03/31/transgender-day-of-visibility-2025/` |
| `/_ipx/f_webp&w_1200&h_630&fit_cover/images/news/20250520-01-newcastle-pride-flag-debate-victory-amidst-missed-opportunities.png` | `/news/2025/05/20/newcastle-pride-flag-debate-victory-amidst-missed-opportunities/` |
| `/_ipx/f_webp&w_1200&h_630&fit_cover/images/news/20250601-01-pride-month-2025-celebration-and-challenges.png` | `/news/2025/06/01/pride-month-2025-celebration-and-challenges/` |
| `/_ipx/f_webp&w_1200&h_630&fit_cover/images/news/20250604-01-newcastle-lgbt-first-anniversary.png` | `/news/2025/06/04/newcastle-lgbt-first-anniversary/` |
| `/_ipx/f_webp&w_1200&h_630&fit_cover/images/news/20250604-02-pride-all-year-round-guide.png` | `/news/2025/06/04/pride-all-year-round-guide/` |
| `/_ipx/f_webp&w_1200&h_630&fit_cover/images/news/20250608-01-newcastle-pride-2025-lake-boren.jpg` | `/news/2025/06/08/newcastle-pride-2025-lake-boren/` |
| `/_ipx/f_webp&w_1200&h_630&fit_cover/images/news/20250714-01-international-non-binary-peoples-day.jpg` | `/news/2025/07/14/international-non-binary-peoples-day/` |
| `/_ipx/f_webp&w_1200&h_630&fit_cover/images/news/20250922-01-feature-d90c7a53-2341-4f0a-8e00-93fa558a214a.png` | `/news/2025/09/22/newcastle-city-council-election-exposing-candidate-ties-and-impact/` |
| `/_ipx/f_webp&w_1200&h_630&fit_cover/images/news/20250926-01-f468f4b6-91b4-4bb9-a263-f9c81c926484.png` | `/news/2025/09/26/chinmay-nagarkar-hidden-agenda-centrist-facade/` |
| `/_ipx/f_webp&w_1200&h_630&fit_cover/images/news/20251014-01-newcastle-hate-mail.png` | `/news/2025/10/14/newcastle-hate-mail-sherlock-jacobs/` |
| `/_ipx/f_webp&w_1200&h_630&fit_cover/images/news/20251105-01-nov-2025-election-results.png` | `/news/2025/11/05/nov-2025-election-results/` |
| `/_ipx/f_webp&w_1200&h_630&fit_cover/images/news/20251110-01-scotus-denies-kim-davis-cert.png` | `/news/2025/11/10/scotus-denies-kim-davis-cert/` |
| `/_ipx/f_webp&w_1200&h_630&fit_cover/images/news/20251120-01-flock-alpr-washington.png` | `/news/2025/11/20/wa-flock-safety-surveillance-crisis/` |
| `/_ipx/f_webp&w_1200&h_630&fit_cover/images/news/20251120-02-tpusa-issaquah-high-school-analysis.png` | `/news/2025/11/20/tpusa-issaquah-high-school-analysis/` |
| `/_ipx/f_webp&w_1200&h_630&fit_cover/images/news/20260319-02-wa-ag-gender-affirming-care.png` | `/news/2026/03/19/washington-ag-gender-affirming-care-fight/` |
| `/_ipx/f_webp&w_1200&h_630&fit_cover/images/news/20260319-03-pflag-anti-lgbtq-initiatives.png` | `/news/2026/03/19/pflag-chapters-oppose-anti-lgbtq-initiatives/` |
| `/_ipx/f_webp&w_1200&h_630&fit_cover/images/news/20260319-04-wa-lgbtq-youth-council-flyer.png` | `/news/2026/03/19/wa-lgbtq-youth-council-applications/` |
| `/_ipx/f_webp&w_1200&h_630&fit_cover/images/news/20260319-05-wa-2026-legislative-session.png` | `/news/2026/03/19/washington-2026-legislative-session-lgbtq/` |
| `/_ipx/f_webp&w_1200&h_630&fit_cover/images/news/20260324-01-newcastle-flock-ice-update.png` | `/news/2026/03/24/newcastle-flock-ice-sb6002-update/` |
| `/_ipx/f_webp&w_1200&h_630&fit_cover/images/news/20260327-01-newcastle-city-hall.png` | `/news/2026/03/27/council-responds-cameras-inactive/` |
| `/_ipx/f_webp&w_1200&h_630&fit_cover/images/news/20260331-01-tdov-2026.png` | `/news/2026/03/31/transgender-day-of-visibility-2026/` |
| `/_ipx/f_webp&w_1200&h_630&fit_cover/images/news/20260331-02-harry-allen-trans-history.png` | `/news/2026/03/31/harry-allen-trans-history-washington/` |
| `/_ipx/f_webp&w_1200&h_630&fit_cover/images/news/20260520-01-seattle-shield-surveillance.png` | `/news/2026/05/20/seattle-shield-surveillance-network/` |
| `/_ipx/f_webp&w_1200&h_630&fit_cover/images/news/20260521-01-juniper-blessing-campus-memorial.png` | `/news/2026/05/21/remembering-juniper-blessing/` |
| `/_ipx/f_webp&w_1200&h_630&fit_cover/images/news/20260601-01-true-history-of-pride-erasure.png` | `/news/2026/06/01/true-history-of-pride-erasure/` |
| `/_ipx/f_webp&w_1200&h_630&fit_cover/images/news/20260904-01-anti-lgbtq-ballot-campaign.png` | `/news/2026/09/04/anti-lgbtq-ballot-initiatives-documented-risks/` |
| `/_ipx/f_webp&w_1200&h_630&fit_cover/images/news/20260906-01-federal-assault-transgender-youth-healthcare.png` | `/news/2026/09/06/federal-assault-transgender-youth-healthcare/` |
| `/_ipx/f_webp&w_1200&h_630&fit_cover/images/portrait-old-man.webp` | `/news/2024/06/18/newcastle-mayor-poor-remarks/` |
