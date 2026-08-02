import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { checklistData } from "@/data/victuallingItems";

const sql = readFileSync(resolve(process.cwd(), "supabase/migrations/20260802093000_victualling_checklist_progress.sql"), "utf8").toLowerCase();

describe("Victualling checklist persistence migration", () => {
  it("uses a separate non-rewarding record and compare-and-swap revision", () => {
    expect(sql).toContain("'victualling-checklist'");
    expect(sql).toContain("current_revision <> p_expected_revision");
    expect(sql).toContain("errcode = '40001'");
    expect(sql).toContain("completed = false");
    expect(sql).toContain("last_accessed = excluded.last_accessed");
    expect(sql).toContain("pg_advisory_xact_lock");
  });

  it("only writes columns present in the real progress schema", () => {
    const insert = /insert into public\.user_progress\(([^)]+)\)/.exec(sql)?.[1]
      .split(",").map((column) => column.trim());
    expect(insert).toEqual(["user_id", "topic_id", "completed", "score", "last_accessed", "answers_history"]);
    expect(sql).not.toMatch(/\b(?:points_earned|completed_at|updated_at)\b/);
  });

  it("server-validates the exact catalogue and bounds the payload", () => {
    const serverIds = [...sql.matchAll(/'(?:f|s|g|p)\d+'/g)].map(([id]) => id.slice(1, -1));
    expect(new Set(serverIds)).toEqual(new Set(checklistData.map(({ id }) => id)));
    expect(sql).toContain("cardinality(p_checked_item_ids) > 18");
    expect(sql).toContain("octet_length(id) > 16");
    expect(sql).toContain("id <> all");
  });
});
