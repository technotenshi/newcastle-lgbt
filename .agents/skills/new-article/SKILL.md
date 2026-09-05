---
name: new-article
description: Scaffold a new news article or event in content/ with correct filename, frontmatter, and body structure per docs/content-authoring.md
---

Create a new content file (news article or event) for the Newcastle LGBTQ+ site.

## How to use

The user invokes `/new-article` and provides raw source material — a news excerpt, press release, social post, or just a brief description. You will:

1. Ask if this is a **news article** or an **event** (if not already clear from context)
2. Gather any missing required fields by asking the user
3. Check `content/news/` or `content/events/` for existing files on the same date to pick the correct sequence number (`##`)
4. Create the file with the correct name, frontmatter, and body

## Editorial stance

This is an activism site, not neutral journalism. For any article touching anti-LGBTQ+ policy, legislation, ballot initiatives, or the people and organizations behind them: verify the actual bill/policy text before characterizing its effect, fact-check specific claims from supporters with the same rigor as claims from opponents, and end with a critical, evidence-backed assessment rather than a neutral "arguments for / arguments against" list. Name a specific donor, legislator, spokesperson, executive, or candidate by name when a source (a filing, a quote, a roll-call vote) ties them directly to it, rather than retreating to the institution's name alone. See [`docs/editorial-checklist.md`](../../docs/editorial-checklist.md) for the full standard, required for movement history, government policy, discrimination, or corporate accountability topics.

Recurring subjects (an organization, a political committee, a specific individual) get a standing background file in `docs/research/` (e.g. `docs/research/lets-go-washington.md`). Before naming such a subject in a new article, check for a matching file and fold in relevant context so a reader unfamiliar with them isn't left with just a bare name. See [`docs/content-authoring.md`](../../docs/content-authoring.md) ("Background research files").

## Rules (from docs/content-authoring.md)

### Filename format
```
YYYYMMDD-##-descriptive-slug.md
```
- Date: 8 digits, e.g. `20250608`
- Sequence: zero-padded integer starting at `01`; increment when multiple files share the same date
- Slug: lowercase, hyphens only, 3–6 words from the title

### News articles (content/news/)

Required frontmatter fields: `title`, `date` (YYYY-MM-DD), `order` (integer), `slug`, `image.path`, `image.alt`

Do NOT include: `author`, `tags`, `category`, `collection`

Body rules:
- No `#` H1 heading — the frontmatter `title` renders as H1
- Open with `:Dateline` MDC component, NOT `**Newcastle, WA** –` directly
- Use H2 (`##`) for main sections, H3 (`###`) for subsections
- End with `## Sources` section for any cited external links
- Do NOT use em dashes (`—`). Use commas or colons instead. En-dashes (`–`) are OK for numeric ranges.

Image paths: `assets/images/news/YYYYMMDD-##-descriptive-name.png`

### Events (content/events/)

Required frontmatter fields: `title`, `date` (YYYY-MM-DD), `order` (integer), `slug`, `image.path`, `image.alt`, `link.text`, `link.target`

**IMPORTANT — date check:** If the event date is today or in the past, stop and warn the user before creating anything.

Events do NOT use `imageHeader`, `carousel`, or `draft`.

Body rules:
- 2–4 short sentences only: what it is, date/time (full prose, en-dash for ranges), location, how to register
- No bullet lists, subsections, or extended descriptions
- Do NOT use em dashes (`—`)
- **When referring readers to the CTA button, say "link below," never "link above."** The button (`link.text`/`link.target`) always renders after the body text in `pages/events/index.vue` (`ContentRenderer` comes first, the `<a class="btn">` comes after) — it is never above the body.

Image paths: `assets/images/events/YYYYMMDD-##-descriptive-name.png`

### Real event photos and photo credit

When the user provides a real photo (a URL or file) instead of asking for an AI-generated image, download it directly to `assets/images/events/YYYYMMDD-##-descriptive-name.<ext>` rather than generating prompts for that slot. Check the downloaded file for a photographer credit before finalizing:
- Inspect EXIF metadata (`file <path>` surfaces an embedded `copyright`/`artist` tag if present; `exiftool` if available gives a fuller read)
- If a credit is present, add it as `image.credit: "Name"` in frontmatter — name only, never phone numbers or other contact info
- If no credit metadata exists, omit the `credit` field entirely — it's optional and only renders when set
- `image.credit` is currently supported for **events only** (`composables/useEvents.ts` `EventItem.image.credit`, rendered as a small "Photo: {credit}" line under the image in `pages/events/index.vue`). News articles have no equivalent field or rendering yet.

### Image prompts

After creating the file, generate DALL-E and Midjourney prompts for each image slot. If the user attached a flyer, photo, or any reference image, study its visual style, color palette, composition, and mood — use that vibe as the primary creative direction. Describe what you observed before writing the prompts. Follow these rules:
- **Explicit racial diversity:** Write "racially diverse group including people of various ethnicities and skin tones, with people of color prominently represented" — never just "diverse"
- **LGBTQ+ motifs:** Include at least one subtle LGBTQ+ visual cue (pride wristband, rainbow pin, pride-color accessories) regardless of event type
- **Lighting:** Bright or golden-hour. Never overcast or grey.
- **No text in AI images.** Flags are allowed and encouraged — do not include "no signs, no logos" language that causes DALL-E to suppress flags.
- **Aspect ratios:** news feature/header = 16:9 (`1792x1024` DALL-E, `--ar 16:9` MJ); events = 4:3 landscape (`1024x768` DALL-E, gpt-image-1/2 only since dall-e-3 has no true 4:3 fixed size, `--ar 4:3` MJ)
- **Save path in the prompt itself:** every generated prompt (DALL-E and Midjourney, every slot) must end with `Save as: [image path from frontmatter]` (DALL-E) or `// Save as: [image path from frontmatter]` (Midjourney), not just as a note outside the prompt

### Also check
- Alt text: 50–250 characters; describe what's in the image, not the article topic
- No absolute URLs to newcastle.lgbt — use relative paths for internal links
- No `draft: true` unless explicitly requested
