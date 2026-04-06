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
server/
  routes/
    feed.xml.ts # RSS 2.0 feed — pre-rendered to /feed.xml at build time
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
- **Image prompting reference:** use [`docs/image-generation-guide.md`](docs/image-generation-guide.md) alongside the authoring guide whenever generating new raster assets

## Image generation workflow
- Follow both [`docs/content-authoring.md`](docs/content-authoring.md) and [`docs/image-generation-guide.md`](docs/image-generation-guide.md) before writing prompts or saving generated assets.
- Generate news and event art as `.png` files in `assets/images/news/` or `assets/images/events/` using the `YYYYMMDD-##-descriptive-name.png` naming convention.
- Write alt text that describes what is actually visible in the image, not just the article topic; target 50 to 250 characters.
- Do not generate text or logos into AI images. If an event graphic needs typography, add it later in a design tool.
- Do not rely on AI to render Pride or transgender flags accurately. Use palette descriptions instead, or source a real photo when exact flag imagery matters.
- Make LGBTQ+ representation explicit and inclusive in prompts. Avoid stereotypes and do not reference named real people.
- When the user attaches a reference image, treat it as style/composition/background guidance unless they explicitly ask for a true edit. State clearly in the prompt which elements to borrow from the reference and which elements should remain newly generated.
- If a reference image includes signage, logos, branded UI, or readable text, use only its visual characteristics and explicitly exclude readable text/logos in the generation prompt.
- Match the visual style to the content: documentary-style photorealistic images for civic/news coverage, graphic-design or poster-style images for social events.
- If a news article uses both `image` and `imageHeader`, keep them on the same story but make them clearly different in scene, subject, vantage point, or narrative angle.
- Match the site slot ratios when generating or cropping assets: `16:9` for news feature images, news headers, and carousels; `4:3` for event images.
- Practical event-image workflow: generate at `1536x1024`, then crop to the site-ready `1365x1024` `4:3` deliverable.
- For phone, tablet, or computer scenes, explicitly prohibit readable screen text and branded UI in the prompt.
- For small LGBTQ+ visual cues in accessories or clothing, prefer describing a `rainbow-colored` pin or palette accent instead of requesting an exact flag reproduction.
- When editing an existing generated image, restate invariants aggressively, for example `change only the background` or `keep the foreground people and activity unchanged`, because the edit model will drift otherwise.
- When using the image-generation CLI, do not install Python packages into the host environment. Create a repo-local `.venv`, install dependencies there, and run the generator from that virtual environment.
- The CLI requires `OPENAI_API_KEY` to already be available in the shell environment. Do not paste secrets into chat logs; if persistence is needed, edit shell startup files manually rather than appending secrets through shell history.
- The repo-local `.venv/` is ignored by git and can be used for image-generation tooling without affecting tracked project files.

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
- **Vite `optimizeDeps.include`** — `bootstrap/js/dist/collapse.js` and `bootstrap/js/dist/carousel.js` are pre-bundled to prevent CJS discovery warnings in the dev server.
- **`feed`** — generates the RSS 2.0 feed at `/feed.xml` via `server/routes/feed.xml.ts`. Pre-rendered at build time via `nitro.prerender.routes`. Autodiscovery `<link rel="alternate">` is injected via `app.head` in `nuxt.config.ts`. Do not use `@nuxtjs/feed` — it has unclear Nuxt 4 compatibility. In server routes, query content with `queryCollection(event, "collection")` from `"@nuxt/content/server"` (not the client composable auto-import).

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
