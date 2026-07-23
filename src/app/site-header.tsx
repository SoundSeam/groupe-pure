"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState } from "react";

type HeaderLink = {
  href: string;
  label: string;
};

type SiteHeaderProps = {
  fullSiteEnabled: boolean;
  lang: "en" | "fr";
  logo: string;
  labels: {
    homeLabel: string;
    navLabel: string;
    mobileNavLabel: string;
    openMenu: string;
    closeMenu: string;
    startProject: string;
    languageLabel: string;
    links: readonly HeaderLink[];
  };
};

function localizedHref(lang: "en" | "fr", href: string) {
  return href === "/" ? `/${lang}` : `/${lang}${href}`;
}

function equivalentLanguageHref(pathname: string, nextLang: "en" | "fr") {
  const segments = pathname.split("/").filter(Boolean);

  if (segments[0] === "en" || segments[0] === "fr") {
    segments[0] = nextLang;
    return `/${segments.join("/")}`;
  }

  return `/${nextLang}`;
}

export default function SiteHeader({
  fullSiteEnabled,
  lang,
  logo,
  labels,
}: SiteHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuId = useId();
  const pathname = usePathname();
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const otherLang = lang === "fr" ? "en" : "fr";
  const otherLangHref = useMemo(
    () => equivalentLanguageHref(pathname, otherLang),
    [otherLang, pathname],
  );

  const closeMenu = () => setIsMenuOpen(false);

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;

      if (
        target instanceof Node &&
        !mobileMenuRef.current?.contains(target) &&
        !menuButtonRef.current?.contains(target)
      ) {
        closeMenu();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeMenu();
        menuButtonRef.current?.focus();
      }
    };

    const desktopMedia = window.matchMedia("(min-width: 1024px)");
    const handleDesktopChange = (event: MediaQueryListEvent) => {
      if (event.matches) {
        closeMenu();
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    desktopMedia.addEventListener("change", handleDesktopChange);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
      desktopMedia.removeEventListener("change", handleDesktopChange);
    };
  }, [isMenuOpen]);

  return (
    <header className="sticky top-0 z-50 bg-background">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-6 px-6 sm:px-10">
        <div className="flex min-w-0 items-center gap-5">
          <Link
            href={`/${lang}`}
            aria-label={labels.homeLabel}
            className="shrink-0"
            onClick={closeMenu}
          >
            <Image
              src={logo}
              width={1724}
              height={513}
              alt="Groupe Pure Logo"
              className="h-8 w-auto"
            />
          </Link>
          {fullSiteEnabled ? (
            <nav
              aria-label={labels.navLabel}
              className="hidden items-center gap-1 text-sm font-medium text-white/78 lg:flex"
            >
              {labels.links.map((link) => (
                <Link
                  key={link.href}
                  href={localizedHref(lang, link.href)}
                  className="rounded-lg px-3 py-2 transition hover:bg-white/8 hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          ) : null}
        </div>
        <div className="hidden shrink-0 items-center gap-4 lg:flex">
          <Link
            href={otherLangHref}
            hrefLang={otherLang}
            aria-label={labels.languageLabel}
            className="rounded-lg px-3 py-2 text-sm font-medium uppercase text-white/78 transition hover:bg-white/8 hover:text-white"
          >
            {otherLang}
          </Link>
          {fullSiteEnabled ? (
            <Link
              href={localizedHref(lang, "/contact")}
              className="rounded-xl bg-[#e4c58f] px-5 py-3 text-sm font-medium text-[#101211] transition hover:bg-[#e4c58f]/90"
            >
              {labels.startProject}
            </Link>
          ) : null}
        </div>
        <div className="relative lg:hidden">
          {fullSiteEnabled ? (
            <button
              ref={menuButtonRef}
              type="button"
              aria-controls={menuId}
              aria-expanded={isMenuOpen}
              aria-label={isMenuOpen ? labels.closeMenu : labels.openMenu}
              className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 rounded-xl transition hover:bg-white/8 aria-expanded:bg-white/8"
              onClick={() => setIsMenuOpen((open) => !open)}
            >
              <span className="h-px w-5 bg-white" />
              <span className="h-px w-5 bg-white" />
              <span className="h-px w-5 bg-white" />
            </button>
          ) : (
            <Link
              href={otherLangHref}
              hrefLang={otherLang}
              aria-label={labels.languageLabel}
              className="block rounded-lg px-3 py-2 text-sm font-medium uppercase text-white/78 transition hover:bg-white/8 hover:text-white"
            >
              {otherLang}
            </Link>
          )}

          {fullSiteEnabled && isMenuOpen ? (
            <div
              ref={mobileMenuRef}
              id={menuId}
              className="absolute right-0 top-full mt-2 w-[min(calc(100vw-3rem),18rem)] rounded-xl border border-white/10 bg-background p-2 shadow-xl shadow-black/20"
            >
              <nav
                aria-label={labels.mobileNavLabel}
                className="flex flex-col text-sm font-medium text-white/78"
              >
                {labels.links.map((link) => (
                  <Link
                    key={link.href}
                    href={localizedHref(lang, link.href)}
                    className="rounded-lg px-3 py-3 transition hover:bg-white/8 hover:text-white"
                    onClick={closeMenu}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
              <div className="mt-2 border-t border-white/10 pt-2">
                <Link
                  href={otherLangHref}
                  hrefLang={otherLang}
                  aria-label={labels.languageLabel}
                  className="block rounded-lg px-3 py-3 text-sm font-medium uppercase text-white/78 transition hover:bg-white/8 hover:text-white"
                  onClick={closeMenu}
                >
                  {otherLang}
                </Link>
                <Link
                  href={localizedHref(lang, "/contact")}
                  className="mt-2 block rounded-xl bg-[#e4c58f] px-5 py-3 text-center text-sm font-medium text-[#101211] transition hover:bg-[#e4c58f]/90"
                  onClick={closeMenu}
                >
                  {labels.startProject}
                </Link>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
