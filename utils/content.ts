export const normaliseString = (value: unknown): string | undefined => {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
};

export const normaliseNumber = (value: unknown): number | undefined => {
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

export const normaliseBody = (value: unknown): unknown => {
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

export const parseMeta = (value: unknown): Record<string, unknown> => {
  if (!value) {
    return {};
  }

  if (typeof value === "string") {
    try {
      return JSON.parse(value) as Record<string, unknown>;
    } catch {
      return {};
    }
  }

  if (typeof value === "object") {
    return value as Record<string, unknown>;
  }

  return {};
};
