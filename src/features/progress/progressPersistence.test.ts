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

  const rpc = vi.fn().mockResolvedValue({ error: null });
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
  it("uses server-side rpc increment for first completion points", async () => {
    const { client, rpc, selectEqUser, selectEqTopic, maybeSingle } = buildSupabaseMock();

    await saveProgressRecord({
      supabaseClient: client as never,
      userId: "user-1",
      topicId: "quiz-colregs",
      completed: true,
      score: 80,
      pointsEarned: 40,
      answersHistory: { answers: [1, 2] },
    });

    expect(selectEqUser).toHaveBeenCalledWith("user_id", "user-1");
    expect(selectEqTopic).toHaveBeenCalledWith("topic_id", "quiz-colregs");
    expect(maybeSingle).toHaveBeenCalled();
    expect(rpc).toHaveBeenCalledWith("increment_user_points", {
      p_user_id: "user-1",
      p_increment: 40,
    });
  });

  it("does not re-award points when topic is already completed", async () => {
    const { client, rpc, maybeSingle } = buildSupabaseMock();
    maybeSingle.mockResolvedValueOnce({ data: { completed: true }, error: null });

    await saveProgressRecord({
      supabaseClient: client as never,
      userId: "user-1",
      topicId: "quiz-colregs",
      completed: true,
      score: 100,
      pointsEarned: 10,
    });

    expect(rpc).not.toHaveBeenCalled();
  });

  it("throws when existing-progress lookup fails", async () => {
    const { client, maybeSingle } = buildSupabaseMock();
    maybeSingle.mockResolvedValueOnce({ data: null, error: new Error("lookup failed") });

    await expect(
      saveProgressRecord({
        supabaseClient: client as never,
        userId: "user-1",
        topicId: "quiz-colregs",
        completed: true,
        pointsEarned: 20,
      })
    ).rejects.toThrow("lookup failed");
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
