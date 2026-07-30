import { readFileSync } from "node:fs";
import { describe, expect, test } from "vitest";

const sql = readFileSync("supabase/migrations/20260730110000_engagement.sql", "utf8");

describe("engagement migration", () => {
  test("should keep badges immutable and mutation RPC-only", () => {
    expect(sql).toContain("create table public.user_badges");
    expect(sql).toContain("for select to authenticated");
    expect(sql).not.toMatch(/policy[^;]+for (insert|update|delete|all)/i);
    expect(sql).toContain("revoke insert, update, delete on public.user_badges from authenticated");
  });

  test("should use authenticated server-owned activity dates and idempotent awards", () => {
    expect(sql).toContain("timezone('Europe/Prague', now())::date");
    expect(sql).toContain("primary key (user_id, activity_date)");
    expect(sql).toContain("security definer set search_path = public, pg_temp");
    expect(sql).toContain("auth.uid()");
    expect(sql).toContain("on conflict");
    expect(sql).toContain("grant execute on function public.record_learning_activity(text) to authenticated");
  });
});
