import { queryCollection } from "#imports";
import { normaliseBody, normaliseNumber, normaliseString, parseMeta } from "~/utils/content";

/**
 * Representation of a city council profile stored under `content/council`.
 */
export interface CouncilMember {
  _id: string;
  _path: string;
  /** Position number assigned to the council seat. */
  position?: number;
  /** Human readable name drawn from front matter. */
  name?: string;
  /** Contact email when provided. */
  email?: string;
  /** Emoji or small marker shown alongside the member. */
  flag?: string;
  /** Raw image path used on the site. */
  image?: string;
  /** ISO 8601 date used for sorting or metadata. */
  date?: string;
  body?: unknown;
}

/**
 * Fetches the council roster ordered by the numerical `position` field.
 */
export function useCouncil() {
  return useAsyncData("council-members", async () => {
    const rows = (await queryCollection("content")
      .select("id", "path", "meta", "body")
      .where("path", "LIKE", "/council/%")
      .all()) as Array<Record<string, unknown>>;

    const members = rows.map((row) => {
      const meta = parseMeta(row.meta);
      const rawId = row.id as string | number | undefined;
      const id = typeof rawId === "string"
        ? rawId
        : typeof rawId === "number"
          ? String(rawId)
          : normaliseString(rawId) ?? "";
      const rawPath = row.path as string | undefined;
      const canonicalPath = typeof rawPath === "string" && rawPath.trim()
        ? rawPath
        : id
          ? `/council/${id}`
          : "/council";
      const position = normaliseNumber(meta.position);
      const name = normaliseString(meta.name);
      const email = normaliseString(meta.email);
      const flag = normaliseString(meta.flag);
      const image = normaliseString(meta.image);
      const date = normaliseString(meta.date);
      const body = normaliseBody(row.body);

      const identifier = id || name || canonicalPath || "council-member";

      return {
        _id: identifier,
        _path: canonicalPath,
        position,
        name,
        email,
        flag,
        image,
        date,
        body,
      } as CouncilMember;
    });

    return members.slice().sort((first, second) => {
      const firstPosition = typeof first.position === "number" ? first.position : Number.POSITIVE_INFINITY;
      const secondPosition = typeof second.position === "number" ? second.position : Number.POSITIVE_INFINITY;

      if (firstPosition !== secondPosition) {
        return firstPosition - secondPosition;
      }

      const firstName = first.name ?? "";
      const secondName = second.name ?? "";

      return firstName.localeCompare(secondName);
    });
  });
}
