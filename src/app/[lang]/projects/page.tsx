import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  CtaBand,
  PageHero,
  SectionShell,
} from "@/components/site-ui";
import { ProjectsContent } from "@/components/projects-content";
import {
  getPageContentForRender,
  getSharedContentForRender,
} from "@/lib/cms/content.server";
import { cmsText } from "@/lib/cms/content-values";
import { PAGE_HERO_CMS_KEYS } from "@/lib/cms/page-keys";
import { parseProjects, PROJECTS_CONTENT_KEY } from "@/lib/cms/projects";
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
    title: dict.metadata.projects.title,
    description: dict.metadata.projects.description,
    alternates: {
      canonical: `/${lang}/projects`,
      languages: getAlternates("/projects"),
    },
  };
}

export default async function ProjectsPage({
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
    getPageContentForRender(`/${lang}/projects`, editorPreview),
    getSharedContentForRender(lang, editorPreview),
  ]);
  const projects = parseProjects(
    cmsContent[PROJECTS_CONTENT_KEY],
    dict.projects,
  );
  const carouselLabels =
    lang === "fr"
      ? {
          previous: "Image précédente",
          next: "Image suivante",
          image: "Image",
        }
      : {
          previous: "Previous image",
          next: "Next image",
          image: "Image",
        };
  return (
    <main>
      <PageHero
        eyebrow={cmsText(
          cmsContent,
          PAGE_HERO_CMS_KEYS.eyebrow,
          dict.projectsPage.eyebrow,
        )}
        title={cmsText(
          cmsContent,
          PAGE_HERO_CMS_KEYS.title,
          dict.projectsPage.title,
        )}
        lead={cmsText(
          cmsContent,
          PAGE_HERO_CMS_KEYS.lead,
          dict.projectsPage.lead,
        )}
        cmsTextKeys={PAGE_HERO_CMS_KEYS}
      />
      <SectionShell className="pt-0">
        <ProjectsContent
          pagePath={`/${lang}/projects`}
          sectionTitles={dict.services.map((service) => service.title)}
          fallbackProjects={projects}
          previousLabel={carouselLabels.previous}
          nextLabel={carouselLabels.next}
          imageLabel={carouselLabels.image}
        />
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
