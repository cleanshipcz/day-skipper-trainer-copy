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
  maybeSingle: vi.fn(),
  loadProgressClient: vi.fn(),
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

vi.mock("@/features/progress/progressClient", () => ({
  loadProgressClient: mocks.loadProgressClient,
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    tag: "mock-supabase",
    from: () => {
      const query = {
        select: () => query,
        eq: () => query,
        maybeSingle: mocks.maybeSingle,
      };
      return query;
    },
  },
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
    mocks.maybeSingle.mockReset();
    mocks.maybeSingle.mockResolvedValue({ data: null, error: null });
    mocks.loadProgressClient.mockReset().mockResolvedValue({
      tag: "mock-supabase",
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: "user-123" } }, error: null }) },
      rpc: vi.fn().mockResolvedValue({ data: { current_streak: 1, bonus_points: 0, unlocked_badge_ids: [] }, error: null }),
      from: () => {
        const query = { select: () => query, eq: () => query, maybeSingle: mocks.maybeSingle };
        return query;
      },
    });
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

  it("distinguishes a failed load from a missing durable record", async () => {
    const { result } = renderHook(() => useProgress());
    mocks.maybeSingle.mockResolvedValueOnce({ data: null, error: new Error("network") });

    expect(await result.current.loadProgressDetailed("topic-a")).toEqual({ status: "failed", record: null });
    expect(await result.current.loadProgressDetailed("topic-a")).toEqual({ status: "missing", record: null });
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

  it("exposes confirmed, queued, and failed outcomes without changing the boolean API", async () => {
    const { result } = renderHook(() => useProgress());

    expect(await result.current.saveProgressDetailed("topic-a", false)).toBe("remote");

    mocks.retryable = true;
    mocks.saveProgressRecord.mockRejectedValueOnce(new Error("offline"));
    expect(await result.current.saveProgressDetailed("topic-a", false)).toBe("queued");

    mocks.retryable = false;
    mocks.saveProgressRecord.mockRejectedValueOnce(new Error("invalid"));
    expect(await result.current.saveProgressDetailed("topic-a", false)).toBe("failed");
  });

  it("exposes revision conflicts without queueing or blind retry", async () => {
    mocks.saveProgressRecord.mockRejectedValueOnce({ code: "40001", message: "revision conflict" });
    const { result } = renderHook(() => useProgress());
    expect(await result.current.saveProgressDetailed("victualling-checklist", false)).toBe("conflict");
    expect(mocks.queueProgress).not.toHaveBeenCalled();
    expect(mocks.toastError).not.toHaveBeenCalled();
  });

  it("reports a failed outcome when the offline queue also fails", async () => {
    mocks.retryable = true;
    mocks.saveProgressRecord.mockRejectedValueOnce(new Error("offline"));
    mocks.queueProgress.mockRejectedValueOnce(new Error("queue unavailable"));
    const { result } = renderHook(() => useProgress());

    expect(await result.current.saveProgressDetailed("topic-a", true)).toBe("failed");
    expect(mocks.toastError).toHaveBeenCalledWith("Failed to save progress");
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

  it("drops an owner A save while the lazy client loads after switching to B", async () => {
    let resolveClient!: (value: { tag: string }) => void;
    mocks.loadProgressClient.mockReturnValue(new Promise((resolve) => { resolveClient = resolve; }));
    const view = renderHook(() => useProgress());
    const pending = view.result.current.saveProgressDetailed("topic-a", true, 100, 10);
    mocks.mockUser = { id: "user-b" };
    view.rerender();
    resolveClient({ tag: "mock-supabase" });

    expect(await pending).toBe("failed");
    expect(mocks.saveProgressRecord).not.toHaveBeenCalled();
    expect(mocks.queueProgress).not.toHaveBeenCalled();
    expect(mocks.toastSuccess).not.toHaveBeenCalled();
    expect(mocks.toastError).not.toHaveBeenCalled();
  });

  it("drops an owner A reset while the lazy client loads after signout", async () => {
    let resolveClient!: (value: { tag: string }) => void;
    mocks.loadProgressClient.mockReturnValue(new Promise((resolve) => { resolveClient = resolve; }));
    const view = renderHook(() => useProgress());
    const pending = view.result.current.resetProgress("topic-a");
    mocks.mockUser = null;
    view.rerender();
    resolveClient({ tag: "mock-supabase" });

    await pending;
    expect(mocks.deleteProgressRecord).not.toHaveBeenCalled();
    expect(mocks.toastSuccess).not.toHaveBeenCalled();
    expect(mocks.toastError).not.toHaveBeenCalled();
  });

  it("drops an owner A load when its delayed query returns after switching to B", async () => {
    let resolveQuery!: (value: { data: null; error: null }) => void;
    mocks.maybeSingle.mockReturnValue(new Promise((resolve) => { resolveQuery = resolve; }));
    const view = renderHook(() => useProgress());
    const pending = view.result.current.loadProgressDetailed("topic-a");
    mocks.mockUser = { id: "user-b" };
    view.rerender();
    resolveQuery({ data: null, error: null });

    expect(await pending).toEqual({ status: "failed", record: null });
  });
});
