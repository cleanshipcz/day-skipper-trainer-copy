import { describe, expect, it, vi } from "vitest";
import "fake-indexeddb/auto";
import { getQueuedProgress, isRetryableProgressError, queueProgress, replayProgressQueue } from "./progressQueue";

const deferred = <T,>() => {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => { resolve = done; });
  return { promise, resolve };
};

describe("offline progress queue", () => {
  it("keeps the newest update for a user and topic", async () => {
    await queueProgress({ userId: "queue-user", topicId: "charts", completed: false, score: 20, pointsEarned: 0 }, 10);
    await queueProgress({ userId: "queue-user", topicId: "charts", completed: true, score: 90, pointsEarned: 10 }, 20);

    expect(await getQueuedProgress("queue-user")).toEqual([
      expect.objectContaining({ completed: true, score: 90, updatedAt: 20 }),
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

  it("classifies connectivity and server errors without treating authorization errors as retryable", () => {
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
