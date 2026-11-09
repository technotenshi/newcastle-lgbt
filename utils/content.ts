// The implementation is plain JavaScript in content.mjs so Node tests and
// server routes can import it without Nuxt. Existing imports keep working.
export {
  normaliseBody,
  normaliseNumber,
  normaliseString,
  parseMeta,
  toPlainText,
  truncateSummary,
} from "./content.mjs";
