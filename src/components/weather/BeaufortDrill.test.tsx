// @vitest-environment jsdom
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { beaufortScale } from "@/data/beaufortScale";
import { BeaufortDrill } from "./BeaufortDrill";

const expectedQuestions = beaufortScale.flatMap((level) => [
  { direction: "speed" as const, level },
  { direction: "sea" as const, level },
]);

const answerButton = (force: number) => within(screen.getByRole("group")).getByRole("button", { name: String(force) });

const submitAnswer = async (user: ReturnType<typeof userEvent.setup>, force: number) => {
  await user.click(answerButton(force));
  await user.click(screen.getByRole("button", { name: "Check answer" }));
};

describe("BeaufortDrill", () => {
  it("requires a recorded answer, locks submission, and gives useful wrong and right feedback", async () => {
    const user = userEvent.setup();
    render(<BeaufortDrill />);

    expect((screen.getByRole("button", { name: "Check answer" }) as HTMLButtonElement).disabled).toBe(true);
    expect((screen.getByRole("button", { name: "Next question" }) as HTMLButtonElement).disabled).toBe(true);
    await submitAnswer(user, 1);
    expect(screen.getByRole("status").textContent).toMatch(/you chose Force 1.*answer is Force 0.*<1 knots.*Calm \(glassy\).*No probable wave height/is);
    expect((answerButton(1) as HTMLButtonElement).disabled).toBe(true);
    await user.click(answerButton(0));
    expect(answerButton(1).getAttribute("aria-pressed")).toBe("true");

    await user.click(screen.getByRole("button", { name: "Next question" }));
    await submitAnswer(user, 0);
    expect(screen.getByRole("status").textContent).toMatch(/Correct.*Force 0.*<1 knots.*Calm \(glassy\)/is);
  });

  it("associates the active question and instructions with the answer group", () => {
    render(<BeaufortDrill />);
    const group = screen.getByRole("group");
    expect(group.getAttribute("aria-labelledby")).toBe("beaufort-question-speed-0");
    expect(document.getElementById(group.getAttribute("aria-labelledby")!)?.textContent).toMatch(/<1 knots/);
    expect(group.getAttribute("aria-describedby")).toBe("beaufort-answer-instructions");
    expect(document.getElementById("beaufort-answer-instructions")?.textContent).toMatch(/submitted answer is locked/i);
  });

  it("supports keyboard answering and moves focus when the question advances", async () => {
    const user = userEvent.setup();
    render(<BeaufortDrill />);
    await waitFor(() => expect(document.activeElement).toBe(document.getElementById("beaufort-question-speed-0")));
    answerButton(0).focus();
    await user.keyboard("{Enter}");
    expect(answerButton(0).getAttribute("aria-pressed")).toBe("true");
    await user.click(screen.getByRole("button", { name: "Check answer" }));
    await user.click(screen.getByRole("button", { name: "Next question" }));
    const nextHeading = screen.getByRole("heading", { level: 3, name: /Calm \(glassy\)/ });
    await waitFor(() => expect(document.activeElement).toBe(nextHeading));
  });

  it("covers both recall directions for every force and reaches an explicit perfect summary", async () => {
    const user = userEvent.setup();
    render(<BeaufortDrill />);

    for (const [questionIndex, question] of expectedQuestions.entries()) {
      const expectedCue = question.direction === "speed" ? `${question.level.knots} knots` : question.level.seaState;
      expect(screen.getByRole("heading", { level: 3, name: /^Which Beaufort force/ }).textContent).toContain(expectedCue);
      await submitAnswer(user, question.level.force);
      await user.click(screen.getByRole("button", { name: questionIndex === expectedQuestions.length - 1 ? "See summary" : "Next question" }));
    }

    const summary = screen.getByRole("heading", { name: "Beaufort drill summary" });
    expect(screen.getByText(`Score: ${expectedQuestions.length} / ${expectedQuestions.length}`)).toBeTruthy();
    expect(screen.getByRole("status").textContent).toMatch(/Mastery achieved.*every speed band and sea cue/i);
    expect(screen.queryByRole("button", { name: /Retry missed/i })).toBeNull();
    expect(screen.getByText(/session-only.*does not mark.*theory topic complete.*save progress/i)).toBeTruthy();
    await waitFor(() => expect(document.activeElement).toBe(summary));
  }, 15_000);

  it("retries only missed questions and can restart the full deterministic session", async () => {
    const user = userEvent.setup();
    render(<BeaufortDrill />);

    for (const [questionIndex, question] of expectedQuestions.entries()) {
      await submitAnswer(user, questionIndex === 0 ? 1 : question.level.force);
      await user.click(screen.getByRole("button", { name: questionIndex === expectedQuestions.length - 1 ? "See summary" : "Next question" }));
    }
    expect(screen.getByText(`Score: ${expectedQuestions.length - 1} / ${expectedQuestions.length}`)).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "Retry missed (1)" }));
    expect(screen.getByText("Question 1 of 1 · score 0/0")).toBeTruthy();
    expect(screen.getByRole("heading", { level: 3, name: /^Which Beaufort force/ }).textContent).toMatch(/<1 knots/);
    await submitAnswer(user, 0);
    await user.click(screen.getByRole("button", { name: "See summary" }));
    expect(screen.getByText("Score: 1 / 1")).toBeTruthy();

    await user.click(screen.getByRole("button", { name: "Restart full drill" }));
    expect(screen.getByText(`Question 1 of ${expectedQuestions.length} · score 0/0`)).toBeTruthy();
    const firstHeading = screen.getByRole("heading", { level: 3, name: /^Which Beaufort force/ });
    await waitFor(() => expect(document.activeElement).toBe(firstHeading));
  }, 15_000);
});
