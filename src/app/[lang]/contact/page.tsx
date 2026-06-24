import type { Metadata } from "next";
import { notFound } from "next/navigation";

import ContactForm from "@/components/contact-form";
import { PageHero, SectionShell } from "@/components/site-ui";
import { getDictionary } from "@/lib/dictionaries";
import { getAlternates, hasLocale } from "@/lib/i18n";
import { contact } from "@/lib/site-data";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;

  if (!hasLocale(lang)) notFound();

  const dict = await getDictionary(lang);

  return {
    title: dict.metadata.contact.title,
    description: dict.metadata.contact.description,
    alternates: {
      canonical: `/${lang}/contact`,
      languages: getAlternates("/contact"),
    },
  };
}

export default async function ContactPage({
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
        eyebrow={dict.contactPage.eyebrow}
        title={dict.contactPage.title}
        lead={dict.contactPage.lead}
      />
      <SectionShell className="pt-0">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <aside className="rounded-xl bg-[#171a18] p-6 sm:p-8">
            <h2 className="text-2xl font-semibold text-white">
              {dict.contactPage.directTitle}
            </h2>
            <div className="mt-8 flex flex-col gap-3 text-base text-white/78">
              <a href={contact.phoneHref}>{contact.phoneLabel}</a>
              <a href={`mailto:${contact.email}`}>{contact.email}</a>
              <p className="max-w-xs leading-7">{contact.address}</p>
            </div>
          </aside>
          <section>
            <h2 className="mb-8 text-2xl font-semibold text-white">
              {dict.contactPage.formTitle}
            </h2>
            <ContactForm labels={dict.form} recipient={contact.email} />
          </section>
        </div>
      </SectionShell>
    </main>
  );
}
