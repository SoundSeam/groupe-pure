import "server-only";

export const contact = {
  phoneLabel: "(514) 885-5877",
  phoneHref: "tel:+15148855877",
  email: "info@groupepure.ca",
  address: "2100 Bd Marie-Victorin, Longueuil, QC J4G 1A8",
  rbq: "RBQ 5773-2182-01",
};

export const googleBusiness = {
  placeId: "ChIJYfqnaBUdyUwRhU9gd9XSOJs",
  mapsUrl:
    "https://www.google.com/maps?place_id=ChIJYfqnaBUdyUwRhU9gd9XSOJs",
};

const siteMediaBase =
  "https://rhgzekbjbgjeqxxjwgpf.supabase.co/storage/v1/object/public/site-media";

export function siteMedia(path: string) {
  return `${siteMediaBase}/${path}`;
}

export const assets = {
  logo: "/brand/logo-vertical.png",
  headerLogo: "/brand/logo-horizontal.png",
  contactBuilding: siteMedia("content/building.webp"),
  heroVideo: siteMedia("hero/hero.mp4"),
  heroPoster: siteMedia("hero/hero-poster.webp"),
  territoryImage: siteMedia("content/building.webp"),
  apchqLogo: "/partner-logos/apchq-badge.png",
};

export const partnerLogos = [
  {
    src: "/partner-logos/otpq-logo.png",
    alt: "Ordre des technologues professionnels du Québec",
    width: 175,
    height: 59,
  },
  {
    src: "/partner-logos/apchq-logo.svg",
    alt: "APCHQ",
    width: 217,
    height: 40,
  },
  {
    src: "/partner-logos/ccq-logo.svg",
    alt: "Commission de la construction du Québec",
    width: 248,
    height: 73,
  },
  {
    src: "/partner-logos/cnesst-logo.png",
    alt: "Commission des normes, de l’équité, de la santé et de la sécurité du travail",
    width: 576,
    height: 216,
  },
  {
    src: "/partner-logos/acq-logo.svg",
    alt: "Association de la construction du Québec",
    width: 778,
    height: 143,
  },
  {
    src: "/partner-logos/rbq-logo.png",
    alt: "Régie du bâtiment du Québec",
    width: 500,
    height: 146,
  },
] as const;

export const projectImages = [
  siteMedia("projects/le-2100.webp"),
  siteMedia("projects/residence-montcalm.webp"),
  siteMedia("projects/maison-aurel.webp"),
  siteMedia("projects/domaine-elysee.webp"),
  siteMedia("projects/pavillon-orion.webp"),
  siteMedia("projects/atelier-belvedere.webp"),
];
