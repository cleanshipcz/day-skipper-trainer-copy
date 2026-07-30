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

  it("serializes first completion and updates progress without trusting it for rewards", () => {
    expect(sql).toContain("pg_advisory_xact_lock");
    expect(sql).toContain("insert into public.user_progress");
    expect(sql).toContain("v_completion_awarded");
    expect(sql).toContain("insert into public.progress_awards");
    expect(sql).toContain("on conflict (user_id, topic_id) do nothing");
    expect(sql).toContain("primary key (user_id, topic_id)");
    expect(sql).not.toContain("update public.profiles");
  });

  it("never converts caller-controlled completion, score, or points into profile points", () => {
    expect(sql).toContain("self-reported learning progress");
    expect(sql).toContain("must never turn those claims");
    expect(sql).toContain("unknown progress topic");
    expect(sql).toContain("return query select");
    expect(sql).toContain("false,");
    expect(sql).not.toContain("coalesce(points, 0) +");
  });

  it("validates mutable progress and preserves completed evidence", () => {
    expect(sql).toContain("score must be between 0 and 100");
    expect(sql).toContain("jsonb_typeof(p_answers_history) <> 'object'");
    expect(sql).toContain("pg_column_size(p_answers_history) > 65536");
    expect(sql).toContain("case when public.user_progress.completed");
    expect(sql).toContain("then public.user_progress.answers_history");
  });

  it("keeps award history outside resettable progress with no delete grant or policy", () => {
    expect(sql).toContain("revoke all on public.progress_awards");
    expect(sql).toContain("grant select on public.progress_awards");
    expect(sql).not.toContain("for delete");
    expect(sql).not.toContain("delete from public.progress_awards");
  });

  it("backfills immutable markers for completed rows before defining the RPC", () => {
    const backfill = sql.indexOf("select up.user_id, up.topic_id, 0");
    const functionDefinition = sql.indexOf("create or replace function public.save_topic_progress");
    expect(backfill).toBeGreaterThan(0);
    expect(backfill).toBeLessThan(functionDefinition);
    expect(sql).toContain("from public.user_progress up");
    expect(sql).toContain("where up.completed is true");
    expect(sql).toContain("on conflict (user_id, topic_id) do nothing");
  });

  it("restricts execution to authenticated users", () => {
    expect(sql).toContain("security definer");
    expect(sql).toContain("revoke all");
    expect(sql).toContain("from anon");
    expect(sql).toContain("to authenticated");
    expect(sql).toContain("increment_user_points(uuid, integer) from authenticated");
  });
});
