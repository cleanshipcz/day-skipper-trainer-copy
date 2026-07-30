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
    mocks.auth.user = { id: "a" };
    mocks.loadProgress.mockReset().mockResolvedValue(null);
    mocks.saveProgress.mockReset().mockResolvedValue(true);
    mocks.resetProgress.mockReset().mockResolvedValue(undefined);
    mocks.seedQuizQuestions.mockReset().mockResolvedValue(undefined);
    mocks.rpc.mockReset().mockResolvedValue({ data: {}, error: null });
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
    mocks.rpc.mockReturnValueOnce(new Promise((resolve) => { resolveInsert = resolve; }));
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
});
