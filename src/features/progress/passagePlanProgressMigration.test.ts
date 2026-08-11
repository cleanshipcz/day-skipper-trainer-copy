import {readFileSync} from "node:fs";
import {describe,expect,it} from "vitest";

const sql=readFileSync("supabase/migrations/20260811153000_revisioned_passage_plan_progress.sql","utf8");

describe("revisioned passage plan persistence migration",()=>{
  it("serializes owner-scoped writes and rejects divergent heads",()=>{expect(sql).toContain("auth.uid()");expect(sql).toContain("pg_advisory_xact_lock");expect(sql).toContain("v_incoming -> 'lineage' ? (v_existing ->> 'updatedAt')");expect(sql).toContain("errcode='40001'");expect(sql).toContain("Passage plan revision conflict")});
  it("allows material drafts to stale completion and replace remote history",()=>{expect(sql).toContain("completed=excluded.completed");expect(sql).toContain("answers_history=excluded.answers_history");expect(sql).not.toContain("completed or excluded.completed");expect(sql).not.toContain("then public.user_progress.answers_history")});
  it("limits execution to authenticated callers and validates owner binding",()=>{expect(sql).toContain("v_incoming ->> 'ownerId' <> v_user_id::text");expect(sql).toContain("revoke all on function public.save_passage_plan_progress(boolean,integer,jsonb) from public,anon");expect(sql).toContain("grant execute on function public.save_passage_plan_progress(boolean,integer,jsonb) to authenticated")});
});
