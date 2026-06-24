import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  CtaBand,
  PageHero,
  SectionShell,
  ServiceFeature,
} from "@/components/site-ui";
import { getDictionary } from "@/lib/dictionaries";
import { getAlternates, hasLocale } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;

  if (!hasLocale(lang)) notFound();

  const dict = await getDictionary(lang);

  return {
    title: dict.metadata.services.title,
    description: dict.metadata.services.description,
    alternates: {
      canonical: `/${lang}/services`,
      languages: getAlternates("/services"),
    },
  };
}

export default async function ServicesPage({
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
        eyebrow={dict.servicesPage.eyebrow}
        title={dict.servicesPage.title}
        lead={dict.servicesPage.lead}
      />
      <SectionShell className="pt-0">
        <div className="space-y-20 sm:space-y-28">
          {dict.services.map((service, index) => (
            <ServiceFeature
              key={service.key}
              service={service}
              reverse={index % 2 === 1}
            />
          ))}
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
