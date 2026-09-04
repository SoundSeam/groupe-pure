import { describe, expect, it } from "vitest";

import {
  CONTACT_CMS_KEYS,
  PAGE_HERO_CMS_KEYS,
  SERVICES_HERO_CMS_KEYS,
  SHARED_CTA_CMS_KEYS,
  serviceCmsKeys,
  teamMemberCmsKeys,
} from "./page-keys";

describe("stable CMS page keys", () => {
  it("retains the existing project hero revision keys", () => {
    expect(PAGE_HERO_CMS_KEYS.title).toBe(
      "text:main:1/section:1/div:1/h1:1:0",
    );
    expect(PAGE_HERO_CMS_KEYS.lead).toBe(
      "text:main:1/section:1/div:1/p:2:0",
    );
  });

  it("retains the existing team and contact revision keys", () => {
    expect(teamMemberCmsKeys(0).title).toBe(
      "text:main:1/section:2/div:1/div:1/article:1/div:2/p:1:0",
    );
    expect(teamMemberCmsKeys(3).name).toBe(
      "text:main:1/section:2/div:1/div:1/article:4/div:2/h2:1:0",
    );
    expect(CONTACT_CMS_KEYS.email).toBe(
      "text:main:1/section:2/div:1/div:1/aside:1/div:1/a:2:0",
    );
  });

  it("retains scoped service and shared CTA keys", () => {
    expect(SERVICES_HERO_CMS_KEYS.title).toBe(
      "services:hero:text:div:1/h1:1:0",
    );
    expect(serviceCmsKeys("architecture").lead).toBe(
      "services:architecture:text:div:2/p:1:0",
    );
    expect(SHARED_CTA_CMS_KEYS.title).toBe(
      "shared:cta:text:div:1/h2:1:0",
    );
  });
});
