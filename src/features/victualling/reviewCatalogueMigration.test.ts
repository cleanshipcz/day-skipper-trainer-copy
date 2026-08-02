import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import questions from "@/data/quizzes/victualling";

const initial = readFileSync(resolve(process.cwd(), "supabase/migrations/20260730100000_question_reviews.sql"), "utf8");
const correction = readFileSync(resolve(process.cwd(), "supabase/migrations/20260802143000_withdraw_unsafe_victualling_reviews.sql"), "utf8");

describe("deployed Victualling review catalogue", () => {
  it("matches every current quiz ID and retires only replaced unsafe identities", () => {
    expect(initial).toContain("('v', 12)");
    for (const id of ["v13", "v14", "v15", "v16", "v17", "v18"]) {
      expect(correction).toContain(`('${id}', true)`);
    }
    expect(correction).toContain("set active = false");
    expect(correction).toContain("question_id in ('v6', 'v12')");
    expect(questions.map(({ id }) => id).sort()).toEqual([
      "v1", "v2", "v3", "v4", "v5", "v7", "v8", "v9", "v10", "v11",
      "v13", "v14", "v15", "v16", "v17", "v18",
    ].sort());
  });

  it("enforces active state in both public security-definer RPCs", () => {
    expect(correction.match(/catalog\.active/g)).toHaveLength(2);
    expect(correction.match(/Unknown or retired question id/g)).toHaveLength(2);
    expect(correction).toMatch(/revoke all on function public\.seed_active_question_reviews_internal[^;]+from public, anon, authenticated/);
    expect(correction).toMatch(/revoke all on function public\.record_active_question_review_internal[^;]+from public, anon, authenticated/);
  });
});
