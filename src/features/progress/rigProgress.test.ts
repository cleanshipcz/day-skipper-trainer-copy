import { describe, expect, it } from "vitest";
import { isValidRigCatalogue, normalizeRigCatalogue, parseRigProgress, rigProgressPayload } from "./rigProgress";

const item = { id: "shrouds", area: "Standing", item: "Shrouds", lookFor: "Damage", boundary: "Unload safely", checked: false };

describe("rig progress contract", () => {
  it("accepts only a complete unique usable catalogue", () => {
    expect(isValidRigCatalogue([item])).toBe(true);
    expect(isValidRigCatalogue([])).toBe(false);
    expect(isValidRigCatalogue([item, item])).toBe(false);
    expect(normalizeRigCatalogue([{ ...item, id: "" }])).toEqual([]);
  });

  it("round-trips stable outcomes and rejects stale or malformed values", () => {
    const ids = new Set(["shrouds"]);
    expect(parseRigProgress(rigProgressPayload({ shrouds: "defect" }), ids)).toEqual({ shrouds: "defect" });
    expect(parseRigProgress({ version: 1, catalogueId: "old", outcomes: {} }, ids)).toBeNull();
    expect(parseRigProgress(rigProgressPayload({ retired: "satisfactory" }), ids)).toBeNull();
    expect(parseRigProgress(rigProgressPayload({ shrouds: "bad" as never }), ids)).toBeNull();
  });
});
