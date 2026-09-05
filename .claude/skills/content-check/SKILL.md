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

### Advocacy-forward language (news articles on sensitive historical/political topics)
For articles covering movement history, government policy, discrimination, or corporate accountability, check against [`docs/editorial-checklist.md`](../../../docs/editorial-checklist.md). Flag any paragraph that:
- [ ] **Deficit framing:** reduces a person to trauma/poverty or uses "nothing left to lose" language instead of preserving agency
- [ ] **Violence-as-contribution:** measures resistance mainly by who "threw the first punch/brick" rather than who organized, sustained, or built
- [ ] **Identity conflation:** lists transgender people, drag performers, sex workers, and unhoused people as interchangeable rather than distinct, overlapping categories
- [ ] **Unverified absolutes:** uses "every," "first," "only," "all," "quietly," or "deliberately" without independently verifiable support
- [ ] **Collective blame:** blames "the movement," "gay men," or "lesbians" as an undifferentiated group instead of naming the specific organization or leader
- [ ] **Unattributed coded language:** narrates right-wing terms ("gender ideology," "cross-dressing," "gender-appropriate") as neutral description instead of a quoted, attributed term
- [ ] **Stereotyped adjectives:** uses "loud," "outlandish," "militant," etc. for marginalized people instead of describing conduct
- [ ] **Passive-voice accountability gap:** conceals who was responsible for an action (e.g. "were made to feel unwelcome" with no actor named)
- [ ] **Uncontextualized outdated terminology:** keeps a real historical name/quote using dated language without a brief note that it's outdated as a general label today
- [ ] **Neutral "both sides" framing without a conclusion:** this is an advocacy site, not neutral journalism. Flag an article on anti-LGBTQ+ policy/legislation/its supporters that never reaches a critical, evidence-backed assessment, that treats a documented harm and a campaign's denial of that harm as equally weighted, or that repeats a supporter's specific factual claim (a statistic, legal argument, cited authority) without checking whether it holds up
- [ ] **Hedging around a named individual the source already identifies:** flag "a spokesperson said" or "the campaign claimed" when the cited source actually names who said or did it, or when an organization is named but a source clearly implicates a specific donor, legislator, executive, or candidate within it. This site names people by name when the evidence supports it; also flag the opposite failure, naming someone without a credible source tying them to the claim
- [ ] **Missing background context for a researched subject:** check `docs/research/` for a background file matching any organization, political committee, or individual named in the article (e.g. `docs/research/lets-go-washington.md`). Flag if a matching file exists but the article doesn't draw on it, leaving an unfamiliar reader with just a bare name

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
