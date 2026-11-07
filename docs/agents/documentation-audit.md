# Documentation and agent-guidance audit

## Scope

The baseline audit examined 37 tracked Markdown files outside published content: 30 operational guides/skills/reviewer documents, six research dossiers structurally, and one synthetic election fixture. It also parsed four 412-row election snapshots and eight historical Lighthouse data/report files, and checked source/config/CLI/GitHub evidence for operational claims. Research claims, article facts and historical performance scores were not re-fact-checked. This is an instruction/documentation audit, not a new security, election or Lighthouse assessment.

The current `verify-agent-docs.mjs` enumerates root guides, `docs/`, `.agents/` and the GitHub skill entry point, including files added by this audit. Its document count therefore differs from the baseline inventory. It checks relative Markdown targets/headings, not remote source availability or model obedience.

## Reproduced causes and fixes

- Baseline `AGENTS.md` was 22,073 characters and 224 lines. The real Hermes truncation function dropped its middle at the supported 20,000-character floor, twice. The audited profile uses a dynamic cap, so this is a reproduced compatibility failure, not proof that every prior session was truncated. The new local budget is 12,000 characters / 180 lines, enforced by the documentation verifier and CI.
- Always-loaded architecture/module caches and duplicated prose obscured the gates. `AGENTS.md` is now a compact rule/router with task-specific references. It retains the ordered news content gate, explicit event checks, source/quotation requirements, advocacy stance, visual inspection, validation and permissions safeguards.
- Ambiguous “read both guides” instructions became section-specific reads. Never load the whole content-authoring guide; heading search locates the section, then complete required sections are read. This does not relax the full editorial-checklist or required citation/advocacy/background/source-verification reads.
- The old Claude security hook consumed an obsolete environment variable instead of stdin `tool_input`. A real `yarn.lock` PreToolUse fixture returned 0 instead of the intended 2; lint/Stop hooks also hardcoded a Mac checkout path. All repository Claude hooks are removed. Native deny rules replace the security block; explicit lint/build/editorial checks replace claims of automatic enforcement.
- Recent built-in `web-fetch` agents inherited Opus, while older recorded children used Haiku. A project agent override sets only that helper to Haiku. An actual Sonnet-parent test fetched `https://example.com` through a `claude-haiku-5-5` child. The first test restricted the parent's tool pool too far and prevented the child from starting; the corrected run exposed WebFetch and verified the child model. Usage attribution percentages are not projected savings.

## Documentation consistency repairs

1. Aligned news `imageHeader` requirements and event link fields across authoring, content-check and reviewers. Kept descriptive accessibility alt rules separate from the header engagement teaser.
2. Reconciled supplied real photos/explicit edits with style-reference handling, and actual Codex generation with manual per-slot fallback. No images were generated in this task.
3. Removed duplicated noncompliant prompt examples; the canonical manual templates carry diversity, motif, lighting and no-text/logo rules. Manual prompts keep save paths outside the visual prompt.
4. Distinguished exact news source pixels (1792x1024, 7:4) from 16:9 display composition/crops; corrected event pixels to 1024x768, 4:3. No required asset dimensions changed.
5. Made generation/PDF verification capability-based across clients and logs use client scratch rather than hardcoded temporary paths. A text-only PDF extract does not verify strikeout markup; an absent visual result is not image verification.
6. Removed stale generated SEO-cache links and old umbrella/module-version assumptions; use actual installed module versions and current documentation.
7. Updated test inventory, Renovate/Dependabot ownership, Node display labels, production-static-preview description and the narrow automatic-metadata prohibitions.
8. Removed the mandatory pointer to absent `~/HARNESS.md`; preserved dated decision history and current safeguards. Corrected the glossary-existence claim.
9. Marked closed dependency/social-image work as historical rather than open current incidents. Reconciled obsolete social-image acceptance URLs with the current verifier. Closed #316 represents the documented workaround, not a proven hosted-runtime fix.
10. Corrected font/backlog state against current config and narrowed duplicate-description work to news/events. Historical Lighthouse measurements remain dated evidence, not fresh results.
11. Removed cached article-specific election cutoff prose from the reusable component guide; reporting provenance stays in the research record. No article counts were refreshed.
12. Moved canonical GitHub PR review guidance to `docs/agents/pr-review.md`, leaving a loader stub. It now permits necessary incompatible dependency majors rather than forcing unsafe deduplication, requires actual tests, and follows the content gate.
13. Changed merge guidance to preserve existing branches/temp refs, inspect actual PR intents before supersession, and use a supported merge commit completion command with risk notes. Added task-triggered verification beyond lint/build. No merge, rebase or branch deletion was executed by that skill.
14. Removed invented calendar hours, added DTSTAMP/UTC/DST/UTF-8-octet folding requirements and required a real parser/import check before distributing a calendar. No calendar artifact or client import was produced; this is corrected guidance, not a verified calendar implementation.

## Independent final review corrections

The Standards review found three P2 Markdown-checker defects: reference/angle-link handling,
nested-fence handling, and rendered-heading/collision anchors. Reproduced each through the
real CLI: all three original cases failed before replacing regex parsing with the installed
remark/unified parser and GitHub slugger; the expanded four regression tests pass afterward.

The Spec review found four P2 prose conflicts missed by the first pass: the module-level
Twitter wildcard prohibition, reviewer's source/display ratio distinction, news footnotes
applied to events, and unversioned Yarn upgrade guidance. These are corrected at their
source, including exact-intent verification for direct/transitive lockfile recovery. The
review reports described the pre-fix state; passing mechanical checks alone did not catch
these instruction contradictions. No unresolved finding from those two reviews is being
reported as a pass without the corresponding correction.

## Personal skill visibility

The local 30-day window began October 8, 2026. Claude's usage counters showed no recent Skill invocations; those counters miss workflows that read shared skills through another client. The current-inventory report was cross-checked with Hermes usage and required project gates, with existing explicit off choices preserved.

The approved personal settings change added 33 `off` overrides and disabled nine inactive plugins. A fresh `claude -p /skill-doctor` confirmed none of the added-off skill descriptions remained listed. Recently active aws-core, ralph-loop and security-guidance plugins were retained using plugin-level usage, even though their skill-invocation counters said “never.” No shared skill directories were deleted; Hermes visibility/settings and other profiles were unchanged. These settings are host-personal and are not part of the Git diff. Local evidence does not establish non-use on other machines.

## Verification boundaries

Final Docker verification after review fixes passed: lint, 32 Node tests (28 existing plus four Markdown CLI regressions), the documentation verifier, a full static build (925 prerendered routes, zero link errors/warnings), and all 54 distinct local social-image URLs at 1200x630 across 61 HTML files. The log is in the task scratch evidence; later prose-only corrections receive a fresh documentation/diff check.

The replacement permission rules passed a live scratch positive control, four attempted denied writes (root/nested env/lock files), and two attempted denied env reads. The broader probe reported all six actual tool-call denials and unchanged protected fixtures. These rules protect Claude file-tool operations, not arbitrary subprocesses or other agent clients. No test of prose can guarantee future model adherence.

The regression verifier demonstrates a red baseline for over-budget instructions, retired hooks and missing native rules, then green after the fixes. Its Markdown parser resolves reference/angle links and rendered heading/collision anchors while excluding fenced/inline examples; four real-CLI regression tests cover the review findings. It checks local links and required configuration, deliberately separately from editorial fact-checking. No external deployment, dependency installation, image build, commit or push is included in this task.
