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

Image paths: `assets/images/events/YYYYMMDD-##-descriptive-name.png`

### Image prompts

After creating the file, generate DALL-E and Midjourney prompts for each image slot. If the user attached a flyer, photo, or any reference image, study its visual style, color palette, composition, and mood — use that vibe as the primary creative direction. Describe what you observed before writing the prompts. Follow these rules:
- **Explicit racial diversity:** Write "racially diverse group including people of various ethnicities and skin tones, with people of color prominently represented" — never just "diverse"
- **LGBTQ+ motifs:** Include at least one subtle LGBTQ+ visual cue (pride wristband, rainbow pin, pride-color accessories) regardless of event type
- **Lighting:** Bright or golden-hour. Never overcast or grey.
- **No text in AI images.** Flags are allowed and encouraged — do not include "no signs, no logos" language that causes DALL-E to suppress flags.
- **Aspect ratios:** news feature/header = 16:9, events = 4:3 landscape (`1792x1024` DALL-E, `--ar 4:3` MJ)

### Also check
- Alt text: 50–250 characters; describe what's in the image, not the article topic
- No absolute URLs to newcastle.lgbt — use relative paths for internal links
- No `draft: true` unless explicitly requested
