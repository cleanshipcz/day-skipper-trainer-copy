/**
 * Tests for the BuoyageTheory page component.
 *
 * Validates AC-1 (theory content), AC-4 (clock-face mnemonic),
 * and AC-5 (completion + points).
 *
 * @see docs/FEATURE_TASKS.md — Story E2-S1
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import BuoyageTheory from "../src/pages/BuoyageTheory";
import TestRouter from "./TestRouter";

// Mock the BuoyIdentifier drill component to isolate page tests.
vi.mock("@/components/pilotage/BuoyIdentifier", () => ({
  BuoyIdentifier: ({
    onComplete,
  }: {
    onComplete?: (result: { correctCount: number; totalAnswered: number }) => void;
  }) => (
    <div data-testid="buoy-identifier-drill">
      <button
        data-testid="simulate-drill-complete"
        onClick={() => onComplete?.({ correctCount: 10, totalAnswered: 12 })}
      >
        Complete Drill
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

describe("BuoyageTheory Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // AC-1: Route renders theory content
  it("should render the page header with title and back button", () => {
    // when
    render(
      <TestRouter>
        <BuoyageTheory />
      </TestRouter>
    );

    // then
    expect(screen.getByText("IALA Buoyage")).toBeDefined();
    expect(screen.getByLabelText("back")).toBeDefined();
  });

  it("should render tab navigation with theory sections", () => {
    // when
    render(
      <TestRouter>
        <BuoyageTheory />
      </TestRouter>
    );

    // then - tabs for all major content areas
    expect(screen.getByRole("tab", { name: /lateral/i })).toBeDefined();
    expect(screen.getByRole("tab", { name: /cardinal/i })).toBeDefined();
    expect(screen.getByRole("tab", { name: /other marks/i })).toBeDefined();
    expect(screen.getByRole("tab", { name: /drill/i })).toBeDefined();
  });

  // AC-1: Lateral marks theory content
  it("should display IALA Region A lateral marks theory in the default tab", () => {
    // when
    render(
      <TestRouter>
        <BuoyageTheory />
      </TestRouter>
    );

    // then - IALA Region A system explanation and lateral marks
    expect(screen.getAllByText(/IALA Region A/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/port/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/starboard/i).length).toBeGreaterThanOrEqual(1);
  });

  // AC-1: Cardinal marks theory content
  it("should display cardinal marks theory when clicking the Cardinal tab", async () => {
    // given
    const user = userEvent.setup();
    render(
      <TestRouter>
        <BuoyageTheory />
      </TestRouter>
    );

    // when
    const cardinalTab = screen.getByRole("tab", { name: /cardinal/i });
    await user.click(cardinalTab);

    // then - all four cardinal direction headings
    expect(await screen.findByText("North Cardinal Mark")).toBeDefined();
    expect(screen.getByText("East Cardinal Mark")).toBeDefined();
    expect(screen.getByText("South Cardinal Mark")).toBeDefined();
    expect(screen.getByText("West Cardinal Mark")).toBeDefined();
  });

  // AC-4: Clock-face mnemonic for cardinal light patterns
  it("should include the clock-face mnemonic for cardinal light patterns", async () => {
    // given
    const user = userEvent.setup();
    render(
      <TestRouter>
        <BuoyageTheory />
      </TestRouter>
    );

    // when
    const cardinalTab = screen.getByRole("tab", { name: /cardinal/i });
    await user.click(cardinalTab);

    // then - clock-face mnemonic reference
    expect(await screen.findByText(/Clock-Face Mnemonic/i)).toBeDefined();
  });

  // AC-1: Other marks (isolated danger, safe water, special, new danger)
  it("should display other marks theory when clicking the Other Marks tab", async () => {
    // given
    const user = userEvent.setup();
    render(
      <TestRouter>
        <BuoyageTheory />
      </TestRouter>
    );

    // when
    const otherTab = screen.getByRole("tab", { name: /other marks/i });
    await user.click(otherTab);

    // then - check each buoy category is represented (may appear multiple times)
    expect(await screen.findByText("Isolated Danger Mark")).toBeDefined();
    expect(screen.getByText("Safe Water Mark")).toBeDefined();
    expect(screen.getAllByText("Special Mark").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("New Danger Mark").length).toBeGreaterThanOrEqual(1);
  });

  // AC-3: Interactive BuoyIdentifier drill
  it("should render the BuoyIdentifier drill component in the Drill tab", async () => {
    // given
    const user = userEvent.setup();
    render(
      <TestRouter>
        <BuoyageTheory />
      </TestRouter>
    );

    // when
    const drillTab = screen.getByRole("tab", { name: /drill/i });
    await user.click(drillTab);

    // then
    expect(await screen.findByTestId("buoy-identifier-drill")).toBeDefined();
  });

  // AC-5: Completion and points
  it("should not call saveProgress automatically on mount", () => {
    // when
    render(
      <TestRouter>
        <BuoyageTheory />
      </TestRouter>
    );

    // then
    expect(mockSaveProgress).not.toHaveBeenCalled();
  });

  it("should render a Mark as Complete button that saves progress when clicked", async () => {
    // given
    const user = userEvent.setup();
    render(
      <TestRouter>
        <BuoyageTheory />
      </TestRouter>
    );

    // when
    const completeButton = screen.getByRole("button", { name: /mark as complete/i });
    await user.click(completeButton);

    // then - saves progress with topic ID pilotage-buoyage, completed=true, score=100, points=10
    expect(mockSaveProgress).toHaveBeenCalledWith("pilotage-buoyage", true, 100, 10);
  });

  it("should have a back to pilotage menu button", () => {
    // when
    render(
      <TestRouter>
        <BuoyageTheory />
      </TestRouter>
    );

    // then
    expect(
      screen.getByRole("button", { name: /back to pilotage/i })
    ).toBeDefined();
  });
});
