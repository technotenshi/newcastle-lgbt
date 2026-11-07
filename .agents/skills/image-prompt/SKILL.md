---
name: image-prompt
description: Generate DALL-E 3 and Midjourney v7 prompts for every image slot in a news article or event, following all Newcastle LGBTQ+ site image rules
---

Generate AI image prompts for a news article or event on the Newcastle LGBTQ+ site. Read the content file provided (or the most recently created/edited one) and output ready-to-use prompts for every image slot.

## Step-by-step

1. **Read the content file** — extract topic, date, location, and key visual elements; prepare the [emotional brief](../../../docs/image-generation-guide.md#emotional-brief-and-image-review) before writing prompts.
2. **Check for attached images** — if the user has attached a flyer, photo, or any reference image, study its visual style, color palette, composition, and mood. Use that vibe as the primary creative direction for the prompts. Describe what you observed (e.g. "flat illustration style, bold rainbow flowers, cream textured background") before writing the prompts.
3. **Identify image slots** present in frontmatter: `image`, `imageHeader` (news, required), `carousel` (news only)
4. **Determine style** — if an attached image provides a style reference, use it. Otherwise: civic/political/outdoor/commemorative → photorealistic; social events/parties/workshops → graphic-design/poster
5. **Check source size and display composition** per slot:
   - `image` (news), `imageHeader`, `carousel` → `1792x1024` (7:4 landscape source), safe for 16:9 display crops; `--ar 16:9` for manual MJ composition
   - `image` (events) → 4:3 landscape (`1024x768` for DALL-E, gpt-image-1/2 only, since dall-e-3 has no true 4:3 fixed size; `--ar 4:3` for MJ)
6. **Write distinct prompts** for each slot using the emotional brief, and check the prompts against its image review criteria before output.
7. **Output both DALL-E and Midjourney versions** for each slot.

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
Keep it personal and natural — accessories on people, not generated flag artwork or large banners, including rallies/marches.

### Lighting (REQUIRED)
Always specify: `golden-hour afternoon sunlight`, `bright midday sunlight`, `warm morning light`, or `warm indoor lighting`.
NEVER use: `overcast`, `cloudy`, `grey skies`, `diffused light`, `soft light`. Overcast makes the site feel gloomy.

### No text or logos
End every DALL-E prompt with: `photorealistic, no text or logos` (photo) or `no text or logos` (graphic design).
Append to every MJ prompt: `--no text --no logos`

### No accurate flag rendering
Do not ask AI to render pride or transgender flags accurately — they misrender stripe order and colors. Use color palette descriptions instead:
- Pride flag → `rainbow color palette`
- Trans flag → `light blue, pink, and white color palette`
If accurate flag imagery is essential, tell the user to source a real photo from Unsplash or Pexels.

### No named real people
Do not reference specific individuals or public figures by name.

## Prompt templates

For each slot, state its exact output path and required pixel size separately from the visual prompt. Manual generators do not save repository files; filenames inside a scene prompt can be rendered as unwanted text. Only the local Codex generation workflow receives filesystem save instructions.

### Photorealistic (DALL-E)
```
[Scene description specific to article topic], [mood], [lighting condition], candid documentary photography style, racially diverse group including people of various ethnicities and skin tones, with people of color prominently represented, [LGBTQ+ motif], photorealistic, no text or logos.
```

### Photorealistic (Midjourney)
```
IMG_4358.CR2, [scene], [lighting], candid photojournalism, racially diverse group including people of various ethnicities and skin tones, with people of color prominently represented, [LGBTQ+ motif] --style raw --s 150 --q 2 --ar [ratio] --v 7 --no text --no logos
```

### Graphic design / poster (DALL-E)
```
A promotional illustration for an LGBTQ+ [event type], racially diverse group including people of various ethnicities and skin tones, with people of color prominently represented, [observable activity], [approved lighting], [color palette], [mood] design aesthetic, clean geometric shapes, [LGBTQ+ accessory motif], flat design, no text or logos.
```

### Graphic design / poster (Midjourney)
```
LGBTQ+ [event type] promotional illustration, racially diverse group including people of various ethnicities and skin tones, with people of color prominently represented, [activity], [approved lighting], [color palette], [mood], geometric shapes, [LGBTQ+ accessory motif], flat graphic design --s 250 --q 2 --ar [ratio] --v 7 --no text --no logos
```

## Output format

For each slot, output:

```
### image
**Save path:** [frontmatter path]
**Required source pixels:** [width x height]
**DALL-E / compatible generator:**
[visual prompt only]

**Midjourney v7:**
[visual prompt only]
```

After all prompts, remind the user:
- Generate images, verify/resize to the required source pixels, and save to the separately stated path
- Update the `image.path` (and `imageHeader.path` / `carousel` srcs) in the frontmatter only if the saved filename ends up differing from what was prompted
