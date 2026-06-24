import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

import { CtaBand, PageHero, SectionShell } from "@/components/site-ui";
import { getDictionary } from "@/lib/dictionaries";
import { getAlternates, hasLocale } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
import { assets, contact } from "@/lib/site-data";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;

  if (!hasLocale(lang)) notFound();

  const dict = await getDictionary(lang);

  return {
    title: dict.metadata.about.title,
    description: dict.metadata.about.description,
    alternates: {
      canonical: `/${lang}/about`,
      languages: getAlternates("/about"),
    },
  };
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  if (!hasLocale(lang)) notFound();

  const dict = await getDictionary(lang);

  return (
    <main>
      <PageHero
        eyebrow={dict.aboutPage.eyebrow}
        title={dict.aboutPage.title}
        lead={dict.aboutPage.lead}
      />
      <SectionShell className="pt-0">
        <div className="grid gap-5 lg:grid-cols-3">
          {dict.aboutPage.sections.map((section) => (
            <article key={section.title} className="rounded-xl bg-[#171a18] p-6 sm:p-8">
              <h2 className="text-2xl font-semibold text-white">
                {section.title}
              </h2>
              <p className="mt-5 text-base font-light leading-7 text-white/70 sm:text-lg">
                {section.body}
              </p>
            </article>
          ))}
        </div>
      </SectionShell>
      <SectionShell panel>
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <div>
            <h2 className="text-3xl font-semibold text-white sm:text-5xl">
              {dict.aboutPage.sectorsTitle}
            </h2>
            <div className="mt-8 flex flex-wrap gap-3">
              {dict.aboutPage.sectors.map((sector) => (
                <span
                  key={sector}
                  className="rounded-xl bg-white px-5 py-3 text-sm font-medium text-[#101211]"
                >
                  {sector}
                </span>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-6 rounded-xl bg-[#101211] p-6 sm:p-8">
            <div className="relative h-10 w-32">
              <Image
                src={assets.apchqLogo}
                alt={dict.common.apchqAlt}
                fill
                sizes="128px"
                className="object-contain"
              />
            </div>
            <p className="text-sm font-semibold leading-none text-white/70">
              {contact.rbq}
            </p>
          </div>
        </div>
      </SectionShell>
      <CtaBand
        lang={lang as Locale}
        title={dict.servicesPage.ctaTitle}
        lead={dict.servicesPage.ctaLead}
        buttonLabel={dict.common.startProject}
      />
    </main>
  );
}
