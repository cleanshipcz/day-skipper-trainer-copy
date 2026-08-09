import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  canComplete: false,
  saveState: "idle",
  visitedSectionIds: [] as string[],
  markSectionVisited: vi.fn(),
  markCompleted: vi.fn(),
}));

vi.mock("@/features/progress/useTheoryCompletionGate", () => ({
  useTheoryCompletionGate: () => mocks,
}));

import LightsTheory from "./LightsTheory";

describe("LightsTheory accessibility contract", () => {
  beforeEach(() => {
    mocks.canComplete = false;
    mocks.saveState = "idle";
    mocks.visitedSectionIds = [];
    mocks.markSectionVisited.mockReset().mockResolvedValue(undefined);
    mocks.markCompleted.mockReset().mockResolvedValue(false);
  });

  it("provides named navigation, landmarks, tabs and completion groups", () => {
    render(<MemoryRouter><LightsTheory /></MemoryRouter>);
    expect(screen.getByRole("banner")).toBeTruthy();
    expect(screen.getByRole("main")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Back to lights and signals menu" })).toBeTruthy();
    expect(screen.getByRole("tablist", { name: "Lights theory sections" })).toBeTruthy();
    expect(screen.getAllByRole("group")).toHaveLength(3);
    expect(screen.getByRole("status").textContent).toContain("Complete all three evidence checks");
  });

  it("announces evidence success and failure without moving focus", async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><LightsTheory /></MemoryRouter>);
    const group = screen.getByRole("group", { name: "Part C lights and shapes" });
    await user.click(group.querySelector("input[type=checkbox]")!);
    await user.click(screen.getByLabelText("A vessel fishing other than trawling"));
    const record = screen.getAllByRole("button", { name: "Record objective evidence" })[0];
    record.focus();
    await user.click(record);
    expect(screen.getByRole("status").textContent).toContain("evidence recorded");
    expect(document.activeElement).toBe(record);

    mocks.markSectionVisited.mockRejectedValueOnce(new Error("offline"));
    await user.click(record);
    expect(screen.getByRole("status").textContent).toContain("could not be recorded");
    expect(document.activeElement).toBe(record);
  });

  it("announces failed completion and retains focus for retry", async () => {
    mocks.canComplete = true;
    const user = userEvent.setup();
    render(<MemoryRouter><LightsTheory /></MemoryRouter>);
    const complete = screen.getByRole("button", { name: "Complete Module" });
    complete.focus();
    await user.click(complete);
    await waitFor(() => expect(screen.getByRole("status").textContent).toContain("could not be saved"));
    expect(document.activeElement).toBe(complete);
  });
});
