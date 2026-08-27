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

## 2026-08-21 — Public-repository security audit findings retained for later remediation

After the repository was made public and `main` was protected with active
GitHub rulesets, a read-only audit found the following items to remediate in
a future, separately approved change:

- The `main` rulesets correctly require pull requests, current successful
  checks, linear history, and resolved review threads; they prevent branch
  deletion and non-fast-forward updates. However, they require zero approvals,
  do not dismiss stale approvals, do not require CODEOWNERS review, and allow
  an always-bypass repository role.
- GitHub Actions is configured to allow all actions and does not require SHA
  pinning. `.github/workflows/yarn-nuxt.yml` has no explicit least-privilege
  `permissions:` block (also reported by CodeQL).
- Five Dependabot alerts remain open: three high-severity transitive issues
  (`nanoid`, `ip-address`, `socket.io-parser`) and two medium-severity
  `ip-address` issues. Secret scanning and push protection are enabled; no
  secret-scanning alerts were open.
- Gitleaks found no secrets in the working tree or the full 231-commit Git
  history. Semgrep 1.173.0 ran successfully after initialization and reported
  11 findings, including mutable GitHub Actions tags, missing Dependabot and
  Yarn package-age gates, a root-running Dockerfile, bundled JavaScript
  patterns requiring triage, and a `v-html` use.

These findings are recorded only; no remediation was applied in this audit.

## 2026-08-21 — Solo-maintainer merge policy: no extra approval for unattributed pushes

The `main-2` repository ruleset had
`require_extra_approval_for_unattributed_changes` enabled even though the
repository has a single maintainer and automated dependency PRs are authored
by Renovate. The setting was disabled through the GitHub ruleset API so an
unattributed automated push cannot require an unavailable second reviewer.

This policy change made no Git commit. At the time of the change, PR #345
still reported GitHub's non-specific `BLOCKED` merge state despite being
mergeable, current with `main`, having no review threads, and passing its two
required checks. The cause requires the merge-box message or further GitHub
support-level investigation; it is not an active review requirement in the
repository configuration.

## 2026-08-21 — Replaced `main` rulesets with classic branch protection

The rulesets were removed and replaced with classic protection on `main`.
The protection requires the `Cloudflare Pages` and `build (24.x)` checks,
requires branches to be current, disallows force pushes and deletion, requires
linear history, and requires pull requests while requiring zero approvals.
It does not enforce protection for administrators.

This immediately cleared PR #345's otherwise unexplained ruleset block:
GitHub reports it as `CLEAN` and `MERGEABLE`. Use squash or rebase merging to
preserve the required linear history. No commit was made as part of this
configuration change or its verification.

## 2026-08-21 — Align Nuxt's Rolldown peer and Docker's Yarn version

Nuxt 4.5.2 declares `rolldown` `~1.2.1` as a peer dependency, and
`nuxt-seo-utils` also accepts that version. Add it as a direct development
dependency so Yarn's post-resolution validation has a complete build-tool
contract. Align the Dockerfile's Corepack activation with the existing
`packageManager: yarn@4.18.0` declaration; Corepack uses that manifest field
for project commands, but the image bootstrap should state the same version.

The remaining `better-sqlite3` and Sharp peer-range warnings are intentionally
deferred; they require separate compatibility decisions.

## 2026-08-21 — Align better-sqlite3 with Nuxt Content's supported range

Nuxt Content 3.15.2 declares an optional `better-sqlite3` peer of `^12.5.0`,
but the site declared `^13.0.0`. Align the site's direct dependency to
`^12.5.0`, resolving to 12.11.1, so the SQLite content connector is within
Nuxt Content's supported contract. The static build, lint, and Yarn peer
validation passed; the static output contains 558 generated IPX files.

The separate Sharp peer-range warning remains for a later, explicit decision.

## 2026-08-21 — Park Nuxt OG Image enablement pending renderer setup

An isolated production-build experiment enabled `nuxt-og-image` 6.7.8. In the
non-interactive Docker environment, the module selected its Takumi renderer,
then failed because `@takumi-rs/core` is not installed. It also warned that
the `static` Nitro preset needs explicit `ogImage.compatibility.runtime`
configuration. No `components/OgImage/` renderer component exists, and the
failed build produced no `.output/public` or generated OG-image artifacts.

Keep the module disabled for now and continue using each page's prerendered
IPX URL through `useSeoMeta({ ogImage, twitterImage })`. Revisit as a separate
change: choose a renderer (Takumi is the module's current recommendation; the
existing comment previously mentioned Satori), install/configure it, add an
explicit renderer component if appropriate, set static compatibility, and
verify a full Docker static build with generated OG artifacts and intact IPX
output. Do not treat the Sharp peer warning as resolved by this decision.

## 2026-08-27 — Closed two Renovate PRs that re-proposed already-reverted/pinned versions

Routine open-PR review found Renovate had re-opened both previously-decided
version bumps as draft PRs, both green on CI (`build (24.x)`, CodeQL,
Cloudflare Pages preview, GitGuardian all passing) because none of those
checks exercise the failure modes involved:

- PR #348, `@nuxt/image` to 2.1.0 — the exact upgrade reverted in PR #344 for
  breaking static image generation (see the 2026-08-21 entry above). CI's
  build check doesn't serve `.output/public` statically, so it can't catch
  the missing `_ipx` output.
- PR #355, `better-sqlite3` to v13 — outside Nuxt Content 3.15.2's supported
  `^12.5.0` optional peer range (see the 2026-08-21 entry above). A peer
  range mismatch isn't a CI failure either.

Both PRs were closed with comments pointing back to the relevant decision
entries. Added `packageRules` to `renovate.json` constraining
`@nuxt/image` to `<2.1.0` and `better-sqlite3` to `^12.5.0` so Renovate stops
re-proposing these until the underlying blockers (the IPX regression, Nuxt
Content's peer range) are deliberately resolved.
