# Agent configuration and instruction loading

## Canonical files and context budget

`AGENTS.md` is the cross-tool entry point. Keep it under the locally enforced 12,000-character and 180-line budgets. Link task-specific guidance with an explicit trigger; do not replace links with `@` imports, which eagerly load their target in Claude Code and preserve the same context cost.

Hermes's current startup limit is an explicit `context_file_max_chars` when configured, otherwise a dynamic model-window budget with a 20,000-character floor. It drops the middle of an oversized file, retaining head/tail and a marker. This repository stays below that floor instead of increasing a machine-local limit. Claude recommends fewer than 200 lines; its startup warning and on-demand file limits are different mechanisms. Codex's configurable project-document byte budget is another limit, not a shared universal character maximum.

Official references: [Hermes context files](https://hermes-agent.nousresearch.com/docs/user-guide/features/context-files), [Claude memory and AGENTS.md](https://code.claude.com/docs/en/memory).

Claude Code 2.1.277+ supports native `AGENTS.md` loading; versions before 2.1.281 have additional provider/telemetry caveats. In its default project-instructions mode, a `CLAUDE.md`, `.claude/CLAUDE.md` or `CLAUDE.local.md` in/above the working directory can shadow it. The global `~/.claude/CLAUDE.md` is not that project-shadowing case. Verify the effective instruction list with `/memory` or `/context`; do not create a duplicate `CLAUDE.md`. A user-selected project-instructions mode can change this loading behavior.

The former `~/HARNESS.md` pointer is not a prerequisite: that file is absent on the audited host. Current cross-tool safeguards live in `AGENTS.md`. Historical references in `docs/DECISIONS.md` describe the setup when those decisions were made.

## Read the authoring guide by section

Search the headings of `docs/content-authoring.md`, then read complete relevant sections using bounded line ranges. Do not read the whole file or retrieve all sections just to reconstruct it. Required content sections remain required in full: Citations and Sources; Advocacy-forward writing conventions; Background research files; Verifying sources and citation URLs. News work also requires the full editorial checklist and applicable frontmatter/body rules. A search match only locates a section; it is not completion of that reading gate.

## Skills and subagents

Project sources are `.agents/skills/` and `.agents/agents/`; `.claude/skills` and `.claude/agents` link to those directories. Edit the source, not a second copy. The `.github/skills/code-review` integration is a short loader for `docs/agents/pr-review.md`, not another policy copy. Relative links to repository docs use `../../../docs/` in skills and `../../docs/` in subagents. Quote a YAML description containing a colon followed by a space.

The generic engineering pack is installed globally under `~/.agents/skills`, with client-specific links. A fresh clone without that install does not have the pack. Required editorial skills must remain available; if unavailable, report the gap and apply their documented checks manually rather than silently omitting them.

### Web-fetch model routing

Claude Code's `web-fetch` helper is built in on this installation. It is not the separate model call performed inside the WebFetch tool. This project's `.agents/agents/web-fetch.md`, exposed through `.claude/agents`, overrides that agent name with `model: haiku`; it leaves the main conversation and `content-reviewer` models alone. A parent can override the model on an individual Agent call, so do not pass a more expensive model for a simple fetch.

Other supported controls, if needed: `model` in a custom agent's frontmatter or forked skill; per-invocation Agent `model`; `CLAUDE_CODE_SUBAGENT_MODEL` as a general fallback. `CLAUDE_CODE_SUBAGENT_MODEL_FORCE=1` forces all agents and would also downgrade reviewers, so it is not the chosen fix. `ANTHROPIC_DEFAULT_HAIKU_MODEL` controls the Haiku alias/small-fast model, not a general promise to change every built-in helper. Verify the actual child model in its session log before claiming savings. The reported usage share is attribution, not an estimate of savings.

References: [Claude subagent model precedence](https://code.claude.com/docs/en/sub-agents#choose-a-model), [usage attribution](https://code.claude.com/docs/en/costs#plan-usage-breakdown), [WebFetch behavior](https://code.claude.com/docs/en/tools-reference#webfetch-tool-behavior).

### Disable skills using evidence, not absent invocations alone

`claude -p /skill-doctor` lists context cost, invocation totals and last use for the current inventory. Cross-check local `~/.claude.json` usage timestamps, current Claude session logs and Hermes skill usage before disabling a shared workflow. Reads of skill files outside Claude's Skill tool may not increment Claude's skill counters. No local report proves non-use on another machine.

For individual personal/project skills, set `skillOverrides.<name>` to `off` in user settings to hide them without deleting shared files. Keep required repository checks and recently used cross-tool workflows available. For plugin-provided skills use plugin enable/disable controls; turning off a plugin also removes its hooks/tools, so check plugin-level usage, not only skill invocation counts. Disable unused claude.ai-synced skills with visibility overrides where supported rather than deleting cached copies that synchronization restores. Settings changes are personal and must not silently change other profiles.

Reference: [Claude skill visibility settings](https://code.claude.com/docs/en/skills#override-skill-visibility-from-settings).

The repository check uses the Markdown parser already installed through Nuxt MDC rather than a custom link/fence regex parser. Its four regression tests exercise the CLI against reference links, angle-bracket destinations, nested fences and GitHub heading collisions. These tests require the normal installed dependency tree and run in Docker/CI.

## Native protection instead of repository hooks

Repository `.claude/settings.json` has no hooks. Its native `permissions.deny` rules block reading/editing `.env` and `.env.*`, and editing `yarn.lock`, including nested paths. `Edit(...)` is the permission namespace for Write and NotebookEdit too; `Write(path)` is not an effective file-path rule. Yarn-generated lockfile updates remain possible through explicitly approved package operations.

These are Claude file-tool protections, not an OS sandbox and not cross-tool enforcement. Recognized shell file commands/redirections can be checked, but arbitrary Python/Node subprocesses are not a security boundary. Do not use subprocesses to evade a denied file. Hermes and Codex must follow the same written safeguards; do not claim they inherit Claude's settings.

The removed hooks consumed an obsolete environment variable instead of the documented stdin `tool_input` JSON; lint/stop hooks also used a Mac-only checkout path. A real PreToolUse fixture for `yarn.lock` exited 0 rather than blocking. Native deny rules replace the broken security hook; noisy reminders and lint-on-save are removed, not reimplemented. Lint, build, editorial and image verification remain explicit completion gates.

References: [Claude file permissions and limitations](https://code.claude.com/docs/en/permissions#read-and-edit), [hook stdin schema](https://code.claude.com/docs/en/hooks).

The [documentation audit](documentation-audit.md) records scope, findings and verification boundaries.

## Verify instruction changes

Run `node scripts/verify-agent-docs.mjs` for the size budget, repository hook retirement, required native file rules and relative Markdown targets/headings in root docs, `docs/`, project skills/subagents and the GitHub skill entry point. It parses Markdown with the existing Nuxt MDC toolchain (remark/unified), resolves reference/angle links and GitHub-style heading collisions, and skips fenced/inline code examples. `node --test scripts/verify-agent-docs.test.mjs` exercises those cases through the real CLI. External source URLs and prose compliance are not validated. Run lint and the static build as required by `AGENTS.md`.

For runtime changes, launch a new bounded Claude process with the normal permission system and harmless scratch fixtures. Assert on a real attempted denied file operation and the actual child model. Preserve outputs as evidence and keep configuration secrets out of logs. A loaded file, successful JSON parse or model's statement that a rule exists is not proof it enforced the rule.
