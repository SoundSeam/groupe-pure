import "server-only";

import { headers } from "next/headers";

import { isDatabaseConfigured } from "@/lib/env";
import { getPrisma } from "@/lib/prisma";
import {
  legacyPageVisibility,
  localizedPagePath,
  pageForPath,
  parseSiteVisibility,
  siteLocales,
  sitePages,
  type SiteVisibility,
} from "@/lib/cms/pages";

export const SITE_VISIBILITY_HEADER = "x-groupe-pure-page-visibility";
export const CMS_EDITOR_PREVIEW_HEADER = "x-groupe-pure-cms-editor-preview";

export async function loadSiteVisibility(): Promise<SiteVisibility> {
  const visibility = legacyPageVisibility();

  if (!isDatabaseConfigured()) return visibility;

  try {
    const records = await getPrisma().cmsPage.findMany({
      where: {
        path: {
          in: siteLocales.flatMap((locale) =>
            sitePages.map((page) => localizedPagePath(locale, page.href)),
          ),
        },
      },
      select: { path: true, isVisible: true },
    });

    records.forEach((record) => {
      if (record.isVisible === null) return;

      const locale = record.path.split("/")[1];
      const page = pageForPath(record.path);
      if ((locale !== "en" && locale !== "fr") || !page) return;
      if (!page.hideable) return;

      visibility[locale] = record.isVisible
        ? Array.from(new Set([...visibility[locale], page.href]))
        : visibility[locale].filter((candidate) => candidate !== page.href);
    });
  } catch (error) {
    console.error("Page visibility lookup failed; using the legacy default.", error);
  }

  // Home and legal pages are permanent and never controlled by an override.
  siteLocales.forEach((locale) => {
    sitePages.forEach((page) => {
      if (!page.hideable && !visibility[locale].includes(page.href)) {
        visibility[locale].push(page.href);
      }
    });
  });

  return visibility;
}

export async function getRequestSiteVisibility() {
  const requestHeaders = await headers();
  return parseSiteVisibility(requestHeaders.get(SITE_VISIBILITY_HEADER));
}

export async function isCmsEditorPreviewRequest() {
  const requestHeaders = await headers();
  return requestHeaders.get(CMS_EDITOR_PREVIEW_HEADER) === "1";
}
