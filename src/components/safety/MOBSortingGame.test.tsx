import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import {
  isValidMobDrillOrder,
  MOB_DRILL_CONTRACT_REVISION,
  MOB_DRILL_SCENARIOS,
  MOB_DRILL_STORAGE_KEY,
  saveMobDrillEvidence,
  shuffleMobDrillSteps,
} from "./mobDrillModel";
import { MOBSortingGame } from "./MOBSortingGame";
import { MOB_RECOVERY_CONSTRAINTS, MOB_THEORY_OUTCOMES } from "@/data/mobGuidance";

const renderGame = () => render(<MemoryRouter><MOBSortingGame /></MemoryRouter>);

describe("MOB drill contract", () => {
  beforeEach(() => { localStorage.clear(); vi.restoreAllMocks(); });

  it("consumes reviewed outcomes and exposes every non-negotiable boundary", () => {
    const steps = Object.values(MOB_DRILL_SCENARIOS).flatMap((scenario) => [...scenario.steps]);
    expect(steps.every((step) => MOB_THEORY_OUTCOMES.includes(step.outcome))).toBe(true);
    renderGame();
    fireEvent.click(screen.getByText("Safety boundaries used by this drill"));
    for (const constraint of MOB_RECOVERY_CONSTRAINTS) expect(screen.getByText(constraint)).toBeTruthy();
  });

  it("accepts permutations only inside a concurrent phase", () => {
    const ordered = [...MOB_DRILL_SCENARIOS.immediate.steps];
    expect(isValidMobDrillOrder(ordered)).toBe(true);
    const concurrentSwap = [...ordered];
    [concurrentSwap[1], concurrentSwap[4]] = [concurrentSwap[4], concurrentSwap[1]];
    expect(isValidMobDrillOrder(concurrentSwap)).toBe(true);
    expect(isValidMobDrillOrder([...ordered.slice(1), ordered[0]])).toBe(false);
  });

  it("always returns a non-pre-solved shuffle, including a hostile deterministic RNG", () => {
    for (const scenario of Object.values(MOB_DRILL_SCENARIOS)) {
      expect(isValidMobDrillOrder(shuffleMobDrillSteps(scenario.steps, () => 0))).toBe(false);
      expect(shuffleMobDrillSteps(scenario.steps, () => 0)).toHaveLength(scenario.steps.length);
    }
  });

  it("provides semantic scenario selection, labelled touch controls and source-aligned feedback", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    renderGame();
    expect(screen.getByRole("group", { name: "Choose a scenario" })).toBeTruthy();
    const approach = screen.getByRole("radio", { name: "Return, approach and recovery decisions" });
    fireEvent.click(approach);
    expect((approach as HTMLInputElement).checked).toBe(true);
    expect(screen.getAllByRole("button", { name: /^Move .+ (up|down)$/ }).every((button) => button.className.includes("h-11"))).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: "Check decision boundaries" }));
    expect(screen.getByRole("status").textContent).toMatch(/belongs before|concurrent roles/i);
    expect(screen.getByRole("link", { name: /Review the source-aligned theory/ }).getAttribute("href")).toBe("/safety/mob#mob-handoff");
  });

  it("supports keyboard activation, announces moves and retains focus on the moved action", async () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    renderGame();
    const down = screen.getAllByRole("button", { name: / down$/ }).find((button) => !(button as HTMLButtonElement).disabled)!;
    const actionName = down.getAttribute("aria-label")!.replace(/^Move /, "").replace(/ down$/, "");
    down.focus();
    fireEvent.keyDown(down, { key: "Enter" });
    fireEvent.click(down);
    await waitFor(() => expect(screen.getByRole("status").textContent).toContain("moved to position"));
    await waitFor(() => expect(document.activeElement?.textContent).toContain(actionName));
  });

  it("resets and reshuffles on scenario switches without retaining solved feedback", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    renderGame();
    fireEvent.click(screen.getByRole("button", { name: "Check decision boundaries" }));
    fireEvent.click(screen.getByRole("button", { name: "Reset and shuffle" }));
    expect(screen.getByRole("status").textContent).toMatch(/reset in a shuffled order/i);
    fireEvent.click(screen.getByRole("radio", { name: "Return, approach and recovery decisions" }));
    expect(screen.getByRole("status").textContent).toMatch(/Return, approach and recovery decisions reset/i);
  });

  it("persists versioned scenario evidence that explicitly avoids a mastery claim", () => {
    expect(MOB_DRILL_CONTRACT_REVISION).toBe(1);
    expect(MOB_DRILL_STORAGE_KEY).toContain("evidence:v1");
    expect(saveMobDrillEvidence("immediate")).toBe(true);
    expect(saveMobDrillEvidence("approach")).toBe(true);
    expect(JSON.parse(localStorage.getItem(MOB_DRILL_STORAGE_KEY) ?? "null")).toMatchObject({
      revision: 1,
      completedScenarioIds: ["immediate", "approach"],
      attempts: 2,
      claim: "practice-completed-not-mastery",
    });
    expect(JSON.parse(localStorage.getItem(MOB_DRILL_STORAGE_KEY) ?? "null").lastCompletedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });
});
