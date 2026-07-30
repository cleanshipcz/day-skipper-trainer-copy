import { beforeEach, describe, expect, test, vi } from "vitest";
import { retryEngagementOutbox, syncEngagementEvent } from "./engagementService";

describe("engagement evidence outbox", () => {
  beforeEach(() => localStorage.clear());

  test("should retain stable owner-scoped evidence offline and replay it after restart", async () => {
    const offline = { rpc: vi.fn().mockResolvedValue({ data: null, error: new Error("offline") }) };
    await expect(syncEngagementEvent(offline, "owner-a", { sourceType: "quiz", sourceId: "attempt-1" })).rejects.toThrow();
    expect(localStorage.getItem("engagement-outbox:owner-a")).toContain("attempt-1");
    expect(localStorage.getItem("engagement-outbox:owner-b")).toBeNull();

    const online = { rpc: vi.fn().mockResolvedValue({ data: {
      current_streak: 1, bonus_points: 0, unlocked_badge_ids: ["first-quiz"],
    }, error: null }) };
    const results = await retryEngagementOutbox(online, "owner-a");

    expect(online.rpc).toHaveBeenCalledWith("sync_engagement_event", {
      p_source_type: "quiz", p_source_id: "attempt-1",
    });
    expect(results[0].unlockedBadges[0].id).toBe("first-quiz");
    expect(localStorage.getItem("engagement-outbox:owner-a")).toBeNull();
  });

  test("should deduplicate repeated retries of the same evidence", async () => {
    const offline = { rpc: vi.fn().mockResolvedValue({ data: null, error: new Error("offline") }) };
    await expect(syncEngagementEvent(offline, "owner-a", { sourceType: "review", sourceId: "receipt-1" })).rejects.toThrow();
    await expect(syncEngagementEvent(offline, "owner-a", { sourceType: "review", sourceId: "receipt-1" })).rejects.toThrow();
    expect(JSON.parse(localStorage.getItem("engagement-outbox:owner-a") ?? "{}").items).toHaveLength(1);
  });

  test("recovers malformed storage, ignores unknown badges, and rejects empty outcomes", async () => {
    localStorage.setItem("engagement-outbox:owner-a", "{bad");
    const online = { rpc: vi.fn().mockResolvedValue({ data: {
      current_streak: 2, bonus_points: 3, unlocked_badge_ids: ["unknown"],
    }, error: null }) };
    await expect(syncEngagementEvent(
      online, "owner-a", { sourceType: "progress", sourceId: "topic" },
    )).resolves.toEqual({ streak: 2, bonusPoints: 3, unlockedBadges: [] });

    await expect(syncEngagementEvent(
      { rpc: vi.fn().mockResolvedValue({ data: null, error: null }) },
      "owner-a", { sourceType: "progress", sourceId: "missing" },
    )).rejects.toThrow("Engagement evidence returned no outcome");
  });

  test("should preserve a later failed item when an earlier deferred sync succeeds", async () => {
    let releaseFirst!: () => void;
    const client = { rpc: vi.fn()
      .mockReturnValueOnce(new Promise((resolve) => { releaseFirst = () => resolve({
        data: { current_streak: 1, bonus_points: 0, unlocked_badge_ids: [] }, error: null,
      }); }))
      .mockResolvedValueOnce({ data: null, error: new Error("offline") }) };
    const first = syncEngagementEvent(client, "owner-a", { sourceType: "quiz", sourceId: "a" });
    const second = syncEngagementEvent(client, "owner-a", { sourceType: "review", sourceId: "b" });
    releaseFirst();
    await first;
    await expect(second).rejects.toThrow("offline");

    expect(localStorage.getItem("engagement-outbox:owner-a")).not.toContain('"a"');
    expect(localStorage.getItem("engagement-outbox:owner-a")).toContain('"b"');
    const restarted = { rpc: vi.fn().mockResolvedValue({
      data: { current_streak: 1, bonus_points: 0, unlocked_badge_ids: [] }, error: null,
    }) };
    await retryEngagementOutbox(restarted, "owner-a");
    expect(localStorage.getItem("engagement-outbox:owner-a")).toBeNull();
  });
});
