# SVG Favicon Design

Date: 2026-04-20

## Goal

Create a simplified SVG favicon derived from the provided raster mark. The favicon should preserve the core identity of the Newcastle LGBTQ Voice logo while remaining legible at browser favicon sizes such as `16x16` and `32x32`.

## Scope

This change is intentionally narrow:

- Add one new asset at `public/favicon.svg`
- Register the favicon in Nuxt head configuration
- Do not change page components, layout structure, theme styles, or content
- Do not attempt a full brand asset system or raster favicon set in this task

## Constraints

- The source image is a raster reference, so the favicon should be redrawn as a compact vector rather than auto-traced
- Small-size legibility is more important than exact fidelity to the source image
- The favicon must work as a standalone square SVG file served from `public/`
- The result should fit the site’s existing Nuxt static-site setup without new dependencies

## Recommended Approach

Use a hand-built SVG favicon that simplifies the original mark into bold, high-contrast shapes:

- A thick circular outer ring that carries the pride palette
- A reduced number of broad color wedges instead of many narrow segments
- A dark megaphone form that anchors the right side of the mark
- A simplified white dove silhouette over the megaphone
- Two or three sound rays only, to avoid visual noise at tiny sizes

This preserves the logo’s main ideas:

- community and pride through the ring colors
- voice and advocacy through the megaphone
- peace and openness through the dove

## Alternatives Considered

### 1. Simplified symbol

Keep the dove, megaphone, and pride ring, but reduce detail and thicken shapes.

Why this is preferred:

- Retains the strongest parts of the original identity
- Reads better than a close trace at small sizes
- Still communicates both peace and amplification

### 2. Badge silhouette

Use a mostly single-color badge with one pride accent.

Why it was not selected:

- Stronger at very small sizes
- Loses too much of the supplied mark’s identity

### 3. Ring and dove only

Remove the megaphone and rely on the bird inside the ring.

Why it was not selected:

- Cleaner visually
- Drops the “voice” concept that appears central to the brand mark

## Asset Design

### Canvas

- Use a square `viewBox`
- Center the icon geometry with comfortable outer padding so it does not feel cramped in browser tabs

### Color

- Use a small set of flat pride-inspired wedges on the outer ring
- Keep the megaphone in a dark slate or charcoal-blue tone for contrast
- Keep the dove in white to separate it from the darker base shape

### Shape Simplification

- Favor filled geometry over delicate strokes
- Avoid small cutouts that disappear when scaled down
- Reduce the number of sound rays
- Simplify the dove body and wing silhouette so the bird remains identifiable without interior detail

## Integration

Add the favicon link in `nuxt.config.ts` under `app.head.link` using the SVG served from `public/`.

Expected head entry:

- `rel: "icon"`
- `type: "image/svg+xml"`
- `href: "/favicon.svg"`

No runtime logic is required.

## Verification

Verification should focus on correctness and safe integration:

- Confirm `public/favicon.svg` is valid SVG/XML
- Confirm Nuxt head configuration includes the favicon link
- Run `make lint` after implementation
- Run `make build` after implementation

## Risks

### Over-detail

If the SVG preserves too much of the source image, it will blur or collapse at small sizes.

Mitigation:

- Keep geometry bold
- Reduce the number of color segments
- Limit decorative detail

### Over-simplification

If the icon is reduced too far, it may stop feeling related to the original mark.

Mitigation:

- Preserve the three core motifs: pride ring, dove, megaphone
- Keep the overall circular composition

## Out of Scope

- Creating PNG, ICO, Apple touch icon, or mask icon variants
- Reworking the broader site branding
- Replacing the original source logo elsewhere on the site
