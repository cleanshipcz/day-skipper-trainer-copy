import { readFileSync } from "node:fs";
import { describe, expect, test } from "vitest";
import { badgeCatalogue } from "@/data/badges";

const sql = readFileSync("supabase/migrations/20260730110000_engagement.sql", "utf8");
const hardened = readFileSync("supabase/migrations/20260730111000_harden_engagement_evidence.sql", "utf8");

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
    expect(hardened).toContain("grant execute on function public.sync_engagement_event(text,text) to authenticated");
  });

  test("should accept only immutable evidence produced by authoritative persistence", () => {
    expect(hardened).toContain("primary key (user_id, source_type, source_id)");
    expect(hardened).toContain("revoke all on function public.record_learning_activity(text)");
    expect(hardened).toContain("create trigger user_progress_engagement");
    expect(hardened).toContain("create trigger review_receipt_engagement");
    expect(hardened).toContain("create or replace function public.submit_quiz_score");
    expect(hardened).toContain("revoke insert,update,delete on public.quiz_scores");
  });

  test("should use canonical persisted quiz progress keys for every root predicate", () => {
    [
      "quiz-nautical-terms-quiz", "quiz-ropework", "quiz-anchorwork", "quiz-victualling",
      "quiz-engine", "quiz-rig", "quiz-colregs", "quiz-pilotage", "quiz-weather",
      "quiz-passage-planning",
    ].forEach((key) => expect(hardened).toContain(`'${key}'`));
    badgeCatalogue.forEach(({ id, unlockCondition }) => {
      expect(`${sql}\n${hardened}`).toContain(`'${id}'`);
      expect(unlockCondition).not.toBe("");
    });
  });
});
