import { describe, expect, it } from "vitest";

import { cmsImage, cmsMedia, cmsText } from "./content-values";

describe("CMS render values", () => {
  it("uses a published text override when present", () => {
    expect(
      cmsText({ heading: { type: "text", value: "Published" } }, "heading", "Old"),
    ).toBe("Published");
  });

  it("falls back when a value has the wrong type", () => {
    const content = { hero: { type: "video", value: "/hero.mp4" } } as const;
    expect(cmsText(content, "hero", "Fallback")).toBe("Fallback");
    expect(cmsImage(content, "hero", { value: "/fallback.jpg", alt: "Fallback" }))
      .toEqual({ type: "image", value: "/fallback.jpg", alt: "Fallback" });
  });

  it("returns image and video overrides for server rendering", () => {
    const content = {
      image: { type: "image", value: "/new.jpg", alt: "New" },
      video: { type: "video", value: "/new.mp4" },
    } as const;
    expect(cmsMedia(content, "image")).toEqual(content.image);
    expect(cmsMedia(content, "video")).toEqual(content.video);
  });
});
