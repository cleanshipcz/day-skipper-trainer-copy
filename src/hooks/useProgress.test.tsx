import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  mockUser: { id: "user-123" } as { id: string } | null,
  toastSuccess: vi.fn(),
  toastError: vi.fn(),
  saveProgressRecord: vi.fn(),
  deleteProgressRecord: vi.fn(),
}));

vi.mock("@/contexts/AuthHooks", () => ({
  useAuth: () => ({ user: mocks.mockUser }),
}));

vi.mock("sonner", () => ({
  toast: {
    success: mocks.toastSuccess,
    error: mocks.toastError,
  },
}));

vi.mock("@/features/progress/progressPersistence", () => ({
  saveProgressRecord: mocks.saveProgressRecord,
  deleteProgressRecord: mocks.deleteProgressRecord,
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: { tag: "mock-supabase" },
}));

import { useProgress } from "./useProgress";

describe("useProgress", () => {
  beforeEach(() => {
    mocks.mockUser = { id: "user-123" };
    mocks.toastSuccess.mockReset();
    mocks.toastError.mockReset();
    mocks.saveProgressRecord.mockReset();
    mocks.deleteProgressRecord.mockReset();
  });

  it("does nothing for save/reset when no authenticated user exists", async () => {
    mocks.mockUser = null;
    const { result } = renderHook(() => useProgress());

    await result.current.saveProgress("topic-a", true, 80, 10);
    await result.current.resetProgress("topic-a");

    expect(mocks.saveProgressRecord).not.toHaveBeenCalled();
    expect(mocks.deleteProgressRecord).not.toHaveBeenCalled();
    expect(mocks.toastSuccess).not.toHaveBeenCalled();
    expect(mocks.toastError).not.toHaveBeenCalled();
  });

  it("surfaces success toasts when save succeeds with points and completion", async () => {
    const { result } = renderHook(() => useProgress());

    await result.current.saveProgress("topic-a", true, 100, 15, { q1: "A" });

    expect(mocks.saveProgressRecord).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "user-123",
        topicId: "topic-a",
        completed: true,
        score: 100,
        pointsEarned: 15,
        answersHistory: { q1: "A" },
      }),
    );
    expect(mocks.toastSuccess).toHaveBeenCalledWith("+15 points earned!");
    expect(mocks.toastSuccess).toHaveBeenCalledWith("Topic completed! 🎉");
  });

  it("shows error toast when reset fails", async () => {
    mocks.deleteProgressRecord.mockRejectedValueOnce(new Error("delete failed"));
    const { result } = renderHook(() => useProgress());

    await result.current.resetProgress("topic-a");

    expect(mocks.deleteProgressRecord).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "user-123",
        topicId: "topic-a",
      }),
    );
    expect(mocks.toastError).toHaveBeenCalledWith("Failed to reset progress");
  });
});
