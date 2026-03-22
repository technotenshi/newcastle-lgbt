import { queryCollection } from "#imports";
import { normaliseBody, normaliseNumber, normaliseString, parseMeta } from "~/utils/content";

/**
 * Representation of an event sourced from Markdown files in `content/events`.
 */
export interface EventItem {
  _id: string;
  _path: string;
  /** ISO 8601 event date used for filtering upcoming entries. */
  date?: string;
  /** Manual ordering field that prioritises certain events on the same day. */
  order?: number;
  /** Front-matter title for the event. */
  title?: string;
  /** Optional slug specified in front matter. */
  slug?: string;
  /** Location string provided in the document front matter. */
  location?: string;
  /** Time string provided in the document front matter. */
  time?: string;
  /** CTA link metadata for events that require external registration. */
  link?: {
    text?: string;
    target?: string;
  };
  /** Optional featured image for the event card. */
  image?: {
    path?: string;
    alt?: string;
  };
  body?: unknown;
}

/** Options accepted by {@link useEvents}. */
export interface UseEventsOptions {
  /**
   * Upper bound on the number of events returned.
   */
  limit?: number;
  /**
   * Override the baseline date used to determine upcoming events. When omitted, the current day is used.
   */
  startDate?: string;
  /**
   * When `true`, include past events as well as upcoming ones.
   */
  includePast?: boolean;
}

/**
 * Produces a reactive list of events sorted chronologically. Upcoming events are returned by default by
 * comparing the `date` field against today's date (or a user-supplied baseline).
 */
const normaliseLink = (value: unknown): EventItem["link"] | undefined => {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const input = value as Record<string, unknown>;
  const text = normaliseString(input.text);
  const target = normaliseString(input.target);

  if (!text && !target) {
    return undefined;
  }

  return { text, target };
};

const normaliseImage = (value: unknown): EventItem["image"] | undefined => {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const input = value as Record<string, unknown>;
  const path = normaliseString(input.path);
  const alt = normaliseString(input.alt);

  if (!path && !alt) {
    return undefined;
  }

  return { path, alt };
};

const compareDates = (first?: string, second?: string): number => {
  const safeFirst = first && first.trim() ? first : "9999-12-31";
  const safeSecond = second && second.trim() ? second : "9999-12-31";

  if (safeFirst < safeSecond) {
    return -1;
  }

  if (safeFirst > safeSecond) {
    return 1;
  }

  return 0;
};

export function useEvents(options: UseEventsOptions = {}) {
  const { limit, includePast = false } = options;
  const baselineDate = options.startDate ?? currentDateIso();
  const key = `events-${includePast ? "all" : "upcoming"}-${baselineDate}-${limit ?? "all"}`;

  return useAsyncData(key, async () => {
    const rows = (await queryCollection("content")
      .select("id", "path", "title", "meta", "body")
      .where("path", "LIKE", "/events/%")
      .all()) as Array<Record<string, unknown>>;

    const events = rows.map((row) => {
      const meta = parseMeta(row.meta);
      const rawId = row.id as string | number | undefined;
      const rawPath = row.path as string | undefined;
      const rawTitle = row.title as string | undefined;
      const id = typeof rawId === "string"
        ? rawId
        : typeof rawId === "number"
          ? String(rawId)
          : normaliseString(rawId) ?? "";
      const slug = normaliseString(meta.slug);
      const date = normaliseString(meta.date);
      const order = normaliseNumber(meta.order);
      const location = normaliseString(meta.location);
      const time = normaliseString(meta.time);
      const link = normaliseLink(meta.link);
      const image = normaliseImage(meta.image);
      const body = normaliseBody(row.body);
      const title = normaliseString(rawTitle) ?? normaliseString(meta.title);

      const canonicalPath = typeof rawPath === "string" && rawPath.trim()
        ? rawPath
        : slug
          ? `/events/${slug}`
          : id
            ? `/events/${id}`
            : "/events";

      const identifier = id || slug || canonicalPath || "event";

      return {
        _id: identifier,
        _path: canonicalPath,
        title,
        slug,
        date,
        order,
        location,
        time,
        link,
        image,
        body,
      } as EventItem;
    });

    const filtered = includePast
      ? events
      : events.filter((event) => {
        if (!event.date) {
          return true;
        }

        return event.date >= baselineDate;
      });

    const sorted = filtered.slice().sort((first, second) => {
      const dateDifference = compareDates(first.date, second.date);

      if (dateDifference !== 0) {
        return dateDifference;
      }

      const firstOrder = typeof first.order === "number" ? first.order : 0;
      const secondOrder = typeof second.order === "number" ? second.order : 0;

      return secondOrder - firstOrder;
    });

    return typeof limit === "number" ? sorted.slice(0, limit) : sorted;
  });
}

/**
 * Normalises the current local date into an ISO 8601 formatted `YYYY-MM-DD` string. The adjustment for the
 * timezone offset ensures comparisons against date strings stored in content files behave as expected.
 */
export function currentDateIso(reference: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Los_Angeles' }).format(reference);
}
