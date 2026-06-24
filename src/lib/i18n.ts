import "server-only";

export const locales = ["en", "fr"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "fr";

export function hasLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}

export function getLocalizedPath(lang: Locale, path = "") {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return normalizedPath === "/" ? `/${lang}` : `/${lang}${normalizedPath}`;
}

export function getAlternates(path = "") {
  return Object.fromEntries(
    locales.map((locale) => [locale, getLocalizedPath(locale, path)]),
  ) as Record<Locale, string>;
}
