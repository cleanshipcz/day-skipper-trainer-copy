import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const sql = readFileSync("supabase/migrations/20260811190000_versioned_readiness_retention.sql", "utf8");

describe("readiness record persistence migration", () => {
  it("accepts and commits only the versioned v2 session contract", () => {
    expect(sql).toContain("v_record->>'version' is distinct from '2'");
    expect(sql).toContain("array['version','sessionId','catalogueFingerprint','context','entries','createdAt','updatedAt','expiresAt']");
    expect(sql).toContain("update public.user_progress set answers_history=jsonb_set");
    expect(sql).toContain("revoke execute on function public.save_readiness_record_progress(boolean,jsonb) from authenticated");
  });

  it("server-authors 30-day retention and redacts expired private evidence", () => {
    expect(sql).toContain("create function public.expire_readiness_record_progress()");
    expect(sql).toContain("answers_history = null");
    expect(sql).toContain("now() + interval '30 days'");
    expect(sql).toContain("grant execute on function public.expire_readiness_record_progress() to authenticated");
  });
});
