// @vitest-environment node
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const hardenedSql = readFileSync(resolve(process.cwd(), "supabase/migrations/20260803050000_harden_revisioned_lights_theory_progress.sql"), "utf8").toLowerCase();

describe("revisioned Lights theory progress migration", () => {
  it("refreshes evidence on an old completed row without awarding again", () => {
    expect(hardenedSql).toContain("if v_was_completed then");
    expect(hardenedSql).toContain("points_awarded := false");
    expect(hardenedSql).toContain("return next");
    expect(hardenedSql).not.toContain("return query");
    expect(hardenedSql).toContain("insert into public.progress_awards");
    expect(hardenedSql).not.toContain("from public.save_topic_progress('lights-theory'");
  });

  it("validates the exact revision and evidence catalogue", () => {
    expect(hardenedSql).toContain("colregs-parts-c-d-annex-iv-v1");
    expect(hardenedSql).toContain("part-c-recognition");
    expect(hardenedSql).toContain("part-d-recognition");
    expect(hardenedSql).toContain("distress-recognition");
    expect(hardenedSql).toContain("v_evidence_count = 3");
  });

  it("derives ownership from auth and limits execution to authenticated users", () => {
    expect(hardenedSql).toContain("auth.uid()");
    expect(hardenedSql).not.toContain("p_user_id");
    expect(hardenedSql).toContain("security definer");
    expect(hardenedSql).toContain("from public, anon");
    expect(hardenedSql).toContain("to authenticated");
    expect(hardenedSql).toContain("where up.user_id = v_user_id");
  });

  it("serializes against generic same-topic saves", () => {
    expect(hardenedSql).toContain("pg_advisory_xact_lock");
    expect(hardenedSql).toContain("v_user_id::text || ':lights-theory'");
  });

  it("removes Lights completion and rewards from the generic authenticated RPC", () => {
    expect(hardenedSql).toContain("remove lights-theory from generic progress rpc");
    expect(hardenedSql).toContain("position($$'lights-theory'$$ in v_updated) > 0");
    expect(hardenedSql).toContain("grant execute on function public.save_topic_progress");
  });

  it("rejects NULL fields and derives the only valid score from evidence", () => {
    expect(hardenedSql).toContain("p_completed is null or p_score is null or p_answers_history is null");
    expect(hardenedSql).toContain("is distinct from 'colregs-parts-c-d-annex-iv-v1'");
    expect(hardenedSql).toContain("round(count(*) * 100.0 / 3)::integer");
    expect(hardenedSql).toContain("count(distinct evidence_id)::integer");
    expect(hardenedSql).toContain("p_score is distinct from v_expected_score");
    expect(hardenedSql).toContain("p_completed is distinct from (v_evidence_count = 3)");
  });

  it("preserves full completed evidence against delayed incomplete replay", () => {
    expect(hardenedSql).toContain("v_existing_history ->> 'cataloguerevision' is distinct from 'colregs-parts-c-d-annex-iv-v1'");
    expect(hardenedSql).toContain("v_existing_history ->> 'completionstate' is distinct from 'completed'");
    expect(hardenedSql).toContain("then p_answers_history else answers_history end");
    expect(hardenedSql).toContain("delayed incomplete queue entry");
  });
});
