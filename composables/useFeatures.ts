import { queryContent } from "#content";

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

interface FeaturesDocument {
  _id: string;
  _path: string;
  body?: FeatureItem[];
  items?: FeatureItem[];
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
    const document = (await queryContent<FeaturesDocument>("features").findOne()) as FeaturesDocument | null;
    const items = Array.isArray(document?.items)
      ? (document.items as FeatureItem[])
      : Array.isArray(document?.body)
        ? (document.body as FeatureItem[])
        : [];
    const sorted = [...items].sort((first, second) => (first.order ?? 0) - (second.order ?? 0));

    return typeof limit === "number" ? sorted.slice(0, limit) : sorted;
  });
}
