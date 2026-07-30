// @vitest-environment node
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it, vi } from "vitest";
import { saveProgressRecord } from "./progressPersistence";

const buildSupabaseMock = () => {
  const upsert = vi.fn().mockResolvedValue({ error: null });
  const maybeSingle = vi.fn().mockResolvedValue({ data: null, error: null });
  const selectEqTopic = vi.fn(() => ({ maybeSingle }));
  const selectEqUser = vi.fn(() => ({ eq: selectEqTopic }));
  const select = vi.fn(() => ({ eq: selectEqUser }));
  const rpc = vi.fn().mockResolvedValue({
    data: [{ points_awarded: true, completion_awarded: true, awarded_points: 10 }],
    error: null,
  });
  const from = vi.fn((table: string) => {
    if (table === "user_progress") return { upsert, select };
    return {};
  });

  return { client: { from, rpc }, upsert, rpc };
};

describe("progress integrity proof path", () => {
  it("records concurrent completions through authenticated atomic RPC calls", async () => {
    const { client, rpc } = buildSupabaseMock();

    await Promise.all([
      saveProgressRecord({
        supabaseClient: client as never,
        userId: "user-1",
        topicId: "quiz-colregs",
        completed: true,
        pointsEarned: 10,
      }),
      saveProgressRecord({
        supabaseClient: client as never,
        userId: "user-1",
        topicId: "quiz-lights",
        completed: true,
        pointsEarned: 15,
      }),
    ]);

    expect(rpc).toHaveBeenCalledTimes(2);
    expect(rpc).toHaveBeenNthCalledWith(1, "save_topic_progress", {
      p_topic_id: "quiz-colregs",
      p_completed: true,
      p_score: 0,
      p_points: 10,
      p_answers_history: null,
    });
    expect(rpc).toHaveBeenNthCalledWith(2, "save_topic_progress", {
      p_topic_id: "quiz-lights",
      p_completed: true,
      p_score: 0,
      p_points: 15,
      p_answers_history: null,
    });
  });

  it("migration atomically awards only server-catalogued completion points", () => {
    const migrationPath = resolve(process.cwd(), "supabase/migrations/20260729235500_atomic_save_topic_progress.sql");
    const migration = readFileSync(migrationPath, "utf8");

    expect(migration).toContain("pg_advisory_xact_lock");
    expect(migration).toContain("update public.profiles");
    expect(migration).toContain("application-owned catalogue");
    expect(migration).toContain("p_points remains in the");
    expect(migration).not.toMatch(/v_award_points\s*:=\s*p_points/);
    expect(migration).toContain("on conflict (user_id, topic_id) do nothing");
    expect(migration).not.toContain("progress_engagements");
    expect(migration).not.toContain("Verified completion evidence required");
    expect(migration).toContain("save_topic_progress");
  });

  it("documents that client-declared completion produces non-authoritative gamification", () => {
    const trustModel = readFileSync(resolve(process.cwd(), "docs/POINTS_TRUST_MODEL.md"), "utf8");

    expect(trustModel).toContain("authenticated user's declaration");
    expect(trustModel).toContain("must never grant authorization");
    expect(trustModel).toContain("carry monetary value");
    expect(trustModel).toContain("caps each reward at one award");
  });
});
