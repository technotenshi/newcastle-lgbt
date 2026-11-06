# Election results authoring

`components/content/ElectionResults.vue` renders an authored contest or seat summary as semantic text and a list with decorative, full-width 0–100% tracks. It supports ballot measures, candidate races, and whole-chamber or governorship accounting, including supplied write-in aggregates and uncalled seats. It uses ordinary HTML/CSS, renders on the server, and needs no interaction, animation, live feed, new dependency, JSON data file or CSV connection.

## Tested MDC syntax

Use one `contest` YAML object inside a block. The installed MDC parser and Vue server renderer test this syntax, including arrays and named Markdown slots:

```markdown
::election-results
---
contest:
  id: IL26-638
  title: Exclude transgender girls from girls' school sports
  type: measure
  source: Washington Secretary of State official media export
  snapshot: "2026-11-04T17:52:00-08:00"
  status:
    kind: called
    resultId: yes
    source: Associated Press via The Seattle Times
  results:
    - { id: yes, label: "Yes", votes: 1252863, stance: harmful }
    - { id: no, label: "No", votes: 961810, stance: favorable }
---
#status
AP projects Yes as the winner in its November 4 results display on The Seattle Times.[^1]

#source
Official statewide vote totals.[^5]
::
```

Define `[^1]` and `[^5]` once in the article's normal Sources section, using its existing reference numbers. The slots are Markdown, so the article's native footnote pipeline generates references and back-links. Do not put footnote markers in YAML strings or handcraft HTML footnote IDs. Repeated references remain native footnotes. Both slots are optional; `source` and `snapshot` are required even when no source slot is supplied.

The actual article is `content/news/20261104-01-election-results-lgbtq-washington.md`. Its counts were last refreshed to the November 5, 4:41 p.m. PST statewide export (King 3:38 p.m., Pierce 4:29 p.m., AP seat counts 4:42 p.m.); the refresh record is in `docs/research/2026-election-results.md`. On a later refresh, update the render test's real-article expectations along with the chart votes.

## Data and encoding

- Give each contest an informative `title` and distinct human-readable `id`. Results need unique `id` values within the contest and visible `label` values.
- Use numeric, non-negative safe-integer `votes` without commas. Counts are the only arithmetic input. The component supplies comma formatting, two-decimal percentages and the leader's margin over the runner-up in votes and percentage points. It preserves candidate ballot order rather than sorting the display by votes.
- Measures require exactly two matching entries, either `id: yes, label: "Yes"` and `id: no, label: "No"`, or `id: approved, label: Approved` and `id: rejected, label: Rejected`. Authored order is preserved. Assign each entry's `stance` explicitly: `favorable` gives green and “Supports LGBTQ+ rights”; `harmful` gives red and “Harms LGBTQ+ rights”; `neutral` gives gray and “No stance assigned.” These are the site's editorial positions on LGBTQ+ rights, never inferred from the response or the lead. Give every measure with an LGBTQ+ stake a `favorable`/`harmful` pair, including indirect stakes such as police accountability for an official with an anti-LGBTQ+ record or funding for public services. The stance must match the article's prose, and the prose must explain the link. Reserve `neutral` for measures with no LGBTQ+ stake at all; "No stance assigned" on a measure the article criticizes or supports is an error.
- Candidates use `type: candidate`, with `party` on every entry instead of `stance`. Democratic/Democrat maps to blue, Republican to red, Libertarian to gold, Green to green, and all other labels to gray. Matching ignores case and surrounding whitespace; the supplied party label always stays visible. Use the full party label, not an abbreviation. Nonpartisan, independent and unknown parties remain gray.
- Include a write-in aggregate only when supplied by the source, as another result with its own `id`, label, party and count. All supplied entries enter the denominator. Do not invent missing write-ins. If data is incomplete, set `incomplete: true` and explain it with `incompleteNote`; the component visibly qualifies percentages and the lead as using supplied votes only. Omit both fields for complete supplied data.
- Zero totals show “No votes reported” and “Share unavailable,” with empty bars. A top tie names the tied entries explicitly. A lead never generates a call or a winner.

For candidate YAML and an incomplete-data example, see [the synthetic fixture](../scripts/fixtures/election-results.md). It is outside `content/` and creates no production route. Replace its synthetic values with verified ballot labels and counts when authoring a real contest.

## Seat summaries

A separate `type: seats` mode uses `seats`, never `votes`, for each row and an explicit whole-chamber `total`. Its `unit` is `seats` or `governorships`; rows must sum exactly to the total including uncalled. Uncalled rows use `uncalled: true` and no party. Party colors follow candidate mapping; an aligned independent grouping must be explicitly labeled, not described as all Democrats. If `before` is provided, every row needs a nonnegative before count and these must sum to the whole chamber; each row displays the conditional difference. Do not use partial national totals to claim a final change.

```yaml
contest:
  id: Washington House
  title: Conditional whole-House composition
  type: seats
  unit: seats
  total: 98
  source: Official export and Washington State Standard
  snapshot: "2026-11-04T17:52:00-08:00"
  status: { kind: scenario }
  results:
    - { id: d, label: Democratic, party: Democratic, seats: 68, before: 59 }
    - { id: r, label: Republican, party: Republican, seats: 30, before: 39 }
```

`scenario` means if current leads hold, not called or certified; include continuing officeholders when reporting a whole chamber. `accounting` means AP called seats and continuing officeholders, with uncalled separately, not a call for each summary row or certification. Seat summaries have no current leader or vote margin. Their `snapshot` is displayed as “Verified as of,” not a claimed source update. For this article the national dashboards were checked between 6:01 and 6:04 p.m. PST, before the 6:05 reporting cutoff; the Senate scenario was verified by the same cutoff. Statewide vote counts are from 5:52, King County from 4:34, and Pierce from 5:01. The I-638 displayed AP call time of 6:14 and display update at 6:21 are separate; their timezone has not been confirmed, so neither is encoded as an absolute timestamp.

## Status and timestamps

`status` must be one of these objects:

```yaml
status:
  kind: leading
```

```yaml
status:
  kind: called # or certified, only with election-authority evidence
  resultId: yes # an id from results, or a candidate's id
  source: Named organization and evidence description
  at: "2026-11-24T12:00:00-08:00" # synthetic example; replace with a verified timestamp
```

`leading` cannot carry call/certification metadata. `called` says “Attributed call” and “Uncertified”; `certified` says “Certified result.” Both require an attributable source. Use `at` for a confirmed absolute call or certification time. When a call's actual time is unknown but a reliable observation time is available, use `observedAt` instead of `at`; it displays “Call verified as of,” not “Called at.” Do not supply both. If neither absolute time is confirmed, a `called` status may omit both fields: the source and attributed outcome remain visible, with no generated call time. Cite the reported call in the `#status` slot and keep unverified clock times and screenshot provenance in the editorial research record. Do not assign a timezone or invent an observation time merely to fill a field. Certification requires a complete, nonzero count with the certified entry as sole leader and an actual `at`. A media call can refer to a different moment than the count snapshot and does not change its numbers.

Quote timestamps as ISO strings with seconds and an explicit offset or `Z`. They are validated for real calendar dates and displayed in Pacific time with PST/PDT explicitly. The count snapshot is required on every block. Keep article reporting cutoffs separate. Invalid inputs fail with `ElectionResults [contest id]` and an author-facing explanation, including malformed counts, unsafe totals, duplicate result IDs, missing stance/party, contradictory status metadata, invalid timestamps and unknown fields. Percentages are calculated; supplying a `percent` field is an error.

## Verification

Run with the existing Docker image and dependencies; these commands do not install packages or build an image:

```sh
docker compose exec -T app node --test scripts/election-results.test.mjs scripts/election-results-render.test.mjs
docker compose exec -T app yarn lint
```

To export the candidate fixture as static HTML/CSS into host scratch for browser review:

```sh
docker compose run --rm --no-deps -T --pull never \
  -v "$HOME/.hermes/cache/scratch/election-results-preview:/tmp/election-results-preview" \
  app node scripts/election-results-render.mjs \
  scripts/fixtures/election-results.md /tmp/election-results-preview
```

The helper compiles the actual component and installed MDCRenderer with Vue's compiler, parses Markdown with MDC, and writes only the supplied external `/tmp/` directory. It does not add temporary content or routes. It includes article-like paragraph/heading styles to expose style conflicts, but does not replace checking the real Nuxt route after a static build.

In the browser, review the fixture and `/news/2026/11/04/election-results-lgbtq-washington` at 320px and desktop widths, at 200% zoom, and in print preview. Check no horizontal overflow, readable labels/counts without color or scripts, one independent full-width track per entry, unique working source links and correctly separated timestamps. Bars are `aria-hidden`; headings, party/stance labels, numbers, sources and status remain semantic text. Phone layouts stack the numbers below labels, scoped styles resist the article's paragraph/heading rules, and print retains all text with monochrome track borders.

Node tests establish arithmetic, author validation and SSR/MDC integration; they do not measure browser layout. A real static build and browser review remain required before publication.

The November 4 implementation passed all 19 Node tests (including the audit gate), Docker lint, a real static build with zero link errors or warnings, and social-image verification. Chromium checks exercised the production article and synthetic candidate fixture at 320, 768 and 1440 pixels, 200% CSS zoom, print-media styling and JavaScript disabled. The checks verified bar proportions, no horizontal overflow, source-footnote targets and the production citation-link color override. Standards and spec reviews found no actionable defects. Actual screen-reader software, native browser zoom and physical printing were not tested.
