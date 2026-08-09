import { describe, expect, it } from "vitest";
import type { Database } from "@/integrations/supabase/types";

type EngineChecklistArgs = Database["public"]["Functions"]["save_engine_checklist_progress"]["Args"];

describe("Engine checklist generated RPC contract", () => {
  it("requires the version-aware catalogue arguments", () => {
    const args: EngineChecklistArgs = {
      p_catalogue_id: "engine-maintenance-v2",
      p_checked_item_ids: ["oil"],
      p_expected_revision: 4,
      p_version: 2,
    };
    expect(Object.keys(args).sort()).toEqual([
      "p_catalogue_id", "p_checked_item_ids", "p_expected_revision", "p_version",
    ]);
  });
});
