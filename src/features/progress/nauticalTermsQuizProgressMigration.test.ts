import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const sql = readFileSync(
  "supabase/migrations/20260819170500_nautical_terms_quiz_progress.sql",
  "utf8",
).toLowerCase();

describe("nautical terms quiz progress migration", () => {
  it("exposes an authenticated, owner-bound dedicated RPC", () => {
    expect(sql).toContain("create or replace function public.save_nautical_terms_quiz_progress");
    expect(sql).toContain("owner uuid := auth.uid()");
    expect(sql).toContain("owner, 'quiz-nautical-terms-quiz'");
    expect(sql).toContain("revoke all on function public.save_nautical_terms_quiz_progress");
    expect(sql).toContain("from public, anon");
    expect(sql).toContain("to authenticated");
    expect(sql).not.toMatch(/p_user_id|grant execute[^;]+\bto\s+(?:public|anon)\b/);
  });

  it("keeps completion immutable and awards no browser-supplied points", () => {
    expect(sql).toContain("public.user_progress.completed or excluded.completed");
    expect(sql).toContain("then public.user_progress.score else excluded.score end");
    expect(sql).toContain("return query select false, p_completed and not coalesce(was_completed, false), 0");
  });
});
