// @vitest-environment happy-dom
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ExamSession } from "./examSession";

let currentUser: { id: string } | null = { id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa" };
const rpc = vi.fn();
vi.mock("@/contexts/AuthHooks", () => ({
  useAuth: () => ({ user: currentUser, loading: false }),
}));
vi.mock("@/integrations/supabase/client", () => ({
  supabase: { rpc: (...args: unknown[]) => rpc(...args) },
}));

import Exam from "@/pages/Exam";

const deferred = <T,>() => {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((complete) => { resolve = complete; });
  return { promise, resolve };
};

const session = (overrides: Partial<ExamSession> = {}): ExamSession => ({
  ownerId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
  attemptId: "123e4567-e89b-42d3-a456-426614174000",
  questions: [{ id: "q", topicId: "safety", question: "Question?", options: ["Yes", "No"], correctAnswer: 0, explanation: "Because" }],
  answers: [0], flagged: [], current: 0, startedAt: Date.now() - 30_000, durationSeconds: 300,
  passMark: 65, submitted: true, elapsedSeconds: 30, saveStatus: "failed", ...overrides,
});

describe("exam persistence and identity integration", () => {
  beforeEach(() => {
    currentUser = { id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa" };
    rpc.mockReset();
    sessionStorage.clear();
  });

  it("retains a failed result across refresh and retries the same attempt id", async () => {
    sessionStorage.setItem("day-skipper-exam-session-v1", JSON.stringify(session()));
    rpc.mockResolvedValue({ error: null });
    render(<MemoryRouter><Exam /></MemoryRouter>);
    fireEvent.click(screen.getByRole("button", { name: /retry saving/i }));
    await waitFor(() => expect(rpc).toHaveBeenCalled());
    expect(rpc.mock.calls[0][1].p_attempt_id).toBe("123e4567-e89b-42d3-a456-426614174000");
    expect(JSON.parse(sessionStorage.getItem("day-skipper-exam-session-v1")!).saveStatus).toBe("saved");
  });

  it("quarantines another account's session before exposing its result", async () => {
    sessionStorage.setItem("day-skipper-exam-session-v1", JSON.stringify(session()));
    currentUser = { id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb" };
    render(<MemoryRouter><Exam /></MemoryRouter>);
    expect(screen.queryByText(/practice pass —/i)).toBeNull();
    await waitFor(() => expect(sessionStorage.getItem("day-skipper-exam-session-v1")).toBeNull());
    expect(rpc).not.toHaveBeenCalled();
  });

  it("ignores an old save response across a rapid A to B to A auth switch", async () => {
    const response = deferred<{ error: null }>();
    rpc.mockReturnValue(response.promise);
    sessionStorage.setItem("day-skipper-exam-session-v1", JSON.stringify(session()));
    const view = render(<MemoryRouter><Exam /></MemoryRouter>);

    fireEvent.click(screen.getByRole("button", { name: /retry saving/i }));
    await waitFor(() => expect(rpc).toHaveBeenCalledOnce());
    currentUser = { id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb" };
    view.rerender(<MemoryRouter><Exam /></MemoryRouter>);
    currentUser = { id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa" };
    view.rerender(<MemoryRouter><Exam /></MemoryRouter>);
    await waitFor(() => expect(sessionStorage.getItem("day-skipper-exam-session-v1")).toBeNull());

    response.resolve({ error: null });
    await response.promise;
    await waitFor(() => expect(screen.getByRole("button", { name: /start exam/i })).not.toBeNull());
    expect(sessionStorage.getItem("day-skipper-exam-session-v1")).toBeNull();
  });

  it("does not let an old save response overwrite a new attempt", async () => {
    const response = deferred<{ error: null }>();
    rpc.mockReturnValue(response.promise);
    sessionStorage.setItem("day-skipper-exam-session-v1", JSON.stringify(session()));
    render(<MemoryRouter><Exam /></MemoryRouter>);

    fireEvent.click(screen.getByRole("button", { name: /retry saving/i }));
    await waitFor(() => expect(rpc).toHaveBeenCalledOnce());
    fireEvent.click(screen.getByRole("button", { name: /new attempt/i }));
    fireEvent.click(screen.getByRole("button", { name: /start exam/i }));
    const newAttemptId = JSON.parse(sessionStorage.getItem("day-skipper-exam-session-v1")!).attemptId;

    response.resolve({ error: null });
    await response.promise;
    await waitFor(() => expect(JSON.parse(sessionStorage.getItem("day-skipper-exam-session-v1")!).attemptId).toBe(newAttemptId));
    expect(newAttemptId).not.toBe("123e4567-e89b-42d3-a456-426614174000");
    expect(JSON.parse(sessionStorage.getItem("day-skipper-exam-session-v1")!).saveStatus).toBe("pending");
  });

  it("shows elapsed time for an anonymous completed attempt", () => {
    currentUser = null;
    sessionStorage.setItem("day-skipper-exam-session-v1", JSON.stringify(session({ ownerId: null, elapsedSeconds: 42 })));
    render(<MemoryRouter><Exam /></MemoryRouter>);
    expect(screen.getByText(/0m 42s/)).not.toBeNull();
  });
});
