---
name: merge-prs
description: Merge multiple open pull requests into a single integration branch for batch deployment. Resolves conflicts, runs lint and build checks.
argument-hint: "[branch-name] [#pr1 #pr2 #pr3 ...]"
allowed-tools: ["Bash", "Read", "Edit", "Glob", "Grep"]
---

# Merge PRs — Integration Branch Builder

Combine selected open pull requests into one deployment branch. Handles conflict resolution
and validates the result with lint + build.

**Raw arguments:** "$ARGUMENTS"

---

## Step 1 — Parse Arguments

Tokenize `$ARGUMENTS`:

- Tokens that are purely numeric or match `#\d+` → PR numbers (collect all of them, strip `#`)
- First token that is non-numeric and doesn't start with `#` → use as the integration branch name
- If no branch name is given → default to `deploy/YYYY-MM-DD-batch` using today's date (`date +%Y-%m-%d`)

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

Dependency-bot PRs frequently target the same package at different versions (e.g. a routine
lockfile bump to `12.11.1` alongside a major bump to `13.0.0` for the same library, opened days
apart). Before merging, scan the requested PR titles/branches for repeated package names:

- If two or more PRs bump the **same package**, only the PR requesting the **highest version**
  has any effect once all are merged in ascending-number order — the lower one's change gets
  silently overwritten.
- **Skip the superseded (lower-version) PR entirely** — do not fetch or merge it. Note it in the
  report as `⏭️ skipped (superseded by #N)`, not as a merge result.
- This is a title/version comparison, not a mergeability check — do it before Step 6, using the
  PR titles already gathered in Step 2/3 (renovate/dependabot titles state old→new version).
- If it's ambiguous whether two PRs target the same package (e.g. one bumps a range, another
  bumps a resolution/override for the same package), treat the more specific/higher one as
  authoritative and skip the other.

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

If the branch already exists locally:
```bash
git branch -D <branch-name>
git checkout -b <branch-name> origin/main
```

Confirm current HEAD after checkout.

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

**On clean merge (exit 0):** record as ✅ success and delete the temp branch:
```bash
git branch -D "pr-<N>-tmp"
```

**On conflict (exit non-zero):** proceed to Step 6c.

### 6c — Resolve Conflicts

Identify conflicted files:
```bash
git diff --name-only --diff-filter=U
```

For each conflicted file:

1. **Read the file** with the Read tool — identify all `<<<<<<`, `=======`, `>>>>>>>` markers.
2. Attempt **semantic resolution**:
   - If one side is purely additive and the other is unchanged: keep both.
   - If the conflict is whitespace-only: accept the current side (`git checkout --ours <file>`).
   - If the file is a lockfile (`yarn.lock`, `package-lock.json`): accept **ours** (`git checkout --ours <file>`) to preserve every bump already merged from earlier PRs in this batch — **but this silently drops the current PR's own version bump**, since "ours" predates it. Note the package name in a running list and apply it for real afterward (see Step 6d) — do not skip this follow-up.
   - If the conflict is in `yarn.lock` or any other auto-generated file: same as above — accept ours, then track the package for the Step 6d fixup.
   - If the changes are in different sections/functions of a Vue/JS/TS/CSS file: merge both sides manually using the Edit tool, preserving the intent of both changes.
   - If the conflict involves the same line changed differently by both sides: use judgment based on context (check what each PR's stated purpose is) to pick or blend the correct resolution; or if ambiguous, leave a `// CONFLICT: manual review needed` comment and accept current side.
3. After editing, stage the file:
   ```bash
   git add <file>
   ```

After all conflicted files are resolved:
```bash
git merge --continue -m "Merge PR #<N>: <title> (conflicts resolved)"
```

If resolution is not possible (e.g., binary file conflict, structural corruption):
```bash
git merge --abort
```
Record PR `#N` as ❌ skipped with reason. Delete temp branch. Continue to next PR.

### 6d — Apply Bumps Left Stale by "Accept Ours" Lockfile Resolutions

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
force it explicitly:

```bash
docker compose run --rm app yarn up <pkg1> <pkg2> ...
```

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
  If lint-fix resolves all errors (exit 0 on re-run): stage fixed files and amend the last commit or create a fixup commit:
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

This runs Nuxt SSG and generates `.output/public/`. It may take 1–3 minutes.

- If exit 0: record as ✅ build passed.
- If non-zero: record as ❌ build failed, display the relevant error lines (skip verbose webpack output — focus on the actual error).

---

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
  ❌ #209  Refactor nav (aborted — unresolvable binary conflict)
  ⏭️ #205  skipped (superseded by #207 — same package, lower version)

Quality Checks:
  ✅ Lint passed
  ✅ Build passed  (.output/public/ generated)

Conflict notes:
  #207 — resolved src/components/Hero.vue (kept both sides)
        — resolved assets/theme/css/style.css (kept ours)
        — yarn.lock → accepted ours, then applied via `yarn up <pkg>` (Step 6d) so the bump actually landed

Next steps:
  Push branch:     git push -u origin <branch-name>
  Open deploy PR:  gh pr create --base main --head <branch-name> --title "Deploy: <branch-name>"
  Skipped PRs:     Review #209 separately — it needs manual resolution
```

If the build or lint **failed**, emphasize that the branch is not deploy-ready and list the
specific errors the user must fix before pushing.

---

## Notes & Conventions for This Project

- **Non-TTY Docker:** All `make` targets that run `docker compose run -it` will fail without a TTY.
  Always use `docker compose run --rm app yarn <cmd>` instead.
- **Lockfile conflicts:** `yarn.lock` conflicts → accept `ours`, but that alone does **not**
  regenerate the resolution — track every package whose conflict was resolved this way and
  force it via `yarn up <pkg>` after all merges (Step 6d). A plain `yarn install` only re-resolves
  packages whose `package.json` range no longer matches the locked version; many bumps (e.g. a
  dependent range like `^4.0.0` that already covers both the old and new patch) need the explicit
  `yarn up` push. Verified in practice: skipping this step left `@nuxt/content`, `nuxt-seo-utils`,
  `picomatch`, `@nuxtjs/sitemap`, and `nuxt-link-checker` bumps silently unapplied despite their
  PRs showing as merged.
- **Superseded PRs:** always run Step 3a before merging. Merging a lower-version bump followed
  later by a higher-version bump for the same package is harmless but wasteful (extra commit,
  extra conflict to resolve for no lasting effect) — skip the lower one up front instead.
- **PurgeCSS:** If any PR adds new Bootstrap class names via `:class` bindings, remind the user
  to add them to the `safelist` in `nuxt.config.ts`.
- **Content conflicts:** If two PRs both added files under `content/`, they almost never conflict —
  each adds separate `.md` files with unique slugs. If they do collide, accept both and rename.
- **Do not push automatically.** Leave pushing and PR creation to the user, per project convention.
