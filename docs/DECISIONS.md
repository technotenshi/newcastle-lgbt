# Decision log

Source of truth for this repo's decisions. Append dated entries; newest last.
Chat output from any AI tool is a draft until recorded here. Current cross-tool working rules live in `AGENTS.md`; historical entries below retain references to the former `~/HARNESS.md` agreement.

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

## 2026-10-24 Cleared three of the five remaining audit reports (#461)

Recursive audit (`yarn npm audit --all --recursive`): 10 reports before, 5
after. Docker immutable install, lint and a production build pass (733 routes,
0 errors). Served statically, `/`, `/news/`, `/events/`, `/council-members/`,
`/sitemap.xml`, `/robots.txt` and `/feed.xml` return 200 (gzip on all but
robots.txt, which is 119 bytes), 60 of 60 sampled `/_ipx` files return 200 (624
exist), and `scripts/verify-social-images.mjs` passes.

Fixed:

- @ungap/structured-clone 1.3.0 to 1.4.0 and brace-expansion 5.0.9 to 5.0.12:
  `yarn up -R`, lockfile only. All four parents request `^1.0.0`, and
  minimatch 10.2.6 (the latest 10.x) requests `^5.0.8`.
- compression 1.8.1 to 1.8.2: `serve` 14.2.6 is the latest release and pins
  compression exactly, so `package.json` gained one scoped resolution
  (`compression@npm:1.8.1`). It is a patch release and only adds a `destroy`
  dependency.

Exceptions, review by 2026-11-23:

- node-forge 1.4.0 (high, GHSA-86w9-cpqp-85rv): no patched release exists
  (`first_patched_version` is null and 1.4.0 is the latest on npm). The fix is
  digitalbazaar/forge PR 1152, still open. It arrives through listhen 1.10.0
  (the latest listhen is 1.10.1, which still requests `^1.4.0`), a dev and image
  server dependency; the deployed site is static. Revisit when forge releases a
  fix.
- glob 10.5.0 (deprecation notice, not an advisory): archiver-utils 5.0.2 is
  the latest release and requests `^10.0.0`. The only consumer is archiver 7.0.1
  through nitropack, which uses it for the Azure preset only. archiver 8 drops
  glob, but nitropack (latest 2.13.5) requests `^7.0.1`. Forcing glob 13 would
  cross a major version on a path this site never runs, so it was not done.
  Revisit when nitropack moves to archiver 8.

Not covered by #461: serialize-javascript 7.0.5 (low, from
`@rollup/plugin-terser`) has no ticket yet. prebuild-install is #460 and zod is
the #462 exception.

## 2026-10-24 Moved better-sqlite3 to 13 to drop prebuild-install (#460)

better-sqlite3 `^12.5.0` to `^13.0.0` (12.11.1 to 13.0.3) with `yarn up`. 13.0.3
has no `prebuild-install` dependency (it depends on `node-addon-api` only), and
the installed `@nuxt/content` accepts `^12.5.0 || ^13.0.0`, so SQLite stays inside
Content's supported range. The lockfile drops better-sqlite3's old installer
chain (prebuild-install and its 20 or so transitive packages); no other package
moved.

Verified in Docker: `yarn why prebuild-install` finds nothing, immutable install
and lint pass, 13.0.3 built from source in the image, and a production build
prerendered 733 routes with 0 errors (same count as before). Served statically,
`/`, `/news/`, `/events/`, `/council-members/`, `/sitemap.xml` and `/feed.xml`
return 200, 60 of 60 sampled `/_ipx` files return 200 (624 exist), and
`scripts/verify-social-images.mjs` passes. The recursive audit went from 5
reports to 4: glob and node-forge (recorded exceptions), serialize-javascript
(#468) and zod (#462).

## 2026-10-24 Retired the better-sqlite3 Renovate pin (#470)

Removed the `better-sqlite3` `allowedVersions: "^12.5.0"` rule from
`renovate.json`. It was added on 2026-08-21 to match Nuxt Content 3.15.2's optional
peer range, and it is superseded: #460 (PR #469) moved the site to
`better-sqlite3` `^13.0.0` (13.0.3), and the locked `@nuxt/content` 3.16.2 declares
`^12.5.0 || ^13.0.0`. With the pin left in place Renovate would reject every 13.x
release of the dependency the site now uses. Content's declared peer range is the
compatibility guard from here on; if a future Content release narrows it, pin
again in the ticket that bumps Content. The `@nuxt/image` rule is unchanged.

## 2026-10-24 Added a recursive dependency audit gate with an exception register (#462)

New workflow `.github/workflows/dependency-audit.yml` runs `scripts/audit-gate.mjs`
(`yarn npm audit --all --recursive --json`). It fails on critical and high reports
that have no row in `docs/maintenance/audit-exceptions.md`, on any register row
past its review date, on an unrecognised severity, and when the audit itself
cannot run. Moderate, low and info reports, including deprecation notices, are
logged as warnings. It runs on pushes to `main`, weekly (Mondays 15:00 UTC), and
on pull requests that change `package.json` or `yarn.lock`; it is not a required
check on every pull request, because new advisories appear independently of a
pull request's content. It does no `yarn install`: the audit needs only
`package.json` and `yarn.lock` (checked on a copy with no `node_modules`), so
no dependency install scripts run in this job.

Two choices go beyond the ticket text. The pull request path filter also lists
the gate's own files (script, test, register, workflow), so a change to the gate
is exercised before it merges. The script's unit tests (`node:test`, no new
dependency) run in the same workflow; they are the repository's first automated
tests.

The register is a Markdown table the script parses. Entries match on package plus
advisory ID (GHSA or numeric audit ID, or the word `deprecation`), so a second
advisory on an excepted package still fails. Seeded with zod, node-forge and glob
(review 2026-11-23).

zod rationale, checked against the installed `@nuxt/content` 3.16.2: advisory
GHSA-mrhx-c7xc-m3w5 concerns the array parse logic in zod 4 core, which the
3.25.76 package ships under `zod/v4`. Content imports `zod` and `zod/v4` only to
declare schemas and convert them to JSON Schema; its `dist/module.mjs` and
`dist/chunks/zod4.mjs` never call `parse` or `safeParse`, and `content.config.ts`
declares no schema. So the ticket's wording (Content "validates repo-authored
frontmatter at build time") is not what the code does; the register records the
code path instead. serialize-javascript (low, #468) is a warning and has no
register row.

## 2026-10-24 Landed the six Nuxt SEO module majors together (#463, #464)

Bumped `@nuxtjs/sitemap` 8.6.2 to 9.1.0, `@nuxtjs/robots` 6.2.4 to 7.0.2,
`nuxt-og-image` 6.10.4 to 7.0.7, `nuxt-link-checker` 5.3.0 to 6.0.1,
`nuxt-schema-org` `^6.1.0` to `^7.0.1` and `nuxt-seo-utils` 8.6.1 to 9.0.1 in one
change, and added a direct `zod` `^4.6.6` devDependency. This supersedes the
Renovate PRs #449, #440, #452, #450, #453 and #454 and the Dependabot PRs #421
and #420.

Why one change instead of the two groups the tickets described: sitemap 9 and
robots 7 depend on `nuxt-site-config` 5, while the other four modules at their old
majors depend on 4.2.3. Both majors register the `#site-config` alias and the 4.x
one wins, so a build with only group A fails in Nitro with `EISDIR` on
`nuxt-site-config/dist/runtime/server` (imported by sitemap's `sitemap.xsl.js`).
Reproduced with sitemap 9.1.0, robots 7.0.2 and zod only; install and lint passed,
the build did not. Og-image 7.0.7, link-checker 6.0.1, schema-org 7.0.1 and
seo-utils 9.0.1 all depend on site-config `^5.0.0`, so the six move together and
the lockfile now holds one site-config major (5.0.3) and `nuxtseo-shared` 6.

zod: the peer range of sitemap 9 and robots 7 is `^4.6.5`. The direct dependency
uses `^4.6.6`, because GHSA-mrhx-c7xc-m3w5 lists everything below 4.6.6 as
affected; it resolves to 4.6.7. `@nuxt/content` 3.16.2 still pins `^3.25.76`, so
two copies exist: 3.25.76 under Content (the #462 register row) and 4.6.7 for the
workspace. The audit gate reports the same four items as before, with no new
finding from the direct zod.

Verified in Docker and on a static serve of `.output/public`: immutable install and
lint pass; the production build prerenders 733 routes (unchanged) and the link
checker reports 0 warnings; `/`, `/news/`, `/events/`, `/council-members/`,
`/sitemap.xml`, `/robots.txt` and `/feed.xml` return 200; the sitemap lists the
same 51 URLs as the live site; `robots.txt` is generated and `public/` has no
hand-written one; `.output/public/_ipx` holds 624 files and 60 of 60 sampled files
return 200; `scripts/verify-social-images.mjs` passes. On sampled pages (home and
two articles) `og:image`, `twitter:image`, canonical and `og:title` each appear once
and the JSON-LD matches the live site. `ogImage.enabled: false` is unchanged and
the build did not prompt for a renderer.

Not verified: the post-merge audit on `main`, behaviour of the deployed Cloudflare
Pages build, and individual article pages beyond the two sampled.

## 2026-10-24 Moved the Renovate stale lockfile playbook into the maintenance docs (#316)

The recovery steps for Renovate pull requests that change `package.json` but leave
`yarn.lock` stale (Mend's hosted runtime fails with "global Yarn is 1.22.22" against
the `packageManager` field) now live in
`docs/maintenance/2026-10-24-renovate-stale-lockfile.md`, linked from `AGENTS.md` and
`CLAUDE.md`. #316 is closed by that doc. The cause stays unfixed in this repo on
purpose: the failure is in Mend's hosted runtime, the repo already runs
`corepack enable` in the `Dockerfile` and both install workflows, and `binarySource`
is a self hosted Renovate option that `renovate.json` on the hosted app cannot set.
The only known lever is Mend support, which a human contacts if recurrence grows (3 of
the last 40 Renovate PRs as of 2026-10-22). The doc's commands use the Docker
commands from the Makefile and take the Yarn version from `packageManager`. They were
run against #390 in a scratch clone: `--immutable` failed, `yarn install` changed
`yarn.lock` only, and `--immutable`, lint and build then passed. Nothing was pushed
to #390.

## 2026-10-24 Audited the Dependabot and Renovate configuration

Renovate owns routine version updates. `.github/dependabot.yml` now sets
`open-pull-requests-limit: 0` for npm, which turns off Dependabot version updates
(they duplicated Renovate and produced #420 and #421) and leaves Dependabot
security updates, which come from the repository settings, untouched.

`renovate.json` gained `minimumReleaseAge: "3 days"` and a `Nuxt SEO modules` group
for `@nuxtjs/robots`, `@nuxtjs/sitemap`, `nuxt-link-checker`, `nuxt-og-image`,
`nuxt-schema-org` and `nuxt-seo-utils`, so the modules that must share one
`nuxt-site-config` major arrive in one PR (see the #463 and #464 entry). The age gate
does not catch functional regressions such as `@nuxt/image` 2.1.0. The `@nuxt/image`
rule is unchanged. `renovate-config-validator --strict` passes.

The `Dockerfile` no longer runs `corepack prepare yarn@4.18.0`, which had drifted from
`packageManager` (4.18.1) because Renovate does not update that line. Corepack now
takes the version from `packageManager`; the first container run downloads Yarn.
Unverified until Renovate's next run: that the group forms one PR, and that the age
gate does not delay security PRs (Renovate documents vulnerability PRs as exempt from
schedule; the age gate is not confirmed against the docs).

## 2026-10-28 Made imageHeader required for news articles; corrected the IL26-001 research claim

Every news article now needs both `image` and `imageHeader` (path and alt). `docs/content-authoring.md`,
the `content-check`, `new-article`, `generate-images` and `image-prompt` skills (both the `.claude` and
`.agents` mirrors) were updated to match. `imageHeader.alt` stays a one-line article summary, not an
image description. Decided by the site owner after the October 28 election feature shipped with only one image.

`docs/research/lets-go-washington.md` wrongly said IL26-001 does not remove the nondiscrimination clause
(sexual orientation, gender expression, gender identity) from RCW 28A.605.005. The Attorney General's
explanatory statement of July 21, 2026 and the initiative text say it is removed and replaced with an
assurance against discrimination based on the family's sincerely held religious beliefs. The separate
prohibitions in chapters 28A.640 and 28A.642 RCW are not repealed. The research file was corrected, and
it no longer attributes I-2066 to Let's Go Washington without a source.

Process rule: run the `content-check` skill, the editorial checklist final pass, and a source-by-source
fact-check before calling a news article ready. Linting and a static build do not test a draft article,
because drafts are excluded from the build.

## 2026-10-28 Corrected factual errors in two earlier initiative articles

Approved by the site owner after the October 28 election feature exposed them. Each was checked against the
IL26-001 and IL26-638 texts, the Attorney General's explanatory statements, or the PDC.

`content/news/20260904-01-anti-lgbtq-ballot-initiatives-documented-risks.md`: the records-shield paragraph said
the original law also protects a parent who is a criminal defendant, but IL26-001's restored text covers only
medical, health, or mental health counseling records of a parent who is the target of a pending investigation;
the intro called natural gas initiative I-2066 Let's Go Washington's fourth 2024 measure, but a Building
Industry Association of Washington led coalition placed it and the PDC counts LGW's six as three enacted and
three on the ballot; and it now notes, per the Attorney General, that IL26-001 removes the nondiscrimination
clause from the parents' rights statute.

`content/news/20260319-03-pflag-chapters-oppose-anti-lgbtq-initiatives.md`: "out-of-state millionaire" now names
the Redmond-based committee led by Brian Heywood; the claim that counselors would be legally required to disclose
a student's LGBTQ+ identity is replaced with what the text does (broader records access, notice when a child goes
to a youth shelter or host home); and "mandate invasive bodily examinations" is restated as a provider verification
requirement that opponents warn could involve invasive examinations.

The Sept 4 article was then converted to numbered `[^N]` footnotes with APA 7 entries. While mapping claims to
sources, these were corrected or removed because the listed sources did not support them: "Skyler Rude" and "along
party lines" (Rep. Couture's release names neither); "250,000 student-athletes" (sources say more than 200,000);
the Dr. Gina Martin quote, which came from New York Magazine as quoted in a HeraldNet op-ed by Katie Johnson, not
written by Martin; "more than $1.86 million" from Heywood (the figure is $1,857,918); opposition donors (NEA and
Inatai Foundation replaced with the donors Ballotpedia lists); the attribution of a legal-name and pronoun argument
to the ACLU of Washington and Gender Justice League at the campaign launch, which no listed source supports; and
the attribution of "more than 100 doctors" to the PTA and the Seattle Times. Still unsourced and left unmarked:
the FERPA 45-day ceiling and state-faster-turnaround claim, LGW's argument that IL26-001 governs only records the
school creates, WIAA's reported "no intent to change" its policy (removed), "fourth ballot cycle in three years",
and "funded almost entirely by Let's Go Washington".

## 2026-10-28 The `draft` flag is not a default

Decided by the site owner. Leave `draft` out of new articles. Use `draft: true` only when the owner says an article
is not meant to be published soon, or when a published article must be recalled. Reason: a draft is hidden from every
listing and from the build, so the owner cannot review the rendered page. `docs/content-authoring.md` now says so.

## 2026-10-28 AGENTS.md and .agents are the canonical agent files

Decided by the site owner. `AGENTS.md` is the only agent instruction file, and `.agents/` holds the only copy of the
project skills and subagents. Claude Code reads `AGENTS.md` natively when no `CLAUDE.md` exists in or above the working
directory (confirmed in the Claude Code memory docs and against v2.1.309), so `CLAUDE.md` was merged into `AGENTS.md`
and deleted. Do not add a `CLAUDE.md` back: it would hide `AGENTS.md` from Claude Code.

What changed: the `CLAUDE.md` only rules moved into `AGENTS.md`, `docs/tooling-notes.md` (new),
`docs/content-authoring.md`, and `docs/image-generation-guide.md`, which keeps `AGENTS.md` near 200 lines.
`.claude/skills` and `.claude/agents` are now single directory symlinks to `.agents/skills` and `.agents/agents`.
`skilld-lock.yaml` moved next to the skills. `.codex/` was deleted, including its `content-reviewer` copy, which lacked
the editorial stance section and checks 5 and 11 that the `.claude` copy had; the `.claude` copy became the canonical
`.agents/agents/content-reviewer.md`.

Reason: the same skills, the reviewer, and the instructions existed in two or three hand synced places and had drifted
(the `ics-event` skill named the wrong tool, and the Codex reviewer had fallen behind).

Consequences: hooks stay in `.claude/settings.json` and run only in Claude Code. With `.codex/hooks.json` gone, other
tools no longer get the hard block on editing `.env`, `.env.*`, and `yarn.lock`; `AGENTS.md` still forbids it as text.
Git on some Windows checkouts turns symlinks into plain files. The site build and Cloudflare Pages do not read `.claude`,
so the deployed site is unaffected. Earlier entries in this log that mention `CLAUDE.md`, `.codex`, or mirrored skill
copies stay as accurate history.

## 2026-10-28 Pack skills come from the global install, not this repo

Decided by the site owner. Where a skill exists both in `.agents/skills` here and in the global `~/.agents/skills`
(which `~/.claude/skills` and `~/.hermes/skills` link to), the global copy wins and the repo copy is removed.
34 copies of the mattpocock/skills pack were removed. They had been installed by `npx skills` in this repo and again
globally; 16 were identical and 18 had drifted, with the global copy always the newer pack. The 10 project skills stay,
and so do three pack skills the current pack no longer ships (`implement-spec`, `resolving-merge-conflicts`, `retro`).
`skills-lock.json` now lists only those three.

The newer pack renamed the domain file from `CONTEXT.md` to `GLOSSARY.md` (and `CONTEXT-MAP.md` to
`GLOSSARY-MAP.md`), so `docs/agents/domain.md` and `AGENTS.md` follow it. Neither file exists in this repo yet. The
other `docs/agents/` files were generated from older setup templates and may be slightly stale; regenerating them is
a separate task.

Consequence: a fresh clone, CI, or a cloud agent without the global install does not get the pack skills. The removed
copies are in git history (822a8bc and earlier).

## 2026-10-28 Drop the repo copies of implement-spec and retro

Decided by the site owner. The mattpocock/skills pack was reinstalled globally and now ships `implement-spec` and
`retro` again, so the repo copies duplicated the global ones. The repo copies were the older pack versions from the
2026-08-28 install and had no local edits, so they were removed. `skills-lock.json` now lists only
`resolving-merge-conflicts`, the one skill the current pack does not ship.

This supersedes the three-skill exception in the entry above, which stays as accurate history.

## 2026-10-28 One merge skill: resolving-merge-conflicts folded into merge-prs

Decided by the site owner. `resolving-merge-conflicts` (a 14 line generic skill the current pack no longer ships)
overlapped with the conflict step of `merge-prs` and disagreed with it on aborting. They are now one skill,
`merge-prs`. It has a batch mode (the existing Renovate and PR workflow) and a standalone mode for a merge or
rebase that is already stopped on conflicts, and both use the same Conflict Rules: find the intent first, keep
both sides where possible, run the checks, and finish.

The abort rule changed: the skill never runs `git merge --abort` or `git rebase --abort`. A conflict it cannot
merge semantically (binary or generated files) is resolved by taking the side that matches the PR's purpose, and
it is flagged in the final report instead of skipping the PR.

`skills-lock.json` listed only `resolving-merge-conflicts`, so it was deleted. The repo no longer tracks any
pack skill. The removed skill is in git history.

## 2026-10-28 Review follow-ups: safer merge-prs standalone mode, Codex pointers

Decided by the site owner after the review of the agent files PR.

`merge-prs` standalone mode now matches how a rebase works. In a rebase `--ours` and `--theirs` are swapped, so the
skill says to pick the side by content, and to follow `AGENTS.md` for `yarn.lock` instead of the batch fixup
(Step 6d is batch only). It stages only the unmerged paths by name instead of everything, and runs lint and build
after the merge or rebase has finished. Because the skill never aborts, each flagged resolution is also written into
the merge or rebase commit message body, and the skill forbids `git reset`, `git clean`, and `git restore`.

Deleting `.codex/` left Codex without a reviewer pointer, so `AGENTS.md` now tells tools without subagent support to
read `.agents/agents/content-reviewer.md` as a checklist. The `generate-images` skill runs `codex exec`, so its prompt
now tells Codex to write only the image file and never touch `.env`, `.env.*`, or `yarn.lock`. This is text, not an
enforced block like the old hook.

## 2026-10-28 Jaelynn Scott article claims only Washington's first, from re-fetched sources

Decided by the site owner while planning the article on Jaelynn Scott's House race in the 37th Legislative District.

The article says only that Scott would be Washington's first openly transgender legislator, attributed to the Washington
State Standard and KNKX, and written in conditional tense until King County certifies the result on November 24. It leaves
out the national claim that she would be the first Black trans person elected to a state legislature. The Standard prints
that claim, but Erin in the Morning and The 19th describe Mauree Turner (Oklahoma, 2020), who is Black and nonbinary, as the
first out Black trans person in a state legislature, and Wikipedia's "first to hold political office" line conflicts with
Andrea Jenkins (Minneapolis City Council, 2017). The history notes are in `docs/research/jaelynn-scott-lavender-rights-project.md`.

Citations come only from pages re-fetched on the day, not from the two ChatGPT research reports, whose references were
placeholders and whose finance figures were older than the Public Disclosure Commission pages. Campaign finance figures
carry an "as of" date, and the article uses McCorkle's name without pronouns because sources disagree.

## 2026-11-03 Batch the twelve open dependency PRs into one branch, retire the node-forge exception

Decided by the site owner after the `Dependency audit` job started failing on `main` and eleven of twelve open bot PRs
were failing one or more checks.

The twelve PRs (#430, #486, #490 to #493, #495 to #500) bump different packages, so none duplicates or supersedes another.
They are applied to one branch as separate commits and squash-merged as one PR, because `main` requires branches to be
up to date and each merge otherwise forces a rebase of the rest. Renovate and Dependabot close their PRs once `main`
contains the change. `yarn.lock` is regenerated once (`yarn install`, then `yarn up -R` for the lockfile-only bumps)
instead of merging five PRs that edit the same file. Five of the PRs changed only `package.json` because Renovate
could not regenerate the lockfile (issue #316); that is why their `build` and `renovate/artifacts` checks failed.

Two other failures had one cause each. `claude-review` failed on every bot PR with "Workflow initiated by non-human
actor", so `claude-code-review.yml` now sets `allowed_bots: 'renovate,dependabot'`. The audit job failed on `main`
because node-forge 1.4.0 gained four high advisories; #497 moves it to 1.4.2, after which the gate reports no node-forge
finding, so the register row that said no patched release exists is removed.

`.nvmrc` moves to 26 to match the `Dockerfile` and the audit workflow. The CI build matrix stays on 24.x because renaming
it would rename the required check `build (24.x)`.

## 2026-11-02 Reign protest article centers solidarity and separates evidence from estimates

Approved by the site owner: create the Reign protest article with a November 2 Pacific date and a
November 3 voting call, include the eyewitness's qualified "might be six" quotation, build a standing
Keith Swank research file, and give Amendment 53 a short, non-endorsing explanation. Do not equate
Swank's reported 87-person organizing group with attendance or claim he attended without evidence.
Use the named SPD disciplinary report for his employment record and the county's primary ballot
explanation for Amendment 53. The generated images are labeled as illustrations, not event photos.

## 2026-11-04 Election results article is an unpublished reporting snapshot

Approved by the site owner through the grill-with-docs interview: prepare a Washington and Newcastle first
follow-up linking the voter's guide, Jaelynn Scott profile and Reign protest report. Include local contests,
statewide measures, state legislative balance, Pierce Amendments 53 and 54, national congressional control,
governor totals and selected representation milestones. Retain evidence-backed LGBTQ+ advocacy and keep
`draft: true` until publication is requested. Refresh results only when asked; any requested revision after
publication must identify changes since the previous published snapshot. Do not promise continuous updates.

Attributed news-organization race calls may be reported before certification, with their uncertified status
made explicit. This supersedes the October 28 decision to keep Scott's outcome conditional until certification;
it does not authorize editing the earlier article. Keep current leads, attributed calls, certified results and
if-leads-hold compositions distinct. `GLOSSARY.md` records these reporting terms. No architectural ADR is needed.

Use compact tables rather than introduce new dashboard components for this article. Preserve a source snapshot
and calculation notes in `docs/research/2026-election-results*`. Verify displayed times in a Pacific-time browser:
text extraction rendered the official dashboards three hours later. Treat canceled Superior Court contests
separately from November races with vote returns. Leave the prior voter's guide unchanged pending separate approval.

## 2026-11-04 Prepare the evening election snapshot for publication

The owner requested current numbers for publication with an evening snapshot. Refresh the article to a
6:05 p.m. PST cutoff, remove the draft flag, and preserve the afternoon CSV alongside a new evening CSV.
Keep unofficial counts, attributed calls and conditional chamber scenarios distinct. This is the first
publication edition, not a post-publication update. Do not add the deferred turnout or demographic analysis.

The owner selected file refresh only when offered Docker lint and a static publication build. Do not run
those checks, install dependencies, commit, push or deploy as part of this refresh. Mechanical content and
arithmetic checks do not establish that the newly included article route renders or its social image exists.
Leave prior published articles and the untracked `.codex/` directory untouched.

## 2026-11-04 Add a sobering I-638 section grounded in organizational responses

Approved through the owner's interview: add a standalone section after the initiative explanations,
leading with harm and belonging, briefly mentioning passage as a serious prospect without printing market
percentages. Market prices are context, not an election call or a reliable reversal forecast. Distinguish
ACLU's pre-election commentary from the coalition's actual November 3 response, naming the speakers.

Describe December 3 effectiveness if approved using the official fiscal analysis, separate anticipated
guidance from instructions already issued, and do not promise a lawsuit, injunction or court rescue.
Include existing school civil-rights and Education Ombuds assistance without guaranteeing eligibility.
Timestamp supplemental context separately from the 6:05 p.m. vote snapshot. Update citations and the
research record; run source and mechanical checks only. No Docker checks, commit, push or publication.

## 2026-11-04 Remove three Nuxt startup warnings

The owner approved declaring the root package as an ES module, removing the redundant
`app.head.charset` default, and pre-bundling the Shiki dependencies reported by Vite.
An identical config imported in a temporary package emitted Node's module-type warning
without `type: module` and imported without that warning when the type was declared.
Keep the existing Bootstrap and Schema.org pre-bundle entries. Network bindings remain
unchanged and require separate approval. Verify lint and the static build in Docker;
use an isolated source copy for the build to preserve the running dev server's output.

## 2026-11-04 Update I-638 to AP projected passage

The owner supplied an AP results screenshot and requested the article update. Report AP's
Yes call at 6:14 p.m. November 4, with a display update at 6:21 p.m., separately from
certification and the unchanged official numerical snapshot. The screenshot shows Yes
1,252,863 (56.6%), No 961,810 (43.4%), and an estimated 66% counted. Cite the supplied
screenshot transparently; its original page URL was not provided. Update the lead, summary
and I-638 discussion consistently. Retain the existing file-only verification scope.

## 2026-11-04 Reusable graphical election snapshots for measures and candidates

Approved by the owner through the graphical-results implementation brief. This supersedes
the earlier table-only choice and file-only verification scope for this graphical display
task. Replace only the three statewide initiative rows and the introductory table reference;
preserve the rest of the existing article and its publication frontmatter.

Use an SSR/static-compatible MDC component with authored YAML props, no live feed, CSV/JSON
data connection or new dependencies. Counts determine all shares and margins, including
supplied write-in aggregates; preserve Yes/No and candidate ballot order. Measure stances
are explicitly authored favorable/green, harmful/red or neutral/gray with visible LGBTQ+
rights labels; candidate parties use blue, red, gold, green or gray with visible party text.
Never infer calls from leads. Clearly mark ties, zero counts and incomplete data.

Every block includes count source and snapshot time; calls and certified statuses require
their own attributable evidence and timestamps, separate from the reporting cutoff and
screenshot display update. Native Markdown slots preserve existing footnotes. All data
remains accessible as semantic text without color, hover or scripts, with decorative tracks,
phone stacking and a print fallback.

The two approved public test seams are the result formatter and rendered MDC component
fixtures, exercised through Node built-in tests in Docker using red/green slices. Docker
tests and lint are approved here; the parent workflow owns the real static build and browser
verification of the article route and external synthetic candidate fixture. No package
installation, image build, server restart, network-binding change, staging, commit, push,
PR or publication is authorized by this implementation task.

## 2026-11-04 Extend graphical snapshots to the full requested results

The owner approved replacing the six additional results tables with the same static
component, superseding the three-initiative-only scope above. Preserve the snapshot
counts, citations, write-ins and authored order; use nonpartisan labels for courts and
county offices. Pierce's official Approved/Rejected labels remain unchanged and have
no assigned advocacy stance. The prior neutral treatment of I-645 is superseded: the
site's existing election article endorsed No, so Yes is harmful and No favorable.

A separate whole-chamber seats mode distinguishes if-leads-hold scenarios from AP's
called-seat and continuing-officeholder accounting, includes uncalled in denominators,
and does not infer winners or vote margins. Record an observed call time separately
when the actual call time is unknown. Keep the existing 6:14 I-638 call, 6:21 display
update and earlier vote snapshots distinct. The parent workflow owns static build and
browser verification; no restart, publication, staging, commit or push is authorized.

## 2026-11-05 Correct the published election article without refreshing results

The owner requested an implementation agent on a feature branch, followed by independent parent review,
verification and validation. Commits and pushes to main are forbidden. Keep the November 4 vote/seat
snapshot, source CSVs, frontmatter, images and prior articles unchanged; identify editorial corrections
in a dated note for readers.

Cite the owner's subsequently supplied Seattle Times URL for the AP results screenshot. The owner considers
PST likely but has not confirmed it, so preserve the 6:14 call and 6:21 display times as displayed times
with an explicit timezone limitation. This supersedes the chart's UTC-08:00 assumption. Allow a sourced
media call without an absolute call or observation timestamp rather than inventing one; retain visible
source attribution and strict timestamp requirements for certification. Document and test that narrow case.

Clarify I-645's 2028 start and shared deduction using the AG explanation, correct the Scott report's
byline/date, add sourced Let's Go Washington/Brian Heywood context, and shorten repetitive status prose.
Run Docker tests, lint and a static build for validation. No package/lockfile change, commit, push,
merge or deployment is included in this correction task.

## 2026-11-05 Plan image emotion alongside story coverage

Use an emotional brief to represent central achievements, threats and community response in image planning. Celebrate meaningful victories visibly when central, while treating urgent harm honestly; give paired images distinct emotional and narrative angles and make the feature engaging at thumbnail size. Review generated images against that intent without implying fictional scenes depict actual events or outcomes. This task updates guidance only; it does not regenerate the election article images.


## 2026-11-05 Regenerate election illustrations with a blue-wave allegory

The owner requested both election article images regenerated using the revised engagement guidance, with blue predominant where appropriate and visual allusions to a blue wave. Use a celebratory feature for representation gains and an active community-belonging header, rather than the prior subdued listening circle and walk. Blue fabric and a blue wave mural express the metaphor in distinct fictional scenes. Preserve the concerning I-638 outcome in the reporting; the images do not imply its defeat or school sports eligibility.

Generation uses separate `gpt-6.1-terra` agents at medium effort and the repository's local Codex native image workflow. The parent reviews actual images, updates article image metadata/disclosure and the dated correction note, and verifies lint, static output and social images. Preserve prior article corrections, all numerical snapshots and the old assets. No commit, push, merge or deployment is part of this task.


## 2026-11-05 Correct sports framing and remove production notes from the article

The owner rejected the celebratory sports header and its caption as tone deaf in reporting a projected sports ban. Replace it with civic-representation imagery and a caption about new LGBTQ+ voices in public life; retain the outdoor representation-celebration feature. This supersedes the earlier choice of a community-sports header. Match each image's emotion to its pictured subject in the shared guide.

The owner also requested removal of third-person site-owner references, the unconfirmed-timezone caveat and the entire editorial-corrections note. Remove unsupported AP clock times from public copy rather than presenting uncertain precision. Keep the attributed AP result and Seattle Times citation, and retain provenance/change history in the research record and PR. This supersedes the earlier requirement for a reader-facing correction note for this revision. Preserve numerical results and official snapshot timestamps. Apply this correction to the existing feature branch and PR.

The owner further directed that the I-638 discussion explicitly criticize its harm to both cisgender and transgender girls. Replace the reassuring genital-exam caveat and the suggestion that exclusion can be separated from harm to girls' sports with the medical-verification barrier, unequal scrutiny and exclusion. Ground the critique in the primary text/AG explanation and attribute the warning about genital examinations to a named opposing medical professional.

## 2026-11-05 Advocacy-forward framing for the election results article

The owner judged the measure coverage too neutral for an advocacy site that opposes these measures before and after the vote. Rewrite the I-638, I-001 and I-645 sections as evidence-backed criticism: fact-check Let's Go Washington's FAQ claims against the initiative texts, state what students lose under I-001 from the AG explanation, and tie I-645 to the public services it would defund. Remove hedges that add no reader value (court-rescue and "assistance routes" caveats, "neither tally establishes why" voter-motive caveats). Retitle the Scott section to say why her win matters to trans people. Link the Reign report wherever it is referenced.

Pierce Charter Amendments 53 and 54 are now marked with stances (Approved favorable, Rejected harmful) instead of neutral, and the section states the site's support for both, grounded in Sheriff Keith Swank's organizing of the Reign protest and his sustained SPD discipline record. No earlier article published a recommendation on these amendments, so the copy states the position now rather than claiming a prior endorsement.

Add Article II, section 41 of the state constitution: for two years after enactment, an approved initiative can be amended only by two-thirds of each chamber. This links I-638 to the legislative seat counts. "Founded by" Heywood was changed to "led by," which is what the cited Standard article supports.

The owner restated the standing position: this is an LGBTQ+ advocacy site, not a neutral news site, and it always criticizes actions, laws and policies that harm LGBTQ+ people. The lessons from this revision are codified as "The stance applies to every format" in `docs/editorial-checklist.md`. Pointers were added to `docs/content-authoring.md`, `docs/election-results.md` (election stance rule: `neutral` only when a measure has no LGBTQ+ stake), `AGENTS.md`, the `content-reviewer` agent, and the `content-check` and `new-article` skills.

## 2026-11-05 Results coverage must report our earlier picks and winners' records

Context: A content-review pass on the November 4 election-results article found sections that stayed neutral where the site had already taken a side. The Supreme Court section ignored the voter's guide picks. LD41 did not connect Zahn and Thai to the law I-001 targeted. A Republican governor-elect's "first" was celebrated without his record. The Congress paragraph had no concrete ask. The title still said "threat" after I-638 was projected to pass.

Decision: Results coverage reports how our recommended candidates fared and restates opponents' documented records. It ties legislators to the roll calls behind the measures and checks every celebrated winner's LGBTQ+ record in primary sources. Neutral paragraphs end with a concrete, sourced ask, and titles name the harm when a harmful measure passes. The rules live in `docs/editorial-checklist.md` under "The stance applies to every format." Process caveats that give readers no information are cut, and so are repeated "uncertified" notes and hedges like "Neither establishes a secured supermajority."

## 2026-11-06 Content gate: read the docs, open the sources, run the review skills

Context: The I-638 aftermath article (PR #510) was drafted without opening `docs/editorial-checklist.md` or `docs/content-authoring.md` and without running `fact-check`, `content-check` or `content-reviewer`. An automated review then found five required fixes and 19 inline comments: a copied biographical error, an unsupported "floor", blame contradicted by Article II, section 1(a), misplaced footnotes, cut quotes and absolute conclusions. Nearly every one was already a checklist rule. `AGENTS.md` pointed to the docs in permissive terms, put its manual self-check under a heading labelled "Claude Code only", and the `new-article` skill ended at image generation with no review step. The primary initiative text was cited from another article's source list after a `+`-encoded URL returned a 404, and the image check reported success when the image tool had returned no description.

Decision: `AGENTS.md` carries a numbered, tool-neutral gate for content (read, open sources, quote from fetched text, check descriptors, limit claims, run the review skills, verify images by looking, `pr` skill body, reply to every review comment). `new-article` gains a "Before drafting" section and a review step. `generate-images` states that an image tool without a description is not a verification. New patterns are in `docs/editorial-checklist.md` ("Lessons from the I-638 aftermath article") and `docs/content-authoring.md` ("Verifying sources"). A green lint and build are not evidence of accuracy.

## 2026-11-06 Keep startup instructions bounded and retire broken repository hooks

The owner requested an instruction/documentation audit, section-based authoring-guide reads,
cheaper web-fetch delegation and evidence-based unused-skill visibility cleanup. The owner
also approved removing repository Claude hooks and replacing their security block with native
file-deny rules, plus real scratch permission/model probes and a documentation regression check.

The old AGENTS file exceeded Hermes's supported 20,000-character floor; the real truncation
function reproduced the loss. Keep the canonical AGENTS entry under 12,000 characters / 180
lines, routing to complete task-relevant sections instead of eagerly loading whole manuals.
The required editorial/source/image gates remain binding. Do not restore CLAUDE.md.

All repository Claude hooks are removed: their old input-variable wiring failed a real
lockfile-block fixture, and lint/Stop used a Mac-only path. Native permissions protect env
file reads/writes and lockfile writes in Claude file tools; they are not a shell sandbox or
cross-tool enforcement. Lint/build and editorial checks are explicit requirements.

The project web-fetch override uses Haiku without changing the main/reviewer models; a real
child fetched example.com on claude-haiku-5-5. Personal Claude visibility settings preserve
required/recent shared workflows instead of treating absent Skill invocations as non-use.
Current guidance, test boundaries and the audit scope are recorded in
[agent configuration](agents/agent-configuration.md) and the
[documentation audit](agents/documentation-audit.md). Historical decision entries retain
old file names and scoped approvals; they do not authorize a new session's actions.

## 2026-11-07 One publication rule for news

The owner approved an architecture review of the news code. The rule for which news is
published lived in four places (`useNews`, `server/routes/feed.xml.ts`, the article page and
the news index) and had drifted: the article page checked only the date, the feed ignored
`_draft`, and the article page carried its own copies of the helpers in `utils/content.ts`.

`utils/news.mjs` now holds the rule as pure functions over content rows. A published article
has neither `draft` nor `_draft` set and a date on or before today in Pacific time (see
GLOSSARY.md). The app composable and the RSS route each run their own `queryCollection` and
pass the rows in. The article page returns 404 for a draft article; before, a past-dated
draft was reachable by direct URL. `pacificToday()` is the one Pacific-date helper, and
`useEvents` calls it in place of its own `currentDateIso`. News listings carry a plain-text `summary`,
so the news index no longer runs a second query for article bodies. The text helpers moved to
`utils/content.mjs`, re-exported by `utils/content.ts`, and `truncateSummary` takes an
`ellipsis` option so the article meta description keeps its trailing ellipsis.

The module is plain `.mjs` so `scripts/news.test.mjs` runs under `node --test` without Nuxt.
Nitro treats a plain `.mjs` outside `server/` as an external Node module and left an
unresolvable import in the `/feed.xml` route bundle, so
`nuxt.config.ts` lists `utils/` under `nitro.externals.inline`. Verified with a static build
before and after: `feed.xml` differs only in `lastBuildDate`, and all 55 prerendered news
pages have identical markup and meta (scripts, styles and preload links excluded, since their
hashes change per build).
