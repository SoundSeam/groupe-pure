const root = "text:main:1";

export const HOME_CMS_KEYS = {
  heroTitle: `${root}/section:1/div:2/div:1/h1:1:0`,
  heroLead: `${root}/section:1/div:2/div:1/p:1:0`,
  startProject: `${root}/section:1/div:2/div:1/div:1/a:1:0`,
  servicesTitle: `${root}/section:2/div:1/div:1/h2:1:0`,
  territoryTitle: `${root}/section:3/div:1/div:1/div:1/div:1/h2:1:0`,
  address: `${root}/section:3/div:1/div:1/div:1/div:1/address:1:0`,
  territoryRegionsLabel: `${root}/section:3/div:1/div:1/div:1/div:2/div:1/p:1:0`,
  territoryRegions: `${root}/section:3/div:1/div:1/div:1/div:2/div:1/p:2:0`,
  openingHoursLabel: `${root}/section:3/div:1/div:1/div:1/div:2/div:2/p:1:0`,
  appointmentNote: `${root}/section:3/div:1/div:1/div:1/div:2/div:2/p:2:0`,
  googleReviewsLabel: `${root}/section:3/div:1/div:1/div:1/div:2/div:3/div:1/a:1/span:1:0`,
  contactEyebrow: `${root}/section:4/div:1/div:1/div:1/p:1:0`,
  contactTitle: `${root}/section:4/div:1/div:1/div:1/h2:1:0`,
  contactLead: `${root}/section:4/div:1/div:1/div:1/p:2:0`,
  territoryMedia: "media:home:territory",
} as const;

export function homeServiceCmsKeys(index: number, serviceKey: string) {
  const base = `${root}/section:2/div:1/div:2/article:${index + 1}/div:2`;
  return {
    title: `${base}/h3:1:0`,
    lead: `${base}/p:1:0`,
    media: `media:home:service:${serviceKey}`,
  } as const;
}

export function homeOpeningHoursCmsKeys(index: number) {
  const base = `${root}/section:3/div:1/div:1/div:1/div:2/div:2/dl:1/div:${index + 1}`;
  return {
    day: `${base}/dt:1:0`,
    hours: `${base}/dd:1:0`,
  } as const;
}
