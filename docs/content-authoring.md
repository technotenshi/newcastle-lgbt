# Content Authoring Guide

This guide documents conventions for news articles and events. Agents search its headings and read complete task-relevant sections with bounded line ranges, not the entire guide. For news, Citations and Sources, Advocacy-forward writing conventions, Background research files, and Verifying sources and citation URLs are required in full alongside the editorial checklist and applicable structure sections. See `AGENTS.md` for the ordered content gate.

---

## Filename format

Both news and event files share the same naming pattern:

```
YYYYMMDD-##-descriptive-slug.md
```

| Part | Format | Notes |
|------|--------|-------|
| Date | `YYYYMMDD` | 8-digit date (e.g. `20250608`) |
| Sequence | `##` | Zero-padded integer starting at `01`; increment when multiple files share the same date |
| Slug | lowercase, hyphens only | 3–6 words derived from the title; no underscores or special characters |

**Examples:**
- `20250608-01-newcastle-pride-2025-lake-boren.md`
- `20250308-02-lgbtq-game-night-jackbox.md`
- `20241001-01-wa-state-election-guide.md`

To pick the sequence number, check existing files in the directory for the same date and use the next available number.

---

## News articles (`content/news/`)

### Frontmatter

```yaml
---
title: "Full Article Headline Here"
date: "YYYY-MM-DD"
order: 1
slug: "url-safe-slug-here"
image:
  path: "assets/images/news/YYYYMMDD-##-descriptive-name.png"
  alt: "Descriptive alt text describing the image content (50–250 characters)"
imageHeader:
  path: "assets/images/news/YYYYMMDD-##-header-name.png"
  alt: "One engaging sentence summarizing the article and enticing the reader to continue."
---
```

**Optional fields** — add only when the content warrants it:

```yaml
# A photo gallery (used for event-coverage articles with multiple photos):
carousel:
  images:
    - src: "assets/images/news/YYYYMMDD-##-photo1.png"
      alt: "Description of photo 1"
    - src: "assets/images/news/YYYYMMDD-##-photo2.png"
      alt: "Description of photo 2"
```

**Field reference:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | Yes | Full article headline |
| `date` | string `YYYY-MM-DD` | Yes | ISO 8601 publication date |
| `order` | integer | Yes | Ordering among articles published on the same date; start at `1` |
| `slug` | string | Yes | URL-safe identifier matching the slug portion of the filename |
| `image.path` | string | Yes | Path to the feature image |
| `image.alt` | string | Yes | Accessible alt text (50–250 characters) |
| `imageHeader.path` | string | Yes | Secondary image shown at the top of the article body |
| `imageHeader.alt` | string | Yes | One-line article summary to promote engagement, displayed as a caption; **not** an image description |
| `carousel.images` | array | No | List of `{src, alt}` objects for a photo gallery (4–5 images typical) |
| `draft` | boolean | No | Omit by default. Set `true` only for an article the owner does not intend to publish soon, or to recall a published article. It hides the article from all listings |

**What NOT to include:** `author`, `tags`, `category`, `collection` — these fields are not used. Articles are organization-wide and organized by date only.

---

### Body structure

The frontmatter `title` renders as the page H1. **Do not use a `#` heading in the body.**

```markdown
:Dateline Opening paragraph with the core news fact. Newcastle, WA is the location;
open with the most important information (2–3 sentences).

## Section Heading

Body paragraphs expanding on the core fact. Use **bold** for key names, organizations,
and important terms. Use *italics* for publication titles and legislative bill names.

> "Block-quote format for substantial direct quotes from individuals."
> *Attribution name, Title*

### Subsection Heading

Additional detail. Use H3 for subsections within an H2 section; avoid H4 unless
the article has deep nested structure.

---

## Sources

[^1]: Centers for Medicare & Medicaid Services. (2026, August 13). *Medicaid
program; prohibition on federal Medicaid and CHIP funding for sex-rejecting
procedures furnished to children*. Federal Register. [https://full-url-here.com](https://full-url-here.com)
[^2]: Washington State Attorney General's Office. (2026, March). *Ninth Circuit
argument: Washington defends gender-affirming care against unconstitutional
attacks*. [https://full-url-here.com](https://full-url-here.com)
```

**Conventions:**

- **Headings:** H2 (`##`) for main sections, H3 (`###`) for subsections; no H1 in body
- **Opening:** Name the location (`Newcastle, WA`) and give the core fact in the first 2–3 sentences
- **Bold** (`**text**`): key names, organizations, important terms
- **Italics** (`*text*`): publication/document/bill titles
- **Links:** `[Descriptive text](URL)` — always use descriptive link text, not bare URLs, **except** in the `## Sources` list itself, which uses footnote-style bare URLs instead (see below)
- **Block quotes:** `> "…"` for substantial quotes; inline quotes for short statements
- **Horizontal rule** (`---`): optional section divider between major content blocks
- **Sources section:** Required for articles citing external material. See "Citations and Sources (Wikipedia-style footnotes, APA7 entries)" below for the footnote-marker requirement and the reference-entry format.
- **Article length:** ~500 words for announcements; 1,500–2,500 words for news; 2,000–3,500 words for analysis/investigation
- **Dateline:** Open the article body with `:Dateline` (the MDC inline component) followed by the first sentence. Do not write `**Newcastle, WA** –` or `**Newcastle, WA**:` directly — the component renders the standardized format.
- **Em dashes:** Do not use em dashes (`—`) anywhere in article text or frontmatter. Use a comma, colon, or rephrase the sentence instead. En-dashes (`–`) remain correct for numeric ranges (e.g. time ranges, page ranges). The ban includes blockquote attributions: a `> — Attribution` line is also banned, write `> *Attribution Name*` instead.

---

### Citations and Sources (Wikipedia-style footnotes, APA7 entries)

Every specific factual claim drawn from an external source gets a numbered footnote marker at the point the claim is made in the body, plus a matching numbered entry in the closing `## Sources` section, the same pattern Wikipedia uses (superscript `[1]`, `[2]` markers linking down to a numbered reference list, with a "↩" back-link from each entry). This site's Markdown pipeline (`@nuxtjs/mdc`, via `remark-gfm`) renders standard GFM footnote syntax (`[^1]` / `[^1]: ...`) natively into exactly that structure, no custom component needed. Confirmed working in this repo's dev server: [content/news/20260906-01-federal-assault-transgender-youth-healthcare.md](../content/news/20260906-01-federal-assault-transgender-youth-healthcare.md) is the reference example.

**Inline markers:** the first time a specific claim appears in the body, put a footnote marker immediately after it, e.g. `finalized a rule titled *...*.[^1]`. Do **not** wrap the claim text in a hyperlink, the marker is the citation, the claim stays as plain prose:

```markdown
issued a formal declaration[^3] asserting that gender-affirming care for minors
does not meet "professionally recognized standards of health care"
```

**Reusing a source:** if the same source is cited again later in the article, reuse its existing number (`[^3]` again) rather than creating a new footnote or a duplicate reference entry. GFM automatically numbers footnote markers by order of *first* appearance, a label referenced more than once keeps the number from its first use, and each repeat gets its own "back to reference" link in the rendered output pointing back to that specific spot. This applies inside tables as well as paragraphs. Facts with no traceable external source (background figures the article can't independently link, general framing) stay unmarked; don't invent a citation that doesn't have a real matching source.

**Sources section (footnote definitions, APA7 content):** define each footnote directly under `## Sources`, one per line, in numeric order (`[^1]` first, `[^2]` second, and so on, matching first-appearance order in the body, not alphabetical, the numbering has to stay sequential for the auto-generated back-links to make sense). Each definition's *content* still follows APA 7th edition reference formatting:

```markdown
## Sources

[^1]: Centers for Medicare & Medicaid Services. (2026, August 13). *Medicaid
program; prohibition on federal Medicaid and CHIP funding for sex-rejecting
procedures furnished to children*. Federal Register. [https://www.federalregister.gov/...](https://www.federalregister.gov/...)
[^2]: Washington State Attorney General's Office. (2026a, March). *Ninth
Circuit argument: Washington defends gender-affirming care against
unconstitutional attacks*. [https://www.atg.wa.gov/...](https://www.atg.wa.gov/...)
[^3]: Washington State Attorney General's Office. (2026b, September 2).
*Washington joins coalition challenging federal attack on gender-affirming
care*. [https://www.atg.wa.gov/...](https://www.atg.wa.gov/...)
```

Rules:

- **Author or organization first**, written the way the source itself identifies it. Don't invent a personal author or a legal case caption the source doesn't state. If no author or organization is identifiable, start the entry with the *italicized title* instead.
- **Date:** `(Year, Month Day)` when the source states a full date; fall back to `(Year, Month)` or `(Year)` rather than guessing a day the source doesn't confirm; use `(n.d.)` when no date is available at all.
- **Title in sentence case, italicized**, followed by the publication/site name if it differs from the author.
- **End with the bare URL as a working link** (`[URL](URL)`, i.e. the URL is both the link text and the target). This is the one place on the site where a bare URL is correct; it overrides the general "descriptive link text" rule used everywhere else in the body.
- **Numeric order, not alphabetical.** The Sources list is ordered by footnote number (citation order), unlike a standalone APA7 reference list. Don't alphabetize it, that would desync the numbers from their in-body markers.
- **Same author, multiple separate works:** disambiguate the year in the reference text itself (e.g. `2026a`, `2026b`, assigned in the order those works are first cited) since each gets its own footnote number regardless; the letter suffix is a readability aid in the printed date, not a footnote label.
- **No blank line between footnote definitions**, and nothing after the last one, GFM treats an unindented line immediately following a footnote definition as part of that definition's content if there's no blank line separating them.

---

### Graphical election snapshots

For authored graphical election snapshots, use the reusable `::election-results` MDC block. See [Election results authoring](election-results.md) for tested YAML syntax, candidate and measure encoding, source slots, status evidence and fixture verification.

### Advocacy-forward writing conventions (sensitive historical/political news)

For articles covering movement history, government policy, discrimination, or corporate accountability, follow the full checklist at [`docs/editorial-checklist.md`](editorial-checklist.md). This is an advocacy site: articles on anti-LGBTQ+ policy, legislation, or the people and organizations behind them should reach a critical, evidence-backed conclusion, not a neutral "both sides" summary, and should fact-check claims from supporters and opponents alike so the criticism holds up. It was written after an editorial pass on a Pride-history investigation surfaced the same handful of problems repeatedly. Highest-signal rules:

- **Be critical, and back it with evidence.** State plainly who a policy harms, not just what it mechanically does, and cite the evidence for that conclusion: the bill's own text, named experts, official analyses.
- **No neutral formats.** Election results, news updates and briefs carry the same critical stance as analysis pieces. Restate the site's position after a vote, cut caveats that give the reader no information or action, write headings that say why the story matters to LGBTQ+ people and read in the right direction at a glance, and end with a call to action rather than "both sides" balance. See "The stance applies to every format" in [`docs/editorial-checklist.md`](editorial-checklist.md).
- **Fact-check supporters as rigorously as opponents.** Verify specific checkable claims from a policy's supporters (a statistic, a legal argument, a cited authority); report when one doesn't hold up and show the evidence, rather than only relaying the opposing campaign's rebuttal.
- **No deficit framing.** Don't define marginalized people primarily through trauma, poverty, or "nothing left to lose" language. Describe the conditions they faced, but preserve their agency, relationships, and goals.
- **Don't romanticize violence or deprivation as the measure of contribution.** Avoid "threw the first punch/brick" framing; prefer "resisted," "sustained," "organized," "built."
- **Don't conflate overlapping identities.** Transgender people, drag performers, sex workers, and unhoused people are not interchangeable categories, list them as what they are, and never retroactively assign a modern identity label to a historical figure without direct support.
- **Attribute hostile or coded language, never narrate it as neutral.** Quote terms like "gender ideology" or "biological truth" and name who used them.
- **Contextualize outdated terminology.** Keep it when it's a real historical name, direct quote, or archival record; add a short note that it's outdated as a general modern label. Don't silently modernize proper nouns.
- **Name institutions and decision-makers, not identity groups, and don't stop at the institution.** Avoid "the movement," "gay men," or "lesbians" as an undifferentiated actor; identify the specific organization, leader, or agency responsible. This site is not afraid to name a donor, legislator, spokesperson, or executive by name when a source (a filing, a quote, a roll-call vote) ties them directly to it.
- **Avoid stereotyped adjectives** ("loud," "outlandish," "militant") for marginalized people, describe conduct concretely instead.
- **Limit absolute claims** ("every," "first," "only," "quietly," "deliberately") unless independently verifiable; prefer "among the earliest," "helped influence."
- **Run section 20's final paragraph-level language check** in `docs/editorial-checklist.md` before publishing any article in this category.

### Background research files (`docs/research/`)

Recurring subjects (an organization, a political committee, a specific individual) get a standing background file in `docs/research/`, e.g. [`docs/research/lets-go-washington.md`](research/lets-go-washington.md). Whenever an article names a subject that has one of these files, check it and fold in relevant context for a reader who has never heard of them, don't just drop the name in bare. Useful context includes: what the organization/person is, their track record, their funding pattern, and any compliance or legal issues on record, always hedged to match the file's own confidence level (an open investigation is "unresolved," not a finding). If a subject is central enough to an article to warrant this treatment but has no research file yet, consider using the `research` skill to build one before publishing, and keep the file updated as new claims are verified, the way [`docs/research/lets-go-washington.md`](research/lets-go-washington.md) records corrections to its own earlier claims.

### Verifying sources and citation URLs

- **Washington bills and initiatives:** `sos.wa.gov` ballot-initiative PDFs return 403 to automated fetches (`WebFetch`); `lawfilesext.leg.wa.gov` enacted-bill PDFs usually work. Once a PDF is fetched or saved, read its pages directly to see the strikeout and underline markup. That markup is the only reliable way to confirm what an initiative actually changes versus current law, so do not rely on a secondary summary.
- **`federalregister.gov` blocks bots inconsistently, this is not a dead link:** the site runs aggressive scraping protection and can serve a `unblock.federalregister.gov` reCAPTCHA wall ("Request Access... your request has been flagged as potentially automated") to `WebFetch`, `curl`, and even a real Playwright browser session, sometimes on one request and not the next from the same source. A `200` with the document's real title and text on one attempt is enough to confirm the citation is correct. Do not treat a later CAPTCHA redirect (yours or the reader's) as evidence the URL is broken. If a reader reports a Federal Register link "doesn't work", suspect this wall first and verify the underlying document with a plain fetch before concluding the citation is wrong.
- **A URL that 404s may be an encoding problem, not a dead source.** A search result for the initiative text pointed at `.../INITIATIVE+IL26-638+fulltext.pdf` and returned a 404 page; the same file at `.../INITIATIVE%20IL26-638%20fulltext.pdf` opened with the full text. Try `%20` for spaces. If a source still will not open, do not cite it as read: cite another document you did read, or say in the PR that you could not open it.
- **Search snippets and truncated extracts are not sources.** Extraction tools cut long pages into a head and a tail and save the full text to a cache file. Read the cached file (or grep it for the exact sentence) before quoting, and re-read it when two outlets disagree.
- **Verify images by looking.** If the image tool returns no description, the image is unverified. Do not write alt text or report "viewed, matches" from the prompt alone; use a second method or flag it for the reviewer.
- **Run the review skills before the PR, not after.** `fact-check` (claim-by-claim against the source) and `content-check` (conventions), then the `content-reviewer` checklist, catch what CI cannot. CI and the build do not check claims.
- **Checking that a source link resolves:** the `playwright-cli` shell command (a real Chromium browser, not a plain HTTP fetch) is the most reliable check, because `curl` and `WebFetch` can get different results from a bot-defensive site than a real browser does (see the `federalregister.gov` note above). For sites without JS bot walls, NCBI's E-utilities API is a fast way to confirm a PubMed or PMC citation's real title and authors when the HTML page itself is behind a cookie wall: `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=<PMID>&retmode=json` (same pattern with `db=pmc`).

---

## Display order and special cases

- **News** sort by date descending, then by `order`.
- **Events** sort by date ascending, then by `order` **descending** within the same date: the highest `order` displays first. Use this to group related same-day events, for example a festival and its sub-event.
- **Council members** are ordered by the `position-N` prefix in the filename.
- **Council portraits** are real official photos sourced from `newcastlewa.gov`, not AI-generated (unlike news and event images).

---

## Events (`content/events/`)

### Frontmatter

```yaml
---
title: "Event Title Here"
date: "YYYY-MM-DD"
order: 1
slug: "url-safe-slug-here"
image:
  path: "assets/images/events/YYYYMMDD-##-descriptive-name.png"
  alt: "Description of the promotional graphic or photo (50–250 characters)"
link:
  text: "Get Tickets"
  target: "https://eventbrite.com/e/..."
---
```

**Field reference:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | Yes | Full event name |
| `date` | string `YYYY-MM-DD` | Yes | ISO 8601 date of the event |
| `order` | integer | Yes | Ordering among events on the same date; start at `1` |
| `slug` | string | Yes | URL-safe identifier matching the slug portion of the filename |
| `image.path` | string | Yes | Path to the event promotional image |
| `image.alt` | string | Yes | Accessible alt text (50–250 characters) |
| `link.text` | string | Yes | CTA button label — e.g. `"Get Tickets"`, `"Sign Up Now"`, `"Email for Details"`, `"RSVP"` |
| `link.target` | string | Yes | Full URL (`https://…`) or email link (`mailto:person@example.org`) |

**Events do NOT use** `imageHeader`, `carousel`, or `draft`.

---

### Body structure

```markdown
**Opening sentence highlighting the event**, stating what it is and why to attend.

Join us on **Saturday, March 8, 2025, from 7:00–8:30 PM** at [Venue Name], [City].

This event is open to [audience description, e.g., "LGBTQ+ youth ages 13–22"].

[Additional details about activities, format, accessibility, cost, etc.]

To attend or for more information, [contact method matching the link.target field].
```

**Conventions:**

- **Date/time format:** Full prose, e.g. `Saturday, March 8, 2025, from 7:00–8:30 PM`; use an en-dash (`–`) for time ranges, not a hyphen
- **Location:** Write in prose, not as a structured field
- **Age/access requirements:** Include when applicable (e.g., `"ages 11–22"`)
- **CTA:** End with a sentence that matches the `link.target` (e.g., "Email us at …" for a `mailto:` link, or "Register at [site]" for a URL)
- **No sources section** for events
- **Event length:** 2–4 short sentences total. State what the event is, date/time, location, cost, and how to register or get more info. Do not include bullet lists, sub-sections, or extended descriptions; keep it scannable.
- **Em dashes:** Do not use em dashes (`—`). Use a comma or rephrase instead. En-dashes (`–`) are correct for numeric ranges.
- **No registration or ticketing URL:** link to the primary organizer's website with `link.text: "More Information"`.
- **CTA position:** the `link` button always renders after the body text (`pages/events/index.vue`), so event body copy should say "link below", never "link above".
- **Photo credit:** the optional `image.credit` field (events only) renders as a small "Photo: {name}" line under the image (`composables/useEvents.ts`, `pages/events/index.vue`). Use a name only, never phone numbers or contact info.

---

## Image asset conventions

| Content type | Directory | Filename format | Preferred format |
|---|---|---|---|
| News | `assets/images/news/` | `YYYYMMDD-##-descriptive-name.png` | `.png` |
| Events | `assets/images/events/` | `YYYYMMDD-##-descriptive-name.png` | `.png` |
| Council members | `assets/images/council-members/` | `YYYYMMDD-##-name-descriptor.jpeg` | `.jpeg` |

**Alt text rules:**
- `image.alt`: 50–250 characters describing the visible image. News `imageHeader.alt` is a one-sentence engagement teaser, not image alt text
- Describe what is actually in the image, not the article topic
- Do not repeat the article title verbatim
- Include scene context for photos (people, setting, objects, mood)

**Example alt text:**
> `"A diverse crowd celebrates at Lake Boren Park with rainbow flags and banners on a sunny afternoon."`

**Credit line for openly licensed photos (news):** when a news image is an openly licensed photo (for example from Wikimedia Commons) instead of a generated or supplied one, end the body with an italic `*Image credits: ...*` line just before `## Sources`. For each image give the title, the author, the license as a link, the changes made (for example "cropped and resized") and a link to the source page. For a ShareAlike license such as CC BY-SA, add that the adaptation is shared under the same license. Events use the optional `image.credit` field (a name only) instead. See [`content/news/20261110-01-i638-lawsuit-filed-king-county.md`](../content/news/20261110-01-i638-lawsuit-filed-king-county.md) for an example.

---

## Image generation prompts

For complete best practices, parameters, lighting reference, and tool comparison, see [`docs/image-generation-guide.md`](image-generation-guide.md). The section below provides site-specific templates.

Use these guidelines to produce DALL-E or Midjourney prompts for every image slot in an article or event. The goal is to generate images that match the existing site aesthetic without requiring a photographer.

### General rules

- **No text in AI images** — AI generators render typography unreliably. Generate images without any text or logos; add text overlays in Canva or Figma afterward if needed for event graphics.
- **Avoid relying on accurate flag rendering** — both Midjourney and DALL-E misrender Pride and transgender flags (wrong stripe order, colors, or proportions). Describe the flag colors as abstract color references instead (e.g., `light blue, pink, and white color palette`). If accurate flag imagery is essential, source a real photo from [Unsplash](https://unsplash.com) or [Pexels](https://www.pexels.com) rather than generating it with AI.
- **Inclusive representation** — depict LGBTQ+ community members with diversity in age, race, body type, and gender expression. Avoid stereotypes.
- **Match the content style** — civic/political articles call for photorealistic documentary photography; social/party events call for graphic-design promotional artwork (see style guide below).
- **No real people** — do not reference specific named individuals or public figures.
- **Plan and review emotional coverage** — follow the [emotional brief and image review](image-generation-guide.md#emotional-brief-and-image-review) for each slot, including the feature thumbnail and the relationship between paired images.

### Aspect ratio reference

News source files use 1792x1024 (7:4), composed with safe margins for 16:9 landscape display crops. Source pixels are not an exact 16:9 ratio. Events use 1024x768 (4:3). Verify exact source dimensions separately from composition/display cropping.

| Image slot | Where it renders | Display composition | Required source pixels | Midjourney flag |
|---|---|---|---|---|
| `image` (news feature) | 180px-tall thumbnail in 3-col grid | 16:9 | `1792x1024` | `--ar 16:9` |
| `imageHeader` (news) | 511px wide, centered column, cropped to landscape | 16:9 | `1792x1024` | `--ar 16:9` |
| `carousel` images | Full-width responsive carousel | 16:9 | `1792x1024` | `--ar 16:9` |
| `image` (events) | `img-fluid` in 2-col layout | 4:3 | `1024x768` (compatible generator; not DALL-E 3) | `--ar 4:3` |

### Choosing photo-style vs. graphic-design style

| Content type | Use this style |
|---|---|
| Civic events, council news, protests, outdoor activities, commemorations | **Photorealistic photography** |
| Social events, game nights, parties, workshops | **Graphic design / promotional poster** |
| Pride celebrations, festivals | Either — match what the article describes |

---

### Prompt templates and generation

Use `.agents/skills/image-prompt/SKILL.md` for canonical manual photo/graphic templates; use `.agents/skills/generate-images/SKILL.md` for actual Codex generation, save instructions, retries and visual verification. Do not maintain parallel scene examples here: templates must carry the exact racial-diversity clause, a subtle LGBTQ+ accessory motif, approved lighting, and no generated text/logos/flag artwork.

Keep each manual generator's visual prompt separate from output path/pixel metadata. Compose for the slot's emotional brief and display crop, then verify the real file and dimensions before writing `image.alt`; the news `imageHeader.alt` remains an engagement teaser. Supplied real photos and explicit edits follow the next section, not an automatic generation rule.

---

## Working with provided images

When the user provides an image alongside article or event text:

- **Identify the image's purpose.** A flyer, screenshot or design reference guides style and can supply visible event details; do not automatically use it as the article asset. Extract its palette, mood, composition and any visible factual information, verifying organizer details before publication.
- **Honor a supplied real photo or requested edit.** If the user explicitly provides a photo for use or asks for an edit, use that input rather than silently replacing it with generated art. Check photo credit metadata; events support optional `image.credit` (name only).
- **Generate only unfilled slots.** The `generate-images` skill owns actual local Codex generation and dimension/visual verification. User-supplied real photos and explicitly declined AI generation skip that slot. Prompts-only output is a per-slot fallback after the skill's documented failure limit, not the default.

Read the complete applicable image guide sections before writing prompts; never infer visible content from a prompt alone.

---

## Step-by-step: Creating a news article from raw text

This structure recipe is not a complete publishing workflow. Apply AGENTS.md's content gate before drafting and after writing: source reads, exact quotations, fact-check, content-check, reviewer, actual image generation/inspection, and static verification.

1. **Verify the publication date** in `America/Los_Angeles` → derive the `YYYYMMDD` prefix. A source's event/reporting date is not automatically the publication date
2. **Check `content/news/`** for files with that date prefix → pick the next `##` sequence number
3. **Derive the slug** from the headline: lowercase, hyphens only, 3–6 words (e.g. `"Newcastle Pride 2025"` → `newcastle-pride-2025`)
4. **Set the filename:** `YYYYMMDD-##-slug.md`
5. **Write frontmatter:** fill `title`, `date`, `order`, `slug`, and `image` (path + alt)
6. **Add `imageHeader`** with a distinct image for the top of the article and a one-line engagement caption
7. **Add `carousel`** if the article covers an event and multiple photos are provided
8. **Write the body:**
   - No `#` heading
   - Open with `:Dateline` and the core fact (2–3 sentences); the component supplies the location
   - Use H2/H3 sections for structure
   - Bold key names and orgs; italicize titles
   - Block-quote substantial quotes
   - Add a `[^N]` footnote marker after each specific factual claim at first mention; reuse the number for a source cited again later
   - End with a `## Sources` section: `[^N]: ...` footnote definitions in numeric order, each formatted as a full APA7 reference (see "Citations and Sources" above)

---

## Step-by-step: Creating an event from raw text

> **⚠ Date check first:** If the event date is today or in the past, **stop and warn the user** before creating anything. Do not create events for dates that have already occurred.

1. **Verify the event date** and compare it with today in `America/Los_Angeles` → derive the `YYYYMMDD` prefix
2. **Check `content/events/`** for files with that date prefix → pick the next `##` sequence number
3. **Derive the slug** from the event name (lowercase, hyphens, 3–6 words)
4. **Set the filename:** `YYYYMMDD-##-slug.md`
5. **Write frontmatter:** fill `title`, `date`, `order`, `slug`, `image`, and `link` (text + target)
6. **Write the body:**
   - Bold highlights in the opening sentence
   - Date and time in full prose with en-dash for ranges
   - Location in prose
   - Age/access requirements if applicable
   - Closing CTA sentence matching the `link.target`
