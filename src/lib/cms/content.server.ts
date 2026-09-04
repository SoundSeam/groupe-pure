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

export function getPublishedPageContent(path: string) {
  return readPublishedContent(path);
}

export function getPublishedSharedContent(locale: "en" | "fr") {
  return readPublishedContent(`/_shared/${locale}/cta`);
}
