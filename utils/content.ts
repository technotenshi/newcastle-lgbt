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

type PortableTextObject = {
  value?: unknown;
  children?: unknown;
};

const isPortableTextObject = (candidate: unknown): candidate is PortableTextObject =>
  typeof candidate === "object" && candidate !== null && !Array.isArray(candidate);

export const toPlainText = (node: unknown): string => {
  if (node == null) {
    return "";
  }

  if (typeof node === "string" || typeof node === "number" || typeof node === "boolean") {
    return String(node);
  }

  if (Array.isArray(node)) {
    return node.map((child) => toPlainText(child)).join(" ");
  }

  if (isPortableTextObject(node)) {
    const { value, children } = node;

    if (typeof value === "string") {
      return value;
    }

    if (Array.isArray(children)) {
      return children.map((child) => toPlainText(child)).join(" ");
    }
  }

  return "";
};

export const truncateSummary = (input: string, length = 160): string => {
  if (input.length <= length) {
    return input;
  }

  const truncated = input.slice(0, length);
  const lastSpace = truncated.lastIndexOf(" ");

  if (lastSpace > 0) {
    return truncated.slice(0, lastSpace).trim();
  }

  return truncated.trim();
};
