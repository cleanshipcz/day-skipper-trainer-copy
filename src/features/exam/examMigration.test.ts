import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const sql = readFileSync(resolve(process.cwd(), "supabase/migrations/20260730090000_exam_results.sql"), "utf8");

describe("exam result migration", () => {
  it("isolates rows by authenticated user and prevents direct writes", () => {
    expect(sql).toContain("alter table public.exam_results enable row level security");
    expect(sql).toMatch(/for all to authenticated using \(auth\.uid\(\) = user_id\) with check \(auth\.uid\(\) = user_id\)/);
    expect(sql).toContain("revoke insert, update, delete on public.exam_results from authenticated");
  });

  it("uses an idempotent, authenticated server-owned submission function", () => {
    expect(sql).toContain("security definer set search_path = public, pg_temp");
    expect(sql).toContain("unique (user_id, attempt_id)");
    expect(sql).toContain("auth.uid() is null");
    expect(sql).toContain("on conflict (user_id, attempt_id)");
    expect(sql).toContain("grant execute on function public.submit_exam_result");
  });
});
