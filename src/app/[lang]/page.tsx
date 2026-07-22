import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

import ContactForm from "@/components/contact-form";
import { StarIcon } from "@/components/icons";
import {
  Eyebrow,
  PrimaryButton,
  ProjectCard,
  SectionShell,
  ServiceCard,
} from "@/components/site-ui";
import { getDictionary } from "@/lib/dictionaries";
import { getAlternates, getLocalizedPath, hasLocale } from "@/lib/i18n";
import { assets, contact, partnerLogos } from "@/lib/site-data";
import type { Locale } from "@/lib/i18n";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;

  if (!hasLocale(lang)) {
    notFound();
  }

  const dict = await getDictionary(lang);

  return {
    title: {
      absolute: dict.metadata.home.title,
    },
    description: dict.metadata.home.description,
    alternates: {
      canonical: `/${lang}`,
      languages: getAlternates(),
    },
  };
}

export default async function Home({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  if (!hasLocale(lang)) {
    notFound();
  }

  const dict = await getDictionary(lang);
  const locale = lang as Locale;
  const homeFormLabels = {
    ...dict.form,
    submit: dict.home.contactButton,
  };

  return (
    <main>
      <section className="relative flex min-h-[calc(100vh-4rem)] flex-col justify-end overflow-hidden rounded-b-[3rem] pb-16 text-left sm:pb-20">
        <video
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          loop
          muted
          playsInline
          aria-hidden="true"
        >
          <source src={assets.heroVideo} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-[#101211]/70" />
        <div className="relative z-10 mx-auto flex w-full max-w-7xl items-end gap-8 px-6 sm:px-10">
          <div className="flex max-w-4xl flex-col items-start">
            <h1 className="text-4xl font-semibold text-white [text-shadow:0_3px_24px_rgba(0,0,0,0.55)] sm:text-6xl">
              {dict.home.heroTitle}
            </h1>
            <p className="mt-6 max-w-xl text-lg font-light leading-8 text-white/70 [text-shadow:0_2px_18px_rgba(0,0,0,0.5)] sm:text-xl">
              {dict.home.heroLead}
            </p>
            <div className="mt-10">
              <PrimaryButton href={getLocalizedPath(locale, "/contact")}>
                {dict.common.startProject}
              </PrimaryButton>
            </div>
          </div>
        </div>
      </section>

      <div className="py-10 sm:py-12">
        <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-x-8 gap-y-8 px-6 sm:grid-cols-2 sm:px-10 sm:[&>*:last-child]:col-span-2 lg:grid-cols-5 lg:gap-x-6 lg:[&>*:last-child]:col-span-1">
          {partnerLogos.map((logo, index) => (
            <div
              key={logo.src}
              className="flex h-[68px] min-w-0 items-center justify-center"
            >
              <Image
                src={logo.src}
                alt={logo.alt}
                width={logo.width}
                height={logo.height}
                sizes="(min-width: 1024px) 240px, (min-width: 640px) 260px, 280px"
                className={`${index === 0 ? "h-[68px]" : "h-10"} w-auto max-w-full object-contain`}
              />
            </div>
          ))}
        </div>
      </div>

      <SectionShell>
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <h2 className="max-w-3xl text-3xl font-semibold text-white sm:text-5xl">
            {dict.home.servicesTitle}
          </h2>
          <div className="flex w-full items-center justify-between gap-3 text-left lg:w-auto lg:justify-end lg:text-right">
            <div className="inline-flex items-center justify-start gap-2.5 bg-[#171a18] px-5 py-3">
              <div className="flex items-baseline gap-1 text-sm leading-none text-white">
                <span className="font-semibold">5.0</span>
                <span className="font-normal text-white/65">
                  {dict.home.ratingCount}
                </span>
              </div>
              <div className="flex items-center justify-center gap-1.5 text-[#fcac0a]">
                <StarIcon />
                <StarIcon />
                <StarIcon />
                <StarIcon />
                <StarIcon />
              </div>
            </div>
            <div className="relative h-5 w-20 shrink-0">
              <Image
                src={assets.googleLogo}
                alt={dict.common.googleAlt}
                fill
                sizes="80px"
                className="object-contain object-right"
              />
            </div>
          </div>
        </div>

        <div className="mt-14 grid gap-5 sm:mt-20 lg:grid-cols-3">
          {dict.services.map((service) => (
            <ServiceCard key={service.key} service={service} />
          ))}
        </div>
      </SectionShell>

      <SectionShell panel>
        <div className="grid gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-end">
          <div>
            <h2 className="max-w-4xl text-3xl font-semibold text-white sm:text-5xl">
              {dict.home.technicalTitle}
            </h2>
            <p className="mt-6 max-w-3xl text-lg font-light leading-8 text-white/70 sm:text-xl">
              {dict.home.technicalBody}
            </p>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-[#101211]">
            <Image
              src={dict.services[2].image}
              alt={dict.services[2].imageAlt}
              fill
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/5 to-black/45" />
          </div>
        </div>

        <div className="mt-12 grid gap-5 sm:mt-16 md:grid-cols-2 xl:grid-cols-4">
          {dict.home.technicalCategories.map((category) => (
            <article
              key={category.title}
              className="rounded-xl bg-[#101211] p-6"
            >
              <h3 className="text-xl font-semibold text-white">
                {category.title}
              </h3>
              <p className="mt-4 text-base font-light leading-7 text-white/65">
                {category.body}
              </p>
            </article>
          ))}
        </div>
      </SectionShell>

      <SectionShell>
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <h2 className="max-w-3xl text-3xl font-semibold text-white sm:text-5xl">
            {dict.home.processTitle}
          </h2>
          <div className="grid gap-5 md:grid-cols-2">
            {dict.home.processSteps.map((step, index) => (
              <article
                key={step.title}
                className="border-t border-white/12 pt-6"
              >
                <p className="text-sm font-medium text-white/40">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-8 text-2xl font-semibold text-white">
                  {step.title}
                </h3>
                <p className="mt-4 text-base font-light leading-7 text-white/68">
                  {step.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </SectionShell>

      <SectionShell panel>
        <div className="grid gap-5 lg:grid-cols-3">
          <div>
            <Eyebrow>{dict.home.aboutEyebrow}</Eyebrow>
          </div>
          <div className="lg:col-span-2">
            <h2 className="text-3xl font-semibold text-white sm:text-5xl">
              {dict.home.aboutTitle}
            </h2>
            <div className="mt-8 space-y-5 text-lg font-light leading-8 text-white/70 sm:text-xl">
              {dict.home.aboutBody.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 grid gap-5 sm:mt-16 md:grid-cols-2 xl:grid-cols-3">
          {dict.projects.slice(0, 6).map((project) => (
            <ProjectCard key={project.title} project={project} compact />
          ))}
        </div>

        <div className="mt-10 flex justify-center sm:mt-12">
          <PrimaryButton href={getLocalizedPath(locale, "/projects")}>
            {dict.common.viewWork}
          </PrimaryButton>
        </div>
      </SectionShell>

      <SectionShell>
        <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-stretch">
          <div className="flex flex-col justify-between">
            <div>
              <h2 className="max-w-4xl text-3xl font-semibold text-white sm:text-5xl">
                {dict.home.territoryTitle}
              </h2>
              <p className="mt-6 max-w-3xl text-lg font-light leading-8 text-white/70 sm:text-xl">
                {dict.home.territoryBody}
              </p>
            </div>
            <p className="mt-10 border-t border-white/12 pt-6 text-base font-light leading-8 text-white/62 sm:text-lg">
              {dict.home.territoryRegions}
            </p>
          </div>
          <div className="relative min-h-[18rem] overflow-hidden rounded-xl bg-[#171a18]">
            <Image
              src={dict.projects[0].image}
              alt={dict.projects[0].imageAlt}
              fill
              sizes="(min-width: 1024px) 40vw, 100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-[#101211]/45" />
          </div>
        </div>
      </SectionShell>

      <SectionShell panel>
        <div className="grid gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
          <div>
            <h2 className="max-w-4xl text-3xl font-semibold text-white sm:text-5xl">
              {dict.home.credibilityTitle}
            </h2>
            <p className="mt-6 max-w-3xl text-lg font-light leading-8 text-white/70 sm:text-xl">
              {dict.home.credibilityBody}
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            {dict.home.credibilityItems.map((item) => (
              <div key={item} className="rounded-xl bg-[#101211] p-6">
                <p className="text-base font-medium text-white">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </SectionShell>

      <SectionShell>
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <p className="text-sm font-medium text-white/60">
              {dict.common.contact}
            </p>
            <h2 className="mt-4 max-w-3xl text-3xl font-semibold text-white sm:text-5xl">
              {dict.home.contactTitle}
            </h2>
            <p className="mt-6 max-w-2xl text-lg font-light leading-8 text-white/70 sm:text-xl">
              {dict.home.contactLead}
            </p>
          </div>
          <ContactForm labels={homeFormLabels} recipient={contact.email} />
        </div>
      </SectionShell>
    </main>
  );
}
