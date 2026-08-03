import { describe, expect, it, vi } from "vitest";
import { deleteProgressRecord, saveProgressRecord } from "./progressPersistence";

const buildSupabaseMock = () => {
  const upsert = vi.fn().mockResolvedValue({ error: null });
  const maybeSingle = vi.fn().mockResolvedValue({ data: null, error: null });
  const selectEqTopic = vi.fn(() => ({ maybeSingle }));
  const selectEqUser = vi.fn(() => ({ eq: selectEqTopic }));
  const select = vi.fn(() => ({ eq: selectEqUser }));

  const deleteEqTopic = vi.fn().mockResolvedValue({ error: null });
  const deleteEqUser = vi.fn(() => ({ eq: deleteEqTopic }));
  const deleteRow = vi.fn(() => ({ eq: deleteEqUser }));

  const rpc = vi.fn().mockResolvedValue({
    data: [{ points_awarded: true, completion_awarded: true, awarded_points: 40 }],
    error: null,
  });
  const from = vi.fn((table: string) => {
    if (table === "user_progress") return { upsert, delete: deleteRow, select };
    return {};
  });

  return {
    client: { from, rpc },
    upsert,
    rpc,
    select,
    selectEqUser,
    selectEqTopic,
    maybeSingle,
    deleteRow,
    deleteEqUser,
    deleteEqTopic,
  };
};

describe("saveProgressRecord", () => {
  it("routes Anchorwork snapshots through the server-validated monotonic RPC", async () => {
    const { client, rpc } = buildSupabaseMock();
    await saveProgressRecord({
      supabaseClient: client as never,
      userId: "user-1",
      topicId: "anchorwork",
      completed: true,
      score: 100,
      pointsEarned: 999,
      answersHistory: { version: 1, completedTopicIds: ["types", "scope"] },
    });
    expect(rpc).toHaveBeenCalledWith("save_anchorwork_progress", {
      p_completed_topic_ids: ["types", "scope"],
    });
  });

  it("rejects malformed Anchorwork snapshots before persistence", async () => {
    const { client, rpc } = buildSupabaseMock();
    await expect(saveProgressRecord({
      supabaseClient: client as never,
      userId: "user-1",
      topicId: "anchorwork",
      completed: true,
      answersHistory: { completedTopicIds: ["types", 1] },
    })).rejects.toThrow("canonical completed topic IDs");
    expect(rpc).not.toHaveBeenCalled();
  });

  it("uses one authenticated atomic RPC without sending a user ID", async () => {
    const { client, rpc } = buildSupabaseMock();

    const result = await saveProgressRecord({
      supabaseClient: client as never,
      userId: "user-1",
      topicId: "quiz-colregs",
      completed: true,
      score: 80,
      pointsEarned: 40,
      answersHistory: { answers: [1, 2] },
    });

    expect(result).toEqual({ pointsAwarded: true, completionAwarded: true, awardedPoints: 40 });
    expect(rpc).toHaveBeenCalledWith("save_topic_progress", {
      p_topic_id: "quiz-colregs",
      p_completed: true,
      p_score: 80,
      p_points: 40,
      p_answers_history: { answers: [1, 2] },
    });
    expect(rpc.mock.calls[0][1]).not.toHaveProperty("p_user_id");
  });

  it("honours the server's existing-progress idempotency outcome", async () => {
    const { client, rpc } = buildSupabaseMock();
    rpc.mockResolvedValueOnce({
      data: [{ points_awarded: false, completion_awarded: false, awarded_points: 0 }],
      error: null,
    });

    const result = await saveProgressRecord({
      supabaseClient: client as never,
      userId: "user-1",
      topicId: "quiz-colregs",
      completed: true,
      score: 100,
      pointsEarned: 10,
    });

    expect(result).toEqual({ pointsAwarded: false, completionAwarded: false, awardedPoints: 0 });
    expect(rpc).toHaveBeenCalledOnce();
  });

  it("allows a retry after an RPC failure without recording client-side partial state", async () => {
    const { client, rpc, upsert } = buildSupabaseMock();
    rpc
      .mockResolvedValueOnce({ data: null, error: new Error("transaction rolled back") })
      .mockResolvedValueOnce({
        data: [{ points_awarded: true, completion_awarded: true, awarded_points: 20 }],
        error: null,
      });

    await expect(
      saveProgressRecord({
        supabaseClient: client as never,
        userId: "user-1",
        topicId: "quiz-colregs",
        completed: true,
        pointsEarned: 20,
      })
    ).rejects.toThrow("transaction rolled back");
    const retried = await saveProgressRecord({
      supabaseClient: client as never,
      userId: "user-1",
      topicId: "quiz-colregs",
      completed: true,
      pointsEarned: 20,
    });
    expect(retried).toEqual({ pointsAwarded: true, completionAwarded: true, awardedPoints: 20 });
    expect(upsert).not.toHaveBeenCalled();
  });

  it("surfaces an RPC failure and never falls back to a non-atomic write", async () => {
    const { client, rpc } = buildSupabaseMock();
    rpc.mockResolvedValueOnce({ data: null, error: new Error("rpc failed") });

    await expect(
      saveProgressRecord({
        supabaseClient: client as never,
        userId: "user-1",
        topicId: "quiz-colregs",
        pointsEarned: 20,
      })
    ).rejects.toThrow("rpc failed");
  });

  it("maps two concurrent server outcomes to exactly one award", async () => {
    const { client, rpc } = buildSupabaseMock();
    rpc
      .mockResolvedValueOnce({
        data: [{ points_awarded: true, completion_awarded: true, awarded_points: 10 }],
        error: null,
      })
      .mockResolvedValueOnce({
        data: [{ points_awarded: false, completion_awarded: false, awarded_points: 0 }],
        error: null,
      });
    const args = {
      supabaseClient: client as never,
      userId: "user-1",
      topicId: "weather-systems",
      completed: true,
      pointsEarned: 10,
    };
    const results = await Promise.all([saveProgressRecord(args), saveProgressRecord(args)]);
    expect(results.filter(({ pointsAwarded }) => pointsAwarded)).toHaveLength(1);
    expect(rpc).toHaveBeenCalledTimes(2);
  });

  it("rejects a missing RPC outcome instead of guessing award state", async () => {
    const { client, rpc } = buildSupabaseMock();
    rpc.mockResolvedValueOnce({ data: [], error: null });
    await expect(saveProgressRecord({
      supabaseClient: client as never,
      userId: "user-1",
      topicId: "weather-systems",
    })).rejects.toThrow("no outcome");
  });

  it.each([
    [{ points_awarded: "true", completion_awarded: true, awarded_points: 10 }],
    [{ points_awarded: true, completion_awarded: null, awarded_points: 10 }],
    [{ points_awarded: true, completion_awarded: true, awarded_points: "10" }],
    [{ points_awarded: true, completion_awarded: true, awarded_points: Number.NaN }],
  ])("rejects malformed RPC outcome %j instead of coercing it", async (outcome) => {
    const { client, rpc } = buildSupabaseMock();
    rpc.mockResolvedValueOnce({ data: outcome, error: null });

    await expect(saveProgressRecord({
      supabaseClient: client as never,
      userId: "user-1",
      topicId: "weather-systems",
    })).rejects.toThrow("invalid outcome");
  });
});

describe("deleteProgressRecord", () => {
  it("deletes a user topic record", async () => {
    const { client, deleteRow, deleteEqUser, deleteEqTopic } = buildSupabaseMock();

    await deleteProgressRecord({
      supabaseClient: client as never,
      userId: "user-1",
      topicId: "quiz-colregs",
    });

    expect(deleteRow).toHaveBeenCalled();
    expect(deleteEqUser).toHaveBeenCalledWith("user_id", "user-1");
    expect(deleteEqTopic).toHaveBeenCalledWith("topic_id", "quiz-colregs");
  });

  it("throws when delete query fails", async () => {
    const { client, deleteEqTopic } = buildSupabaseMock();
    deleteEqTopic.mockResolvedValueOnce({ error: new Error("delete failed") });

    await expect(
      deleteProgressRecord({
        supabaseClient: client as never,
        userId: "user-1",
        topicId: "quiz-colregs",
      })
    ).rejects.toThrow("delete failed");
  });
});
