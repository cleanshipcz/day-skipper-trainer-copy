import { describe, expect, it } from "vitest";
import { calculateLegEtas, calculatePassage, formatDuration, formatEta, validatePassageInput } from "./calculations";
describe("passage calculations", () => {
  it("calculates time, separate reserve, conservative fuel and ETA", () => expect(calculatePassage({ distanceNm: 30, speedKnots: 6, fuelLitresPerHour: 2, reservePercent: 20, departureTime: "2026-07-30T08:00:00Z" })).toEqual({ hours: 5, durationMinutes: 300, fuelLitres: 10, reserveLitres: 2, fuelWithReserveLitres: 12, practicalFuelLitres: 12, eta: "2026-07-30T13:00:00.000Z" }));
  it("carries rounded minutes into hours", () => expect(formatDuration(calculatePassage({ distanceNm: 59.6, speedKnots: 60, fuelLitresPerHour: 1, reservePercent: 0 }).durationMinutes)).toBe("1 h 0 min"));
  it("never rounds practical fuel down", () => expect(calculatePassage({ distanceNm: 1, speedKnots: 3, fuelLitresPerHour: 2, reservePercent: 10 }).practicalFuelLitres).toBe(1));
  it("rolls ETA across midnight", () => expect(calculatePassage({ distanceNm: 2, speedKnots: 2, fuelLitresPerHour: 1, reservePercent: 0, departureTime: "2026-01-01T23:30:00Z" }).eta).toBe("2026-01-02T00:30:00.000Z"));
  it("renders the same instant with locale, zone and DST offset explicit", () => {
    expect(formatEta("2026-03-29T00:30:00.000Z", "en-GB", "Europe/Prague")).toContain("GMT+1");
    expect(formatEta("2026-03-29T01:30:00.000Z", "en-GB", "Europe/Prague")).toContain("GMT+2");
    expect(formatEta("2026-03-29T01:30:00.000Z", "cs-CZ", "Europe/Prague")).toContain("Europe/Prague");
  });
  it("validates non-positive and unreasonable values", () => expect(validatePassageInput({ distanceNm: 0, speedKnots: 81, fuelLitresPerHour: -1, reservePercent: 201 })).toHaveLength(4));
  it("rejects invalid calculation", () => expect(() => calculatePassage({ distanceNm: 1, speedKnots: 0, fuelLitresPerHour: 1, reservePercent: 20 })).toThrow(RangeError));
  it("accumulates leg ETAs", () => expect(calculateLegEtas([{ id:"1", name:"A", latitude:"", longitude:"", bearing:0, distanceNm:6, notes:"", tidalGate:"", weatherWindow:"" }, { id:"2", name:"B", latitude:"", longitude:"", bearing:0, distanceNm:3, notes:"", tidalGate:"", weatherWindow:"" }], "2026-01-01T00:00:00Z", 3)).toEqual(["2026-01-01T02:00:00.000Z", "2026-01-01T03:00:00.000Z"]));
});
