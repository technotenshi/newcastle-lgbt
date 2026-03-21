const HTTP_PROTOCOL_REGEX = /^https?:\/\//i;
const SCHEME_REGEX = /^[a-z][a-z0-9+.-]*:/i;

/**
 * Normalises asset paths to `~/assets/...` format for use with `<NuxtImg>`.
 *
 * Unlike `resolveAssetUrl`, this does not resolve the path through Vite's
 * module graph — it returns the raw alias path that `@nuxt/image` expects.
 * External URLs are passed through unchanged.
 *
 * @param input - The raw string provided for an asset source.
 * @returns A `~/assets/...` alias path, an external URL, or an empty string.
 */
export function normalizeAssetPath(input?: unknown): string {
  if (typeof input !== 'string') {
    return '';
  }

  const value = input.trim();

  if (!value) {
    return '';
  }

  if (HTTP_PROTOCOL_REGEX.test(value) || value.startsWith('//')) {
    return value;
  }

  if (SCHEME_REGEX.test(value)) {
    return '';
  }

  // Strip all known asset path prefixes to get a path relative to assets/
  let relative = value
    .replace(/^@\/assets\//, '')
    .replace(/^~\/assets\//, '')
    .replace(/^\.\.\/assets\//, '')
    .replace(/^\.\/assets\//, '')
    .replace(/^\/assets\//, '')
    .replace(/^assets\//, '');

  // Strip leading slash if any remain
  if (relative.startsWith('/')) {
    relative = relative.slice(1);
  }

  // Ensure the path is under images/ (bare filenames live in images/)
  if (!relative.startsWith('images/')) {
    relative = `images/${relative}`;
  }

  return relative;
}
