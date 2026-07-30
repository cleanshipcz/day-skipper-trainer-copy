// @vitest-environment node
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
const sql=readFileSync(resolve(process.cwd(),"supabase/migrations/20260730073000_passage_planning_progress_catalogue.sql"),"utf8").toLowerCase();
describe("passage planning reward catalogue migration",()=>{
 it.each(["passage-planning-prepare","passage-planning-calculator","passage-planning-builder","passage-planning-checklist","quiz-passage-planning"])("allows %s",(id)=>expect(sql).toContain(`'${id}'`));
 it("assigns fixed server-owned rewards",()=>{expect(sql).toContain("when ''passage-planning-prepare'' then 10");expect(sql).toContain("when ''passage-planning-builder'' then 15");expect(sql).not.toContain("p_points then")});
 it("preserves authenticated-only execution",()=>{expect(sql).toContain("from anon");expect(sql).toContain("to authenticated")});
});
