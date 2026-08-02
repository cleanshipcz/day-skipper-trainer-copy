import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const sql = readFileSync(resolve(process.cwd(), "supabase/migrations/20260802093000_victualling_checklist_progress.sql"), "utf8").toLowerCase();

describe("Victualling checklist persistence migration", () => {
  it("uses a separate non-rewarding record and compare-and-swap revision", () => {
    expect(sql).toContain("'victualling-checklist'");
    expect(sql).toContain("current_revision <> p_expected_revision");
    expect(sql).toContain("errcode = '40001'");
    expect(sql).toContain("completed = false");
    expect(sql).toContain("points_earned = 0");
    expect(sql).toContain("pg_advisory_xact_lock");
  });
});
