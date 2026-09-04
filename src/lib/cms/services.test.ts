import { describe, expect, it } from "vitest";

import {
  parseServiceExamples,
  serviceExamplesKey,
  serviceExamplesValue,
} from "./services";

describe("service example collections", () => {
  it("uses a stable key for every service", () => {
    expect(serviceExamplesKey("construction")).toBe(
      "collection:services:construction:examples",
    );
  });

  it("round-trips bullet text without dropping blank drafts", () => {
    const examples = ["New construction", "", "Renovation"];
    expect(parseServiceExamples(serviceExamplesValue(examples))).toEqual(examples);
  });

  it("falls back when stored collection data is invalid", () => {
    expect(
      parseServiceExamples(
        { type: "collection", value: "not-json" },
        ["Fallback"],
      ),
    ).toEqual(["Fallback"]);
  });
});
