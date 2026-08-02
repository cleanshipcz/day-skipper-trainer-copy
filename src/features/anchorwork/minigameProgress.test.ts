import { describe, expect, it } from "vitest";
import { parseAnchorMinigameProgress } from "./minigameProgress";

describe("Anchor minigame progress", () => {
  const valid = { version: 1, completedFamilies: ["sheltered"], attempts: 3, failedChecks: 2, scenarioSeed: 42, sequenceIndex: 1, scenarioIdentity: "anchor-42-1-2-harbour" };
  it("restores a stable scenario checkpoint", () => expect(parseAnchorMinigameProgress(valid)).toEqual(valid));
  it.each([
    { ...valid, version: 2 }, { ...valid, completedFamilies: ["unknown"] },
    { ...valid, completedFamilies: ["sheltered", "sheltered"] }, { ...valid, attempts: -1 },
  ])("rejects unsafe or stale snapshots %#", (snapshot) => expect(parseAnchorMinigameProgress(snapshot)).toBeNull());
});

