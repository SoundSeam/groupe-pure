import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

import ContactForm from "@/components/contact-form";
import { ImageWatermark } from "@/components/image-watermark";
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
      <SectionShell className="pt-4 sm:pt-8">
        <section
          aria-labelledby="careers-title"
          className="overflow-hidden rounded-2xl border border-white/10 bg-[#171a18]"
        >
          <div className="grid lg:grid-cols-[0.78fr_1.22fr]">
            <div className="flex flex-col justify-between border-b border-white/10 p-7 sm:p-10 lg:border-r lg:border-b-0 lg:p-12">
              <div>
                <p className="text-sm font-medium text-[#e4c58f]">
                  {dict.teamPage.careers.eyebrow}
                </p>
                <h2
                  id="careers-title"
                  className="mt-4 text-3xl font-semibold text-white sm:text-5xl sm:leading-[1.08]"
                >
                  {dict.teamPage.careers.title}
                </h2>
                <p className="mt-6 max-w-xl text-base font-light leading-7 text-white/70 sm:text-lg sm:leading-8">
                  {dict.teamPage.careers.lead}
                </p>
              </div>
              <ul className="mt-10 grid gap-3 border-t border-white/10 pt-7 text-sm text-white/65 sm:grid-cols-3 lg:grid-cols-1">
                {dict.teamPage.careers.highlights.map((highlight) => (
                  <li key={highlight} className="flex items-center gap-3">
                    <span
                      aria-hidden="true"
                      className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#e4c58f]"
                    />
                    {highlight}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-[#101211]/45 p-7 sm:p-10 lg:p-12">
              <div className="mb-7">
                <h3 className="text-xl font-semibold text-white sm:text-2xl">
                  {dict.teamPage.careers.formTitle}
                </h3>
                <p className="mt-2 text-sm leading-6 text-white/55">
                  {dict.teamPage.careers.formNote}
                </p>
              </div>
              <ContactForm
                labels={dict.teamPage.applicationForm}
                locale={lang}
                submissionType="application"
              />
            </div>
          </div>
        </section>
      </SectionShell>
      <SectionShell className="pt-8 sm:pt-12">
        <div className="grid gap-x-5 gap-y-[3.75rem] md:grid-cols-2 lg:grid-cols-3">
          {dict.teamPage.members.map((member, index) => (
            <article key={member.name}>
              <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
                <Image
                  src={member.image}
                  alt={member.imageAlt}
                  fill
                  sizes="(min-width: 1024px) 30vw, (min-width: 768px) 46vw, 100vw"
                  data-cms-media-key={`media:team:${index}`}
                  className="object-cover object-top grayscale"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/25" />
                <ImageWatermark />
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
