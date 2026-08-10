import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CLEARING_BEARING_SCENARIOS, solutionFor } from "@/components/pilotage/clearingBearingScenarios";

const mocks = vi.hoisted(() => ({ save: vi.fn() }));
vi.mock("@/hooks/useProgress", () => ({ useProgress: () => ({ saveProgressDetailed: mocks.save }) }));
const { default: ClearingBearingsTheory } = await import("./ClearingBearingsTheory");

const solve = (index: number) => {
  const solution = solutionFor(CLEARING_BEARING_SCENARIOS[index]);
  fireEvent.change(screen.getByLabelText(/Rotate plotting line/), { target: { value: String(solution.rule === "NLT" ? Math.ceil(solution.bearing) : Math.floor(solution.bearing)) } });
  fireEvent.click(screen.getByRole("button", { name: solution.rule }));
  fireEvent.click(screen.getByRole("button", { name: "Check plotted answer" }));
};

describe("ClearingBearingsTheory completion persistence", () => {
  beforeEach(() => mocks.save.mockReset());

  it("does not claim completion when the durable save fails", async () => {
    mocks.save.mockResolvedValue("failed");
    render(<MemoryRouter><ClearingBearingsTheory /></MemoryRouter>);
    fireEvent.mouseDown(screen.getByRole("tab", { name: /Practice/ }), { button: 0, ctrlKey: false });
    solve(0); fireEvent.click(screen.getByRole("button", { name: "Next scenario" })); solve(1);
    fireEvent.click(screen.getByRole("button", { name: "Record mastery" }));
    await waitFor(() => expect(screen.getByText(/Mastery completion was not saved/)).toBeTruthy());
    expect(screen.getByRole("button", { name: "Complete both mastery scenarios" })).toBeTruthy();
    expect(mocks.save).toHaveBeenCalledOnce();
  });
});
