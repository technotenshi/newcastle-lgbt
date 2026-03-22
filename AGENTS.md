# Guidelines for Codex Agents

This project is a Nuxt-powered static website built with Vue 3 and Yarn. Most content lives in the `pages/` and `content/` directories.

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
| `make audit` | Dependency vulnerability audit |
| `make peer-requirements` | Explain yarn peer dependency requirements |
| `make down` | Stop and remove containers |
| `make logs` | Follow container logs |

After making changes: run `make lint`, then `make build`.

## Project structure

```
pages/          # File-based routing; news uses /news/[year]/[month]/[day]/[slug].vue
components/     # Shared Vue components (PascalCase filenames)
composables/    # Data-fetching layer: useNews, useEvents, useCouncil, useFeatures, useAsset
layouts/        # default.vue — global header, nav, and footer
utils/
  content.ts    # Normalization helpers: normaliseString, normaliseNumber, parseMeta
  assets.ts     # Centralized image/asset URL resolution
content/
  news/         # Markdown news articles (YAML frontmatter, draft: true to hide)
  events/       # Markdown event listings (sorted ascending, past events filtered by default)
  council/      # Council member profiles; filename prefix position-N- controls order
  features.json # Homepage feature cards array
assets/         # Static styles and images (Bootstrap 5 + Mobirise-derived theme)
```

## Content conventions
- **News slugs:** date-based paths `/news/YYYY/MM/DD/slug`; set `draft: true` in frontmatter to exclude from listings
- **Council members:** filename must start with `position-N-` to control display order
- **Images:** prefer `.png` format; always include alt text; resolve URLs through `useAsset` / `utils/assets.ts`
- **Sorting:** news by date DESC then `order` field; events by date ASC
- **Full authoring guide** (frontmatter fields, filename format, body conventions, image rules, step-by-step instructions for creating articles and events): [`docs/content-authoring.md`](docs/content-authoring.md)

## Coding style
- Follow the existing Vue and JavaScript style. ESLint rules are defined in `eslint.config.mjs`.
- Use semicolons and avoid unused variables or components.
- PascalCase for component filenames, camelCase for composables.
- Use the typed interfaces `NewsItem`, `EventItem`, `CouncilMember`, `FeatureItem` from their composables.
- Vue composables (`computed`, `ref`, `watch`, etc.) must be explicitly imported — not auto-imported.
- Use `lazy` attribute and `decoding="async"` on `<img>` tags; prefer `<NuxtImg>` for local images.

## Prose component overrides
Custom MDC prose components in `components/content/` override the default `@nuxtjs/mdc` rendering for all `<ContentRenderer>` output. Example: `ProseA.vue` overrides link rendering site-wide (external links open in a new tab).

## Modules & integrations
- **`@nuxt/image`** — serves `assets/` images as WebP via IPX (`/_ipx/...`). Use `<NuxtImg>` for all local images.
- **`@nuxtjs/sitemap`** — generates `/sitemap.xml` at build time from prerendered routes; reads `site.url` in `nuxt.config.ts`. `zeroRuntime: true` is set because all content is static.
- **`@nuxtjs/robots`** — generates `robots.txt` at build time. Do not create `public/robots.txt` manually.
- **`nuxt-og-image`** — currently **disabled** (`ogImage: { enabled: false }`) because no Satori renderer is configured and its interactive prompt breaks non-TTY Docker. OG images are set via `useSeoMeta({ ogImage, twitterImage })` using IPX URLs constructed with `useSiteConfig().url`.
- **`nuxt-schema-org`** — provides `useSchemaOrg([...])` with factory helpers (`defineOrganization`, `defineArticle`). Always wrap helpers in `useSchemaOrg([...])` — they are not self-registering composables.
- **`nuxt-link-checker`** — runs during `make develop` and warns about broken or malformed links. Warnings are treated as errors: fix them. Common rules: no trailing slashes on internal links, no absolute `https://newcastle.lgbt/...` URLs (use relative paths instead).
- **`nuxt-seo-utils`** — auto-generates `og:title`, `og:description`, `og:url`, `og:site_name`, `twitter:*`, and `<link rel="canonical">` from `useSeoMeta({ title, description })`. Do **not** set these manually. Also appends ` | Newcastle LGBTQ Voice` to every page `<title>` — use short-form titles only (e.g. `'News'`, not `'News | Newcastle LGBTQ Voice'`).
- **Simple Analytics** — privacy-friendly analytics injected in `nuxt.config.ts`; no configuration needed.

## SEO conventions
Every page must call `useSeoMeta({ title, description })` at minimum — `nuxt-seo-utils` derives everything else automatically.

OG image pattern:
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

Do **not** add manually: `og:title`, `og:description`, `og:url`, `twitter:title`, `twitter:description`, `<link rel="canonical">`.

## TypeScript / IDE setup
`tsconfig.json` at the project root extends `.nuxt/tsconfig.json` (generated at dev/build time). Run `make develop` or `make build` once to generate `.nuxt/` before opening in an IDE.

## CI/CD
- `.github/workflows/yarn-nuxt.yml` — lint + build checks run on every push/PR to `main`
- `.github/dependabot.yml` — weekly npm dependency update PRs

## Commit messages
- Write clear, concise commit messages describing what changed and why.
