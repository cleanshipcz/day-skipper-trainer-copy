/**
 * Tests for the personal safety equipment data file.
 *
 * @see docs/FEATURE_TASKS.md — Story E1-S4, AC-1
 */
import { describe, expect, it } from "vitest";

describe("lifeJacketTypes data", () => {
  it("should export a non-empty readonly array of LifeJacketType objects", async () => {
    // given
    const mod = await import("./personalSafetyEquipment");

    // when
    const { lifeJacketTypes } = mod;

    // then
    expect(Array.isArray(lifeJacketTypes)).toBe(true);
    expect(lifeJacketTypes.length).toBeGreaterThan(0);
  });

  it("should define all 3 required life jacket buoyancy ratings (100N, 150N, 275N)", async () => {
    // given
    const { lifeJacketTypes } = await import("./personalSafetyEquipment");

    // when
    const buoyancyRatings = lifeJacketTypes.map(
      (lj: { buoyancyRating: string }) => lj.buoyancyRating,
    );

    // then
    expect(buoyancyRatings).toContain("100N");
    expect(buoyancyRatings).toContain("150N");
    expect(buoyancyRatings).toContain("275N");
    expect(lifeJacketTypes.length).toBe(3);
  });

  it("should have valid LifeJacketType shape for every entry", async () => {
    // given
    const { lifeJacketTypes } = await import("./personalSafetyEquipment");

    // then
    for (const lj of lifeJacketTypes) {
      expect(typeof lj.id).toBe("string");
      expect(lj.id.length).toBeGreaterThan(0);

      expect(typeof lj.name).toBe("string");
      expect(lj.name.length).toBeGreaterThan(0);

      expect(typeof lj.buoyancyRating).toBe("string");
      expect(lj.buoyancyRating.length).toBeGreaterThan(0);

      expect(typeof lj.description).toBe("string");
      expect(lj.description.length).toBeGreaterThan(0);

      expect(typeof lj.suitableFor).toBe("string");
      expect(lj.suitableFor.length).toBeGreaterThan(0);

      expect(typeof lj.turnsUnconsciousWearer).toBe("boolean");
    }
  });

  it("should have unique life jacket IDs", async () => {
    // given
    const { lifeJacketTypes } = await import("./personalSafetyEquipment");

    // when
    const ids = lifeJacketTypes.map((lj: { id: string }) => lj.id);
    const uniqueIds = new Set(ids);

    // then
    expect(uniqueIds.size).toBe(ids.length);
  });

  it("should mark 150N and 275N as turning unconscious wearer face-up", async () => {
    // given
    const { lifeJacketTypes } = await import("./personalSafetyEquipment");

    // when
    const lj150 = lifeJacketTypes.find(
      (lj: { buoyancyRating: string }) => lj.buoyancyRating === "150N",
    );
    const lj275 = lifeJacketTypes.find(
      (lj: { buoyancyRating: string }) => lj.buoyancyRating === "275N",
    );
    const lj100 = lifeJacketTypes.find(
      (lj: { buoyancyRating: string }) => lj.buoyancyRating === "100N",
    );

    // then
    expect(lj150?.turnsUnconsciousWearer).toBe(true);
    expect(lj275?.turnsUnconsciousWearer).toBe(true);
    expect(lj100?.turnsUnconsciousWearer).toBe(false);
  });
});

describe("inflationMethods data", () => {
  it("should export a non-empty readonly array of InflationMethod objects", async () => {
    // given
    const mod = await import("./personalSafetyEquipment");

    // when
    const { inflationMethods } = mod;

    // then
    expect(Array.isArray(inflationMethods)).toBe(true);
    expect(inflationMethods.length).toBeGreaterThanOrEqual(2);
  });

  it("should include both auto-inflate and manual inflation methods", async () => {
    // given
    const { inflationMethods } = await import("./personalSafetyEquipment");

    // when
    const names = inflationMethods.map(
      (m: { id: string }) => m.id,
    );

    // then
    expect(names).toContain("auto-inflate");
    expect(names).toContain("manual");
  });

  it("should have valid InflationMethod shape for every entry", async () => {
    // given
    const { inflationMethods } = await import("./personalSafetyEquipment");

    // then
    for (const method of inflationMethods) {
      expect(typeof method.id).toBe("string");
      expect(method.id.length).toBeGreaterThan(0);

      expect(typeof method.name).toBe("string");
      expect(method.name.length).toBeGreaterThan(0);

      expect(typeof method.description).toBe("string");
      expect(method.description.length).toBeGreaterThan(0);

      expect(typeof method.advantages).toBe("string");
      expect(method.advantages.length).toBeGreaterThan(0);

      expect(typeof method.disadvantages).toBe("string");
      expect(method.disadvantages.length).toBeGreaterThan(0);
    }
  });
});

describe("safetyEquipmentTopics data", () => {
  it("should export a non-empty readonly array of SafetyEquipmentTopic objects", async () => {
    // given
    const mod = await import("./personalSafetyEquipment");

    // when
    const { safetyEquipmentTopics } = mod;

    // then
    expect(Array.isArray(safetyEquipmentTopics)).toBe(true);
    expect(safetyEquipmentTopics.length).toBeGreaterThanOrEqual(4);
  });

  it("should cover all required AC-1 topics: servicing, crotch straps, harnesses/tethers, jacklines, kill cords", async () => {
    // given
    const { safetyEquipmentTopics } = await import("./personalSafetyEquipment");

    // when
    const ids = safetyEquipmentTopics.map(
      (t: { id: string }) => t.id,
    );

    // then
    expect(ids).toContain("servicing");
    expect(ids).toContain("crotch-straps");
    expect(ids).toContain("harnesses-tethers");
    expect(ids).toContain("jacklines");
    expect(ids).toContain("kill-cords");
  });

  it("should have valid SafetyEquipmentTopic shape for every entry", async () => {
    // given
    const { safetyEquipmentTopics } = await import("./personalSafetyEquipment");

    // then
    for (const topic of safetyEquipmentTopics) {
      expect(typeof topic.id).toBe("string");
      expect(topic.id.length).toBeGreaterThan(0);

      expect(typeof topic.name).toBe("string");
      expect(topic.name.length).toBeGreaterThan(0);

      expect(typeof topic.description).toBe("string");
      expect(topic.description.length).toBeGreaterThan(0);

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
    const { safetyEquipmentTopics } = await import("./personalSafetyEquipment");

    // when
    const ids = safetyEquipmentTopics.map((t: { id: string }) => t.id);
    const uniqueIds = new Set(ids);

    // then
    expect(uniqueIds.size).toBe(ids.length);
  });

  it("should include servicing schedule information", async () => {
    // given
    const { safetyEquipmentTopics } = await import("./personalSafetyEquipment");

    // when
    const servicing = safetyEquipmentTopics.find(
      (t: { id: string }) => t.id === "servicing",
    );

    // then
    expect(servicing).toBeDefined();
    expect(servicing!.description.toLowerCase()).toMatch(/servic|inspect|maintain/);
  });
});

describe("LIFE_JACKET_IDS constants", () => {
  it("should export LIFE_JACKET_IDS object with all 3 life jacket IDs", async () => {
    // given
    const { LIFE_JACKET_IDS } = await import("./personalSafetyEquipment");

    // then
    expect(LIFE_JACKET_IDS).toBeDefined();
    expect(typeof LIFE_JACKET_IDS.BUOYANCY_100N).toBe("string");
    expect(typeof LIFE_JACKET_IDS.BUOYANCY_150N).toBe("string");
    expect(typeof LIFE_JACKET_IDS.BUOYANCY_275N).toBe("string");
  });
});
