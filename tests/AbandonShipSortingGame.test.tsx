import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  AbandonShipSortingGame,
} from "../src/components/safety/AbandonShipSortingGame";
import { ABANDON_SHIP_EVIDENCE_KEY, ABANDON_SHIP_SCENARIOS, findDependencyViolations } from "../src/data/abandonShipDrill";

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
    expect(violations).toHaveLength(3);
    expect(violations[0].reason).toMatch(/wind, sea, list, obstructions/i);
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
    expect(within(alert).getByRole("link", { name: /review.*theory/i }).getAttribute("href")).toBe("#life-raft-procedures");
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
    const sinking = screen.getByRole("tab", { name: /rapid sinking/i });
    await user.click(sinking);
    expect(sinking.getAttribute("aria-selected")).toBe("true");
    expect(screen.getByRole("tabpanel").getAttribute("aria-labelledby")).toBe("scenario-sinking-auto");
    expect(screen.getByText(/approved installation provides automatic launch/i)).toBeDefined();
    await user.click(screen.getByRole("button", { name: "Reset scenario" }));
    expect(screen.getByText(/reset to an unsolved order/i)).toBeDefined();
    await user.click(screen.getByRole("button", { name: "Check safety dependencies" }));
    expect(screen.getByRole("alert").textContent).toContain("Revise 3 unsafe dependencies");
  });

  it("restores only versioned, known browser-local context evidence", () => {
    localStorage.setItem(ABANDON_SHIP_EVIDENCE_KEY, JSON.stringify({ version: 2, masteredScenarioIds: ["fast-fire", "forged-unknown"], completedAt: "forged" }));
    render(<AbandonShipSortingGame />);
    expect(screen.getByTestId("drill-progress").textContent).toContain("1 of 4 complete");
    expect(screen.getByRole("tab", { name: /fast-moving fire — complete/i })).toBeDefined();
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
