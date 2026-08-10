import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ClearingBearingTool } from "../src/components/pilotage/ClearingBearingTool";
import TestRouter from "./TestRouter";

vi.mock("@/components/navigation/unified/ChartSurface", () => ({
  __esModule: true,
  default: vi.fn().mockImplementation(({ children }: { children?: React.ReactNode }) => <svg data-testid="chart-surface">{children}</svg>),
}));

const renderTool = (complete = vi.fn().mockResolvedValue(true)) => {
  render(<TestRouter><ClearingBearingTool onAllScenariosComplete={complete} /></TestRouter>);
  return complete;
};

const answer = (bearing: number, rule: "NLT" | "NMT") => {
  fireEvent.change(screen.getByLabelText(/Rotate plotting line/), { target: { value: String(bearing) } });
  fireEvent.click(screen.getByRole("button", { name: rule }));
  fireEvent.click(screen.getByRole("button", { name: /check plotted answer/i }));
};

describe("ClearingBearingTool", () => {
  beforeEach(() => vi.clearAllMocks());

  it("renders the first of two chart-derived scenarios", () => {
    renderTool();
    expect(screen.getByText(/Scenario 1 of 2/)).toBeDefined();
    expect(screen.getByText(/Rocky shoal approach/)).toBeDefined();
  });

  it("prompts the learner to plot and measure without disclosing an answer", () => {
    renderTool();
    expect(screen.getByText(/Plot the limiting line, measure the true bearing/i)).toBeDefined();
    expect(screen.queryByText(/Limit \d{3}°T/)).toBeNull();
  });

  it("renders a keyboard-accessible plotting control", () => {
    renderTool();
    const control = screen.getByLabelText(/Rotate plotting line/);
    expect(control.getAttribute("type")).toBe("range");
    expect(control.getAttribute("aria-describedby")).toContain("clearance-relation");
  });

  it("renders an explicit answer check", () => {
    renderTool();
    expect(screen.getByRole("button", { name: /check plotted answer/i })).toBeDefined();
  });

  it("accepts a safe-side one-degree chart measurement", () => {
    renderTool(); answer(290, "NMT");
    expect(screen.getByText(/Limit 290°T NMT/)).toBeDefined();
  });

  it("gives explanatory feedback for an unsafe answer", () => {
    renderTool(); answer(180, "NLT");
    expect(screen.getByRole("alert").textContent).toMatch(/Replot.*tangent/i);
  });

  it("advances only after scenario one is mastered", () => {
    renderTool();
    expect(screen.queryByRole("button", { name: /next scenario/i })).toBeNull();
    answer(290, "NMT");
    fireEvent.click(screen.getByRole("button", { name: /next scenario/i }));
    expect(screen.getByText(/Scenario 2 of 2/)).toBeDefined();
  });

  it("renders meaningful chart hazards and measurements", () => {
    renderTool();
    expect(screen.getByTestId("chart-surface")).toBeDefined();
    expect(screen.getByText("Rocky Shoal")).toBeDefined();
    expect(screen.getByText(/clearance radius of 40 units/)).toBeDefined();
  });

  it("requires the learner to choose NLT or NMT", () => {
    renderTool();
    expect(screen.getByRole("group", { name: /safe-side rule/i })).toBeDefined();
    fireEvent.click(screen.getByRole("button", { name: /check plotted answer/i }));
    expect(screen.getByRole("alert").textContent).toMatch(/Choose NLT or NMT/);
  });

  it("records mastery only after both scenarios and explicit declaration", async () => {
    const complete = renderTool();
    answer(290, "NMT");
    fireEvent.click(screen.getByRole("button", { name: /next scenario/i }));
    answer(59, "NLT");
    expect(complete).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: /record mastery/i }));
    await waitFor(() => expect(complete).toHaveBeenCalledOnce());
    expect(screen.getByRole("button", { name: /mastery recorded/i })).toBeDefined();
  });
});
