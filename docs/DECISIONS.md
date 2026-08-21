# Decision log

Source of truth for this repo's decisions. Append dated entries; newest last.
Chat output from any AI tool is a draft until recorded here. See ~/HARNESS.md.

## 2026-08-05 — Adopted cross-tool working agreements
Harness Phase 1: this file becomes the repo's decision log; working agreements in ~/HARNESS.md apply.

## 2026-08-21 — Consolidated open dependency-update PRs into a single branch
11 open Renovate/Dependabot PRs (#339, #338, #337, #336, #334, #333, #332,
#301, #282, #280, #276) were consolidated into one branch
`deps/consolidated-2026-08` -> PR #342, rather than merging/cherry-picking
each branch and hand-resolving yarn.lock conflicts. Approach: extract each
PR's version-bump intent, apply the union directly to `package.json` once,
then regenerate `yarn.lock` with a single `yarn install` — this collapses
duplicate/superseded bumps automatically since yarn.lock is a generated
artifact, not something to diff/merge by hand.

- eslint (#339), ip-address (#333), nuxt-schema-org (#282) needed no
  package.json edit — their target versions were already satisfied by
  existing semver ranges or were transitive/lockfile-only; folded into the
  same `yarn install` regeneration.
- The `packageManager` (yarn) bump (#276) was isolated into its own commit
  so it can be reverted independently of the dependency bumps if it
  misbehaves.
- Verified directly (not delegated blindly): `yarn install`, `yarn lint`,
  `yarn build`, `yarn npm audit --severity moderate` all passed clean in the
  worktree before opening the PR; the two security advisories
  (brace-expansion, fast-uri) are cleared per audit output.
- Routed the mechanical edit/regenerate work to Codex CLI per the AI tool
  router (Tier 2, well-scoped dependency work); Hermes did the planning,
  dispatch, and independent verification.
- Once #342 merges, close the 11 originals as superseded.

## 2026-08-21 — Reverted @nuxt/image 2.1.0 (broken static image generation)
Production (newcastle.lgbt) started serving CSS correctly but every image
404'd after PR #326 (`chore(deps): update dependency @nuxt/image to
v2.1.0`) landed. `git bisect` against a real `make prod` build (not `make
develop` — the dev server never exercises the static prerender path, so it
cannot reproduce this class of bug) identified d0d263b (PR #326) as the
first bad commit: `.output/public/_ipx` has 0 files at that commit and
every commit after it, vs. 558 files before it.

Fix: reverted `@nuxt/image` to 2.0.0 via PR #344, verified with a real
static build (`docker compose run --rm app yarn build`) served statically
(`npx serve .output/public`, matching how Cloudflare Pages serves the
site) — confirmed `200 OK` on real `/_ipx/...` URLs before merging.

Root cause (not fully resolved, upgrade parked): `@nuxt/image` 2.1.0
rewrote its `/_ipx/**` server route handler
(`src/runtime/server/routes/_ipx.ts`) from `createIPXH3Handler` + `useBase`
to `createIPXNodeHandler` with a custom `parseURL`. The module's own
prerender-registration mechanism (`prerenderStaticImages()`, unchanged
between versions) still correctly queues every `/_ipx/...` URL via the
`x-nitro-prerender` response header, and nitro's crawler still picks up
those routes — but the actual image bytes are never written to
`.output/public`. Not yet traced to the exact failing line in the new
handler. Re-attempt the 2.1.0 upgrade as its own PR once this is
understood, rather than leaving `@nuxt/image` pinned indefinitely.

### Pitfall: regenerating yarn.lock during a rebase can silently
### reintroduce a reverted version
While rebasing PR #342 (dependency consolidation) onto main after #344
merged, `rm yarn.lock && yarn install` silently re-resolved `@nuxt/image`
back to 2.1.0 — the exact version just reverted for breaking production —
because `package.json` still specifies the caret range `^2.0.0`, which
2.1.0 satisfies. Yarn only respects a pinned resolution when the lockfile
entry for that package already exists; deleting the lockfile removes that
guardrail and lets yarn freely pick the newest version in range again.

**Rule going forward: never delete `yarn.lock`.** To rebase/merge cleanly
across branches with independent lockfile changes, resolve `package.json`
first (it merges/rebases as normal text), then restore `yarn.lock` from
the correct base ref with `git checkout <ref> -- yarn.lock` (not a
delete), then run `yarn install` — this lets yarn layer in only the new
`package.json` changes on top of the already-correct pinned resolutions,
instead of a wholesale unconstrained re-resolution.

