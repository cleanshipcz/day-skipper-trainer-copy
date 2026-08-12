import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import TestRouter from "../../tests/TestRouter";
import { ABANDON_SHIP_SCENARIOS } from "@/data/abandonShipDrill";
import { LIFE_RAFT_REVIEW_BASIS, type LifeRaftReleaseReview } from "@/data/lifeRaftProcedures";
import LifeRaftTheory from "./LifeRaftTheory";

const mocks = vi.hoisted(() => ({
  markSectionVisited: vi.fn(), markCompleted: vi.fn(), retryLoad: vi.fn(), retrySave: vi.fn(), useGate: vi.fn(),
  gate: { canComplete: false, isHydrated: true, isCompletionDurable: false, loadState: "ready", saveState: "idle", visitedSectionIds: [] as string[] },
}));
vi.mock("@/features/progress/useTheoryCompletionGate", () => ({
  useTheoryCompletionGate: (args: unknown) => { mocks.useGate(args); return { ...mocks.gate, markSectionVisited: mocks.markSectionVisited, markCompleted: mocks.markCompleted, retryLoad: mocks.retryLoad, retrySave: mocks.retrySave }; },
}));
vi.mock("@/components/safety/AbandonShipSortingGame", () => ({
  AbandonShipSortingGame: ({ onEvidenceChange }: { onEvidenceChange?: (value: unknown) => void }) => <button onClick={() => onEvidenceChange?.({ masteredScenarioIds: ABANDON_SHIP_SCENARIOS.map(({ id }) => id), completedAt: "2026-08-12T00:00:00.000Z" })}>Complete drill contexts</button>,
}));
const approved: LifeRaftReleaseReview = { reviewed: true, reviewerName: "Survival craft reviewer", reviewerQualification: "Qualified marine survival-craft specialist", approvalDate: "2026-08-12", sourceEvidence: [...LIFE_RAFT_REVIEW_BASIS] };

describe("LifeRaftTheory durable completion", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.assign(mocks.gate, { canComplete: false, isHydrated: true, isCompletionDurable: false, loadState: "ready", saveState: "idle", visitedSectionIds: [] });
  });

  it("fails closed without qualified review evidence", () => {
    const getItem = vi.spyOn(Storage.prototype, "getItem");
    const setItem = vi.spyOn(Storage.prototype, "setItem");
    render(<TestRouter><LifeRaftTheory /></TestRouter>);
    expect(screen.getByTestId("life-raft-release-gate")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Complete lesson" })).toBeNull();
    expect(mocks.useGate).not.toHaveBeenCalled();
    expect(getItem).not.toHaveBeenCalled();
    expect(setItem).not.toHaveBeenCalled();
    getItem.mockRestore(); setItem.mockRestore();
  });

  it("requires revisioned guidance and validated drill evidence", async () => {
    const user = userEvent.setup();
    render(<TestRouter><LifeRaftTheory releaseReview={approved} /></TestRouter>);
    expect(mocks.useGate).toHaveBeenCalledWith(expect.objectContaining({ catalogueRevision: "life-raft-qualified-guidance-drill-v3", requiredSectionIds: ["when-to-abandon", "raft-types", "solas-pack", "deployment", "drill-mastery"] }));
    expect((screen.getByRole("button", { name: "Complete lesson" }) as HTMLButtonElement).disabled).toBe(true);
    await user.click(screen.getByRole("tab", { name: "Raft Types" }));
    expect(mocks.markSectionVisited).toHaveBeenCalledWith("raft-types");
    await user.click(screen.getByRole("tab", { name: "Drill" }));
    fireEvent.click(screen.getByRole("button", { name: "Complete drill contexts" }));
    expect(mocks.markSectionVisited).toHaveBeenCalledWith("drill-mastery");
  });

  it("only requests completion after the gate is earned and reports durable outcomes", () => {
    Object.assign(mocks.gate, { canComplete: true, visitedSectionIds: ["when-to-abandon", "raft-types", "solas-pack", "deployment", "drill-mastery"] });
    const view = render(<TestRouter><LifeRaftTheory releaseReview={approved} /></TestRouter>);
    fireEvent.click(screen.getByRole("button", { name: "Complete lesson" }));
    fireEvent.click(screen.getByRole("button", { name: "Complete lesson" }));
    expect(mocks.markCompleted).toHaveBeenCalledTimes(2); // Hook coalesces rapid writes into one durable transaction.
    Object.assign(mocks.gate, { isCompletionDurable: true, saveState: "queued" });
    view.rerender(<TestRouter><LifeRaftTheory releaseReview={approved} /></TestRouter>);
    expect(screen.getByRole("status").textContent).toContain("queued securely");
    expect((screen.getByRole("button", { name: "Completed" }) as HTMLButtonElement).disabled).toBe(true);
  });

  it("offers accessible load and save retries and narrow touch-safe tabs", () => {
    Object.assign(mocks.gate, { loadState: "failed", saveState: "failed" });
    const view = render(<TestRouter><LifeRaftTheory releaseReview={approved} /></TestRouter>);
    fireEvent.click(screen.getByRole("button", { name: "Retry load" }));
    expect(mocks.retryLoad).toHaveBeenCalledOnce();
    expect(screen.getByRole("tablist", { name: "Life raft lesson sections" }).className).toContain("grid-cols-1");
    expect(screen.getByRole("tab", { name: "When to Abandon" }).className).toContain("min-h-11");
    Object.assign(mocks.gate, { loadState: "ready", saveState: "failed" });
    view.rerender(<TestRouter><LifeRaftTheory releaseReview={approved} /></TestRouter>);
    fireEvent.click(screen.getByRole("button", { name: "Retry save" }));
    expect(mocks.retrySave).toHaveBeenCalledOnce();
  });
});
