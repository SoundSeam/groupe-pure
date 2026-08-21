"use client";

import {
  ArrowLeft,
  ArrowSquareOut,
  CheckCircle,
  Eye,
  EyeSlash,
  LockKey,
  PencilSimple,
  SignOut,
  SpinnerGap,
  WarningCircle,
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

type PendingChange = { path: string; visible: boolean } | null;

export default function AdminPages({
  email,
  initialVisibility,
}: {
  email: string;
  initialVisibility: SiteVisibility;
}) {
  const [visibility, setVisibility] =
    useState<SiteVisibility>(initialVisibility);
  const [pending, setPending] = useState<PendingChange>(null);
  const [message, setMessage] = useState("");
  const [signingOut, setSigningOut] = useState(false);

  async function updateVisibility(
    locale: SiteLocale,
    href: (typeof sitePages)[number]["href"],
    visible: boolean,
  ) {
    const path = localizedPagePath(locale, href);
    setPending({ path, visible });
    setMessage("");

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
      setMessage("La visibilité de la page n’a pas pu être mise à jour.");
      setPending(null);
      return;
    }

    setVisibility(payload.visibility);
    setPending(null);
    setMessage(
      visible
        ? `${path} est maintenant visible sur le site.`
        : `${path} est maintenant masquée du site public.`,
    );
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
        <div className="mx-auto flex min-h-14 w-full max-w-6xl items-center gap-3 px-5 py-2 sm:px-8">
          <div className="flex h-9 items-center gap-2 rounded-lg border border-white/10 px-2.5 text-xs font-medium text-white/72">
            <LockKey className="h-4 w-4 text-[#e4c58f]" weight="fill" />
            Admin
          </div>
          <Link
            href="/admin/fr"
            className="flex h-9 items-center gap-2 rounded-lg px-3 text-xs font-medium text-white/60 transition hover:bg-white/8 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Éditeur
          </Link>
          <button
            type="button"
            title={email}
            onClick={() => void signOut()}
            className="ml-auto flex h-9 items-center gap-2 rounded-lg px-3 text-xs font-medium text-white/60 transition hover:bg-white/8 hover:text-white"
          >
            <SignOut className="h-4 w-4" />
            Déconnexion
          </button>
        </div>
      </header>

      <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
        <div className="max-w-2xl">
          <p className="text-sm font-medium text-[#e4c58f]">
            Paramètres du site
          </p>
          <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">
            Visibilité des pages
          </h1>
          <p className="mt-4 text-base font-light leading-7 text-white/60">
            Choisissez les pages disponibles publiquement dans chaque langue.
            Les pages masquées restent modifiables et accessibles dans l’aperçu
            administrateur.
          </p>
        </div>

        {message ? (
          <div
            className={`mt-8 flex items-start gap-2 rounded-xl border px-4 py-3 text-sm ${
              message.includes("n’a pas pu")
                ? "border-red-400/25 bg-red-400/8 text-red-200"
                : "border-emerald-400/25 bg-emerald-400/8 text-emerald-200"
            }`}
            role="status"
          >
            {message.includes("n’a pas pu") ? (
              <WarningCircle className="mt-0.5 h-4 w-4 shrink-0" weight="fill" />
            ) : (
              <CheckCircle className="mt-0.5 h-4 w-4 shrink-0" weight="fill" />
            )}
            {message}
          </div>
        ) : null}

        <div className="mt-8 overflow-hidden rounded-2xl border border-white/10 bg-[#111412]">
          <div className="hidden grid-cols-[minmax(0,1fr)_13rem_13rem] border-b border-white/10 px-5 py-3 text-xs font-medium uppercase tracking-[0.12em] text-white/35 md:grid">
            <span>Page</span>
            <span>Français</span>
            <span>Anglais</span>
          </div>
          {sitePages.map((page) => (
            <div
              key={page.href}
              className="grid gap-5 border-b border-white/10 p-5 last:border-b-0 md:grid-cols-[minmax(0,1fr)_13rem_13rem] md:items-center"
            >
              <div>
                <p className="font-medium text-white">{page.labels.fr}</p>
                <p className="mt-1 text-sm text-white/42">
                  {page.href === "/" ? "/:language" : `/:language${page.href}`}
                </p>
              </div>
              {siteLocales.map((locale) => {
                const path = localizedPagePath(locale, page.href);
                const visible = isPageVisible(visibility, locale, page.href);
                const isPending = pending?.path === path;

                return (
                  <div key={locale} className="flex items-center justify-between gap-3 md:block">
                    <span className="text-xs font-medium uppercase text-white/35 md:hidden">
                      {locale === "fr" ? "Français" : "Anglais"}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        role="switch"
                        aria-checked={visible}
                        aria-label={`${page.labels[locale]} est ${visible ? "visible" : "masquée"}`}
                        disabled={!page.hideable || pending !== null}
                        onClick={() =>
                          void updateVisibility(locale, page.href, !visible)
                        }
                        className={`relative h-7 w-12 shrink-0 rounded-full border transition disabled:cursor-not-allowed disabled:opacity-55 ${
                          visible
                            ? "border-emerald-300/35 bg-emerald-400/24"
                            : "border-white/12 bg-white/6"
                        }`}
                      >
                        <span
                          className={`absolute top-1 h-4.5 w-4.5 rounded-full transition ${
                            visible
                              ? "left-6 bg-emerald-200"
                              : "left-1 bg-white/45"
                          }`}
                        />
                      </button>
                      <span className="w-14 text-xs text-white/55">
                        {isPending ? (
                          <SpinnerGap className="h-4 w-4 animate-spin" />
                        ) : visible ? (
                          "Visible"
                        ) : (
                          "Masquée"
                        )}
                      </span>
                      {page.editable ? (
                        <Link
                          href={`/admin${path}`}
                          aria-label={`Modifier ${page.labels[locale]}`}
                          className="rounded-md p-1.5 text-white/40 transition hover:bg-white/8 hover:text-white"
                        >
                          <PencilSimple className="h-4 w-4" />
                        </Link>
                      ) : null}
                      <a
                        href={`/admin-preview${path}`}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`Prévisualiser ${page.labels[locale]}`}
                        className="rounded-md p-1.5 text-white/40 transition hover:bg-white/8 hover:text-white"
                      >
                        <ArrowSquareOut className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap gap-5 text-sm text-white/42">
          <span className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-emerald-300" /> Les pages visibles sont accessibles publiquement
          </span>
          <span className="flex items-center gap-2">
            <EyeSlash className="h-4 w-4" /> Les pages masquées redirigent vers l’accueil dans la même langue
          </span>
        </div>
      </div>
    </main>
  );
}
