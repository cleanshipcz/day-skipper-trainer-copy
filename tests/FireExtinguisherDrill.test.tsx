import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FireExtinguisherDrill } from "../src/components/safety/FireExtinguisherDrill";
import { fireScenarios, fireExtinguishers } from "../src/data/fireExtinguishers";
import TestRouter from "./TestRouter";

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("FireExtinguisherDrill", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render a fire scenario with selectable extinguisher options", () => {
    // when
    render(
      <TestRouter>
        <FireExtinguisherDrill onComplete={vi.fn()} />
      </TestRouter>
    );

    // then - should show a fire scenario description
    expect(screen.getByTestId("fire-scenario")).toBeDefined();

    // then - should show extinguisher options to choose from
    const options = screen.getAllByTestId(/^extinguisher-option-/);
    expect(options.length).toBeGreaterThanOrEqual(3);
  });

  it("should display feedback when an extinguisher is selected and submitted", async () => {
    // given
    const user = userEvent.setup();
    render(
      <TestRouter>
        <FireExtinguisherDrill onComplete={vi.fn()} />
      </TestRouter>
    );

    // when - select an option and submit
    const options = screen.getAllByTestId(/^extinguisher-option-/);
    await user.click(options[0]);

    const submitButton = screen.getByRole("button", { name: /check/i });
    await user.click(submitButton);

    // then - should show a result (correct or incorrect)
    expect(screen.getByTestId("drill-result")).toBeDefined();
  });

  it("should allow advancing to next scenario after answering", async () => {
    // given
    const user = userEvent.setup();
    render(
      <TestRouter>
        <FireExtinguisherDrill onComplete={vi.fn()} />
      </TestRouter>
    );

    // when - select an option and submit
    const options = screen.getAllByTestId(/^extinguisher-option-/);
    await user.click(options[0]);
    const submitButton = screen.getByRole("button", { name: /check/i });
    await user.click(submitButton);

    // then - should show a "next" button to advance
    const nextButton = screen.getByRole("button", { name: /next/i });
    expect(nextButton).toBeDefined();
  });

  it("should track score across multiple scenarios", () => {
    // when
    render(
      <TestRouter>
        <FireExtinguisherDrill onComplete={vi.fn()} />
      </TestRouter>
    );

    // then - should display score tracking
    expect(screen.getByTestId("drill-score")).toBeDefined();
  });

  it("should render a reset button to restart the drill", () => {
    // when
    render(
      <TestRouter>
        <FireExtinguisherDrill onComplete={vi.fn()} />
      </TestRouter>
    );

    // then
    expect(screen.getByRole("button", { name: /reset|restart/i })).toBeDefined();
  });

  // M3: Test drill completion screen
  it("should render the completion screen with final score after all scenarios", async () => {
    // given
    const user = userEvent.setup();
    const onComplete = vi.fn();
    render(
      <TestRouter>
        <FireExtinguisherDrill onComplete={onComplete} />
      </TestRouter>
    );

    // when - answer all scenarios by selecting any option and advancing
    for (let i = 0; i < fireScenarios.length; i++) {
      const options = screen.getAllByTestId(/^extinguisher-option-/);
      await user.click(options[0]);
      const submitButton = screen.getByRole("button", { name: /check/i });
      await user.click(submitButton);
      const nextButton = screen.getByRole("button", { name: /next/i });
      await user.click(nextButton);
    }

    // then - should show "Drill Complete!" completion screen
    expect(screen.getByText("Drill Complete!")).toBeDefined();
    expect(screen.getByTestId("drill-score")).toBeDefined();
    expect(screen.getByRole("button", { name: /restart/i })).toBeDefined();
  });

  // H1: Test that onComplete callback is invoked when drill finishes
  it("should call onComplete with correctCount and totalAnswered when drill finishes", async () => {
    // given
    const user = userEvent.setup();
    const onComplete = vi.fn();
    render(
      <TestRouter>
        <FireExtinguisherDrill onComplete={onComplete} />
      </TestRouter>
    );

    // when - answer all scenarios
    for (let i = 0; i < fireScenarios.length; i++) {
      const options = screen.getAllByTestId(/^extinguisher-option-/);
      await user.click(options[0]);
      const submitButton = screen.getByRole("button", { name: /check/i });
      await user.click(submitButton);
      const nextButton = screen.getByRole("button", { name: /next/i });
      await user.click(nextButton);
    }

    // then - onComplete should have been called with score info
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onComplete).toHaveBeenCalledWith(
      expect.objectContaining({
        correctCount: expect.any(Number),
        totalAnswered: fireScenarios.length,
      })
    );
  });
});
