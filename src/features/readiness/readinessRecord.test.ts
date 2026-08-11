import { describe, expect, it } from "vitest";
import type { ChecklistItem } from "@/data/preDepartureChecklist";
import {
  canSelectStatus,
  emptyReadinessEntry,
  isReadinessContextComplete,
  parseReadinessSession,
  summarizeReadiness,
  transitionEntry,
  validateReadinessCatalogue,
} from "./readinessRecord";

const required = { id: "required", phase: "Pre-start checks", label: "Required", why: "Safety" } satisfies ChecklistItem;
const conditional = {
  id: "conditional",
  phase: "Pre-start checks",
  label: "Conditional",
  why: "Context",
  conditional: { when: "When fitted", authority: "Vessel manual" },
  notApplicableAllowed: true,
} satisfies ChecklistItem;
const items = [required, conditional];

describe("readiness record model", () => {
  it("requires trimmed vessel, voyage and conditions context for completion", () => {
    expect(isReadinessContextComplete({ vessel: "Aster", voyage: "Cowes", conditions: "F4" })).toBe(true);
    expect(isReadinessContextComplete({ vessel: "   ", voyage: "Cowes", conditions: "F4" })).toBe(false);
    expect(isReadinessContextComplete({ vessel: "Aster", voyage: "", conditions: "F4" })).toBe(false);
    expect(isReadinessContextComplete({ vessel: "\t\n", voyage: "Cowes", conditions: "F4" })).toBe(false);
    expect(isReadinessContextComplete({ vessel: "Aster", voyage: "\u00a0", conditions: "F4" })).toBe(false);
    expect(isReadinessContextComplete({ vessel: "Aster", voyage: "Cowes", conditions: "\u2007\u202f\ufeff" })).toBe(false);
  });
  it("starts unresolved and permits not-applicable only for a contextual item", () => {
    expect(summarizeReadiness(items, {})).toMatchObject({ outcome: "incomplete", notChecked: 2 });
    expect(canSelectStatus(required, "not_applicable")).toBe(false);
    expect(canSelectStatus(conditional, "not_applicable")).toBe(true);
  });

  it("requires a reason before a not-applicable decision resolves an item", () => {
    expect(summarizeReadiness(items, {
      required: { ...emptyReadinessEntry(), status: "satisfactory" },
      conditional: { ...emptyReadinessEntry(), status: "not_applicable" },
    })).toMatchObject({ outcome: "incomplete", complete: false });
    expect(summarizeReadiness(items, {
      required: { ...emptyReadinessEntry(), status: "satisfactory" },
      conditional: { ...emptyReadinessEntry(), status: "not_applicable", reason: "No equipment fitted; manual section 4 checked" },
    })).toMatchObject({ outcome: "complete", complete: true, notApplicable: 1 });
    for (const reason of ["\t\n", "\u00a0", "\u2007\u202f\ufeff"]) {
      expect(summarizeReadiness(items, {
        required: { ...emptyReadinessEntry(), status: "satisfactory" },
        conditional: { ...emptyReadinessEntry(), status: "not_applicable", reason },
      })).toMatchObject({ outcome: "incomplete", complete: false, notApplicable: 0 });
    }
  });

  it.each(["defect", "blocked", "unknown"] as const)("treats %s as a no-go blocker", (status) => {
    expect(summarizeReadiness(items, {
      required: { ...emptyReadinessEntry(), status },
      conditional: { ...emptyReadinessEntry(), status: "satisfactory" },
    })).toMatchObject({ outcome: "blocked", blocked: 1, complete: false });
  });

  it("timestamps recorded transitions and clears an inapplicable reason when corrected", () => {
    const initial = { ...emptyReadinessEntry(), status: "not_applicable" as const, reason: "Not fitted" };
    const corrected = transitionEntry(initial, "satisfactory", "2026-08-11T16:00:00.000Z");
    expect(corrected).toMatchObject({ status: "satisfactory", reason: "", recordedAt: "2026-08-11T16:00:00.000Z" });
    expect(corrected.history).toEqual([expect.objectContaining({ status: "not_applicable", reason: "Not fitted", supersededAt: "2026-08-11T16:00:00.000Z" })]);
    expect(transitionEntry(corrected, "not_checked", "later").recordedAt).toBeUndefined();
  });

  it("fails closed for malformed, empty and duplicate catalogues", () => {
    expect(validateReadinessCatalogue([]).valid).toBe(false);
    expect(validateReadinessCatalogue([required, { ...required }]).diagnostics).toContain("Duplicate readiness item ID: required.");
    expect(validateReadinessCatalogue([{ ...required, id: " ", label: "" }]).valid).toBe(false);
  });

  it("fingerprints all decision guidance and rejects cycles or forward dependencies", () => {
    const base = validateReadinessCatalogue(items).fingerprint;
    expect(validateReadinessCatalogue([{ ...required, why: "Changed safety rationale" }, conditional]).fingerprint).not.toBe(base);
    expect(validateReadinessCatalogue([required, { ...conditional, conditional: { ...conditional.conditional, authority: "Changed authority" } }]).fingerprint).not.toBe(base);
    const cyclic = [{ ...required, dependsOn: ["conditional"] }, { ...conditional, dependsOn: ["required"] }];
    const result = validateReadinessCatalogue(cyclic);
    expect(result.valid).toBe(false);
    expect(result.diagnostics.join(" ")).toMatch(/must follow|cycle/);
  });

  it("rejects legacy, expired and catalogue-stale durable sessions", () => {
    expect(parseReadinessSession({ version: 1 }, items).status).toBe("legacy");
    const base = { version: 2, sessionId: "session", catalogueFingerprint: validateReadinessCatalogue(items).fingerprint, context: { vessel: "A", voyage: "B", conditions: "C" }, entries: {}, createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z", expiresAt: "2026-02-01T00:00:00.000Z" };
    expect(parseReadinessSession(base, items, new Date("2026-03-01T00:00:00.000Z")).status).toBe("expired");
    expect(parseReadinessSession({ ...base, expiresAt: "2099-01-01T00:00:00.000Z", catalogueFingerprint: "old" }, items).status).toBe("catalogue_changed");
  });
});
