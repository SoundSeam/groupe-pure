import type { Metadata } from "next";
import { notFound } from "next/navigation";

import LegalPage from "@/components/legal-page";
import { getDictionary } from "@/lib/dictionaries";
import { getAlternates, hasLocale } from "@/lib/i18n";
import { contact } from "@/lib/site-data";

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
    title: dict.metadata.terms.title,
    description: dict.metadata.terms.description,
    alternates: {
      canonical: `/${lang}/terms`,
      languages: getAlternates("/terms"),
    },
  };
}

export default async function TermsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  if (!hasLocale(lang)) {
    notFound();
  }

  const isFrench = lang === "fr";
  const linkClass =
    "font-normal text-[#e4c58f] underline decoration-[#e4c58f]/45 underline-offset-4 hover:decoration-[#e4c58f]";

  const sections = isFrench
    ? [
        {
          title: "Acceptation",
          body: (
            <p>
              En accédant à ce site, vous acceptez les présentes conditions. Si
              vous ne les acceptez pas, veuillez ne pas utiliser le site.
            </p>
          ),
        },
        {
          title: "Information générale",
          body: (
            <p>
              Le contenu du site est fourni à titre informatif. Il ne constitue
              ni une soumission, ni un conseil professionnel, ni une offre
              contractuelle. Un projet et ses conditions ne deviennent
              contraignants qu’après la conclusion d’une entente écrite.
            </p>
          ),
        },
        {
          title: "Propriété intellectuelle",
          body: (
            <p>
              Sauf indication contraire, le contenu original, les textes,
              éléments graphiques et marques du site appartiennent à Groupe
              Pure Construction Inc. ou sont utilisés avec autorisation. Leur
              reproduction ou utilisation commerciale sans autorisation écrite
              est interdite.
            </p>
          ),
        },
        {
          title: "Google Maps et liens externes",
          body: (
            <>
              <p>
                Les renseignements et interfaces provenant de Google Maps sont
                assujettis aux{" "}
                <a
                  className={linkClass}
                  href="https://maps.google.com/help/terms_maps/"
                  target="_blank"
                  rel="noreferrer"
                >
                  conditions supplémentaires de Google Maps
                </a>{" "}
                et aux{" "}
                <a
                  className={linkClass}
                  href="https://policies.google.com/terms"
                  target="_blank"
                  rel="noreferrer"
                >
                  conditions d’utilisation de Google
                </a>
                .
              </p>
              <p>
                Le site peut contenir des liens ou contenus de tiers. Groupe
                Pure ne contrôle pas ces services et n’est pas responsable de
                leur disponibilité, de leur exactitude ou de leurs pratiques.
              </p>
            </>
          ),
        },
        {
          title: "Disponibilité et responsabilité",
          body: (
            <p>
              Nous cherchons à maintenir un site exact et accessible, sans
              garantir qu’il sera exempt d’erreurs ou d’interruptions. Dans la
              mesure permise par la loi, Groupe Pure n’est pas responsable des
              dommages indirects découlant de l’utilisation du site ou de la
              confiance accordée à son contenu.
            </p>
          ),
        },
        {
          title: "Droit applicable et contact",
          body: (
            <p>
              Les présentes conditions sont régies par les lois applicables au
              Québec et au Canada. Pour toute question, écrivez à{" "}
              <a className={linkClass} href={`mailto:${contact.email}`}>
                {contact.email}
              </a>
              .
            </p>
          ),
        },
      ]
    : [
        {
          title: "Acceptance",
          body: (
            <p>
              By accessing this website, you agree to these terms. If you do not
              agree, please do not use the website.
            </p>
          ),
        },
        {
          title: "General information",
          body: (
            <p>
              Website content is provided for general information only. It is
              not a quotation, professional advice or a contractual offer. A
              project and its conditions become binding only after a written
              agreement is entered into.
            </p>
          ),
        },
        {
          title: "Intellectual property",
          body: (
            <p>
              Unless stated otherwise, original content, copy, visual elements
              and marks on this website belong to Groupe Pure Construction Inc.
              or are used with permission. They may not be reproduced or used
              commercially without written authorization.
            </p>
          ),
        },
        {
          title: "Google Maps and external links",
          body: (
            <>
              <p>
                Information and interfaces supplied by Google Maps are subject
                to the{" "}
                <a
                  className={linkClass}
                  href="https://maps.google.com/help/terms_maps/"
                  target="_blank"
                  rel="noreferrer"
                >
                  Google Maps additional terms
                </a>{" "}
                and the{" "}
                <a
                  className={linkClass}
                  href="https://policies.google.com/terms"
                  target="_blank"
                  rel="noreferrer"
                >
                  Google Terms of Service
                </a>
                .
              </p>
              <p>
                The website may contain links to or content from third parties.
                Groupe Pure does not control those services and is not
                responsible for their availability, accuracy or practices.
              </p>
            </>
          ),
        },
        {
          title: "Availability and liability",
          body: (
            <p>
              We aim to keep the website accurate and available, but do not
              guarantee that it will be error-free or uninterrupted. To the
              extent permitted by law, Groupe Pure is not responsible for
              indirect damages arising from use of the website or reliance on
              its content.
            </p>
          ),
        },
        {
          title: "Governing law and contact",
          body: (
            <p>
              These terms are governed by the applicable laws of Québec and
              Canada. For questions, email{" "}
              <a className={linkClass} href={`mailto:${contact.email}`}>
                {contact.email}
              </a>
              .
            </p>
          ),
        },
      ];

  return (
    <LegalPage
      eyebrow={isFrench ? "Cadre du site" : "Website terms"}
      title={isFrench ? "Conditions d’utilisation" : "Terms of use"}
      lead={
        isFrench
          ? "Ces conditions encadrent l’accès au site et l’utilisation de son contenu."
          : "These terms govern access to this website and the use of its content."
      }
      updated={
        isFrench
          ? "Dernière mise à jour : 23 juillet 2026"
          : "Last updated: July 23, 2026"
      }
      sections={sections}
    />
  );
}
