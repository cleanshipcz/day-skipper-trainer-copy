import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const sql = readFileSync("supabase/migrations/20260802193000_register_rig_review_progress.sql", "utf8");
describe("Rig review server registration", () => {
  it("registers a distinct zero-reward topic without rewriting legacy rig rows", () => {
    expect(sql).toContain("'rig-review'");
    expect(sql).not.toMatch(/update public\.user_progress|delete from public\.user_progress/i);
    expect(sql).not.toMatch(/when ''rig-review'' then/);
  });
});
