// @vitest-environment happy-dom
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, test, vi } from "vitest";

const { fetchDueQuestions, recordReview, authState } = vi.hoisted(() => ({
  fetchDueQuestions: vi.fn(),
  recordReview: vi.fn(),
  authState: { user: { id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa" } as { id: string } | null },
}));
vi.mock("@/contexts/AuthHooks", () => ({
  useAuth: () => ({ user: authState.user, loading: false }),
}));
vi.mock("@/features/spaced-repetition/reviewService", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/features/spaced-repetition/reviewService")>();
  return { ...actual, fetchDueQuestions, recordReview };
});
vi.mock("@/integrations/supabase/client", () => ({ supabase: {} }));

import Review from "@/pages/Review";

const dueQuestion = {
  topicId: "safety",
  question: {
    id: "review-q",
    question: "Which option is safe?",
    options: ["Unsafe", "Safe"],
    correctAnswer: 1,
    explanation: "Safe is correct.",
  },
  review: {
    id: "review-row", user_id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa", question_id: "review-q",
    ease_factor: 2.5, interval_days: 0, repetitions: 0, next_review_at: "2026-07-30T06:00:00Z",
    last_reviewed_at: null, created_at: "2026-07-30T06:00:00Z",
    updated_at: "2026-07-30T06:00:00Z",
  },
};

describe("daily review session", () => {
  beforeEach(() => {
    authState.user = { id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa" };
    fetchDueQuestions.mockReset();
    recordReview.mockReset();
    fetchDueQuestions.mockResolvedValue([dueQuestion]);
  });

  test("should ignore a delayed A response after an A to B to A identity switch", async () => {
    let resolveFirst!: (value: readonly [typeof dueQuestion]) => void;
    const first = new Promise<readonly [typeof dueQuestion]>((resolve) => { resolveFirst = resolve; });
    fetchDueQuestions.mockReturnValueOnce(first).mockResolvedValue([]);
    const view = render(<MemoryRouter><Review /></MemoryRouter>);

    authState.user = { id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb" };
    view.rerender(<MemoryRouter><Review /></MemoryRouter>);
    authState.user = { id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa" };
    view.rerender(<MemoryRouter><Review /></MemoryRouter>);
    resolveFirst([dueQuestion]);

    expect(await screen.findByText("No questions are due today.")).toBeTruthy();
    expect(screen.queryByText("Which option is safe?")).toBeNull();
  });

  test("should ignore a save completion after the owner changes", async () => {
    let resolveSave!: (value: typeof dueQuestion.review) => void;
    recordReview.mockReturnValue(new Promise((resolve) => { resolveSave = resolve; }));
    const view = render(<MemoryRouter><Review /></MemoryRouter>);
    fireEvent.click(await screen.findByRole("button", { name: "Safe" }));
    fireEvent.click(screen.getByRole("button", { name: "Check answer" }));
    fireEvent.click(screen.getByRole("button", { name: "Save and continue" }));

    authState.user = { id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb" };
    fetchDueQuestions.mockResolvedValue([]);
    view.rerender(<MemoryRouter><Review /></MemoryRouter>);
    resolveSave(dueQuestion.review);

    expect(await screen.findByText("No questions are due today.")).toBeTruthy();
    expect(screen.queryByText(/1 reviewed/i)).toBeNull();
  });

  test("should synchronously hide a previously loaded A session after an A to B to A switch", async () => {
    const view = render(<MemoryRouter><Review /></MemoryRouter>);
    expect(await screen.findByText("Which option is safe?")).toBeTruthy();
    fetchDueQuestions.mockReturnValue(new Promise(() => undefined));

    authState.user = { id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb" };
    view.rerender(<MemoryRouter><Review /></MemoryRouter>);
    authState.user = { id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa" };
    view.rerender(<MemoryRouter><Review /></MemoryRouter>);

    expect(screen.getByText("Loading reviews…")).toBeTruthy();
    expect(screen.queryByText("Which option is safe?")).toBeNull();
  });

  test("should retain the answered question and offer an idempotent retry when saving fails", async () => {
    recordReview.mockRejectedValueOnce(new Error("offline")).mockResolvedValueOnce(dueQuestion.review);
    render(<MemoryRouter><Review /></MemoryRouter>);
    fireEvent.click(await screen.findByRole("button", { name: "Safe" }));
    fireEvent.click(screen.getByRole("button", { name: "Check answer" }));
    fireEvent.click(screen.getByRole("button", { name: "Save and continue" }));

    expect((await screen.findByRole("alert")).textContent).toMatch(/answer is still here/i);
    expect(screen.getByRole("button", { name: "Safe" }).hasAttribute("disabled")).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: "Retry saving" }));

    await waitFor(() => expect(screen.getByText(/1 reviewed · 1 correct/i)).toBeTruthy());
    expect(recordReview.mock.calls[0][3]).toBe(recordReview.mock.calls[1][3]);
  });

  test("should show an empty-state summary when no questions are due", async () => {
    fetchDueQuestions.mockResolvedValue([]);
    render(<MemoryRouter><Review /></MemoryRouter>);

    expect(await screen.findByText("No questions are due today.")).toBeTruthy();
  });
});
