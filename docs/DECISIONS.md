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

## 2026-09-04 — Codified an explicit advocacy stance for anti-LGBTQ+ policy coverage

A first draft of a news article on two anti-LGBTQ+ Washington ballot
initiatives (IL26-001, IL26-638) was too neutrally descriptive ("this is
what each measure would do") instead of critical and evidence-based. The
site's existing `docs/editorial-checklist.md` covered precision and fairness
(don't overstate, attribute disputed claims correctly, name institutions
instead of blaming groups) but never stated that neutral "both sides"
coverage is itself a failure mode for this site.

Added an explicit "Editorial stance" section to `docs/editorial-checklist.md`
(this site advocates for the LGBTQ+ community; documented harms and a
campaign's denial of them are not symmetrical; verify bill/policy text
before characterizing it; fact-check supporters' specific claims with the
same rigor as opponents'; every article must reach a synthesized conclusion,
not just list "arguments for/against"). Propagated pointers to the same
stance into `docs/content-authoring.md`, `CLAUDE.md`, `AGENTS.md`, the
`content-reviewer` subagent (`.claude/agents/content-reviewer.md`), and the
`new-article` and `content-check` skills in both `.claude/skills/` and the
Codex-mirrored `.agents/skills/`, so the stance is enforced consistently
across tools rather than living only in one checklist file.

This does not relax the existing precision rules: being critical of a policy
and its supporters is explicitly framed as compatible with never overstating
what a bill's text requires, never fabricating a quote/statistic, and never
assigning blame to an entire identity group instead of the specific
organization or official responsible.

Follow-up the same day: made explicit that this site names specific
individuals (donors, legislators, spokespeople, executives, candidates) by
name when a source (a filing, a quote, a roll-call vote) ties them directly
to a claim, rather than retreating to the institution's name alone. Added to
the same set of files touched above (`docs/editorial-checklist.md` items 7
and the "Editorial stance" section, `docs/content-authoring.md`, `CLAUDE.md`,
`AGENTS.md`, `content-reviewer.md`, and the `new-article`/`content-check`
skills in both `.claude/skills/` and `.agents/skills/`). The evidentiary bar
is unchanged: naming a person is not itself the risk, naming one without a
credible source is.

Second follow-up the same day: created `docs/research/` as a place for
standing background dossiers on recurring subjects (an organization, a
political committee, a specific individual), starting with
`docs/research/lets-go-washington.md` (researched via a background agent,
then hand-corrected after direct primary-source review of ESHB 1296 found
one of its claims, that IL26-001 repeals nondiscrimination protections for
sexual orientation/gender identity, did not survive contact with the bill's
own strikeout/underline markup; that clause is unchanged between the 2024
and 2025 versions of the law). Codified the convention that an article
naming a subject with a `docs/research/` file should fold in relevant
background for readers unfamiliar with them, not just drop the name in bare.
Added to the same set of files: `docs/content-authoring.md` (new
"Background research files" subsection), `CLAUDE.md`, `AGENTS.md`,
`content-reviewer.md`, and the `new-article`/`content-check` skills in both
`.claude/skills/` and `.agents/skills/`. Applied immediately to
`content/news/20260904-01-anti-lgbtq-ballot-initiatives-documented-risks.md`,
which now gives readers Let's Go Washington's founding, funding pattern,
2024 initiative track record, and PDC compliance history on first mention.

## 2026-09-24 Consolidated routine dependency updates

Nine green automated dependency PRs were consolidated into one branch rather
than merged individually, preserving a single coherent `yarn.lock` update.
The combined update includes `@nuxtjs/robots`, `@nuxtjs/sitemap`,
`@unhead/vue`, `eslint-plugin-vue`, `js-yaml`, `nuxt-og-image`,
`nuxt-schema-org`, `nuxt-seo-utils`, and `rolldown`.

Four lower or duplicate updates were closed as superseded: #391 by #403, #399
by #401, #402 by #384, and #395 by #387. PR #388 was closed because
`better-sqlite3` 13.0.3 remains outside Nuxt Content 3.15.2's supported
`^12.5.0` optional peer range. PR #390 remains open but excluded because its
`@babel/core` resolution update lacks the required lockfile change and fails
`yarn install --immutable`.

The consolidated branch passed `yarn install --immutable`, `yarn lint`, and a
full static `yarn build`. The static output contains 582 IPX assets, and a
representative `/_ipx/` image returned HTTP 200 from a local static server.

## 2026-09-23 Consolidated reviewed dependency updates

PRs #404 (`@nuxt/content` 3.16.1), #405 (`brace-expansion` 5.0.12), #408
(`eslint` 10.11.0), and #409 (`fast-uri` 4.2.1) were independently reviewed
and verified before being consolidated into one branch. PR #407 is excluded
because its lockfile leaves Nuxt and Nitro on Vue 3.5.42 while the root package
uses Vue 3.5.43. PR #390 remains excluded because its `@babel/core` resolution
change lacks the required lockfile update.

## 2026-10-21 Consolidated dependency bot PRs (deploy/2026-10-21-batch)

Merged #384 (rolldown 1.2.15), #390 (`@babel/core` 8.0.7), #397 (nuxt-og-image
6.10.4), #398 (nuxt-schema-org 6.4.3), #411 (yarn 4.18.1), #412 (ws 8.22.0),
#415 (sharp 0.35.5), #416 (nuxt-seo-utils 8.6.1), #417 (`@humanfs/node` 0.16.8),
#418 (`@nuxtjs/robots` 6.2.4), #421 (`@nuxtjs/sitemap` 8.6.1). Skipped as
superseded or duplicate: #413 and #419 (sharp 0.35.5 already via #415), #420
(nuxt-og-image 6.10.1 < 6.10.4 in #397), #422 (rolldown 1.2.12 < 1.2.15 in #384).

PR #390 was previously excluded for lacking a lockfile update; this batch
regenerated `yarn.lock` with `yarn install`, so it is now included. Lockfile
conflicts were resolved by accepting ours, then `yarn install` re-applied the
dropped bumps (`@nuxtjs/sitemap` 8.6.1, `@babel/core` 8.0.7 tree).

## 2026-10-23 — Consolidate compatible dependency PRs on Nuxt 4.5.2

Create local branch `deploy/2026-10-23-batch` from `origin/main`
(`a7b49332497bc9f8db92006dd4943768cc6ebb79`). Apply the selected PR intents
as one manifest change, then selectively re-resolve their packages through
Docker with Yarn 4.18.1 against the existing lockfile. Do not delete or hand
edit `yarn.lock`. Both Sharp PRs are included: the manifest minimum and the
transitive cleanup are complementary.

All selected PRs were open and their exact fetched heads matched GitHub at
intake. Provenance (PR head SHAs, not merge commits):

| PR | Included target | Verified head |
| --- | --- | --- |
| #419 | Sharp 0.35.5 manifest minimum | `22442377b5299a36af86f7be786e490a0334db16` |
| #424 | launch-editor 2.14.2 | `d6b78d28f8bdf587e8cdaee4940052c150b4697a` |
| #425 | Sharp 0.35.5 transitive cleanup | `3295f9c853f78e5cc91c2915676342da180932c2` |
| #426 | @nuxt/content 3.16.2 | `15ea08737f0bc48d00a4927c85fffadbe2810ab6` |
| #427 | @nuxtjs/sitemap 8.6.2 | `d0588381f97930c81f3d6b16cf48bd5fafbd1348` |
| #428 | @unhead/vue 3.4.3 | `2429993085fb66744f9f8be4e154c1b968eabd14` |
| #429 | fast-uri 4.2.3 | `e813d3421612ff08ac24d9f8cb1295e57e043fda` |
| #430 | PostCSS 8.5.31 | `ed167d3d4729b5b72615b1ab13c7e468d8217763` |
| #431 | unstorage 1.17.6 | `6dceabba56be78439acfebf1a7a118bcab6c10c0` |
| #432 | Vue 3.5.44 | `6473f0de1beb5d89049a345e71f2b3d46b3723fb` |
| #433 | ESLint 10.13.0 | `94000a7469c1cd67ae88b9ce0cb27d9e306d7560` |
| #434 | globals 17.13.0 | `e22d8b026f79efdc9d2234ada81173b2833d02e7` |
| #435 | js-yaml 5.5.0 | `c81aa274847fd91895b1d2b6e69e3ea1785d0ce7` |

Correct the launch-editor resolution selector from the unused `^2.13.1` to
the installed request `^2.14.1`; generate the lockfile updates missing from
#424 and #435. Refresh Vue's existing runtime, renderer, compiler and shared
package descriptors together so the site, Nuxt and Nitro all use 3.5.44.
The lockfile comparison confirms no surviving unrelated dependency descriptor
changed its pinned resolution. Nuxt Content 3.16.2 introduces newer dependency
ranges, including a separate `@nuxt/kit` 4.6.2; this does not upgrade the Nuxt
framework, which stays at 4.5.2.

Preserve `@nuxt/image` 2.0.0, `better-sqlite3` 12.11.1 (supported `^12.5.0`
range), `nuxt-og-image` 6.10.4, and disabled OG image generation. No application
source or public API changes.

Defer #420 (`0b8b83920345f4bf8c50099b6cc7d2a6cf69caec`, OG Image 7.0.7
needs Nuxt 4.6.1+) and #421 (`1c0362a8951b06f7be183a0f45265a666a144e63`,
sitemap 9.1.0 needs Nuxt 4.6+ and has a robots-module CI incompatibility),
per the approved plan. Publishing the branch, closing originals and
deployment remain separate work.

Validation on the consolidated dependency graph:

- Docker reports Yarn 4.18.1. Immutable installation and lint pass. The full
  static build passes, prerendering 687 routes; Nuxt Link Checker reports
  zero errors and zero warnings across 51 pages.
- Assertions against the lockfile confirm all selected versions and preserved
  pins. Node resolution from both Nuxt and Nitro confirms Vue, server-renderer
  and compiler-sfc 3.5.44. No older Sharp copies remain. The root `@unhead/vue`
  is 3.4.3; its existing transitive 3.4.0 descriptor is preserved.
- A localhost static server returns HTTP 200 for all 51 content pages, all
  578 generated IPX files, and all 117 distinct rendered-page IPX image URLs.
  Sitemap (51 entries), robots and RSS return HTTP 200, with valid XML for
  sitemap and RSS. All content pages have title, description, canonical and
  OG/Twitter metadata. Social-image resource results and the baseline
  comparison are described below.
- Standards and Spec code reviews each report zero findings. Gitleaks finds
  no secrets in the changes or integration commit; Semgrep scans the three
  changed files with metrics disabled and reports zero findings.
- Full recursive Yarn audit is not clean: 41 advisory reports plus three
  deprecation reports (combined: two critical, 18 high, 24 moderate). Every
  reported package/version already exists in `origin/main`. The critical
  findings concern `simple-git` 3.36.0 (GHSA-x6jw-m9v5-85vh) and
  `@simple-git/argv-parser` 1.1.1 (GHSA-v5rq-49vh-5v5c), through Nuxt devtools.
  Other findings include the retained Nuxt 4.5.2 and its existing transitive
  dependencies. These require separate remediation; this batch does not
  claim a clean dependency audit. Existing Yarn peer warnings remain.

The social-image check uncovered an existing static-output defect: all 46
distinct OG/Twitter image URLs return 404 because those IPX variants are not
generated. An isolated immutable install and full static build of the exact
`origin/main` baseline also passes with 687 routes and produces the identical
578 IPX paths, identical metadata across all 51 content pages, and the same
46 missing social-image URLs. This is not introduced by the dependency batch.
Keep the dependency-only scope; social-image prerender registration needs a
separate fix. Rendered page images pass the HTTP checks above. The batch is
verified against baseline, but neither the dependency audit nor the social
image resource check should be described as clean.

## 2026-10-23 — Track every discovered defect with a proposed fix

Whether a defect predates the current change establishes provenance, not a
reason to leave it without an actionable record. Record discovered problems
in the issue tracker and backlog with evidence, a proposed fix and acceptance
criteria. Neither a passing baseline comparison nor a successful build
resolves an outstanding defect.

- [#436](https://github.com/technotenshi/newcastle-lgbt/issues/436) tracks all
  44 dependency-audit reports, prioritizing the two critical Git-tooling
  findings. The proposed remediation starts with supported Nuxt/devtools
  upgrades that patch or remove simple-git and its parser, followed by
  package-specific upgrades and explicit dispositions for remaining reports.
  Full inventory and acceptance criteria are in
  [the dependency remediation record](maintenance/2026-10-23-dependency-audit.md).
- [#437](https://github.com/technotenshi/newcastle-lgbt/issues/437) tracks all
  46 missing social-image URLs. Register the emitted IPX variants during
  prerendering and add a static-output/HTTP verification check to CI. Full
  inventory, affected pages and acceptance criteria are in
  [the social-image remediation record](maintenance/2026-10-23-social-images.md).

These records propose fixes; implementation and verification of those fixes
are still open. Both are linked from `docs/improvement-tasks.md`.

## 2026-10-23 - Social images come from one helper and are verified after the build

Issue [#437](https://github.com/technotenshi/newcastle-lgbt/issues/437). All 46
local `og:image` / `twitter:image` URLs 404ed in the static output. Two causes:

1. Nitro's crawler only follows `href` attributes, so URLs that only appear in
   `<meta content>` were never requested and never generated. `prerenderRoutes`
   queues paths through the `x-nitro-prerender` header, and Nitro skips any URL
   that has a protocol or host, so the helper registers the path, not the
   absolute URL.
2. The modifier string `w_1200&h_630&fit_cover` never produced 1200x630. In
   IPX, `w_` and `h_` each resize one axis and ignore `fit`; only `s_WxH`
   crops to an exact box. Generated heights ranged from 633 to 904, and
   1024px wide sources were not enlarged. The string is now
   `f_webp&s_1200x630&fit_cover&enlarge`. Sources narrower than 1200px are
   upscaled, which softens them slightly; real 1200x630 artwork would avoid it.

Decision: `composables/useSocialImage.ts` builds the URL and registers the
path, and every page uses it. `scripts/verify-social-images.mjs` runs in CI
after the build and fails on a missing, empty, non-image, or non-1200x630 social
image, checked over a static-only HTTP server. Verified in Docker: 46 of 46
failed before the fix (exit 1); after it, the build produces 624 IPX files (578
plus 46) and the script passes. Link checker: 0 errors across 51 pages. The
sitemap gained no social-image URLs (its existing `_ipx` entries are
rendered-page images from `<img>` tags).

The 46 URL strings recorded in the issue use the old modifier and are no
longer generated. They returned 404 before, so nothing that worked is lost;
the verification script, not that inventory, is the source of truth.

The script also reads image URLs inside JSON-LD, decodes HTML entities, and
fails when it finds no HTML files or no social image URLs, so a regression
that drops the meta tags cannot pass CI. It sniffs the image format from the
bytes. IPX keeps the source extension while converting to WebP, so a `.png`
URL holds WebP bytes; static hosts send the extension's content type, which
the script reports as a note and does not fail on.

## 2026-10-24 — Applied the #442 transitive bumps directly (#459)
Dependabot closed #442 ("updatable in another way") once #439 landed, so the
rebase-and-merge step in #459 no longer existed. Instead of waiting for a new
Dependabot PR, the same bumps were applied with `yarn up -R` on branch
`fix/459-transitive-bumps`; only `yarn.lock` changed. vite 8.2.2 -> 8.3.5,
ip-address 10.5.0 -> 10.7.4, http-cache-semantics 4.2.0 -> 4.3.0,
postcss-selector-parser 7.1.4 -> 7.1.7, source-map-js 1.2.1 -> 1.2.2.
devalue was already 6.0.3 on main.

Recursive audit (`yarn npm audit --all --recursive`) on the branch: 24 reports
before, 10 after, none of the five packages left. Remaining: @ungap/structured-clone,
brace-expansion (3), compression, glob, node-forge, prebuild-install,
serialize-javascript, zod. Docker immutable install, lint and build pass; the
static output served 200 for /, /feed.xml, /sitemap.xml and 60 sampled /_ipx
files (624 exist). The audit still needs a re-run on main after merge.
