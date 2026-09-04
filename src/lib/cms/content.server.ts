import "server-only";

import { cache } from "react";

import { isDatabaseConfigured } from "@/lib/env";
import { getPrisma } from "@/lib/prisma";

import type { CmsContent } from "./types";
import { isCmsContent } from "./types";

const readPublishedContent = cache(async (path: string): Promise<CmsContent> => {
  if (!isDatabaseConfigured()) return {};

  const page = await getPrisma().cmsPage.findUnique({
    where: { path },
    select: { publishedContent: true },
  });

  return isCmsContent(page?.publishedContent) ? page.publishedContent : {};
});
const readDraftContent = cache(async (path: string): Promise<CmsContent> => {
  if (!isDatabaseConfigured()) return {};

  const page = await getPrisma().cmsPage.findUnique({
    where: { path },
    select: { draftContent: true },
  });

  return isCmsContent(page?.draftContent) ? page.draftContent : {};
});

export function getPublishedPageContent(path: string) {
  return readPublishedContent(path);
}

export async function getPageContentForRender(
  path: string,
  editorPreview: boolean,
) {
  if (!editorPreview) {
    return readPublishedContent(path);
  }

  return readDraftContent(path);
}

export function getPublishedSharedContent(locale: "en" | "fr") {
  return readPublishedContent(`/_shared/${locale}/cta`);
}

export function getSharedContentForRender(
  locale: "en" | "fr",
  editorPreview: boolean,
) {
  return getPageContentForRender(`/_shared/${locale}/cta`, editorPreview);
}
