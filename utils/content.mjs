// Plain JavaScript so Node tests and server routes can import it without Nuxt.
// Import as ~/utils/content.mjs. Do not add a content.ts twin: Nuxt auto-imports both.

/** @param {unknown} value @returns {string | undefined} */
export const normaliseString = (value) => {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
};

/** @param {unknown} value @returns {number | undefined} */
export const normaliseNumber = (value) => {
  if (typeof value === "number") {
    return Number.isNaN(value) ? undefined : value;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();

    if (!trimmed) {
      return undefined;
    }

    const parsed = Number(trimmed);
    return Number.isNaN(parsed) ? undefined : parsed;
  }

  return undefined;
};

/** @param {unknown} value @returns {unknown} */
export const normaliseBody = (value) => {
  if (!value) {
    return undefined;
  }

  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      return undefined;
    }
  }

  if (typeof value === "object") {
    return value;
  }

  return undefined;
};

/** @param {unknown} value @returns {Record<string, unknown>} */
export const parseMeta = (value) => {
  if (!value) {
    return {};
  }

  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      return {};
    }
  }

  if (typeof value === "object") {
    return /** @type {Record<string, unknown>} */ (value);
  }

  return {};
};

/** @param {unknown} candidate */
const isPortableTextObject = (candidate) =>
  typeof candidate === "object" && candidate !== null && !Array.isArray(candidate);

/** @param {unknown} node @returns {string} */
export const toPlainText = (node) => {
  if (node == null) {
    return "";
  }

  if (typeof node === "string" || typeof node === "number" || typeof node === "boolean") {
    return String(node);
  }

  if (Array.isArray(node)) {
    return node.map((child) => toPlainText(child)).join(" ");
  }

  if (isPortableTextObject(node)) {
    const { value, children } = /** @type {{ value?: unknown, children?: unknown }} */ (node);

    if (typeof value === "string") {
      return value;
    }

    if (Array.isArray(children)) {
      return children.map((child) => toPlainText(child)).join(" ");
    }
  }

  return "";
};

/**
 * Cuts text at the last word boundary before `length`.
 *
 * @param {string} input
 * @param {number} [length]
 * @param {{ ellipsis?: boolean }} [options] Append "…" when the text was cut.
 * @returns {string}
 */
export const truncateSummary = (input, length = 160, options = {}) => {
  if (input.length <= length) {
    return input;
  }

  const suffix = options.ellipsis ? "…" : "";
  const truncated = input.slice(0, length);
  const lastSpace = truncated.lastIndexOf(" ");

  if (lastSpace > 0) {
    return `${truncated.slice(0, lastSpace).trim()}${suffix}`;
  }

  return `${truncated.trim()}${suffix}`;
};
