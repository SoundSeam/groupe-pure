import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  CtaBand,
  PageHero,
  SectionShell,
} from "@/components/site-ui";
import { ProjectCarousel } from "@/components/project-carousel";
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
  const projectSections = [
    {
      title: dict.services[0].title,
      images: [
        dict.projects[1],
        dict.projects[2],
        dict.projects[3],
        dict.projects[4],
        dict.projects[5],
        dict.projects[0],
      ],
    },
    {
      title: dict.services[1].title,
      images: [
        dict.projects[0],
        dict.projects[3],
        dict.projects[4],
        dict.projects[1],
        dict.projects[2],
        dict.projects[5],
      ],
    },
    {
      title: dict.services[2].title,
      images: [
        dict.projects[0],
        dict.projects[4],
        dict.projects[5],
        dict.projects[3],
        dict.projects[1],
        dict.projects[2],
      ],
    },
  ];

  return (
    <main>
      <PageHero
        eyebrow={dict.projectsPage.eyebrow}
        title={dict.projectsPage.title}
        lead={dict.projectsPage.lead}
      />
      <SectionShell className="pt-0">
        <div className="space-y-20 sm:space-y-28">
          {projectSections.map((section) => (
            <ProjectCarousel
              key={section.title}
              title={section.title}
              images={section.images}
              previousLabel={carouselLabels.previous}
              nextLabel={carouselLabels.next}
              imageLabel={carouselLabels.image}
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
