import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TheoryCompletionButton } from "./TheoryCompletionButton";

const gate = vi.hoisted(() => ({
  canComplete: false,
  saveState: "idle" as "idle" | "saving" | "saved" | "local" | "queued" | "failed",
  isHydrated: true,
  isCompletionDurable: false,
  markCompleted: vi.fn(),
  markSectionVisited: vi.fn(),
}));
vi.mock("./useTheoryCompletionGate", () => ({ useTheoryCompletionGate: vi.fn(() => gate) }));

const renderControl = (evidenceSatisfied = false, lockedLabel?: string) => render(
  <TheoryCompletionButton topicId="leaf" catalogueRevision="v1" evidenceId="checked" evidenceSatisfied={evidenceSatisfied} lockedLabel={lockedLabel} />,
);

describe("TheoryCompletionButton", () => {
  beforeEach(() => {
    Object.assign(gate, { canComplete: false, saveState: "idle", isHydrated: true, isCompletionDurable: false });
    gate.markCompleted.mockReset().mockResolvedValue(true);
    gate.markSectionVisited.mockReset().mockResolvedValue(undefined);
  });

  it("stays locked until evidence is satisfied and records only deliberate evidence", () => {
    const view = renderControl(false, "Solve the check");
    expect(screen.getByRole("button", { name: "Solve the check" }).hasAttribute("disabled")).toBe(true);
    expect(screen.getByRole("status").textContent).toBe("Solve the check");
    expect(gate.markSectionVisited).not.toHaveBeenCalled();
    view.rerender(<TheoryCompletionButton topicId="leaf" catalogueRevision="v1" evidenceId="checked" evidenceSatisfied />);
    expect(gate.markSectionVisited).toHaveBeenCalledWith("checked");
  });

  it.each([
    [false, "saving", false, "Saving…", "Saving progress…"],
    [true, "saved", true, "Saved", "Completion saved to your account."],
    [true, "queued", true, "Queued offline", "Completion is durably queued on this device"],
    [true, "local", true, "Completed on this device", "Completed on this device. Sign in"],
    [true, "local", false, "Save completion", "Activity evidence recorded"],
    [true, "failed", false, "Retry completion", "Completion was not saved"],
    [true, "idle", false, "Save completion", "Activity evidence recorded"],
  ] as const)("renders hydrated outcome %s/%s", (canComplete, saveState, durable, button, status) => {
    Object.assign(gate, { canComplete, saveState, isCompletionDurable: durable });
    renderControl();
    expect(screen.getByRole("button", { name: button })).toBeTruthy();
    expect(screen.getByRole("status").textContent).toContain(status);
  });

  it("exposes loading state while hydration is unresolved", () => {
    gate.isHydrated = false;
    renderControl();
    expect(screen.getByRole("button", { name: "Loading progress…" }).hasAttribute("disabled")).toBe(true);
    expect(screen.getByRole("status").textContent).toBe("Loading saved progress…");
  });

  it("keeps evidence available and announces an unsuccessful completion activation", async () => {
    gate.canComplete = true;
    gate.markCompleted.mockResolvedValue(false);
    renderControl();
    await userEvent.click(screen.getByRole("button", { name: "Save completion" }));
    expect(gate.markCompleted).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("status").textContent).toMatch(/evidence remains available; retry/i);
  });

  it("accepts a successful completion activation without a false failure announcement", async () => {
    gate.canComplete = true;
    renderControl();
    await userEvent.click(screen.getByRole("button", { name: "Save completion" }));
    expect(gate.markCompleted).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("status").textContent).toContain("Activity evidence recorded");
  });
});
