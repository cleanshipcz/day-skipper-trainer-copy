import { readFileSync } from "node:fs";
import { describe, expect, test } from "vitest";
import { badgeCatalogue } from "@/data/badges";
import { loadAllQuizTopics } from "@/data/quizzes";

const sql = readFileSync("supabase/migrations/20260730110000_engagement.sql", "utf8");
const hardened = readFileSync("supabase/migrations/20260730111000_harden_engagement_evidence.sql", "utf8");
const issued = readFileSync("supabase/migrations/20260730112000_issued_quiz_attempts.sql", "utf8");
const currentAttemptCatalogue = readFileSync(
  "supabase/migrations/20260812090000_align_fire_quiz_attempts.sql",
  "utf8",
);

describe("engagement migration", () => {
  test("should keep badges immutable and mutation RPC-only", () => {
    expect(sql).toContain("create table public.user_badges");
    expect(sql).toContain("for select to authenticated");
    expect(sql).not.toMatch(/policy[^;]+for (insert|update|delete|all)/i);
    expect(sql).toContain("revoke insert, update, delete on public.user_badges from authenticated");
  });

  test("should issue bounded server attempts and reward reviews only at receipt creation time", () => {
    expect(issued).toContain("create table public.quiz_attempts");
    expect(issued).toContain("default gen_random_uuid()");
    expect(issued).toContain("Issued quiz attempt not found");
    expect(issued).toContain("Attempt topic or total mismatch");
    expect(issued).toContain("Quiz submitted implausibly quickly");
    expect(issued).toContain("Quiz attempt expired");
    expect(issued).toContain("Quiz attempt retention limit reached");
    expect(issued).toContain("when 'safety' then 24");
    expect(issued).toContain("completed_at<statement_timestamp()-interval '31 days'");
    expect(issued).toContain("where user_id=owner and completed_at is null");
    expect(issued.indexOf("select * into existing from public.quiz_scores"))
      .toBeLessThan(issued.indexOf("select * into issued from public.quiz_attempts"));
    expect(issued).toContain("new.created_at");
    expect(issued).not.toContain("timezone('Europe/Prague',new.reviewed_at)");
  });

  test("should keep the issued-attempt catalogue aligned with client quiz totals", async () => {
    const clientCatalogue = Object.fromEntries(
      Object.entries(await loadAllQuizTopics()).map(([topic, questions]) => [topic, questions.length]),
    );
    const caseEntries = [...currentAttemptCatalogue.matchAll(/when '([^']+)' then (\d+)/g)]
      .map(([, topic, count]) => [topic, Number(count)] as const);

    expect(caseEntries).toHaveLength(Object.keys(clientCatalogue).length);
    expect(new Set(caseEntries.map(([topic]) => topic)).size).toBe(caseEntries.length);
    expect(Object.fromEntries(caseEntries)).toEqual(clientCatalogue);
    expect(currentAttemptCatalogue).toContain("and expected_total=expected");
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
