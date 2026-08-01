import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";

const mocks = vi.hoisted(() => ({
  loadProgress: vi.fn(),
  saveProgress: vi.fn(),
  resetProgress: vi.fn(),
  loadQuizTopic: vi.fn(),
  rpc: vi.fn(),
  user: null as { id: string } | null,
}));

vi.mock("@/contexts/AuthHooks", () => ({ useAuth: () => ({ user: mocks.user }) }));
vi.mock("@/hooks/useProgress", () => ({ useProgress: () => mocks }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { rpc: mocks.rpc } }));
vi.mock("@/data/quizzes", () => ({
  isQuizTopicId: (topic: string) => ["test", "nautical-terms-quiz", "ropework", "lights-signals"].includes(topic),
  topicMeta: {
    test: { title: "A very long localized quiz title that must reflow", subtitle: "Long localized supporting text" },
    "nautical-terms-quiz": { title: "Full Nautical Terms Quiz", subtitle: "Terms" },
    ropework: { title: "Ropework Quiz", subtitle: "Knots" },
    "lights-signals": { title: "Lights & Signals Mastery", subtitle: "Signals" },
  },
  loadQuizTopic: mocks.loadQuizTopic,
}));

import Quiz from "./Quiz";

const questions = [
  { id: "q1", question: "First deliberately long localized question withoutshortbreakpoints?", options: ["First wrong", "First correct answer with exceptionallylonglocalizedcontent"], correctAnswer: 1, explanation: "First explanation with exceptionallylonglocalizedcontent." },
  { id: "q2", question: "Second question?", options: ["Second wrong", "Second correct"], correctAnswer: 1, explanation: "Second explanation." },
];

const LocationProbe = () => {
  const location = useLocation();
  return <p>Current path: {location.pathname}</p>;
};

const renderQuiz = (path = "/quiz/test") => render(
  <MemoryRouter initialEntries={[path]}>
    <Routes>
      <Route path="/quiz/:topicId" element={<Quiz />} />
      <Route path="*" element={<LocationProbe />} />
    </Routes>
  </MemoryRouter>,
);

describe("Quiz accessible interaction and reflow", () => {
  beforeEach(() => {
    localStorage.clear();
    mocks.loadProgress.mockReset().mockResolvedValue(null);
    mocks.saveProgress.mockReset().mockResolvedValue(true);
    mocks.resetProgress.mockReset().mockResolvedValue(true);
    mocks.loadQuizTopic.mockReset().mockResolvedValue(questions);
    mocks.rpc.mockReset().mockResolvedValue({ data: null, error: null });
    mocks.user = null;
  });

  it.each([
    ["/quiz/nautical-terms-quiz", "Back to Nautical Terms & Boat Parts from Full Nautical Terms Quiz", "/nautical-terms"],
    ["/quiz/nautical-terms", "Back to Nautical Terms & Boat Parts from Full Nautical Terms Quiz", "/nautical-terms"],
    ["/quiz/ropework", "Back to Ropework & Knots from Ropework Quiz", "/ropework"],
    ["/quiz/lights-signals", "Back to Lights & Signals Theory from Lights & Signals Mastery", "/rules/lights"],
  ])("returns active and legacy quiz routes to their registered parent", async (path, backName, expectedPath) => {
    const user = userEvent.setup();
    renderQuiz(path);
    await user.click(await screen.findByRole("button", { name: backName }));
    expect(await screen.findByText(`Current path: ${expectedPath}`)).toBeTruthy();
  });

  it("uses the same safe fallback in the unavailable state", async () => {
    const user = userEvent.setup();
    mocks.loadQuizTopic.mockRejectedValueOnce(new Error("missing"));
    renderQuiz("/quiz/unknown-deep-link");
    await user.click(await screen.findByRole("button", { name: "Back to Home" }));
    expect(await screen.findByText("Current path: /")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Nautical Terms" })).toBeNull();
  });

  it("returns completed quizzes to the exact registered parent path", async () => {
    const user = userEvent.setup();
    mocks.loadQuizTopic.mockResolvedValueOnce([questions[0]]);
    renderQuiz("/quiz/ropework");

    await user.click(await screen.findByRole("radio", { name: /First correct answer/i }));
    await user.click(screen.getByRole("button", { name: "Submit Answer" }));
    await user.click(screen.getByRole("button", { name: "View Results" }));
    await user.click(await screen.findByRole("button", { name: "Return to Ropework & Knots" }));

    expect(await screen.findByText("Current path: /ropework")).toBeTruthy();
  });

  it("labels navigation and numeric progress and exposes one radio selection", async () => {
    const user = userEvent.setup();
    renderQuiz();

    expect(await screen.findByRole("button", { name: /back to home from a very long localized quiz title/i })).toBeTruthy();
    const progress = screen.getByRole("progressbar", { name: /progress: question 1 of 2 \(50%\)/i });
    expect(progress.getAttribute("aria-valuenow")).toBe("50");
    expect(progress.getAttribute("aria-valuetext")).toBe("Question 1 of 2");

    const radios = screen.getAllByRole("radio");
    expect(radios).toHaveLength(2);
    radios[0].focus();
    await user.keyboard(" ");
    expect((radios[0] as HTMLInputElement).checked).toBe(true);
    expect((radios[1] as HTMLInputElement).checked).toBe(false);
  });

  it("keeps tentative choices out of score and persistence until submission", async () => {
    mocks.user = { id: "quiz-user" };
    const user = userEvent.setup();
    renderQuiz();

    const score = await screen.findByText("Score: 0/2");
    const correct = screen.getByRole("radio", { name: /correct/i });
    const wrong = screen.getByRole("radio", { name: /wrong/i });

    await user.click(wrong);
    expect(score.textContent).toBe("Score: 0/2");
    expect(screen.queryByRole("status")).toBeNull();
    expect(mocks.saveProgress).not.toHaveBeenCalled();

    await user.click(correct);
    await user.click(wrong);
    expect(score.textContent).toBe("Score: 0/2");
    expect(screen.queryByRole("status")).toBeNull();
    expect(mocks.saveProgress).not.toHaveBeenCalled();

    await user.click(correct);
    await user.click(screen.getByRole("button", { name: "Submit Answer" }));

    await waitFor(() => expect(score.textContent).toBe("Score: 1/2"));
    expect(screen.getByRole("status").textContent).toContain("Correct");
    await waitFor(() => expect(mocks.saveProgress).toHaveBeenCalledTimes(1));
  });

  it("announces feedback once and focuses each advanced question and completion", async () => {
    const user = userEvent.setup();
    renderQuiz("/quiz/ropework");
    const firstHeading = await screen.findByRole("heading", { level: 3 });
    const firstPrefix = firstHeading.textContent?.startsWith("First") ? "First" : "Second";
    await user.click(screen.getByRole("radio", { name: new RegExp(`${firstPrefix} correct`, "i") }));
    await user.click(screen.getByRole("button", { name: "Submit Answer" }));
    expect(screen.getAllByRole("status")).toHaveLength(1);
    expect(screen.getByRole("status").textContent).toContain("Correct");

    await user.click(screen.getByRole("button", { name: "Next Question" }));
    const secondHeading = await screen.findByRole("heading", { level: 3, name: firstPrefix === "First" ? "Second question?" : /First deliberately/ });
    await waitFor(() => expect(document.activeElement).toBe(secondHeading));

    await user.click(screen.getByRole("button", { name: "Previous" }));
    const previousHeading = await screen.findByRole("heading", { level: 3, name: firstHeading.textContent ?? "" });
    await waitFor(() => expect(document.activeElement).toBe(previousHeading));

    await user.click(screen.getByRole("button", { name: "Next Question" }));
    await screen.findByRole("heading", { level: 3, name: firstPrefix === "First" ? "Second question?" : /First deliberately/ });
    const secondPrefix = firstPrefix === "First" ? "Second" : "First";
    await user.click(screen.getByRole("radio", { name: new RegExp(`${secondPrefix} correct`, "i") }));
    await user.click(screen.getByRole("button", { name: "Submit Answer" }));
    await user.click(screen.getByRole("button", { name: "View Results" }));

    const completion = await screen.findByRole("heading", { name: "Quiz Complete!" });
    await waitFor(() => expect(document.activeElement).toBe(completion));
    expect(screen.getByRole("button", { name: "Return to Ropework & Knots" })).toBeTruthy();

    await user.click(screen.getByRole("button", { name: "Retry Quiz" }));
    const restartedHeading = await screen.findByRole("heading", { level: 3 });
    await waitFor(() => expect(document.activeElement).toBe(restartedHeading));
  });

  it("includes narrow reflow, long-content wrapping, and reduced-motion safeguards", async () => {
    const { container } = renderQuiz();
    await screen.findAllByRole("radio");

    expect(container.querySelector("main")?.className).toContain("px-3");
    expect(screen.getByRole("heading", { level: 1 }).className).toContain("[overflow-wrap:anywhere]");
    expect(screen.getAllByRole("radio")[1].closest("label")?.className).toContain("motion-reduce:hover:scale-100");
    expect(screen.getByRole("button", { name: "Submit Answer" }).parentElement?.className).toContain("flex-col");
  });
});
