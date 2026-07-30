import { describe, expect, it } from "vitest";
import { calculateLegEtas, calculatePassage, validatePassageInput } from "./calculations";
describe("passage calculations", () => {
  it("calculates time, fuel, reserve and ETA", () => expect(calculatePassage({ distanceNm: 30, speedKnots: 6, fuelLitresPerHour: 2, reservePercent: 20, departureTime: "2026-07-30T08:00:00Z" })).toEqual({ hours: 5, fuelLitres: 10, fuelWithReserveLitres: 12, eta: "2026-07-30T13:00:00.000Z" }));
  it("validates non-positive and unreasonable values", () => expect(validatePassageInput({ distanceNm: 0, speedKnots: 81, fuelLitresPerHour: -1, reservePercent: 201 })).toHaveLength(4));
  it("rejects invalid calculation", () => expect(() => calculatePassage({ distanceNm: 1, speedKnots: 0, fuelLitresPerHour: 1, reservePercent: 20 })).toThrow(RangeError));
  it("accumulates leg ETAs", () => expect(calculateLegEtas([{ id:"1", name:"A", latitude:"", longitude:"", bearing:0, distanceNm:6, notes:"", tidalGate:"", weatherWindow:"" }, { id:"2", name:"B", latitude:"", longitude:"", bearing:0, distanceNm:3, notes:"", tidalGate:"", weatherWindow:"" }], "2026-01-01T00:00:00Z", 3)).toEqual(["2026-01-01T02:00:00.000Z", "2026-01-01T03:00:00.000Z"]));
});
