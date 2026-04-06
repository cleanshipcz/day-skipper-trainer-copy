/**
 * Tests for the gas safety data file.
 *
 * @see docs/FEATURE_TASKS.md — Story E1-S5, AC-1
 */
import { describe, expect, it } from "vitest";

describe("gasSafety data", () => {
  it("should export a non-empty readonly array of GasSafetyTopic objects", async () => {
    // given
    const mod = await import("./gasSafety");

    // when
    const { gasSafetyTopics } = mod;

    // then
    expect(Array.isArray(gasSafetyTopics)).toBe(true);
    expect(gasSafetyTopics.length).toBeGreaterThan(0);
  });

  it("should cover all required theory areas per AC-1", async () => {
    // given
    const { gasSafetyTopics } = await import("./gasSafety");

    // when
    const ids = gasSafetyTopics.map((t: { id: string }) => t.id);

    // then
    // - LPG properties (heavier than air)
    expect(ids).toContain("lpg-properties");
    // - isolation valves
    expect(ids).toContain("isolation-valves");
    // - bilge sniff test
    expect(ids).toContain("bilge-sniff-test");
    // - gas locker requirements
    expect(ids).toContain("gas-locker-requirements");
    // - carbon monoxide awareness
    expect(ids).toContain("carbon-monoxide");
    // - detector placement
    expect(ids).toContain("detector-placement");
  });

  it("should have valid GasSafetyTopic shape for every topic", async () => {
    // given
    const { gasSafetyTopics } = await import("./gasSafety");

    // then
    for (const topic of gasSafetyTopics) {
      expect(typeof topic.id).toBe("string");
      expect(topic.id.length).toBeGreaterThan(0);

      expect(typeof topic.title).toBe("string");
      expect(topic.title.length).toBeGreaterThan(0);

      expect(typeof topic.content).toBe("string");
      expect(topic.content.length).toBeGreaterThan(0);

      expect(Array.isArray(topic.keyPoints)).toBe(true);
      expect(topic.keyPoints.length).toBeGreaterThan(0);

      for (const point of topic.keyPoints) {
        expect(typeof point).toBe("string");
        expect(point.length).toBeGreaterThan(0);
      }
    }
  });

  it("should have unique topic IDs", async () => {
    // given
    const { gasSafetyTopics } = await import("./gasSafety");

    // when
    const ids = gasSafetyTopics.map((t: { id: string }) => t.id);
    const uniqueIds = new Set(ids);

    // then
    expect(uniqueIds.size).toBe(ids.length);
  });

  it("should mention LPG being heavier than air in the lpg-properties topic", async () => {
    // given
    const { gasSafetyTopics } = await import("./gasSafety");

    // when
    const lpgTopic = gasSafetyTopics.find(
      (t: { id: string }) => t.id === "lpg-properties",
    );

    // then
    expect(lpgTopic).toBeDefined();
    expect(lpgTopic.content.toLowerCase()).toContain("heavier than air");
  });

  it("should mention carbon monoxide as odourless and colourless", async () => {
    // given
    const { gasSafetyTopics } = await import("./gasSafety");

    // when
    const coTopic = gasSafetyTopics.find(
      (t: { id: string }) => t.id === "carbon-monoxide",
    );

    // then
    expect(coTopic).toBeDefined();
    const contentLower = coTopic.content.toLowerCase();
    expect(contentLower).toContain("odourless");
    expect(contentLower).toContain("colourless");
  });

  it("should have exactly 6 topics covering all required areas", async () => {
    // given
    const { gasSafetyTopics } = await import("./gasSafety");

    // then
    expect(gasSafetyTopics.length).toBe(6);
  });
});
