import { describe, expect, it } from "vitest";

import {
  isEditablePagePath,
  isManagedPagePath,
  isPageVisible,
  localizedPagePath,
  parseSiteVisibility,
  sitePages,
} from "./pages";

describe("CMS page visibility", () => {
  it("keeps English and French visibility independent", () => {
    const visibility = parseSiteVisibility(
      JSON.stringify({
        en: ["/", "/services"],
        fr: ["/", "/projects"],
      }),
    );

    expect(isPageVisible(visibility, "en", "/services")).toBe(true);
    expect(isPageVisible(visibility, "fr", "/services")).toBe(false);
    expect(isPageVisible(visibility, "fr", "/projects")).toBe(true);
  });

  it("accepts only the known localized page catalog", () => {
    expect(isManagedPagePath("/fr/privacy")).toBe(true);
    expect(isManagedPagePath("/en/not-a-page")).toBe(false);
    expect(isEditablePagePath("/en/team")).toBe(true);
    expect(isEditablePagePath("/en/terms")).toBe(false);
    expect(localizedPagePath("fr", "/contact")).toBe("/fr/contact");
    expect(sitePages.find((page) => page.href === "/privacy")?.hideable).toBe(
      false,
    );
    expect(sitePages.find((page) => page.href === "/terms")?.hideable).toBe(
      false,
    );
  });

  it("drops unknown paths from a serialized visibility header", () => {
    const visibility = parseSiteVisibility(
      JSON.stringify({
        en: ["/", "/services", "/unknown"],
        fr: ["/"],
      }),
    );

    expect(visibility.en).toEqual(["/", "/services"]);
  });
});
