---
name: image-prompt
description: Generate DALL-E 3 and Midjourney v7 prompts for every image slot in a news article or event, following all Newcastle LGBTQ+ site image rules
---

Generate AI image prompts for a news article or event on the Newcastle LGBTQ+ site. Read the content file provided (or the most recently created/edited one) and output ready-to-use prompts for every image slot.

## Step-by-step

1. **Read the content file** — extract: topic, date, location, key visual elements, emotional tone, any explicit visual details mentioned
2. **Check for attached images** — if the user has attached a flyer, photo, or any reference image, study its visual style, color palette, composition, and mood. Use that vibe as the primary creative direction for the prompts. Describe what you observed (e.g. "flat illustration style, bold rainbow flowers, cream textured background") before writing the prompts.
3. **Identify image slots** present in frontmatter: `image`, `imageHeader` (news only), `carousel` (news only)
4. **Determine style** — if an attached image provides a style reference, use it. Otherwise: civic/political/outdoor/commemorative → photorealistic; social events/parties/workshops → graphic-design/poster
4. **Check aspect ratio** per slot:
   - `image` (news), `imageHeader`, `carousel` → 16:9 (`1792x1024` for DALL-E, `--ar 16:9` for MJ)
   - `image` (events) → 4:3 landscape (`1792x1024` for DALL-E, `--ar 4:3` for MJ)
5. **Write distinct prompts** for each slot — if both `image` and `imageHeader` are present, they must differ meaningfully: different scene type, subject, vantage point, or narrative angle. Never just a tighter crop of the same scene.
6. **Output both DALL-E and Midjourney versions** for each slot.

## Non-negotiable rules (apply to every prompt)

### Racial diversity (REQUIRED — exact wording matters)
Write: `"racially diverse group including people of various ethnicities and skin tones, with people of color prominently represented"`
Do NOT write just "diverse" or "multicultural" — AI generators default to predominantly white subjects.

### LGBTQ+ motif (REQUIRED — every single image)
Include at least one subtle visual cue regardless of event type:
- `wearing a small rainbow pride pin on their jacket`
- `a rainbow pride wristband on one wrist`
- `pride-color accessories (red, orange, yellow, green, blue, violet)`
- `light blue, pink, and white accessories` (for trans-specific content)
Keep it personal and natural — accessories on people, not large flags or banners (unless the article is specifically about a rally/march).

### Lighting (REQUIRED)
Always specify: `golden-hour afternoon sunlight`, `bright midday sunlight`, `warm morning light`, or `indoor warm lighting`.
NEVER use: `overcast`, `cloudy`, `grey skies`, `diffused light`, `soft light`. Overcast makes the site feel gloomy.

### No text or logos
End every DALL-E prompt with: `photorealistic, no text or logos` (photo) or `no text` (graphic design).
Append to every MJ prompt: `--no text --no logos`

### No accurate flag rendering
Do not ask AI to render pride or transgender flags accurately — they misrender stripe order and colors. Use color palette descriptions instead:
- Pride flag → `rainbow color palette`
- Trans flag → `light blue, pink, and white color palette`
If accurate flag imagery is essential, tell the user to source a real photo from Unsplash or Pexels.

### No named real people
Do not reference specific individuals or public figures by name.

## Prompt templates

### Photorealistic (DALL-E)
```
[Scene description specific to article topic], [mood], [lighting condition], candid documentary photography style, racially diverse group including people of various ethnicities and skin tones with people of color prominently represented, [LGBTQ+ motif], photorealistic, no text or logos.
```

### Photorealistic (Midjourney)
```
IMG_4358.CR2, [scene], [lighting], candid photojournalism, [diversity cue], [LGBTQ+ motif] --style raw --s 150 --q 2 --ar [ratio] --v 7 --no text --no logos
```

### Graphic design / poster (DALL-E)
```
A vibrant promotional graphic for an LGBTQ+ [event type]. [Color palette], [mood] design aesthetic, clean geometric shapes, [LGBTQ+ motif as design element], flat design with subtle gradients, no text.
```

### Graphic design / poster (Midjourney)
```
LGBTQ+ [event type] promotional poster, [color palette], [mood], geometric shapes, [LGBTQ+ motif], flat graphic design --s 250 --q 2 --ar [ratio] --v 7 --no text
```

## Output format

For each slot, output:

```
### image (16:9)
**DALL-E 3:**
[prompt]

**Midjourney v7:**
[prompt]

**Save as:** assets/images/news/YYYYMMDD-##-descriptive-name.png
```

After all prompts, remind the user:
- Generate images and save to `assets/images/news/` or `assets/images/events/` using the filename convention
- Update the `image.path` (and `imageHeader.path` / `carousel` srcs) in the frontmatter once files are saved
