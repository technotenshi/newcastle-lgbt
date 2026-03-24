# Lighthouse Core Web Vitals Audit

**Date:** 2026-03-23
**Tool:** Lighthouse 13.0.3 (desktop preset, performance category only)
**Served from:** `.output/public` via `npx serve` on `localhost:3001`

---

## Scores Summary

| Page | Score | FCP | LCP | TBT | CLS | SI |
|---|---|---|---|---|---|---|
| `/` (home) | 99 | 0.6 s | 0.7 s | 0 ms | 0.05 | 0.6 s |
| `/news` | 100 | 0.5 s | 0.7 s | 0 ms | 0.003 | 0.5 s |
| `/events` | 100 | 0.5 s | 0.7 s | 0 ms | 0.003 | 0.5 s |
| `/news/2025/03/31/transgender-day-of-visibility-2025` | 100 | 0.5 s | 0.7 s | 0 ms | 0.003 | 0.5 s |

All pages pass Core Web Vitals thresholds (LCP < 2.5 s, CLS < 0.1, INP/TBT near zero). No critical CWV issues.

---

## Findings and Prioritized Fixes

### 1. Unused CSS — 37 KiB savings (all pages)

**File:** `_nuxt/entry.C8eHkg1J.css`

The bundled CSS includes Bootstrap classes that are never used in the rendered pages. Combined with the full Jost font weight load (all 9 weights × 2 styles = 18 font files), this is the single largest CSS payload reduction opportunity.

**Fixes (in priority order):**

1. **Prune Jost font weights** (tracked in `improvement-tasks.md`) — audit `assets/theme/css/style.css` to find which weights are actually referenced, then trim the preload list in `nuxt.config.ts`. Estimated to cut 50–60% of the font payload.
2. **PurgeCSS / Nuxt CSS tree-shaking** — consider adding `@fullhuman/postcss-purgecss` or enabling Vite's built-in CSS minimization to strip unused Bootstrap rules at build time.

---

### 2. Unused JavaScript — 49 KiB savings (all pages) ✅ Resolved

**File:** `_nuxt/e12K7xZ4.js`

A Nuxt chunk (~49 KiB wasted) contains code that is loaded but not executed on initial render. This is likely Bootstrap JS (`bootstrap.client.ts` plugin) or a Vue component bundle loaded eagerly.

**Fix:** Audit `plugins/bootstrap.client.ts` — Bootstrap JS is only needed for interactive components (dropdowns, modals). If no interactive Bootstrap components are used on a given page, lazy-load or conditionally import it.

**Status: Resolved 2026-03-23** — replaced `bootstrap.bundle.min.js` with individual imports (`collapse.js` + `carousel.js`). Popper.js and all unused Bootstrap components (Modal, Dropdown, Tooltip, etc.) eliminated. Estimated reduction: ~65 KB minified / ~21 KB gzip.

---

### 3. Image without explicit `width` and `height` — CLS risk (home page) ✅ Resolved

**Element:** The hero `<NuxtImg>` in `pages/index.vue`

```html
<NuxtImg src="images/K59bqmorPm9qeV7qbg4Dozml.webp" ... class="img-fluid" />
```

No explicit `width` and `height` attributes are set. Browsers cannot reserve layout space before the image loads, which can cause Cumulative Layout Shift. The CLS score is currently 0.05 (passes), but this is fragile.

**Fix:** Add `width` and `height` to the `<NuxtImg>` matching the source image's intrinsic dimensions. `@nuxt/image` uses these for aspect-ratio reservation.

**Status: Resolved 2026-03-23** — added `width="1024" height="1024"` to the hero `<NuxtImg>` in `pages/index.vue`. Browsers now reserve the correct 1:1 aspect-ratio space before the image loads. CLS hardened.

---

### 4. Cache lifetimes (336 KiB, not actionable in dev)

Lighthouse flagged that static assets are served without long-lived `Cache-Control` headers. This is expected when serving locally with `npx serve` — the production deployment (Cloudflare Pages / CDN) should handle this automatically with immutable cache headers on `/_nuxt/` chunks. **No code changes needed.**

---

### 5. bfcache blocked (informational)

Lighthouse reported "Internal error. Not actionable" for back/forward cache restoration. This is a Lighthouse/browser-in-headless-mode artifact, not a real user-facing issue.

---

## Conclusion

The site is in excellent shape. No Core Web Vitals failures. The two actionable improvements are:

| Priority | Task | Effort | Impact | Status |
|---|---|---|---|---|
| High | Prune Jost font weights | Low | -50–60% font payload | Open |
| Medium | Add `width`/`height` to hero `<NuxtImg>` | Very low | CLS hardening | ✅ Done 2026-03-23 |
| Low | Bootstrap JS lazy-load | Medium | -49 KiB JS | ✅ Done 2026-03-23 |
| Low | PurgeCSS for Bootstrap | Medium | -37 KiB CSS | Open |
