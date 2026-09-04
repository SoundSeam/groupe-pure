const root = "text:main:1";

export const PAGE_HERO_CMS_KEYS = {
  eyebrow: `${root}/section:1/div:1/p:1:0`,
  title: `${root}/section:1/div:1/h1:1:0`,
  lead: `${root}/section:1/div:1/p:2:0`,
} as const;

export const TEAM_CMS_KEYS = {
  stripTitle: `${root}/section:2/div:1/div:1/h2:1:0`,
  stripLead: `${root}/section:2/div:1/div:1/p:1:0`,
  aboutTitle: `${root}/section:4/div:1/div:1/section:1/h2:1:0`,
  aboutBody: `${root}/section:4/div:1/div:1/section:1/p:1:0`,
  careersEyebrow: `${root}/section:5/div:1/section:1/div:1/div:1/p:1:0`,
  careersTitle: `${root}/section:5/div:1/section:1/div:1/div:1/h2:1:0`,
  careersLead: `${root}/section:5/div:1/section:1/div:1/div:1/p:2:0`,
} as const;

// These explicit keys intentionally retain the paths used by the original
// team editor, so existing saved revisions keep mapping after layout changes.
export function teamMemberCmsKeys(index: number) {
  const base = `${root}/section:2/div:1/div:1/article:${index + 1}/div:2`;
  return {
    name: `${base}/h2:1:0`,
    title: `${base}/p:1:0`,
    media: `media:team:${index}`,
  } as const;
}

export const CONTACT_CMS_KEYS = {
  building: "media:contact:building",
  directTitle: `${root}/section:2/div:1/div:1/aside:1/h2:1:0`,
  phone: `${root}/section:2/div:1/div:1/aside:1/div:1/a:1:0`,
  email: `${root}/section:2/div:1/div:1/aside:1/div:1/a:2:0`,
  address: `${root}/section:2/div:1/div:1/aside:1/div:1/p:1:0`,
} as const;

export const SHARED_CTA_CMS_KEYS = {
  title: "shared:cta:text:div:1/h2:1:0",
  lead: "shared:cta:text:div:1/p:1:0",
  button: "shared:cta:text:a:1:0",
} as const;

export function serviceCmsKeys(serviceKey: string) {
  return {
    title: `services:${serviceKey}:text:div:2/h2:1:0`,
    lead: `services:${serviceKey}:text:div:2/p:1:0`,
    media: `media:services:${serviceKey}`,
  } as const;
}

export const SERVICES_HERO_CMS_KEYS = {
  eyebrow: "services:hero:text:div:1/p:1:0",
  title: "services:hero:text:div:1/h1:1:0",
  lead: "services:hero:text:div:1/p:2:0",
} as const;
