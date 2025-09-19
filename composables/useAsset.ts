const assetModules = import.meta.glob('~/assets/**/*', {
  eager: true,
  import: 'default',
  query: '?url',
});

const normaliseValue = (value: unknown): string => {
  if (typeof value === 'string') {
    return value;
  }

  if (value && typeof value === 'object' && 'default' in value) {
    const candidate = value.default as unknown;
    return typeof candidate === 'string' ? candidate : '';
  }

  return '';
};

const isExternalUrl = (value: string) => /^(https?:)?\/\//i.test(value);

const collectCandidates = (input: string): string[] => {
  const candidates = new Set<string>();
  const base = input.replace(/^\.+\//, '');

  const seeds = [base];

  if (base.startsWith('assets/')) {
    seeds.push(base.slice('assets/'.length));
  }

  for (const seed of seeds) {
    if (!seed) {
      continue;
    }

    candidates.add(seed);
    candidates.add(`assets/${seed}`);
    candidates.add(`/assets/${seed}`);
    candidates.add(`./assets/${seed}`);
    candidates.add(`../assets/${seed}`);
    candidates.add(`/${seed}`);

    if (!seed.startsWith('images/')) {
      const withImages = `images/${seed}`;
      candidates.add(withImages);
      candidates.add(`assets/${withImages}`);
      candidates.add(`/assets/${withImages}`);
      candidates.add(`./assets/${withImages}`);
      candidates.add(`../assets/${withImages}`);
      candidates.add(`/${withImages}`);
    }
  }

  return Array.from(candidates);
};

export function useAsset(requestedPath: string): string {
  if (typeof requestedPath !== 'string') {
    return '';
  }

  const trimmed = requestedPath.trim();

  if (!trimmed) {
    return '';
  }

  if (isExternalUrl(trimmed)) {
    return trimmed;
  }

  let normalised = trimmed
    .replace(/^~\//, '')
    .replace(/^@\//, '');

  if (normalised.startsWith('/')) {
    return normalised;
  }

  const candidates = collectCandidates(normalised);

  for (const candidate of candidates) {
    const resolved = normaliseValue(assetModules[candidate]);

    if (resolved) {
      return resolved;
    }
  }

  try {
    return new URL(normalised, import.meta.url).href;
  } catch {
    return normalised;
  }
}

export default useAsset;
