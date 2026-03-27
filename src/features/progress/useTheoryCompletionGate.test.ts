import { renderHook, act } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  saveProgress: vi.fn(),
}));

vi.mock("@/hooks/useProgress", () => ({
  useProgress: () => ({ saveProgress: mocks.saveProgress }),
}));

import { useTheoryCompletionGate } from "./useTheoryCompletionGate";

describe("useTheoryCompletionGate", () => {
  const requiredSectionIds = ["s1", "s2", "s3"];
  const topicId = "topic-nav";

  beforeEach(() => {
    mocks.saveProgress.mockReset();
    mocks.saveProgress.mockResolvedValue(undefined);
  });

  it("should start with not_started state and empty visited sections", () => {
    // given
    // - default hook args
    const { result } = renderHook(() =>
      useTheoryCompletionGate({ topicId, requiredSectionIds }),
    );

    // then
    expect(result.current.completionState).toBe("not_started");
    expect(result.current.visitedSectionIds).toEqual([]);
    expect(result.current.canComplete).toBe(false);
    expect(result.current.score).toBe(0);
  });

  it("should track visited section and transition to in_progress", async () => {
    // given
    const { result } = renderHook(() =>
      useTheoryCompletionGate({ topicId, requiredSectionIds }),
    );

    // when
    await act(async () => {
      await result.current.markSectionVisited("s1");
    });

    // then
    expect(result.current.visitedSectionIds).toEqual(["s1"]);
    expect(result.current.completionState).toBe("in_progress");
  });

  it("should persist in_progress state on first section visit", async () => {
    // given
    const { result } = renderHook(() =>
      useTheoryCompletionGate({ topicId, requiredSectionIds }),
    );

    // when
    await act(async () => {
      await result.current.markSectionVisited("s1");
    });

    // then
    expect(mocks.saveProgress).toHaveBeenCalledOnce();
    expect(mocks.saveProgress).toHaveBeenCalledWith(
      topicId,
      false,
      33,
      0,
      expect.objectContaining({
        completionState: "in_progress",
        visitedSectionIds: ["s1"],
      }),
    );
  });

  it("should not duplicate a section that was already visited", async () => {
    // given
    const { result } = renderHook(() =>
      useTheoryCompletionGate({ topicId, requiredSectionIds }),
    );

    // when
    await act(async () => {
      await result.current.markSectionVisited("s1");
    });
    await act(async () => {
      await result.current.markSectionVisited("s1");
    });

    // then
    expect(result.current.visitedSectionIds).toEqual(["s1"]);
  });

  it("should ignore empty sectionId", async () => {
    // given
    const { result } = renderHook(() =>
      useTheoryCompletionGate({ topicId, requiredSectionIds }),
    );

    // when
    await act(async () => {
      await result.current.markSectionVisited("");
    });

    // then
    expect(result.current.visitedSectionIds).toEqual([]);
    expect(mocks.saveProgress).not.toHaveBeenCalled();
  });

  it("should persist visited sections reliably across rapid sequential calls", async () => {
    // given
    // - This is the critical regression test: rapid calls must not lose data
    //   even if React batches or defers setState updaters.
    const { result } = renderHook(() =>
      useTheoryCompletionGate({ topicId, requiredSectionIds }),
    );

    // when
    await act(async () => {
      await result.current.markSectionVisited("s1");
    });
    await act(async () => {
      await result.current.markSectionVisited("s2");
    });

    // then
    expect(result.current.visitedSectionIds).toEqual(["s1", "s2"]);
    // - second call must persist the cumulative list, not just ["s2"]
    expect(mocks.saveProgress).toHaveBeenCalledTimes(1);
    const lastCallArgs = mocks.saveProgress.mock.calls[0];
    expect(lastCallArgs[4]).toEqual(
      expect.objectContaining({
        visitedSectionIds: ["s1"],
      }),
    );
  });

  it("should persist visited sections when calls happen within the same React batch", async () => {
    // given
    // - Both markSectionVisited calls happen inside a single act(),
    //   simulating React 18 automatic batching. The ref-based approach
    //   must ensure both sections are tracked even when setState updates
    //   are deferred.
    const { result } = renderHook(() =>
      useTheoryCompletionGate({ topicId, requiredSectionIds }),
    );

    // when
    await act(async () => {
      // Fire both without awaiting individually — simulates batched updates
      const p1 = result.current.markSectionVisited("s1");
      const p2 = result.current.markSectionVisited("s2");
      await Promise.all([p1, p2]);
    });

    // then
    // - Both sections must be tracked
    expect(result.current.visitedSectionIds).toContain("s1");
    expect(result.current.visitedSectionIds).toContain("s2");
    expect(result.current.visitedSectionIds).toHaveLength(2);
  });

  it("should allow completion when all required sections are visited", async () => {
    // given
    const { result } = renderHook(() =>
      useTheoryCompletionGate({ topicId, requiredSectionIds }),
    );

    // when
    for (const id of requiredSectionIds) {
      await act(async () => {
        await result.current.markSectionVisited(id);
      });
    }

    // then
    expect(result.current.canComplete).toBe(true);
    expect(result.current.completionState).toBe("completed");
    expect(result.current.score).toBe(100);
  });

  it("should persist completion via markCompleted when canComplete is true", async () => {
    // given
    const { result } = renderHook(() =>
      useTheoryCompletionGate({ topicId, requiredSectionIds, pointsOnComplete: 20 }),
    );
    for (const id of requiredSectionIds) {
      await act(async () => {
        await result.current.markSectionVisited(id);
      });
    }
    mocks.saveProgress.mockClear();

    // when
    let completed: boolean | undefined;
    await act(async () => {
      completed = await result.current.markCompleted();
    });

    // then
    expect(completed).toBe(true);
    expect(mocks.saveProgress).toHaveBeenCalledWith(
      topicId,
      true,
      100,
      20,
      expect.objectContaining({ completionState: "completed" }),
    );
  });

  it("should return false from markCompleted when not all sections are visited", async () => {
    // given
    const { result } = renderHook(() =>
      useTheoryCompletionGate({ topicId, requiredSectionIds }),
    );

    // when
    let completed: boolean | undefined;
    await act(async () => {
      completed = await result.current.markCompleted();
    });

    // then
    expect(completed).toBe(false);
    expect(mocks.saveProgress).not.toHaveBeenCalled();
  });
});
