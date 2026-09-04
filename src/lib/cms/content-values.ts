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

export function splitCmsContent(content: CmsContent) {
  const pageContent: CmsContent = {};
  const sharedContent: CmsContent = {};

  Object.entries(content).forEach(([key, value]) => {
    (key.startsWith("shared:") ? sharedContent : pageContent)[key] = value;
  });

  return { pageContent, sharedContent };
}

export function recoverLocalCmsDraft(
  serverContent: CmsContent,
  localContent: CmsContent,
  pageRevisionMatches: boolean,
  sharedRevisionMatches: boolean,
) {
  if (!pageRevisionMatches) return serverContent;

  const server = splitCmsContent(serverContent);
  const local = splitCmsContent(localContent);

  return {
    ...local.pageContent,
    ...(sharedRevisionMatches ? local.sharedContent : server.sharedContent),
  };
}
