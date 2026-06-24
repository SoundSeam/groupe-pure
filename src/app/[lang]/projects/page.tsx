import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  CtaBand,
  PageHero,
  ProjectCard,
  SectionShell,
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

  return (
    <main>
      <PageHero
        eyebrow={dict.projectsPage.eyebrow}
        title={dict.projectsPage.title}
        lead={dict.projectsPage.lead}
      />
      <SectionShell className="pt-0">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {dict.projects.map((project) => (
            <ProjectCard key={project.title} project={project} />
          ))}
        </div>
        <p className="mt-10 max-w-3xl text-base font-light leading-7 text-white/60">
          {dict.projectsPage.note}
        </p>
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
