// News publication rules: which articles are published, in what order, at which
// path, with what summary. Pure functions over content rows, so the Nuxt app
// (client queryCollection) and the RSS route (server queryCollection) share one
// implementation and Node tests can run it without Nuxt.
//
// A row is what queryCollection("content") returns for a /news/ document:
// { id, path, title, description, meta, body }. `meta` may be an object or a
// JSON string. GLOSSARY.md defines "Published article".

import {
  normaliseBody,
  normaliseNumber,
  normaliseString,
  parseMeta,
  toPlainText,
  truncateSummary,
} from "./content.mjs";

const SUMMARY_LENGTH = 160;

const pacificDate = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Los_Angeles" });

/**
 * Today's date in Pacific time as YYYY-MM-DD, the zone every publication date
 * in content/ is written in.
 *
 * @param {Date} [now]
 * @returns {string}
 */
export const pacificToday = (now = new Date()) => pacificDate.format(now);

/**
 * Canonical route for an article, or undefined when the date or slug is unusable.
 *
 * @param {unknown} date YYYY-MM-DD
 * @param {unknown} slug
 * @returns {string | undefined}
 */
export function articlePath(date, slug) {
  if (typeof date !== "string" || typeof slug !== "string") {
    return undefined;
  }

  const [year, month, day] = date.split("-");

  if (!year || year.length !== 4 || !month || !day) {
    return undefined;
  }

  const trimmedSlug = slug.trim();

  if (!trimmedSlug) {
    return undefined;
  }

  return `/news/${year}/${month.padStart(2, "0").slice(-2)}/${day.padStart(2, "0").slice(-2)}/${trimmedSlug}`;
}

/**
 * The publication rule. Missing dates count as published, as before.
 *
 * @param {Record<string, unknown>} meta
 * @param {string} today
 */
const isPublished = (meta, today) => {
  if (meta.draft === true || meta._draft === true) {
    return false;
  }

  return !(typeof meta.date === "string" && meta.date > today);
};

/** @param {string | undefined} value */
const dateValue = (value) => {
  if (!value) {
    return 0;
  }

  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? 0 : timestamp;
};

/**
 * Newest first, then higher `order` first within a day.
 *
 * @param {{ date?: string, order?: number }} first
 * @param {{ date?: string, order?: number }} second
 */
const byNewest = (first, second) => {
  const difference = dateValue(second.date) - dateValue(first.date);

  if (difference !== 0) {
    return difference;
  }

  return (second.order ?? 0) - (first.order ?? 0);
};

/** @param {unknown} value */
const stringOrUndefined = (value) => (typeof value === "string" ? value : undefined);

/** @param {unknown} value */
const plainObject = (value) => (typeof value === "object" && value !== null ? value : undefined);

/** @param {unknown} value */
const collapse = (value) => (typeof value === "string" ? value.replace(/\s+/g, " ").trim() : "");

/**
 * Card summary: excerpt, then meta description, then row description, then body text.
 *
 * @param {Record<string, unknown>} row
 * @param {Record<string, unknown>} meta
 * @returns {string}
 */
function summarise(row, meta) {
  const source = [
    toPlainText(meta.excerpt),
    toPlainText(meta.description),
    stringOrUndefined(row.description)?.trim() ?? "",
    toPlainText(normaliseBody(row.body)),
  ]
    .map(collapse)
    .find((value) => value.length > 0);

  return source ? truncateSummary(source, SUMMARY_LENGTH) : "";
}

/**
 * @typedef {object} NewsListing
 * @property {string} _id
 * @property {string} _path Canonical route, falling back to the content path.
 * @property {string | undefined} sourcePath
 * @property {string | undefined} title
 * @property {string | undefined} date
 * @property {number | undefined} order
 * @property {string | undefined} slug
 * @property {{ path?: string, alt?: string } | undefined} image
 * @property {{ path?: string, alt?: string } | undefined} imageHeader
 * @property {string} summary Empty when the article has no text.
 * @property {boolean} draft
 * @property {boolean} _draft
 */

/**
 * Fields every view of an article shares.
 *
 * @param {Record<string, unknown>} row
 * @param {Record<string, unknown>} meta
 */
function commonFields(row, meta) {
  const sourcePath = typeof row.path === "string" ? row.path : String(row.path ?? "");

  return {
    _id: typeof row.id === "string" ? row.id : String(row.id ?? ""),
    sourcePath: sourcePath || undefined,
    date: stringOrUndefined(meta.date),
    slug: stringOrUndefined(meta.slug),
    order: normaliseNumber(meta.order),
    image: /** @type {NewsListing["image"]} */ (plainObject(meta.image)),
    imageHeader: /** @type {NewsListing["imageHeader"]} */ (plainObject(meta.imageHeader)),
    draft: meta.draft === true,
    _draft: meta._draft === true,
  };
}

/**
 * @param {Array<Record<string, unknown>>} rows
 * @param {string} today
 * @param {boolean} includeDrafts
 * @param {number | undefined} limit
 */
function publishedEntries(rows, today, includeDrafts, limit) {
  const entries = rows
    .map((row) => ({ row, meta: parseMeta(row.meta) }))
    .filter(({ meta }) => includeDrafts || isPublished(meta, today))
    .map(({ row, meta }) => {
      const common = commonFields(row, meta);

      /** @type {NewsListing} */
      const listing = {
        ...common,
        _path: articlePath(common.date, common.slug) ?? (common.sourcePath || "/"),
        title: typeof row.title === "string" ? row.title : stringOrUndefined(meta.title),
        summary: summarise(row, meta),
      };

      return { row, meta, listing };
    })
    .sort((first, second) => byNewest(first.listing, second.listing));

  return typeof limit === "number" ? entries.slice(0, limit) : entries;
}

/**
 * Published articles for listings, newest first.
 *
 * @param {Array<Record<string, unknown>>} rows
 * @param {string} today From {@link pacificToday}.
 * @param {{ limit?: number, includeDrafts?: boolean }} [options]
 * @returns {NewsListing[]}
 */
export function listPublishedNews(rows, today, options = {}) {
  return publishedEntries(rows, today, options.includeDrafts ?? false, options.limit)
    .map(({ listing }) => listing);
}

/**
 * The full document for one published article, or null when no row matches the
 * date and slug or the match is not published (the page answers 404).
 *
 * @param {Array<Record<string, unknown>>} rows
 * @param {{ date: string, slug: string }} target
 * @param {string} today From {@link pacificToday}.
 */
export function findPublishedArticle(rows, target, today) {
  for (const row of rows) {
    const meta = parseMeta(row.meta);

    if (meta.slug !== target.slug || meta.date !== target.date) {
      continue;
    }

    if (!isPublished(meta, today)) {
      return null;
    }

    const common = commonFields(row, meta);
    const rowTitle = stringOrUndefined(row.title);
    const rowDescription = stringOrUndefined(row.description);

    return {
      ...common,
      _path: articlePath(target.date, target.slug) ?? common.sourcePath ?? "",
      title: rowTitle?.trim() ? rowTitle : stringOrUndefined(meta.title),
      description: rowDescription?.trim() ? rowDescription : stringOrUndefined(meta.description),
      carousel: plainObject(meta.carousel),
      body: normaliseBody(row.body),
      meta,
      seo: plainObject(meta.seo),
      excerpt: typeof meta.excerpt === "string" ? meta.excerpt : plainObject(meta.excerpt),
    };
  }

  return null;
}

/**
 * The feed has always built its links from the raw date parts and the slug as
 * written, without the year-length check or slug trimming `articlePath` does.
 * Kept as is so feed links do not change.
 *
 * @param {string | undefined} date
 * @param {string | undefined} slug
 * @returns {string | undefined}
 */
function feedPath(date, slug) {
  const [year, month, day] = (date ?? "").split("-");

  if (!year || !month || !day || !slug) {
    return undefined;
  }

  return `/news/${year}/${month.padStart(2, "0")}/${day.padStart(2, "0")}/${slug}`;
}

/**
 * @typedef {object} FeedItem
 * @property {string} title
 * @property {string} path Route without the site origin.
 * @property {string} description Summary text, or empty.
 * @property {Date} published Midnight UTC of the publication date.
 */

/**
 * The newest published articles as RSS items. Articles without a usable date
 * and slug are skipped after the limit is applied.
 *
 * @param {Array<Record<string, unknown>>} rows
 * @param {string} today From {@link pacificToday}.
 * @param {number} limit
 * @returns {FeedItem[]}
 */
export function listFeedItems(rows, today, limit) {
  /** @type {FeedItem[]} */
  const items = [];

  for (const { row, meta, listing } of publishedEntries(rows, today, false, limit)) {
    const path = feedPath(listing.date, listing.slug);

    if (!path || !listing.date) {
      continue;
    }

    const [year, month, day] = listing.date.split("-");

    items.push({
      title: normaliseString(row.title) ?? stringOrUndefined(meta.title) ?? "Untitled",
      path,
      description: truncateSummary(stringOrUndefined(row.description)?.trim() ?? "", SUMMARY_LENGTH),
      published: new Date(Date.UTC(Number(year), Number(month) - 1, Number(day))),
    });
  }

  return items;
}
