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
- All major pages set SEO metadata via `useSeoMeta` (title, description, OG/Twitter tags).
- Use `lazy` attribute and `decoding="async"` on `<img>` tags.
- Vue composables (`computed`, `ref`, `watch`, etc.) must be explicitly imported — not auto-imported.

## Prose component overrides
Custom MDC prose components in `components/content/` override the default `@nuxtjs/mdc` rendering for all `<ContentRenderer>` output. Example: `ProseA.vue` overrides link rendering site-wide (external links open in a new tab).

## Commit messages
- Write clear, concise commit messages describing what changed and why.
