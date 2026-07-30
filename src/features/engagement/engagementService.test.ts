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
    expect(JSON.parse(localStorage.getItem("engagement-outbox:owner-a") ?? "[]")).toHaveLength(1);
  });
});
