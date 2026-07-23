import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const locales = ["en", "fr"] as const;
const defaultLocale = "fr";
const fullSiteEnabled = process.env.FULL_SITE_ENABLED === "true";

function pathnameHasLocale(pathname: string) {
  return locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );
}

function getPathnameLocale(pathname: string) {
  return locales.find(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );
}

function getPreferredLocale(request: NextRequest) {
  const cookieLocale = request.cookies.get("NEXT_LOCALE")?.value;

  if (cookieLocale === "en" || cookieLocale === "fr") {
    return cookieLocale;
  }

  const acceptLanguage = request.headers.get("accept-language") ?? "";
  const acceptedLanguages = acceptLanguage
    .split(",")
    .map((part) => part.split(";")[0]?.trim().toLowerCase())
    .filter(Boolean);

  if (acceptedLanguages.some((language) => language === "en" || language.startsWith("en-"))) {
    return "en";
  }

  if (acceptedLanguages.some((language) => language === "fr" || language.startsWith("fr-"))) {
    return "fr";
  }

  return defaultLocale;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!fullSiteEnabled && pathname !== "/") {
    const pathnameLocale = getPathnameLocale(pathname);

    if (pathname !== `/${pathnameLocale}`) {
      const locale = pathnameLocale ?? getPreferredLocale(request);
      const url = request.nextUrl.clone();
      url.pathname = `/${locale}`;

      return NextResponse.redirect(url);
    }
  }

  if (pathnameHasLocale(pathname)) {
    return NextResponse.next();
  }

  const locale = pathname === "/" ? defaultLocale : getPreferredLocale(request);
  const url = request.nextUrl.clone();
  url.pathname = pathname === "/" ? `/${locale}` : `/${locale}${pathname}`;

  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
