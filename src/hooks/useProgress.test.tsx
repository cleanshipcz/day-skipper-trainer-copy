import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  mockUser: { id: "user-123" } as { id: string } | null,
  toastSuccess: vi.fn(),
  toastError: vi.fn(),
  toastInfo: vi.fn(),
  saveProgressRecord: vi.fn(),
  deleteProgressRecord: vi.fn(),
  queueProgress: vi.fn(),
  retryable: false,
}));

vi.mock("@/contexts/AuthHooks", () => ({
  useAuth: () => ({ user: mocks.mockUser }),
}));

vi.mock("sonner", () => ({
  toast: {
    success: mocks.toastSuccess,
    error: mocks.toastError,
    info: mocks.toastInfo,
  },
}));

vi.mock("@/features/progress/progressPersistence", () => ({
  saveProgressRecord: mocks.saveProgressRecord,
  deleteProgressRecord: mocks.deleteProgressRecord,
}));

vi.mock("@/features/offline/progressQueue", () => ({
  queueProgress: mocks.queueProgress,
  isRetryableProgressError: () => mocks.retryable,
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
    mocks.toastInfo.mockReset();
    mocks.saveProgressRecord.mockReset();
    mocks.saveProgressRecord.mockResolvedValue({ pointsAwarded: true, completionAwarded: true, awardedPoints: 10 });
    mocks.deleteProgressRecord.mockReset();
    mocks.queueProgress.mockReset();
    mocks.queueProgress.mockResolvedValue({});
    mocks.retryable = false;
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

    const saved = await result.current.saveProgress("topic-a", true, 100, 15, { q1: "A" });

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
    expect(mocks.toastSuccess).toHaveBeenCalledWith("+10 points earned!");
    expect(mocks.toastSuccess).toHaveBeenCalledWith("Topic completed! 🎉");
    expect(saved).toBe(true);
  });

  it("returns false when save persistence fails", async () => {
    mocks.saveProgressRecord.mockRejectedValueOnce(new Error("save failed"));
    const { result } = renderHook(() => useProgress());

    expect(await result.current.saveProgress("topic-a", true)).toBe(false);
    expect(mocks.toastError).toHaveBeenCalledWith("Failed to save progress");
    expect(mocks.queueProgress).not.toHaveBeenCalled();
  });

  it("queues connectivity failures and only then reports the save as accepted", async () => {
    mocks.retryable = true;
    mocks.saveProgressRecord.mockRejectedValueOnce(new Error("Failed to fetch"));
    const { result } = renderHook(() => useProgress());

    expect(await result.current.saveProgress("topic-a", true, 80, 10)).toBe(true);
    expect(mocks.queueProgress).toHaveBeenCalledWith(expect.objectContaining({
      userId: "user-123",
      topicId: "topic-a",
      completed: true,
    }));
    expect(mocks.toastError).not.toHaveBeenCalled();
  });

  it("does not show points toast when persistence reports no new award", async () => {
    mocks.saveProgressRecord.mockResolvedValueOnce({ pointsAwarded: false, completionAwarded: false, awardedPoints: 0 });
    const { result } = renderHook(() => useProgress());

    await result.current.saveProgress("topic-a", true, 100, 15);

    expect(mocks.toastSuccess).not.toHaveBeenCalledWith("+15 points earned!");
    expect(mocks.toastSuccess).not.toHaveBeenCalledWith("Topic completed! 🎉");
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
