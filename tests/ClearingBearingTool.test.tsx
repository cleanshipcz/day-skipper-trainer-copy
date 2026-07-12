import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ClearingBearingTool } from "../src/components/pilotage/ClearingBearingTool";
import TestRouter from "./TestRouter";

// Mock ChartSurface to avoid complex SVG rendering in unit tests.
vi.mock("@/components/navigation/unified/ChartSurface", () => ({
  __esModule: true,
  default: vi.fn().mockImplementation(({ children }: { children?: React.ReactNode }) => (
    <svg data-testid="chart-surface">{children}</svg>
  )),
}));

describe("ClearingBearingTool", () => {
  const mockOnAllComplete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // AC-2: Minimum 2 scenarios
  it("should render the first scenario description", () => {
    // when
    render(
      <TestRouter>
        <ClearingBearingTool onAllScenariosComplete={mockOnAllComplete} />
      </TestRouter>,
    );

    // then - scenario counter and description
    expect(screen.getByText(/Scenario 1 of 2/)).toBeDefined();
    expect(screen.getAllByText(/clearing bearing/i).length).toBeGreaterThanOrEqual(1);
  });

  it("should display an instruction prompt for user interaction", () => {
    // when
    render(
      <TestRouter>
        <ClearingBearingTool onAllScenariosComplete={mockOnAllComplete} />
      </TestRouter>,
    );

    // then - user should see instructions on what to do
    expect(screen.getByText(/Plot the clearing bearing/i)).toBeDefined();
  });

  it("should render a bearing input for users to enter their plotted bearing", () => {
    // when
    render(
      <TestRouter>
        <ClearingBearingTool onAllScenariosComplete={mockOnAllComplete} />
      </TestRouter>,
    );

    // then
    expect(screen.getByLabelText(/bearing/i)).toBeDefined();
  });

  it("should render a submit button to check the user answer", () => {
    // when
    render(
      <TestRouter>
        <ClearingBearingTool onAllScenariosComplete={mockOnAllComplete} />
      </TestRouter>,
    );

    // then
    expect(
      screen.getByRole("button", { name: /check/i }),
    ).toBeDefined();
  });

  // AC-3: Validates user-plotted bearings with tolerance
  it("should show success feedback when bearing is within tolerance", async () => {
    // given
    const user = userEvent.setup();
    render(
      <TestRouter>
        <ClearingBearingTool onAllScenariosComplete={mockOnAllComplete} />
      </TestRouter>,
    );

    // when - enter a bearing close to the expected value for scenario 1
    const input = screen.getByLabelText(/bearing/i);
    await user.clear(input);
    // The first scenario expects a bearing around 045 (NLT) — we enter within tolerance
    await user.type(input, "045");
    await user.click(screen.getByRole("button", { name: /check/i }));

    // then
    expect(await screen.findByText(/correct/i)).toBeDefined();
  });

  it("should show error feedback when bearing is outside tolerance", async () => {
    // given
    const user = userEvent.setup();
    render(
      <TestRouter>
        <ClearingBearingTool onAllScenariosComplete={mockOnAllComplete} />
      </TestRouter>,
    );

    // when - enter a bearing far from the expected value
    const input = screen.getByLabelText(/bearing/i);
    await user.clear(input);
    await user.type(input, "180");
    await user.click(screen.getByRole("button", { name: /check/i }));

    // then
    expect(await screen.findByText(/incorrect/i)).toBeDefined();
  });

  // AC-2: Minimum 2 scenarios — can advance to scenario 2
  it("should advance to scenario 2 after correctly completing scenario 1", async () => {
    // given
    const user = userEvent.setup();
    render(
      <TestRouter>
        <ClearingBearingTool onAllScenariosComplete={mockOnAllComplete} />
      </TestRouter>,
    );

    // when - solve scenario 1 correctly
    const input = screen.getByLabelText(/bearing/i);
    await user.clear(input);
    await user.type(input, "045");
    await user.click(screen.getByRole("button", { name: /check/i }));

    // then - Next button appears, click it
    const nextButton = await screen.findByRole("button", {
      name: /next scenario/i,
    });
    await user.click(nextButton);

    // then - scenario 2 is displayed
    expect(screen.getByText(/scenario 2/i)).toBeDefined();
  });

  it("should display the chart surface with hazard markers", () => {
    // when
    render(
      <TestRouter>
        <ClearingBearingTool onAllScenariosComplete={mockOnAllComplete} />
      </TestRouter>,
    );

    // then - chart surface is rendered
    expect(screen.getByTestId("chart-surface")).toBeDefined();
  });

  it("should indicate the convention type (NLT or NMT) for each scenario", () => {
    // when
    render(
      <TestRouter>
        <ClearingBearingTool onAllScenariosComplete={mockOnAllComplete} />
      </TestRouter>,
    );

    // then - convention label is shown (first scenario is NLT)
    expect(screen.getAllByText(/Not Less Than/i).length).toBeGreaterThanOrEqual(1);
  });

  it("should call onAllScenariosComplete after all scenarios are solved", async () => {
    // given
    const user = userEvent.setup();
    render(
      <TestRouter>
        <ClearingBearingTool onAllScenariosComplete={mockOnAllComplete} />
      </TestRouter>,
    );

    // when - solve scenario 1
    const input = screen.getByLabelText(/bearing/i);
    await user.clear(input);
    await user.type(input, "045");
    await user.click(screen.getByRole("button", { name: /check/i }));
    await user.click(await screen.findByRole("button", { name: /next scenario/i }));

    // when - solve scenario 2
    const input2 = screen.getByLabelText(/bearing/i);
    await user.clear(input2);
    await user.type(input2, "320");
    await user.click(screen.getByRole("button", { name: /check/i }));

    // then - after last scenario, the callback should fire
    // (We need to click "finish" or it fires automatically)
    const finishButton = await screen.findByRole("button", {
      name: /finish|complete/i,
    });
    await user.click(finishButton);

    expect(mockOnAllComplete).toHaveBeenCalled();
  });
});
