import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ClearingBearingsTheory from "../src/pages/ClearingBearingsTheory";
import TestRouter from "./TestRouter";

// Mock the interactive tool to isolate theory page tests.
vi.mock("@/components/pilotage/ClearingBearingTool", () => ({
  ClearingBearingTool: ({
    onAllScenariosComplete,
  }: {
    onAllScenariosComplete?: () => void;
  }) => (
    <div data-testid="clearing-bearing-tool">
      <button
        data-testid="simulate-all-complete"
        onClick={() => onAllScenariosComplete?.()}
      >
        Complete All
      </button>
    </div>
  ),
}));

const mockSaveProgress = vi.fn();

vi.mock("@/hooks/useProgress", () => ({
  useProgress: () => ({
    saveProgress: mockSaveProgress,
  }),
}));

describe("ClearingBearingsTheory Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the page header with title and back navigation", () => {
    // when
    render(
      <TestRouter>
        <ClearingBearingsTheory />
      </TestRouter>,
    );

    // then
    expect(screen.getByText("Clearing Bearings")).toBeDefined();
    expect(screen.getByLabelText("back")).toBeDefined();
  });

  it("should render tab navigation with theory sections and practice tab", () => {
    // when
    render(
      <TestRouter>
        <ClearingBearingsTheory />
      </TestRouter>,
    );

    // then
    expect(screen.getByRole("tab", { name: /purpose/i })).toBeDefined();
    expect(screen.getByRole("tab", { name: /plotting/i })).toBeDefined();
    expect(screen.getByRole("tab", { name: /conventions/i })).toBeDefined();
    expect(screen.getByRole("tab", { name: /monitoring/i })).toBeDefined();
    expect(screen.getByRole("tab", { name: /practice/i })).toBeDefined();
  });

  // AC-1: Theory covering purpose of clearing bearings
  it("should display purpose of clearing bearings in the default tab", () => {
    // when
    render(
      <TestRouter>
        <ClearingBearingsTheory />
      </TestRouter>,
    );

    // then - purpose/introduction content
    expect(screen.getByText("Purpose of Clearing Bearings")).toBeDefined();
    expect(screen.getAllByText(/safe water/i).length).toBeGreaterThanOrEqual(1);
  });

  // AC-1: Theory covering how to plot clearing bearings on a chart
  it("should display plotting theory when clicking the Plotting tab", async () => {
    // given
    const user = userEvent.setup();
    render(
      <TestRouter>
        <ClearingBearingsTheory />
      </TestRouter>,
    );

    // when
    await user.click(screen.getByRole("tab", { name: /plotting/i }));

    // then
    expect(await screen.findByText("Plotting Clearing Bearings on a Chart")).toBeDefined();
    expect(await screen.findByText(/identify the hazard/i)).toBeDefined();
    expect(screen.getByRole("img", { name: /worked NLT 045 degrees True limit/i })).toBeDefined();
    expect(screen.getAllByText(/SAFE SIDE/i).length).toBe(2);
    expect(screen.getByText(/Tide changes available depth, not the charted hazard's position/i)).toBeDefined();
  });

  // AC-1: Theory covering not-less-than / not-more-than conventions
  it("should display NLT/NMT conventions when clicking the Conventions tab", async () => {
    // given
    const user = userEvent.setup();
    render(
      <TestRouter>
        <ClearingBearingsTheory />
      </TestRouter>,
    );

    // when
    await user.click(screen.getByRole("tab", { name: /conventions/i }));

    // then
    expect(await screen.findByText(/not less than/i)).toBeDefined();
    expect(await screen.findByText(/not more than/i)).toBeDefined();
    expect(screen.getByText(/North-wrap example: 359° \/ 000°/i)).toBeDefined();
    expect(screen.getByText(/Never decide this case with raw/i)).toBeDefined();
  });

  // AC-1: Theory covering using a compass to monitor
  it("should display compass monitoring theory when clicking the Monitoring tab", async () => {
    // given
    const user = userEvent.setup();
    render(
      <TestRouter>
        <ClearingBearingsTheory />
      </TestRouter>,
    );

    // when
    await user.click(screen.getByRole("tab", { name: /monitoring/i }));

    // then
    expect(await screen.findByText("Using a Compass to Monitor Clearing Bearings")).toBeDefined();
    expect(await screen.findByText(/monitoring procedure/i)).toBeDefined();
    expect(screen.getByText(/045° True → 049° Magnetic → 051° Compass/i)).toBeDefined();
    expect(screen.getByText(/045°T \+ 4° = 049°M/i)).toBeDefined();
    expect(screen.getByText(/051°C − 2° = 049°M; 049°M − 4° = 045°T/i)).toBeDefined();
    expect(screen.getByText(/Positively identify the object/i)).toBeDefined();
    expect(screen.getByText(/Monitor the trend/i)).toBeDefined();
    expect(screen.getAllByText(/Notices to Mariners/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/One clearing limit protects one side only/i)).toBeDefined();
    expect(screen.getByRole("link", { name: /MGN 379.*Amendment 1/i }).getAttribute("href")).toBe(
      "https://www.gov.uk/government/publications/mgn-379-amendment-1-navigation-use-of-electronic-navigation-aids",
    );
  });

  it("plots each limiting line outside the full hazard margin", async () => {
    const user = userEvent.setup();
    render(<TestRouter><ClearingBearingsTheory /></TestRouter>);
    await user.click(screen.getByRole("tab", { name: /plotting/i }));

    const lines = screen.getAllByTestId("limiting-line");
    const margins = screen.getAllByTestId("hazard-margin");
    const distances = lines.map((line, index) => {
      const margin = margins[index];
      const x1 = Number(line.getAttribute("x1"));
      const y1 = Number(line.getAttribute("y1"));
      const x2 = Number(line.getAttribute("x2"));
      const y2 = Number(line.getAttribute("y2"));
      const cx = Number(margin.getAttribute("cx"));
      const cy = Number(margin.getAttribute("cy"));
      const radius = Number(margin.getAttribute("r"));
      const signedDistance = ((y2 - y1) * cx - (x2 - x1) * cy + x2 * y1 - y2 * x1) /
        Math.hypot(y2 - y1, x2 - x1);
      return { signedDistance, radius };
    });

    expect(distances[0].signedDistance).toBeLessThan(-distances[0].radius);
    expect(distances[1].signedDistance).toBeGreaterThan(distances[1].radius);
  });

  // AC-2: Interactive ClearingBearingTool rendered in Practice tab
  it("should render the interactive ClearingBearingTool in the Practice tab", async () => {
    // given
    const user = userEvent.setup();
    render(
      <TestRouter>
        <ClearingBearingsTheory />
      </TestRouter>,
    );

    // when
    await user.click(screen.getByRole("tab", { name: /practice/i }));

    // then
    expect(await screen.findByTestId("clearing-bearing-tool")).toBeDefined();
  });

  // AC-4: Should not auto-save progress on mount
  it("should not call saveProgress automatically on mount", () => {
    // when
    render(
      <TestRouter>
        <ClearingBearingsTheory />
      </TestRouter>,
    );

    // then
    expect(mockSaveProgress).not.toHaveBeenCalled();
  });

  // AC-4: Mark complete button saves progress with correct topic ID and points
  it("should save progress with correct topic ID when Mark as Complete is clicked", async () => {
    // given
    const user = userEvent.setup();
    render(
      <TestRouter>
        <ClearingBearingsTheory />
      </TestRouter>,
    );

    // when
    const completeButton = screen.getByRole("button", {
      name: /mark as complete/i,
    });
    await user.click(completeButton);

    // then
    expect(mockSaveProgress).toHaveBeenCalledWith(
      "pilotage-clearing-bearings",
      true,
      100,
      10,
    );
  });

  it("should disable the complete button after completion", async () => {
    // given
    const user = userEvent.setup();
    render(
      <TestRouter>
        <ClearingBearingsTheory />
      </TestRouter>,
    );

    // when
    await user.click(
      screen.getByRole("button", { name: /mark as complete/i }),
    );

    // then - button changes to "Completed" and is disabled
    expect(screen.getByRole("button", { name: /completed/i })).toBeDefined();
    expect(
      (screen.getByRole("button", { name: /completed/i }) as HTMLButtonElement)
        .disabled,
    ).toBe(true);
  });

  it("should have a back to pilotage menu button", () => {
    // when
    render(
      <TestRouter>
        <ClearingBearingsTheory />
      </TestRouter>,
    );

    // then
    expect(
      screen.getByRole("button", { name: /back to pilotage/i }),
    ).toBeDefined();
  });
});
