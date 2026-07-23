import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

import { CtaBand, PageHero, SectionShell } from "@/components/site-ui";
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
    title: dict.metadata.team.title,
    description: dict.metadata.team.description,
    alternates: {
      canonical: `/${lang}/team`,
      languages: getAlternates("/team"),
    },
  };
}

export default async function TeamPage({
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
        eyebrow={dict.teamPage.eyebrow}
        title={dict.teamPage.title}
        lead={dict.teamPage.lead}
      />
      <SectionShell className="pt-0">
        <div className="grid gap-x-5 gap-y-[3.75rem] md:grid-cols-2 lg:grid-cols-3">
          {dict.teamPage.members.map((member) => (
            <article key={member.name}>
              <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
                <Image
                  src={member.image}
                  alt={member.imageAlt}
                  fill
                  sizes="(min-width: 1024px) 30vw, (min-width: 768px) 46vw, 100vw"
                  className="object-cover object-top grayscale"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/25" />
              </div>
              <div className="pt-8 sm:pt-10">
                <h2 className="text-2xl font-semibold text-white">
                  {member.name}
                </h2>
                <p className="mt-2 text-sm font-medium text-[#e4c58f]">
                  {member.title}
                </p>
              </div>
            </article>
          ))}
        </div>
        <div className="mt-40 pt-10 sm:mt-56 sm:pt-12 lg:grid lg:grid-cols-3 lg:gap-5">
          <h2 className="text-3xl font-semibold text-white sm:text-5xl">
            {dict.teamPage.aboutTitle}
          </h2>
          <p className="mt-5 text-base font-light leading-7 text-white/76 sm:text-lg sm:leading-8 lg:col-span-2 lg:mt-0">
            {dict.teamPage.aboutBody}
          </p>
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
