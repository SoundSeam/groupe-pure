import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  CtaBand,
  PageHero,
  SectionShell,
} from "@/components/site-ui";
import { ProjectsContent } from "@/components/projects-content";
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
  const { lang } = await params;

  if (!hasLocale(lang)) notFound();

  const dict = await getDictionary(lang);
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
        eyebrow={dict.projectsPage.eyebrow}
        title={dict.projectsPage.title}
        lead={dict.projectsPage.lead}
      />
      <SectionShell className="pt-0">
        <ProjectsContent
          pagePath={`/${lang}/projects`}
          sectionTitles={dict.services.map((service) => service.title)}
          fallbackProjects={dict.projects}
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
      />
    </main>
  );
}
