import { queryCollection } from "#imports";

/**
 * Shape of the feature card data that powers the home page grid.
 */
export interface FeatureItem {
  id: number;
  imageSrc: string;
  imageAlt: string;
  title: string;
  description: string;
  link: string;
  target?: string;
  order?: number;
}

/**
 * Optional controls for the {@link useFeatures} composable.
 */
export interface UseFeaturesOptions {
  /** When set, limits the number of feature cards returned. */
  limit?: number;
}

/**
 * Loads feature card metadata from `content/features.json`, ensuring the results are sorted by their
 * `order` attribute so the consuming UI renders in a predictable sequence.
 */
export function useFeatures(options: UseFeaturesOptions = {}) {
  const { limit } = options;
  const key = `features-${limit ?? "all"}`;

  return useAsyncData(key, async () => {
    const document = (await queryCollection("content")
      .select("body")
      .where("path", "=", "/features")
      .first()) as Record<string, unknown> | null;

    const extractItems = (value: unknown): FeatureItem[] => {
      if (!value) {
        return [];
      }

      if (Array.isArray(value)) {
        return value as FeatureItem[];
      }

      if (typeof value === "object" && Array.isArray((value as Record<string, unknown>).items)) {
        return (value as Record<string, unknown>).items as FeatureItem[];
      }

      if (typeof value === "string") {
        try {
          const parsed = JSON.parse(value) as unknown;

          if (Array.isArray((parsed as Record<string, unknown>).items)) {
            return (parsed as Record<string, unknown>).items as FeatureItem[];
          }

          if (Array.isArray(parsed)) {
            return parsed as FeatureItem[];
          }
        } catch {
          // Ignore malformed JSON payloads.
        }
      }

      return [];
    };

    const items = extractItems(document?.body);
    const sorted = [...items].sort((first, second) => (first.order ?? 0) - (second.order ?? 0));

    return typeof limit === "number" ? sorted.slice(0, limit) : sorted;
  });
}
