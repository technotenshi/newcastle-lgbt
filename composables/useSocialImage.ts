import { prerenderRoutes, useSiteConfig } from '#imports';
import { normalizeAssetPath } from '~/utils/assets';

/**
 * IPX modifiers for the 1200x630 social preview variant.
 *
 * `s_WxH` is the only IPX handler that crops to an exact box with `fit_cover`;
 * `w_`/`h_` resize one axis each and ignore `fit`. `enlarge` lets sources
 * narrower than 1200px reach the full size instead of being clamped.
 * scripts/verify-social-images.mjs checks for this 1200x630 size; change both
 * together.
 */
const SOCIAL_IMAGE_MODIFIERS = 'f_webp&s_1200x630&fit_cover&enlarge';

/** Image used when a page has no image of its own, relative to `assets/`. */
const DEFAULT_SOCIAL_IMAGE = 'images/K59bqmorPm9qeV7qbg4Dozml.webp';

/**
 * Builds the public social preview URL for a local image and queues the exact
 * IPX path for prerendering, so the file exists in the static output.
 *
 * Social URLs are passed to `useSeoMeta`, so the Nitro crawler never sees them
 * in page markup. Registering the path here keeps the emitted URL and the
 * generated file derived from one source.
 *
 * Call it synchronously in `setup`, after any awaited data, because
 * `prerenderRoutes` needs a Nuxt context. Do not call it from a getter that
 * `useSeoMeta` evaluates later.
 *
 * @param imagePath - A local image path (`images/...`, `~/assets/...`). Missing,
 *   empty, or external values fall back to the default social image.
 * @returns The absolute URL for `ogImage`, `twitterImage` and Article `image`.
 */
export function useSocialImage(imagePath?: unknown): string {
  const { url: siteUrl } = useSiteConfig();
  const normalized = normalizeAssetPath(imagePath);
  const isLocal = normalized !== '' && !/^(https?:)?\/\//i.test(normalized);
  const source = isLocal ? normalized : DEFAULT_SOCIAL_IMAGE;
  const ipxPath = `/_ipx/${SOCIAL_IMAGE_MODIFIERS}/${source}`;

  prerenderRoutes(ipxPath);

  return `${siteUrl}${ipxPath}`;
}
