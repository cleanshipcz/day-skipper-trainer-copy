import { beforeEach, describe, expect, it, vi } from "vitest";
import "fake-indexeddb/auto";
import { getQueuedProgress, queueProgress, replayProgressQueue } from "./progressQueue";

describe("offline progress queue", () => {
  beforeEach(async () => {
    const entries = await getQueuedProgress();
    await Promise.all(entries.map((entry) =>
      queueProgress({ ...entry, userId: `discarded-${entry.userId}` }, entry.updatedAt)));
  });

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

    expect(result).toEqual({ synced: 1, remaining: 0 });
    expect(rpc).toHaveBeenCalledWith("save_topic_progress", expect.objectContaining({ p_topic_id: "ropework" }));
    expect(await getQueuedProgress("replay-user")).toEqual([]);
  });
});
