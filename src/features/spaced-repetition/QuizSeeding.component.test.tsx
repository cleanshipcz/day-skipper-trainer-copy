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
  quizRegistry: {
    test: [{ id: "a1", question: "Question?", options: ["Wrong", "Right"], correctAnswer: 1, explanation: "Why." }],
  },
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
    fireEvent.click(await screen.findByRole("button", { name: "Right" }));
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
    fireEvent.click(await screen.findByRole("button", { name: "Right" }));
    fireEvent.click(screen.getByRole("button", { name: "Submit Answer" }));
    fireEvent.click(screen.getByRole("button", { name: "View Results" }));
    expect(await screen.findByRole("button", { name: "Retry completion save" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Retry completion save" }));
    await waitFor(() => expect(mocks.saveProgress.mock.calls.filter((call) => call[1] === true)).toHaveLength(2));

    expect(mocks.rpc.mock.calls.filter((call) => call[0] === "submit_quiz_score")).toHaveLength(1);
    expect(localStorage.getItem("quiz-attempt:a:test")).toContain('"scoreSaved":true');
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
    fireEvent.click(screen.getByRole("button", { name: "Right" }));
    fireEvent.click(screen.getByRole("button", { name: "Submit Answer" }));
    fireEvent.click(screen.getByRole("button", { name: "View Results" }));
    await screen.findByRole("button", { name: "Retry Quiz" });
    fireEvent.click(screen.getByRole("button", { name: "Retry Quiz" }));

    await waitFor(() => expect(localStorage.getItem("quiz-attempt:a:test")).toContain("replacement-attempt"));
  });
});
