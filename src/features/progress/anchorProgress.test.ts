import { describe, expect, it } from "vitest";
import { ANCHOR_PROGRESS_VERSION, isValidAnchorCatalogue, parseAnchorProgress } from "./anchorProgress";

const catalogue = [
  { id: "types", tips: ["Choose for the seabed"] },
  { id: "scope", tips: ["Include the tidal range"] },
] as const;

describe("Anchorwork progress payload", () => {
  it("restores canonical unique IDs from object and JSON payloads", () => {
    const payload = { version: ANCHOR_PROGRESS_VERSION, completedTopicIds: ["scope", "types", "scope"] };
    expect(parseAnchorProgress(payload, catalogue)).toEqual(["scope", "types"]);
    expect(parseAnchorProgress(JSON.stringify(payload), catalogue)).toEqual(["scope", "types"]);
  });

  it.each([
    null,
    "not-json",
    {},
    { version: 2, completedTopicIds: ["types"] },
    { version: 1, completedTopicIds: "types" },
    { version: 1, completedTopicIds: ["unknown"] },
    { version: 1, completedTopicIds: [1] },
  ])("rejects malformed or non-canonical progress %#", (value) => {
    expect(parseAnchorProgress(value, catalogue)).toBeNull();
  });

  it("rejects progress against empty, blank, or duplicate-ID catalogues", () => {
    const emptyPayload = { version: 1, completedTopicIds: [] };
    expect(parseAnchorProgress(emptyPayload, [])).toBeNull();
    expect(parseAnchorProgress(emptyPayload, [{ id: "" }])).toBeNull();
    expect(parseAnchorProgress(emptyPayload, [{ id: "types" }, { id: "types" }])).toBeNull();
  });
});

describe("Anchorwork runtime catalogue", () => {
  it("accepts a nonempty unique catalogue with usable tips", () => {
    expect(isValidAnchorCatalogue(catalogue)).toBe(true);
  });

  it("fails closed for malformed catalogues", () => {
    const malformedCatalogues = [
    [],
    [{ id: "", tips: ["Tip"] }],
    [{ id: "types", tips: ["Tip"] }, { id: "types", tips: ["Other"] }],
    [{ id: "types", tips: [] }],
    [{ id: "types", tips: ["  "] }],
    ];
    malformedCatalogues.forEach((value) => {
      expect(isValidAnchorCatalogue(value)).toBe(false);
    });
  });
});
