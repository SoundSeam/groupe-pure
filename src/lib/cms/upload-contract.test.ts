import { describe, expect, it } from "vitest";

import {
  cmsUploadFingerprint,
  createCmsMediaUploadJob,
  safeCmsFileName,
  storagePathForJob,
  uploadPercentage,
} from "./upload-contract";

describe("CMS upload contract", () => {
  it("creates a stable job path and fingerprint", () => {
    const job = createCmsMediaUploadJob({
      fieldKey: "collection:projects:project-1",
      pagePath: "/fr/projects",
      id: "upload-123",
      now: new Date("2026-08-04T12:00:00Z"),
    });
    const file = {
      name: "Façade Finale.webp",
      type: "image/webp",
      size: 2048,
      lastModified: 1234,
    };
    const path = storagePathForJob(job, file.name);

    expect(path).toBe(
      "fr/2026-08-04/upload-123-facade-finale.webp",
    );
    expect(cmsUploadFingerprint(job, path, file)).toContain(path);
    expect(cmsUploadFingerprint(job, path, file)).toBe(
      cmsUploadFingerprint(job, path, file),
    );
  });

  it("does not collide when the object path changes", () => {
    const job = createCmsMediaUploadJob({
      fieldKey: "media:hero",
      pagePath: "/en",
      id: "upload-123",
      now: new Date("2026-08-04T12:00:00Z"),
    });
    const file = {
      name: "hero.mp4",
      type: "video/mp4",
      size: 8_000_000,
      lastModified: 1234,
    };

    expect(cmsUploadFingerprint(job, "en/a.mp4", file)).not.toBe(
      cmsUploadFingerprint(job, "en/b.mp4", file),
    );
  });

  it("sanitizes names and clamps progress", () => {
    expect(safeCmsFileName("  Étage #2.PNG  ")).toBe("etage-2.png");
    expect(uploadPercentage(5, 10)).toBe(50);
    expect(uploadPercentage(20, 10)).toBe(100);
    expect(uploadPercentage(-1, 10)).toBe(0);
    expect(uploadPercentage(1, 0)).toBe(0);
  });
});
