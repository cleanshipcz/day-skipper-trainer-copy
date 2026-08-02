import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const sql = readFileSync("supabase/migrations/20260802170000_engine_checklist_catalogue_v2.sql", "utf8");

describe("Engine checklist catalogue v2 migration", () => {
  it("invalidates v1 ticks without resetting the CAS revision", () => {
    expect(sql).toContain("'checkedItemIds', '[]'::jsonb");
    expect(sql).toContain("coalesce((answers_history->>'revision')::bigint, 0)");
    expect(sql).toContain("answers_history->>'catalogueId' = 'engine-maintenance-v1'");
  });
  it("retires the version-blind RPC and rejects stale clients", () => {
    expect(sql).toContain("drop function public.save_engine_checklist_progress(bigint, text[])");
    expect(sql).toContain("p_catalogue_id is distinct from 'engine-maintenance-v2'");
    expect(sql).toContain("p_version is distinct from 2");
  });
  it("keeps server IDs stable but makes corrected questions due again", () => {
    expect(sql).toContain("update public.question_reviews");
    expect(sql).toContain("'e1','e2','e3','e4','e5','e6','e7','e8','e9','e10','e11','e12'");
    expect(sql).toContain("repetitions = 0");
    expect(sql).toContain("next_review_at = now()");
  });
});
