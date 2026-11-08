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
- If Codex is unavailable or not logged in, report that prerequisite failure and emit the per-slot manual fallback prompts below. Do not install software or generate placeholder files.

## Step-by-step

1. **Read the content file** — extract topic, date, location, and key visual elements; prepare the [emotional brief](../../../docs/image-generation-guide.md#emotional-brief-and-image-review) before writing prompts.
2. **Classify supplied images**: inspect their visible contents. Treat flyers/design references as source/style guidance; honor an explicitly supplied real photo or requested edit instead of replacing it with generated art. Preserve credits and skip generation for filled real-photo slots; follow the authoring guide's Working with provided images section.
3. **Identify image slots** from frontmatter: `image` (always), `imageHeader` (news, required), `carousel` (news only, multiple).
4. **Determine style and aspect ratio per slot**, same rules as `/image-prompt`:
   - Civic/political/outdoor/commemorative → photorealistic documentary; social events/parties/workshops → graphic-design/poster
   - `image` (news), `imageHeader`, `carousel` → exactly `1792x1024` landscape source (7:4), composed safely for 16:9 display crops
   - `image` (events) → 4:3 landscape, exactly `1024x768`
5. **Build one fully-specified generation prompt per slot**, applying every rule below, then run it through Codex.
6. **Verify and review every result** before reporting success (see Verification below).
7. **Fall back per-slot, not all-or-nothing** — if Codex fails on one slot, report that slot's prompt for manual generation (à la `/image-prompt`) while keeping the slots that succeeded.

## Non-negotiable prompt rules (same as `/image-prompt` — do not relax these when delegating to Codex)

- **Racial diversity (exact wording):** `"racially diverse group including people of various ethnicities and skin tones, with people of color prominently represented"` — never just "diverse."
- **LGBTQ+ motif in every image:** a subtle personal cue regardless of event type — a rainbow pride pin, a rainbow wristband, pride-color accessories. Use palette/accessory cues rather than generated flag artwork, including rallies/marches.
- **Lighting:** always specify `golden-hour afternoon sunlight`, `bright midday sunlight`, `warm morning light`, or `warm indoor lighting`. Never `overcast`/`cloudy`/`grey skies`/`diffused light`.
- **No text or logos in the image** — end the prompt with `no text or logos`.
- **No accurate flag rendering** — describe pride colors as a palette (`rainbow color palette`, or `light blue, pink, and white` for trans-specific content), not "a pride flag."
- **No named real people.**
- **Plan distinct images across slots** using the [emotional brief](../../../docs/image-generation-guide.md#emotional-brief-and-image-review); also avoid near-duplicates across two instances of a recurring event.

## Running Codex

For each slot, invoke `codex exec` non-interactively with a self-contained prompt that:
- States the full scene description (topic + diversity clause + LGBTQ+ motif + lighting + style + "no text or logos")
- Requires Codex to use "a native image-generation tool or capability" to produce a **real** file, not a placeholder or text file
- Gives the exact save path (`assets/images/events/...` or `assets/images/news/...`, matching the filename convention `YYYYMMDD-##-descriptive-name.png`) and exact pixel dimensions (`1024x768` or `1792x1024`)
- Instructs Codex to say so explicitly, and create nothing, if it has no real way to generate an image
- Tells Codex to write only the requested image file and never read or edit `.env`, `.env.*`, or `yarn.lock`

Example invocation:
```
codex exec --approve-for-me "Generate a real image file using your native image-generation tool with this prompt: '<full scene prompt with diversity clause, LGBTQ+ motif, lighting, style, no text or logos>'. Save it at exactly <WxH> pixels to $(pwd)/<path-from-frontmatter>. If you do NOT have any real way to generate an image file, say so explicitly and do not create any file at all. Write only that image file and never read or edit .env, .env.*, or yarn.lock." < /dev/null > "<client-scratch-dir>/<slot>.log" 2>&1
```

Two flags/redirects here are not cosmetic, and omitting either one produces a silent failure rather than a clear error:
- **`< /dev/null` is required.** `codex exec` reads from stdin when it's a non-terminal pipe, which it always is under a background/tool-driven Bash invocation. Without closing stdin, the process hangs waiting for an EOF that never comes; the run eventually gets cut off with a truncated log (often ending right after Codex reads its own skill file), no image, and no obvious error.
- **`--approve-for-me` is required.** Without it, the sandbox stops to ask for interactive approval before invoking the image-generation tool, which a non-interactive `codex exec` call has no way to answer.

Use the active client's scratch directory for logs, never a hardcoded system temporary path. For multiple slots, use separate tracked background calls and completion notifications: Claude Bash `run_in_background: true`, Hermes terminal `background: true, notify: true`, or the client's equivalent. Do not add a shell `&` inside an already-backgrounded tool call. Parent verification remains required after completion.

## Verification (required — do not report success on Codex's word alone)

For every slot Codex claims to have completed:
1. Confirm the file exists and check its pixel dimensions with `node -e "require('sharp')('<path>').metadata().then(m=>console.log(m.width+'x'+m.height))"` (uses the `sharp` package already in `package.json`, works in CI/Docker unlike macOS-only `sips`) — must match the slot's required size exactly.
2. **Inspect the actual image with a visual-capable tool** (Claude image Read, Hermes `vision_analyze`, Codex image viewer, or direct browser screenshot inspection). If the tool returns no image/description, say the image is unverified, use another check, and do not infer success or alt text from the prompt alone. Once viewed, check the rules above and the [emotional brief and image review](../../../docs/image-generation-guide.md#emotional-brief-and-image-review), including intended emotion, feature thumbnail engagement and coverage across sibling slots.
3. If dimensions are wrong, the file is missing, or the content clearly fails a rule or misses the intended emotion (for example, overcast lighting, no visible motif, rendered text): retry once with a corrected prompt; if it fails again, treat that slot as a fallback case.
4. Write `image.alt` and carousel alt text from the visible image (50–250 characters), not the aspirational prompt. News `imageHeader.alt` is the exception: write a one-sentence, factually supported engagement teaser about the article, not a scene description.

## Fallback (per slot)

If Codex cannot produce a real file for a slot (not installed, not logged in, explicitly says it can't, or fails verification twice): output that slot's DALL-E and Midjourney prompts in the same format as `/image-prompt`, so the user can generate and save it manually.

## Report format

For each slot, report one line: `slot — status (generated/fallback) — path — dimensions — one-line description of what's actually in the image`. If any slot fell back, include its manual prompt block underneath.
