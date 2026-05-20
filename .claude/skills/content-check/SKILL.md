---
name: content-check
description: Validate a content/ file or diff against Newcastle LGBTQ+ site conventions before publishing — checks em dashes, absolute URLs, alt text, draft flag, image diversity rules, and more
---

You are a content validator for the Newcastle, WA LGBTQ+ community site. When invoked, check the specified file (or recent changes) against all content conventions.

## What to check

Run through every rule below and report any violations with file path and line number.

### Structure & frontmatter
- [ ] **Required fields present:** `title`, `date`, `order`, `slug`, `image.path`, `image.alt` — flag any missing
- [ ] **No forbidden fields:** no `author`, `tags`, `category`, `collection` in news/events
- [ ] **draft flag:** if `draft: true` is present, warn the user — it hides the article from all listings
- [ ] **date format:** must be `YYYY-MM-DD`; flag if 8-digit or other format used
- [ ] **Event past-date:** if this is an event file and the `date` is today or in the past, flag it

### Body copy
- [ ] **No em dashes (`—`):** flag every occurrence with line number and suggest replacing with a comma or colon
- [ ] **No H1 in body:** flag any line starting with `# ` (single hash) — the frontmatter title renders as H1
- [ ] **Dateline usage:** news article bodies should open with `:Dateline`, not `**Newcastle, WA** –` or `**Newcastle, WA**:` directly
- [ ] **No bare absolute internal URLs:** flag `https://newcastle.lgbt/...` anywhere — should be relative paths
- [ ] **Sources section:** news articles citing external material should end with a `## Sources` section

### Images
- [ ] **Alt text length:** `image.alt` and `imageHeader.alt` should be 50–250 characters; flag if shorter or longer
- [ ] **Alt text is descriptive:** the alt text should describe what's in the image, not repeat the article title verbatim
- [ ] **imageHeader.alt:** for news articles, this field is an engagement teaser sentence, NOT an image description — flag if it reads like a description ("A photo of...", "Image showing...")
- [ ] **Image paths:** should be `assets/images/news/...` or `assets/images/events/...` (not `public/`, not absolute)

### Image generation prompts (if present in the message or a companion prompt file)
- [ ] **Explicit racial diversity:** must include language like "racially diverse group including people of various ethnicities and skin tones, with people of color prominently represented" — flag if only "diverse" is used
- [ ] **LGBTQ+ motif:** at least one subtle LGBTQ+ visual cue must be described (pride wristband, rainbow pin, pride-color accessories)
- [ ] **No overcast/grey lighting:** flag "overcast", "cloudy", "grey skies", "diffused light" — suggest "bright sunlight" or "golden-hour" instead

## Output format

Group violations by category. For each:
```
[CATEGORY] Line N: <description of violation>
  → Suggestion: <how to fix>
```

If no violations found, say "All checks passed." and list the categories that were verified.

## How to invoke

The user can run `/content-check` with:
- A file path: `content/news/20250608-01-some-article.md`
- No argument: checks the most recently edited content/ file
- "recent changes": validates all files modified since the last git commit
