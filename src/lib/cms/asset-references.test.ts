import { describe, expect, it } from "vitest";

import { referencedFieldKeys } from "./asset-references";

describe("CMS asset references", () => {
  it("finds direct and collection references by field", () => {
    const url = "https://media.example/project.webp";
    const content = {
      "media:hero": { type: "image", value: url },
      "collection:projects": {
        type: "collection",
        value: JSON.stringify([{ image: url }]),
      },
      "text:title": { type: "text", value: "Unrelated" },
    };

    expect(referencedFieldKeys(content, url)).toEqual([
      "media:hero",
      "collection:projects",
    ]);
  });

  it("returns no references for invalid or unrelated content", () => {
    expect(referencedFieldKeys(null, "https://media.example/a")).toEqual([]);
    expect(
      referencedFieldKeys(
        { field: { value: "https://media.example/b" } },
        "https://media.example/a",
      ),
    ).toEqual([]);
  });
});
