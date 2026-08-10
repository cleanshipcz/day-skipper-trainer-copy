import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import ChartSymbolQuiz, { CHART_SYMBOL_ATTEMPT_KEY, chartSymbolQuestions, symbolDescriptions } from "@/components/navigation/ChartSymbolQuiz";

const answerCurrent = async (user: ReturnType<typeof userEvent.setup>, answer: string) => {
  await user.click(screen.getByRole("radio", { name: answer }));
  await user.click(screen.getByRole("button", { name: "Check answer" }));
};

describe("ChartSymbolQuiz", () => {
  beforeEach(() => localStorage.clear());

  it("covers every intended mapping with observable, non-answering image descriptions", async () => {
    const user = userEvent.setup();
    render(<ChartSymbolQuiz/>);
    expect(chartSymbolQuestions).toHaveLength(13);
    expect(chartSymbolQuestions.map(q => q.kind)).toEqual(Object.keys(symbolDescriptions));
    expect(chartSymbolQuestions.every(q => /INT 1/.test(q.reference) && /Chart 5011/.test(q.reference))).toBe(true);
    expect(chartSymbolQuestions.some(q => /buoy floats; a beacon is fixed/i.test(q.explanation))).toBe(true);

    for (const [index, question] of chartSymbolQuestions.entries()) {
      const image = screen.getByRole("img");
      expect(image.getAttribute("aria-label")).toBe(symbolDescriptions[question.kind]);
      expect(image.getAttribute("aria-label")).not.toContain(question.answer);
      expect(screen.getByText(question.prompt)).toBeDefined();
      await answerCurrent(user, question.answer);
      if (index < chartSymbolQuestions.length - 1) await user.click(screen.getByRole("button", { name: "Next question" }));
    }
  });

  it("does not reveal correctness before keyboard submission and persists checked remediation", async () => {
    const user = userEvent.setup();
    const view = render(<ChartSymbolQuiz/>);
    expect(screen.queryByText(/^Correct$/)).toBeNull();
    const wrong = screen.getByRole("radio", { name: chartSymbolQuestions[0].options[1] });
    wrong.focus();
    await user.keyboard(" ");
    await user.click(screen.getByRole("button", { name: "Check answer" }));
    expect(screen.getByRole("status").textContent).toContain(`Correct answer: ${chartSymbolQuestions[0].answer}`);
    expect(screen.getByRole("status").textContent).toContain("Chart Datum");
    view.unmount();
    render(<ChartSymbolQuiz/>);
    expect(screen.getByRole("status").textContent).toContain(`Correct answer: ${chartSymbolQuestions[0].answer}`);
  });

  it("records 11-of-13 mastery, restores completed evidence, and only resets on explicit retry", async () => {
    const user = userEvent.setup();
    const view = render(<ChartSymbolQuiz/>);
    for (const [index, question] of chartSymbolQuestions.entries()) {
      const answer = index < 11 ? question.answer : question.options.find(option => option !== question.answer)!;
      await answerCurrent(user, answer);
      await user.click(screen.getByRole("button", { name: index < 12 ? "Next question" : "See results" }));
    }
    expect(screen.getByRole("status").textContent).toContain("Mastery achieved: at least 11 of 13 correct");
    expect(screen.getByText("11 / 13")).toBeDefined();
    const stored = JSON.parse(localStorage.getItem(CHART_SYMBOL_ATTEMPT_KEY)!);
    expect(stored).toMatchObject({ version: 1, complete: true });
    expect(stored.correctIds).toHaveLength(11);

    view.unmount();
    render(<ChartSymbolQuiz/>);
    expect(screen.getByText("11 / 13")).toBeDefined();
    await user.click(screen.getByRole("button", { name: "Retry assessment" }));
    expect(screen.getByText("Question 1 of 13")).toBeDefined();
    cleanup();
    render(<ChartSymbolQuiz/>);
    expect(screen.getByText("Question 1 of 13")).toBeDefined();
    expect(JSON.parse(localStorage.getItem(CHART_SYMBOL_ATTEMPT_KEY)!).correctIds).toEqual([]);
  });

  it("exposes semantic progress", () => {
    render(<ChartSymbolQuiz/>);
    expect(screen.getByRole("progressbar", { name: "Assessment progress" }).getAttribute("value")).toBe("1");
  });
});
