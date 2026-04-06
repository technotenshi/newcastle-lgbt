# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

The project runs in Docker via `make`. Prefer `make` targets over raw `yarn` commands.

| Command | What it does |
|---|---|
| `make install` | Build Docker images |
| `make install-dependencies` | Install npm dependencies inside the container |
| `make develop` | Start dev server at `http://localhost:3000` |
| `make lint` | Run ESLint checks |
| `make lint-fix` | Auto-fix ESLint issues |
| `make build` | Generate static site into `.output/public` |
| `make preview` | Build then serve preview at `http://localhost:3001` |
| `make prod` | Alias for `make preview` |
| `make audit` | Run dependency vulnerability audit |
| `make peer-requirements` | Explain yarn peer dependency requirements |
| `make down` | Stop and remove containers |
| `make logs` | Follow container logs |

After making changes: run `make lint`, then `make build` to confirm the site deploys correctly.

> **Non-TTY environments** (CI, scripts): Most `make` targets pass `-it` to `docker compose run`, which fails without a TTY. Run the underlying yarn command directly instead: `docker compose run --rm app yarn <cmd>` (e.g. `yarn build`, `yarn lint`).

## Architecture

This is a **Nuxt 4 static site** (SSG) for the Newcastle, WA LGBTQ+ community. There is no backend — all data comes from Markdown/JSON files in `content/`, which Nuxt Content parses into a SQLite-backed database at build time.

**Data flow:** Markdown frontmatter → SQLite (via `queryCollection()`) → composables → Vue components → pre-rendered HTML in `.output/public/`

### Content directories
- `content/news/` — News articles (Markdown with YAML frontmatter)
- `content/events/` — Event listings
- `content/council/` — Council member profiles (position-N-*.md)
- `content/features.json` — Homepage feature cards

All content files are registered under a single `content` collection (`content.config.ts`). Composables filter by path: `.where("path", "LIKE", "/news/%")`. The organizations page (`pages/organizations/index.vue`) is an exception — its data is hardcoded directly in the component, not in `content/`.

### Key source directories
- `composables/` — Data fetching layer (`useNews`, `useEvents`, `useCouncil`, `useFeatures`, `useAsset`)
- `pages/` — File-based routing; news uses dynamic route `/news/[year]/[month]/[day]/[slug].vue`
- `components/` — Shared Vue components
- `layouts/default.vue` — Global header, nav, and footer rendered on every page
- `plugins/bootstrap.client.ts` — Bootstrap JS (client-only); imports only `collapse.js` (navbar hamburger) and `carousel.js` (news article image slideshow) from the npm `bootstrap` package. Popper.js and all other Bootstrap components (Modal, Dropdown, Tooltip, etc.) are excluded — add an import here if a page ever needs them.
- `utils/content.ts` — Normalization helpers (`normaliseString`, `normaliseNumber`, `parseMeta`)
- `utils/assets.ts` — Asset URL resolution (handles `~/assets`, relative paths, external URLs)

### Content conventions
- News slugs follow date-based paths: `/news/YYYY/MM/DD/slug`
- Articles support a `draft: true` frontmatter field to hide them
- Council members are ordered by `position-N` prefix in filename
- Images: prefer `.png` for news/events; always include alt text
- Sorting: news by date DESC then `order` field; events by date ASC
- Full authoring guide (frontmatter fields, filename format, body structure, image conventions, step-by-step instructions): [`docs/content-authoring.md`](docs/content-authoring.md)

#### Image generation prompt rules
These apply to every DALL-E or Midjourney prompt produced for any image slot on the site:

- **Explicit racial diversity:** Do not use "diverse" alone — AI generators default to predominantly white subjects. Always write: *"racially diverse group including people of various ethnicities and skin tones, with people of color prominently represented."*
- **LGBTQ+ motifs:** Every image should include at least one subtle LGBTQ+ visual cue regardless of event type — e.g. a rainbow pride wristband, small pride pin on clothing, or pride-color accessories. Keep motifs natural and personal (accessories, not large flags). Avoid relying on accurate flag rendering — AI misrenders flag stripe order and colors; describe color palettes instead (e.g. *"light blue, pink, and white accessories"*).

### Modules & integrations
- **`@nuxt/image`** — serves assets from `assets/` as WebP at quality 80 via the IPX endpoint (`/_ipx/...`). Use `<NuxtImg>` instead of plain `<img>` for all local images.
- **`@nuxtjs/sitemap`** — auto-generates `/sitemap.xml` at build time by crawling prerendered routes. Reads the canonical URL from `site.url` in `nuxt.config.ts`. `zeroRuntime: true` is set because all content is static.
- **`@nuxtjs/robots`** — generates `robots.txt` at build time. Do not create `public/robots.txt` manually.
- **`nuxt-og-image`** — currently **disabled** (`ogImage: { enabled: false }`) because no Satori renderer is configured and its interactive prompt breaks non-TTY Docker. OG images are set via `useSeoMeta({ ogImage, twitterImage })` using IPX URLs constructed with `useSiteConfig().url`.
- **`nuxt-schema-org`** — provides `useSchemaOrg([...])` with factory helpers (`defineOrganization`, `defineArticle`). Always wrap helpers in `useSchemaOrg([...])` — they are not self-registering composables.
- **`nuxt-link-checker`** — runs during `make develop` and warns about broken or malformed links. Warnings are treated as errors: fix them. Common rules: no trailing slashes on internal links, no absolute `https://newcastle.lgbt/...` URLs (use relative paths instead).
- **`nuxt-seo-utils`** — auto-generates `og:title`, `og:description`, `og:url`, `og:site_name`, `twitter:*`, and `<link rel="canonical">` from `useSeoMeta({ title, description })`. Do **not** set these manually. Also appends ` | Newcastle LGBTQ Voice` to every page `<title>` — page titles must be the short form only (e.g. `'News'`, not `'News | Newcastle LGBTQ Voice'`).
- **Simple Analytics** — privacy-friendly, cookie-free analytics injected via `nuxt.config.ts`. No user configuration required.
- **`seo.fallbackTitle: false`** — disabled to work around a `nuxt-seo-utils@8` bug where the fallback title plugin unconditionally requires `nuxt-site-config:i18n` even when no i18n module is installed.
- **Vite `optimizeDeps.include`** — `@unhead/schema-org/vue`, `bootstrap/js/dist/collapse.js`, and `bootstrap/js/dist/carousel.js` are pre-bundled to prevent Vite dev-server CJS discovery warnings. Add any new CJS Bootstrap modules here if imported in `plugins/bootstrap.client.ts`.
- **`feed`** — generates the RSS 2.0 feed at `/feed.xml` via `server/routes/feed.xml.ts`. Pre-rendered at build time via `nitro.prerender.routes`. Autodiscovery `<link rel="alternate">` is injected via `app.head` in `nuxt.config.ts`. Do **not** use `@nuxtjs/feed` — it has unclear Nuxt 4 compatibility. In server routes, content must be queried with `queryCollection(event, "collection")` imported from `"@nuxt/content/server"` (not the client composable auto-import).

### SEO conventions
Every page must call `useSeoMeta({ title, description })` at minimum — `nuxt-seo-utils` derives everything else automatically.

OG image pattern (all pages):
```js
const { url: siteUrl } = useSiteConfig();
const ogImage = `${siteUrl}/_ipx/f_webp&w_1200&h_630&fit_cover/images/<filename>`;
useSeoMeta({ title, description, ogImage, twitterCard: 'summary_large_image', twitterImage: ogImage });
```

Schema.org pattern:
```js
import { defineOrganization, useSchemaOrg } from '#imports';
useSchemaOrg([defineOrganization({ name: '...', url: '...' })]);
```

Do **not** add: `og:title`, `og:description`, `og:url`, `twitter:title`, `twitter:description`, `<link rel="canonical">` — these are all auto-generated.

### CI/CD
- **GitHub repo:** `technotenshi/newcastle-lgbt`
- `.github/workflows/yarn-nuxt.yml` — runs `yarn install --immutable` then `yarn build` on every push / PR to `main`. Lint is **not** in CI; run `make lint` locally before pushing.
- `.github/dependabot.yml` — weekly automated PRs for npm dependency updates. **Renovate** also runs and may open duplicate/overlapping PRs; the later one is typically superseded and auto-closed.
- **`yarn.lock` drift:** CI uses `--immutable`, so if a dependency merge introduces new transitive deps the lockfile breaks. Fix by running `docker compose run --rm app yarn install` locally and committing the updated `yarn.lock`.
- There are **no automated tests** in this project.

### Styling
Bootstrap 5 + a Mobirise-derived custom theme in `assets/theme/css/style.css`. Use Bootstrap's responsive grid classes (`col-12`, `col-md-*`, `col-lg-*`).

**PurgeCSS runs in production builds.** Any Bootstrap class not statically present in `pages/`, `components/`, `layouts/`, `app.vue`, or `content/` files will be stripped. If you add dynamically-bound class names (e.g., `:class="foo"`), add them to the `safelist` in `nuxt.config.ts` → `postcss.plugins["@fullhuman/postcss-purgecss"].safelist`.

### Prose component overrides
Custom MDC prose components live in `components/content/`. A file there automatically overrides the default `@nuxtjs/mdc` component of the same name for all `<ContentRenderer>` output. Example: `components/content/ProseA.vue` overrides link rendering site-wide.

- `components/content/Dateline.vue` — inline MDC component rendering `**Newcastle, WA** –`; used at the start of every news article body as `:Dateline [first sentence]`

### TypeScript / IDE setup
`tsconfig.json` at the project root extends `.nuxt/tsconfig.json` (generated at dev/build time). This gives the IDE access to all Nuxt-generated type augmentations, including `site` in `NuxtConfig` (from `nuxt-site-config`) and `#imports` auto-imports. Run `make develop` or `make build` once to generate `.nuxt/` before opening the project in an IDE.

### Coding style
- Semicolons required; no unused variables or components (enforced by ESLint)
- PascalCase for component files, camelCase for composables
- Type-safe interfaces for `NewsItem`, `EventItem`, `CouncilMember`, `FeatureItem`
- Vue composables (`computed`, `ref`, `watch`, etc.) must be explicitly imported — they are **not** auto-imported by ESLint config

<!-- skilld -->
Before modifying code, evaluate each installed skill against the current task.
For each skill, determine YES/NO relevance and invoke all YES skills before proceeding.
<!-- /skilld -->
