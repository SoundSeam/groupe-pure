import Image from "next/image";
import Link from "next/link";
import { FaFacebookF, FaInstagram } from "react-icons/fa";

import { ServiceIcon } from "./icons";
import type { Locale } from "@/lib/i18n";
import { getLocalizedPath } from "@/lib/i18n";
import type { Dictionary, Project, Service } from "@/lib/dictionaries";
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
}: {
  eyebrow: string;
  title: string;
  lead: string;
}) {
  return (
    <section className="bg-[#101211] pt-20 pb-7 sm:pt-28 sm:pb-10">
      <div className="mx-auto w-full max-w-7xl px-6 sm:px-10">
        <p className="text-sm font-medium text-white/60">{eyebrow}</p>
        <h1 className="mt-4 max-w-5xl text-4xl font-semibold text-white sm:text-6xl">
          {title}
        </h1>
        <p className="mt-6 max-w-3xl text-lg font-light leading-8 text-white/70 sm:text-xl">
          {lead}
        </p>
      </div>
    </section>
  );
}

export function PrimaryButton({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex rounded-xl bg-[#e4c58f] px-9 py-4 text-lg font-medium text-[#101211] transition hover:bg-[#e4c58f]/90"
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

export function ServiceCard({ service }: { service: Service }) {
  return (
    <article className="flex flex-col">
      <div className="flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-xl bg-[#171a18]">
        {service.video ? (
          <>
            <video
              className={`h-full w-full object-cover ${
                service.key === "construction"
                  ? "object-[center_40%]"
                  : ""
              }`}
              src={service.video}
              poster={service.image}
              autoPlay
              loop
              muted
              playsInline
              aria-hidden="true"
            />
          </>
        ) : (
          <ServiceIcon service={service.key} />
        )}
      </div>
      <div className="mt-8">
        <h3 className="text-xl font-semibold text-white sm:text-3xl">
          {service.title}
        </h3>
        <p className="mt-2 text-base font-light leading-7 text-white/70 sm:text-lg">
          {service.lead}
        </p>
      </div>
    </article>
  );
}

export function ServiceFeature({ service, reverse = false }: { service: Service; reverse?: boolean }) {
  return (
    <article
      className={`grid gap-16 lg:grid-cols-2 lg:items-start ${
        reverse ? "lg:[&>div:first-child]:order-2" : ""
      }`}
    >
      <div className="relative aspect-video overflow-hidden rounded-xl bg-[#171a18]">
        <Image
          src={service.image}
          alt={service.imageAlt}
          fill
          sizes="(min-width: 1024px) 45vw, 100vw"
          className={`object-cover ${
            service.key === "construction" || service.key === "excavation"
              ? "object-[center_40%]"
              : ""
          }`}
        />
        <div className="absolute inset-0 bg-black/20" />
      </div>
      <div>
        <h2 className="text-3xl font-semibold text-white sm:text-5xl">
          {service.title}
        </h2>
        <p className="mt-5 text-lg font-light leading-8 text-white/70 sm:text-xl">
          {service.lead}
        </p>
        <ul className="mt-6 grid grid-cols-2 gap-x-6 gap-y-2">
          {service.examples.map((example) => (
            <li
              key={example}
              className="flex items-start gap-2 text-sm font-light leading-6 text-white/68"
            >
              <span aria-hidden="true" className="text-[#e4c58f]">
                •
              </span>
              <span>{example}</span>
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
  dict,
  contact,
  fullSiteEnabled,
  lang,
  logo,
}: {
  dict: Dictionary;
  contact: {
    phoneLabel: string;
    phoneHref: string;
    email: string;
    address: string;
  };
  fullSiteEnabled: boolean;
  lang: Locale;
  logo: string;
}) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#101211] py-20">
      <div className="mx-auto grid w-full max-w-7xl gap-16 px-6 sm:px-10 lg:grid-cols-2 lg:items-end">
        <div className="inline-flex w-fit flex-col items-start self-end lg:justify-self-start">
          <div className="flex items-center gap-4 sm:gap-6">
            <Image
              src={logo}
              width={988}
              height={988}
              alt={dict.common.logoAlt}
              className="h-[4.2rem] w-[4.2rem] shrink-0 origin-center scale-[1.05] object-contain sm:h-[4.9rem] sm:w-[4.9rem]"
            />
            <div
              className="h-[4.2rem] w-px shrink-0 bg-white/60 sm:h-[4.9rem]"
              aria-hidden="true"
            />
            <div className="flex flex-col items-start gap-[0.4875rem] text-left text-[0.95rem] font-medium leading-[1.425rem] text-white sm:gap-[0.6125rem] sm:text-[1.06875rem]">
              <p>Architecture</p>
              <p>Consturuction</p>
              <p>Excavation</p>
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
          {fullSiteEnabled ? (
            <nav
              aria-label={`${dict.common.privacy} / ${dict.common.terms}`}
              className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-white/55"
            >
              <Link
                href={getLocalizedPath(lang, "/privacy")}
                className="transition hover:text-white"
              >
                {dict.common.privacy}
              </Link>
              <Link
                href={getLocalizedPath(lang, "/terms")}
                className="transition hover:text-white"
              >
                {dict.common.terms}
              </Link>
            </nav>
          ) : null}
        </div>

        <div className="inline-flex w-fit flex-col items-start self-end lg:items-end lg:justify-self-end">
          <h2 className="text-2xl font-semibold text-white">
            {dict.common.contact}
          </h2>
          <div className="mt-8 inline-flex w-fit flex-col items-start gap-3 text-base text-white/78 lg:items-end lg:text-right">
            <a href={contact.phoneHref} className="inline-block w-fit">
              {contact.phoneLabel}
            </a>
            <a
              href={`mailto:${contact.email}`}
              className="inline-block w-fit"
            >
              {contact.email}
            </a>
            <p className="w-fit max-w-xs text-balance">{contact.address}</p>
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
}: {
  lang: Locale;
  title: string;
  lead: string;
  buttonLabel: string;
}) {
  return (
    <SectionShell panel>
      <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
        <div>
          <h2 className="text-3xl font-semibold text-white sm:text-5xl">
            {title}
          </h2>
          <p className="mt-5 max-w-3xl text-lg font-light leading-8 text-white/70 sm:text-xl">
            {lead}
          </p>
        </div>
        <PrimaryButton href={getLocalizedPath(lang, "/contact")}>
          {buttonLabel}
        </PrimaryButton>
      </div>
    </SectionShell>
  );
}
