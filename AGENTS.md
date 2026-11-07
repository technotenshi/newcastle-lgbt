# Agent Guidelines

Nuxt 4 / Vue 3 static site for the Newcastle, Washington LGBTQ+ community. Yarn 4 and Nuxt Content; no application backend. `AGENTS.md` is the canonical cross-tool entry point. Keep canonical project skills and subagents in `.agents/`; `.github/skills/code-review` is a loader-only integration pointing to `docs/agents/pr-review.md`; `.claude/skills` and `.claude/agents` are directory symlinks to those sources. Do not create `CLAUDE.md`.

## Start here

- Read the relevant definitions in [`GLOSSARY.md`](GLOSSARY.md) and decisions in [`docs/DECISIONS.md`](docs/DECISIONS.md) before changing a workflow or architecture. The decision log is history, not a list of current permissions. Follow the current request and current guides; append a decision when changing an established policy.
- Load skills matching the task before editing. Project skills live at `.agents/skills/<name>/SKILL.md`; generic engineering skills come from the global `~/.agents/skills` install. If a required skill is unavailable, report it and read its documented checklist; do not silently skip the gate.
- Check live git status; preserve unrelated work. Work on a feature branch. Commit, push, merge and deployment require a request; do not infer approval from historical decision entries.
- Infrastructure changes, dependency installation and image builds require explicit approval. Use the existing Docker image for checks; do not start/restart services or change network bindings merely to validate a file edit.
- Do not read or directly edit `.env`, `.env.*` or credential files. Do not delete or hand-edit `yarn.lock`; generate approved lockfile changes through Yarn. Conflict recovery: [`docs/tooling-notes.md#docker-and-make-quirks`](docs/tooling-notes.md#docker-and-make-quirks).
- Report only verified results and name incomplete checks. A green build proves neither factual accuracy nor browser layout.

## Read by task, not by whole manual

Never read `docs/content-authoring.md` whole or concatenate its sections to bypass this rule. Search headings to locate the applicable section, then read that complete section with bounded line ranges. Search hits locate rules; they do not replace reading required sections. Read additional sections only as the task needs them.

| Task | Required guidance |
|---|---|
| News or event creation/revision | Content gate below; [`docs/content-authoring.md`](docs/content-authoring.md) filename format and the applicable news/event frontmatter and body sections; `new-article` for scaffolding |
| Article facts, quotations or citations | `fact-check`; authoring guide's complete Citations, Advocacy-forward, Background research and Verifying sources sections; [`docs/editorial-checklist.md`](docs/editorial-checklist.md) in full; matching research dossiers |
| Image prompts or raster assets | [`docs/image-generation-guide.md`](docs/image-generation-guide.md); authoring guide's Image asset conventions and Working with provided images sections; `image-prompt` / `generate-images` |
| Vue, composables, styling, modules or SEO | [`docs/tooling-notes.md`](docs/tooling-notes.md) relevant sections; `seo-check` for page metadata, `context7-mcp` for current library APIs |
| Election charts or result updates | [`docs/election-results.md`](docs/election-results.md), `GLOSSARY.md`, source snapshots and relevant editorial checklist rules |
| Dependencies, audit or static image pipeline | Relevant [`docs/maintenance/`](docs/maintenance/) playbook and decision entries; static verification below |
| Issues, triage or domain changes | [`docs/agents/issue-tracker.md`](docs/agents/issue-tracker.md), [`triage-labels.md`](docs/agents/triage-labels.md), [`domain.md`](docs/agents/domain.md), as applicable |
| Instruction files, skills or Claude settings | [`docs/agents/agent-configuration.md`](docs/agents/agent-configuration.md); `writing-for-agents` |
| Backlog or PR body | `backlog` + [`docs/improvement-tasks.md`](docs/improvement-tasks.md); `pr` for Summary / Evidence / Merge Danger |

## Required content gate (all tools)

This site advocates for LGBTQ+ people in every format, including election results and updates. Criticize documented harm, name responsible people when evidence ties them to it, and reach a critical, evidence-backed conclusion with a concrete call to action. Precision strengthens that stance; neutral “both sides” copy does not satisfy it.

1. Before drafting news, read the full editorial checklist and the complete authoring sections identified above, then matching `docs/research/` dossiers. For events, read the event/filename sections and verify organizer details. Do not treat a summary in a skill as the full guide.
2. Open every cited source and read the cited passage; primary initiative/bill text, court opinion or statement comes first. Inspect legislative PDF strikeout/underline markup. A snippet, another article's bibliography or an agent's summary is a lead, not verification. Use a browser/alternate retrieval on a blocked fetch; if still inaccessible, disclose that limitation rather than claiming it was read.
3. Copy quotes from retrieved text: complete sentences or explicit ellipses, only the speaker's words. Footnotes must support the attached claim. Check imported descriptors, biographical facts, counts, roles and dates against a second source.
4. Apply the checklist's limits on absolutes, inferred motives, promised lawsuits and blame before checking the legal process. Hostile “biological female/male/sex/women” phrasing belongs only in attributed direct quotations or proper titles, never our own voice, headlines, captions or teasers.
5. Cite specific external facts using `[^N]` in first-appearance order; reuse source numbers. End with numeric `[^N]: ...` definitions under `## Sources`, full APA7 entries. Events use the event guide's CTA rather than a Sources section.
6. Run `fact-check`, then `content-check`, then [the content-reviewer checklist](.agents/agents/content-reviewer.md) for news. For events, verify source details and run `content-check` and the applicable reviewer checks. Fix every Critical and Major finding; disclose anything unverified. Lint/build do not check facts.
7. Inspect every new/replaced image visually and verify dimensions. A prompt, filename or image tool with no description is not verification. Use another viewing method or mark the image unverified. Actual generation uses local `codex exec` through `generate-images`, not a bespoke API script.
8. Run the validation below, use `pr` for a PR body, and distinguish source limitations from passed checks. Do not create a PR unless requested.
9. For review comments, fix first and reply to each comment with the fix and the source actually re-read. Never claim “confirmed” from a source you did not open.

## Content rules easy to miss

- Use the current Pacific date (`America/Los_Angeles`) for publication dates and relative-time wording. News routes are `/news/YYYY/MM/DD/slug`. Omit `draft` by default; use `draft: true` only when requested to withhold/recall an article. Drafts and future-dated news do not exercise the published route in a build.
- News requires both `image` and `imageHeader`. `image.alt` describes the visible image (50–250 characters); `imageHeader.alt` is a one-sentence engagement teaser, not an image description.
- No em dashes in content or frontmatter, including quote attributions; use `> *Attribution Name*`. En dashes are correct for numeric/time ranges.
- Events: 2–4 sentences; without a ticket/registration URL use the organizer's site and `link.text: "More Information"`. The button is below the body. Optional `image.credit` is a name only.
- Events sort by date ascending, then `order` descending. Council filenames start `position-N-`; portraits must be official real photos from `newcastlewa.gov`, not generated.
- Generated images are PNG: news slots `1792x1024` (7:4 source, composed for 16:9 crops), events `1024x768` (4:3). Prompts explicitly name racial diversity, a subtle LGBTQ+ motif and approved lighting, with no generated text, logos or flag artwork.

## Code and SEO guardrails

- Match existing Vue/TypeScript style and `eslint.config.mjs`: semicolons; explicit imports for Vue `computed`, `ref`, `watch`; typed `NewsItem`, `EventItem`, `CouncilMember`, `FeatureItem` interfaces.
- Content flows from `content/*` through the single Nuxt Content collection and normalizers to composables/pages/static output. `pages/organizations/index.vue` is hardcoded, not content-driven. Server routes import `queryCollection` from `@nuxt/content/server`.
- Use `<NuxtImg>` and `normalizeAssetPath` for local images; `useAsset` resolves runtime asset inputs. Plain `<img>` needs `loading="lazy"` and `decoding="async"`.
- Bootstrap JS imports are limited to collapse/carousel. New features need imports in `plugins/bootstrap.client.ts` and `vite.optimizeDeps.include`. Dynamic CSS classes may need the production PurgeCSS safelist.
- Every page calls `useSeoMeta({ title, description })`; short title only, since the site suffix is automatic. Use `useSocialImage()` synchronously in setup after awaited content and pass its return to `ogImage` and `twitterImage`, with `twitterCard: "summary_large_image"`. Never hand-build local social IPX URLs: they would miss prerender registration.
- Wrap Schema.org helpers in `useSchemaOrg([...])`. Keep `nuxt-og-image` disabled unless renderer enablement is explicitly scoped and verified. Do not manually add canonical, `og:title/description/url` or `twitter:title/description`; do not add `public/robots.txt`.
- Internal site links are relative with no trailing slash. Read full module/SEO patterns in the tooling guide when touching them, rather than guessing from this summary.

## Validation

Prefer `make` targets interactively. In a non-TTY use the underlying commands with `-T`; they use existing images and do not install packages:

```sh
docker compose run --rm --no-deps -T --pull never app yarn lint
docker compose run --rm --no-deps -T --pull never app node scripts/verify-agent-docs.mjs
docker compose run --rm --no-deps -T --pull never app node --test scripts/audit-gate.test.mjs scripts/election-results.test.mjs scripts/election-results-render.test.mjs
docker compose run --rm --no-deps -T --pull never app yarn build
docker compose run --rm --no-deps -T --pull never app node scripts/verify-social-images.mjs
```

Run lint then the static build after changes, relevant tests for affected behavior, the documentation verifier for instruction/docs changes, and social-image verification after the build. If a dev server is running, use an isolated source copy for build output as described in the tooling guide; preserve its `.nuxt`/`.output` state.

Image/IPX/prerender dependency changes additionally require a nonempty `.output/public/_ipx` and real HTTP 200 checks against a static-only server. Dev mode never tests Nitro's static crawler. Browser layout/accessibility checks remain separate from Node tests. Report blockers instead of claiming unrun checks passed.

Keep this file within 12,000 characters and 180 lines. Put task-specific detail in the linked guide, with a concrete trigger here. `node scripts/verify-agent-docs.mjs` checks the budget and relative Markdown links; it does not test model compliance or editorial facts.
