import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";

const sql = readFileSync(resolve(process.cwd(), "supabase/migrations/20260730100000_question_reviews.sql"), "utf8");

describe("question review migration", () => {
  test("should enforce authenticated ownership and useful due indexes", () => {
    expect(sql).toContain("alter table public.question_reviews enable row level security");
    expect(sql).toMatch(/for all to authenticated using \(auth\.uid\(\) = user_id\) with check \(auth\.uid\(\) = user_id\)/);
    expect(sql).toContain("unique (user_id, question_id)");
    expect(sql).toContain("(user_id, next_review_at)");
  });

  test("should expose authenticated, validated and concurrency-safe review RPCs", () => {
    expect(sql).toContain("security definer set search_path = public, pg_temp");
    expect(sql).toContain("auth.uid() is null");
    expect(sql).toContain("pg_advisory_xact_lock");
    expect(sql).toContain("p_review_id");
    expect(sql).toContain("last_review_id");
    expect(sql).toContain("quality must be an integer between 0 and 5");
    expect(sql).toContain("on conflict (user_id, question_id)");
  });
});

