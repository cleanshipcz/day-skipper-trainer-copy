import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
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
    const onMastery = vi.fn();
    const view = render(<ChartSymbolQuiz onMastery={onMastery}/>);
    for (const [index, question] of chartSymbolQuestions.entries()) {
      const answer = index < 11 ? question.answer : question.options.find(option => option !== question.answer)!;
      await answerCurrent(user, answer);
      await user.click(screen.getByRole("button", { name: index < 12 ? "Next question" : "See results" }));
    }
    expect(screen.getByRole("status").textContent).toContain("Mastery achieved: at least 11 of 13 correct");
    expect(screen.getByText("11 / 13")).toBeDefined();
    expect(onMastery).toHaveBeenCalledOnce();
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

  it("does not hydrate another owner's completed assessment or a retired catalogue", () => {
    const completed = { version: 1, index: 12, choice: "", checked: true, correctIds: chartSymbolQuestions.slice(0, 11).map(({ id }) => id), complete: true };
    localStorage.setItem(`${CHART_SYMBOL_ATTEMPT_KEY}:account-a:chart-symbols-v1`, JSON.stringify(completed));

    const view = render(<ChartSymbolQuiz evidenceOwnerId="account-b" catalogueRevision="chart-symbols-v1" />);
    expect(screen.getByText("Question 1 of 13")).toBeDefined();
    view.unmount();
    render(<ChartSymbolQuiz evidenceOwnerId="account-a" catalogueRevision="chart-symbols-v2" />);
    expect(screen.getByText("Question 1 of 13")).toBeDefined();
  });
});
