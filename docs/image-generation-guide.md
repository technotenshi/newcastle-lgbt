# Image Generation Guide

Reference for generating images with **Midjourney v7** and **DALL-E 3** for use on this site. Read this before writing any image prompt.

---

## Universal rules (both tools)

- **Describe what you WANT** — negative prompting is unreliable in both tools. Instead of "no cars," describe the scene you do want: "a quiet park path with trees and benches."
- **No text in AI-generated images** — typography renders inaccurately in both tools. Generate the image without text; add any labels or event details in Canva or Figma afterward.
- **Flags render inaccurately** — Midjourney and DALL-E both misrender Pride and transgender flags (wrong stripe order, colors, or proportions). Use color palette descriptions instead: `light blue, pink, and white color palette` for the trans flag; `rainbow color palette` for the Pride flag. If accurate flag imagery is essential, source a real photo from [Unsplash](https://unsplash.com) or [Pexels](https://www.pexels.com) rather than generating it with AI.
- **Specify identity explicitly** — training data defaults to heterosexual and cisgender representation. Always name the community: `"a same-sex couple of two women"`, `"a transgender person in their 30s"`, `"LGBTQ+ community members of diverse ages and ethnicities"`.
- **Specificity beats vagueness** — concrete scene details produce better results than generic adjectives.
- **Always name a lighting condition** — lighting determines mood (see Lighting Reference below).
- **No named real people** — do not reference specific individuals or public figures by name.
- **Paired article images should be related, not redundant** — when an article uses both `image` and `imageHeader`, keep them on the same topic but make them meaningfully different. Do not rely on minor crop or distance changes alone. Change at least one of: scene type, primary subject, vantage point, or narrative angle. A strong default is to pair an institutional or contextual scene with an operational or street-level scene, or to pair a wide establishing view with a clearly different close subject.

---

## Aspect ratio reference (site-specific)

| Image slot | Recommended AR | DALL-E size | Midjourney |
|---|---|---|---|
| `image` (news feature) | 16:9 | `1792x1024` | `--ar 16:9` |
| `imageHeader` (news) | 16:9 | `1792x1024` | `--ar 16:9` |
| `carousel` images | 16:9 | `1792x1024` | `--ar 16:9` |
| `image` (events) | 4:3 | `1024x768` (gpt-image-1/2 only; dall-e-3 has no true 4:3 size) | `--ar 4:3` |

---

## Midjourney v7

### Prompt structure

```
[Subject] + [Scene/Environment] + [Style/Mood] + [Lighting] + [Parameters]
```

- **Most important elements go first** — Midjourney gives more weight to early words.
- Natural language works well in v7; it understands conversational descriptions better than v6.
- Clarity beats length — a focused 15-word prompt often beats a 50-word keyword dump.

### Photorealism hack

Prefix the prompt with a camera filename to push Midjourney into photo-realism mode:

```
IMG_4358.CR2, [your prompt here] --style raw --s 150 --v 7
```

### Key parameters

| Parameter | What it does | Guidance |
|---|---|---|
| `--v 7` | Use the latest model | Always include |
| `--style raw` | Suppresses MJ's artistic bias; essential for photorealism | Always use for photos |
| `--ar` | Aspect ratio | See table above |
| `--s` (stylize) | 0 = literal; 1000 = highly artistic | 150–200 for photos; 200–300 for graphic design |
| `--q 2` | Higher detail and texture | Use for final renders; omit for drafts |
| `--mode draft` | 10× faster, half the GPU cost | Use during iteration |
| `--chaos` | Variation between the 4 output images | 0 for consistency; 20–50 to explore options |
| `--seed [N]` | Locks composition for reproducibility | Use when generating a series |
| `--sref [url]` | Style reference — locks palette, texture, mood | Best tool for visual consistency across articles |
| `--sw` | Style reference strength (0–1000) | 50–150 for subtle consistency |
| `subject::2 detail::1` | Prompt weighting — emphasizes elements | When one element should dominate |

### Parameters by use case

| Goal | Parameters |
|---|---|
| Photorealistic photo (final) | `--style raw --s 150 --q 2 --ar [ratio] --v 7` |
| Graphic design / poster | `--s 250 --q 2 --ar [ratio] --v 7` |
| Quick draft / iteration | `--mode draft --chaos 30 --v 7` |
| Consistent visual series | `--seed [N] --sref [url] --sw 100 --v 7` |

### Photorealism tips

- **Use camera language** instead of "realistic": `shot on Sony A7R IV, 85mm f/1.8 lens`
- Add texture cues: `natural skin texture, visible imperfections, grain`
- Add resolution cues: `8k resolution, sharp focus`
- Use the camera filename prefix trick above

### What to avoid

- Generic terms like "realistic" or "photographic" — use specific camera models instead
- Negative instructions — describe the positive scene
- Mixing conflicting aesthetics (photorealism + cartoon)
- Over-long keyword lists — clarity beats quantity

---

## DALL-E 3

### How it differs from Midjourney

- ChatGPT **automatically rewrites** your prompt into a more detailed version before generating — work with this, not against it. A simple description often yields great results.
- Follows instructions **more literally** than Midjourney — less artistic interpretation, more accuracy to spec.
- Does **not remember** previous generations — describe everything in each prompt from scratch.
- Images are **private by default** when used via ChatGPT (Midjourney is public unless on a Pro plan).

**DALL-E is better for:** prompt accuracy, conversational workflow, privacy.
**Midjourney is better for:** artistic polish, fine-grained editing, consistent styles across a series.

### Prompt structure

```
[Subject] + [Setting/Context] + [Mood/Atmosphere] + [Lighting] + [Style/Quality cues]
```

- Write **full sentences**, not comma-separated keywords.
- Use `"Photo of a..."` rather than `"Photorealistic..."`.
- Add environmental context to ground the scene: `"in a community park, with trees and a small crowd in the background."`

### Parameters

| Option | Values | When to use |
|---|---|---|
| **Size** | `1792x1024` (landscape) · `1024x1792` (portrait) · `1024x1024` (square) | Match to site aspect ratio table above |
| **Quality** | `standard` · `hd` | `hd` for final assets; `standard` for drafts |
| **Style** | `vivid` · `natural` | `natural` + `hd` for documentary photography; `vivid` for graphic design |

### Photorealism tips

- Start with `"Photo of a..."`
- Name the lighting: `"soft golden-hour sunlight"`, `"fluorescent overhead light"`, `"soft studio lighting"`
- Specify composition: `"wide-angle shot, shallow depth of field, bokeh background"`
- Add mood adjectives: serene, solemn, celebratory, energetic, contemplative

### Graphic design tips

- DALL-E 3 can render short text phrases but is still unreliable — do not rely on it for final assets
- Specify color palette explicitly: `"bold rainbow color palette on a dark navy background"`
- Describe visual hierarchy: `"a large central graphic element with supporting shapes and patterns around it"`
- Use `vivid` style for more saturated, dramatic output

### Negative prompting (workaround)

DALL-E tends to generate the excluded element anyway when you say "no X." Reframe as a positive scene:

| ❌ Don't write | ✅ Write instead |
|---|---|
| `no flags, no text` | `abstract color wash scene with no objects` |
| `no modern buildings` | `a rural village scene with wooden houses and trees` |
| `no people` | `an empty park bench overlooking a lake at sunset` |

### Consistency across generations

- Save the **seed number** from a successful generation and reuse it with the same prompt for slight variations
- Save the **exact prompt text** — small wording changes produce noticeably different outputs
- For true character or style consistency across multiple images, Midjourney with `--sref` is more reliable

### LGBTQ+ representation

DALL-E has built-in diversity directives but defaults to heterosexual/cisgender imagery when identity is unspecified:

- Always use explicit identity descriptors: `"a transgender woman in her 40s"`, `"two men in a same-sex relationship"`, `"LGBTQ+ youth of diverse racial backgrounds"`
- Specify ethnicity, age range, and gender expression directly — don't leave them to default
- The system actively supports LGBTQ+ inclusive imagery when asked explicitly

---

## Lighting reference

Use specific lighting terms in both tools — lighting determines the emotional tone of an image.

| Lighting | Effect | Best for |
|---|---|---|
| Golden hour | Warm, directional, long shadows | Outdoor community events, celebrations |
| Soft ambient | Even, flattering, minimal shadows | Portraits, indoor scenes |
| Dramatic rim lighting | Subject outlined by light from behind | Powerful solo portraits, rally scenes |
| High-key | Bright, well-lit, minimal shadow | Positive, uplifting, energetic mood |
| Low-key | Dark with selective light | Serious, solemn, investigative topics |
| Fluorescent overhead | Cool, flat, institutional | Council meetings, indoor civic events |
| Backlighting | Silhouette / halo effect | Rallies, marches, protest scenes |
| Diffuse natural | Overcast, soft, no harsh shadows | Candid street scenes, documentary style |

---

## Which tool to choose

| Situation | Recommended |
|---|---|
| Artistic polish and creative interpretation | Midjourney |
| Exact adherence to a detailed description | DALL-E 3 |
| Consistent visual style across a series of articles | Midjourney (`--sref`) |
| Quick conversational workflow in ChatGPT | DALL-E 3 |
| Photorealistic faces and anatomy | Midjourney v7 (40% fewer anatomical errors vs v6) |
| Graphic design / promotional poster | Either |
| Privacy — images must not be public | DALL-E 3 (private by default) |
