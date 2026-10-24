# Site Improvement Tasks

Backlog of identified improvements, grouped by area. Items within each section are roughly ordered by impact.

---

## Performance

- **Prune Jost font weights** — all 9 weights (100–900) are loaded but only 3–4 are used in CSS. Remove unused weights from the `nuxt.config.ts` preload list to cut ~50–60% of the font payload.
- ~~**Core Web Vitals audit**~~ — ✅ Done 2026-03-23. See `docs/lighthouse/audit-results.md`. All pages score 98–100; remaining open items tracked there.

---

## SEO / Structured Data

- ~~**Fix missing social-image resources**~~ — ✅ Done 2026-10-23, [#437](https://github.com/technotenshi/newcastle-lgbt/issues/437). `useSocialImage` registers each IPX path for prerendering and uses a modifier that really yields 1200x630; `scripts/verify-social-images.mjs` checks the built output in CI. See `docs/maintenance/2026-10-23-social-images.md`.
- **Event JSON-LD schema** — the events page has no structured data. Add an `Event` schema block for each listing to make events eligible for Google's rich results. Extends the JSON-LD work already done for `NewsArticle` and `Organization`.
- **Unique page descriptions** — `pages/news/index.vue`, `pages/events/index.vue`, `pages/council-members/index.vue`, and `pages/organizations/index.vue` all share the same generic `pageDescription` string. Each should have a distinct, descriptive meta description.

---

## UX / Navigation

- **Breadcrumb / back link on article pages** — after navigating into a news article there is no "← Back to News" affordance; users must use the main nav. Add a back link to `pages/news/[year]/[month]/[day]/[slug].vue`.
- **Custom 404 page** — currently falls back to Nuxt's default error page. Add `error.vue` at the project root with on-brand styling and a link back to the home page.
- **Reading time estimate** — calculate and display estimated reading time on article cards (`FeaturedNews.vue`) and on the article page itself.

---

## Content Features

- ~~**RSS feed**~~ — ✅ Done. RSS 2.0 feed live at `/feed.xml` via `server/routes/feed.xml.ts`; autodiscovery link in `<head>`; footer link in `layouts/default.vue`.
- **"Add to calendar" link on events** — add an iCal (`.ics`) download link or "Add to Google Calendar" URL to each event entry on the events page.

---

## Developer / Maintenance

- **Remediate dependency audit findings — urgent, [#436](https://github.com/technotenshi/newcastle-lgbt/issues/436)** — 41 advisory reports plus three deprecation reports, including two critical Git-tooling findings. Prioritize supported Nuxt/devtools upgrades that patch or remove simple-git and its parser, then resolve or explicitly disposition every remaining report. Full inventory, package-specific proposals and acceptance criteria: [remediation record](maintenance/2026-10-23-dependency-audit.md).
- **TypeScript prop and composable types** — `nuxt.config.ts` and `utils/` use TypeScript, but most pages and components use untyped `<script setup>`. Adding `defineProps<{...}>()` types and return types to composables would catch bugs earlier.

