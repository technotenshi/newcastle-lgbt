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

**Dependency bumps touching `@nuxt/image`, IPX, or the static/prerender pipeline require verification with a real static build (`make build`/`make prod`, not `make develop`).** The dev server (`nuxt dev`) never exercises Nitro's prerender crawler, so image-generation regressions in the static output are invisible in dev and only surface after deploy. Verify by checking `.output/public/_ipx` is non-empty and serving it statically (`npx serve .output/public`) to confirm `/_ipx/...` URLs return 200, matching how Cloudflare Pages actually serves the site.

**Never delete `yarn.lock`** to resolve a merge/rebase conflict or "start fresh" — deleting it removes yarn's pinned-resolution guardrail and lets it silently re-resolve any package to the newest version satisfying its `package.json` range, which can reintroduce an already-reverted broken version. To reconcile `yarn.lock` across branches: resolve `package.json` first, restore `yarn.lock` from the correct base ref with `git checkout <ref> -- yarn.lock`, then run `yarn install` to layer in only the new changes.

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
- This is an activism site, not neutral journalism: articles on anti-LGBTQ+ policy, legislation, or the people and organizations behind them must reach a critical, evidence-backed conclusion rather than a neutral "both sides" summary, and must fact-check claims from supporters and opponents alike. The site is not afraid to name a specific donor, legislator, spokesperson, executive, or candidate by name when a source (a filing, a quote, a roll-call vote) ties them directly to it, rather than retreating to the institution's name alone. Follow [`docs/editorial-checklist.md`](docs/editorial-checklist.md) for any article on sensitive historical/political LGBTQ+ topics (movement history, government policy, discrimination, corporate accountability)
- Recurring subjects (an organization, a political committee, a specific individual) get a standing background file in `docs/research/` (e.g. `docs/research/lets-go-washington.md`). When an article names a subject with one of these files, pull relevant context from it so unfamiliar readers get real background, not just a bare name. See `docs/content-authoring.md` for the full convention
- When covering a Washington bill or initiative, verify its primary text rather than relying on a secondary summary. Ballot-initiative PDFs on `sos.wa.gov` may reject automated retrieval, while enacted-bill PDFs on `lawfilesext.leg.wa.gov` are usually accessible. Inspect the retrieved PDF's visual strikeout/underline markup to determine exactly what changes from current law.
- Cite sources Wikipedia-style: a `[^N]` footnote marker after each specific factual claim at first mention, numbered by order of appearance (not alphabetical), reused for a source cited again later, never a hyperlink wrapped around the claim text itself. The closing `## Sources` section is `[^N]: ...` footnote definitions in that same numeric order, each formatted as a full APA 7th-edition reference (author/org, date, italicized title, bare `[URL](URL)`). This renders natively through this site's `remark-gfm` markdown pipeline as numbered superscripts with automatic back-links, no custom component needed. Full rules and a worked example: [`docs/content-authoring.md`](docs/content-authoring.md#citations-and-sources-wikipedia-style-footnotes-apa7-entries).
- `federalregister.gov` runs aggressive, inconsistent bot detection and can serve a `unblock.federalregister.gov` reCAPTCHA wall to automated fetches (or even a real browser session) on some requests and not others from the same source. A single successful fetch showing the document's real title and text is enough to confirm a citation is correct; don't treat a later CAPTCHA redirect as proof the link is broken.

## Image generation workflow

- Follow both [`docs/content-authoring.md`](docs/content-authoring.md) and [`docs/image-generation-guide.md`](docs/image-generation-guide.md) before writing prompts or saving generated assets
- **Actual generation is delegated to the local Codex CLI** via `codex exec`, invoking its native image-generation tool, not a bespoke Python script. See `.agents/skills/generate-images/SKILL.md` for the exact invocation pattern, verification steps (dimension check + visual review against the rules below), and per-slot fallback to manual DALL-E/Midjourney prompts if generation fails twice. There is no repo-local `.venv` and no `OPENAI_API_KEY` requirement for this path, that describes an older workflow this repo no longer uses.
- Generate news and event art as `.png` files in `assets/images/news/` or `assets/images/events/` using the `YYYYMMDD-##-descriptive-name.png` naming convention
- Write alt text that describes what is actually visible in the image, not just the article topic; target 50 to 250 characters
- Do not generate text or logos into AI images. If an event graphic needs typography, add it later in a design tool
- Do not rely on AI to render Pride or transgender flags accurately. Use palette descriptions instead, or source a real photo when exact flag imagery matters
- Racial diversity must be explicit in every prompt: "racially diverse group including people of various ethnicities and skin tones, with people of color prominently represented", not just "diverse". Include a subtle LGBTQ+ motif (pride pin, wristband, palette accent) in every image, and avoid stereotypes or named real people
- Never write "overcast"/"cloudy"/"grey skies"/"diffused light" into a prompt; use golden-hour, bright midday, warm morning, or warm indoor lighting instead
- When the user attaches a reference image, treat it as style, composition, or background guidance unless they explicitly ask for a true edit
- If a reference image includes signage, logos, branded UI, or readable text, borrow only its visual characteristics and explicitly exclude readable text and logos in the prompt
- Match the visual style to the content: documentary-style photorealistic images for civic/news coverage, graphic-design or poster-style images for social events
- If a news article uses both `image` and `imageHeader`, keep them on the same story but make them clearly different in scene, subject, vantage point, or narrative angle
- Match slot ratios and exact pixel sizes: `16:9` / `1792x1024` for news feature images, news headers, and carousels; `4:3` / `1024x768` for event images (via `gpt-image-1`/`gpt-image-2`, DALL-E 3 has no true 4:3 fixed size)
- For phone, tablet, or computer scenes, explicitly prohibit readable screen text and branded UI in the prompt
- When editing an existing generated image, restate invariants aggressively, for example `change only the background` or `keep the foreground people and activity unchanged`

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

- `.github/workflows/yarn-nuxt.yml` runs `yarn install --immutable`, `yarn lint`, and `yarn build` on pushes and pull requests to `main`
- There are no automated tests in this repository
- `.github/dependabot.yml` manages weekly npm dependency update PRs

## Commit messages

- Write clear, concise commit messages describing what changed and why

## Skills

- Project skill files are mirrored in `.claude/skills/<name>/SKILL.md` (Claude Code) and `.agents/skills/<name>/SKILL.md` (Codex). When changing one, update the other and confirm they match with `diff`.
- Those files are three directories below the repository root, so their links to `docs/*.md` use `../../../`.
- Quote a skill frontmatter `description:` that contains a colon followed by a space; otherwise strict YAML parsers can interpret it as a nested mapping.

Project-specific skills relevant to this repo (both a Claude Code slash command and an `.agents/skills/<name>/SKILL.md` file Codex can read directly):

| Skill | What it does |
|---|---|
| `new-article` | Scaffold a news article or event: correct filename (`YYYYMMDD-##-slug.md`), frontmatter, body structure, date-past warning for events; invokes `generate-images` afterward |
| `content-check` | Pre-publish validator: em dashes, absolute internal URLs, missing frontmatter fields, lingering `draft: true`, image alt text rules, citation/footnote formatting |
| `image-prompt` | Generate DALL-E 3 + Midjourney v7 prompts for all image slots per `docs/image-generation-guide.md` rules |
| `generate-images` | Delegate actual image file generation to the local Codex CLI (`codex exec`) for every image slot |
| `ics-event` | Generate an iCal file and Google Calendar URL from an event's frontmatter and body |
| `seo-check` | Audit a page's `useSeoMeta`, OG image IPX pattern, Schema.org, and the no-manual-tags rule |
| `backlog` | Read `docs/improvement-tasks.md` and `docs/lighthouse/audit-results.md` and recommend the highest-impact, lowest-effort open items |
| `merge-prs` | Merge multiple open PRs into one integration branch, resolving conflicts and running lint and build |
| `research` | Investigate a subject against primary sources and save findings to `docs/research/` |

Several other generic third-party skills (the mattpocock/skills pack, `code-review`, `tdd`, `resolving-merge-conflicts`, `diagnosing-bugs`, etc.) are also installed but are not project-specific, they apply generically across repos.

## Cross-tool agent conventions

Conventions shared with Claude Code (see `CLAUDE.md`) that apply the same way here:

- **Issue tracker:** GitHub Issues via the `gh` CLI. See [`docs/agents/issue-tracker.md`](docs/agents/issue-tracker.md).
- **Triage labels:** the default five-role vocabulary (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`), no repo-specific renames. See [`docs/agents/triage-labels.md`](docs/agents/triage-labels.md).
- **Domain docs:** single-context repo, one `CONTEXT.md` plus `docs/adr/` at the root once created; neither exists yet, `docs/DECISIONS.md` is the decision log in the meantime. See [`docs/agents/domain.md`](docs/agents/domain.md).

## Claude Code hooks (context, not enforced for Codex)

Claude Code sessions in this repo run automatic hooks configured in `.claude/settings.json`, including a hard block (not just a warning) on any edit to `.env`, `.env.*`, or `yarn.lock`, plus lint-on-save and content-convention reminders (em dashes, absolute internal URLs, editorial-checklist phrases). Codex has no equivalent enforcement mechanism, so apply the same underlying rules manually: never edit `.env`/`yarn.lock` directly, run lint after edits, and self-check content against `docs/content-authoring.md` and `docs/editorial-checklist.md` before finishing.

## Cross-tool working agreements (added 2026-08-05)

`~/HARNESS.md` is the canonical agreement for all AI tools (Hermes, Claude Code, ChatGPT/Codex).
- `docs/DECISIONS.md` is this repo's decision log, read before planning, append when a decision is made or reversed.
- Infra-mutating actions need explicit approval in the current session.
- Never claim success without real verification.
