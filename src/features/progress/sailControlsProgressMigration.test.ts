import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const sql = readFileSync("supabase/migrations/20260819193000_sail_controls_progress.sql", "utf8").toLowerCase();

describe("Sail Controls progress migration", () => {
  it("loads only the authenticated owner's fixed topic row", () => {
    expect(sql).toContain("create or replace function public.load_sail_controls_progress()");
    expect(sql).toContain("up.user_id = auth.uid()");
    expect(sql).toContain("up.topic_id = 'nautical-terms-sail-controls'");
    expect(sql).not.toContain("p_user_id");
  });

  it("keeps both RPCs unavailable to public and anonymous roles", () => {
    expect(sql).toMatch(/revoke all on function public\.load_sail_controls_progress\(\) from public, anon/);
    expect(sql).toMatch(/revoke all on function public\.save_sail_controls_progress[^;]+from public, anon/);
    expect(sql.match(/to authenticated/g)).toHaveLength(2);
  });

  it("validates evidence, preserves completion, and awards no points", () => {
    expect(sql).toContain("p_answers_history ->> 'module' is distinct from 'sail-controls'");
    expect(sql).toContain("public.user_progress.completed or excluded.completed");
    expect(sql).toContain("return query select false, p_completed and not coalesce(was_completed, false), 0");
  });
});
