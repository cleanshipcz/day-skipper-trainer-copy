import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import questions from "@/data/quizzes/safetyMob";

const migration = readFileSync(resolve(
  process.cwd(),
  "supabase/migrations/20260811223000_retire_legacy_mob_reviews.sql",
), "utf8");
const activeGate = readFileSync(resolve(
  process.cwd(),
  "supabase/migrations/20260802143000_withdraw_unsafe_victualling_reviews.sql",
), "utf8");

describe("deployed MOB review catalogue", () => {
  it("activates every v2 question accepted by the guarded seed RPC", () => {
    for (const { id } of questions) expect(migration).toContain(`('${id}', true)`);
    expect(activeGate).toMatch(/seed_question_reviews[\s\S]+catalog\.active/);
    expect(activeGate).toContain("Unknown or retired question id");
  });

  it("retires legacy schedules and completion without deleting immutable receipts", () => {
    expect(migration.match(/\^mob\(\[1-9\]\|1\[0-2\]\)\$/g)).toHaveLength(2);
    expect(migration).toContain("delete from public.question_reviews");
    expect(migration).not.toContain("delete from public.question_review_receipts");
    expect(migration).toContain("'quiz-safety-mob-quiz', 'safety-mob-quiz'");
    expect(migration).toMatch(/set completed = false,\s+score = 0,\s+answers_history = null/);
  });
});
