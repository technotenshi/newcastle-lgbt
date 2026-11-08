# Reviewing pull requests in newcastle-lgbt

This is a static Nuxt 4 / Vue 3 site (Newcastle, WA LGBTQ+ community) built
with Yarn 4 and Nuxt Content, prerendered to `.output/public`. There is no
application backend. Node tests cover the audit gate and election formatter/MDC
rendering; the documentation and static social-image verifiers cover separate
build-output contracts. Review still needs evidence for untested behavior.

## Dependency / lockfile changes

- **Avoid unnecessary split resolutions within compatible ranges.**
  When a dependency bump PR is combined by hand (multiple `package.json`
  ranges pointing at the same package, e.g. `sharp@^0.35.0` and
  `sharp@^0.35.3`), verify every range for that package resolves to the
  same compatible version where the requested ranges permit it. Multiple
  versions can be required by incompatible parent ranges; do not call them a
  defect without checking those requests. Use Yarn to deduplicate compatible
  ranges; never delete the lockfile or regenerate an unconstrained tree.
- Any `yarn.lock` change should come from a real `yarn install` /
  `yarn dedupe` run inside the project's Docker image, never a hand-edited
  or cherry-picked lockfile. Flag any PR whose `yarn.lock` diff looks
  hand-crafted (partial entries, missing `checksum:` lines, inconsistent
  formatting).
- CI uses `yarn install --immutable`. Run it to verify manifest/lock alignment;
  a dependency change can require regeneration, while metadata-only changes
  need not change the lockfile. Diagnose the actual immutable-install error.

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

- For non-trivial logic changes, require an executed regression test at the
  real call boundary. Run existing applicable Node tests in Docker. For
  untested composables, normalization or date/timezone paths, identify the
  coverage gap and construct a real reproduction; mental examples alone do
  not verify behavior.
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
  order, slug, image with alt text). News requires imageHeader path and teaser;
  carousel and draft are optional. Events require link text/target and do not
  use imageHeader/carousel/draft. Search headings and read complete applicable
  authoring sections, not the whole guide. Apply AGENTS.md's full content gate:
  fact-check, content-check and the content-reviewer checklist, with evidence
  from opened sources; a passing build is not an editorial review.

## CI/workflow changes

- `.github/workflows/yarn-nuxt.yml` runs `yarn install --immutable`,
  `yarn lint`, the agent-documentation verifier, `yarn build` and the social-image
  verifier on every push/PR to `main`, with a
  concurrency group cancelling superseded runs. Flag any workflow change
  that removes the lint step, the `--immutable` flag, or the
  `permissions: contents: read` restriction without an explicit reason.
