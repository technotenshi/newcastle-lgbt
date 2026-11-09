# Tooling Notes

Build, CI, module, and styling details that do not need to load into every agent session. `AGENTS.md` links here. Content authoring rules live in [`content-authoring.md`](content-authoring.md).

## Docker and make quirks

- **Non-TTY environments** (CI, scripts): most `make` targets pass `-it` to `docker compose run`, which fails without a TTY. Run the underlying yarn command directly: `docker compose run --rm --no-deps -T --pull never app yarn <cmd>` (for example `yarn build`, `yarn lint`).
- **Foreground stall:** long Docker checks belong in a tracked background task with completion notification. Save a log in the client's scratch directory and inspect it after completion, rather than silently polling. Use the existing image; do not install dependencies or rebuild images without approval.
- **Preserve a running dev server:** inspect `docker compose ps` before building. If development is running against this checkout, build an isolated source copy with its own `.nuxt` and `.output` instead of overwriting those directories. Mount the existing dependencies and write output to scratch; do not restart the dev server.
- **`NUXT_B2005` dev warning is a known false positive:** `check-if-page-unused.js has no default export` comes from Nuxt's regex-based export scanner (via `mlly`) missing the `export { x as default }` pattern used in that internal file. It is harmless (it only disables one dev diagnostic) and has no fix yet. Tracked upstream at [nuxt/nuxt#35664](https://github.com/nuxt/nuxt/issues/35664).
- **Static and prerender regressions are invisible in `make develop`:** dependency bumps touching `@nuxt/image`, IPX, or the prerender pipeline must be verified with a real static build (`make build` or `make prod`), never dev mode alone. `nuxt dev` does not run Nitro's prerender crawler, so image-generation bugs in the static output only surface after deploy. Confirm `.output/public/_ipx` is non-empty and that serving it statically (`npx serve .output/public`) returns `200` on real `/_ipx/...` URLs, matching how Cloudflare Pages serves the site. (Learned 2026-08-21: `@nuxt/image` 2.1.0 broke this silently, see `docs/DECISIONS.md`.)
- **Never delete `yarn.lock`** to resolve a merge or rebase conflict. Deleting it removes yarn's pinned-resolution guardrail and lets a package silently re-resolve to the newest version satisfying its `package.json` range, even one just reverted for breaking production. Resolve `package.json` first, restore `yarn.lock` from the correct ref with `git checkout <ref> -- yarn.lock`, then run `yarn install` to layer in only the new changes.

## Source directory notes

- `plugins/bootstrap.client.ts`: Bootstrap JS (client only). Imports only `collapse.js` (navbar hamburger) and `carousel.js` (news article image slideshow) from the npm `bootstrap` package. Popper.js and all other Bootstrap components (Modal, Dropdown, Tooltip, and so on) are excluded. Add an import here if a page ever needs one.
- `layouts/default.vue`: global header, nav, and footer rendered on every page.
- `utils/content.ts`: re-exports the normalization helpers in `utils/content.mjs` (`normaliseString`, `normaliseNumber`, `normaliseBody`, `parseMeta`, `toPlainText`, `truncateSummary`).
- `utils/news.mjs`: the publication rule for news (`listPublishedNews`, `findPublishedArticle`, `listFeedItems`, `pacificToday`), used by `useNews`, the article page and `server/routes/feed.xml.ts`. Plain `.mjs` so `scripts/news.test.mjs` runs under `node --test`; `nuxt.config.ts` inlines `utils/` for Nitro so the feed route bundles it. Do not re-implement the draft or future-date check elsewhere.
- `utils/assets.ts`: asset URL resolution (handles `~/assets`, relative paths, external URLs).
- `components/content/Dateline.vue`: inline MDC component rendering `**Newcastle, WA** –`. Used at the start of every news article body as `:Dateline [first sentence]`.
- `components/content/ProseA.vue`: overrides link rendering site-wide. A file in `components/content/` automatically overrides the default `@nuxtjs/mdc` component of the same name for all `<ContentRenderer>` output.

## Modules and integrations

- **`@nuxt/image`**: serves assets from `assets/` as WebP at quality 80 via the IPX endpoint (`/_ipx/...`). Use `<NuxtImg>` instead of plain `<img>` for all local images.
- **`@nuxtjs/sitemap`**: generates `/sitemap.xml` at build time by crawling prerendered routes. Reads the canonical URL from `site.url` in `nuxt.config.ts`. `zeroRuntime: true` is set because all content is static.
- **`@nuxtjs/robots`**: generates `robots.txt` at build time. Do not create `public/robots.txt` manually.
- **`nuxt-og-image`**: currently disabled (`ogImage: { enabled: false }`) pending explicit renderer setup and static compatibility verification; enabling it can prompt interactively and break non-TTY Docker. OG images are set via `useSeoMeta({ ogImage, twitterImage })` using the `useSocialImage` helper (IPX URLs registered for prerendering). The full pattern is in [Social metadata](#social-metadata).
- **`nuxt-schema-org`**: provides `useSchemaOrg([...])` with factory helpers (`defineOrganization`, `defineArticle`). Always wrap helpers in `useSchemaOrg([...])`, they are not self-registering composables.
- **`nuxt-link-checker`**: runs during `make develop` and warns about broken or malformed links. Treat warnings as errors. Common rules: no trailing slashes on internal links, no absolute `https://newcastle.lgbt/...` URLs (use relative paths).
- **`nuxt-seo-utils`**: generates `og:title`, `og:description`, `og:url`, `og:site_name`, `twitter:title`, `twitter:description`, and `<link rel="canonical">` from `useSeoMeta({ title, description })`. Do not set those fields manually. Explicit `twitterImage` and `twitterCard` are required image/card inputs, not prohibited automatic fields. It also appends ` | Newcastle LGBTQ Voice` to every page `<title>`, so page titles must be the short form only (for example `'News'`, not `'News | Newcastle LGBTQ Voice'`).
- **`seo.fallbackTitle: false`**: disabled to work around a `nuxt-seo-utils@8` bug where the fallback title plugin unconditionally requires `nuxt-site-config:i18n` even when no i18n module is installed.
- **Simple Analytics**: privacy-friendly, cookie-free analytics injected via `nuxt.config.ts`. No user configuration required.
- **Vite `optimizeDeps.include`**: `@unhead/schema-org/vue` (`@unhead/vue` v3), `bootstrap/js/dist/collapse.js`, and `bootstrap/js/dist/carousel.js` are pre-bundled to prevent Vite dev-server CJS discovery warnings. Add any new CJS Bootstrap module here if you import it in `plugins/bootstrap.client.ts`.
- **`feed`**: generates the RSS 2.0 feed at `/feed.xml` via `server/routes/feed.xml.ts`, prerendered at build time via `nitro.prerender.routes`. The autodiscovery `<link rel="alternate">` is injected via `app.head` in `nuxt.config.ts`. Do not use `@nuxtjs/feed` (unclear Nuxt 4 compatibility). In server routes, query content with `queryCollection(event, "collection")` imported from `"@nuxt/content/server"`, not the client composable auto-import.

## CI/CD

- **GitHub repo:** `technotenshi/newcastle-lgbt`.
- `.github/workflows/yarn-nuxt.yml`: runs `yarn install --immutable`, `yarn lint`, `yarn build`, then `node scripts/verify-social-images.mjs` on every push and PR to `main`.
- Renovate owns routine version-update PRs. `.github/dependabot.yml` sets `open-pull-requests-limit: 0` for npm version updates; Dependabot security updates remain a separate repository setting.
- **`yarn.lock` drift:** CI uses `--immutable`, so a dependency merge that introduces new transitive deps breaks the lockfile. Fix it by running `docker compose run --rm app yarn install` locally and committing the updated `yarn.lock`.
- **Renovate stale lockfile:** when a Renovate PR changes `package.json` but leaves `yarn.lock` stale ("Artifact update problem", Yarn 1.22.22 vs `packageManager`), follow [`maintenance/2026-10-24-renovate-stale-lockfile.md`](maintenance/2026-10-24-renovate-stale-lockfile.md).
- `.github/workflows/dependency-audit.yml`: runs `scripts/audit-gate.mjs` (a recursive Yarn audit) on pushes to `main`, weekly, and on PRs that change `package.json`, `yarn.lock`, or the gate files. Fails on critical or high findings without an entry in [`maintenance/audit-exceptions.md`](maintenance/audit-exceptions.md) and on entries past their review date. Moderate findings and deprecations are warnings.
- Node built-in tests cover the audit gate and election result formatting/MDC rendering: `node --test scripts/audit-gate.test.mjs scripts/election-results.test.mjs scripts/election-results-render.test.mjs`. Run these in Docker; the election guide documents fixture/browser checks.
- `node scripts/verify-agent-docs.mjs` checks instruction size, relative documentation links and the native Claude protection configuration. CI runs its four Markdown regression tests and the verifier before the site build.
- **No direct commits to `main`:** a Husky `pre-commit` hook (`.husky/pre-commit`, wired via the `prepare` script in `package.json`) exits non-zero on any commit attempted while `HEAD` is `main`, with the message "Direct commits to 'main' are blocked." Work on a feature branch (`git checkout -b ...`) before committing.
- **Copilot PR review:** after pushing a fix for a Copilot-flagged issue, do not manually re-request the review (for example via `gh api .../requested_reviewers`). Copilot re-reviews automatically on new pushes to the PR branch.

## Styling

Bootstrap 5 plus a Mobirise-derived custom theme in `assets/theme/css/style.css`. Use Bootstrap's responsive grid classes (`col-12`, `col-md-*`, `col-lg-*`).

**PurgeCSS runs in production builds.** Any Bootstrap class not statically present in `pages/`, `components/`, `layouts/`, `app.vue`, or `content/` files is stripped. If you add dynamically bound class names (for example `:class="foo"`), add them to the `safelist` in `nuxt.config.ts` under `postcss.plugins["@fullhuman/postcss-purgecss"].safelist`.

## TypeScript and IDE setup

`tsconfig.json` at the project root extends `.nuxt/tsconfig.json`, which is generated at dev or build time. That gives the IDE every Nuxt-generated type augmentation, including `site` in `NuxtConfig` (from `nuxt-site-config`) and `#imports` auto-imports. Run `make develop` or `make build` once to generate `.nuxt/` before opening the project in an IDE.

## Social metadata

Every page calls `useSeoMeta({ title, description })` with a short title; the site suffix is automatic. Local social images must come from `useSocialImage`, which registers their IPX variant for prerendering. Call it synchronously in setup after awaited content, not inside a getter:

```js
const ogImage = useSocialImage("images/<filename>"); // omit argument for default
useSeoMeta({
  title,
  description,
  ogImage,
  twitterCard: "summary_large_image",
  twitterImage: ogImage,
});
```

The helper returns the absolute URL and registers its local path with `prerenderRoutes`. Nitro's crawler only follows `href`, not `<meta content>`, so hand-built social URLs can 404 despite a successful build. After a static build, `node scripts/verify-social-images.mjs` checks every referenced local social image for a real image response at 1200x630. Do not manually set `og:title`, `og:description`, `og:url`, `twitter:title`, `twitter:description` or canonical links; image/card fields above are intentional exceptions to automatic metadata.

## Agent protections and explicit checks

Repository Claude hooks have been removed. Native file permission rules in `.claude/settings.json` replace the broken env/lockfile security hook; lint-on-save and reminder hooks are not replaced. Lint, static build, social-image checks and the content review gate are explicit completion requirements, not automatic behavior.

See [Agent configuration](agents/agent-configuration.md#native-protection-instead-of-repository-hooks) for the precise protection scope, shell limitations, model routing and skill visibility. Other clients must follow the same written safeguards; Claude settings are not cross-tool enforcement.
