"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";

const navLinks = [
  { href: "#accueil", label: "Accueil" },
  { href: "#services", label: "Services" },
  { href: "#projets", label: "Projets" },
  { href: "#apropos", label: "À propos" },
  { href: "#contact", label: "Contact" },
];

export default function SiteHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuId = useId();
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

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

    const handleHashChange = () => closeMenu();
    const desktopMedia = window.matchMedia("(min-width: 1024px)");
    const handleDesktopChange = (event: MediaQueryListEvent) => {
      if (event.matches) {
        closeMenu();
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("hashchange", handleHashChange);
    desktopMedia.addEventListener("change", handleDesktopChange);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("hashchange", handleHashChange);
      desktopMedia.removeEventListener("change", handleDesktopChange);
    };
  }, [isMenuOpen]);

  return (
    <header className="sticky top-0 z-50 bg-background">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-6 px-6 sm:px-10">
        <div className="flex min-w-0 items-center gap-5">
          <Link
            href="#accueil"
            aria-label="Groupe Pure accueil"
            className="shrink-0"
            onClick={closeMenu}
          >
            <Image
              src="https://soundseam-origin.s3.us-east-2.amazonaws.com/misc/LogoGrouepPureNoWordmark.png"
              width={128}
              height={128}
              alt="Groupe Pure Logo"
              className="h-8 w-8"
            />
          </Link>
          <nav
            aria-label="Navigation principale"
            className="hidden items-center gap-1 text-sm font-medium text-white/78 lg:flex"
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg px-3 py-2 transition hover:bg-white/8 hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="hidden shrink-0 items-center gap-4 lg:flex">
          <a href="tel:+15148855877" className="text-sm font-medium text-white">
            (514) 885-5877
          </a>
          <Link
            href="#contact"
            className="rounded-xl bg-white px-5 py-3 text-sm font-medium text-[#101211] transition hover:bg-white/90"
          >
            Démarrer un projet
          </Link>
        </div>
        <div className="relative lg:hidden">
          <button
            ref={menuButtonRef}
            type="button"
            aria-controls={menuId}
            aria-expanded={isMenuOpen}
            aria-label={isMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
            className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 rounded-xl transition hover:bg-white/8 aria-expanded:bg-white/8"
            onClick={() => setIsMenuOpen((open) => !open)}
          >
            <span className="h-px w-5 bg-white" />
            <span className="h-px w-5 bg-white" />
            <span className="h-px w-5 bg-white" />
          </button>

          {isMenuOpen ? (
            <div
              ref={mobileMenuRef}
              id={menuId}
              className="absolute right-0 top-full mt-2 w-[min(calc(100vw-3rem),18rem)] rounded-xl border border-white/10 bg-background p-2 shadow-xl shadow-black/20"
            >
              <nav
                aria-label="Navigation mobile"
                className="flex flex-col text-sm font-medium text-white/78"
              >
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="rounded-lg px-3 py-3 transition hover:bg-white/8 hover:text-white"
                    onClick={closeMenu}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
              <div className="mt-2 border-t border-white/10 pt-2">
                <a
                  href="tel:+15148855877"
                  className="block rounded-lg px-3 py-3 text-sm font-medium text-white transition hover:bg-white/8"
                  onClick={closeMenu}
                >
                  (514) 885-5877
                </a>
                <Link
                  href="#contact"
                  className="mt-2 block rounded-xl bg-white px-5 py-3 text-center text-sm font-medium text-[#101211] transition hover:bg-white/90"
                  onClick={closeMenu}
                >
                  Démarrer un projet
                </Link>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
