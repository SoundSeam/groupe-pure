import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import {
  SITE_VISIBILITY_HEADER,
  loadSiteVisibility,
} from "@/lib/cms/page-visibility.server";
import {
  isPageVisible,
  pageForPath,
  serializeSiteVisibility,
  siteLocales,
  sitePages,
  type SiteVisibility,
} from "@/lib/cms/pages";

const locales = ["en", "fr"] as const;
const defaultLocale = "fr";

const adminPreviewVisibility = Object.fromEntries(
  siteLocales.map((locale) => [locale, sitePages.map((page) => page.href)]),
) as SiteVisibility;

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

function isAllowedAdminEmail(email: unknown) {
  if (typeof email !== "string") return false;

  const allowlist = process.env.ADMIN_EMAILS?.split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);

  return !allowlist?.length || allowlist.includes(email.toLowerCase());
}

async function refreshAdminSession(
  request: NextRequest,
  previewPath?: string,
) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const publishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();

  if (!url || !publishableKey) {
    if (previewPath) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/admin";
      loginUrl.search = "";
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });
  const supabase = createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const { data } = await supabase.auth.getClaims();

  if (previewPath) {
    if (
      !data?.claims?.sub ||
      !isAllowedAdminEmail(data.claims.email)
    ) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/admin";
      loginUrl.search = "";
      return NextResponse.redirect(loginUrl);
    }

    const previewUrl = request.nextUrl.clone();
    previewUrl.pathname = previewPath;
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set(
      SITE_VISIBILITY_HEADER,
      serializeSiteVisibility(adminPreviewVisibility),
    );
    const rewrite = NextResponse.rewrite(previewUrl, {
      request: { headers: requestHeaders },
    });
    response.cookies.getAll().forEach((cookie) => rewrite.cookies.set(cookie));
    return rewrite;
  }

  return response;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname === "/admin-preview" ||
    pathname.startsWith("/admin-preview/")
  ) {
    const previewPath = pathname.replace(/^\/admin-preview/, "") || `/${defaultLocale}`;
    return refreshAdminSession(request, previewPath);
  }

  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    return refreshAdminSession(request);
  }

  if (pathnameHasLocale(pathname)) {
    const locale = getPathnameLocale(pathname)!;
    const visibility = await loadSiteVisibility();
    const page = pageForPath(pathname);

    if (page && !isPageVisible(visibility, locale, page.href)) {
      const url = request.nextUrl.clone();
      url.pathname = `/${locale}`;
      return NextResponse.redirect(url);
    }

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set(
      SITE_VISIBILITY_HEADER,
      serializeSiteVisibility(visibility),
    );
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  const locale = pathname === "/" ? defaultLocale : getPreferredLocale(request);
  const url = request.nextUrl.clone();
  url.pathname = pathname === "/" ? `/${locale}` : `/${locale}${pathname}`;

  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
