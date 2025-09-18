import { queryContent } from "#content";

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
    const members = (await queryContent<CouncilMember>("council")
      .sort({ position: 1, name: 1 })
      .find()) as CouncilMember[];

    return members;
  });
}
