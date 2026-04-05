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

  it("should cover all fire classes across all extinguishers", () => {
    // given
    const allCoveredClasses = new Set(
      fireExtinguishers.flatMap((e) => e.suitableClasses)
    );

    // then - every fire class should be handled by at least one extinguisher
    for (const cls of FIRE_CLASSES) {
      expect(allCoveredClasses.has(cls)).toBe(true);
    }
  });

  it("should export FIRE_CLASSES with all required classes", () => {
    expect(FIRE_CLASSES).toContain("A");
    expect(FIRE_CLASSES).toContain("B");
    expect(FIRE_CLASSES).toContain("C");
    expect(FIRE_CLASSES).toContain("Electrical");
  });

  // L1: correctExtinguisherId must reference a valid extinguisher ID
  it("should have valid correctExtinguisherId in every fire scenario", () => {
    // given
    const validIds = new Set(fireExtinguishers.map((e) => e.id));

    // then - every scenario's correctExtinguisherId matches a real extinguisher
    for (const scenario of fireScenarios) {
      expect(validIds.has(scenario.correctExtinguisherId)).toBe(true);
    }
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
