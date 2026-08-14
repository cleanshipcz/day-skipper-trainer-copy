import { describe, it, expect } from "vitest";
import {
  fireExtinguishers,
  fireBlankets,
  firefightingEquipment,
  fireScenarios,
  fireResponseScenarios,
  EXTINGUISHER_IDS,
  EQUIPMENT_IDS,
  type FireExtinguisher,
  type FireClass,
  FIRE_CLASSES,
  FIRE_SAFETY_RELEASE_REVIEW,
  isFireSafetyReleaseApproved,
} from "../src/data/fireExtinguishers";

describe("fireExtinguishers data", () => {
  it("should export a non-empty array of extinguishers", () => {
    expect(Array.isArray(fireExtinguishers)).toBe(true);
    expect(fireExtinguishers.length).toBeGreaterThanOrEqual(4);
  });

  it("should include all four required extinguisher types", () => {
    // given
    const requiredTypes = ["Dry Powder", "Foam", "CO2", "Wet Chemical"];

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

  it("should have valid acceptableEquipmentIds and prerequisites in every fire scenario", () => {
    // given
    const validIds = new Set(firefightingEquipment.map((e) => e.id));

    // then - every scenario's correctExtinguisherId matches a real extinguisher
    for (const scenario of fireScenarios) {
      expect(scenario.acceptableEquipmentIds.length).toBeGreaterThan(0);
      expect(scenario.prerequisites).toBeTruthy();
      for (const id of scenario.acceptableEquipmentIds) {
        expect(validIds.has(id)).toBe(true);
        expect(scenario.assumedEquipment[id]).toMatch(/marked|BS EN|approved/i);
      }
    }
  });

  it("classifies cooking oil as F and keeps blankets separate from extinguisher colour codes", () => {
    expect(fireScenarios.find((s) => s.id === "galley-oil")?.fireClass).toBe("F");
    expect(fireExtinguishers.some((e) => e.id === "fire-blanket")).toBe(false);
    expect(fireBlankets).toHaveLength(1);
    expect(fireBlankets[0]).not.toHaveProperty("colourCode");
    expect(fireBlankets[0]).not.toHaveProperty("suitableClasses");
  });

  it("requires complete competent-review evidence before release", () => {
    expect(isFireSafetyReleaseApproved(FIRE_SAFETY_RELEASE_REVIEW)).toBe(false);
    expect(isFireSafetyReleaseApproved({
      required: true,
      reviewed: true,
      reviewerName: "Competent Reviewer",
      reviewerQualification: "Marine fire-safety qualification",
      approvalDate: "2026-08-12",
      sourceEvidence: ["Signed review record FS-337"],
    })).toBe(true);
    expect(isFireSafetyReleaseApproved({
      required: true,
      reviewed: true,
      reviewerName: "Competent Reviewer",
      reviewerQualification: null,
      approvalDate: "2026-08-12",
      sourceEvidence: ["Signed review record FS-337"],
    })).toBe(false);
  });

  it("shows an exact marked rating or standard and manufacturer constraint for every drill option", () => {
    for (const option of firefightingEquipment) {
      expect(option.optionDetail).toMatch(/marked|BS EN|approved/i);
      expect(option.optionDetail).toMatch(/manufacturer|instructions|no extinguisher colour band/i);
    }
  });

  it("does not encode one universal medium where defensible alternatives depend on conditions", () => {
    expect(fireScenarios.find((s) => s.id === "engine-diesel")?.acceptableEquipmentIds.length).toBeGreaterThan(1);
    expect(fireScenarios.find((s) => s.id === "bunk-mattress")?.acceptableEquipmentIds).toContain("foam");
  });

  it("does not conflate portable CO2 with an approved fixed engine-space system", () => {
    const engineScenario = fireScenarios.find((scenario) => scenario.id === "engine-diesel");
    expect(engineScenario?.acceptableEquipmentIds).toContain(EQUIPMENT_IDS.FIXED_CO2_SYSTEM);
    expect(engineScenario?.acceptableEquipmentIds).not.toContain(EXTINGUISHER_IDS.CO2);
    expect(engineScenario?.assumedEquipment[EQUIPMENT_IDS.FIXED_CO2_SYSTEM]).toMatch(/fixed CO2 system/i);
    expect(engineScenario?.assumedEquipment[EXTINGUISHER_IDS.CO2]).toBeUndefined();
  });

  it("accounts for everyone before engine-space shutdown or discharge actions", () => {
    const scenario = fireResponseScenarios.find((item) => item.id === "engine-space-closed");
    const safeOption = scenario?.options.find((option) => option.id === scenario.correctOptionId);
    const label = safeOption?.label ?? "";

    expect(label.indexOf("confirm everyone is out")).toBeGreaterThanOrEqual(0);
    expect(label.indexOf("confirm everyone is out")).toBeLessThan(label.indexOf("stop engine/generator"));
    expect(label.indexOf("confirm everyone is out")).toBeLessThan(label.indexOf("discharge the approved fixed system"));
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
