export type CmsValueType = "text" | "image" | "video" | "collection";

export type CmsValue = {
  type: CmsValueType;
  value: string;
  alt?: string;
};

export type CmsContent = Record<string, CmsValue>;

export type CmsPagePayload = {
  content: CmsContent;
  revision: number;
  publishedRevision: number;
  sharedRevision: number;
  publishedSharedRevision: number;
  updatedAt: string | null;
};

export function isCmsContent(value: unknown): value is CmsContent {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  return Object.values(value).every((entry) => {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
      return false;
    }

    const candidate = entry as Partial<CmsValue>;
    return (
      (candidate.type === "text" ||
        candidate.type === "image" ||
        candidate.type === "video" ||
        candidate.type === "collection") &&
      typeof candidate.value === "string" &&
      (candidate.alt === undefined || typeof candidate.alt === "string")
    );
  });
}
