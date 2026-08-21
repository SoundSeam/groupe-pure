export const sitePages = [
  {
    slug: "",
    href: "/",
    labels: { en: "Home", fr: "Accueil" },
    editable: true,
    hideable: false,
  },
  {
    slug: "services",
    href: "/services",
    labels: { en: "Services", fr: "Services" },
    editable: true,
    hideable: true,
  },
  {
    slug: "projects",
    href: "/projects",
    labels: { en: "Projects", fr: "Projets" },
    editable: true,
    hideable: true,
  },
  {
    slug: "team",
    href: "/team",
    labels: { en: "Team", fr: "Équipe" },
    editable: true,
    hideable: true,
  },
  {
    slug: "contact",
    href: "/contact",
    labels: { en: "Contact", fr: "Contact" },
    editable: true,
    hideable: true,
  },
  {
    slug: "privacy",
    href: "/privacy",
    labels: { en: "Privacy", fr: "Confidentialité" },
    editable: false,
    hideable: false,
  },
  {
    slug: "terms",
    href: "/terms",
    labels: { en: "Terms", fr: "Conditions d’utilisation" },
    editable: false,
    hideable: false,
  },
] as const;

export type SiteLocale = "en" | "fr";
export type SitePageHref = (typeof sitePages)[number]["href"];

export type SiteVisibility = Record<SiteLocale, SitePageHref[]>;

export const siteLocales = ["en", "fr"] as const;

export function localizedPagePath(locale: SiteLocale, href: SitePageHref) {
  return href === "/" ? `/${locale}` : `/${locale}${href}`;
}

export function pageForPath(path: string) {
  return sitePages.find((page) =>
    siteLocales.some((locale) => localizedPagePath(locale, page.href) === path),
  );
}

export function localeForPagePath(path: string): SiteLocale | null {
  const locale = path.split("/")[1];
  return locale === "en" || locale === "fr" ? locale : null;
}

export function isManagedPagePath(path: string) {
  return Boolean(pageForPath(path));
}

export function isEditablePagePath(path: string) {
  return Boolean(pageForPath(path)?.editable);
}

export function legacyPageVisibility(): SiteVisibility {
  const secondaryPagesVisible = process.env.FULL_SITE_ENABLED === "true";
  const hrefs = sitePages
    .filter((page) => !page.hideable || secondaryPagesVisible)
    .map((page) => page.href);

  return { en: [...hrefs], fr: [...hrefs] };
}

export function isPageVisible(
  visibility: SiteVisibility,
  locale: SiteLocale,
  href: string,
) {
  return visibility[locale].includes(href as SitePageHref);
}

export function serializeSiteVisibility(visibility: SiteVisibility) {
  return JSON.stringify(visibility);
}

export function parseSiteVisibility(value: string | null): SiteVisibility {
  const fallback = legacyPageVisibility();
  if (!value) return fallback;

  try {
    const parsed = JSON.parse(value) as Partial<Record<SiteLocale, unknown>>;
    const validHrefs = new Set(sitePages.map((page) => page.href));

    return {
      en: Array.isArray(parsed.en)
        ? parsed.en.filter((href): href is SitePageHref =>
            validHrefs.has(href as SitePageHref),
          )
        : fallback.en,
      fr: Array.isArray(parsed.fr)
        ? parsed.fr.filter((href): href is SitePageHref =>
            validHrefs.has(href as SitePageHref),
          )
        : fallback.fr,
    };
  } catch {
    return fallback;
  }
}
