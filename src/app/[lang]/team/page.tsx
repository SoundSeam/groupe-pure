import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

import ContactForm from "@/components/contact-form";
import { ImageWatermark } from "@/components/image-watermark";
import {
  CtaBand,
  PageHero,
  PrimaryButton,
  SectionShell,
} from "@/components/site-ui";
import {
  getPageContentForRender,
  getSharedContentForRender,
} from "@/lib/cms/content.server";
import { cmsMedia, cmsText } from "@/lib/cms/content-values";
import {
  PAGE_HERO_CMS_KEYS,
  TEAM_CMS_KEYS,
  teamMemberCmsKeys,
} from "@/lib/cms/page-keys";
import { getDictionary } from "@/lib/dictionaries";
import { getAlternates, hasLocale } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
import {
  getRequestSiteVisibility,
  isCmsEditorPreviewRequest,
} from "@/lib/cms/page-visibility.server";

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
  const [{ lang }, editorPreview] = await Promise.all([
    params,
    isCmsEditorPreviewRequest(),
  ]);

  if (!hasLocale(lang)) notFound();

  const [dict, visibility, cmsContent, sharedCmsContent] = await Promise.all([
    getDictionary(lang),
    getRequestSiteVisibility(),
    getPageContentForRender(`/${lang}/team`, editorPreview),
    getSharedContentForRender(lang, editorPreview),
  ]);
  const members = dict.teamPage.members.map((member, index) => {
    const keys = teamMemberCmsKeys(index);
    return {
      ...member,
      name: cmsText(cmsContent, keys.name, member.name),
      title: cmsText(cmsContent, keys.title, member.title),
      media: cmsMedia(cmsContent, keys.media),
      keys,
    };
  });

  return (
    <main>
      <PageHero
        eyebrow={cmsText(
          cmsContent,
          PAGE_HERO_CMS_KEYS.eyebrow,
          dict.teamPage.eyebrow,
        )}
        title={cmsText(
          cmsContent,
          PAGE_HERO_CMS_KEYS.title,
          dict.teamPage.title,
        )}
        lead={cmsText(
          cmsContent,
          PAGE_HERO_CMS_KEYS.lead,
          dict.teamPage.lead,
        )}
        cmsTextKeys={PAGE_HERO_CMS_KEYS}
      />
      <section className="mt-10 bg-[#171a18] py-7 sm:mt-16 sm:py-8">
        <div className="mx-auto grid w-full max-w-7xl gap-5 px-6 sm:px-10 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <h2
              className="text-xl font-semibold text-white sm:text-2xl"
              data-cms-text-key={TEAM_CMS_KEYS.stripTitle}
            >
              {cmsText(
                cmsContent,
                TEAM_CMS_KEYS.stripTitle,
                dict.teamPage.careers.stripTitle,
              )}
            </h2>
            <p
              className="mt-2 max-w-2xl text-sm font-light leading-6 text-white/60 sm:text-base"
              data-cms-text-key={TEAM_CMS_KEYS.stripLead}
            >
              {cmsText(
                cmsContent,
                TEAM_CMS_KEYS.stripLead,
                dict.teamPage.careers.stripLead,
              )}
            </p>
          </div>
          <PrimaryButton compact href="#careers">
            {dict.teamPage.careers.buttonLabel}
          </PrimaryButton>
        </div>
      </section>
      <SectionShell>
        <div className="grid gap-x-5 gap-y-[3.75rem] md:grid-cols-2 lg:grid-cols-3">
          {members.map((member) => (
            <article key={member.keys.media}>
              <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
                {member.media?.type === "video" ? (
                  <video
                    src={member.media.value}
                    data-cms-media-key={member.keys.media}
                    className="h-full w-full object-cover object-top grayscale"
                    autoPlay
                    loop
                    muted
                    playsInline
                    aria-hidden="true"
                  />
                ) : (
                  <Image
                    src={member.media?.value ?? member.image}
                    alt={member.media?.alt ?? member.imageAlt}
                    fill
                    sizes="(min-width: 1024px) 30vw, (min-width: 768px) 46vw, 100vw"
                    data-cms-media-key={member.keys.media}
                    className="object-cover object-top grayscale"
                  />
                )}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/25" />
                <ImageWatermark />
              </div>
              <div className="pt-8 sm:pt-10">
                <h2
                  className="text-2xl font-semibold text-white"
                  data-cms-text-key={member.keys.name}
                >
                  {member.name}
                </h2>
                <p
                  className="mt-2 text-sm font-medium text-[#e4c58f]"
                  data-cms-text-key={member.keys.title}
                >
                  {member.title}
                </p>
              </div>
            </article>
          ))}
        </div>
      </SectionShell>
      <SectionShell className="pt-0" panel>
        <section>
          <h2
            className="text-3xl font-semibold text-white sm:text-5xl"
            data-cms-text-key={TEAM_CMS_KEYS.aboutTitle}
          >
            {cmsText(
              cmsContent,
              TEAM_CMS_KEYS.aboutTitle,
              dict.teamPage.aboutTitle,
            )}
          </h2>
          <p
            className="mt-6 text-base font-light leading-7 text-white/76 sm:text-lg sm:leading-8"
            data-cms-text-key={TEAM_CMS_KEYS.aboutBody}
          >
            {cmsText(
              cmsContent,
              TEAM_CMS_KEYS.aboutBody,
              dict.teamPage.aboutBody,
            )}
          </p>
        </section>
      </SectionShell>
      <SectionShell className="pt-8 sm:pt-12">
        <section aria-labelledby="careers-title">
          <div
            id="careers"
            className="grid scroll-mt-24 gap-12 lg:grid-cols-[0.78fr_1.22fr] lg:gap-20"
          >
            <div>
              <p
                className="text-sm font-medium text-[#e4c58f]"
                data-cms-text-key={TEAM_CMS_KEYS.careersEyebrow}
              >
                {cmsText(
                  cmsContent,
                  TEAM_CMS_KEYS.careersEyebrow,
                  dict.teamPage.careers.eyebrow,
                )}
              </p>
              <h2
                id="careers-title"
                className="mt-4 text-3xl font-semibold text-white sm:text-5xl sm:leading-[1.08]"
                data-cms-text-key={TEAM_CMS_KEYS.careersTitle}
              >
                {cmsText(
                  cmsContent,
                  TEAM_CMS_KEYS.careersTitle,
                  dict.teamPage.careers.title,
                )}
              </h2>
              <p
                className="mt-6 max-w-xl text-base font-light leading-7 text-white/70 sm:text-lg sm:leading-8"
                data-cms-text-key={TEAM_CMS_KEYS.careersLead}
              >
                {cmsText(
                  cmsContent,
                  TEAM_CMS_KEYS.careersLead,
                  dict.teamPage.careers.lead,
                )}
              </p>
            </div>
            <div>
              <ContactForm
                alignSubmitRight
                labels={dict.teamPage.applicationForm}
                locale={lang}
                submissionType="application"
              />
            </div>
          </div>
        </section>
      </SectionShell>
      <CtaBand
        lang={lang as Locale}
        title={dict.servicesPage.ctaTitle}
        lead={dict.servicesPage.ctaLead}
        buttonLabel={dict.common.startProject}
        contactVisible={visibility[lang].includes("/contact")}
        cmsContent={sharedCmsContent}
      />
    </main>
  );
}
