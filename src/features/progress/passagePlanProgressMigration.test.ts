import {readFileSync} from "node:fs";
import {describe,expect,it} from "vitest";

const sql=readFileSync("supabase/migrations/20260811153000_revisioned_passage_plan_progress.sql","utf8");

describe("revisioned passage plan persistence migration",()=>{
  it("serializes owner-scoped writes and rejects divergent heads",()=>{expect(sql).toContain("auth.uid()");expect(sql).toContain("pg_advisory_xact_lock");expect(sql).toContain("v_incoming -> 'lineage' ? (v_existing ->> 'updatedAt')");expect(sql).toContain("errcode='40001'");expect(sql).toContain("Passage plan revision conflict")});
  it("allows material drafts to stale completion and replace remote history",()=>{expect(sql).toContain("completed=excluded.completed");expect(sql).toContain("answers_history=excluded.answers_history");expect(sql).not.toContain("completed or excluded.completed");expect(sql).not.toContain("then public.user_progress.answers_history")});
  it("limits execution to authenticated callers and validates owner binding",()=>{expect(sql).toContain("v_incoming ->> 'ownerId' <> v_user_id::text");expect(sql).toContain("revoke all on function public.save_passage_plan_progress(boolean,integer,jsonb) from public,anon");expect(sql).toContain("grant execute on function public.save_passage_plan_progress(boolean,integer,jsonb) to authenticated")});
  it("awards the fixed catalogue value once without trusting client points",()=>{expect(sql).toContain("insert into public.progress_awards(user_id,topic_id,points)");expect(sql).toContain("values(v_user_id,v_topic_id,15)");expect(sql).toContain("on conflict(user_id,topic_id) do nothing");expect(sql).toContain("set points=coalesce(points,0)+15");expect(sql).toContain("case when coalesce(v_points_awarded,false) then 15 else 0 end");expect(sql).not.toContain("p_points")});
});
