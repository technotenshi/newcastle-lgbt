---
name: generate-images
description: Delegate actual image file generation to the local Codex CLI for every image slot in a news article or event, instead of only producing prompts for manual generation
---

Generate and save real image files for a news article or event on the Newcastle LGBTQ+ site by delegating to the local **Codex CLI** (`codex exec`), which has its own native image-generation tool. This replaces the manual "generate prompts, hand off to the user" workflow from `/image-prompt` when Codex is available — it produces the actual PNG files directly in `assets/images/`.

## Prerequisite check

Before doing anything else, confirm Codex is usable:
```
command -v codex && codex login status
```
- If `codex` isn't installed, or `codex login status` doesn't show a logged-in session: stop and tell the user this skill needs it, then offer to fall back to `/image-prompt` (prompts only, for manual generation) instead.

## Step-by-step

1. **Read the content file** — extract topic, date, location, key visual elements, emotional tone, same as `/image-prompt`.
2. **Check for attached reference images** — if the user attached a flyer, photo, or reference image, study its visual style, color palette, composition, and mood, and describe what you observed before writing prompts. Per `docs/content-authoring.md`, never reference the attached image directly as an asset — it's style reference only.
3. **Identify image slots** from frontmatter: `image` (always), `imageHeader` (news only), `carousel` (news only, multiple).
4. **Determine style and aspect ratio per slot**, same rules as `/image-prompt`:
   - Civic/political/outdoor/commemorative → photorealistic documentary; social events/parties/workshops → graphic-design/poster
   - `image` (news), `imageHeader`, `carousel` → 16:9, exactly `1792x1024`
   - `image` (events) → 4:3 landscape, exactly `1024x768`
5. **Build one fully-specified generation prompt per slot**, applying every rule below, then run it through Codex.
6. **Verify and review every result** before reporting success (see Verification below).
7. **Fall back per-slot, not all-or-nothing** — if Codex fails on one slot, report that slot's prompt for manual generation (à la `/image-prompt`) while keeping the slots that succeeded.

## Non-negotiable prompt rules (same as `/image-prompt` — do not relax these when delegating to Codex)

- **Racial diversity (exact wording):** `"racially diverse group including people of various ethnicities and skin tones, with people of color prominently represented"` — never just "diverse."
- **LGBTQ+ motif in every image:** a subtle personal cue regardless of event type — a rainbow pride pin, a rainbow wristband, pride-color accessories. Not large flags/banners unless the content is specifically about a rally/march.
- **Lighting:** always specify `golden-hour afternoon sunlight`, `bright midday sunlight`, `warm morning light`, or `warm indoor lighting`. Never `overcast`/`cloudy`/`grey skies`/`diffused light`.
- **No text or logos in the image** — end the prompt with `no text or logos`.
- **No accurate flag rendering** — describe pride colors as a palette (`rainbow color palette`, or `light blue, pink, and white` for trans-specific content), not "a pride flag."
- **No named real people.**
- **Avoid near-duplicate images across slots** (or across two instances of a recurring event) — change scene type, subject, or vantage point, not just the crop.

## Running Codex

For each slot, invoke `codex exec` non-interactively with a self-contained prompt that:
- States the full scene description (topic + diversity clause + LGBTQ+ motif + lighting + style + "no text or logos")
- Requires Codex to use "a native image-generation tool or capability" to produce a **real** file, not a placeholder or text file
- Gives the exact save path (`assets/images/events/...` or `assets/images/news/...`, matching the filename convention `YYYYMMDD-##-descriptive-name.png`) and exact pixel dimensions (`1024x768` or `1792x1024`)
- Instructs Codex to say so explicitly, and create nothing, if it has no real way to generate an image

Example invocation:
```
codex exec "Generate a real image file using your native image-generation tool with this prompt: '<full scene prompt with diversity clause, LGBTQ+ motif, lighting, style, no text or logos>'. Save it at exactly <WxH> pixels to <absolute path>. If you do NOT have any real way to generate an image file, say so explicitly and do not create any file at all."
```

When there are multiple slots (or multiple events/articles at once), run each `codex exec` call as a separate background Bash command (`run_in_background: true`) so they generate in parallel, then wait for the task-completion notifications rather than polling.

## Verification (required — do not report success on Codex's word alone)

For every slot Codex claims to have completed:
1. Confirm the file exists and check its pixel dimensions with `node -e "require('sharp')('<path>').metadata().then(m=>console.log(m.width+'x'+m.height))"` (uses the `sharp` package already in `package.json`, works in CI/Docker unlike macOS-only `sips`) — must match the slot's required size exactly.
2. **View the image with the Read tool** and check it against the rules above: diverse cast, warm/golden lighting (not overcast), a visible LGBTQ+ motif, no rendered text, no duplicate composition versus any sibling slot.
3. If dimensions are wrong, the file is missing, or the content clearly fails a rule (overcast lighting, no visible motif, rendered text): retry once with a corrected prompt; if it fails again, treat that slot as a fallback case.
4. Write the final `image.alt` (and any other alt fields) to describe what is **actually** in the generated image — not the aspirational prompt — since generation is stochastic and may differ from what was requested.

## Fallback (per slot)

If Codex cannot produce a real file for a slot (not installed, not logged in, explicitly says it can't, or fails verification twice): output that slot's DALL-E and Midjourney prompts in the same format as `/image-prompt`, so the user can generate and save it manually.

## Report format

For each slot, report one line: `slot — status (generated/fallback) — path — dimensions — one-line description of what's actually in the image`. If any slot fell back, include its manual prompt block underneath.
