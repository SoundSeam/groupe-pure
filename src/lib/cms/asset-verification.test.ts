import { describe, expect, it, vi } from "vitest";

import {
  verifyCmsAssetObject,
} from "./asset-verification";

describe("CMS asset verification", () => {
  it("accepts a matching stored object", async () => {
    const fetcher = vi.fn(async () =>
      new Response(null, {
        status: 200,
        headers: {
          "content-type": "image/webp",
          "content-length": "2048",
        },
      }),
    ) as unknown as typeof fetch;

    await expect(
      verifyCmsAssetObject({
        publicUrl: "https://media.example/project.webp",
        mimeType: "image/webp",
        size: 2048,
        fetcher,
      }),
    ).resolves.toBeUndefined();
  });

  it.each([
    [404, "image/webp", "2048", "OBJECT_NOT_FOUND"],
    [200, "video/mp4", "2048", "OBJECT_TYPE_MISMATCH"],
    [200, "image/webp", "1024", "OBJECT_SIZE_MISMATCH"],
  ])(
    "rejects an invalid stored object",
    async (status, contentType, contentLength, code) => {
      const fetcher = vi.fn(async () =>
        new Response(null, {
          status,
          headers: {
            "content-type": contentType,
            "content-length": contentLength,
          },
        }),
      ) as unknown as typeof fetch;

      await expect(
        verifyCmsAssetObject({
          publicUrl: "https://media.example/project.webp",
          mimeType: "image/webp",
          size: 2048,
          fetcher,
        }),
      ).rejects.toMatchObject({ code });
    },
  );
});
