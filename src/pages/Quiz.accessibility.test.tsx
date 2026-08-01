import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";

const mocks = vi.hoisted(() => ({
  loadProgress: vi.fn(),
  saveProgress: vi.fn(),
  resetProgress: vi.fn(),
}));

vi.mock("@/contexts/AuthHooks", () => ({ useAuth: () => ({ user: null }) }));
vi.mock("@/hooks/useProgress", () => ({ useProgress: () => mocks }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { rpc: vi.fn() } }));
vi.mock("@/data/quizzes", () => ({
  isQuizTopicId: () => true,
  topicMeta: { test: { title: "A very long localized quiz title that must reflow", subtitle: "Long localized supporting text" } },
  loadQuizTopic: vi.fn().mockResolvedValue([
    { id: "q1", question: "First deliberately long localized question withoutshortbreakpoints?", options: ["First wrong", "First correct answer with exceptionallylonglocalizedcontent"], correctAnswer: 1, explanation: "First explanation with exceptionallylonglocalizedcontent." },
    { id: "q2", question: "Second question?", options: ["Second wrong", "Second correct"], correctAnswer: 1, explanation: "Second explanation." },
  ]),
}));

import Quiz from "./Quiz";

const renderQuiz = () => render(
  <MemoryRouter initialEntries={["/quiz/test"]}>
    <Routes><Route path="/quiz/:topicId" element={<Quiz />} /></Routes>
  </MemoryRouter>,
);

describe("Quiz accessible interaction and reflow", () => {
  beforeEach(() => {
    localStorage.clear();
    mocks.loadProgress.mockReset().mockResolvedValue(null);
    mocks.saveProgress.mockReset().mockResolvedValue(true);
    mocks.resetProgress.mockReset().mockResolvedValue(true);
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

  it("announces feedback once and focuses each advanced question and completion", async () => {
    const user = userEvent.setup();
    renderQuiz();
    const firstHeading = await screen.findByRole("heading", { level: 3 });
    const firstPrefix = firstHeading.textContent?.startsWith("First") ? "First" : "Second";
    await user.click(screen.getByRole("radio", { name: new RegExp(`${firstPrefix} correct`, "i") }));
    await user.click(screen.getByRole("button", { name: "Submit Answer" }));
    expect(screen.getAllByRole("status")).toHaveLength(1);
    expect(screen.getByRole("status").textContent).toContain("Correct");

    await user.click(screen.getByRole("button", { name: "Next Question" }));
    const secondHeading = await screen.findByRole("heading", { level: 3, name: firstPrefix === "First" ? "Second question?" : /First deliberately/ });
    await waitFor(() => expect(document.activeElement).toBe(secondHeading));
    const secondPrefix = firstPrefix === "First" ? "Second" : "First";
    await user.click(screen.getByRole("radio", { name: new RegExp(`${secondPrefix} correct`, "i") }));
    await user.click(screen.getByRole("button", { name: "Submit Answer" }));
    await user.click(screen.getByRole("button", { name: "View Results" }));

    const completion = await screen.findByRole("heading", { name: "Quiz Complete!" });
    await waitFor(() => expect(document.activeElement).toBe(completion));
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
