// @vitest-environment node
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const sql = readFileSync(resolve(process.cwd(), "supabase/migrations/20260803043000_revisioned_lights_theory_progress.sql"), "utf8").toLowerCase();

describe("revisioned Lights theory progress migration", () => {
  it("refreshes evidence on an old completed row without awarding again", () => {
    expect(sql).toContain("if v_was_completed then");
    expect(sql).toContain("answers_history = p_answers_history");
    expect(sql).toContain("return query select false, false, 0");
    expect(sql).toContain("save_topic_progress('lights-theory'");
  });

  it("validates the exact revision and evidence catalogue", () => {
    expect(sql).toContain("colregs-parts-c-d-annex-iv-v1");
    expect(sql).toContain("part-c-recognition");
    expect(sql).toContain("part-d-recognition");
    expect(sql).toContain("distress-recognition");
    expect(sql).toContain("count(distinct evidence.id) = 3");
  });

  it("derives ownership from auth and limits execution to authenticated users", () => {
    expect(sql).toContain("auth.uid()");
    expect(sql).not.toContain("p_user_id");
    expect(sql).toContain("security definer");
    expect(sql).toContain("from public, anon");
    expect(sql).toContain("to authenticated");
    expect(sql).toContain("where up.user_id = v_user_id");
  });

  it("serializes against generic same-topic saves", () => {
    expect(sql).toContain("pg_advisory_xact_lock");
    expect(sql).toContain("v_user_id::text || ':lights-theory'");
  });
});
