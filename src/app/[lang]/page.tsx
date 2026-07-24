import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

import ContactForm from "@/components/contact-form";
import GoogleReviewBadge from "@/components/google-review-badge";
import {
  PrimaryButton,
  SectionShell,
  ServiceCard,
} from "@/components/site-ui";
import { getDictionary } from "@/lib/dictionaries";
import { getAlternates, getLocalizedPath, hasLocale } from "@/lib/i18n";
import {
  assets,
  contact,
  googleBusiness,
  partnerLogos,
} from "@/lib/site-data";
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
  const fullSiteEnabled = process.env.FULL_SITE_ENABLED === "true";
  const homeFormLabels = {
    ...dict.form,
    submit: dict.home.contactButton,
  };
  const googleMapsApiKey =
    process.env.GOOGLE_MAPS_REVIEWS_ENABLED === "true"
      ? process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim()
      : undefined;
  const googleMapsPlaceId =
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_PLACE_ID?.trim() ||
    googleBusiness.placeId;

  return (
    <main>
      <section className="relative flex min-h-[calc(100vh-4rem)] flex-col justify-end overflow-hidden rounded-b-[3rem] pb-16 text-left sm:pb-20">
        <video
          className="absolute inset-0 h-full w-full object-cover"
          data-cms-media-key="media:home:hero"
          poster={assets.heroPoster}
          autoPlay
          loop
          muted
          playsInline
          aria-hidden="true"
        >
          <source src={assets.heroVideo} type="video/mp4" />
        </video>
        <div className="pointer-events-none absolute inset-0 bg-[#101211]/70" />
        <div className="relative z-10 mx-auto flex w-full max-w-7xl items-end gap-8 px-6 sm:px-10">
          <div className="flex max-w-4xl flex-col items-start">
            <h1 className="text-4xl font-semibold text-white [text-shadow:0_3px_24px_rgba(0,0,0,0.55)] sm:text-6xl">
              {dict.home.heroTitle}
            </h1>
            <p className="mt-6 max-w-xl text-lg font-light leading-8 text-white/70 [text-shadow:0_2px_18px_rgba(0,0,0,0.5)] sm:text-xl">
              {dict.home.heroLead}
            </p>
            {fullSiteEnabled ? (
              <div className="mt-10">
                <PrimaryButton href={getLocalizedPath(locale, "/contact")}>
                  {dict.common.startProject}
                </PrimaryButton>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <div className="py-10 sm:py-12" data-cms-ignore>
        <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-x-8 gap-y-8 px-6 sm:grid-cols-2 sm:px-10 lg:grid-cols-6 lg:gap-x-6">
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
        <div>
          <h2 className="max-w-3xl text-3xl font-semibold text-white sm:text-5xl">
            {dict.home.servicesTitle}
          </h2>
        </div>

        <div className="mt-14 grid gap-5 sm:mt-20 lg:grid-cols-3">
          {dict.services.map((service) => (
            <ServiceCard key={service.key} service={service} />
          ))}
        </div>
      </SectionShell>

      <SectionShell>
        <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-stretch">
          <div className="flex flex-col justify-between">
            <div>
              <h2 className="max-w-4xl text-3xl font-semibold text-white sm:text-5xl">
                {dict.home.territoryTitle}
              </h2>
              <address className="mt-6 max-w-3xl text-lg font-light not-italic leading-8 text-white/70 sm:text-xl">
                {contact.address}
              </address>
            </div>
            <div className="mt-10">
              <div>
                <p className="text-sm font-medium text-white/45">
                  {dict.home.territoryRegionsLabel}
                </p>
                <p className="mt-1 text-base font-medium leading-7 text-white">
                  {dict.home.territoryRegions}
                </p>
              </div>
              <div className="mt-5">
                <p className="text-sm font-medium text-white/45">
                  {dict.home.openingHoursLabel}
                </p>
                <dl className="mt-1 max-w-xs space-y-1 text-base font-medium text-white">
                  {dict.home.openingHours.map(({ day, hours }) => (
                    <div className="flex justify-between gap-8" key={day}>
                      <dt>{day}</dt>
                      <dd className="tabular-nums">{hours}</dd>
                    </div>
                  ))}
                </dl>
                <p className="mt-3 max-w-md text-sm font-normal leading-6 text-white/70">
                  {dict.home.appointmentNote}
                </p>
              </div>
              <div className="mt-10">
                <GoogleReviewBadge
                  apiKey={googleMapsApiKey}
                  fallbackLabel={dict.home.googleReviewsLabel}
                  mapsUrl={googleBusiness.mapsUrl}
                  placeId={googleMapsPlaceId}
                />
              </div>
            </div>
          </div>
          <div className="relative min-h-[22rem] overflow-hidden rounded-xl bg-[#171a18] lg:min-h-[32rem]">
            <div className="absolute inset-x-0 -top-[20%] h-[120%]">
              <Image
                src={assets.territoryImage}
                alt=""
                fill
                sizes="(min-width: 1024px) 40vw, 100vw"
                data-cms-media-key="media:home:territory"
                className="object-cover object-[center_70%]"
              />
            </div>
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/30" />
            <div className="absolute right-3 bottom-3 h-[34%] w-[48%] overflow-hidden rounded-lg bg-[#171a18] [box-shadow:0_0_32px_rgba(0,0,0,0.55)] sm:right-4 sm:bottom-4 sm:h-[32%] sm:w-[44%] lg:h-[30%] lg:w-[40%]">
              <iframe
                title={dict.common.mapTitle}
                src={`https://www.google.com/maps?q=${encodeURIComponent(contact.address)}&output=embed&hl=${locale}`}
                className="h-full w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
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
          <ContactForm
            alignSubmitRight
            labels={homeFormLabels}
            locale={locale}
          />
        </div>
      </SectionShell>
    </main>
  );
}
