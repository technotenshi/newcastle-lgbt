# Dependency audit exceptions

This is the register for the CI dependency audit gate ([#462](https://github.com/technotenshi/newcastle-lgbt/issues/462), part of [#436](https://github.com/technotenshi/newcastle-lgbt/issues/436)). The gate is `scripts/audit-gate.mjs`, run by `.github/workflows/dependency-audit.yml`.

## What the gate does

It runs `yarn npm audit --all --recursive --json` and checks every report:

| Report | Result |
| --- | --- |
| Critical or high, no register entry | The job fails. |
| Critical or high, with a register entry | The job passes and logs the finding as excepted. |
| Moderate, low or info, including deprecation notices | The job passes and logs a warning. Warnings are never hidden. |
| Any severity the script does not recognise | The job fails, so a new severity cannot slip through. |
| A register entry whose review date has passed | The job fails, whether or not its finding is still reported. |
| The audit itself cannot run (for example, the registry is down) | The job fails. |

It runs on every push to `main`, every Monday, and on pull requests that change `package.json`, `yarn.lock`, or the gate itself (this register, the script, its test and the workflow). It is not a required check on every pull request, because new advisories appear independently of what a pull request changes.

## Exception register

An exception is temporary. Each entry needs a rationale and a review date. Dates are `YYYY-MM-DD` and are compared against the current UTC date, so an entry is still valid on its review date and fails the next day.

The script reads the table below, so keep its header and the four columns exactly as they are. Do not put a pipe character inside a cell.

| Package | Advisory ID | Rationale | Review date |
| --- | --- | --- | --- |
| zod | GHSA-mrhx-c7xc-m3w5 | The advisory (zod below 4.6.6, fixed in 4.6.6) is about the array parse logic in zod 4 core. @nuxt/content 3.16.2 pins zod ^3.25.76 and uses it only to declare schemas and convert them to JSON Schema (`z.toJSONSchema` from `zod/v4`, and `zod-to-json-schema`). Its `dist/module.mjs` and `dist/chunks/zod4.mjs` never call `parse` or `safeParse` on data, and this site's `content.config.ts` declares no custom schema. The vulnerable parse path is not run. Checked 2026-10-24 on the installed 3.16.2. Review earlier if Content moves to zod 4, and remove the row once Content resolves zod 4.6.6 or later. | 2026-11-23 |
| node-forge | GHSA-86w9-cpqp-85rv | No patched release exists: 1.4.0 is the latest on npm and the advisory lists no fixed version. The upstream fix is digitalbazaar/forge PR 1152, still open. It arrives through listhen 1.10.0 (the latest listhen, 1.10.1, still requests ^1.4.0), a dev and image server dependency. The deployed site is static. Revisit when forge releases a fix. | 2026-11-23 |
| glob | deprecation | Deprecation notice, not an advisory. archiver-utils 5.0.2 is the latest release and requests glob ^10.0.0. Its only consumer is archiver 7.0.1 through nitropack, which uses it for the Azure preset only. archiver 8 drops glob, but nitropack 2.13.5 requests ^7.0.1. Forcing glob 13 would cross a major version on a path this site never runs. Revisit when nitropack moves to archiver 8. | 2026-11-23 |

## Adding, renewing or removing an entry

1. Confirm the finding. Check `yarn why <package>`, the advisory, and whether a fixed version exists or the parent can move. Prefer a fix over an exception.
2. Add a row with the package name, the advisory ID, the evidence-based rationale, and a review date. Use the GHSA ID or the numeric audit ID. For a deprecation notice, which has no advisory, use the word `deprecation`.
3. Record the decision in [`DECISIONS.md`](../DECISIONS.md).
4. To renew, re-check the finding against the current release, update the rationale, and move the date. A renewal with nothing re-checked defeats the point of the date.
5. Remove the row when the finding is fixed. The gate does not complain about a row with no matching finding, so clean these up by hand.

An entry matches on package name plus advisory ID, so a different advisory on the same package still fails the gate.

## Running it locally

From the repository root, in the Docker container (the same Yarn the project uses):

```sh
docker compose run --rm --no-deps app node scripts/audit-gate.mjs
```

The script's tests need no dependencies:

```sh
node --test scripts/audit-gate.test.mjs
```
