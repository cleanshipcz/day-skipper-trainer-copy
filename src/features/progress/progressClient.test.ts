import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  clientModuleEvaluated: false,
  supabase: { marker: "configured-client" },
}));

vi.mock("@/integrations/supabase/client", () => {
  mocks.clientModuleEvaluated = true;
  return { supabase: mocks.supabase };
});

import { loadProgressClient } from "./progressClient";

describe("progress client lazy boundary", () => {
  it("does not initialize the configured Supabase client when the loader module is imported", () => {
    expect(mocks.clientModuleEvaluated).toBe(false);
  });

  it("loads and returns the configured singleton only when requested", async () => {
    await expect(loadProgressClient()).resolves.toBe(mocks.supabase);
    expect(mocks.clientModuleEvaluated).toBe(true);
    await expect(loadProgressClient()).resolves.toBe(mocks.supabase);
  });
});
