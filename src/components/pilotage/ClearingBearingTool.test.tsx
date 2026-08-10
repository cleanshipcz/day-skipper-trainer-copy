import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ClearingBearingTool } from "./ClearingBearingTool";
import { CLEARING_BEARING_SCENARIOS, solutionFor } from "./clearingBearingScenarios";

const solveCurrent = (index: number) => {
  const solution = solutionFor(CLEARING_BEARING_SCENARIOS[index]);
  const assessable = solution.rule === "NLT" ? Math.ceil(solution.bearing) : Math.floor(solution.bearing);
  fireEvent.change(screen.getByLabelText(/Rotate plotting line/), { target: { value: String(assessable) } });
  fireEvent.click(screen.getByRole("button", { name: solution.rule }));
  fireEvent.click(screen.getByRole("button", { name: "Check plotted answer" }));
};

describe("ClearingBearingTool mastery flow", () => {
  it("does not disclose the solution before assessment and gives retry guidance", () => {
    render(<ClearingBearingTool />);
    expect(screen.queryByText(/Limit \d{3}°T/)).toBeNull();
    fireEvent.change(screen.getByLabelText(/Rotate plotting line/), { target: { value: "180" } });
    fireEvent.click(screen.getByRole("button", { name: "NMT" }));
    fireEvent.click(screen.getByRole("button", { name: "Check plotted answer" }));
    expect(screen.getByRole("alert").textContent).toMatch(/Replot|inequality/);
    expect(screen.getByRole("alert").textContent).toMatch(/test position/i);
  });

  it("calls completion only once after both scenarios are solved", async () => {
    let resolve!: (value: boolean) => void;
    const complete = vi.fn(() => new Promise<boolean>((done) => { resolve = done; }));
    render(<ClearingBearingTool onAllScenariosComplete={complete} />);
    solveCurrent(0);
    expect(complete).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Next scenario" }));
    solveCurrent(1);
    expect(complete).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Record mastery" }));
    fireEvent.click(screen.getByRole("button", { name: "Saving mastery…" }));
    expect(complete).toHaveBeenCalledOnce();
    resolve(true);
    await waitFor(() => expect(screen.getByRole("button", { name: "Mastery recorded" })).toBeTruthy());
  });

  it("reports a failed save and permits an explicit retry", async () => {
    const complete = vi.fn().mockResolvedValueOnce(false).mockResolvedValueOnce(true);
    render(<ClearingBearingTool onAllScenariosComplete={complete} />);
    solveCurrent(0); fireEvent.click(screen.getByRole("button", { name: "Next scenario" })); solveCurrent(1);
    fireEvent.click(screen.getByRole("button", { name: "Record mastery" }));
    await waitFor(() => expect(screen.getByRole("alert").textContent).toMatch(/not saved/i));
    fireEvent.click(screen.getByRole("button", { name: "Retry saving mastery" }));
    await waitFor(() => expect(screen.getByRole("button", { name: "Mastery recorded" })).toBeTruthy());
    expect(complete).toHaveBeenCalledTimes(2);
  });

  it("labels chart meaning and bearing direction", () => {
    render(<ClearingBearingTool />);
    expect(screen.getByRole("img", { name: /clearance margin and safe-water area/ })).toBeTruthy();
    expect(screen.getByText(/measured clockwise at the vessel towards the named mark/i)).toBeTruthy();
    expect(screen.getByLabelText(/Rotate plotting line/).getAttribute("type")).toBe("range");
    const line = screen.getByTestId("plotting-line");
    const before = line.getAttribute("x2");
    fireEvent.change(screen.getByLabelText(/Rotate plotting line/), { target: { value: "200" } });
    expect(screen.getByTestId("plotting-line").getAttribute("x2")).not.toBe(before);
  });
});
