# Newcastle LGBT Website

This repository contains the source for the **Newcastle LGBT** site. It is built with [Nuxt 4](https://nuxt.com/) and Vue 3, with most content written in Markdown under the `content/` directory and served through Nuxt Content.

[![Codacy Badge](https://app.codacy.com/project/badge/Grade/458c411819a6488fb55ce082d7cc5d3b)](https://app.codacy.com?utm_source=gh&utm_medium=referral&utm_content=&utm_campaign=Badge_grade)

## Requirements
- Docker + Docker Compose (primary workflow — all `make` targets run inside the container)
- Node.js 24 + Yarn 4 (for local, non-Docker development only; Yarn managed via Corepack)

Install dependencies with:

```bash
yarn install
```

## Nuxt commands
- `yarn dev` – start the development server at `http://localhost:3000`
- `yarn build` – generate the static site into `.output/public`
- `yarn preview` – serve the latest build from `.output/public`

## Local development
Run the dev server locally:

```bash
yarn dev
```

If you are developing inside Docker or a remote environment, expose the server by setting the host:

```bash
HOST=0.0.0.0 yarn dev
```

## Static build & deployment
Create a production build and serve it locally:

```bash
yarn build
yarn preview
```

After `yarn build`, all deployable assets live under `.output/public`. Deploy by copying that directory to your hosting provider. For example, to publish over SSH:

```bash
yarn build
rsync -avz .output/public/ user@server:/var/www/newcastle-lgbt
```

`yarn preview` runs the same Nitro server used in production so you can verify the build before publishing.

## Validation
Run linting and a production build before committing changes:

```bash
yarn lint
yarn build
```

`yarn lint` enforces code style, while `yarn build` verifies the site builds successfully for deployment. To automatically fix lint issues when possible:

```bash
yarn lint:fix
```

## Docker workflow

The project includes a `Dockerfile`, `docker-compose.yml`, and `Makefile` for containerized development. Prefer `make` targets over raw `yarn` commands.

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
| `make git-maintenance` | Prune stale remote refs + run git gc |
| `make down` | Stop and remove containers |
| `make logs` | Follow container logs |

## Project structure

```
pages/          # File-based routing (news uses /news/[year]/[month]/[day]/[slug].vue)
components/     # Shared Vue components (PascalCase filenames)
composables/    # Data-fetching layer: useNews, useEvents, useCouncil, useFeatures, useAsset
layouts/        # default.vue — global header, nav, and footer
server/
  routes/
    feed.xml.ts # RSS 2.0 feed — pre-rendered to /feed.xml at build time
utils/
  content.ts    # Normalization helpers: normaliseString, normaliseNumber, parseMeta
  assets.ts     # Centralized image/asset URL resolution
content/
  news/         # Markdown news articles
  events/       # Markdown event listings
  council/      # Council member profiles (position-N-*.md)
  features.json # Homepage feature cards
assets/         # Static styles and images (Bootstrap 5 + custom Mobirise-derived theme)
plugins/
  bootstrap.client.ts  # Bootstrap JS (client-only) — collapse.js + carousel.js only; Popper.js excluded
```

## Content conventions

**News articles** live in `content/news/` as Markdown files with YAML frontmatter. The URL path is date-based: `/news/YYYY/MM/DD/slug`. Set `draft: true` in frontmatter to hide an article from listings.

**Events** in `content/events/` are sorted by date ascending; past events are filtered out by default.

**Council members** in `content/council/` use the filename prefix `position-N-` to control display order.

**Features** are defined in `content/features.json` as an array of objects consumed by `useFeatures`.

**Images** should use `.png` format and always include descriptive alt text. Asset URLs are resolved through `useAsset` / `utils/assets.ts`, which handles `~/assets` paths, relative paths, and external URLs.

## Coding conventions

- **Naming:** PascalCase for component files (`LatestNews.vue`), camelCase for composables (`useNews.ts`)
- **Style:** Semicolons required; no unused variables or components (enforced by ESLint in `eslint.config.mjs`)
- **Types:** Use the typed interfaces `NewsItem`, `EventItem`, `CouncilMember`, `FeatureItem` from their respective composables
- **Sorting:** News by date DESC then `order` field; events by date ASC; council by `position` number
- **SEO:** Every page calls `useSeoMeta({ title, description })` — `nuxt-seo-utils` auto-generates OG, Twitter, and canonical tags from those two fields. Do not set `og:title`, `og:description`, `og:url`, `twitter:*`, or `<link rel="canonical">` manually. Page titles must be the short form only (e.g. `'News'`) — the site name suffix is appended automatically.
- **RSS feed:** `/feed.xml` is pre-rendered at build time from `server/routes/feed.xml.ts`. It contains the 20 most recent non-draft news articles. RSS autodiscovery `<link>` is injected via `app.head` in `nuxt.config.ts`. A visible "RSS Feed" link appears in the footer.
- **OG images:** Constructed via `useSiteConfig().url` + IPX URL pattern and passed to `useSeoMeta({ ogImage, twitterImage })`.
- **Schema.org:** Use `useSchemaOrg([defineOrganization(...)])` / `useSchemaOrg([defineArticle(...)])` — helpers must be wrapped in `useSchemaOrg([...])`.
- **Links:** No trailing slashes on internal links; no absolute `https://newcastle.lgbt/...` URLs in content (use relative paths). `nuxt-link-checker` enforces this during `make develop` and warnings are treated as errors.
- **Images:** Use `<NuxtImg>` for local images (served via IPX as WebP). Use `loading="lazy"` and `decoding="async"` on plain `<img>` tags.

## CI/CD

A GitHub Actions workflow (`.github/workflows/yarn-nuxt.yml`) runs `yarn install --immutable`, `yarn lint`, and `yarn build` on every push and pull request targeting `main`. Run the same checks locally before pushing. Dependabot (`.github/dependabot.yml`) and Renovate both open automated PRs for npm dependency updates; when both are active, the later PR is typically superseded and auto-closed.

## Modules

| Module | Purpose |
|---|---|
| `@nuxt/content` | Parses Markdown/JSON from `content/` into a SQLite-backed queryable collection |
| `@nuxt/image` | Serves `assets/` images as WebP via IPX (`/_ipx/...`). Use `<NuxtImg>` for local images. |
| `@nuxtjs/sitemap` | Generates `/sitemap.xml` at build time (`zeroRuntime: true`) |
| `@nuxtjs/robots` | Generates `robots.txt` at build time — do not create `public/robots.txt` manually |
| `nuxt-og-image` | Disabled (`enabled: false`) — no Satori renderer configured; OG images set via `useSeoMeta` |
| `nuxt-schema-org` | Schema.org JSON-LD via `useSchemaOrg([defineOrganization(...)])` etc. |
| `nuxt-link-checker` | Checks for broken/malformed links during dev; warnings are treated as errors |
| `nuxt-seo-utils` | Auto-generates OG, Twitter, canonical tags and appends site name to page titles |
| `feed` | Generates the RSS 2.0 feed at `/feed.xml` via `server/routes/feed.xml.ts` (pre-rendered at build time) |

## License
This project is released under the MIT License. See [LICENSE](LICENSE) for details.
