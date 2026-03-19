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
| `make down` | Stop and remove containers |
| `make logs` | Follow container logs |

After making changes: run `make lint`, then `make build` to confirm the site deploys correctly.

## Architecture

This is a **Nuxt 4 static site** (SSG) for the Newcastle, WA LGBTQ+ community. There is no backend — all data comes from Markdown/JSON files in `content/`, which Nuxt Content parses into a SQLite-backed database at build time.

**Data flow:** Markdown frontmatter → SQLite (via `queryCollection()`) → composables → Vue components → pre-rendered HTML in `.output/public/`

### Content directories
- `content/news/` — News articles (Markdown with YAML frontmatter)
- `content/events/` — Event listings
- `content/council/` — Council member profiles (position-N-*.md)
- `content/features.json` — Homepage feature cards

### Key source directories
- `composables/` — Data fetching layer (`useNews`, `useEvents`, `useCouncil`, `useFeatures`, `useAsset`)
- `pages/` — File-based routing; news uses dynamic route `/news/[year]/[month]/[day]/[slug].vue`
- `components/` — Shared Vue components
- `utils/content.ts` — Normalization helpers (`normaliseString`, `normaliseNumber`, `parseMeta`)
- `utils/assets.ts` — Asset URL resolution (handles `~/assets`, relative paths, external URLs)

### Content conventions
- News slugs follow date-based paths: `/news/YYYY/MM/DD/slug`
- Articles support a `draft: true` frontmatter field to hide them
- Council members are ordered by `position-N` prefix in filename
- Images: prefer `.png` for news/events; always include alt text
- Sorting: news by date DESC then `order` field; events by date ASC
- Full authoring guide (frontmatter fields, filename format, body structure, image conventions, step-by-step instructions): [`docs/content-authoring.md`](docs/content-authoring.md)

### Styling
Bootstrap 5 + a Mobirise-derived custom theme in `assets/theme/css/style.css`. Use Bootstrap's responsive grid classes (`col-12`, `col-md-*`, `col-lg-*`).

### Prose component overrides
Custom MDC prose components live in `components/content/`. A file there automatically overrides the default `@nuxtjs/mdc` component of the same name for all `<ContentRenderer>` output. Example: `components/content/ProseA.vue` overrides link rendering site-wide.

### Coding style
- Semicolons required; no unused variables or components (enforced by ESLint)
- PascalCase for component files, camelCase for composables
- Type-safe interfaces for `NewsItem`, `EventItem`, `CouncilMember`, `FeatureItem`
- Vue composables (`computed`, `ref`, `watch`, etc.) must be explicitly imported — they are **not** auto-imported by ESLint config
