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

  it("teaches Mercator graticule and local latitude distance accurately", () => {
    render(
      <TestRouter>
        <ChartsTheory />
      </TestRouter>
    );

    expect(screen.getByText(/mathematical transformation, not a perspective view/i)).toBeDefined();
    expect(screen.getByText(/meridians are parallel on the chart even though they converge on the globe/i)).toBeDefined();
    expect(screen.getByText(/1′ is approximately 1 NM/i)).toBeDefined();
    expect(screen.queryByText(/light bulb in the center/i)).toBeNull();
    expect(screen.queryByText(/equidistant everywhere/i)).toBeNull();
  });

  it("keeps datum advice qualified and includes a checked worked UKC procedure", async () => {
    const user = userEvent.setup();
    render(
      <TestRouter>
        <ChartsTheory />
      </TestRouter>
    );

    await user.click(screen.getByRole("tab", { name: /Depths & Tides/i }));
    expect(await screen.findByText(/never assume that Chart Datum is LAT/i)).toBeDefined();
    expect(screen.getByText(/Predictions are estimates, not observations/i)).toBeDefined();
    expect(screen.getByText(/predicted\/static UKC = 4.6 − 2.0 =/i)).toBeDefined();
    expect(screen.getByText(/allowance-adjusted\/dynamic UKC = 2.6 − 0.3 − 0.2 =/i)).toBeDefined();
    expect(screen.getByText(/1.6 m excess above the required reserve/i)).toBeDefined();
    expect(screen.queryByText(/usable UKC/i)).toBeNull();
    expect(screen.queryByText(/practically guaranteed/i)).toBeNull();

    await user.click(screen.getByRole("tab", { name: /Symbols & Keys/i }));
    expect((await screen.findAllByText(/INT 1, edition 8 \(2020\)/i)).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Untinted water is not a promise of sufficient depth/i)).toBeDefined();
    expect(
      screen.getByRole("link", { name: /IHO S-4, edition 4.10.0/i }).getAttribute("href")
    ).toContain("S-4%20Ed%204.10.0_FINAL.pdf");
  });
});
