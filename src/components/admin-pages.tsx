"use client";

import {
  ArrowLeft,
  SignOut,
  SpinnerGap,
} from "@phosphor-icons/react";
import Link from "next/link";
import { useState } from "react";

import {
  isPageVisible,
  localizedPagePath,
  siteLocales,
  sitePages,
  type SiteLocale,
  type SiteVisibility,
} from "@/lib/cms/pages";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function AdminPages({
  email,
  initialVisibility,
}: {
  email: string;
  initialVisibility: SiteVisibility;
}) {
  const [visibility, setVisibility] =
    useState<SiteVisibility>(initialVisibility);
  const [pendingPath, setPendingPath] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [signingOut, setSigningOut] = useState(false);

  async function updateVisibility(
    locale: SiteLocale,
    href: (typeof sitePages)[number]["href"],
    visible: boolean,
  ) {
    const path = localizedPagePath(locale, href);
    setPendingPath(path);
    setError("");

    const response = await fetch("/api/cms/pages", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path, visible }),
    });
    const payload = (await response.json().catch(() => null)) as {
      visibility?: SiteVisibility;
      error?: string;
    } | null;

    if (!response.ok || !payload?.visibility) {
      setError("La modification n’a pas pu être enregistrée.");
      setPendingPath(null);
      return;
    }

    setVisibility(payload.visibility);
    setPendingPath(null);
  }

  async function signOut() {
    if (signingOut) return;
    setSigningOut(true);

    try {
      await createSupabaseBrowserClient().auth.signOut({ scope: "global" });
    } finally {
      window.location.replace("/admin");
    }
  }

  if (signingOut) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#101211] text-white">
        <div className="flex items-center gap-2 text-sm text-white/60">
          <SpinnerGap className="h-4 w-4 animate-spin" aria-hidden="true" />
          Déconnexion…
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0b0d0c] text-white">
      <header className="border-b border-white/10 bg-[#111412]">
        <div className="mx-auto flex min-h-14 w-full max-w-4xl items-center px-5 py-2 sm:px-8">
          <Link
            href="/admin/fr"
            className="flex h-9 items-center gap-2 rounded-lg px-3 text-sm font-medium text-white/65 transition hover:bg-white/8 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour à l’éditeur
          </Link>
          <button
            type="button"
            title={email}
            onClick={() => void signOut()}
            className="ml-auto flex h-9 items-center gap-2 rounded-lg px-3 text-sm font-medium text-white/65 transition hover:bg-white/8 hover:text-white"
          >
            <SignOut className="h-4 w-4" />
            Déconnexion
          </button>
        </div>
      </header>

      <div className="mx-auto w-full max-w-4xl px-5 py-10 sm:px-8 sm:py-14">
        <div className="flex min-h-10 items-center gap-3">
          <h1 className="text-3xl font-semibold sm:text-4xl">
            Visibilité des pages
          </h1>
          {pendingPath ? (
            <SpinnerGap className="h-5 w-5 animate-spin text-white/45" />
          ) : null}
        </div>
        {error ? (
          <p className="mt-3 text-sm text-red-300" role="alert">
            {error}
          </p>
        ) : null}

        <div className="mt-8 overflow-hidden rounded-xl border border-white/10 bg-[#111412]">
          <div className="grid grid-cols-[minmax(0,1fr)_5.5rem_5.5rem] items-center border-b border-white/10 px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-white/45 sm:grid-cols-[minmax(0,1fr)_8rem_8rem]">
            <span>Page</span>
            <span className="text-center">Français</span>
            <span className="text-center">Anglais</span>
          </div>
          {sitePages
            .filter((page) => page.href === "/" || page.hideable)
            .map((page) => (
            <div
              key={page.href}
              className="grid grid-cols-[minmax(0,1fr)_5.5rem_5.5rem] items-center border-b border-white/10 px-5 py-4 last:border-b-0 sm:grid-cols-[minmax(0,1fr)_8rem_8rem]"
            >
              <p className="font-medium text-white">{page.labels.fr}</p>
              {siteLocales.map((locale) => {
                const visible = isPageVisible(visibility, locale, page.href);

                return (
                  <div key={locale} className="flex justify-center">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={visible}
                      aria-label={`${page.labels[locale]} est ${visible ? "visible" : "masquée"}`}
                      title={
                        page.hideable
                          ? undefined
                          : "La page d’accueil est toujours visible"
                      }
                      disabled={!page.hideable || pendingPath !== null}
                      onClick={() =>
                        void updateVisibility(locale, page.href, !visible)
                      }
                      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e4c58f] focus-visible:ring-offset-2 focus-visible:ring-offset-[#111412] disabled:cursor-not-allowed ${
                        visible ? "bg-[#e4c58f]" : "bg-[#343936]"
                      }`}
                    >
                      <span
                        className={`block h-5 w-5 rounded-full bg-white shadow-md transition-transform ${
                          visible ? "translate-x-5" : "translate-x-0.5"
                        }`}
                      />
                    </button>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
