# Domain Docs

How the engineering skills should consume this repo's domain documentation when exploring the codebase.

## Before exploring, read these

- **`CONTEXT.md`** at the repo root, or
- **`CONTEXT-MAP.md`** at the repo root if it exists: it points at one `CONTEXT.md` per context. Read each one relevant to the topic.
- **`docs/adr/`**: read ADRs that touch the area you're about to work in. In multi-context repos, also check `src/<context>/docs/adr/` for context-scoped decisions.

If any of these files don't exist, **proceed silently**. Don't flag their absence; don't suggest creating them upfront. The `/domain-modeling` skill (reached via `/grill-with-docs` and `/improve-codebase-architecture`) creates them lazily when terms or decisions actually get resolved.

Note: as of 2026-08-28 this repo has neither `CONTEXT.md` nor `docs/adr/` yet — it's a single-context static site with its own `docs/DECISIONS.md` decision log (append-only, dated entries) that predates these skills. Treat `docs/DECISIONS.md` as an additional decision-history source alongside (not a replacement for) `docs/adr/` if/when the latter gets created.

## File structure

Single-context repo (this repo is single-context — no monorepo/workspace signals found):

```
/
├── CONTEXT.md
├── docs/adr/
│   ├── 0001-....md
│   └── 0002-....md
└── (content/, pages/, components/, composables/, ...)
```

## Use the glossary's vocabulary

When your output names a domain concept (in an issue title, a refactor proposal, a hypothesis, a test name), use the term as defined in `CONTEXT.md`. Don't drift to synonyms the glossary explicitly avoids.

If the concept you need isn't in the glossary yet, that's a signal: either you're inventing language the project doesn't use (reconsider) or there's a real gap (note it for `/domain-modeling`).

## Flag ADR conflicts

If your output contradicts an existing ADR, surface it explicitly rather than silently overriding:

> _Contradicts ADR-0007 (event-sourced orders), but worth reopening because…_

For this repo specifically, also check `docs/DECISIONS.md` for prior decisions before proposing a change that touches dependency pinning, the image/IPX pipeline, or CI — several past decisions there (documented under dated entries) constrain what's safe to change.
