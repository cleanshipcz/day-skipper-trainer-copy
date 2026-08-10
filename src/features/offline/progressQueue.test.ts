import { describe, expect, it, vi } from "vitest";
import "fake-indexeddb/auto";
import { canonicalQueuedTopicId, getQueuedProgress, isRetryableProgressError, mergeQueuedAlias, queueProgress, replayProgressQueue } from "./progressQueue";

const deferred = <T,>() => {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => { resolve = done; });
  return { promise, resolve };
};

describe("offline progress queue", () => {
  it("canonicalizes legacy Tides aliases and monotonically merges a collision", async () => {
    expect(canonicalQueuedTopicId("tidal-heights-calc")).toBe("tides-heights-calc");
    expect(canonicalQueuedTopicId("vector-triangle")).toBe("tides-vector-tool");
    const base = { userId: "tides-owner", completed: false, pointsEarned: 0, attempts: 2, status: "pending" as const };
    const canonical = { ...base, id: "tides-owner:tides-heights-calc", topicId: "tides-heights-calc", score: 20, answersHistory: { evidence: "canonical" }, updatedAt: 20, revision: 3 };
    const legacy = { ...base, id: "tides-owner:tidal-heights-calc", topicId: "tidal-heights-calc", score: 80, answersHistory: { evidence: "stronger-legacy" }, updatedAt: 10, revision: 2 };
    expect(mergeQueuedAlias(canonical, legacy)).toEqual(expect.objectContaining({
      id: "tides-owner:tides-heights-calc", topicId: "tides-heights-calc", score: 80,
      answersHistory: { evidence: "stronger-legacy" }, revision: 4,
    }));
    expect(mergeQueuedAlias(undefined, legacy)).toEqual(expect.objectContaining({ topicId: "tides-heights-calc" }));
    expect(mergeQueuedAlias(canonical, { ...legacy, completed: canonical.completed, score: canonical.score, updatedAt: canonical.updatedAt, revision: canonical.revision }))
      .toEqual(expect.objectContaining({ answersHistory: { evidence: "canonical" } }));

    await queueProgress({ userId: "legacy-write", topicId: "vector-triangle", completed: true, score: 100, pointsEarned: 10 });
    expect(await getQueuedProgress("legacy-write")).toEqual([expect.objectContaining({ topicId: "tides-vector-tool", id: "legacy-write:tides-vector-tool" })]);
  });
  it("keeps the newest update for a user and topic", async () => {
    await queueProgress({ userId: "queue-user", topicId: "charts", completed: false, score: 20, pointsEarned: 0 }, 10);
    await queueProgress({ userId: "queue-user", topicId: "charts", completed: true, score: 90, pointsEarned: 10 }, 20);

    expect(await getQueuedProgress("queue-user")).toEqual([
      expect.objectContaining({ completed: true, score: 90, updatedAt: 20 }),
    ]);
  });

  it("keeps current-revision queued Lights completion monotonic and permits migration from an old revision", async () => {
    const full = {
      catalogueRevision: "colregs-parts-c-d-annex-iv-v1", completionState: "completed",
      visitedSectionIds: ["part-c-recognition", "part-d-recognition", "distress-recognition"],
    };
    await queueProgress({ userId: "lights-monotonic", topicId: "lights-theory", completed: true, score: 100, pointsEarned: 10, answersHistory: full }, 10);
    await queueProgress({
      userId: "lights-monotonic", topicId: "lights-theory", completed: false, score: 33, pointsEarned: 0,
      answersHistory: { catalogueRevision: "colregs-parts-c-d-annex-iv-v1", completionState: "in_progress", visitedSectionIds: ["part-c-recognition"] },
    }, 20);
    expect(await getQueuedProgress("lights-monotonic")).toEqual([
      expect.objectContaining({ completed: true, score: 100, answersHistory: full, updatedAt: 20, revision: 2 }),
    ]);

    await queueProgress({
      userId: "lights-monotonic", topicId: "lights-theory", completed: false, score: 0, pointsEarned: 0,
      answersHistory: { catalogueRevision: "stale-v0", completionState: "in_progress", visitedSectionIds: [] },
    }, 30);
    expect(await getQueuedProgress("lights-monotonic")).toEqual([
      expect.objectContaining({ completed: true, score: 100, answersHistory: full, revision: 3 }),
    ]);

    await queueProgress({
      userId: "lights-upgrade", topicId: "lights-theory", completed: true, score: 100, pointsEarned: 10,
      answersHistory: { ...full, catalogueRevision: "stale-v0" },
    }, 10);
    await queueProgress({
      userId: "lights-upgrade", topicId: "lights-theory", completed: false, score: 0, pointsEarned: 0,
      answersHistory: { catalogueRevision: "colregs-parts-c-d-annex-iv-v1", completionState: "in_progress", visitedSectionIds: [] },
    }, 20);
    expect(await getQueuedProgress("lights-upgrade")).toEqual([
      expect.objectContaining({ completed: false, answersHistory: expect.objectContaining({ catalogueRevision: "colregs-parts-c-d-annex-iv-v1" }) }),
    ]);
  });

  it("keeps same-revision Compass completion monotonic across stale tab writes", async () => {
    const completedEvidence = {
      catalogueRevision: "compass-theory-v1",
      completionState: "completed",
      visitedSectionIds: ["read-content"],
    };
    await queueProgress({
      userId: "compass-tabs", topicId: "compass-theory", completed: true,
      score: 100, pointsEarned: 10, answersHistory: completedEvidence,
    }, 10);

    await queueProgress({
      userId: "compass-tabs", topicId: "compass-theory", completed: false,
      score: 0, pointsEarned: 0,
      answersHistory: {
        catalogueRevision: "compass-theory-v1",
        completionState: "in_progress",
        visitedSectionIds: [],
      },
    }, 20);

    expect(await getQueuedProgress("compass-tabs")).toEqual([
      expect.objectContaining({
        completed: true,
        score: 100,
        pointsEarned: 10,
        answersHistory: completedEvidence,
        updatedAt: 20,
        revision: 2,
      }),
    ]);
  });

  it("replays queued progress and removes successful entries", async () => {
    await queueProgress({ userId: "replay-user", topicId: "ropework", completed: true, score: 80, pointsEarned: 10 });
    const rpc = vi.fn().mockResolvedValue({
      data: [{ points_awarded: true, completion_awarded: true, awarded_points: 10 }],
      error: null,
    });

    const result = await replayProgressQueue({ rpc } as never, "replay-user");

    expect(result).toEqual({ synced: 1, remaining: 0, quarantined: 0 });
    expect(rpc).toHaveBeenCalledWith("save_topic_progress", expect.objectContaining({ p_topic_id: "ropework" }));
    expect(await getQueuedProgress("replay-user")).toEqual([]);
  });

  it("quarantines a permanent failure without blocking a later valid entry", async () => {
    await queueProgress({ userId: "mixed-user", topicId: "forbidden", completed: true, score: 80, pointsEarned: 10 });
    await queueProgress({ userId: "mixed-user", topicId: "valid", completed: true, score: 90, pointsEarned: 10 });
    const rpc = vi.fn()
      .mockResolvedValueOnce({ data: null, error: { status: 403, message: "row-level security denied" } })
      .mockResolvedValueOnce({
        data: [{ points_awarded: true, completion_awarded: true, awarded_points: 10 }],
        error: null,
      });

    expect(await replayProgressQueue({ rpc } as never, "mixed-user"))
      .toEqual({ synced: 1, remaining: 1, quarantined: 1 });
    expect(await getQueuedProgress("mixed-user")).toEqual([
      expect.objectContaining({
        topicId: "forbidden",
        attempts: 1,
        status: "quarantined",
        lastError: "row-level security denied",
      }),
    ]);
  });

  it("quarantines a stale checklist replay instead of erasing newer server state", async () => {
    await queueProgress({
      userId: "stale-checklist-user", topicId: "victualling-checklist", completed: false,
      score: 6, pointsEarned: 0,
      answersHistory: { version: 1, checkedItemIds: ["f1"], revision: 2 },
    });
    const rpc = vi.fn().mockResolvedValue({
      data: null,
      error: { code: "40001", message: "Victualling checklist revision conflict" },
    });

    expect(await replayProgressQueue({ rpc } as never, "stale-checklist-user"))
      .toEqual({ synced: 0, remaining: 1, quarantined: 1 });
    expect(rpc).toHaveBeenCalledWith("save_victualling_checklist_progress", {
      p_expected_revision: 2,
      p_checked_item_ids: ["f1"],
    });
    expect(await getQueuedProgress("stale-checklist-user")).toEqual([
      expect.objectContaining({ status: "quarantined", lastError: "Victualling checklist revision conflict" }),
    ]);
  });

  it("classifies connectivity and server errors without treating authorization errors as retryable", () => {
    expect(isRetryableProgressError(new Error("offline"), false)).toBe(true);
    expect(isRetryableProgressError({ status: 408 }, true)).toBe(true);
    expect(isRetryableProgressError({ status: 429 }, true)).toBe(true);
    expect(isRetryableProgressError({ code: "ETIMEDOUT" }, true)).toBe(true);
    expect(isRetryableProgressError({ code: "40001", message: "serialization failure" }, true)).toBe(true);
    expect(isRetryableProgressError(new Error("Failed to fetch"), true)).toBe(true);
    expect(isRetryableProgressError({ status: 503, message: "unavailable" }, true)).toBe(true);
    expect(isRetryableProgressError({
      code: "PGRST002",
      message: "Could not query the database for the schema cache",
      details: "connection refused",
    }, true)).toBe(true);
    expect(isRetryableProgressError({ message: "502 Bad Gateway" }, true)).toBe(true);
    expect(isRetryableProgressError({ status: 401, message: "unauthorized" }, true)).toBe(false);
    expect(isRetryableProgressError({ code: "42501", message: "row-level security policy denied" }, true)).toBe(false);
    expect(isRetryableProgressError({ code: "23514", message: "check constraint violation" }, true)).toBe(false);
    expect(isRetryableProgressError("unknown", true)).toBe(false);
  });

  it("returns all owners when no owner filter is supplied", async () => {
    await queueProgress({ userId: "all-a", topicId: "a", completed: false, score: 0, pointsEarned: 0 });
    await queueProgress({ userId: "all-b", topicId: "b", completed: false, score: 0, pointsEarned: 0 });
    expect((await getQueuedProgress()).map(({ userId }) => userId)).toEqual(expect.arrayContaining(["all-a", "all-b"]));
  });

  it("hydrates legacy queue entries with safe retry defaults", async () => {
    const database = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open("day-skipper-offline", 1);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    const transaction = database.transaction("progress-queue", "readwrite");
    transaction.objectStore("progress-queue").put({
      id: "legacy-user:legacy", userId: "legacy-user", topicId: "legacy",
      completed: false, score: 0, pointsEarned: 0, updatedAt: 1,
    });
    await new Promise<void>((resolve) => { transaction.oncomplete = () => resolve(); });
    database.close();

    expect(await getQueuedProgress("legacy-user")).toEqual([
      expect.objectContaining({ revision: 0, attempts: 0, status: "pending" }),
    ]);
  });

  it("keeps transient replay failures pending for a later retry", async () => {
    await queueProgress({ userId: "retry-user", topicId: "charts", completed: true, score: 90, pointsEarned: 10 });
    const rpc = vi.fn().mockResolvedValue({ data: null, error: new Error("Failed to fetch") });

    expect(await replayProgressQueue({ rpc } as never, "retry-user"))
      .toEqual({ synced: 0, remaining: 1, quarantined: 0 });
    expect(await getQueuedProgress("retry-user")).toEqual([
      expect.objectContaining({ status: "pending", attempts: 1 }),
    ]);
  });

  it("does not delete a newer same-topic revision when an older replay succeeds", async () => {
    await queueProgress({ userId: "success-race", topicId: "charts", completed: false, score: 20, pointsEarned: 0 }, 100);
    const response = deferred<{ data: unknown; error: null }>();
    const rpc = vi.fn().mockReturnValue(response.promise);
    const replay = replayProgressQueue({ rpc } as never, "success-race");
    await vi.waitFor(() => expect(rpc).toHaveBeenCalledTimes(1));

    const newer = await queueProgress({
      userId: "success-race",
      topicId: "charts",
      completed: true,
      score: 95,
      pointsEarned: 10,
    }, 200);
    response.resolve({
      data: [{ points_awarded: false, completion_awarded: false, awarded_points: 0 }],
      error: null,
    });

    expect(await replay).toEqual({ synced: 1, remaining: 1, quarantined: 0 });
    expect(await getQueuedProgress("success-race")).toEqual([
      expect.objectContaining({ score: 95, revision: newer.revision, status: "pending", attempts: 0 }),
    ]);
  });

  it("does not overwrite or quarantine a newer revision when an older replay fails", async () => {
    await queueProgress({ userId: "failure-race", topicId: "ropework", completed: false, score: 10, pointsEarned: 0 }, 100);
    const response = deferred<{ data: null; error: { status: number; message: string } }>();
    const rpc = vi.fn().mockReturnValue(response.promise);
    const replay = replayProgressQueue({ rpc } as never, "failure-race");
    await vi.waitFor(() => expect(rpc).toHaveBeenCalledTimes(1));

    const newer = await queueProgress({
      userId: "failure-race",
      topicId: "ropework",
      completed: true,
      score: 88,
      pointsEarned: 10,
    }, 200);
    response.resolve({ data: null, error: { status: 403, message: "RLS denied" } });

    expect(await replay).toEqual({ synced: 0, remaining: 1, quarantined: 0 });
    expect(await getQueuedProgress("failure-race")).toEqual([
      expect.objectContaining({
        score: 88,
        revision: newer.revision,
        status: "pending",
        attempts: 0,
      }),
    ]);
    expect((await getQueuedProgress("failure-race"))[0]).not.toHaveProperty("lastError");
  });
});
