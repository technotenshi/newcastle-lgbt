import { queryContent } from "#content";

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
export function useEvents(options: UseEventsOptions = {}) {
  const { limit, includePast = false } = options;
  const baselineDate = options.startDate ?? currentDateIso();
  const key = `events-${includePast ? "all" : "upcoming"}-${baselineDate}-${limit ?? "all"}`;

  return useAsyncData(key, async () => {
    let builder = queryContent<EventItem>("events").sort({ date: 1, order: 1 });

    if (!includePast) {
      builder = builder.where({ date: { $gte: baselineDate } });
    }

    const events = (await builder.find()) as EventItem[];
    return typeof limit === "number" ? events.slice(0, limit) : events;
  });
}

/**
 * Normalises the current local date into an ISO 8601 formatted `YYYY-MM-DD` string. The adjustment for the
 * timezone offset ensures comparisons against date strings stored in content files behave as expected.
 */
export function currentDateIso(reference: Date = new Date()): string {
  const timezoneOffsetMs = reference.getTimezoneOffset() * 60000;
  return new Date(reference.getTime() - timezoneOffsetMs).toISOString().slice(0, 10);
}
