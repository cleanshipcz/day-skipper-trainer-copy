import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FireSafetyTheory from "../src/pages/FireSafetyTheory";
import TestRouter from "./TestRouter";

// Mock the drill component to isolate theory page tests.
// H1: The mock must accept and expose onComplete prop so we can test the parent wires it.
const mockOnComplete = vi.fn();
vi.mock("@/components/safety/FireExtinguisherDrill", () => ({
  FireExtinguisherDrill: ({ onComplete }: { onComplete?: (result: { correctCount: number; totalAnswered: number }) => void }) => {
    // Store the callback so tests can invoke it
    mockOnComplete.mockImplementation((result) => onComplete?.(result));
    return (
      <div data-testid="fire-extinguisher-drill">
        <button data-testid="simulate-drill-complete" onClick={() => onComplete?.({ correctCount: 5, totalAnswered: 6 })}>
          Complete Drill
        </button>
      </div>
    );
  },
}));

const mockSaveProgress = vi.fn();

vi.mock("@/hooks/useProgress", () => ({
  useProgress: () => ({
    saveProgress: mockSaveProgress,
  }),
}));

describe("FireSafetyTheory Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the page header with title and navigation back button", () => {
    // when
    render(
      <TestRouter>
        <FireSafetyTheory />
      </TestRouter>
    );

    // then
    expect(screen.getByText("Fire Safety")).toBeDefined();
    // - header has an icon back button with aria-label="back"
    expect(screen.getByLabelText("back")).toBeDefined();
  });

  it("should render tab navigation with all required theory sections", () => {
    // when
    render(
      <TestRouter>
        <FireSafetyTheory />
      </TestRouter>
    );

    // then - tabs for all required content areas
    expect(screen.getByRole("tab", { name: /fire triangle/i })).toBeDefined();
    expect(screen.getByRole("tab", { name: /fire types/i })).toBeDefined();
    expect(screen.getByRole("tab", { name: /extinguishers/i })).toBeDefined();
    expect(screen.getByRole("tab", { name: /prevention/i })).toBeDefined();
    expect(screen.getByRole("tab", { name: /drill/i })).toBeDefined();
  });

  it("should display fire triangle content in the default tab", () => {
    // when
    render(
      <TestRouter>
        <FireSafetyTheory />
      </TestRouter>
    );

    // then - fire triangle theory content (heading and all three triangle elements)
    expect(screen.getByText("The Fire Triangle")).toBeDefined();
    expect(screen.getAllByText(/heat/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/fuel/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/oxygen/i).length).toBeGreaterThanOrEqual(1);
  });

  it("should display fire types when clicking the Fire Types tab", async () => {
    // given
    const user = userEvent.setup();
    render(
      <TestRouter>
        <FireSafetyTheory />
      </TestRouter>
    );

    // when
    const fireTypesTab = screen.getByRole("tab", { name: /fire types/i });
    await user.click(fireTypesTab);

    // then - all required fire class headings
    expect(await screen.findByText("Fire Classifications")).toBeDefined();
    expect(await screen.findByText(/Class A — Solids/)).toBeDefined();
    expect(await screen.findByText(/Class B — Flammable Liquids/)).toBeDefined();
    expect(await screen.findByText(/Class C — Flammable Gases/)).toBeDefined();
    expect(await screen.findByText(/Electrical Fires/)).toBeDefined();
  });

  it("should display extinguisher types when clicking the Extinguishers tab", async () => {
    // given
    const user = userEvent.setup();
    render(
      <TestRouter>
        <FireSafetyTheory />
      </TestRouter>
    );

    // when
    const extTab = screen.getByRole("tab", { name: /extinguishers/i });
    await user.click(extTab);

    // then - all required extinguisher type headings
    expect(await screen.findByText("Extinguisher Types")).toBeDefined();
    expect(await screen.findByText("Dry Powder")).toBeDefined();
    expect(await screen.findByText("Foam")).toBeDefined();
    expect(await screen.findByText("CO2")).toBeDefined();
    expect(await screen.findByText("Fire Blanket")).toBeDefined();
  });

  it("should display prevention and engine room fire content", async () => {
    // given
    const user = userEvent.setup();
    render(
      <TestRouter>
        <FireSafetyTheory />
      </TestRouter>
    );

    // when
    const preventionTab = screen.getByRole("tab", { name: /prevention/i });
    await user.click(preventionTab);

    // then - fire prevention heading and engine room procedure
    expect(await screen.findByText("Fire Prevention at Sea")).toBeDefined();
    expect(await screen.findByText("Engine Room Fire Procedure")).toBeDefined();
  });

  it("should render the interactive drill component in the Drill tab", async () => {
    // given
    const user = userEvent.setup();
    render(
      <TestRouter>
        <FireSafetyTheory />
      </TestRouter>
    );

    // when
    const drillTab = screen.getByRole("tab", { name: /drill/i });
    await user.click(drillTab);

    // then
    expect(await screen.findByTestId("fire-extinguisher-drill")).toBeDefined();
  });

  // H2: Theory should NOT auto-save on mount — requires explicit "Mark as Complete" button
  it("should not call saveProgress automatically on mount", () => {
    // when
    render(
      <TestRouter>
        <FireSafetyTheory />
      </TestRouter>
    );

    // then - saveProgress should NOT have been called yet
    expect(mockSaveProgress).not.toHaveBeenCalled();
  });

  // H2: Explicit completion button
  it("should render a 'Mark as Complete' button that saves progress when clicked", async () => {
    // given
    const user = userEvent.setup();
    render(
      <TestRouter>
        <FireSafetyTheory />
      </TestRouter>
    );

    // when - click the completion button
    const completeButton = screen.getByRole("button", { name: /mark as complete/i });
    await user.click(completeButton);

    // then - saveProgress called with topic ID, completed=true, score=100, points=10
    expect(mockSaveProgress).toHaveBeenCalledWith("safety-fire", true, 100, 10);
  });

  // H1: Drill completion awards points via saveProgress
  it("should call saveProgress for drill when drill onComplete fires", async () => {
    // given
    const user = userEvent.setup();
    render(
      <TestRouter>
        <FireSafetyTheory />
      </TestRouter>
    );

    // when - navigate to drill tab and simulate drill completion
    const drillTab = screen.getByRole("tab", { name: /drill/i });
    await user.click(drillTab);
    const completeButton = await screen.findByTestId("simulate-drill-complete");
    await user.click(completeButton);

    // then - saveProgress called for drill with points
    expect(mockSaveProgress).toHaveBeenCalledWith(
      "safety-fire-drill",
      true,
      expect.any(Number),
      10,
    );
  });

  // M4: Quiz link navigation button
  it("should render a 'Take the Fire Safety Quiz' button in the Drill tab", async () => {
    // given
    const user = userEvent.setup();
    render(
      <TestRouter>
        <FireSafetyTheory />
      </TestRouter>
    );

    // when
    const drillTab = screen.getByRole("tab", { name: /drill/i });
    await user.click(drillTab);

    // then
    expect(
      await screen.findByRole("button", { name: /take the fire safety quiz/i })
    ).toBeDefined();
  });

  it("should have a back to safety menu button at the bottom", () => {
    // when
    render(
      <TestRouter>
        <FireSafetyTheory />
      </TestRouter>
    );

    // then
    expect(
      screen.getByRole("button", { name: /back to safety menu/i })
    ).toBeDefined();
  });
});
