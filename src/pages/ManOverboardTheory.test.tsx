import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import TestRouter from "../../tests/TestRouter";
import ManOverboardTheory from "./ManOverboardTheory";
import type { MobTheoryReleaseReview } from "@/data/mobGuidance";

const gate = {
  markSectionVisited: vi.fn(), markCompleted: vi.fn(), retryLoad: vi.fn(), retrySave: vi.fn(),
  loadState: "ready", saveState: "idle", canComplete: false, isCompletionDurable: false,
  visitedSectionIds: [] as string[],
};
vi.mock("@/features/progress/useTheoryCompletionGate", () => ({ useTheoryCompletionGate: () => gate }));
vi.mock("@/components/safety/MOBSortingGame", () => ({ MOBSortingGame: ({ onScenarioComplete }: { onScenarioComplete?: (scenario: "immediate" | "approach") => void }) => <div data-testid="mob-sorting-game"><button onClick={() => onScenarioComplete?.("immediate")}>Complete immediate drill</button><button onClick={() => onScenarioComplete?.("approach")}>Complete approach drill</button></div> }));

const approved: MobTheoryReleaseReview = {
  seamanshipReviewer: "Qualified examiner",
  seamanshipQualification: "RYA Yachtmaster Instructor",
  medicalReviewer: "Clinical reviewer",
  medicalQualification: "Registered emergency clinician",
  approvalDate: "2026-08-12",
  sourceEvidence: ["RYA MOB", "MCA MGN 570", "Resuscitation Council UK 2025"],
};

describe("ManOverboardTheory", () => {
  it("does not award progress on mount and records only meaningful theory and drill activity", async () => {
    const user = userEvent.setup();
    gate.markSectionVisited.mockClear(); gate.markCompleted.mockClear();
    render(<TestRouter><ManOverboardTheory releaseReview={approved} /></TestRouter>);
    expect(gate.markSectionVisited).not.toHaveBeenCalled();
    expect(gate.markCompleted).not.toHaveBeenCalled();
    await user.click(screen.getByRole("tab", { name: /distress call/i }));
    await user.click(screen.getByRole("tab", { name: /drills/i }));
    await user.click(screen.getByRole("button", { name: /complete immediate drill/i }));
    expect(gate.markSectionVisited).toHaveBeenCalledWith("actions");
    expect(gate.markSectionVisited).toHaveBeenCalledWith("distress");
    expect(gate.markSectionVisited).toHaveBeenCalledWith("drill-immediate");
    expect(gate.markCompleted).not.toHaveBeenCalled();
  });

  it("fails closed until both seamanship and medical review evidence exists", () => {
    render(<TestRouter><ManOverboardTheory /></TestRouter>);
    expect(screen.getByTestId("mob-theory-release-gate")).toBeDefined();
    expect(screen.queryByRole("tab", { name: /immediate actions/i })).toBeNull();
  });

  it("publishes the reviewed recovery model, distress template and stable handoff", async () => {
    const user = userEvent.setup();
    render(<TestRouter><ManOverboardTheory releaseReview={approved} /></TestRouter>);
    expect(screen.getAllByRole("button", { name: /back to safety menu/i })).toHaveLength(2);
    expect(screen.getByText(/control and delegate concurrently/i)).toBeDefined();
    expect(screen.getByText(/single-handed sailor/i)).toBeDefined();
    await user.click(screen.getByRole("tab", { name: /distress call/i }));
    expect(screen.getByText(/MAYDAY, MAYDAY, MAYDAY/i)).toBeDefined();
    expect(screen.getByText(/DSC distress alert as instructed/i)).toBeDefined();
    await user.click(screen.getByRole("tab", { name: /maneuvers/i }));
    expect(screen.getByRole("img", { name: /decision flow/i })).toBeDefined();
    expect(screen.getByText(/not a universal return/i)).toBeDefined();
    await user.click(screen.getByRole("tab", { name: /recovery/i }));
    expect(screen.getByText(/rated lifting point/i)).toBeDefined();
    expect(screen.getByText(/support the airway/i)).toBeDefined();
    expect(screen.getByText("propeller-exclusion")).toBeDefined();
    expect(screen.getByText(/Resuscitation Council UK/i)).toBeDefined();
  });

  it("names Back, exposes a five-tab pattern, and uses narrow touch-friendly tab layout", () => {
    render(<TestRouter><ManOverboardTheory releaseReview={approved} /></TestRouter>);
    expect(screen.getAllByRole("button", { name: "Back to Safety Menu" })).toHaveLength(2);
    const tabs = screen.getAllByRole("tab");
    expect(tabs).toHaveLength(5);
    expect(screen.getByRole("tablist", { name: "Man overboard lesson sections" }).className).toContain("grid-cols-1");
    tabs.forEach((tab) => expect(tab.className).toContain("min-h-11"));
  });
});
