import { renderHook, act, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  saveProgress: vi.fn(),
  saveProgressDetailed: vi.fn(),
  loadProgressDetailed: vi.fn(),
  ownerId: null as string | null,
}));

vi.mock("@/hooks/useProgress", () => ({
  useProgress: () => ({ ownerId: mocks.ownerId, saveProgress: mocks.saveProgress, saveProgressDetailed: mocks.saveProgressDetailed, loadProgressDetailed: mocks.loadProgressDetailed }),
}));

import { useTheoryCompletionGate } from "./useTheoryCompletionGate";

describe("useTheoryCompletionGate", () => {
  const requiredSectionIds = ["s1", "s2", "s3"];
  const topicId = "topic-nav";

  beforeEach(() => {
    mocks.saveProgress.mockReset();
    mocks.saveProgress.mockResolvedValue(undefined);
    mocks.saveProgressDetailed.mockResolvedValue("remote");
    mocks.loadProgressDetailed.mockResolvedValue({ status: "anonymous", record: null });
    mocks.ownerId = null;
    localStorage.clear();
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

  it("loads revisioned evidence once and merges interaction made while loading", async () => {
    let resolveLoad!: (value: unknown) => void;
    mocks.loadProgressDetailed.mockReturnValue(new Promise(resolve => { resolveLoad = resolve; }));
    const { result, rerender } = renderHook(() => useTheoryCompletionGate({ topicId, requiredSectionIds, catalogueRevision: "v1" }));
    await act(async () => { await result.current.markSectionVisited("s2"); });
    await act(async () => { resolveLoad({ status: "remote", record: { answers_history: { catalogueRevision: "v1", visitedSectionIds: ["s1"] } } }); });
    rerender();
    expect(result.current.visitedSectionIds).toEqual(["s1", "s2"]);
    expect(mocks.loadProgressDetailed).toHaveBeenCalledTimes(1);
    expect(JSON.parse(localStorage.getItem(`theory-gate:anonymous:${topicId}:v1`)!).visitedSectionIds).toEqual(["s1", "s2"]);
    expect(mocks.saveProgressDetailed).toHaveBeenLastCalledWith(topicId, false, 67, 0, expect.objectContaining({ visitedSectionIds: ["s1", "s2"] }));
  });

  it("isolates browser evidence by owner", async () => {
    mocks.ownerId = "owner-a";
    localStorage.setItem(`theory-gate:owner-a:${topicId}:v1`, JSON.stringify({ visitedSectionIds: ["s1"] }));
    const { result, rerender } = renderHook(() => useTheoryCompletionGate({ topicId, requiredSectionIds, catalogueRevision: "v1" }));
    await act(async () => {});
    expect(result.current.visitedSectionIds).toEqual(["s1"]);
    mocks.ownerId = "owner-b";
    rerender();
    await act(async () => {});
    expect(result.current.visitedSectionIds).toEqual([]);
  });

  it("distinguishes failed saves and permits a single-flight retry", async () => {
    const { result } = renderHook(() => useTheoryCompletionGate({ topicId, requiredSectionIds: ["s1"], catalogueRevision: "v1" }));
    await act(async () => { await result.current.markSectionVisited("s1"); });
    mocks.saveProgressDetailed.mockClear();
    mocks.saveProgressDetailed.mockResolvedValueOnce("failed").mockResolvedValueOnce("remote");
    await act(async () => { expect(await result.current.markCompleted()).toBe(false); });
    expect(result.current.saveState).toBe("failed");
    await act(async () => { const one = result.current.markCompleted(); const two = result.current.markCompleted(); expect(await one).toBe(true); expect(await two).toBe(true); });
    expect(mocks.saveProgressDetailed).toHaveBeenCalledTimes(2);
  });

  it("treats the legacy saveProgress Boolean false result as a completion failure", async () => {
    const { result } = renderHook(() => useTheoryCompletionGate({ topicId, requiredSectionIds: ["s1"] }));
    await act(async () => { await result.current.markSectionVisited("s1"); });
    mocks.saveProgress.mockResolvedValueOnce(false);
    await act(async () => { expect(await result.current.markCompleted()).toBe(false); });
    expect(result.current.saveState).toBe("failed");
  });

  it("serializes rapid evidence saves and writes the latest snapshot last", async () => {
    let releaseFirst!: () => void;
    const { result } = renderHook(() => useTheoryCompletionGate({ topicId, requiredSectionIds, catalogueRevision: "v1" }));
    await waitFor(() => expect(localStorage.getItem(`theory-gate:anonymous:${topicId}:v1`)).not.toBeNull());
    mocks.saveProgressDetailed.mockClear();
    mocks.saveProgressDetailed.mockImplementationOnce(() => new Promise(resolve => { releaseFirst = () => resolve("remote"); })).mockResolvedValue("remote");
    let first!: Promise<void>; let second!: Promise<void>;
    act(() => { first = result.current.markSectionVisited("s1"); second = result.current.markSectionVisited("s2"); });
    expect(mocks.saveProgressDetailed).toHaveBeenCalledTimes(1);
    await act(async () => { releaseFirst(); await Promise.all([first, second]); });
    expect(mocks.saveProgressDetailed).toHaveBeenCalledTimes(2);
    expect(mocks.saveProgressDetailed).toHaveBeenLastCalledWith(topicId, false, 67, 0, expect.objectContaining({ visitedSectionIds: ["s1", "s2"] }));
  });

  it("ignores non-catalogue section IDs without producing evidence or a save", async () => {
    const { result } = renderHook(() => useTheoryCompletionGate({ topicId, requiredSectionIds, catalogueRevision: "v1" }));
    await act(async () => {});
    mocks.saveProgressDetailed.mockClear();
    await act(async () => { await result.current.markSectionVisited("sounds-tab"); });
    expect(result.current.visitedSectionIds).toEqual([]);
    expect(mocks.saveProgressDetailed).not.toHaveBeenCalled();
  });

  it("stores anonymous completion durably and restores that outcome after reload", async () => {
    mocks.saveProgressDetailed.mockResolvedValue("anonymous");
    const first = renderHook(() => useTheoryCompletionGate({ topicId, requiredSectionIds: ["s1"], catalogueRevision: "v1" }));
    await act(async () => { await first.result.current.markSectionVisited("s1"); });
    await act(async () => { expect(await first.result.current.markCompleted()).toBe(true); });
    expect(first.result.current.saveState).toBe("local");
    expect(JSON.parse(localStorage.getItem(`theory-gate:anonymous:${topicId}:v1`)!).completed).toBe(true);
    first.unmount();

    mocks.saveProgressDetailed.mockClear();
    const resumed = renderHook(() => useTheoryCompletionGate({ topicId, requiredSectionIds: ["s1"], catalogueRevision: "v1" }));
    await act(async () => {});
    expect(resumed.result.current.visitedSectionIds).toEqual(["s1"]);
    expect(resumed.result.current.saveState).toBe("local");
    expect(mocks.saveProgressDetailed).not.toHaveBeenCalled();
  });

  it("does not confirm anonymous completion when browser durability is unavailable", async () => {
    mocks.saveProgressDetailed.mockResolvedValue("anonymous");
    const setItem = vi.spyOn(localStorage, "setItem").mockImplementation(() => { throw new Error("storage unavailable"); });
    const { result } = renderHook(() => useTheoryCompletionGate({ topicId, requiredSectionIds: ["s1"], catalogueRevision: "v1" }));
    await act(async () => { await result.current.markSectionVisited("s1"); });
    await act(async () => { expect(await result.current.markCompleted()).toBe(false); });
    expect(result.current.saveState).toBe("failed");
    setItem.mockRestore();
  });

  it("drains a pending evidence write before queueing the completed snapshot", async () => {
    let releaseEvidence!: () => void;
    const { result } = renderHook(() => useTheoryCompletionGate({ topicId, requiredSectionIds: ["s1", "s2"], catalogueRevision: "v1" }));
    await waitFor(() => expect(localStorage.getItem(`theory-gate:anonymous:${topicId}:v1`)).not.toBeNull());
    mocks.saveProgressDetailed.mockClear();
    mocks.saveProgressDetailed
      .mockImplementationOnce(() => new Promise(resolve => { releaseEvidence = () => resolve("queued"); }))
      .mockResolvedValue("queued");
    let firstEvidence!: Promise<void>;
    let finalEvidence!: Promise<void>;
    let completion!: Promise<boolean>;
    act(() => { firstEvidence = result.current.markSectionVisited("s1"); });
    await waitFor(() => expect(mocks.saveProgressDetailed).toHaveBeenCalledTimes(1));
    act(() => { finalEvidence = result.current.markSectionVisited("s2"); });
    act(() => { completion = result.current.markCompleted(); });
    expect(mocks.saveProgressDetailed.mock.calls[0][1]).toBe(false);
    await act(async () => { releaseEvidence(); await Promise.all([firstEvidence, finalEvidence]); });
    await act(async () => { expect(await completion).toBe(true); });
    expect(mocks.saveProgressDetailed).toHaveBeenCalledTimes(2);
    expect(mocks.saveProgressDetailed.mock.calls.map((call) => call[1])).toEqual([false, true]);
    expect(mocks.saveProgressDetailed.mock.calls[1][4]).toEqual(expect.objectContaining({ completionState: "completed", visitedSectionIds: ["s1", "s2"] }));
  });
});
