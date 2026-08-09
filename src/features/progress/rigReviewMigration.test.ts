import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const sql = readFileSync("supabase/migrations/20260802193000_register_rig_review_progress.sql", "utf8");
const installedSource = readFileSync("supabase/migrations/20260729235500_atomic_save_topic_progress.sql", "utf8");
describe("Rig review server registration", () => {
  it("registers a distinct zero-reward topic without rewriting legacy rig rows", () => {
    expect(sql).toContain("'rig-review'");
    expect(sql).not.toMatch(/update public\.user_progress|delete from public\.user_progress/i);
    expect(sql).not.toMatch(/when ''rig-review'' then/);
  });

  it("transforms the real function catalogue without depending on whitespace", () => {
    const marker = "'quiz-rig'";
    expect(installedSource.split(marker)).toHaveLength(2);
    const transformed = installedSource.replace(marker, "'rig-review', 'quiz-rig'");
    expect(transformed).toContain("'rig-review', 'quiz-rig'");
    expect(sql).toContain("length(v_definition) - length(replace(v_definition, '''quiz-rig''', ''))");
    expect(sql).not.toContain("'''quiz-engine'', ''quiz-rig'''");
  });
});
