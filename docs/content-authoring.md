# Content Authoring Guide

This guide documents every convention needed to produce a correctly structured Markdown file for news articles and events. An agent (or human author) can follow these rules to create new content without reading existing files.

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
---
```

**Optional fields** — add only when the content warrants it:

```yaml
# A second image displayed prominently at the top of the article body.
# NOTE: imageHeader.alt is NOT an image description — it is a one-liner article
# summary written to promote engagement, displayed as a caption beneath the image.
imageHeader:
  path: "assets/images/news/YYYYMMDD-##-header-name.png"
  alt: "One engaging sentence summarizing the article and enticing the reader to continue."

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
| `imageHeader.path` | string | No | Secondary image shown at the top of the article body |
| `imageHeader.alt` | string | No | One-liner article summary to promote engagement — **not** an image description |
| `carousel.images` | array | No | List of `{src, alt}` objects for a photo gallery (4–5 images typical) |
| `draft` | boolean | No | Set `true` to hide the article from all listings |

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
> — Attribution name, Title

### Subsection Heading

Additional detail. Use H3 for subsections within an H2 section; avoid H4 unless
the article has deep nested structure.

---

## Sources

- **Outlet Name**: [Article Title](https://full-url-here.com)
- [Another Source Title](https://full-url-here.com)
```

**Conventions:**

- **Headings:** H2 (`##`) for main sections, H3 (`###`) for subsections; no H1 in body
- **Opening:** Name the location (`Newcastle, WA`) and give the core fact in the first 2–3 sentences
- **Bold** (`**text**`): key names, organizations, important terms
- **Italics** (`*text*`): publication/document/bill titles
- **Links:** `[Descriptive text](URL)` — always use descriptive link text, not bare URLs
- **Block quotes:** `> "…"` for substantial quotes; inline quotes for short statements
- **Horizontal rule** (`---`): optional section divider between major content blocks
- **Sources section:** Required for articles citing external material; use H2 `## Sources`, list links as `**Outlet**: [Title](URL)` or plain `[Title](URL)`
- **Article length:** ~500 words for announcements; 1,500–2,500 words for news; 2,000–3,500 words for analysis/investigation
- **Dateline:** Open the article body with `:Dateline` (the MDC inline component) followed by the first sentence. Do not write `**Newcastle, WA** –` or `**Newcastle, WA**:` directly — the component renders the standardized format.
- **Em dashes:** Do not use em dashes (`—`) anywhere in article text or frontmatter. Use a comma, colon, or rephrase the sentence instead. En-dashes (`–`) remain correct for numeric ranges (e.g. time ranges, page ranges).

---

### Advocacy-forward writing conventions (sensitive historical/political news)

For articles covering movement history, government policy, discrimination, or corporate accountability, follow the full checklist at [`docs/editorial-checklist.md`](editorial-checklist.md). This is an advocacy site: articles on anti-LGBTQ+ policy, legislation, or the people and organizations behind them should reach a critical, evidence-backed conclusion, not a neutral "both sides" summary, and should fact-check claims from supporters and opponents alike so the criticism holds up. It was written after an editorial pass on a Pride-history investigation surfaced the same handful of problems repeatedly. Highest-signal rules:

- **Be critical, and back it with evidence.** State plainly who a policy harms, not just what it mechanically does, and cite the evidence for that conclusion: the bill's own text, named experts, official analyses.
- **Fact-check supporters as rigorously as opponents.** Verify specific checkable claims from a policy's supporters (a statistic, a legal argument, a cited authority); report when one doesn't hold up and show the evidence, rather than only relaying the opposing campaign's rebuttal.
- **No deficit framing.** Don't define marginalized people primarily through trauma, poverty, or "nothing left to lose" language. Describe the conditions they faced, but preserve their agency, relationships, and goals.
- **Don't romanticize violence or deprivation as the measure of contribution.** Avoid "threw the first punch/brick" framing; prefer "resisted," "sustained," "organized," "built."
- **Don't conflate overlapping identities.** Transgender people, drag performers, sex workers, and unhoused people are not interchangeable categories, list them as what they are, and never retroactively assign a modern identity label to a historical figure without direct support.
- **Attribute hostile or coded language, never narrate it as neutral.** Quote terms like "gender ideology" or "biological truth" and name who used them.
- **Contextualize outdated terminology.** Keep it when it's a real historical name, direct quote, or archival record; add a short note that it's outdated as a general modern label. Don't silently modernize proper nouns.
- **Name institutions and decision-makers, not identity groups, and don't stop at the institution.** Avoid "the movement," "gay men," or "lesbians" as an undifferentiated actor; identify the specific organization, leader, or agency responsible. This site is not afraid to name a donor, legislator, spokesperson, or executive by name when a source (a filing, a quote, a roll-call vote) ties them directly to it.
- **Avoid stereotyped adjectives** ("loud," "outlandish," "militant") for marginalized people, describe conduct concretely instead.
- **Limit absolute claims** ("every," "first," "only," "quietly," "deliberately") unless independently verifiable; prefer "among the earliest," "helped influence."
- **Run the final 20-item language check** in `docs/editorial-checklist.md` before publishing any article in this category.

### Background research files (`docs/research/`)

Recurring subjects (an organization, a political committee, a specific individual) get a standing background file in `docs/research/`, e.g. [`docs/research/lets-go-washington.md`](research/lets-go-washington.md). Whenever an article names a subject that has one of these files, check it and fold in relevant context for a reader who has never heard of them, don't just drop the name in bare. Useful context includes: what the organization/person is, their track record, their funding pattern, and any compliance or legal issues on record, always hedged to match the file's own confidence level (an open investigation is "unresolved," not a finding). If a subject is central enough to an article to warrant this treatment but has no research file yet, consider using the `research` skill to build one before publishing, and keep the file updated as new claims are verified, the way [`docs/research/lets-go-washington.md`](research/lets-go-washington.md) records corrections to its own earlier claims.

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
**Opening sentence highlighting the event** — what it is and why to attend.

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

---

## Image asset conventions

| Content type | Directory | Filename format | Preferred format |
|---|---|---|---|
| News | `assets/images/news/` | `YYYYMMDD-##-descriptive-name.png` | `.png` |
| Events | `assets/images/events/` | `YYYYMMDD-##-descriptive-name.png` | `.png` |
| Council members | `assets/images/council-members/` | `YYYYMMDD-##-name-descriptor.jpeg` | `.jpeg` |

**Alt text rules:**
- 50–250 characters
- Describe what is actually in the image, not the article topic
- Do not repeat the article title verbatim
- Include scene context for photos (people, setting, objects, mood)

**Example alt text:**
> `"A diverse crowd celebrates at Lake Boren Park with rainbow flags and banners on a sunny afternoon."`

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
- **Avoid near-duplicate article images** — if a news article uses both `image` and `imageHeader`, they should support the same story from clearly different visual angles. Do not use the same scene with only a tighter crop. Change at least one of: scene type, primary subject, vantage point, or narrative angle. A good default is one institutional or contextual image and one operational or street-level image.

### Aspect ratio reference

Each image slot renders at a specific size on the site. Use the matching aspect ratio so the image is never distorted or awkwardly cropped.

| Image slot | Where it renders | Recommended AR | DALL-E size | Midjourney flag |
|---|---|---|---|---|
| `image` (news feature) | 180px-tall thumbnail in 3-col grid | 16:9 | `1792x1024` | `--ar 16:9` |
| `imageHeader` (news) | 511px wide, centered column, cropped to landscape | 16:9 | `1792x1024` | `--ar 16:9` |
| `carousel` images | Full-width responsive carousel | 16:9 | `1792x1024` | `--ar 16:9` |
| `image` (events) | `img-fluid` in 2-col layout | 4:3 | `1792x1024` | `--ar 4:3` |

### Choosing photo-style vs. graphic-design style

| Content type | Use this style |
|---|---|
| Civic events, council news, protests, outdoor activities, commemorations | **Photorealistic photography** |
| Social events, game nights, parties, workshops | **Graphic design / promotional poster** |
| Pride celebrations, festivals | Either — match what the article describes |

---

### Photo-style prompts

Use for news articles and events that depict real-world scenes.

When writing both `image` and `imageHeader` prompts for the same article, separate them intentionally:

- `image` usually works best as the broader contextual or institutional view
- `imageHeader` usually works best as the more immediate, specific, or visually striking angle
- If the first prompt is outdoors, consider making the second indoors or document-focused when the article supports it
- If both must stay outdoors, change the main subject and vantage point, not just the crop

**DALL-E formula:**
```
[Scene description, specific to the article topic], [mood and lighting], candid documentary photography style, [diversity/inclusivity cues], photorealistic, no text or logos.
```

**DALL-E example — Pride event article:**
```
A diverse crowd of LGBTQ+ community members celebrating at an outdoor park,
rainbow flags waving, golden-hour afternoon sunlight, wide-angle shot,
candid documentary photography style, inclusive representation of ages, races,
and gender expressions, photorealistic, no text or logos.
```

**DALL-E example — council meeting news:**
```
A city council chamber with community members attending a public meeting,
fluorescent lighting, diverse audience seated in rows, serious and engaged
expressions, photorealistic documentary photography, no text or logos.
```

**Midjourney formula:**
```
[scene], [mood and lighting], candid photojournalism, wide angle, diverse LGBTQ+ community members --ar [ratio] --style raw --v 7
```

**Midjourney example — Pride event:**
```
diverse LGBTQ+ community celebrating at outdoor park, rainbow flags, golden hour,
wide angle, candid photojournalism, inclusive ages and ethnicities
--ar 16:9 --style raw --v 7
```

**Midjourney example — news header (landscape crop):**
```
community members at LGBTQ+ pride rally, rainbow flags in background, wide
framing, shallow depth of field, warm sunlight, photojournalism style
--ar 16:9 --style raw --v 7
```

---

### Graphic-design style prompts

Use for event promotional images and articles that benefit from a designed look.

**DALL-E formula:**
```
A vibrant promotional graphic for an LGBTQ+ [event type] event. Bold [color palette], clean geometric shapes, [mood descriptor] design aesthetic, flat design with subtle gradients, no text.
```

**DALL-E example — game night event:**
```
A vibrant promotional graphic for an LGBTQ+ game night event.
Bold rainbow palette on a dark navy background, playful geometric shapes,
controller and game piece silhouettes, energetic and fun design aesthetic,
flat design with subtle gradients, no text.
```

**DALL-E example — workshop event:**
```
A modern promotional graphic for an LGBTQ+ youth self-defense workshop.
Bold purple and gold palette, dynamic abstract shapes suggesting movement,
empowering and energetic design aesthetic, clean flat graphic design, no text.
```

**Midjourney formula:**
```
LGBTQ+ [event type] promotional poster, [color palette], geometric shapes, [mood], flat graphic design, no text --ar [ratio] --v 7
```

**Midjourney example — social event:**
```
LGBTQ+ game night event promotional poster, bold rainbow palette, dark background,
playful geometric shapes, energetic mood, flat graphic design, no text
--ar 4:3 --v 7
```

---

### How to generate prompts from article or event content

1. **Identify the image slot** — `image` (feature/event), `imageHeader`, or `carousel`
2. **Look up the aspect ratio** from the table above and note the Midjourney flag or DALL-E size
3. **Read the article/event body** — extract: location, main topic, key visual elements (people, objects, setting), and emotional tone
4. **Choose photo vs. graphic-design style** using the style guide table above
5. **Plan distinct coverage across slots** — if both `image` and `imageHeader` are present, decide how they differ before writing prompts. Do this by changing scene type, primary subject, vantage point, or narrative angle, not just image distance
6. **Fill in the template** — replace bracketed placeholders with content-specific details
7. **Append the required suffix:**
   - DALL-E photo: end with `photorealistic, no text or logos`
   - DALL-E graphic: end with `no text`
   - Midjourney photo: append `--ar [ratio] --style raw --v 7`
   - Midjourney graphic: append `--ar [ratio] --v 7`
8. **Save the image** using the filename convention: `YYYYMMDD-##-descriptive-name.png` in the appropriate subfolder (`assets/images/news/` or `assets/images/events/`)

---

## Working with provided images

When the user provides an image alongside article or event text:

- **Do NOT use it directly as an article asset.** It is never meant to be referenced in the frontmatter as-is.
- **Treat it as a style reference** for writing image generation prompts — extract color palette, mood, composition style, and visual tone.
- **Extract additional information** — promotional flyers, screenshots, and graphics often contain dates, eligibility details, CTAs, or other facts not present in the accompanying text. Read all visible text in the image as supplementary source material.

Always generate AI image prompts based on the article content and the style reference. The user will generate and save the actual image files.

---

## Step-by-step: Creating a news article from raw text

1. **Determine the date** from the source text → derive the `YYYYMMDD` prefix
2. **Check `content/news/`** for files with that date prefix → pick the next `##` sequence number
3. **Derive the slug** from the headline: lowercase, hyphens only, 3–6 words (e.g. `"Newcastle Pride 2025"` → `newcastle-pride-2025`)
4. **Set the filename:** `YYYYMMDD-##-slug.md`
5. **Write frontmatter:** fill `title`, `date`, `order`, `slug`, and `image` (path + alt)
6. **Add `imageHeader`** if a separate top-of-article image is provided
7. **Add `carousel`** if the article covers an event and multiple photos are provided
8. **Write the body:**
   - No `#` heading
   - Open with location (`Newcastle, WA`) and core fact (2–3 sentences)
   - Use H2/H3 sections for structure
   - Bold key names and orgs; italicize titles
   - Block-quote substantial quotes
   - End with a `## Sources` section listing all cited links

---

## Step-by-step: Creating an event from raw text

> **⚠ Date check first:** If the event date is today or in the past, **stop and warn the user** before creating anything. Do not create events for dates that have already occurred.

1. **Determine the event date** → derive the `YYYYMMDD` prefix
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
