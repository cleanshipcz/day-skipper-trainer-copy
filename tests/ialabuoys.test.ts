/**
 * Data integrity tests for IALA buoys dataset.
 *
 * Validates that ialabuoys.ts contains all required buoy types with
 * correct structure and complete coverage per AC-2 and AC-4.
 *
 * @see docs/FEATURE_TASKS.md — Story E2-S1, AC-2, AC-4
 */
import { describe, it, expect } from "vitest";
import {
  ialaBuoys,
  type IalaBuoy,
  type BuoyCategory,
  BUOY_CATEGORIES,
} from "@/data/ialabuoys";

describe("ialabuoys data", () => {
  it("should export a non-empty readonly array", () => {
    // then
    expect(Array.isArray(ialaBuoys)).toBe(true);
    expect(ialaBuoys.length).toBeGreaterThanOrEqual(12);
  });

  it("should have unique IDs for every buoy entry", () => {
    // given
    const ids = ialaBuoys.map((b) => b.id);

    // then
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("should have all required fields populated for every buoy", () => {
    for (const buoy of ialaBuoys) {
      // then - every buoy must have all required string fields non-empty
      expect(buoy.id).toBeTruthy();
      expect(buoy.name).toBeTruthy();
      expect(buoy.category).toBeTruthy();
      expect(buoy.colour).toBeTruthy();
      expect(buoy.topMarkShape).toBeTruthy();
      expect(buoy.lightCharacteristic).toBeTruthy();
      expect(buoy.meaning).toBeTruthy();
      expect(buoy.visualDescriptor).toBeTruthy();
    }
  });

  it("should only use valid BuoyCategory values", () => {
    // given
    const validCategories = Object.values(BUOY_CATEGORIES);

    for (const buoy of ialaBuoys) {
      // then
      expect(validCategories).toContain(buoy.category);
    }
  });

  // AC-1: Must cover all IALA Region A buoy categories
  it("should include lateral port and starboard marks", () => {
    // given
    const lateralBuoys = ialaBuoys.filter((b) => b.category === "lateral");

    // then
    expect(lateralBuoys.length).toBeGreaterThanOrEqual(2);
    expect(lateralBuoys.some((b) => b.id.includes("port"))).toBe(true);
    expect(lateralBuoys.some((b) => b.id.includes("starboard"))).toBe(true);
  });

  it("should include all four cardinal marks (N, E, S, W)", () => {
    // given
    const cardinalBuoys = ialaBuoys.filter((b) => b.category === "cardinal");

    // then
    expect(cardinalBuoys.length).toBeGreaterThanOrEqual(4);
    expect(cardinalBuoys.some((b) => b.id.includes("north"))).toBe(true);
    expect(cardinalBuoys.some((b) => b.id.includes("east"))).toBe(true);
    expect(cardinalBuoys.some((b) => b.id.includes("south"))).toBe(true);
    expect(cardinalBuoys.some((b) => b.id.includes("west"))).toBe(true);
  });

  it("should include isolated danger marks", () => {
    // then
    expect(ialaBuoys.some((b) => b.category === "isolated-danger")).toBe(true);
  });

  it("should include safe water marks", () => {
    // then
    expect(ialaBuoys.some((b) => b.category === "safe-water")).toBe(true);
  });

  it("should include special marks", () => {
    // then
    expect(ialaBuoys.some((b) => b.category === "special")).toBe(true);
  });

  it("should include new danger marks", () => {
    // then
    expect(ialaBuoys.some((b) => b.category === "new-danger")).toBe(true);
  });

  // AC-4: Cardinal marks must include clock-face mnemonic
  it("should include clock-face mnemonic text for all cardinal marks", () => {
    // given
    const cardinalBuoys = ialaBuoys.filter((b) => b.category === "cardinal");

    for (const buoy of cardinalBuoys) {
      // then - each cardinal mark must have a clockFaceMnemonic
      expect(buoy.clockFaceMnemonic).toBeTruthy();
      expect(buoy.clockFaceMnemonic!.length).toBeGreaterThan(0);
    }
  });

  it("encodes the authoritative Region A qualifications and new-danger distinction", () => {
    expect(ialaBuoys.find((b) => b.id === "lateral-port-preferred")?.name).toBe("Preferred channel to starboard");
    expect(ialaBuoys.find((b) => b.id === "lateral-starboard-preferred")?.name).toBe("Preferred channel to port");
    expect(ialaBuoys.find((b) => b.id === "special-mark")?.lightCharacteristic).toMatch(/must not conflict/i);
    const wreck = ialaBuoys.find((b) => b.id === "new-danger-mark");
    expect(wreck?.name).toBe("Emergency Wreck Marking Buoy");
    expect(wreck?.lightCharacteristic).toContain("1 s blue, 0.5 s eclipse, 1 s yellow, 0.5 s eclipse");
    expect(wreck?.chartAndSafety).toMatch(/Duplicate identical marks only for especially high risk/);
    expect(wreck?.chartAndSafety).toMatch(/Status ends when removed or sufficiently promulgated/);
  });

  it("provides traceable structured visual fields for every taught mark", () => {
    for (const buoy of ialaBuoys) {
      expect(buoy.bodyShape).toBeTruthy();
      expect(buoy.pattern).toBeTruthy();
      expect(buoy.topmark).toBeTruthy();
      expect(buoy.chartAndSafety).toBeTruthy();
      expect(buoy.source).toMatch(/R1001 ed\.2\.0/);
    }
  });
});
