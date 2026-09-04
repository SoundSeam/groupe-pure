import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  CtaBand,
  PageHero,
  SectionShell,
  ServiceFeature,
} from "@/components/site-ui";
import {
  getPageContentForRender,
  getSharedContentForRender,
} from "@/lib/cms/content.server";
import { cmsMedia, cmsText } from "@/lib/cms/content-values";
import {
  serviceCmsKeys,
  SERVICES_HERO_CMS_KEYS,
} from "@/lib/cms/page-keys";
import { parseServiceExamples, serviceExamplesKey } from "@/lib/cms/services";
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
  const [{ lang }, editorPreview] = await Promise.all([
    params,
    isCmsEditorPreviewRequest(),
  ]);

  if (!hasLocale(lang)) notFound();

  const [dict, visibility, cmsContent, sharedCmsContent] = await Promise.all([
    getDictionary(lang),
    getRequestSiteVisibility(),
    getPageContentForRender(`/${lang}/services`, editorPreview),
    getSharedContentForRender(lang, editorPreview),
  ]);
  const services = dict.services.map((service) => {
    const keys = serviceCmsKeys(service.key);
    const media = cmsMedia(cmsContent, keys.media);
    const resolved = {
      ...service,
      video: undefined,
      title: cmsText(cmsContent, keys.title, service.title),
      lead: cmsText(cmsContent, keys.lead, service.lead),
      examples: parseServiceExamples(
        cmsContent[serviceExamplesKey(service.key)],
        service.examples,
      ),
    };

    if (media?.type === "video") {
      return { ...resolved, video: media.value };
    }
    if (media?.type === "image") {
      return {
        ...resolved,
        image: media.value,
        imageAlt: media.alt ?? service.imageAlt,
        video: undefined,
      };
    }
    return resolved;
  });

  return (
    <main>
      <PageHero
        eyebrow={cmsText(
          cmsContent,
          SERVICES_HERO_CMS_KEYS.eyebrow,
          dict.servicesPage.eyebrow,
        )}
        title={cmsText(
          cmsContent,
          SERVICES_HERO_CMS_KEYS.title,
          dict.servicesPage.title,
        )}
        lead={cmsText(
          cmsContent,
          SERVICES_HERO_CMS_KEYS.lead,
          dict.servicesPage.lead,
        )}
        cmsScope="services:hero"
        cmsTextKeys={SERVICES_HERO_CMS_KEYS}
      />
      <SectionShell className="pt-0">
        <div className="space-y-28 sm:space-y-40">
          {services.map((service, index) => (
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
        contactVisible={visibility[lang].includes("/contact")}
        cmsContent={sharedCmsContent}
      />
    </main>
  );
}
