---
name: merge-prs
description: Merge multiple open pull requests into a single integration branch for batch deployment, or resolve an in-progress git merge or rebase conflict. Resolves conflicts (never aborts), runs lint and build checks.
argument-hint: "[branch-name] [#pr1 #pr2 #pr3 ...]"
allowed-tools: ["Bash", "Read", "Edit", "Glob", "Grep"]
---

# Merge PRs — Integration Branch Builder

Combine selected open pull requests into one deployment branch. Handles conflict resolution
and validates the result with lint + build.

**Raw arguments:** "$ARGUMENTS"

---

## Modes

- **Batch mode** (default): merge the requested PRs into an integration branch. Follow Steps 1 to 9.
- **Standalone mode**: a merge or rebase is already stopped on conflicts (`git status` shows unmerged
  paths or a rebase in progress) and no PR numbers were given. Skip to the Conflict Rules below. Record the
  unmerged list first (`git diff --name-only --diff-filter=U`), resolve, stage only those paths by name,
  commit or `--continue`, and repeat until the merge or rebase is complete. Only then run Steps 7 and 8
  (lint and build). Never `git add -A` mid-rebase: it sweeps unrelated work into the resolution commit.

## Conflict Rules

Used by both modes (Step 6c in batch mode).

1. **See the state.** Check git history and the conflicting files.
2. **Find the primary sources** for each conflict. Understand why each change was made and what the
   original intent was: read commit messages, PRs, and the original issues or tickets.
3. **Resolve every hunk. Never run `git merge --abort` or `git rebase --abort`.** Preserve both intents
   where possible. Where they are incompatible, pick the side that matches the merge's stated goal and
   note the trade-off. Do not invent new behaviour.
4. **Flag risk, do not stop.** For every hunk where you chose a side, were unsure, or could not merge
   the content (binary or generated files), record the file, what you chose, and why. These notes go in
   the final report and in the body of the merge or rebase commit message, so they survive the session.
5. Apply the file-type rules in Step 6c (lockfiles, whitespace-only, additive changes).
6. **In a rebase, ours and theirs are swapped.** `--ours` is the branch being rebased onto and `--theirs`
   is the commit being replayed. Before using the Step 6c "accept ours" rules, work out which side holds
   the change you want to keep. For `yarn.lock`, follow `AGENTS.md` (resolve `package.json` first, restore
   `yarn.lock` from the correct ref with `git checkout <ref> -- yarn.lock`, then run `yarn install`) and
   skip Step 6d, which is batch mode only.
7. **Git safety.** `git checkout --ours` and `--theirs` are allowed only on paths in the unmerged list.
   No `git reset`, `git clean`, or `git restore`.

---

## Step 1 — Parse Arguments

Tokenize `$ARGUMENTS`:

- Tokens that are purely numeric or match `#\d+` → PR numbers (collect all of them, strip `#`)
- First token that is non-numeric and doesn't start with `#` → use as the integration branch name
- If no branch name is given → default to `deploy/YYYY-MM-DD-batch` using the current Pacific date (`TZ=America/Los_Angeles date +%Y-%m-%d`)

After parsing, state:
- **Branch name:** (resolved or default)
- **Requested PRs:** (list, or "none yet — will show open PRs")

---

## Step 2 — Discover Open PRs

Run:

```bash
gh pr list --state open --json number,title,headRefName,author,createdAt --limit 100 \
  | jq -r '.[] | "#\(.number)  \(.headRefName)  (\(.author.login))  — \(.title)"'
```

Display the table to the user.

If **no PR numbers were given in arguments**, stop here and ask the user:
> "Which PR numbers should I merge? (e.g., `#201 #203 #207`)"
> "What should I name the integration branch? (leave blank for default)"

If PR numbers **were** provided, proceed with those.

---

## Step 3 — Validate Each PR

For each requested PR number, run:

```bash
gh pr view <N> --json number,title,headRefName,state,mergeable,mergeStateStatus
```

Build a validation table:

| PR | Title | Branch | State | Mergeable |
|----|-------|--------|-------|-----------|
| #N | ...   | ...    | open  | MERGEABLE / CONFLICTING / UNKNOWN |

- Skip PRs that are **not open** (closed, merged) — warn the user.
- Flag PRs with `mergeStateStatus: DIRTY` as pre-conflicted against `main` — still attempt but warn.
- Store each PR's `headRefName` for the merge steps.

### 3a — Detect Superseded PRs

Use titles only to find potentially overlapping PRs, then read each actual diff and intended
change before deciding supersession. A manifest minimum, a transitive cleanup and a scoped
resolution can be complementary even when all name the same package.

- Skip a lower-version PR only when the chosen PR demonstrably includes its whole intent and
  supports all requested parent ranges. Record the diff evidence and the superseding PR.
- Preserve complementary changes; compare the final manifest and generated lockfile with every
  requested intent. Multiple incompatible majors can be intentional.
- If overlap is ambiguous, keep it under review rather than silently dropping a requested PR.
  Do not infer compatibility or complete supersession from title/version order.

---

## Step 4 — Preflight Checks

```bash
# Ensure working tree is clean
git status --porcelain
```

If there are uncommitted changes, **stop and warn** the user before proceeding. Do not stash automatically.

```bash
# Fetch latest state of origin
git fetch origin --prune
```

---

## Step 5 — Create Integration Branch from `main`

```bash
git checkout -b <branch-name> origin/main
```

If that branch already exists, stop and inspect its commits/upstream before changing it.
A clean working tree does not mean it has no unpushed commits. Ask to reuse it or choose a
new unused name; never delete/replace it automatically. Any approved deletion needs its own
explicit go and a backup first.

Confirm the new branch's actual HEAD and base after checkout.

---

## Step 6 — Merge Each PR in Sequence

Process PRs in the order the user specified (or ascending number order if none was given).

For each PR `#N` with `headRefName` = `<head-ref>`:

### 6a — Fetch the PR branch

```bash
git fetch origin "pull/<N>/head:pr-<N>-tmp"
```

This creates a local temp branch `pr-<N>-tmp` pointing at the PR's exact HEAD without needing
the contributor's fork to be a named remote.

### 6b — Attempt merge

```bash
git merge --no-ff "pr-<N>-tmp" -m "Merge PR #<N>: <title>"
```

**On clean merge (exit 0):** record success and retain the temporary ref until final
verification. Before creating any temporary branch, ensure its name is unused; do not overwrite
a pre-existing ref. Cleanup is optional and needs explicit deletion approval; use non-forced
`git branch -d` only after confirming the ref's commits are reachable from the integration branch.

**On conflict (exit non-zero):** proceed to Step 6c.

### 6c — Resolve Conflicts

Identify conflicted files:
```bash
git diff --name-only --diff-filter=U
```

Follow the Conflict Rules above. For each conflicted file:

1. **Read the file** with the Read tool — identify all `<<<<<<`, `=======`, `>>>>>>>` markers.
2. Attempt **semantic resolution**:
   - If one side is purely additive and the other is unchanged: keep both.
   - If the conflict is whitespace-only: accept the current side (`git checkout --ours <file>`).
   - If the file is a lockfile (`yarn.lock`, `package-lock.json`): accept **ours** (`git checkout --ours <file>`) to preserve every bump already merged from earlier PRs in this batch — **but this silently drops the current PR's own version bump**, since "ours" predates it. Note the package name in a running list and apply it for real afterward (see Step 6d) — do not skip this follow-up.
   - If the conflict is in `yarn.lock` or any other auto-generated file: same as above — accept ours, then track the package for the Step 6d fixup.
   - If the changes are in different sections/functions of a Vue/JS/TS/CSS file: merge both sides manually using the Edit tool, preserving the intent of both changes.
   - If the conflict involves the same line changed differently by both sides: use judgment based on context (check what each PR's stated purpose is) to pick or blend the correct resolution; or if ambiguous, leave a `// CONFLICT: manual review needed` comment, accept current side, and flag it in the report.
3. After editing, stage the file:
   ```bash
   git add <file>
   ```

After all conflicted files are resolved:
```bash
git commit -m "Merge PR #<N>: <title> (conflicts resolved)" -m "<per-file conflict choices and risks>"
```

If a file cannot be merged semantically (binary file, structural corruption): pick a side with
`git checkout --ours <file>` or `git checkout --theirs <file>`, whichever matches this PR's stated
purpose, stage it, and flag it as a risky resolution per the Conflict Rules. Do not abort. The PR is
still recorded as merged, with the flag in the report.

### 6d — Apply Bumps Left Stale by "Accept Ours" Lockfile Resolutions (batch mode only)

After all PRs are merged, `yarn.lock` will be missing every version bump whose conflict was
resolved by accepting ours (Step 6c), even though `package.json` shows the new version/range.
Verify and fix in one pass:

```bash
docker compose run --rm app yarn install 2>&1
```

Check the `Resolution step` output for `+ <pkg>@npm:<new>` / `- <pkg>@npm:<old>` lines — this
confirms which packages actually moved. If a package that should have bumped (per your tracked
list from Step 6c) does **not** appear in that diff, its `package.json` range didn't force a new
resolution on its own (common for `^`/`~` ranges that the old resolution already satisfied);
apply only the exact PR-requested version/range with the operation appropriate to its scope:

- For a direct dependency, preserve/apply the PR's exact manifest descriptor and run Yarn install; if an explicit upgrade is necessary, pass the exact intended package version/range to `yarn up`, never an unversioned package name.
- For a transitive/lockfile-only change, inspect the parents' actual requests and select a supported recursive-resolution operation or the PR's scoped resolution. A recursive re-resolution can select newer releases than the PR intended, so compare every resulting version with the captured PR intent and reject unexpected movement. Do not turn a transitive fix into a new direct dependency.
- Verify the final manifest and generated lockfile against every requested PR, preserving unrelated pins. If Yarn cannot produce the intended graph through a supported operation, stop and report it rather than silently broadening the requested bump.

Then re-run `yarn install` once more to confirm `yarn.lock` is stable (no further changes), and
commit the result as its own fixup commit — don't fold it silently into an unrelated merge commit.

---

## Step 7 — Lint Check

Run lint in non-TTY Docker mode (required in this project — `make lint` requires TTY):

```bash
docker compose run --rm app yarn lint 2>&1
```

- If exit 0: record as ✅ lint passed.
- If non-zero: display errors. Attempt auto-fix:
  ```bash
  docker compose run --rm app yarn lint --fix 2>&1
  ```
  If lint-fix resolves all errors (exit 0 on re-run): stage fixed files and amend the last commit or create a fixup commit. In standalone mode, run this only after the merge or rebase has finished, and stage the files lint touched by explicit path instead of `git add -A`:
  ```bash
  git add -A
  git commit -m "chore: lint fixes on integration branch"
  ```
  If errors remain: record as ⚠️ lint failed and include error output in report.

---

## Step 8 — Build Check

```bash
docker compose run --rm app yarn build 2>&1
```

This runs Nuxt SSG and generates `.output/public/`. Use a tracked background job with
completion notification. Preserve any running development server's output by building in an
isolated source copy. Do not rebuild images or install packages without current approval.

- If exit 0: record as ✅ build passed.
- If non-zero: record as ❌ build failed, display the relevant error lines (skip verbose webpack output — focus on the actual error).

---

Before declaring verification complete, apply AGENTS.md's task-triggered checks: relevant
Node regression tests, `verify-agent-docs.mjs` for guidance changes, social-image verification
after every static build, the recursive audit gate for dependency changes, and static-only
HTTP image checks for image/IPX/prerender changes. Content merges require the editorial gate;
a successful merge or build does not validate article facts. Report every unrun check.

## Step 9 — Final Report

Print a structured summary:

```
╔══════════════════════════════════════════════════════╗
║  Integration Branch: <branch-name>                  ║
╚══════════════════════════════════════════════════════╝

Merged PRs:
  ✅ #201  Add holiday event listings
  ✅ #203  Update council page — new members
  ⚠️ #207  Fix hero image (conflicts resolved — 2 files)
  ⚠️ #209  Refactor nav (binary conflict, took theirs; flagged for review)
  ⏭️ #205  skipped (superseded by #207 — same package, lower version)

Quality Checks:
  ✅ Lint passed
  ✅ Build passed  (.output/public/ generated)

Conflict notes:
  #207 — resolved src/components/Hero.vue (kept both sides)
        — resolved assets/theme/css/style.css (kept ours)
        — yarn.lock → preserved baseline, then generated the exact requested version/range (Step 6d) and verified the resulting graph

Next steps:
  Push branch:     git push -u origin <branch-name>
  Open deploy PR:  gh pr create --base main --head <branch-name> --title "Deploy: <branch-name>"
  Flagged:         Review #209 and the other flagged resolutions before merging the deploy PR
```

If the build or lint **failed**, emphasize that the branch is not deploy-ready and list the
specific errors the user must fix before pushing.

---

## Notes & Conventions for This Project

- **Non-TTY Docker:** All `make` targets that run `docker compose run -it` will fail without a TTY.
  Use `docker compose run --rm --no-deps -T --pull never app yarn <cmd>` instead, with the existing image.
- **Lockfile conflicts:** `yarn.lock` conflicts → accept `ours`, but that alone does **not**
  regenerate the resolution — track every package whose conflict was resolved this way and
  apply the captured exact version/range through the appropriate direct/transitive operation after all merges (Step 6d). A plain `yarn install` only re-resolves
  packages whose `package.json` range no longer matches the locked version; many bumps (e.g. a
  dependent range like `^4.0.0` that already covers both the old and new patch) need the explicit
  `yarn up` push. Verified in practice: skipping this step left `@nuxt/content`, `nuxt-seo-utils`,
  `picomatch`, `@nuxtjs/sitemap`, and `nuxt-link-checker` bumps silently unapplied despite their
  PRs showing as merged.
- **Superseded PRs:** Step 3a compares actual diffs and intended outcomes. A higher version
  does not supersede complementary manifest/resolution changes by itself.
- **PurgeCSS:** If any PR adds new Bootstrap class names via `:class` bindings, remind the user
  to add them to the `safelist` in `nuxt.config.ts`.
- **Content conflicts:** If two PRs both added files under `content/`, they almost never conflict —
  each adds separate `.md` files with unique slugs. If they do collide, accept both and rename.
- **Do not push automatically.** Leave pushing and PR creation to the user, per project convention.
