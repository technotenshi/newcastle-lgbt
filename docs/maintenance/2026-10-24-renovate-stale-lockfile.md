# Renovate stale lockfile recovery, 2026-10-24

Status: known limitation with a manual workaround, tracked in [GitHub issue #316](https://github.com/technotenshi/newcastle-lgbt/issues/316). The cause is outside this repo and no repo setting fixes it.

## Symptoms

A Renovate pull request changes `package.json` but not `yarn.lock`. Look for all of these:

- The `renovate/artifacts` status check on the PR reads "Artifact file update failure".
- Renovate posted an "Artifact update problem" comment containing this error, with the Yarn version in `packageManager` after `yarn@`:

  ```text
  error This project's package.json defines "packageManager": "yarn@<version>". However the current global version of Yarn is 1.22.22.
  Presence of the "packageManager" field indicates that the project is meant to be used with Corepack...
  ```

- The `build` job fails at `yarn install --immutable` with "The lockfile would have been modified by this install, which is explicitly forbidden."
- The PR's diff touches `package.json` only.

The failure is intermittent. It affected 3 of the last 40 Renovate PRs as of 2026-10-22: #435 (2026-10-22), #424 (2026-10-21) and #390 (2026-09-13, still open).

## Cause

Mend's hosted Renovate runtime runs `yarn install` to regenerate the lockfile, and that environment has classic Yarn 1.22.22 on its path without Corepack enabled. Yarn 1 sees the `packageManager` field, refuses to run, and Renovate pushes the `package.json` change with the old lockfile.

The repo side is correct, so there is nothing to fix here:

- `corepack enable` runs in the `Dockerfile`.
- `corepack enable` runs in both workflows that install dependencies.
- The Renovate setting that controls how tools are invoked, `binarySource`, applies to self hosted Renovate only. This repo uses the hosted Mend app, so `renovate.json` cannot set it.

## Recovery steps

Run these from a clean checkout of the repo, with Docker running. Replace `<pr-branch>` with the PR's head branch (for example `renovate/babel-monorepo`) and `<package>` with the package name.

1. Fetch and check out the PR branch:

   ```sh
   git fetch origin
   git checkout -b <pr-branch> origin/<pr-branch>
   ```

2. Check whether the branch is behind `main`. The left number is how many commits `main` has that the branch lacks:

   ```sh
   git rev-list --left-right --count origin/main...HEAD
   ```

3. If the left number is above 0, rebase onto the latest `main`:

   ```sh
   git rebase origin/main
   ```

4. Regenerate `yarn.lock`. The container reads the Yarn version from `packageManager` in `package.json` through Corepack, so do not install or pin a Yarn version yourself:

   ```sh
   docker compose run --rm app yarn install
   ```

5. Confirm CI will accept the result, then run lint and the build:

   ```sh
   docker compose run --rm app yarn install --immutable
   docker compose run --rm app yarn lint
   docker compose run --rm app yarn build
   ```

6. Commit only the lockfile and push. `--force-with-lease` is needed only if step 3 rebased the branch:

   ```sh
   git add yarn.lock
   git commit -m "fix: regenerate yarn.lock for <package> bump"
   git push --force-with-lease origin <pr-branch>
   ```

Renovate treats a branch with a commit it did not make as modified and stops rebasing it, so finish the PR by hand after this.

The `.husky/pre-commit` hook only blocks commits on `main`, so it does not affect the PR branch. Do not run these steps on `main`.

## The only known lever

If the failure becomes frequent enough to cost real time, ask Mend support about the hosted app's `binarySource` and Corepack handling. That is the only change that would remove the failure at its source, and it needs a human to contact them. Until then, use the recovery steps above.

## Verification

On 2026-10-24, in a scratch clone with `origin/renovate/babel-monorepo` (#390) checked out, the steps above behaved as written:

- Steps 1 and 2 ran as written. Step 2 printed `0	1`: the branch was level with `main` plus its one commit, so no rebase was needed.
- `docker compose run --rm app yarn --version` printed the version from `packageManager`.
- `yarn install --immutable` failed with the lockfile error before step 4.
- Step 4 changed `yarn.lock` only.
- `yarn install --immutable`, `yarn lint` and `yarn build` all passed after step 4. The build prerendered 733 routes.

Not run: step 3 (no rebase was needed) and step 6 (nothing was committed or pushed to #390). The `git add`, `git commit` and `git push` commands in step 6 are standard Git and were not exercised.
