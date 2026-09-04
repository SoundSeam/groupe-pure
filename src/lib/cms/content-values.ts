import type { CmsContent, CmsValue } from "./types";

export function cmsText(
  content: CmsContent,
  key: string,
  fallback: string,
) {
  const value = content[key];
  return value?.type === "text" ? value.value : fallback;
}

export function cmsMedia(content: CmsContent, key: string) {
  const value = content[key];
  return value?.type === "image" || value?.type === "video"
    ? value
    : undefined;
}

export function cmsImage(
  content: CmsContent,
  key: string,
  fallback: { value: string; alt?: string },
): CmsValue {
  const value = content[key];
  return value?.type === "image"
    ? value
    : { type: "image", value: fallback.value, alt: fallback.alt };
}
