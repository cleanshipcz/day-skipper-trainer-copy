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
    sessionStorage.clear();
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

  test("should not seed replacement IDs from a completed legacy catalogue", async () => {
    mocks.questions = [{ id: "e13", question: "Replacement?", options: ["Wrong", "Right"], correctAnswer: 1, explanation: "Why." }];
    mocks.loadProgress.mockResolvedValue({
      completed: true,
      score: 100,
      answers_history: {
        version: 3,
        catalogueVersion: "legacy-e1-e12",
        answers: [{ questionId: "e1", optionId: "Old answer" }],
        currentQuestionId: "e1",
      },
    });

    renderQuiz();

    expect(await screen.findByRole("radio", { name: "Right" })).toBeTruthy();
    await waitFor(() => expect(mocks.loadProgress).toHaveBeenCalled());
    expect(mocks.seedQuizQuestions).not.toHaveBeenCalled();
  });

  test("should repair review seeding for a completed current catalogue", async () => {
    mocks.questions = [{ id: "e13", question: "Replacement?", options: ["Wrong", "Right"], correctAnswer: 1, explanation: "Why." }];
    const { buildQuizSessionProgress } = await import("@/features/quiz/sessionProgress");
    mocks.loadProgress.mockResolvedValue({
      completed: true,
      score: 100,
      answers_history: buildQuizSessionProgress([1], 0, mocks.questions),
    });

    renderQuiz();

    await waitFor(() => expect(mocks.seedQuizQuestions).toHaveBeenCalledWith(
      expect.anything(), "test", ["e13"],
    ));
    expect(await screen.findByRole("radio", { name: "Right" })).toBeTruthy();
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

    await waitFor(() => expect(mocks.rpc).toHaveBeenCalledWith("start_quiz_attempt", { p_topic_id: "test", p_expected_total: 1 }));
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

    await waitFor(() => expect(mocks.rpc).toHaveBeenCalledWith("start_quiz_attempt", { p_topic_id: "test", p_expected_total: 1 }));
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
    await waitFor(() => expect(restored.checked).toBe(true));
    fireEvent.click(screen.getByRole("button", { name: "Submit Answer" }));
    fireEvent.click(screen.getByRole("button", { name: "View Results" }));
    await screen.findByRole("button", { name: "Retry Quiz" });
    const loadsBeforeRestart = mocks.loadProgress.mock.calls.length;
    fireEvent.click(screen.getByRole("button", { name: "Retry Quiz" }));

    const restarted = await screen.findByRole("radio", { name: "Right" }) as HTMLInputElement;
    await waitFor(() => expect(restarted.checked).toBe(false));
    expect(mocks.loadProgress).toHaveBeenCalledTimes(loadsBeforeRestart);
  });

  test("resumes an anonymous attempt after reload without remote persistence", async () => {
    mocks.auth.user = null;
    const first = renderQuiz();
    fireEvent.click(await screen.findByRole("radio", { name: "Right" }));
    fireEvent.click(screen.getByRole("button", { name: "Submit Answer" }));
    await waitFor(() => expect(sessionStorage.getItem("quiz-anonymous-session-v1:test")).toContain('"questionId":"a1"'));
    expect(screen.getAllByRole("status")).toHaveLength(1);
    expect(screen.getByText(/anonymous progress is kept/i).getAttribute("aria-live")).toBe("polite");
    const stored = sessionStorage.getItem("quiz-anonymous-session-v1:test") ?? "";
    expect(stored).not.toContain("Question?");
    expect(stored).not.toContain("Why.");
    expect(stored).not.toContain('"owner"');
    expect(mocks.saveProgress).not.toHaveBeenCalled();
    first.unmount();

    renderQuiz();
    expect(await screen.findByText("Practice attempt resumed for this browser session.")).toBeTruthy();
    expect(screen.getByText("Why.")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "View Results" }));
    expect(await screen.findByText("Quiz Complete!")).toBeTruthy();
    expect(sessionStorage.getItem("quiz-anonymous-session-v1:test")).toBeNull();
    expect(mocks.rpc.mock.calls.some(([name]) => name === "submit_quiz_score")).toBe(false);
  });

  test("discards anonymous progress on sign-in instead of promoting it to a score", async () => {
    mocks.auth.user = null;
    const view = renderQuiz();
    fireEvent.click(await screen.findByRole("radio", { name: "Right" }));
    fireEvent.click(screen.getByRole("button", { name: "Submit Answer" }));
    await waitFor(() => expect(sessionStorage.getItem("quiz-anonymous-session-v1:test")).not.toBeNull());
    sessionStorage.setItem("quiz-anonymous-session-v1:weather", JSON.stringify({ unrelated: "anonymous quiz" }));

    mocks.auth.user = { id: "a" };
    view.rerender(<MemoryRouter initialEntries={["/quiz/test"]}><Routes><Route path="/quiz/:topicId" element={<Quiz />} /></Routes></MemoryRouter>);
    await waitFor(() => expect(sessionStorage.getItem("quiz-anonymous-session-v1:test")).toBeNull());
    expect(sessionStorage.getItem("quiz-anonymous-session-v1:weather")).toBeNull();
    await waitFor(() => expect(mocks.rpc).toHaveBeenCalledWith("start_quiz_attempt", { p_topic_id: "test", p_expected_total: 1 }));
    expect(mocks.rpc.mock.calls.some(([name]) => name === "submit_quiz_score")).toBe(false);
    expect(mocks.saveProgress.mock.calls.some((call) => call[1] === true)).toBe(false);

    mocks.auth.user = null;
    view.rerender(<MemoryRouter initialEntries={["/quiz/test"]}><Routes><Route path="/quiz/:topicId" element={<Quiz />} /></Routes></MemoryRouter>);
    await waitFor(() => expect(screen.queryByText("Practice attempt resumed for this browser session.")).toBeNull());
    expect((screen.getByRole("radio", { name: "Right" }) as HTMLInputElement).checked).toBe(false);
  });

  test("surfaces an empty attempt response early and retries the real start operation", async () => {
    mocks.rpc
      .mockResolvedValueOnce({ data: null, error: null })
      .mockResolvedValueOnce({ data: { attempt_id: "recovered-attempt", started_at: new Date().toISOString() }, error: null });

    renderQuiz();

    expect((await screen.findByRole("alert")).textContent).toContain("could not start your saved quiz attempt");
    fireEvent.click(screen.getByRole("button", { name: "Retry starting quiz" }));
    await waitFor(() => expect(localStorage.getItem("quiz-attempt:a:test")).toContain("recovered-attempt"));
    expect(mocks.rpc.mock.calls.filter(([name]) => name === "start_quiz_attempt")).toHaveLength(2);
  });

  test("buffers a completed quiz and submits it after attempt-start recovery", async () => {
    mocks.rpc
      .mockResolvedValueOnce({ data: null, error: new Error("offline") })
      .mockResolvedValueOnce({ data: { attempt_id: "recovered-attempt", started_at: new Date().toISOString() }, error: null })
      .mockResolvedValue({ data: {}, error: null });

    renderQuiz();
    await screen.findByRole("alert");
    fireEvent.click(screen.getByRole("radio", { name: "Right" }));
    fireEvent.click(screen.getByRole("button", { name: "Submit Answer" }));
    fireEvent.click(screen.getByRole("button", { name: "View Results" }));
    expect(await screen.findByText("Quiz Complete!")).toBeTruthy();
    expect(screen.getByText(/result cannot be saved until it starts/i)).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Retry starting quiz" }));
    await waitFor(() => expect(mocks.rpc).toHaveBeenCalledWith("submit_quiz_score", expect.objectContaining({
      p_attempt_id: "recovered-attempt",
      p_score: 1,
    })));
    expect(mocks.saveProgress).toHaveBeenCalledWith("quiz-test", true, 100, 0, expect.any(Object));
    await waitFor(() => expect(screen.queryByRole("button", { name: "Save completed quiz" })).toBeNull());
  });

  test("keeps start recovery separate when retry fails again", async () => {
    mocks.rpc.mockResolvedValue({ data: null, error: new Error("offline") });
    renderQuiz();
    await screen.findByRole("alert");

    fireEvent.click(screen.getByRole("button", { name: "Retry starting quiz" }));
    await waitFor(() => expect(mocks.rpc.mock.calls.filter(([name]) => name === "start_quiz_attempt")).toHaveLength(2));
    expect(screen.getByRole("button", { name: "Retry starting quiz" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Retry completion save" })).toBeNull();
  });

  test("preserves completion across a delayed initial start and submits only on the explicit save action", async () => {
    let resolveStart!: (value: { data: { attempt_id: string; started_at: string }; error: null }) => void;
    mocks.rpc.mockImplementation((name: string) => name === "start_quiz_attempt"
      ? new Promise((resolve) => { resolveStart = resolve; })
      : Promise.resolve({ data: {}, error: null }));
    renderQuiz();
    await screen.findByText(/Starting your saved quiz attempt/i);
    fireEvent.click(screen.getByRole("radio", { name: "Right" }));
    fireEvent.click(screen.getByRole("button", { name: "Submit Answer" }));
    fireEvent.click(screen.getByRole("button", { name: "View Results" }));
    expect(await screen.findByText(/not saveable yet/i)).toBeTruthy();

    await act(async () => resolveStart({ data: { attempt_id: "delayed-attempt", started_at: new Date().toISOString() }, error: null }));
    fireEvent.click(await screen.findByRole("button", { name: "Save completed quiz" }));
    await waitFor(() => expect(mocks.rpc.mock.calls.filter(([name]) => name === "submit_quiz_score")).toHaveLength(1));
  });

  test("ignores delayed attempt success after the authenticated owner changes", async () => {
    let resolveStart!: (value: { data: { attempt_id: string; started_at: string }; error: null }) => void;
    mocks.rpc.mockImplementationOnce(() => new Promise((resolve) => { resolveStart = resolve; }));
    const view = renderQuiz();
    expect(await screen.findByText(/Starting your saved quiz attempt/i)).toBeTruthy();

    mocks.auth.user = { id: "b" };
    view.rerender(<MemoryRouter initialEntries={["/quiz/test"]}><Routes><Route path="/quiz/:topicId" element={<Quiz />} /></Routes></MemoryRouter>);
    await act(async () => resolveStart({ data: { attempt_id: "stale-a-attempt", started_at: new Date().toISOString() }, error: null }));

    expect(localStorage.getItem("quiz-attempt:a:test")).toBeNull();
    expect(localStorage.getItem("quiz-attempt:b:test")).not.toContain("stale-a-attempt");
  });
});
