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

  it("serializes first completion and updates progress and points in one transaction", () => {
    expect(sql).toContain("pg_advisory_xact_lock");
    expect(sql).toContain("insert into public.user_progress");
    expect(sql).toContain("update public.profiles");
    expect(sql).toContain("v_completion_awarded");
    expect(sql).toContain("insert into public.progress_awards");
    expect(sql).toContain("on conflict (user_id, topic_id) do nothing");
    expect(sql).toContain("primary key (user_id, topic_id)");
  });

  it("does not trust caller-controlled reward identity or amount", () => {
    expect(sql).toContain("p_points remains");
    expect(sql).toContain("case p_topic_id");
    expect(sql).toContain("unknown progress topic");
    expect(sql).toContain("v_awarded_points := v_reward");
    expect(sql).not.toContain("points = coalesce(points, 0) + p_points");
  });

  it("keeps award history outside resettable progress with no delete grant or policy", () => {
    expect(sql).toContain("revoke all on public.progress_awards");
    expect(sql).toContain("grant select on public.progress_awards");
    expect(sql).not.toContain("for delete");
    expect(sql).not.toContain("delete from public.progress_awards");
  });

  it("restricts execution to authenticated users", () => {
    expect(sql).toContain("security definer");
    expect(sql).toContain("revoke all");
    expect(sql).toContain("from anon");
    expect(sql).toContain("to authenticated");
    expect(sql).toContain("increment_user_points(uuid, integer) from authenticated");
  });
});
