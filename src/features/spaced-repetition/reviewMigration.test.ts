import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";

const sql = readFileSync(resolve(process.cwd(), "supabase/migrations/20260730100000_question_reviews.sql"), "utf8");

describe("question review migration", () => {
  test("should expose only authenticated owner reads and useful due indexes", () => {
    expect(sql).toContain("alter table public.question_reviews enable row level security");
    expect(sql).toMatch(/for select to authenticated using \(auth\.uid\(\) = user_id\)/);
    expect(sql).toContain("revoke insert, update, delete on public.question_reviews from authenticated");
    expect(sql).toContain("unique (user_id, question_id)");
    expect(sql).toContain("(user_id, next_review_at)");
  });

  test("should expose authenticated, validated and concurrency-safe review RPCs", () => {
    expect(sql).toContain("security definer set search_path = public, pg_temp");
    expect(sql).toContain("auth.uid() is null");
    expect(sql).toContain("pg_advisory_xact_lock");
    expect(sql).toContain("p_review_id");
    expect(sql).toContain("primary key (user_id, review_id)");
    expect(sql).toContain("Review id already used with different payload");
    expect(sql).toContain("jsonb_populate_record");
    expect(sql).toContain("quality must be an integer between 0 and 5");
    expect(sql).toContain("on conflict (user_id, question_id)");
    expect(sql).toContain("least(36500");
  });

  test("should reject unknown server-side ids and cap review rows to the canonical catalogue", () => {
    expect(sql).toContain("create table public.review_question_catalog");
    expect(sql).toContain("references public.review_question_catalog(question_id)");
    expect(sql).toContain("raise exception 'Unknown question id'");
    expect(sql).toContain("where (select count(*) from public.question_reviews where user_id = current_user_id) < 204");
    expect(sql).toContain("revoke all on public.review_question_catalog from anon, authenticated");
  });

  test("should retain immutable receipts so delayed retries cannot reapply after later reviews", () => {
    expect(sql).toContain("create table public.question_review_receipts");
    expect(sql).toContain("Receipts are intentionally retained");
    expect(sql).toContain("':receipt-capacity'");
    expect(sql).toContain(">= 100000");
    expect(sql).toContain("pg_advisory_xact_lock");
    expect(sql).toContain("to_jsonb(current_review)");
    expect(sql.indexOf("select * into prior_receipt")).toBeLessThan(
      sql.indexOf("':question:' || p_question_id"),
    );
  });
});
