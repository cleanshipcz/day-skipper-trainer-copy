import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  AbandonShipSortingGame,
} from "../src/components/safety/AbandonShipSortingGame";
import { ABANDON_SHIP_SCENARIOS, abandonShipEvidenceKey, findDependencyViolations, hasAllScenarioEvidence, parseDrillEvidence } from "../src/data/abandonShipDrill";

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

describe("abandon-ship dependency model", () => {
  it("accepts alternate permutations when independent actions change order", () => {
    const scenario = ABANDON_SHIP_SCENARIOS[0];
    const [alarm, distress, protect, deploy] = scenario.steps;
    expect(findDependencyViolations([alarm, distress, protect, deploy], scenario.dependencies)).toEqual([]);
    expect(findDependencyViolations([protect, distress, alarm, deploy], scenario.dependencies)).toEqual([]);
  });

  it("identifies the exact unsafe dependency and diagnostic reason", () => {
    const scenario = ABANDON_SHIP_SCENARIOS[1];
    const violations = findDependencyViolations([...scenario.steps].reverse(), scenario.dependencies);
    expect(violations).toHaveLength(4);
    expect(violations[0].reason).toMatch(/wind, sea, list, obstructions/i);
  });

  it("deduplicates known persisted IDs and rejects malformed completion evidence", () => {
    const parsed = parseDrillEvidence(JSON.stringify({ version: 2, masteredScenarioIds: ["fast-fire", "fast-fire", "unknown"], completedAt: "2026-08-12T03:00:00.000Z" }));
    expect(parsed).toEqual({ masteredScenarioIds: ["fast-fire"], completedAt: null });
    expect(parseDrillEvidence("{broken")).toEqual({ masteredScenarioIds: [], completedAt: null });
    expect(hasAllScenarioEvidence(["fast-fire", "fast-fire", "sinking-manual", "casualty-boarding"])).toBe(false);
  });

  it("covers vessel, fire, sinking, weather, crew and equipment context", () => {
    const contexts = ABANDON_SHIP_SCENARIOS.map((scenario) => `${scenario.title} ${scenario.context}`).join(" ");
    expect(contexts).toMatch(/vessel/i);
    expect(contexts).toMatch(/fire/i);
    expect(contexts).toMatch(/sinking/i);
    expect(contexts).toMatch(/weather/i);
    expect(contexts).toMatch(/crew/i);
    expect(contexts).toMatch(/equipment/i);
  });
});

describe("AbandonShipSortingGame", () => {
  beforeEach(() => { vi.clearAllMocks(); localStorage.clear(); });

  it("starts deterministically unsolved and reports each violated dependency", async () => {
    const user = userEvent.setup();
    render(<AbandonShipSortingGame />);
    expect(screen.getByRole("tab", { name: "Fast-moving fire" }).getAttribute("aria-selected")).toBe("true");
    await user.click(screen.getByRole("button", { name: "Check safety dependencies" }));
    const alert = screen.getByRole("alert");
    expect(alert.textContent).toContain("Revise 2 unsafe dependencies");
    expect(alert.textContent).toMatch(/account for the crew/i);
    expect(within(alert).getByRole("button", { name: /review.*theory/i })).toBeDefined();
  });

  it("exposes semantic order, labelled controls, touch targets and move announcements", async () => {
    const user = userEvent.setup();
    render(<AbandonShipSortingGame />);
    const list = screen.getByRole("list", { name: /proposed action order/i });
    const firstAction = within(list).getAllByRole("listitem")[0];
    const later = within(firstAction).getByRole("button", { name: /move .* later/i });
    expect(later.classList.contains("h-11")).toBe(true);
    expect(later.classList.contains("w-11")).toBe(true);
    expect(later.classList.contains("touch-manipulation")).toBe(true);
    await user.click(later);
    expect(screen.getByText(/moved to position 2 of 4/i)).toBeDefined();
    expect(document.activeElement).toBe(within(list).getAllByRole("listitem")[1]);
  });

  it("switches scenario state semantically and reset restores an invalid order", async () => {
    const user = userEvent.setup();
    render(<AbandonShipSortingGame />);
    const sinking = screen.getByRole("tab", { name: /flooding vessel/i });
    await user.click(sinking);
    expect(sinking.getAttribute("aria-selected")).toBe("true");
    expect(screen.getByRole("tabpanel").getAttribute("aria-labelledby")).toBe("scenario-sinking-manual");
    expect(screen.getByText(/designated painter strong point remain safely accessible/i)).toBeDefined();
    await user.click(screen.getByRole("button", { name: "Reset scenario" }));
    expect(screen.getByText(/reset to an unsolved order/i)).toBeDefined();
    await user.click(screen.getByRole("button", { name: "Check safety dependencies" }));
    expect(screen.getByRole("alert").textContent).toContain("Revise 4 unsafe dependencies");
  });

  it("restores only versioned, known browser-local context evidence", () => {
    localStorage.setItem(abandonShipEvidenceKey(null, "life-raft-qualified-guidance-drill-v3"), JSON.stringify({ version: 2, masteredScenarioIds: ["fast-fire", "forged-unknown"], completedAt: "forged" }));
    render(<AbandonShipSortingGame />);
    expect(screen.getByTestId("drill-progress").textContent).toContain("1 of 4 complete");
    expect(screen.getByRole("tab", { name: /fast-moving fire — complete/i })).toBeDefined();
  });

  it("preserves a valid completedAt across remount instead of regenerating it", () => {
    const completedAt = "2026-08-12T03:00:00.000Z";
    const masteredScenarioIds = ABANDON_SHIP_SCENARIOS.map((scenario) => scenario.id);
    const key = abandonShipEvidenceKey(null, "life-raft-qualified-guidance-drill-v3");
    localStorage.setItem(key, JSON.stringify({ version: 2, masteredScenarioIds, completedAt }));
    const view = render(<AbandonShipSortingGame />);
    view.unmount();
    render(<AbandonShipSortingGame />);
    expect(JSON.parse(localStorage.getItem(key)!).completedAt).toBe(completedAt);
    expect(screen.getByTestId("drill-progress").textContent).toContain("All contexts completed");
  });

  it("never promotes anonymous or another account's evidence during an in-place owner switch", async () => {
    const completedAt = "2026-08-12T03:00:00.000Z";
    const masteredScenarioIds = ABANDON_SHIP_SCENARIOS.map(({ id }) => id);
    const anonymousKey = abandonShipEvidenceKey(null, "life-raft-qualified-guidance-drill-v3");
    const accountAKey = abandonShipEvidenceKey("account-a", "life-raft-qualified-guidance-drill-v3");
    const accountBKey = abandonShipEvidenceKey("account-b", "life-raft-qualified-guidance-drill-v3");
    localStorage.setItem(anonymousKey, JSON.stringify({ version: 2, masteredScenarioIds, completedAt }));
    localStorage.setItem(accountAKey, JSON.stringify({ version: 2, masteredScenarioIds: ["fast-fire"], completedAt: null }));
    const onEvidenceChange = vi.fn();
    const view = render(<AbandonShipSortingGame evidenceOwnerId="account-a" onEvidenceChange={onEvidenceChange} />);
    expect(screen.getByTestId("drill-progress").textContent).toContain("1 of 4 complete");
    onEvidenceChange.mockClear();
    view.rerender(<AbandonShipSortingGame evidenceOwnerId="account-b" onEvidenceChange={onEvidenceChange} />);
    expect(await screen.findByText(/0 of 4 complete/)).toBeDefined();
    expect(localStorage.getItem(accountBKey)).not.toContain("fast-fire");
    expect(onEvidenceChange.mock.calls.some(([evidence]) => hasAllScenarioEvidence(evidence.masteredScenarioIds))).toBe(false);
  });

  it("does not migrate the unscoped legacy key because its learner ownership is unknowable", () => {
    localStorage.setItem("life-raft-context-drill-v2", JSON.stringify({ version: 2, masteredScenarioIds: ABANDON_SHIP_SCENARIOS.map(({ id }) => id), completedAt: "2026-08-12T03:00:00.000Z" }));
    render(<AbandonShipSortingGame evidenceOwnerId="account-a" />);
    expect(screen.getByTestId("drill-progress").textContent).toContain("0 of 4 complete");
  });

  it("fails soft when browser storage blocks reads", () => {
    const getItem = vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => { throw new DOMException("Blocked", "SecurityError"); });
    expect(() => render(<AbandonShipSortingGame />)).not.toThrow();
    expect(screen.getByTestId("drill-progress").textContent).toContain("0 of 4 complete");
    getItem.mockRestore();
  });

  it("uses narrow-screen-safe wrapping and 44px controls for 320/375px and 200% zoom", () => {
    const { container } = render(<AbandonShipSortingGame />);
    expect(container.firstElementChild?.classList.contains("min-w-0")).toBe(true);
    expect(screen.getByRole("tablist").classList.contains("grid-cols-1")).toBe(true);
    for (const tab of screen.getAllByRole("tab")) {
      expect(tab.classList.contains("whitespace-normal")).toBe(true);
      expect(tab.classList.contains("min-h-11")).toBe(true);
    }
    expect(container.querySelector(".overflow-x-auto")).toBeNull();
  });
});
