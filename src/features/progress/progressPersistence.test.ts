import { describe, expect, it, vi } from "vitest";
import { saveProgressRecord } from "./progressPersistence";

const buildSupabaseMock = () => {
  const upsert = vi.fn().mockResolvedValue({ error: null });
  const eq = vi.fn().mockResolvedValue({ error: null });
  const update = vi.fn(() => ({ eq }));
  const select = vi.fn(() => ({ eq: vi.fn(() => ({ single: vi.fn() })) }));
  const rpc = vi.fn().mockResolvedValue({ error: null });
  const from = vi.fn((table: string) => {
    if (table === "user_progress") return { upsert };
    if (table === "profiles") return { select, update };
    return {};
  });

  return { client: { from, rpc }, upsert, rpc, select, update };
};

describe("saveProgressRecord", () => {
  it("uses server-side rpc increment for points", async () => {
    const { client, rpc, select, update } = buildSupabaseMock();

    await saveProgressRecord({
      supabaseClient: client as never,
      userId: "user-1",
      topicId: "quiz-colregs",
      completed: true,
      score: 80,
      pointsEarned: 40,
      answersHistory: { answers: [1, 2] },
    });

    expect(rpc).toHaveBeenCalledWith("increment_user_points", {
      p_user_id: "user-1",
      p_increment: 40,
    });
    expect(select).not.toHaveBeenCalled();
    expect(update).not.toHaveBeenCalled();
  });

  it("throws when upsert fails", async () => {
    const { client, upsert } = buildSupabaseMock();
    upsert.mockResolvedValueOnce({ error: new Error("upsert failed") });

    await expect(
      saveProgressRecord({
        supabaseClient: client as never,
        userId: "user-1",
        topicId: "quiz-colregs",
      })
    ).rejects.toThrow("upsert failed");
  });

  it("throws when points rpc fails", async () => {
    const { client, rpc } = buildSupabaseMock();
    rpc.mockResolvedValueOnce({ error: new Error("rpc failed") });

    await expect(
      saveProgressRecord({
        supabaseClient: client as never,
        userId: "user-1",
        topicId: "quiz-colregs",
        pointsEarned: 20,
      })
    ).rejects.toThrow("rpc failed");
  });
});
