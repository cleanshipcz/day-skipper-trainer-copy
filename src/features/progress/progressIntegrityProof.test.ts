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
  const rpc = vi.fn().mockResolvedValue({ error: null });
  const from = vi.fn((table: string) => {
    if (table === "user_progress") return { upsert, select };
    return {};
  });

  return { client: { from, rpc }, upsert, rpc };
};

describe("progress integrity proof path", () => {
  it("records each concurrent completion as independent rpc increments", async () => {
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
    expect(rpc).toHaveBeenNthCalledWith(1, "increment_user_points", {
      p_user_id: "user-1",
      p_increment: 10,
    });
    expect(rpc).toHaveBeenNthCalledWith(2, "increment_user_points", {
      p_user_id: "user-1",
      p_increment: 15,
    });
  });

  it("migration uses atomic points increment semantics", () => {
    const migrationPath = resolve(process.cwd(), "supabase/migrations/20260209105000_increment_user_points_rpc.sql");
    const migration = readFileSync(migrationPath, "utf8");

    expect(migration).toContain("set points = coalesce(points, 0) + coalesce(p_increment, 0)");
    expect(migration).toContain("increment_user_points");
  });
});
