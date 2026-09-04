import Image from "next/image";
import Link from "next/link";
import { FaFacebookF, FaInstagram } from "react-icons/fa";

import { ServiceIcon } from "./icons";
import { ImageWatermark } from "./image-watermark";
import type { Locale } from "@/lib/i18n";
import { getLocalizedPath } from "@/lib/i18n";
import type { Dictionary, Project, Service } from "@/lib/dictionaries";
import { cmsImage, cmsText } from "@/lib/cms/content-values";
import { SHARED_CTA_CMS_KEYS } from "@/lib/cms/page-keys";
import { serviceExamplesKey } from "@/lib/cms/services";
import type { CmsContent } from "@/lib/cms/types";
import { fieldClass } from "./styles";

export { fieldClass };

export function SectionShell({
  children,
  className = "",
  panel = false,
}: {
  children: React.ReactNode;
  className?: string;
  panel?: boolean;
}) {
  return (
    <section className={`bg-[#101211] py-20 sm:py-28 ${className}`}>
      <div className="mx-auto w-full max-w-7xl px-6 sm:px-10">
        {panel ? (
          <div className="relative">
            <div className="absolute top-0 bottom-0 left-1/2 w-screen -translate-x-1/2 bg-[#171a18]" />
            <div className="relative py-12 sm:py-16">{children}</div>
          </div>
        ) : (
          children
        )}
      </div>
    </section>
  );
}

export function PageHero({
  eyebrow,
  title,
  lead,
  cmsScope,
  cmsTextKeys,
}: {
  eyebrow: string;
  title: string;
  lead: string;
  cmsScope?: string;
  cmsTextKeys?: { eyebrow: string; title: string; lead: string };
}) {
  return (
    <section
      className="bg-[#101211] pt-20 pb-7 sm:pt-28 sm:pb-10"
      data-cms-scope={cmsScope}
    >
      <div className="mx-auto w-full max-w-7xl px-6 sm:px-10">
        <p
          className="text-sm font-medium text-white/60"
          data-cms-text-key={cmsTextKeys?.eyebrow}
        >
          {eyebrow}
        </p>
        <h1
          className="mt-4 max-w-5xl text-4xl font-semibold text-white sm:text-6xl"
          data-cms-text-key={cmsTextKeys?.title}
        >
          {title}
        </h1>
        <p
          className="mt-6 max-w-3xl text-lg font-light leading-8 text-white/70 sm:text-xl"
          data-cms-text-key={cmsTextKeys?.lead}
        >
          {lead}
        </p>
      </div>
    </section>
  );
}

export function PrimaryButton({
  href,
  children,
  compact = false,
  cmsTextKey,
}: {
  href: string;
  children: React.ReactNode;
  compact?: boolean;
  cmsTextKey?: string;
}) {
  return (
    <Link
      href={href}
      data-cms-text-key={cmsTextKey}
      className={`inline-flex rounded-xl bg-[#e4c58f] font-medium text-[#101211] transition hover:bg-[#e4c58f]/90 ${
        compact ? "px-6 py-3 text-base" : "px-9 py-4 text-lg"
      }`}
    >
      {children}
    </Link>
  );
}

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-block rounded-lg bg-white/10 px-3 py-2 text-xs font-semibold uppercase text-white">
      {children}
    </div>
  );
}

export function ServiceCard({
  service,
  cmsTextKeys,
}: {
  service: Service;
  cmsTextKeys?: { title: string; lead: string };
}) {
  return (
    <article className="flex flex-col">
      <div className="relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-xl bg-[#171a18]">
        {service.video ? (
          <>
            <video
              className={`h-full w-full object-cover ${
                service.key === "construction"
                  ? "object-[center_40%]"
                  : ""
              }`}
              data-cms-media-key={`media:home:service:${service.key}`}
              src={service.video}
              poster={service.image}
              autoPlay
              loop
              muted
              playsInline
              aria-hidden="true"
            />
            <ImageWatermark />
          </>
        ) : (
          <ServiceIcon service={service.key} />
        )}
      </div>
      <div className="mt-8">
        <h3
          className="text-xl font-semibold text-white sm:text-3xl"
          data-cms-text-key={cmsTextKeys?.title}
        >
          {service.title}
        </h3>
        <p
          className="mt-2 text-base font-light leading-7 text-white/70 sm:text-lg"
          data-cms-text-key={cmsTextKeys?.lead}
        >
          {service.lead}
        </p>
      </div>
    </article>
  );
}

export function ServiceFeature({ service, reverse = false }: { service: Service; reverse?: boolean }) {
  return (
    <article
      data-cms-scope={`services:${service.key}`}
      className={`grid gap-16 lg:grid-cols-2 lg:items-start ${
        reverse ? "lg:[&>div:first-child]:order-2" : ""
      }`}
    >
      <div className="relative aspect-video overflow-hidden rounded-xl bg-[#171a18]">
        {service.video ? (
          <video
            src={service.video}
            data-cms-media-key={`media:services:${service.key}`}
            className="h-full w-full object-cover"
            autoPlay
            loop
            muted
            playsInline
            aria-hidden="true"
          />
        ) : (
          <Image
            src={service.image}
            alt={service.imageAlt}
            fill
            sizes="(min-width: 1024px) 45vw, 100vw"
            data-cms-media-key={`media:services:${service.key}`}
            className={`object-cover ${
              service.key === "construction" || service.key === "excavation"
                ? "object-[center_40%]"
                : ""
            }`}
          />
        )}
        <div className="pointer-events-none absolute inset-0 bg-black/20" />
        <ImageWatermark />
      </div>
      <div>
        <h2 className="text-3xl font-semibold text-white sm:text-5xl">
          {service.title}
        </h2>
        <p className="mt-5 text-lg font-light leading-8 text-white/70 sm:text-xl">
          {service.lead}
        </p>
        <ul
          className="mt-6 grid grid-cols-2 gap-x-6 gap-y-2"
          data-cms-list-key={serviceExamplesKey(service.key)}
        >
          {service.examples.map((example) => (
            <li
              key={example}
              data-cms-list-item
              className="flex items-start gap-2 text-sm font-light leading-6 text-white/68"
            >
              <span aria-hidden="true" className="text-[#e4c58f]">
                •
              </span>
              <span data-cms-list-text>{example}</span>
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}

export function ProjectCard({
  project,
  compact = false,
}: {
  project: Project;
  compact?: boolean;
}) {
  return (
    <article className="group relative overflow-hidden rounded-xl bg-[#171a18]">
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={project.image}
          alt={project.imageAlt}
          fill
          sizes="(min-width: 1280px) 30vw, (min-width: 768px) 45vw, 100vw"
          className="object-cover transition duration-500 group-hover:scale-[1.03]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/10 to-black/45" />
        <ImageWatermark />
        <div className="absolute left-5 top-5">
          <h3 className="text-sm font-semibold uppercase text-white [text-shadow:0_1px_6px_rgba(0,0,0,0.6)] sm:text-base">
            {project.title}
          </h3>
        </div>
      </div>
      {!compact ? (
        <div className="p-5">
          <p className="text-sm font-medium uppercase text-white/50">
            {project.type} · {project.location}
          </p>
          <p className="mt-3 text-base font-light leading-7 text-white/70">
            {project.summary}
          </p>
        </div>
      ) : null}
    </article>
  );
}

export function Footer({
  cmsContent = {},
  dict,
  contact,
  lang,
  logo,
  visibleHrefs,
}: {
  cmsContent?: CmsContent;
  dict: Dictionary;
  contact: {
    phoneLabel: string;
    phoneHref: string;
    email: string;
    address: string;
  };
  lang: Locale;
  logo: string;
  visibleHrefs: readonly string[];
}) {
  const currentYear = new Date().getFullYear();
  const footerKeys = {
    architecture: "shared:footer:text:div:1/div:1/div:1/div:2/p:1:0",
    construction: "shared:footer:text:div:1/div:1/div:1/div:2/p:2:0",
    excavation: "shared:footer:text:div:1/div:1/div:1/div:2/p:3:0",
    privacy: "shared:footer:text:div:1/div:1/nav:1/a:1:0",
    terms: "shared:footer:text:div:1/div:1/nav:1/a:2:0",
    contact: "shared:footer:text:div:1/div:2/h2:1:0",
    phone: "shared:footer:text:div:1/div:2/div:1/a:1:0",
    email: "shared:footer:text:div:1/div:2/div:1/a:2:0",
    address: "shared:footer:text:div:1/div:2/div:1/p:1:0",
  } as const;
  const logoMedia = cmsImage(cmsContent, "shared:footer:media:logo", {
    value: logo,
    alt: dict.common.logoAlt,
  });
  const footerPhone = cmsText(cmsContent, footerKeys.phone, contact.phoneLabel);
  const footerEmail = cmsText(cmsContent, footerKeys.email, contact.email);
  const footerAddress = cmsText(cmsContent, footerKeys.address, contact.address);

  return (
    <footer
      className="bg-[#101211] py-20"
      data-cms-editable-region
      data-cms-scope="shared:footer"
    >
      <div className="mx-auto grid w-full max-w-7xl gap-16 px-6 sm:px-10 lg:grid-cols-2 lg:items-end">
        <div className="inline-flex w-fit flex-col items-start self-end lg:justify-self-start">
          <div className="flex items-center gap-4 sm:gap-6">
            <Image
              src={logoMedia.value}
              width={988}
              height={988}
              alt={logoMedia.alt ?? dict.common.logoAlt}
              data-cms-media-key="shared:footer:media:logo"
              className="h-[4.2rem] w-[4.2rem] shrink-0 origin-center scale-[1.05] object-contain sm:h-[4.9rem] sm:w-[4.9rem]"
            />
            <div
              className="h-[4.2rem] w-px shrink-0 bg-white/60 sm:h-[4.9rem]"
              aria-hidden="true"
            />
            <div className="flex flex-col items-start gap-[0.4875rem] text-left text-[0.95rem] font-medium leading-[1.425rem] text-white sm:gap-[0.6125rem] sm:text-[1.06875rem]">
              <p data-cms-text-key={footerKeys.architecture}>
                {cmsText(cmsContent, footerKeys.architecture, "Architecture")}
              </p>
              <p data-cms-text-key={footerKeys.construction}>
                {cmsText(cmsContent, footerKeys.construction, "Construction")}
              </p>
              <p data-cms-text-key={footerKeys.excavation}>
                {cmsText(cmsContent, footerKeys.excavation, "Excavation")}
              </p>
            </div>
          </div>
          <ul className="mt-8 inline-flex w-fit items-center gap-4 text-white">
            <li className="w-fit">
              <a
                href="https://www.instagram.com/"
                aria-label={dict.common.social.instagram}
                className="inline-flex w-fit items-center justify-center"
              >
                <FaInstagram className="h-5 w-5" aria-hidden="true" />
              </a>
            </li>
            <li className="w-fit">
              <a
                href="https://www.facebook.com/"
                aria-label={dict.common.social.facebook}
                className="inline-flex w-fit items-center justify-center"
              >
                <FaFacebookF className="h-4 w-4" aria-hidden="true" />
              </a>
            </li>
          </ul>
          <p className="mt-6 w-fit text-sm font-normal text-white/78">
            © {currentYear} {dict.common.copyright}
          </p>
          {visibleHrefs.includes("/privacy") ||
          visibleHrefs.includes("/terms") ? (
            <nav
              aria-label={`${dict.common.privacy} / ${dict.common.terms}`}
              className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-white/55"
            >
              {visibleHrefs.includes("/privacy") ? (
                <Link
                  href={getLocalizedPath(lang, "/privacy")}
                  data-cms-text-key={footerKeys.privacy}
                  className="transition hover:text-white"
                >
                  {cmsText(cmsContent, footerKeys.privacy, dict.common.privacy)}
                </Link>
              ) : null}
              {visibleHrefs.includes("/terms") ? (
                <Link
                  href={getLocalizedPath(lang, "/terms")}
                  data-cms-text-key={footerKeys.terms}
                  className="transition hover:text-white"
                >
                  {cmsText(cmsContent, footerKeys.terms, dict.common.terms)}
                </Link>
              ) : null}
            </nav>
          ) : null}
        </div>

        <div className="flex w-full max-w-xs flex-col items-start justify-self-end self-end text-left lg:translate-x-[max(0px,calc(50vw_-_40rem))]">
          <h2
            className="text-2xl font-semibold text-white"
            data-cms-text-key={footerKeys.contact}
          >
            {cmsText(cmsContent, footerKeys.contact, dict.common.contact)}
          </h2>
          <div className="mt-8 flex w-full flex-col items-start gap-3 text-base text-white/78">
            <a
              href={contact.phoneHref}
              className="inline-block w-fit"
              data-cms-text-key={footerKeys.phone}
            >
              {footerPhone}
            </a>
            <a
              href={`mailto:${footerEmail}`}
              className="inline-block w-fit"
              data-cms-text-key={footerKeys.email}
            >
              {footerEmail}
            </a>
            <p
              className="w-fit max-w-xs text-balance"
              data-cms-text-key={footerKeys.address}
            >
              {footerAddress}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export function CtaBand({
  lang,
  title,
  lead,
  buttonLabel,
  contactVisible = true,
  cmsContent = {},
}: {
  lang: Locale;
  title: string;
  lead: string;
  buttonLabel: string;
  contactVisible?: boolean;
  cmsContent?: CmsContent;
}) {
  const cmsTitle = cmsText(cmsContent, SHARED_CTA_CMS_KEYS.title, title);
  const cmsLead = cmsText(cmsContent, SHARED_CTA_CMS_KEYS.lead, lead);
  const cmsButtonLabel = cmsText(
    cmsContent,
    SHARED_CTA_CMS_KEYS.button,
    buttonLabel,
  );

  return (
    <SectionShell panel>
      <div
        className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center"
        data-cms-scope="shared:cta"
      >
        <div>
          <h2
            className="text-3xl font-semibold text-white sm:text-5xl"
            data-cms-text-key={SHARED_CTA_CMS_KEYS.title}
          >
            {cmsTitle}
          </h2>
          <p
            className="mt-5 max-w-3xl text-lg font-light leading-8 text-white/70 sm:text-xl"
            data-cms-text-key={SHARED_CTA_CMS_KEYS.lead}
          >
            {cmsLead}
          </p>
        </div>
        {contactVisible ? (
          <PrimaryButton
            href={getLocalizedPath(lang, "/contact")}
            cmsTextKey={SHARED_CTA_CMS_KEYS.button}
          >
            {cmsButtonLabel}
          </PrimaryButton>
        ) : null}
      </div>
    </SectionShell>
  );
}
