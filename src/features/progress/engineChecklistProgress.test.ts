import { describe, expect, it } from "vitest";
import { maintenanceChecks } from "@/data/engineChecks";
import { ANONYMOUS_ENGINE_CHECKLIST_MAX_AGE_MS, engineChecklistSaveState, mergeEngineChecklistIds, normalizeEngineCatalogue, parseEngineChecklistProgress, restoreAnonymousEngineChecklist, saveAnonymousEngineChecklist, shouldClearAnonymousAfterMigration } from "./engineChecklistProgress";

describe("engine checklist progress", () => {
  const ids = new Set(maintenanceChecks.map(({ id }) => id));
  it("normalizes malformed and duplicate catalogue rows", () => {
    expect(normalizeEngineCatalogue([maintenanceChecks[0], maintenanceChecks[0], {}, null])).toEqual([{ ...maintenanceChecks[0], checked: false }]);
    expect(normalizeEngineCatalogue(null)).toEqual([]);
  });
  it("accepts the stable catalogue identity, deduplicates, and drops retired IDs", () => {
    expect(parseEngineChecklistProgress({ version: 1, catalogueId: "engine-maintenance-v1", checkedItemIds: ["oil", "oil", "retired"], revision: 2 }, ids)).toEqual({ checkedItemIds: ["oil"], revision: 2 });
    expect(parseEngineChecklistProgress({ version: 1, catalogueId: "changed", checkedItemIds: [], revision: 0 }, ids)).toBeNull();
    expect(parseEngineChecklistProgress("bad", ids)).toBeNull();
  });
  it("keeps anonymous state for one browser session with explicit expiry", () => {
    sessionStorage.clear();
    expect(saveAnonymousEngineChecklist(sessionStorage, ["oil"], 100)).toBe(true);
    expect(restoreAnonymousEngineChecklist(sessionStorage, ids, 101)?.checkedItemIds).toEqual(["oil"]);
    expect(restoreAnonymousEngineChecklist(sessionStorage, ids, 100 + ANONYMOUS_ENGINE_CHECKLIST_MAX_AGE_MS)).toBeNull();
  });
  it("reports unavailable anonymous storage instead of claiming success", () => {
    const denied = { setItem: () => { throw new DOMException("denied"); } } as unknown as Storage;
    expect(saveAnonymousEngineChecklist(denied, ["oil"])).toBe(false);
  });
  it("does not describe an offline queue or conflict as a remote save", () => {
    expect(engineChecklistSaveState("remote")).toBe("saved");
    expect(engineChecklistSaveState("queued")).toBe("queued");
    expect(engineChecklistSaveState("conflict")).toBe("conflict");
    expect(engineChecklistSaveState("failed")).toBe("failed");
  });
  it("reconciles existing remote and anonymous practice with a catalogue-ordered union", () => {
    expect(mergeEngineChecklistIds(["fuel", "oil"], ["oil", "coolant"], ["oil", "coolant", "fuel"])).toEqual(["oil", "coolant", "fuel"]);
  });
  it.each(["queued", "failed", "conflict"] as const)("preserves anonymous state after %s migration", (result) => {
    expect(shouldClearAnonymousAfterMigration(result, "owner-a", "owner-a")).toBe(false);
  });
  it("clears only after confirmed persistence for the same owner", () => {
    expect(shouldClearAnonymousAfterMigration("remote", "owner-a", "owner-a")).toBe(true);
    expect(shouldClearAnonymousAfterMigration("remote", "owner-a", "owner-b")).toBe(false);
    expect(shouldClearAnonymousAfterMigration("remote", "owner-a", null)).toBe(false);
  });
  it("resolves missing-account migration only on confirmed success", () => {
    expect(shouldClearAnonymousAfterMigration("remote", "new-owner", "new-owner")).toBe(true);
    expect(shouldClearAnonymousAfterMigration("queued", "new-owner", "new-owner")).toBe(false);
    expect(shouldClearAnonymousAfterMigration("failed", "new-owner", "new-owner")).toBe(false);
  });
});
