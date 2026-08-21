# Guidelines for Codex Agents

This project is a Nuxt 4 static site for the Newcastle, Washington LGBTQ+ community. The site is built with Vue 3, Yarn 4, and Nuxt Content. Most editorial work happens in `content/`, while most product work happens in `pages/`, `components/`, `composables/`, and `nuxt.config.ts`.

## Commands

The project runs in Docker via `make`. Prefer `make` targets over raw `yarn` commands when working interactively.

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
| `make git-maintenance` | Prune stale remote refs and run git garbage collection |
| `make down` | Stop and remove containers |
| `make logs` | Follow container logs |

After making changes: run `make lint`, then `make build`.

Non-TTY caveat: most `make` targets use `docker compose run -it`, which fails in CI or other non-interactive shells. In those cases, run the underlying command directly, for example `docker compose run --rm app yarn build`.

## Architecture

This is a static Nuxt site with no application backend. Content is sourced from Markdown and JSON files, loaded through Nuxt Content, normalized in composables and utilities, then prerendered to static output.

Data flow:
`content/*` frontmatter/body -> Nuxt Content SQLite store -> `queryCollection("content")` -> composables/utilities -> Vue pages/components -> `.output/public`

All site content is registered under a single collection in `content.config.ts`:

```ts
collections: {
  content: defineCollection({
    type: "page",
    source: "**",
  }),
}
```

Composables filter by path prefixes such as `/news/%`, `/events/%`, and `/council/%`.

## Project structure

```text
pages/                    # File-based routing; news uses /news/[year]/[month]/[day]/[slug].vue
components/               # Shared Vue components and MDC prose overrides
components/content/       # ProseA, Dateline, and other MDC renderer overrides
composables/              # Data layer: useNews, useEvents, useCouncil, useFeatures, useAsset
layouts/                  # default.vue global shell
plugins/
  bootstrap.client.ts     # Imports Bootstrap collapse + carousel only
server/
  routes/
    feed.xml.ts           # RSS 2.0 feed prerendered to /feed.xml
content.config.ts         # Single Nuxt Content collection definition
utils/
  content.ts              # normaliseString, normaliseNumber, normaliseBody, parseMeta, toPlainText
  assets.ts               # normalizeAssetPath helper for NuxtImg/IPX
content/
  news/                   # Markdown news articles
  events/                 # Markdown event listings
  council/                # Council member profiles; filename prefix controls order
  features.json           # Homepage feature cards
assets/                   # Bootstrap, Mobirise theme, and local images
public/                   # Static passthrough files such as _headers
```

Special case: `pages/organizations/index.vue` is hardcoded in the component and does not read from `content/`.

## Content conventions

- News routes are date-based: `/news/YYYY/MM/DD/slug`
- News articles support `draft: true` and future-dated entries; published listings exclude drafts and dates later than the current Pacific date
- Events are sorted ascending by date and exclude past events by default
- Council member filenames must start with `position-N-` to control display order
- Use the typed interfaces `NewsItem`, `EventItem`, `CouncilMember`, and `FeatureItem`
- Use [`docs/content-authoring.md`](docs/content-authoring.md) for filename format, frontmatter fields, body structure, and authoring workflow
- Use [`docs/image-generation-guide.md`](docs/image-generation-guide.md) alongside the authoring guide whenever generating raster assets

## Image generation workflow

- Follow both [`docs/content-authoring.md`](docs/content-authoring.md) and [`docs/image-generation-guide.md`](docs/image-generation-guide.md) before writing prompts or saving generated assets
- Generate news and event art as `.png` files in `assets/images/news/` or `assets/images/events/` using the `YYYYMMDD-##-descriptive-name.png` naming convention
- Write alt text that describes what is actually visible in the image, not just the article topic; target 50 to 250 characters
- Do not generate text or logos into AI images. If an event graphic needs typography, add it later in a design tool
- Do not rely on AI to render Pride or transgender flags accurately. Use palette descriptions instead, or source a real photo when exact flag imagery matters
- Make LGBTQ+ representation explicit and inclusive in prompts. Avoid stereotypes and do not reference named real people
- When the user attaches a reference image, treat it as style, composition, or background guidance unless they explicitly ask for a true edit
- If a reference image includes signage, logos, branded UI, or readable text, borrow only its visual characteristics and explicitly exclude readable text and logos in the prompt
- Match the visual style to the content: documentary-style photorealistic images for civic/news coverage, graphic-design or poster-style images for social events
- If a news article uses both `image` and `imageHeader`, keep them on the same story but make them clearly different in scene, subject, vantage point, or narrative angle
- Match slot ratios: `16:9` for news feature images, news headers, and carousels; `4:3` for event images
- Practical event-image workflow: generate at `1536x1024`, then crop to the site-ready `1365x1024` `4:3` deliverable
- For phone, tablet, or computer scenes, explicitly prohibit readable screen text and branded UI in the prompt
- For small LGBTQ+ visual cues in accessories or clothing, prefer a `rainbow-colored` pin or palette accent instead of requesting an exact flag reproduction
- When editing an existing generated image, restate invariants aggressively, for example `change only the background` or `keep the foreground people and activity unchanged`
- When using the image-generation CLI, do not install Python packages into the host environment. Create a repo-local `.venv`, install dependencies there, and run the generator from that virtual environment
- The CLI requires `OPENAI_API_KEY` to already be available in the shell environment. Do not paste secrets into chat logs

## Coding style

- Follow the existing Vue and JavaScript style; ESLint rules live in `eslint.config.mjs`
- Use semicolons and avoid unused variables or unused components
- PascalCase for component filenames, camelCase for composables
- Vue composables such as `computed`, `ref`, and `watch` must be explicitly imported
- Prefer `<NuxtImg>` for local images
- Plain `<img>` tags should include `loading="lazy"` and `decoding="async"`
- Use `normalizeAssetPath` from `utils/assets.ts` when passing local image paths to `<NuxtImg>`
- Use `useAsset` from `composables/useAsset.ts` when you need runtime asset URL resolution across local, relative, and external inputs

## Styling

- The site uses Bootstrap 5 plus a Mobirise-derived theme in `assets/theme/css/style.css`
- `plugins/bootstrap.client.ts` imports only `bootstrap/js/dist/collapse.js` and `bootstrap/js/dist/carousel.js`
- If you add another Bootstrap JS feature, import it in `plugins/bootstrap.client.ts` and add it to `vite.optimizeDeps.include` in `nuxt.config.ts`
- PurgeCSS runs in production builds. Any class names generated dynamically may need to be added to the safelist in `nuxt.config.ts`

## Prose component overrides

Custom MDC prose components in `components/content/` override the default `@nuxtjs/mdc` renderers for all `<ContentRenderer>` output.

Examples:
- `components/content/ProseA.vue` overrides link rendering site-wide
- `components/content/Dateline.vue` powers the `:Dateline` inline component used at the start of news article bodies

## Modules and integrations

- `@nuxt/content` stores content in a SQLite-backed data layer queried with `queryCollection("content")`
- `@nuxt/image` serves local `assets/` images through IPX; use `<NuxtImg>` for local assets
- `@nuxtjs/sitemap` generates `/sitemap.xml` from prerendered routes and reads `site.url` from `nuxt.config.ts`
- `@nuxtjs/robots` generates `robots.txt` at build time; do not add `public/robots.txt`
- `nuxt-og-image` is disabled with `ogImage: { enabled: false }`; OG images are set manually with `useSeoMeta`
- `nuxt-schema-org` requires wrapping helpers inside `useSchemaOrg([...])`
- `nuxt-link-checker` runs during development and warnings should be treated as errors
- `nuxt-seo-utils` auto-generates canonical and social metadata from `useSeoMeta({ title, description })`
- `seo.fallbackTitle` is disabled in `nuxt.config.ts` to avoid a `nuxt-seo-utils` fallback-title bug
- Simple Analytics is injected in `nuxt.config.ts`
- `server/routes/feed.xml.ts` generates the RSS feed at `/feed.xml`; in server routes, import `queryCollection` from `@nuxt/content/server`

## SEO conventions

Every page must call `useSeoMeta({ title, description })` at minimum.

OG image pattern:

```js
const { url: siteUrl } = useSiteConfig();
const ogImage = `${siteUrl}/_ipx/f_webp&w_1200&h_630&fit_cover/images/<filename>`;
useSeoMeta({
  title,
  description,
  ogImage,
  twitterCard: "summary_large_image",
  twitterImage: ogImage,
});
```

Schema.org pattern:

```js
import { defineOrganization, useSchemaOrg } from "#imports";

useSchemaOrg([
  defineOrganization({ name: "...", url: "..." }),
]);
```

Do not add manually: `og:title`, `og:description`, `og:url`, `twitter:title`, `twitter:description`, or `<link rel="canonical">`.

## TypeScript and IDE setup

`tsconfig.json` extends `.nuxt/tsconfig.json`, which is generated during `make develop` or `make build`. Run one of those commands before relying on IDE type support in a fresh checkout.

## CI/CD

- `.github/workflows/yarn-nuxt.yml` runs `yarn install --immutable` and `yarn build` on pushes and pull requests to `main`
- CI currently does not run lint
- There are no automated tests in this repository
- `.github/dependabot.yml` manages weekly npm dependency update PRs

## Commit messages

- Write clear, concise commit messages describing what changed and why

## Cross-tool working agreements (added 2026-08-05)

`~/HARNESS.md` is the canonical agreement for all AI tools (Hermes, Claude Code, ChatGPT/Codex).
- `docs/DECISIONS.md` is this repo's decision log — read before planning, append when a decision is made or reversed.
- Infra-mutating actions need explicit approval in the current session.
- Never claim success without real verification.
