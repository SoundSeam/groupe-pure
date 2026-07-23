import type { Metadata } from "next";
import { notFound } from "next/navigation";

import LegalPage from "@/components/legal-page";
import { getDictionary } from "@/lib/dictionaries";
import { contact } from "@/lib/site-data";
import { getAlternates, hasLocale } from "@/lib/i18n";

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
    title: dict.metadata.privacy.title,
    description: dict.metadata.privacy.description,
    alternates: {
      canonical: `/${lang}/privacy`,
      languages: getAlternates("/privacy"),
    },
  };
}

export default async function PrivacyPage({
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
          title: "Responsable des renseignements personnels",
          body: (
            <>
              <p>
                Groupe Pure Construction Inc. est responsable des renseignements
                personnels traités dans le cadre de ce site.
              </p>
              <p>
                Pour toute question ou demande, écrivez à{" "}
                <a className={linkClass} href={`mailto:${contact.email}`}>
                  {contact.email}
                </a>
                .
              </p>
            </>
          ),
        },
        {
          title: "Renseignements recueillis",
          body: (
            <>
              <p>
                Le site ne crée pas de compte utilisateur. Lorsque vous utilisez
                le formulaire de contact, les renseignements saisis servent à
                préparer un courriel dans votre propre application de
                messagerie. Le site ne transmet pas ce formulaire à une base de
                données.
              </p>
              <p>
                Si vous envoyez le courriel préparé, nous recevons les
                renseignements que vous choisissez d’y inclure, notamment votre
                nom, vos coordonnées et les détails de votre projet.
              </p>
            </>
          ),
        },
        {
          title: "Google Maps et services externes",
          body: (
            <>
              <p>
                Le site utilise Google Maps Platform pour afficher une carte et,
                lorsque la configuration est active, la note publique de Groupe
                Pure. Google peut alors recevoir des données techniques comme
                votre adresse IP, les caractéristiques du navigateur et des
                données d’utilisation, et peut utiliser des témoins ou le
                stockage local conformément à ses propres politiques.
              </p>
              <p>
                Consultez la{" "}
                <a
                  className={linkClass}
                  href="https://policies.google.com/privacy"
                  target="_blank"
                  rel="noreferrer"
                >
                  politique de confidentialité de Google
                </a>{" "}
                et les{" "}
                <a
                  className={linkClass}
                  href="https://maps.google.com/help/terms_maps/"
                  target="_blank"
                  rel="noreferrer"
                >
                  conditions supplémentaires de Google Maps
                </a>
                .
              </p>
            </>
          ),
        },
        {
          title: "Utilisation, conservation et protection",
          body: (
            <>
              <p>
                Les renseignements reçus par courriel sont utilisés pour
                répondre à votre demande, évaluer un projet, communiquer avec
                vous et respecter nos obligations légales. Ils sont conservés
                seulement aussi longtemps que nécessaire à ces fins.
              </p>
              <p>
                Nous appliquons des mesures raisonnables pour protéger les
                renseignements personnels. Aucun moyen de transmission ou de
                conservation électronique n’est toutefois entièrement exempt
                de risque.
              </p>
            </>
          ),
        },
        {
          title: "Vos droits",
          body: (
            <p>
              Sous réserve de la loi applicable, vous pouvez demander l’accès,
              la rectification ou la suppression de vos renseignements, ou
              retirer un consentement. Envoyez votre demande à{" "}
              <a className={linkClass} href={`mailto:${contact.email}`}>
                {contact.email}
              </a>
              . Vous pouvez également communiquer avec la Commission d’accès à
              l’information du Québec.
            </p>
          ),
        },
        {
          title: "Mises à jour",
          body: (
            <p>
              Cette politique peut être mise à jour pour refléter les
              changements apportés au site, à nos pratiques ou à la loi. La date
              de la plus récente mise à jour apparaît au haut de la page.
            </p>
          ),
        },
      ]
    : [
        {
          title: "Privacy officer",
          body: (
            <>
              <p>
                Groupe Pure Construction Inc. is responsible for personal
                information handled through this website.
              </p>
              <p>
                For questions or requests, email{" "}
                <a className={linkClass} href={`mailto:${contact.email}`}>
                  {contact.email}
                </a>
                .
              </p>
            </>
          ),
        },
        {
          title: "Information we collect",
          body: (
            <>
              <p>
                The website does not create user accounts. When you use the
                contact form, your entries are used to prepare an email in your
                own mail application. The website does not submit the form to a
                database.
              </p>
              <p>
                If you send the prepared email, we receive the information you
                choose to include, such as your name, contact details and
                project information.
              </p>
            </>
          ),
        },
        {
          title: "Google Maps and external services",
          body: (
            <>
              <p>
                This website uses Google Maps Platform to display a map and,
                when configured, Groupe Pure’s public rating. Google may receive
                technical data such as your IP address, browser characteristics
                and usage data, and may use cookies or local storage under its
                own policies.
              </p>
              <p>
                Read the{" "}
                <a
                  className={linkClass}
                  href="https://policies.google.com/privacy"
                  target="_blank"
                  rel="noreferrer"
                >
                  Google Privacy Policy
                </a>{" "}
                and the{" "}
                <a
                  className={linkClass}
                  href="https://maps.google.com/help/terms_maps/"
                  target="_blank"
                  rel="noreferrer"
                >
                  Google Maps additional terms
                </a>
                .
              </p>
            </>
          ),
        },
        {
          title: "Use, retention and safeguards",
          body: (
            <>
              <p>
                Information received by email is used to respond to your
                inquiry, assess a project, communicate with you and meet legal
                obligations. It is retained only as long as reasonably needed
                for those purposes.
              </p>
              <p>
                We use reasonable safeguards to protect personal information.
                No electronic transmission or storage method is completely
                risk-free.
              </p>
            </>
          ),
        },
        {
          title: "Your rights",
          body: (
            <p>
              Subject to applicable law, you may request access to, correction
              or deletion of your personal information, or withdraw consent.
              Send requests to{" "}
              <a className={linkClass} href={`mailto:${contact.email}`}>
                {contact.email}
              </a>
              . You may also contact Québec’s Commission d’accès à
              l’information.
            </p>
          ),
        },
        {
          title: "Updates",
          body: (
            <p>
              We may update this policy to reflect changes to the website, our
              practices or the law. The latest revision date appears at the top
              of this page.
            </p>
          ),
        },
      ];

  return (
    <LegalPage
      eyebrow={isFrench ? "Renseignements personnels" : "Personal information"}
      title={
        isFrench ? "Politique de confidentialité" : "Privacy policy"
      }
      lead={
        isFrench
          ? "Cette politique explique comment Groupe Pure traite les renseignements personnels liés à ce site."
          : "This policy explains how Groupe Pure handles personal information related to this website."
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
