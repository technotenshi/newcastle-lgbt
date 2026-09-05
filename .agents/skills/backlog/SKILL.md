---
name: backlog
description: Read docs/improvement-tasks.md (and docs/lighthouse/audit-results.md for open performance items) and recommend the highest-impact, lowest-effort tasks to tackle next
---

Read `docs/improvement-tasks.md` and suggest what to work on next.

## How to use

Invoke `/backlog` to get a prioritized recommendation. Optionally specify a focus area: `/backlog seo`, `/backlog ux`, `/backlog performance`.

## Steps

1. Read `docs/improvement-tasks.md` in full
2. For the Performance section specifically: `docs/improvement-tasks.md` defers to `docs/lighthouse/audit-results.md` ("remaining open items tracked there") rather than duplicating every finding. Also read `docs/lighthouse/audit-results.md` and pull in any item marked "Open" there that isn't already a line item in `improvement-tasks.md` (e.g. the PurgeCSS/unused-CSS finding), so a `/backlog performance` run doesn't miss it.
3. Filter out any items already marked ✅ Done
4. Score remaining items on two axes:
   - **Impact** (High/Med/Low): how much does this improve the site for users or search?
   - **Effort** (Low/Med/High): roughly how many files need changing?
5. Recommend the top 3 items using the priority order: High Impact + Low Effort first, then High Impact + Med Effort, then Med Impact + Low Effort
6. For each recommended item, include:
   - The task name and area
   - Why it's worth doing now (impact rationale)
   - A rough scope estimate (which files would likely change)
   - Any dependency or prerequisite to be aware of

## Output format

```
## Backlog Recommendations

### 1. [Task name] — [Area]
**Impact:** High | **Effort:** Low
**Why now:** [1–2 sentences on user/SEO value]
**Scope:** [which files/components are likely involved]

### 2. [Task name] — [Area]
...

### 3. [Task name] — [Area]
...

---
Full open backlog: [N] items remaining. Run `/backlog [area]` to filter by Performance, SEO, UX, Content Features, or Developer.
```

## Scoring guidance

| Task type | Typical Impact | Typical Effort |
|---|---|---|
| Missing meta descriptions | High (SEO) | Low (1 file per page) |
| Schema.org Event markup | High (rich results) | Med (events page + composable) |
| Custom 404 page | Med (UX) | Low (1 new file) |
| Breadcrumb / back link | Med (UX) | Low (1 component change) |
| Reading time estimate | Low (nice-to-have) | Med (composable + 2 templates) |
| Prune font weights | Med (performance) | Low (nuxt.config.ts only) |
| TypeScript prop types | Low (DX) | High (many files) |
| Add to calendar link | Med (UX/engagement) | Low–Med (composable or skill) |
