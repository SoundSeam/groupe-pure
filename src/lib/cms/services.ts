import type { CmsContent, CmsValue } from "./types";

export const SERVICE_KEYS = [
  "architecture",
  "construction",
  "excavation",
] as const;

export type ServiceKey = (typeof SERVICE_KEYS)[number];

export function serviceExamplesKey(serviceKey: ServiceKey) {
  return `collection:services:${serviceKey}:examples`;
}

export function serviceKeyFromExamplesKey(key: string) {
  return SERVICE_KEYS.find((serviceKey) => serviceExamplesKey(serviceKey) === key);
}

export function parseServiceExamples(
  value: CmsValue | undefined,
  fallback: string[] = [],
) {
  if (value?.type !== "collection") return [...fallback];

  try {
    const parsed = JSON.parse(value.value) as unknown;
    return Array.isArray(parsed)
      ? parsed.filter((entry): entry is string => typeof entry === "string")
      : [...fallback];
  } catch {
    return [...fallback];
  }
}

export function serviceExamplesValue(examples: string[]): CmsValue {
  return {
    type: "collection",
    value: JSON.stringify(examples),
  };
}

export function materializeServicePageContent(
  originals: ReadonlyMap<string, CmsValue>,
  current: CmsContent,
) {
  return {
    ...Object.fromEntries(originals),
    ...current,
  } satisfies CmsContent;
}
