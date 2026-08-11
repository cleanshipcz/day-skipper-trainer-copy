import { describe, expect, it } from "vitest";
import type { ChecklistItem } from "@/data/preDepartureChecklist";
import {
  canSelectStatus,
  emptyReadinessEntry,
  summarizeReadiness,
  transitionEntry,
} from "./readinessRecord";

const required = { id: "required", phase: "Pre-start checks", label: "Required", why: "Safety" } satisfies ChecklistItem;
const conditional = {
  id: "conditional",
  phase: "Pre-start checks",
  label: "Conditional",
  why: "Context",
  conditional: { when: "When fitted", authority: "Vessel manual" },
} satisfies ChecklistItem;
const items = [required, conditional];

describe("readiness record model", () => {
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
    expect(transitionEntry(corrected, "not_checked", "later").recordedAt).toBeUndefined();
  });
});
