// @vitest-environment node
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const sql = readFileSync(
  resolve(process.cwd(), "supabase/migrations/20260729235500_atomic_save_topic_progress.sql"),
  "utf8",
).toLowerCase();

describe("atomic progress migration", () => {
  it("derives identity from auth.uid and accepts no user-id argument", () => {
    const signature = sql.slice(sql.indexOf("save_topic_progress("), sql.indexOf("returns table"));
    expect(signature).toContain("p_topic_id");
    expect(signature).not.toContain("p_user_id");
    expect(sql).toContain("auth.uid()");
    expect(sql).toContain("authentication required");
  });

  it("serializes first completion and awards from a unique append-only ledger", () => {
    expect(sql).toContain("pg_advisory_xact_lock");
    expect(sql).toContain("insert into public.user_progress");
    expect(sql).toContain("v_completion_awarded");
    expect(sql).toContain("insert into public.progress_awards");
    expect(sql).toContain("on conflict (user_id, topic_id, reward_kind) do nothing");
    expect(sql).toContain("primary key (user_id, topic_id, reward_kind)");
    expect(sql).toContain("update public.profiles");
  });

  it("uses fixed server-owned rewards and rejects arbitrary topics and point values", () => {
    expect(sql).toContain("rewards are server-owned");
    expect(sql).toContain("when 'weather-systems' then 10");
    expect(sql).toContain("when 'weather-beaufort' then 10");
    expect(sql).toContain("when 'weather-forecasts' then 10");
    expect(sql).toContain("when 'weather-fog' then 10");
    expect(sql).toContain("unknown progress topic");
    expect(sql).toContain("invalid point value");
    expect(sql).not.toContain("set points = coalesce(points, 0) + coalesce(p_points");
  });

  it("keeps award history outside resettable progress with no delete grant or policy", () => {
    expect(sql).toContain("revoke all on public.progress_awards");
    expect(sql).toContain("grant select on public.progress_awards");
    expect(sql).not.toContain("for delete");
    expect(sql).not.toContain("delete from public.progress_awards");
    expect(sql).toContain("on conflict (user_id, topic_id, reward_kind) do nothing");
  });

  it("backfills immutable markers for completed rows before defining the RPC", () => {
    const backfill = sql.indexOf("select up.user_id, up.topic_id, 'completion', 0");
    const functionDefinition = sql.indexOf("create or replace function public.save_topic_progress");
    expect(backfill).toBeGreaterThan(0);
    expect(backfill).toBeLessThan(functionDefinition);
    expect(sql).toContain("from public.user_progress up");
    expect(sql).toContain("where up.completed is true");
    expect(sql).toContain("on conflict (user_id, topic_id, reward_kind) do nothing");
  });

  it("validates score and history before accepting meteorology completion", () => {
    expect(sql).toContain("score must be between 0 and 100");
    expect(sql).toContain("jsonb_typeof(p_answers_history) <> 'object'");
    expect(sql).toContain("pg_column_size(p_answers_history) > 65536");
    expect(sql).toContain("p_topic_id like 'weather-%'");
    expect(sql).toContain("p_answers_history ->> 'completionstate' <> 'completed'");
    expect(sql).toContain("completed progress requires verified completion history");
  });

  it("restricts execution to authenticated users", () => {
    expect(sql).toContain("security definer");
    expect(sql).toContain("revoke all");
    expect(sql).toContain("from anon");
    expect(sql).toContain("to authenticated");
    expect(sql).toContain("increment_user_points(uuid, integer) from authenticated");
  });
});
