import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ChartsTheory from "../src/pages/ChartsTheory";
import TestRouter from "./TestRouter";

// Mock dependencies to focus on component structure
vi.mock("@/components/navigation/ChartSymbolQuiz", () => ({
  default: () => <div data-testid="chart-symbol-quiz">Mock Quiz</div>,
}));

vi.mock("@/components/navigation/VirtualChartPlotter", () => ({
  default: () => <div data-testid="virtual-chart-plotter">Mock Plotter</div>,
}));

// Mock hooks
vi.mock("@/hooks/useProgress", () => ({
  useProgress: () => ({
    saveProgress: vi.fn(),
  }),
}));

describe("ChartsTheory Page", () => {
  it("renders all main educational sections via tabs", async () => {
    const user = userEvent.setup();
    render(
      <TestRouter>
        <ChartsTheory />
      </TestRouter>
    );

    // Tab 1: Coordinates (Default)
    expect(screen.getByText("1. Anatomy of a Chart")).toBeDefined();
    expect(screen.getByText("Summary: Measuring Distance")).toBeDefined();

    // Tab 2: Depths & Tides
    const depthsTab = screen.getByRole("tab", { name: /Depths & Tides/i });
    await user.click(depthsTab);
    expect(await screen.findByText("2. The Vertical Dimension")).toBeDefined();
    expect(await screen.findByText("Chart Datum (CD)")).toBeDefined();

    // Tab 3: Symbols & Keys
    const symbolsTab = screen.getByRole("tab", { name: /Symbols & Keys/i });
    await user.click(symbolsTab);
    expect(await screen.findByText("3. Symbols & Abbreviations")).toBeDefined();
    // Replaced "Identifying Symbols" with "Reading the Language of the Sea" or similar, or just check the main header
    expect(await screen.findByText("Reading the Language of the Sea")).toBeDefined();
  });

  it("renders interactive tools in correct tabs", async () => {
    const user = userEvent.setup();
    render(
      <TestRouter>
        <ChartsTheory />
      </TestRouter>
    );

    // Tab 1: Virtual Chart Plotter
    expect(screen.getByTestId("virtual-chart-plotter")).toBeDefined();

    // Tab 2: Tidal Visualizer
    const depthsTab = screen.getByRole("tab", { name: /Depths & Tides/i });
    await user.click(depthsTab);
    // Tidal visualizer main text
    expect(await screen.findByText(/Interactive Tidal Visualizer/i)).toBeDefined();

    // Tab 3: Chart Symbol Quiz
    const symbolsTab = screen.getByRole("tab", { name: /Symbols & Keys/i });
    await user.click(symbolsTab);
    expect(await screen.findByTestId("chart-symbol-quiz")).toBeDefined();
  });
});
