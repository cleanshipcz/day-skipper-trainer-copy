import { describe, it, expect } from "vitest";
import {
  fireExtinguishers,
  fireScenarios,
  EXTINGUISHER_IDS,
  type FireExtinguisher,
  type FireClass,
  FIRE_CLASSES,
} from "../src/data/fireExtinguishers";

describe("fireExtinguishers data", () => {
  it("should export a non-empty array of extinguishers", () => {
    expect(Array.isArray(fireExtinguishers)).toBe(true);
    expect(fireExtinguishers.length).toBeGreaterThanOrEqual(4);
  });

  it("should include all four required extinguisher types", () => {
    // given
    const requiredTypes = ["Dry Powder", "Foam", "CO2", "Fire Blanket"];

    // when
    const typeNames = fireExtinguishers.map((e) => e.type);

    // then
    for (const required of requiredTypes) {
      expect(typeNames).toContain(required);
    }
  });

  it("should have valid structure for every extinguisher", () => {
    for (const ext of fireExtinguishers) {
      // then - required string fields are non-empty
      expect(ext.id).toBeTruthy();
      expect(ext.type).toBeTruthy();
      expect(ext.colourCode).toBeTruthy();
      expect(ext.description).toBeTruthy();

      // then - suitableClasses is non-empty array of valid fire classes
      expect(ext.suitableClasses.length).toBeGreaterThan(0);
      for (const cls of ext.suitableClasses) {
        expect(FIRE_CLASSES).toContain(cls);
      }

      // then - advantages and disadvantages are arrays
      expect(Array.isArray(ext.advantages)).toBe(true);
      expect(Array.isArray(ext.disadvantages)).toBe(true);
    }
  });

  it("should have unique IDs for every extinguisher", () => {
    // given
    const ids = fireExtinguishers.map((e) => e.id);

    // then
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("should only claim classes actually covered by the listed equipment", () => {
    // given
    const allCoveredClasses = new Set(
      fireExtinguishers.flatMap((e) => e.suitableClasses)
    );

    expect(allCoveredClasses).toEqual(new Set(["A", "B", "C", "F"]));
    expect(allCoveredClasses.has("D")).toBe(false);
  });

  it("should export FIRE_CLASSES with all required classes", () => {
    expect(FIRE_CLASSES).toContain("A");
    expect(FIRE_CLASSES).toContain("B");
    expect(FIRE_CLASSES).toContain("C");
    expect(FIRE_CLASSES).toContain("D");
    expect(FIRE_CLASSES).toContain("F");
    expect(FIRE_CLASSES).not.toContain("Electrical");
  });

  it("should have valid acceptableExtinguisherIds and prerequisites in every fire scenario", () => {
    // given
    const validIds = new Set(fireExtinguishers.map((e) => e.id));

    // then - every scenario's correctExtinguisherId matches a real extinguisher
    for (const scenario of fireScenarios) {
      expect(scenario.acceptableExtinguisherIds.length).toBeGreaterThan(0);
      expect(scenario.prerequisites).toBeTruthy();
      for (const id of scenario.acceptableExtinguisherIds) expect(validIds.has(id)).toBe(true);
    }
  });

  it("classifies cooking oil as F and keeps blankets separate from extinguisher colour codes", () => {
    expect(fireScenarios.find((s) => s.id === "galley-oil")?.fireClass).toBe("F");
    const blanket = fireExtinguishers.find((e) => e.id === "fire-blanket");
    expect(blanket?.colourCode).toMatch(/no extinguisher/i);
    expect(blanket?.suitableClasses).toEqual(["F"]);
  });

  it("does not encode one universal medium where defensible alternatives depend on conditions", () => {
    expect(fireScenarios.find((s) => s.id === "engine-diesel")?.acceptableExtinguisherIds.length).toBeGreaterThan(1);
    expect(fireScenarios.find((s) => s.id === "bunk-mattress")?.acceptableExtinguisherIds).toContain("foam");
  });

  // L1: EXTINGUISHER_IDS matches actual extinguisher IDs
  it("should export EXTINGUISHER_IDS matching all extinguisher entries", () => {
    // given
    const idValues = Object.values(EXTINGUISHER_IDS);

    // then - every extinguisher ID is in the constant set
    for (const ext of fireExtinguishers) {
      expect(idValues).toContain(ext.id);
    }
  });
});
