# Agent Guidelines

This project is a Nuxt 4 static site for the Newcastle, Washington LGBTQ+ community. The site is built with Vue 3, Yarn 4, and Nuxt Content. Most editorial work happens in `content/`, while most product work happens in `pages/`, `components/`, `composables/`, and `nuxt.config.ts`.

This file is the single source of agent instructions for every tool (Claude Code, Codex, others). Do not add a `CLAUDE.md`: Claude Code reads `AGENTS.md` only when no `CLAUDE.md` exists in the working directory or above it. Skills and subagents live under `.agents/` (see [Skills and subagents](#skills-and-subagents)).

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

Non-TTY caveat: most `make` targets use `docker compose run -it`, which fails in CI or other non-interactive shells. In those cases, run the underlying command directly, for example `docker compose run --rm app yarn build`. Other quirks (silent foreground stall, the harmless `NUXT_B2005` dev warning): [`docs/tooling-notes.md`](docs/tooling-notes.md#docker-and-make-quirks).

**Dependency bumps touching `@nuxt/image`, IPX, or the static/prerender pipeline require verification with a real static build (`make build`/`make prod`, not `make develop`).** The dev server (`nuxt dev`) never exercises Nitro's prerender crawler, so image-generation regressions in the static output are invisible in dev and only surface after deploy. Verify by checking `.output/public/_ipx` is non-empty and serving it statically (`npx serve .output/public`) to confirm `/_ipx/...` URLs return 200, matching how Cloudflare Pages actually serves the site.

**Never delete `yarn.lock`** to resolve a merge/rebase conflict or "start fresh". Deleting it removes yarn's pinned-resolution guardrail and lets it silently re-resolve any package to the newest version satisfying its `package.json` range, which can reintroduce an already-reverted broken version. To reconcile `yarn.lock` across branches: resolve `package.json` first, restore `yarn.lock` from the correct base ref with `git checkout <ref> -- yarn.lock`, then run `yarn install` to layer in only the new changes.

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

- `pages/`: file-based routing; news uses `/news/[year]/[month]/[day]/[slug].vue`. `pages/organizations/index.vue` is hardcoded in the component and does not read from `content/`
- `components/` (shared Vue components) and `components/content/` (MDC prose renderer overrides such as `ProseA`, `Dateline`)
- `composables/`: data layer (`useNews`, `useEvents`, `useCouncil`, `useFeatures`, `useAsset`) plus `useSocialImage` (OG image URL and prerender registration)
- `utils/content.ts` (`normaliseString`, `normaliseNumber`, `normaliseBody`, `parseMeta`, `toPlainText`) and `utils/assets.ts` (`normalizeAssetPath` for NuxtImg/IPX)
- `layouts/default.vue` (global header, nav, footer), `plugins/bootstrap.client.ts` (Bootstrap collapse and carousel only), `server/routes/feed.xml.ts` (RSS feed prerendered to `/feed.xml`)
- `content/`: `news/`, `events/`, `council/` (filename prefix controls order), `features.json` (homepage cards); `content.config.ts` defines the single collection
- `scripts/` (build-output checks), `assets/` (Bootstrap, Mobirise theme, local images), `public/` (static passthrough such as `_headers`), `docs/` (guides, decision log, research dossiers, maintenance playbooks)

## Content conventions

- News routes are date-based: `/news/YYYY/MM/DD/slug`
- News articles support `draft: true` and future-dated entries; published listings exclude drafts and dates later than the current Pacific date
- Sorting: news by date descending, then `order`; events by date ascending (past events excluded by default), then `order` **descending** within a date; council members by the `position-N-` filename prefix, which every council filename must start with. Council portraits are real official photos from `newcastlewa.gov`, not AI-generated
- Use the typed interfaces `NewsItem`, `EventItem`, `CouncilMember`, and `FeatureItem`
- Use [`docs/content-authoring.md`](docs/content-authoring.md) for filename format, frontmatter fields, body structure, and authoring workflow
- Use [`docs/image-generation-guide.md`](docs/image-generation-guide.md) alongside the authoring guide whenever generating raster assets
- No em dashes (`—`) in content, including blockquote attributions: write `> *Attribution Name*`, not `> — Attribution Name`. En dashes are correct for numeric ranges
- `imageHeader.alt` is not an image description: it is a one-line engagement teaser shown as a caption under the header image
- Events: with no registration or ticketing URL, link the organizer's site with `link.text: "More Information"`; the `link` button renders after the body, so write "link below", never "link above"; optional `image.credit` shows "Photo: {name}" (name only, no contact info)
- This is an activism site, not neutral journalism: articles on anti-LGBTQ+ policy, legislation, or the people and organizations behind them must reach a critical, evidence-backed conclusion rather than a neutral "both sides" summary, and must fact-check claims from supporters and opponents alike. The site is not afraid to name a specific donor, legislator, spokesperson, executive, or candidate by name when a source (a filing, a quote, a roll-call vote) ties them directly to it, rather than retreating to the institution's name alone. Follow [`docs/editorial-checklist.md`](docs/editorial-checklist.md) for any article on sensitive historical/political LGBTQ+ topics (movement history, government policy, discrimination, corporate accountability)
- Recurring subjects (an organization, a political committee, a specific individual) get a standing background file in `docs/research/` (e.g. `docs/research/lets-go-washington.md`). When an article names a subject with one of these files, pull relevant context from it so unfamiliar readers get real background, not just a bare name. See `docs/content-authoring.md` for the full convention
- When covering a Washington bill or initiative, verify its primary text rather than relying on a secondary summary, and inspect the PDF's strikeout/underline markup to see exactly what changes from current law. Retrieval quirks (`sos.wa.gov`, `federalregister.gov` CAPTCHA wall, checking that a link resolves): [`docs/content-authoring.md`](docs/content-authoring.md#verifying-sources-and-citation-urls)
- Cite sources Wikipedia-style: a `[^N]` footnote marker after each specific factual claim at first mention, numbered by order of appearance (not alphabetical), reused for a source cited again later, never a hyperlink wrapped around the claim text itself. The closing `## Sources` section is `[^N]: ...` footnote definitions in that same numeric order, each formatted as a full APA 7th-edition reference (author/org, date, italicized title, bare `[URL](URL)`). This renders natively through this site's `remark-gfm` markdown pipeline as numbered superscripts with automatic back-links, no custom component needed. Full rules and a worked example: [`docs/content-authoring.md`](docs/content-authoring.md#citations-and-sources-wikipedia-style-footnotes-apa7-entries)

## Image generation workflow

Full agent rules: [`docs/image-generation-guide.md`](docs/image-generation-guide.md#agent-workflow-and-non-negotiables), alongside [`docs/content-authoring.md`](docs/content-authoring.md). Read both before writing prompts or saving generated assets.

- **Generation is delegated to the local Codex CLI** via `codex exec` (native image tool, no Python script, no `OPENAI_API_KEY`). Invocation, verification, and fallback: `.agents/skills/generate-images/SKILL.md`
- Save `.png` files as `assets/images/news/` or `assets/images/events/` `YYYYMMDD-##-descriptive-name.png`; sizes are `16:9` / `1792x1024` for news and `4:3` / `1024x768` for events
- Alt text describes what is visible, 50 to 250 characters. No text, logos, or flag artwork in AI images. Every prompt names racial diversity explicitly and includes a subtle LGBTQ+ motif. Never write overcast/cloudy lighting

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
- Custom MDC prose components in `components/content/` override the default `@nuxtjs/mdc` renderers for all `<ContentRenderer>` output (`ProseA.vue` for links, `Dateline.vue` for the `:Dateline` component that opens news article bodies)

## Modules and integrations

Full notes for every module: [`docs/tooling-notes.md`](docs/tooling-notes.md#modules-and-integrations). The rules that change how you write code:

- `@nuxt/content` stores content in a SQLite-backed data layer queried with `queryCollection("content")`
- `@nuxt/image` serves local `assets/` images through IPX; use `<NuxtImg>` for local assets
- `@nuxtjs/robots` generates `robots.txt` at build time; do not add `public/robots.txt`
- `nuxt-og-image` is disabled with `ogImage: { enabled: false }`; OG images are set manually with `useSeoMeta`
- `nuxt-schema-org` requires wrapping helpers inside `useSchemaOrg([...])`
- `nuxt-link-checker` runs during development and warnings should be treated as errors (no trailing slashes on internal links, no absolute `https://newcastle.lgbt/...` URLs)
- `nuxt-seo-utils` auto-generates canonical and social metadata and appends ` | Newcastle LGBTQ Voice` to every `<title>`, so page titles use the short form only (`'News'`)
- `server/routes/feed.xml.ts` generates the RSS feed at `/feed.xml`; in server routes, import `queryCollection` from `@nuxt/content/server`

## SEO conventions

Every page must call `useSeoMeta({ title, description })` at minimum.

OG image pattern (use the helper, never build the `/_ipx/...` URL by hand):

```js
// Omit the argument for the default image. Call it synchronously in setup,
// after any awaited content, so prerenderRoutes has a Nuxt context.
const ogImage = useSocialImage("images/<filename>");
useSeoMeta({
  title,
  description,
  ogImage,
  twitterCard: "summary_large_image",
  twitterImage: ogImage,
});
```

`useSocialImage` (`composables/useSocialImage.ts`) returns the absolute URL and registers the same local IPX path with `prerenderRoutes`. Nitro's crawler only follows `href` attributes, so a hand-built URL in `<meta content>` never gets generated and 404s in the static output. After a full build, run `node scripts/verify-social-images.mjs` (CI does this); it fails when any referenced local social image is missing, not an image, or not 1200x630.

Schema.org: wrap factory helpers in `useSchemaOrg([defineOrganization({ name: "...", url: "..." })])` (import both from `#imports`).

Do not add manually: `og:title`, `og:description`, `og:url`, `twitter:title`, `twitter:description`, or `<link rel="canonical">`.

## TypeScript and IDE setup

`tsconfig.json` extends `.nuxt/tsconfig.json`, which is generated during `make develop` or `make build`. Run one of those commands before relying on IDE type support in a fresh checkout.

## CI/CD

Details (Dependabot and Renovate overlap, `yarn.lock` drift, Copilot review): [`docs/tooling-notes.md`](docs/tooling-notes.md#cicd).

- `.github/workflows/yarn-nuxt.yml` runs `yarn install --immutable`, `yarn lint`, `yarn build`, and `node scripts/verify-social-images.mjs` on pushes and pull requests to `main`
- `.github/workflows/dependency-audit.yml` runs `scripts/audit-gate.mjs` (a recursive Yarn audit) on pushes to `main`, weekly, and on pull requests that change `package.json`, `yarn.lock` or the gate files. It fails on critical or high findings without an entry in [`docs/maintenance/audit-exceptions.md`](docs/maintenance/audit-exceptions.md) and on entries past their review date. Its unit tests run with `node --test scripts/audit-gate.test.mjs`
- There are no automated tests for the site; the only tests cover the audit gate (`node --test scripts/audit-gate.test.mjs`)
- `.github/dependabot.yml` manages weekly npm dependency update PRs
- When a Renovate PR changes `package.json` but leaves `yarn.lock` stale ("Artifact update problem", Yarn 1.22.22 vs `packageManager`), follow [`docs/maintenance/2026-10-24-renovate-stale-lockfile.md`](docs/maintenance/2026-10-24-renovate-stale-lockfile.md)

## Commit messages

- Write clear, concise commit messages describing what changed and why
- A Husky `pre-commit` hook blocks any commit while `HEAD` is `main`; work on a feature branch

## Skills and subagents

- `.agents/skills/<name>/SKILL.md` is the only home for project skills. `.claude/skills` is a symlink to `.agents/skills`, so there is no second copy to keep in sync. Edit the `.agents` path.
- `.agents/agents/` holds project subagents; `.claude/agents` is a symlink to it. `content-reviewer` enforces the content conventions above and the advocacy-forward stance (critical conclusions, naming individuals when a source ties them to the claim, drawing on `docs/research/`).
- Skill files are three directories below the repository root, so their links to `docs/*.md` use `../../../`.
- Quote a skill frontmatter `description:` that contains a colon followed by a space; otherwise strict YAML parsers can interpret it as a nested mapping.

Project-specific skills (each `SKILL.md` describes itself): `new-article`, `content-check`, `fact-check`, `image-prompt`, `generate-images`, `ics-event`, `seo-check`, `backlog`, `merge-prs`. Use `new-article` to scaffold content and `content-check` before publishing.

The generic mattpocock/skills pack (`research`, `code-review`, `tdd`, `diagnosing-bugs`, `grill-me`, and the rest) is not stored in this repo. It comes from the global install at `~/.agents/skills`, which Claude Code and Hermes read through their own symlinks, so a fresh clone or a cloud agent needs that install to get those skills. Use `research` to build the `docs/research/` dossiers. Three skills the current pack no longer ships stay here: `implement-spec`, `resolving-merge-conflicts`, and `retro` (recorded in `skills-lock.json`).

<!-- skilld -->
Before modifying code, evaluate each installed skill against the current task.
For each skill, determine YES/NO relevance and invoke all YES skills before proceeding.
<!-- /skilld -->

## Cross-tool agent conventions

- **Issue tracker:** GitHub Issues via the `gh` CLI. See [`docs/agents/issue-tracker.md`](docs/agents/issue-tracker.md).
- **Triage labels:** the default five-role vocabulary (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`), no repo-specific renames. See [`docs/agents/triage-labels.md`](docs/agents/triage-labels.md).
- **Domain docs:** single-context repo, one `GLOSSARY.md` plus `docs/adr/` at the root once created; neither exists yet, `docs/DECISIONS.md` is the decision log in the meantime. See [`docs/agents/domain.md`](docs/agents/domain.md).

## Hooks (Claude Code only)

Claude Code runs automatic hooks from `.claude/settings.json`: a hard block (not just a warning) on any edit to `.env`, `.env.*`, or `yarn.lock`, plus lint-on-save and content-convention reminders (em dashes, absolute internal URLs, editorial-checklist phrases); full list in [`docs/tooling-notes.md`](docs/tooling-notes.md#claude-code-hooks). Other tools have no equivalent enforcement, so apply the same rules manually: never edit `.env`/`yarn.lock` directly, run lint after edits, and self-check content against `docs/content-authoring.md` and `docs/editorial-checklist.md` before finishing.

## Reference docs

[`docs/tooling-notes.md`](docs/tooling-notes.md) (Docker quirks, module notes, CI details, hooks), [`docs/improvement-tasks.md`](docs/improvement-tasks.md) (open backlog, prioritize with `backlog`), [`docs/lighthouse/`](docs/lighthouse/) (audit data; `audit-results.md` is the summary).

## Cross-tool working agreements (added 2026-08-05)

`~/HARNESS.md` is the canonical agreement for all AI tools (Hermes, Claude Code, ChatGPT/Codex).
- `docs/DECISIONS.md` is this repo's decision log, read before planning, append when a decision is made or reversed.
- Infra-mutating actions need explicit approval in the current session.
- Never claim success without real verification.
