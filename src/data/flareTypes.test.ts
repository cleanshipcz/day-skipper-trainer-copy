/**
 * Tests for the flare types data file.
 *
 * @see docs/FEATURE_TASKS.md — Story E1-S3, AC-2
 */
import { describe, expect, it } from "vitest";

describe("flareTypes data", () => {
  it("should export a non-empty readonly array of FlareType objects", async () => {
    // given
    const mod = await import("./flareTypes");

    // when
    const { flareTypes } = mod;

    // then
    expect(Array.isArray(flareTypes)).toBe(true);
    expect(flareTypes.length).toBeGreaterThan(0);
  });

  it("should define all 5 required flare types per AC-1", async () => {
    // given
    const { flareTypes } = await import("./flareTypes");

    // when
    const ids = flareTypes.map((f: { id: string }) => f.id);

    // then
    expect(ids).toContain("red-parachute-rocket");
    expect(ids).toContain("red-hand-flare");
    expect(ids).toContain("orange-smoke-hand");
    expect(ids).toContain("orange-smoke-buoyant");
    expect(ids).toContain("white-hand-flare");
    expect(flareTypes.length).toBe(5);
  });

  it("should have valid FlareType shape for every flare", async () => {
    // given
    const { flareTypes } = await import("./flareTypes");

    // then
    for (const flare of flareTypes) {
      expect(typeof flare.id).toBe("string");
      expect(flare.id.length).toBeGreaterThan(0);

      expect(typeof flare.name).toBe("string");
      expect(flare.name.length).toBeGreaterThan(0);

      expect(typeof flare.description).toBe("string");
      expect(flare.description.length).toBeGreaterThan(0);

      expect(typeof flare.range).toBe("string");
      expect(flare.range.length).toBeGreaterThan(0);

      expect(typeof flare.burnTime).toBe("string");
      expect(flare.burnTime.length).toBeGreaterThan(0);

      expect(typeof flare.daySuitability).toBe("boolean");
      expect(typeof flare.nightSuitability).toBe("boolean");

      expect(typeof flare.expiryRules).toBe("string");
      expect(flare.expiryRules.length).toBeGreaterThan(0);

      expect(typeof flare.usage).toBe("string");
      expect(flare.usage.length).toBeGreaterThan(0);
    }
  });

  it("should have unique flare IDs", async () => {
    // given
    const { flareTypes } = await import("./flareTypes");

    // when
    const ids = flareTypes.map((f: { id: string }) => f.id);
    const uniqueIds = new Set(ids);

    // then
    expect(uniqueIds.size).toBe(ids.length);
  });

  it("should have at least one day-only, one night-only, and one day+night flare", async () => {
    // given
    const { flareTypes } = await import("./flareTypes");

    // when
    const dayOnly = flareTypes.filter(
      (f: { daySuitability: boolean; nightSuitability: boolean }) =>
        f.daySuitability && !f.nightSuitability,
    );
    const nightOnly = flareTypes.filter(
      (f: { daySuitability: boolean; nightSuitability: boolean }) =>
        !f.daySuitability && f.nightSuitability,
    );
    const dayAndNight = flareTypes.filter(
      (f: { daySuitability: boolean; nightSuitability: boolean }) =>
        f.daySuitability && f.nightSuitability,
    );

    // then
    expect(dayOnly.length).toBeGreaterThanOrEqual(1);
    expect(nightOnly.length).toBeGreaterThanOrEqual(1);
    expect(dayAndNight.length).toBeGreaterThanOrEqual(1);
  });

  it("should mark white hand flare as collision warning, not distress", async () => {
    // given
    const { flareTypes } = await import("./flareTypes");

    // when
    const whiteFlare = flareTypes.find(
      (f: { id: string }) => f.id === "white-hand-flare",
    );

    // then
    expect(whiteFlare).toBeDefined();
    expect(whiteFlare.usage.toLowerCase()).toContain("collision");
    expect(whiteFlare.usage.toLowerCase()).not.toContain("distress");
  });
});

describe("flareScenarios data", () => {
  it("should export a non-empty readonly array of FlareScenario objects", async () => {
    // given
    const mod = await import("./flareTypes");

    // when
    const { flareScenarios } = mod;

    // then
    expect(Array.isArray(flareScenarios)).toBe(true);
    expect(flareScenarios.length).toBeGreaterThanOrEqual(6);
  });

  it("should have valid FlareScenario shape for every scenario", async () => {
    // given
    const { flareScenarios, FLARE_IDS } = await import("./flareTypes");

    // when
    const validIds = new Set(Object.values(FLARE_IDS));

    // then
    for (const scenario of flareScenarios) {
      expect(typeof scenario.id).toBe("string");
      expect(scenario.id.length).toBeGreaterThan(0);

      expect(typeof scenario.description).toBe("string");
      expect(scenario.description.length).toBeGreaterThan(0);

      expect(typeof scenario.correctFlareId).toBe("string");
      expect(validIds.has(scenario.correctFlareId)).toBe(true);

      expect(typeof scenario.explanation).toBe("string");
      expect(scenario.explanation.length).toBeGreaterThan(0);
    }
  });

  it("should have unique scenario IDs", async () => {
    // given
    const { flareScenarios } = await import("./flareTypes");

    // when
    const ids = flareScenarios.map((s: { id: string }) => s.id);
    const uniqueIds = new Set(ids);

    // then
    expect(uniqueIds.size).toBe(ids.length);
  });

  it("should reference at least 3 different flare types across all scenarios", async () => {
    // given
    const { flareScenarios } = await import("./flareTypes");

    // when
    const usedFlareIds = new Set(
      flareScenarios.map((s: { correctFlareId: string }) => s.correctFlareId),
    );

    // then
    expect(usedFlareIds.size).toBeGreaterThanOrEqual(3);
  });
});

describe("FLARE_IDS constants", () => {
  it("should export FLARE_IDS object with all 5 flare type IDs", async () => {
    // given
    const { FLARE_IDS } = await import("./flareTypes");

    // then
    expect(FLARE_IDS).toBeDefined();
    expect(FLARE_IDS.RED_PARACHUTE_ROCKET).toBe("red-parachute-rocket");
    expect(FLARE_IDS.RED_HAND_FLARE).toBe("red-hand-flare");
    expect(FLARE_IDS.ORANGE_SMOKE_HAND).toBe("orange-smoke-hand");
    expect(FLARE_IDS.ORANGE_SMOKE_BUOYANT).toBe("orange-smoke-buoyant");
    expect(FLARE_IDS.WHITE_HAND_FLARE).toBe("white-hand-flare");
  });
});
