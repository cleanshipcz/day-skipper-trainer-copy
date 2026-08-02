import { describe, expect, it } from "vitest";
import {
  isVictuallingChecklistConflict,
  parseVictuallingProgress,
  VICTUALLING_CHECKLIST_PROGRESS_ID,
  VICTUALLING_PROGRESS_VERSION,
} from "./victuallingProgress";

describe("victuallingProgress", () => {
  const validIds = new Set(["f1", "f2"]);

  it("parses versioned snapshots, deduplicates IDs, and drops retired catalogue entries", () => {
    expect(parseVictuallingProgress({
      version: VICTUALLING_PROGRESS_VERSION,
      checkedItemIds: ["f2", "retired", "f1", "f2"],
      revision: 7,
    }, validIds)).toEqual({ checkedItemIds: ["f2", "f1"], revision: 7 });

    expect(parseVictuallingProgress(JSON.stringify({
      version: VICTUALLING_PROGRESS_VERSION,
      checkedItemIds: ["f1"],
      revision: 2,
    }), validIds)).toEqual({ checkedItemIds: ["f1"], revision: 2 });
  });

  it.each([
    null,
    "not-json",
    { version: 2, checkedItemIds: ["f1"], revision: 1 },
    { version: 1, checkedItemIds: "f1", revision: 1 },
    { version: 1, checkedItemIds: [1], revision: 1 },
    { version: 1, checkedItemIds: ["f1"], revision: -1 },
    { version: 1, checkedItemIds: ["f1"], revision: 1.5 },
  ])("rejects malformed snapshots %#", (payload) => {
    expect(parseVictuallingProgress(payload, validIds)).toBeNull();
  });

  it("recognizes only the dedicated RPC's exact serialization conflict", () => {
    expect(VICTUALLING_CHECKLIST_PROGRESS_ID).toBe("victualling-checklist");
    expect(isVictuallingChecklistConflict({
      code: "40001",
      message: "Victualling checklist revision conflict",
    })).toBe(true);
    expect(isVictuallingChecklistConflict({ code: "40001", message: "serialization failure" })).toBe(false);
    expect(isVictuallingChecklistConflict({ code: "42501", message: "Victualling checklist revision conflict" })).toBe(false);
    expect(isVictuallingChecklistConflict(null)).toBe(false);
  });
});
