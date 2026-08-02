// @vitest-environment happy-dom
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, test, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  auth: { user: { id: "a" } as { id: string } | null },
  loadProgress: vi.fn(),
  saveProgress: vi.fn(),
  resetProgress: vi.fn(),
  seedQuizQuestions: vi.fn(),
  rpc: vi.fn(),
  questions: [{ id: "a1", question: "Question?", options: ["Wrong", "Right"], correctAnswer: 1, explanation: "Why." }],
}));
vi.mock("@/contexts/AuthHooks", () => ({ useAuth: () => ({ user: mocks.auth.user }) }));
vi.mock("@/hooks/useProgress", () => ({
  useProgress: () => ({
    loadProgress: mocks.loadProgress,
    saveProgress: mocks.saveProgress,
    resetProgress: mocks.resetProgress,
  }),
}));
vi.mock("./reviewService", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./reviewService")>();
  return { ...actual, seedQuizQuestions: mocks.seedQuizQuestions };
});
vi.mock("@/integrations/supabase/client", () => ({
  supabase: { rpc: mocks.rpc },
}));
vi.mock("@/data/quizzes", () => ({
  loadQuizTopic: vi.fn().mockImplementation(() => Promise.resolve(mocks.questions)),
  isQuizTopicId: (value: string) => value === "test",
  topicMeta: { test: { title: "Test quiz", subtitle: "Test" } },
}));

import Quiz from "@/pages/Quiz";

const renderQuiz = () => render(
  <MemoryRouter initialEntries={["/quiz/test"]}>
    <Routes><Route path="/quiz/:topicId" element={<Quiz />} /></Routes>
  </MemoryRouter>,
);

describe("quiz review seeding identity isolation", () => {
  beforeEach(() => {
    localStorage.clear();
    mocks.auth.user = { id: "a" };
    mocks.questions = [{ id: "a1", question: "Question?", options: ["Wrong", "Right"], correctAnswer: 1, explanation: "Why." }];
    mocks.loadProgress.mockReset().mockResolvedValue(null);
    mocks.saveProgress.mockReset().mockResolvedValue(true);
    mocks.resetProgress.mockReset().mockResolvedValue(undefined);
    mocks.seedQuizQuestions.mockReset().mockResolvedValue(undefined);
    mocks.rpc.mockReset().mockImplementation((name: string) => Promise.resolve({
      data: name === "start_quiz_attempt" ? { attempt_id: "issued-attempt", started_at: new Date().toISOString() } : {},
      error: null,
    }));
  });

  test("should not seed a stale completed load after an A to B to A switch", async () => {
    let resolveLoad!: (value: { completed: boolean }) => void;
    mocks.loadProgress.mockReturnValueOnce(new Promise((resolve) => { resolveLoad = resolve; }));
    const view = renderQuiz();
    await waitFor(() => expect(mocks.loadProgress).toHaveBeenCalled());
    mocks.auth.user = { id: "b" };
    view.rerender(<MemoryRouter initialEntries={["/quiz/test"]}><Routes><Route path="/quiz/:topicId" element={<Quiz />} /></Routes></MemoryRouter>);
    mocks.auth.user = { id: "a" };
    view.rerender(<MemoryRouter initialEntries={["/quiz/test"]}><Routes><Route path="/quiz/:topicId" element={<Quiz />} /></Routes></MemoryRouter>);
    resolveLoad({ completed: true });

    await waitFor(() => expect(mocks.loadProgress).toHaveBeenCalled());
    expect(mocks.seedQuizQuestions).not.toHaveBeenCalled();
  });

  test("should not seed after auth changes while quiz completion persistence is pending", async () => {
    let resolveInsert!: (value: { data: object; error: null }) => void;
    mocks.rpc.mockImplementation((name: string) => name === "submit_quiz_score"
      ? new Promise((resolve) => { resolveInsert = resolve; })
      : Promise.resolve({ data: { attempt_id: "issued-attempt", started_at: new Date().toISOString() }, error: null }));
    const view = renderQuiz();
    fireEvent.click(await screen.findByRole("radio", { name: "Right" }));
    fireEvent.click(screen.getByRole("button", { name: "Submit Answer" }));
    fireEvent.click(screen.getByRole("button", { name: "View Results" }));
    await waitFor(() => expect(mocks.rpc).toHaveBeenCalledWith("submit_quiz_score", expect.any(Object)));

    mocks.auth.user = { id: "b" };
    view.rerender(<MemoryRouter initialEntries={["/quiz/test"]}><Routes><Route path="/quiz/:topicId" element={<Quiz />} /></Routes></MemoryRouter>);
    await act(async () => resolveInsert({ data: {}, error: null }));
    expect(mocks.seedQuizQuestions).not.toHaveBeenCalled();
    expect(mocks.saveProgress.mock.calls.some((call) => call[1] === true)).toBe(false);
  });

  test("should reuse the issued attempt when score succeeds but final progress needs retry", async () => {
    mocks.saveProgress.mockImplementation((_topic: string, completed: boolean) => Promise.resolve(!completed));
    renderQuiz();
    fireEvent.click(await screen.findByRole("radio", { name: "Right" }));
    fireEvent.click(screen.getByRole("button", { name: "Submit Answer" }));
    fireEvent.click(screen.getByRole("button", { name: "View Results" }));
    expect(await screen.findByRole("button", { name: "Retry completion save" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Retry completion save" }));
    await waitFor(() => expect(mocks.saveProgress.mock.calls.filter((call) => call[1] === true)).toHaveLength(2));

    expect(mocks.rpc.mock.calls.filter((call) => call[0] === "submit_quiz_score")).toHaveLength(1);
    expect(localStorage.getItem("quiz-attempt:a:test")).toBeNull();
  });

  test("should prevent restarting on score evidence whose progress still needs recovery", async () => {
    mocks.saveProgress.mockImplementation((_topic: string, completed: boolean) => Promise.resolve(!completed));
    renderQuiz();
    fireEvent.click(await screen.findByRole("radio", { name: "Right" }));
    fireEvent.click(screen.getByRole("button", { name: "Submit Answer" }));
    fireEvent.click(screen.getByRole("button", { name: "View Results" }));

    const blockedRestart = await screen.findByRole("button", { name: "Finish saving first" });
    expect((blockedRestart as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(blockedRestart);

    expect(screen.getByText("Quiz Complete!")).toBeTruthy();
    expect(mocks.rpc.mock.calls.filter((call) => call[0] === "start_quiz_attempt")).toHaveLength(1);
    expect(mocks.rpc.mock.calls.filter((call) => call[0] === "submit_quiz_score")).toHaveLength(1);
    expect(localStorage.getItem("quiz-attempt:a:test")).toBeNull();
  });

  test("should discard forged scored workflow instead of promoting attacker metrics", async () => {
    localStorage.setItem("quiz-attempt:a:test", JSON.stringify({
      attemptId: "scored-attempt",
      scoreSaved: true,
      startedAt: new Date().toISOString(),
      completion: {
        session: {
          version: 2,
          catalogueVersion: "old-catalogue",
          answers: [{ questionId: "a1", optionId: "Right" }],
          currentQuestionId: "a1",
        },
        correctAnswers: 999,
        percentage: 999,
        passed: true,
        pointsEarned: 999999,
      },
    }));

    renderQuiz();
    expect(await screen.findByRole("radio", { name: "Right" })).toBeTruthy();
    expect(screen.queryByText("Quiz Complete!")).toBeNull();
    await waitFor(() => expect(localStorage.getItem("quiz-attempt:a:test")).toContain("issued-attempt"));
    fireEvent.click(screen.getByRole("radio", { name: "Right" }));
    fireEvent.click(screen.getByRole("button", { name: "Submit Answer" }));
    fireEvent.click(screen.getByRole("button", { name: "View Results" }));
    await waitFor(() => expect(mocks.rpc).toHaveBeenCalledWith("submit_quiz_score", expect.objectContaining({
      p_attempt_id: "issued-attempt",
      p_score: 1,
      p_total_questions: 1,
    })));
    expect(mocks.saveProgress).toHaveBeenCalledWith("quiz-test", true, 100, 0, expect.any(Object));
  });

  test("should replace an interrupted attempt older than the server submission window", async () => {
    localStorage.setItem("quiz-attempt:a:test", JSON.stringify({
      attemptId: "expired-attempt",
      scoreSaved: false,
      startedAt: new Date(Date.now() - 2 * 60 * 60 * 1000 - 1).toISOString(),
    }));

    renderQuiz();

    await waitFor(() => expect(mocks.rpc).toHaveBeenCalledWith("start_quiz_attempt", { p_topic_id: "test" }));
    expect(localStorage.getItem("quiz-attempt:a:test")).toContain('"attemptId":"issued-attempt"');
    expect(localStorage.getItem("quiz-attempt:a:test")).not.toContain("expired-attempt");
  });

  test("should replace a restored attempt issued for an older catalogue total", async () => {
    localStorage.setItem("quiz-attempt:a:test", JSON.stringify({
      version: 2,
      attemptId: "twelve-question-attempt",
      expectedTotal: 12,
      scoreSaved: false,
      startedAt: new Date().toISOString(),
    }));

    renderQuiz();

    await waitFor(() => expect(mocks.rpc).toHaveBeenCalledWith("start_quiz_attempt", { p_topic_id: "test" }));
    expect(localStorage.getItem("quiz-attempt:a:test")).toContain('"attemptId":"issued-attempt"');
    expect(localStorage.getItem("quiz-attempt:a:test")).toContain('"expectedTotal":1');
    expect(localStorage.getItem("quiz-attempt:a:test")).not.toContain("twelve-question-attempt");
  });

  test("should preserve a restored attempt matching the current catalogue total", async () => {
    localStorage.setItem("quiz-attempt:a:test", JSON.stringify({
      version: 2,
      attemptId: "compatible-attempt",
      expectedTotal: 1,
      scoreSaved: false,
      startedAt: new Date().toISOString(),
    }));

    renderQuiz();

    expect(await screen.findByRole("radio", { name: "Right" })).toBeTruthy();
    await waitFor(() => expect(localStorage.getItem("quiz-attempt:a:test")).toContain("compatible-attempt"));
    expect(mocks.rpc.mock.calls.filter(([name]) => name === "start_quiz_attempt")).toHaveLength(0);
  });

  test("should discard the current unsaved attempt when restarting", async () => {
    mocks.rpc.mockImplementation((name: string) => Promise.resolve({
      data: name === "start_quiz_attempt"
        ? { attempt_id: mocks.rpc.mock.calls.filter(([rpcName]) => rpcName === "start_quiz_attempt").length > 1
          ? "replacement-attempt" : "issued-attempt", started_at: new Date().toISOString() }
        : {},
      error: name === "submit_quiz_score" ? new Error("offline") : null,
    }));
    renderQuiz();
    await waitFor(() => expect(localStorage.getItem("quiz-attempt:a:test")).toContain("issued-attempt"));
    fireEvent.click(screen.getByRole("radio", { name: "Right" }));
    fireEvent.click(screen.getByRole("button", { name: "Submit Answer" }));
    fireEvent.click(screen.getByRole("button", { name: "View Results" }));
    await screen.findByRole("button", { name: "Retry Quiz" });
    fireEvent.click(screen.getByRole("button", { name: "Retry Quiz" }));

    await waitFor(() => expect(localStorage.getItem("quiz-attempt:a:test")).toContain("replacement-attempt"));
  });

  test("should reject replayed scored completion after catalogue drift", async () => {
    mocks.questions = [{ id: "a1", question: "Question?", options: ["Right", "Replacement"], correctAnswer: 0, explanation: "Why." }];
    localStorage.setItem("quiz-attempt:a:test", JSON.stringify({
      version: 1,
      attemptId: "scored-attempt",
      scoreSaved: true,
      startedAt: new Date().toISOString(),
      completion: {
        session: {
          version: 2,
          catalogueVersion: "old-catalogue",
          answers: [{ questionId: "a1", optionId: "Right" }],
          currentQuestionId: "a1",
        },
        correctAnswers: 1,
        percentage: 100,
        passed: true,
        pointsEarned: 10,
      },
    }));

    renderQuiz();
    expect(await screen.findByRole("radio", { name: "Right" })).toBeTruthy();
    expect(screen.queryByText("Quiz Complete!")).toBeNull();
    expect(mocks.saveProgress.mock.calls.some((call) => call[1] === true)).toBe(false);
  });

  test("should not retry-write a legacy positional scored completion", async () => {
    localStorage.setItem("quiz-attempt:a:test", JSON.stringify({
      attemptId: "legacy-scored-attempt",
      scoreSaved: true,
      startedAt: new Date().toISOString(),
      completion: {
        answers: [1], currentQuestion: 0, correctAnswers: 1,
        percentage: 100, passed: true, pointsEarned: 10,
      },
    }));

    renderQuiz();

    expect(await screen.findByRole("radio", { name: "Right" })).toBeTruthy();
    await waitFor(() => expect(localStorage.getItem("quiz-attempt:a:test")).toContain("issued-attempt"));
    expect(mocks.saveProgress.mock.calls.some((call) => call[1] === true)).toBe(false);
  });

  test("should not reload the abandoned server session immediately after Retry Quiz", async () => {
    mocks.loadProgress.mockResolvedValue({
      completed: false,
      answers_history: {
        version: 2,
        catalogueVersion: "saved",
        answers: [{ questionId: "a1", optionId: "Right" }],
        currentQuestionId: "a1",
      },
    });
    mocks.rpc.mockImplementation((name: string) => Promise.resolve({
      data: name === "start_quiz_attempt" ? { attempt_id: "issued-attempt", started_at: new Date().toISOString() } : {},
      error: name === "submit_quiz_score" ? new Error("offline") : null,
    }));

    renderQuiz();
    const restored = await screen.findByRole("radio", { name: "Right" }) as HTMLInputElement;
    expect(restored.checked).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: "Submit Answer" }));
    fireEvent.click(screen.getByRole("button", { name: "View Results" }));
    await screen.findByRole("button", { name: "Retry Quiz" });
    const loadsBeforeRestart = mocks.loadProgress.mock.calls.length;
    fireEvent.click(screen.getByRole("button", { name: "Retry Quiz" }));

    const restarted = await screen.findByRole("radio", { name: "Right" }) as HTMLInputElement;
    await waitFor(() => expect(restarted.checked).toBe(false));
    expect(mocks.loadProgress).toHaveBeenCalledTimes(loadsBeforeRestart);
  });
});
