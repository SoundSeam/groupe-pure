import { describe, expect, it } from "vitest";

import {
  cmsImage,
  cmsMedia,
  cmsText,
  recoverLocalCmsDraft,
  splitCmsContent,
} from "./content-values";

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

  it("separates page content from locale-wide content", () => {
    expect(
      splitCmsContent({
        heading: { type: "text", value: "Page" },
        "shared:footer": { type: "text", value: "Footer" },
      }),
    ).toEqual({
      pageContent: { heading: { type: "text", value: "Page" } },
      sharedContent: {
        "shared:footer": { type: "text", value: "Footer" },
      },
    });
  });

  it("recovers page edits even when shared content changed elsewhere", () => {
    const server = {
      heading: { type: "text", value: "Server page" },
      "shared:footer": { type: "text", value: "New footer" },
    } as const;
    const local = {
      heading: { type: "text", value: "Unsaved page edit" },
      "shared:footer": { type: "text", value: "Old footer" },
    } as const;

    expect(recoverLocalCmsDraft(server, local, true, false)).toEqual({
      heading: { type: "text", value: "Unsaved page edit" },
      "shared:footer": { type: "text", value: "New footer" },
    });
    expect(recoverLocalCmsDraft(server, local, false, true)).toEqual(server);
  });
});
