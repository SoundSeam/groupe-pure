import type { Metadata } from "next";
import { notFound } from "next/navigation";

import "../globals.css";
import SiteHeader from "../site-header";
import { Footer } from "@/components/site-ui";
import { getDictionary } from "@/lib/dictionaries";
import { defaultLocale, getAlternates, hasLocale, locales } from "@/lib/i18n";
import { assets, contact } from "@/lib/site-data";

export async function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;

  if (!hasLocale(lang)) {
    notFound();
  }

  const dict = await getDictionary(lang);

  return {
    metadataBase: new URL("https://groupepure.ca"),
    title: {
      default: dict.metadata.home.title,
      template: `%s | ${dict.metadata.siteName}`,
    },
    description: dict.metadata.home.description,
    alternates: {
      canonical: `/${lang}`,
      languages: {
        ...getAlternates(),
        "x-default": `/${defaultLocale}`,
      },
    },
    openGraph: {
      siteName: dict.metadata.siteName,
      title: dict.metadata.home.title,
      description: dict.metadata.home.description,
      locale: lang === "fr" ? "fr_CA" : "en_CA",
      type: "website",
    },
  };
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}>) {
  const { lang } = await params;

  if (!hasLocale(lang)) {
    notFound();
  }

  const dict = await getDictionary(lang);
  const fullSiteEnabled = process.env.FULL_SITE_ENABLED === "true";

  return (
    <html lang={lang} className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <SiteHeader
          fullSiteEnabled={fullSiteEnabled}
          lang={lang}
          logo={assets.headerLogo}
          labels={dict.header}
        />
        {children}
        <Footer
          dict={dict}
          contact={contact}
          fullSiteEnabled={fullSiteEnabled}
          lang={lang}
          logo={assets.logo}
        />
      </body>
    </html>
  );
}
