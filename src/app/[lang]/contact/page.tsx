import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

import ContactForm from "@/components/contact-form";
import { PageHero, SectionShell } from "@/components/site-ui";
import { getPageContentForRender } from "@/lib/cms/content.server";
import { cmsMedia, cmsText } from "@/lib/cms/content-values";
import { CONTACT_CMS_KEYS, PAGE_HERO_CMS_KEYS } from "@/lib/cms/page-keys";
import { getDictionary } from "@/lib/dictionaries";
import { getAlternates, hasLocale } from "@/lib/i18n";
import { assets, contact } from "@/lib/site-data";
import { isCmsEditorPreviewRequest } from "@/lib/cms/page-visibility.server";

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
  const [{ lang }, editorPreview] = await Promise.all([
    params,
    isCmsEditorPreviewRequest(),
  ]);

  if (!hasLocale(lang)) notFound();

  const [dict, cmsContent] = await Promise.all([
    getDictionary(lang),
    getPageContentForRender(`/${lang}/contact`, editorPreview),
  ]);
  const buildingMedia = cmsMedia(cmsContent, CONTACT_CMS_KEYS.building);
  const directPhone = cmsText(
    cmsContent,
    CONTACT_CMS_KEYS.phone,
    contact.phoneLabel,
  );
  const directEmail = cmsText(
    cmsContent,
    CONTACT_CMS_KEYS.email,
    contact.email,
  );

  return (
    <main>
      <PageHero
        eyebrow={cmsText(
          cmsContent,
          PAGE_HERO_CMS_KEYS.eyebrow,
          dict.contactPage.eyebrow,
        )}
        title={cmsText(
          cmsContent,
          PAGE_HERO_CMS_KEYS.title,
          dict.contactPage.title,
        )}
        lead={cmsText(
          cmsContent,
          PAGE_HERO_CMS_KEYS.lead,
          dict.contactPage.lead,
        )}
        cmsTextKeys={PAGE_HERO_CMS_KEYS}
      />
      <SectionShell className="pt-0">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-y-0">
          <div className="lg:col-start-1 lg:row-start-1">
            {buildingMedia?.type === "video" ? (
              <video
                src={buildingMedia.value}
                data-cms-media-key={CONTACT_CMS_KEYS.building}
                className="aspect-[4/3] h-auto w-full rounded-xl object-cover"
                autoPlay
                loop
                muted
                playsInline
                aria-hidden="true"
              />
            ) : (
              <Image
                src={buildingMedia?.value ?? assets.contactBuilding}
                alt={buildingMedia?.alt ?? dict.contactPage.buildingAlt}
                width={1359}
                height={1020}
                sizes="(min-width: 1024px) 32vw, 100vw"
                data-cms-media-key={CONTACT_CMS_KEYS.building}
                className="h-auto w-full rounded-xl"
              />
            )}
          </div>
          <aside className="-mt-2 lg:col-start-1 lg:row-start-2 lg:-mt-[194px]">
            <h2
              className="text-2xl font-semibold text-white"
              data-cms-text-key={CONTACT_CMS_KEYS.directTitle}
            >
              {cmsText(
                cmsContent,
                CONTACT_CMS_KEYS.directTitle,
                dict.contactPage.directTitle,
              )}
            </h2>
            <div className="mt-4 flex flex-col gap-3 text-base text-white/78">
              <a
                href={contact.phoneHref}
                data-cms-text-key={CONTACT_CMS_KEYS.phone}
              >
                {directPhone}
              </a>
              <a
                href={`mailto:${directEmail}`}
                data-cms-text-key={CONTACT_CMS_KEYS.email}
              >
                {directEmail}
              </a>
              <p
                className="max-w-xs leading-7"
                data-cms-text-key={CONTACT_CMS_KEYS.address}
              >
                {cmsText(
                  cmsContent,
                  CONTACT_CMS_KEYS.address,
                  contact.address,
                )}
              </p>
            </div>
          </aside>
          <section className="lg:col-start-2 lg:row-start-1">
            <ContactForm
              alignSubmitRight
              labels={dict.form}
              locale={lang}
            />
          </section>
        </div>
      </SectionShell>
    </main>
  );
}
