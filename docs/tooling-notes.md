# Tooling Notes

Build, CI, module, and styling details that do not need to load into every agent session. `AGENTS.md` links here. Content authoring rules live in [`content-authoring.md`](content-authoring.md).

## Docker and make quirks

- **Non-TTY environments** (CI, scripts): most `make` targets pass `-it` to `docker compose run`, which fails without a TTY. Run the underlying yarn command directly: `docker compose run --rm app yarn <cmd>` (for example `yarn build`, `yarn lint`).
- **Foreground stall:** in some shell environments `docker compose run --rm app yarn <cmd>` creates the container but prints nothing when run synchronously. Run it as a background task and read the output file when it finishes.
- **`NUXT_B2005` dev warning is a known false positive:** `check-if-page-unused.js has no default export` comes from Nuxt's regex-based export scanner (via `mlly`) missing the `export { x as default }` pattern used in that internal file. It is harmless (it only disables one dev diagnostic) and has no fix yet. Tracked upstream at [nuxt/nuxt#35664](https://github.com/nuxt/nuxt/issues/35664).
- **Static and prerender regressions are invisible in `make develop`:** dependency bumps touching `@nuxt/image`, IPX, or the prerender pipeline must be verified with a real static build (`make build` or `make prod`), never dev mode alone. `nuxt dev` does not run Nitro's prerender crawler, so image-generation bugs in the static output only surface after deploy. Confirm `.output/public/_ipx` is non-empty and that serving it statically (`npx serve .output/public`) returns `200` on real `/_ipx/...` URLs, matching how Cloudflare Pages serves the site. (Learned 2026-08-21: `@nuxt/image` 2.1.0 broke this silently, see `docs/DECISIONS.md`.)
- **Never delete `yarn.lock`** to resolve a merge or rebase conflict. Deleting it removes yarn's pinned-resolution guardrail and lets a package silently re-resolve to the newest version satisfying its `package.json` range, even one just reverted for breaking production. Resolve `package.json` first, restore `yarn.lock` from the correct ref with `git checkout <ref> -- yarn.lock`, then run `yarn install` to layer in only the new changes.

## Source directory notes

- `plugins/bootstrap.client.ts`: Bootstrap JS (client only). Imports only `collapse.js` (navbar hamburger) and `carousel.js` (news article image slideshow) from the npm `bootstrap` package. Popper.js and all other Bootstrap components (Modal, Dropdown, Tooltip, and so on) are excluded. Add an import here if a page ever needs one.
- `layouts/default.vue`: global header, nav, and footer rendered on every page.
- `utils/content.ts`: normalization helpers (`normaliseString`, `normaliseNumber`, `normaliseBody`, `parseMeta`, `toPlainText`).
- `utils/assets.ts`: asset URL resolution (handles `~/assets`, relative paths, external URLs).
- `components/content/Dateline.vue`: inline MDC component rendering `**Newcastle, WA** –`. Used at the start of every news article body as `:Dateline [first sentence]`.
- `components/content/ProseA.vue`: overrides link rendering site-wide. A file in `components/content/` automatically overrides the default `@nuxtjs/mdc` component of the same name for all `<ContentRenderer>` output.

## Modules and integrations

- **`@nuxt/image`**: serves assets from `assets/` as WebP at quality 80 via the IPX endpoint (`/_ipx/...`). Use `<NuxtImg>` instead of plain `<img>` for all local images.
- **`@nuxtjs/sitemap`**: generates `/sitemap.xml` at build time by crawling prerendered routes. Reads the canonical URL from `site.url` in `nuxt.config.ts`. `zeroRuntime: true` is set because all content is static.
- **`@nuxtjs/robots`**: generates `robots.txt` at build time. Do not create `public/robots.txt` manually.
- **`nuxt-og-image`**: currently disabled (`ogImage: { enabled: false }`) because no Satori renderer is configured and its interactive prompt breaks non-TTY Docker. OG images are set via `useSeoMeta({ ogImage, twitterImage })` using the `useSocialImage` helper (IPX URLs registered for prerendering). The full OG image pattern is in `AGENTS.md` under SEO conventions.
- **`nuxt-schema-org`**: provides `useSchemaOrg([...])` with factory helpers (`defineOrganization`, `defineArticle`). Always wrap helpers in `useSchemaOrg([...])`, they are not self-registering composables.
- **`nuxt-link-checker`**: runs during `make develop` and warns about broken or malformed links. Treat warnings as errors. Common rules: no trailing slashes on internal links, no absolute `https://newcastle.lgbt/...` URLs (use relative paths).
- **`nuxt-seo-utils`**: generates `og:title`, `og:description`, `og:url`, `og:site_name`, `twitter:*`, and `<link rel="canonical">` from `useSeoMeta({ title, description })`. Do not set these manually. It also appends ` | Newcastle LGBTQ Voice` to every page `<title>`, so page titles must be the short form only (for example `'News'`, not `'News | Newcastle LGBTQ Voice'`).
- **`seo.fallbackTitle: false`**: disabled to work around a `nuxt-seo-utils@8` bug where the fallback title plugin unconditionally requires `nuxt-site-config:i18n` even when no i18n module is installed.
- **Simple Analytics**: privacy-friendly, cookie-free analytics injected via `nuxt.config.ts`. No user configuration required.
- **Vite `optimizeDeps.include`**: `@unhead/schema-org/vue` (`@unhead/vue` v3), `bootstrap/js/dist/collapse.js`, and `bootstrap/js/dist/carousel.js` are pre-bundled to prevent Vite dev-server CJS discovery warnings. Add any new CJS Bootstrap module here if you import it in `plugins/bootstrap.client.ts`.
- **`feed`**: generates the RSS 2.0 feed at `/feed.xml` via `server/routes/feed.xml.ts`, prerendered at build time via `nitro.prerender.routes`. The autodiscovery `<link rel="alternate">` is injected via `app.head` in `nuxt.config.ts`. Do not use `@nuxtjs/feed` (unclear Nuxt 4 compatibility). In server routes, query content with `queryCollection(event, "collection")` imported from `"@nuxt/content/server"`, not the client composable auto-import.

## CI/CD

- **GitHub repo:** `technotenshi/newcastle-lgbt`.
- `.github/workflows/yarn-nuxt.yml`: runs `yarn install --immutable`, `yarn lint`, `yarn build`, then `node scripts/verify-social-images.mjs` on every push and PR to `main`.
- `.github/dependabot.yml`: weekly automated PRs for npm dependency updates. Renovate also runs and may open duplicate or overlapping PRs. The later one is typically superseded and auto-closed.
- **`yarn.lock` drift:** CI uses `--immutable`, so a dependency merge that introduces new transitive deps breaks the lockfile. Fix it by running `docker compose run --rm app yarn install` locally and committing the updated `yarn.lock`.
- **Renovate stale lockfile:** when a Renovate PR changes `package.json` but leaves `yarn.lock` stale ("Artifact update problem", Yarn 1.22.22 vs `packageManager`), follow [`maintenance/2026-10-24-renovate-stale-lockfile.md`](maintenance/2026-10-24-renovate-stale-lockfile.md).
- `.github/workflows/dependency-audit.yml`: runs `scripts/audit-gate.mjs` (a recursive Yarn audit) on pushes to `main`, weekly, and on PRs that change `package.json`, `yarn.lock`, or the gate files. Fails on critical or high findings without an entry in [`maintenance/audit-exceptions.md`](maintenance/audit-exceptions.md) and on entries past their review date. Moderate findings and deprecations are warnings.
- There are no automated tests for the site. The only tests cover the audit gate: `node --test scripts/audit-gate.test.mjs`.
- **No direct commits to `main`:** a Husky `pre-commit` hook (`.husky/pre-commit`, wired via the `prepare` script in `package.json`) exits non-zero on any commit attempted while `HEAD` is `main`, with the message "Direct commits to 'main' are blocked." Work on a feature branch (`git checkout -b ...`) before committing.
- **Copilot PR review:** after pushing a fix for a Copilot-flagged issue, do not manually re-request the review (for example via `gh api .../requested_reviewers`). Copilot re-reviews automatically on new pushes to the PR branch.

## Styling

Bootstrap 5 plus a Mobirise-derived custom theme in `assets/theme/css/style.css`. Use Bootstrap's responsive grid classes (`col-12`, `col-md-*`, `col-lg-*`).

**PurgeCSS runs in production builds.** Any Bootstrap class not statically present in `pages/`, `components/`, `layouts/`, `app.vue`, or `content/` files is stripped. If you add dynamically bound class names (for example `:class="foo"`), add them to the `safelist` in `nuxt.config.ts` under `postcss.plugins["@fullhuman/postcss-purgecss"].safelist`.

## TypeScript and IDE setup

`tsconfig.json` at the project root extends `.nuxt/tsconfig.json`, which is generated at dev or build time. That gives the IDE every Nuxt-generated type augmentation, including `site` in `NuxtConfig` (from `nuxt-site-config`) and `#imports` auto-imports. Run `make develop` or `make build` once to generate `.nuxt/` before opening the project in an IDE.

## Claude Code hooks

Hooks live in `.claude/settings.json` and run only in Claude Code. Other agent tools get no enforcement, so apply the same rules by hand.

- **Env and lockfile write block** (`PreToolUse`): hard-blocks (exit 2, not a warning) any Edit or Write to `.env`, `.env.*`, or `yarn.lock`. Edit those manually outside the tool if you genuinely need to.
- **Auto-lint:** runs `./node_modules/.bin/eslint --fix` on every edited `.vue`, `.ts`, `.js`, or `.mjs` file.
- **Em dash warning:** flags `—` in `content/*.md` right after a write.
- **Editorial-checklist reminder:** flags red-flag phrases (`nothing left to lose`, `quietly removed`, `militancy`, `legally armed`, and similar) in `content/news/*.md`, pointing to `docs/editorial-checklist.md`. It is grep-based, so it can false-positive on a phrase used inside a quote being debunked. Treat it as a nudge, not a verdict.
- **Absolute URL warning:** flags `https://newcastle.lgbt/` in any written file.
- **PurgeCSS reminder:** notes `:class=` bindings in `.vue` edits that may need safelist entries.
- **Stop reminder:** shows a lint and build reminder when source files have unstaged changes.
