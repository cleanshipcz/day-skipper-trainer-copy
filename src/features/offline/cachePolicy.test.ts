import { describe, expect, it } from "vitest";
import { shouldCacheStudyContent } from "./cachePolicy";

describe("offline study content cache policy", () => {
  it("caches navigations, lazy theory/quiz chunks and static content", () => {
    expect(shouldCacheStudyContent({ destination: "document" }, new URL("https://app.test/navigation/charts"))).toBe(true);
    expect(shouldCacheStudyContent({ destination: "script" }, new URL("https://app.test/assets/Quiz.js"))).toBe(true);
    expect(shouldCacheStudyContent({ destination: "" }, new URL("https://app.test/images/chart.png"))).toBe(true);
  });

  it("does not cache API calls containing private progress", () => {
    expect(shouldCacheStudyContent({ destination: "" }, new URL("https://project.supabase.co/rest/v1/user_progress"))).toBe(false);
  });
});
