/**
 * Tests for the BuoyIdentifier interactive drill component.
 *
 * Validates AC-3: Interactive identification challenges with min 12 challenges.
 *
 * @see docs/FEATURE_TASKS.md — Story E2-S1, AC-3
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BuoyIdentifier, type BuoyDrillResult } from "@/components/pilotage/BuoyIdentifier";

describe("BuoyIdentifier", () => {
  const mockOnComplete = vi.fn<(result: BuoyDrillResult) => void>();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render a buoy challenge with visual descriptor and answer options", () => {
    // when
    render(<BuoyIdentifier onComplete={mockOnComplete} />);

    // then - shows a challenge prompt and multiple answer buttons
    expect(screen.getByText(/identify this/i)).toBeDefined();
    expect(screen.getAllByRole("button").length).toBeGreaterThanOrEqual(3);
  });

  it("should show progress indicator with current question and total", () => {
    // when
    render(<BuoyIdentifier onComplete={mockOnComplete} />);

    // then - shows "1 of N" style progress
    expect(screen.getByText(/1\s*(of|\/)\s*\d+/i)).toBeDefined();
  });

  it("should show correct feedback when user selects the right answer", async () => {
    // given
    const user = userEvent.setup();
    render(<BuoyIdentifier onComplete={mockOnComplete} />);

    // when - click the correct answer (data-testid for correct option)
    const correctButton = screen.getByTestId("correct-option");
    await user.click(correctButton);

    // then - feedback text starts with "Correct!"
    expect(screen.getByText(/^Correct!/)).toBeDefined();
  });

  it("should show incorrect feedback when user selects the wrong answer", async () => {
    // given
    const user = userEvent.setup();
    render(<BuoyIdentifier onComplete={mockOnComplete} />);

    // when - click a button that is NOT the correct option
    const allButtons = screen.getAllByRole("button");
    const correctButton = screen.getByTestId("correct-option");
    const wrongButton = allButtons.find(
      (btn) => btn !== correctButton && btn.textContent !== ""
    )!;
    await user.click(wrongButton);

    // then
    expect(screen.getByText(/incorrect/i)).toBeDefined();
  });

  it("should advance to the next question after answering", async () => {
    // given
    const user = userEvent.setup();
    render(<BuoyIdentifier onComplete={mockOnComplete} />);

    // when - answer the first question and click next
    const correctButton = screen.getByTestId("correct-option");
    await user.click(correctButton);
    const nextButton = screen.getByRole("button", { name: /next/i });
    await user.click(nextButton);

    // then - progress moves to question 2
    expect(screen.getByText(/2\s*(of|\/)\s*\d+/i)).toBeDefined();
  });

  it("should have at least 12 challenges", () => {
    // when
    render(<BuoyIdentifier onComplete={mockOnComplete} />);

    // then - the total shown in progress should be >= 12
    const progressText = screen.getByTestId("drill-progress").textContent ?? "";
    const totalMatch = progressText.match(/of\s*(\d+)/i);
    expect(totalMatch).not.toBeNull();
    expect(Number(totalMatch![1])).toBeGreaterThanOrEqual(12);
  });

  it("should call onComplete with drill result after all questions answered", async () => {
    // given
    const user = userEvent.setup();
    render(<BuoyIdentifier onComplete={mockOnComplete} totalChallenges={2} />);

    // when - answer 2 questions (minimal test mode)
    for (let i = 0; i < 2; i++) {
      const correctBtn = screen.getByTestId("correct-option");
      await user.click(correctBtn);
      // - if not the last question, click next
      const nextBtn = screen.queryByRole("button", { name: /next/i });
      if (nextBtn) await user.click(nextBtn);
    }

    // then
    expect(mockOnComplete).toHaveBeenCalledTimes(1);
    expect(mockOnComplete).toHaveBeenCalledWith(
      expect.objectContaining({
        correctCount: expect.any(Number),
        totalAnswered: 2,
      })
    );
  });

  it("should not call onComplete before all questions are answered", async () => {
    // given
    const user = userEvent.setup();
    render(<BuoyIdentifier onComplete={mockOnComplete} totalChallenges={3} />);

    // when - answer only 1 of 3 questions
    const correctBtn = screen.getByTestId("correct-option");
    await user.click(correctBtn);

    // then
    expect(mockOnComplete).not.toHaveBeenCalled();
  });

  it("should render a restart button after drill completion", async () => {
    // given
    const user = userEvent.setup();
    render(<BuoyIdentifier onComplete={mockOnComplete} totalChallenges={1} />);

    // when - answer the single question
    const correctBtn = screen.getByTestId("correct-option");
    await user.click(correctBtn);

    // then
    expect(screen.getByRole("button", { name: /restart|try again/i })).toBeDefined();
  });
});
