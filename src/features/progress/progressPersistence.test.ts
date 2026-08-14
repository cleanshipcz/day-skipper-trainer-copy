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
  it("routes readiness corrections through the revocable evidence RPC",async()=>{
    const {client,rpc}=buildSupabaseMock();
    const answersHistory={readinessRecord:{version:2,sessionId:"session-1",catalogueFingerprint:"fnv1a-current",context:{vessel:"Aster",voyage:"Cowes",conditions:"F4"},entries:{},createdAt:"2026-08-11T15:00:00Z",updatedAt:"2026-08-11T16:00:00Z",expiresAt:"2026-09-10T16:00:00Z"}};
    await saveProgressRecord({supabaseClient:client as never,userId:"user-1",topicId:"passage-planning-checklist",completed:false,answersHistory});
    expect(rpc).toHaveBeenCalledWith("save_readiness_record_progress_v2",{p_completed:false,p_answers_history:answersHistory});
    expect(rpc).not.toHaveBeenCalledWith("save_topic_progress",expect.anything());
  });
  it("sends v2 completed readiness evidence intact through the specialized RPC",async()=>{
    const {client,rpc}=buildSupabaseMock();
    const record={version:2,sessionId:"session-2",catalogueFingerprint:"fnv1a-current",context:{vessel:"Aster",voyage:"Cowes",conditions:"F4"},entries:{"passage-plan":{status:"satisfactory"}},createdAt:"2026-08-11T15:00:00Z",updatedAt:"2026-08-11T16:00:00Z",expiresAt:"2026-09-10T16:00:00Z",completedAt:"2026-08-11T16:00:00Z"};
    await saveProgressRecord({supabaseClient:client as never,userId:"user-1",topicId:"passage-planning-checklist",completed:true,answersHistory:{readinessRecord:record}});
    expect(rpc).toHaveBeenCalledWith("save_readiness_record_progress_v2",{p_completed:true,p_answers_history:{readinessRecord:record}});
  });
  it("routes owner-bound passage plans through the CAS RPC",async()=>{const{client,rpc}=buildSupabaseMock();const record={ownerId:"user-1",revision:2,updatedAt:"2026-08-11T12:00:00Z",lineage:["2026-08-11T11:00:00Z"],plan:{name:"edited"}};await saveProgressRecord({supabaseClient:client as never,userId:"user-1",topicId:"passage-planning-builder",completed:false,score:0,answersHistory:{expectedServerHead:"2026-08-11T11:00:00Z",passagePlanRecord:record}});expect(rpc).toHaveBeenCalledWith("save_passage_plan_progress",{p_completed:false,p_score:0,p_expected_updated_at:"2026-08-11T11:00:00Z",p_answers_history:{expectedServerHead:"2026-08-11T11:00:00Z",passagePlanRecord:record}});expect(rpc).not.toHaveBeenCalledWith("save_topic_progress",expect.anything())});
  it("rejects passage plan owner substitution before database access",async()=>{const{client,rpc}=buildSupabaseMock();await expect(saveProgressRecord({supabaseClient:client as never,userId:"user-1",topicId:"passage-planning-builder",answersHistory:{expectedServerHead:null,passagePlanRecord:{ownerId:"user-2",revision:1,updatedAt:"2026-08-11T12:00:00Z",lineage:[],plan:{}}}})).rejects.toThrow("owner-bound");expect(rpc).not.toHaveBeenCalled()});
  it("routes revisioned Lights evidence through its completed-row refresh RPC", async () => {
    const { client, rpc } = buildSupabaseMock();
    const evidence = { catalogueRevision: "colregs-parts-c-d-annex-iv-v1", completionState: "in_progress", visitedSectionIds: ["part-c-recognition"] };
    await saveProgressRecord({ supabaseClient: client as never, userId: "user-1", topicId: "lights-theory", score: 33, answersHistory: evidence });
    expect(rpc).toHaveBeenCalledWith("save_lights_theory_progress", { p_completed: false, p_score: 33, p_answers_history: evidence });
    expect(rpc).not.toHaveBeenCalledWith("save_topic_progress", expect.anything());
  });

  it("rejects forged or inconsistent Lights revision evidence before persistence", async () => {
    const { client, rpc } = buildSupabaseMock();
    await expect(saveProgressRecord({
      supabaseClient: client as never, userId: "user-1", topicId: "lights-theory", completed: true, score: 100,
      answersHistory: { catalogueRevision: "old", completionState: "completed", visitedSectionIds: ["unknown"] },
    })).rejects.toThrow("valid revisioned evidence");
    expect(rpc).not.toHaveBeenCalled();
  });

  it("rejects Lights score/evidence mismatches before the specialized RPC", async () => {
    const { client, rpc } = buildSupabaseMock();
    await expect(saveProgressRecord({
      supabaseClient: client as never, userId: "user-1", topicId: "lights-theory", score: 99,
      answersHistory: { catalogueRevision: "colregs-parts-c-d-annex-iv-v1", completionState: "in_progress", visitedSectionIds: ["part-c-recognition"] },
    })).rejects.toThrow("valid revisioned evidence");
    expect(rpc).not.toHaveBeenCalled();
  });
  it("routes zero-reward Engine catalogue snapshots to the checklist RPC", async () => {
    const { client, rpc } = buildSupabaseMock();
    await saveProgressRecord({ supabaseClient: client as never, userId: "user-1", topicId: "engine-checklist",
      answersHistory: { version: 2, catalogueId: "engine-maintenance-v2", checkedItemIds: ["oil"], revision: 2 } });
    expect(rpc).toHaveBeenCalledWith("save_engine_checklist_progress", { p_catalogue_id: "engine-maintenance-v2", p_version: 2, p_expected_revision: 2, p_checked_item_ids: ["oil"] });
  });

  it("rejects Engine checklist completion, rewards, and stale catalogue identities", async () => {
    const { client, rpc } = buildSupabaseMock();
    await expect(saveProgressRecord({ supabaseClient: client as never, userId: "user-1", topicId: "engine-checklist",
      completed: true, pointsEarned: 10, answersHistory: { version: 1, catalogueId: "old", checkedItemIds: [], revision: 0 } })).rejects.toThrow("valid revisioned catalogue snapshot");
    expect(rpc).not.toHaveBeenCalled();
  });
  it("routes checklist snapshots away from completed legacy victualling rows", async () => {
    const { client, rpc } = buildSupabaseMock();
    await saveProgressRecord({
      supabaseClient: client as never,
      userId: "user-1",
      topicId: "victualling-checklist",
      completed: false,
      score: 50,
      pointsEarned: 0,
      answersHistory: { version: 1, checkedItemIds: ["f1"], revision: 4 },
    });
    expect(rpc).toHaveBeenCalledWith("save_victualling_checklist_progress", {
      p_expected_revision: 4,
      p_checked_item_ids: ["f1"],
    });
    expect(rpc).not.toHaveBeenCalledWith("save_topic_progress", expect.anything());
  });

  it("rejects unrevisioned or reward-bearing checklist writes", async () => {
    const { client, rpc } = buildSupabaseMock();
    await expect(saveProgressRecord({
      supabaseClient: client as never, userId: "user-1", topicId: "victualling-checklist",
      completed: true, pointsEarned: 5, answersHistory: { version: 1, checkedItemIds: ["f1"] },
    })).rejects.toThrow("valid revisioned snapshot");
    expect(rpc).not.toHaveBeenCalled();
  });

  it("rejects oversized and malformed checklist payloads before the RPC", async () => {
    const { client, rpc } = buildSupabaseMock();
    for (const checkedItemIds of [Array.from({ length: 19 }, (_, index) => `x${index}`), ["f1", 2]]) {
      await expect(saveProgressRecord({
        supabaseClient: client as never, userId: "user-1", topicId: "victualling-checklist",
        completed: false, pointsEarned: 0,
        answersHistory: { version: 1, checkedItemIds, revision: 0 },
      })).rejects.toThrow("valid revisioned snapshot");
    }
    expect(rpc).not.toHaveBeenCalled();
  });

  it("routes completed practice updates through the zero-reward mutable RPC", async () => {
    const { client, rpc } = buildSupabaseMock();
    const snapshot = { version: 1, completedFamilies: ["sheltered", "harbour", "exposed", "tidal"], attempts: 8, failedChecks: 3, scenarioSeed: 1, sequenceIndex: 5, scenarioIdentity: "anchor-1-2-2-harbour" };
    await saveProgressRecord({ supabaseClient: client as never, userId: "user-1", topicId: "anchorwork-practice", completed: true, score: 100, pointsEarned: 999, answersHistory: snapshot });
    expect(rpc).toHaveBeenCalledWith("save_anchorwork_practice_progress", {
      p_completed: true, p_score: 100, p_answers_history: snapshot,
    });
  });
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
