---
name: code-review
description: Review guidance for the newcastle-lgbt Nuxt 4 static site. Use when reviewing any pull request in this repository.
---

# Reviewing pull requests in newcastle-lgbt

This is a static Nuxt 4 / Vue 3 site (Newcastle, WA LGBTQ+ community) built
with Yarn 4 and Nuxt Content, prerendered to `.output/public`. There is no
application backend and no automated test suite, so review scrutiny has to
substitute for tests in a few specific areas below.

## Dependency / lockfile changes

- **`yarn.lock` must not contain a split resolution for a single package.**
  When a dependency bump PR is combined by hand (multiple `package.json`
  ranges pointing at the same package, e.g. `sharp@^0.35.0` and
  `sharp@^0.35.3`), verify every range for that package resolves to the
  *same* version in `yarn.lock`. Search for the package name and confirm
  there's one resolution block, not two versions coexisting
  (`grep -n '"sharp@npm' yarn.lock`). If you see two different `version:`
  lines for the same package, that's a bug, not intentional — a plain
  `yarn install` regenerating from scratch, or `yarn dedupe`, should merge
  them onto one version.
- Any `yarn.lock` change should come from a real `yarn install` /
  `yarn dedupe` run inside the project's Docker image, never a hand-edited
  or cherry-picked lockfile. Flag any PR whose `yarn.lock` diff looks
  hand-crafted (partial entries, missing `checksum:` lines, inconsistent
  formatting).
- CI uses `yarn install --immutable`, so a `package.json` change without a
  matching `yarn.lock` regeneration will fail CI — that's a legitimate CI
  failure, not a flake.

## Image pipeline (`sharp`, `@nuxt/image`, IPX)

- Any PR touching `sharp`, `@nuxt/image`, or IPX-related packages needs
  verification beyond `yarn build` exiting 0. A build can succeed while
  silently producing an empty `_ipx` output directory (this happened before:
  see `docs/DECISIONS.md` 2026-08-21 entry on `@nuxt/image` 2.1.0). Check
  that the PR's own verification notes mention `.output/public/_ipx` being
  non-empty, or ask for it if missing.
- `renovate.json` currently pins `@nuxt/image` to `<2.1.0` for exactly this
  reason — a PR that bumps past that pin without updating/removing the
  `packageRules` entry and re-verifying the static build should be flagged.

## General code changes

- No automated tests exist in this repo. For any non-trivial logic change
  (composables in `composables/`, content-normalization helpers in
  `utils/content.ts`, date/timezone handling for news/events), review by
  hand more carefully than you would in a repo with test coverage — trace
  the change against a couple of concrete inputs mentally since there's no
  test suite to lean on.
- PurgeCSS runs in production builds. Flag any new dynamically-generated
  class name (e.g. built from a template literal or prop) that isn't in the
  `nuxt.config.ts` safelist — it will be silently purged in the static
  build even though it works in dev.
- Local images passed to `<NuxtImg>` should go through `normalizeAssetPath`
  (`utils/assets.ts`). Flag raw path strings passed directly.
- Composables (`computed`, `ref`, `watch`, etc.) must be explicitly
  imported — flag any usage relying on Nuxt auto-import fallback if the
  project convention (see `AGENTS.md`) says otherwise.

## Content changes (`content/news`, `content/events`, `content/council`)

- News filenames must be `YYYYMMDD-##-descriptive-slug.md`; council member
  filenames must start with `position-N-` to control display order. Flag
  filenames that don't follow these conventions.
- Check `docs/content-authoring.md` frontmatter requirements (title, date,
  order, slug, image with alt text, optional imageHeader, carousel, draft)
  are present when a PR adds or edits content files.

## CI/workflow changes

- `.github/workflows/yarn-nuxt.yml` runs `yarn install --immutable`,
  `yarn lint`, then `yarn build` on every push/PR to `main`, with a
  concurrency group cancelling superseded runs. Flag any workflow change
  that removes the lint step, the `--immutable` flag, or the
  `permissions: contents: read` restriction without an explicit reason.
