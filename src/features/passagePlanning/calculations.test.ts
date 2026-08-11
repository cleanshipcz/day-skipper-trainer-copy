import { describe, expect, it } from "vitest";
import { calculateLegEtas, calculatePassage, formatDuration, formatEta, passageValidationIssues, possibleInstants, totalRouteDistance, validatePassageInput, type PlanWaypoint } from "./calculations";
describe("passage calculations", () => {
  const base = { distanceNm:30, speedKnots:6, engineHours:3, fuelLitresPerHour:2, additionalFuelLitres:2, reservePercent:25, usableFuelLitres:20 };
  it("separates passage and engine time, extra use, reserve, usable fuel and ETA", () => expect(calculatePassage({ ...base, departureTime:"2026-07-30T08:00:00Z" })).toEqual({ hours:5, durationMinutes:300, fuelLitres:6, subtotalFuelLitres:8, reserveLitres:2, fuelWithReserveLitres:10, practicalFuelLitres:10, usableFuelMarginLitres:10, hasEnoughUsableFuel:true, eta:"2026-07-30T13:00:00.000Z" }));
  it("supports a sail/auxiliary model whose engine time is shorter than passage time", () => expect(calculatePassage({ ...base, distanceNm:72, speedKnots:6, engineHours:4, fuelLitresPerHour:3.5 }).fuelLitres).toBe(14));
  it("carries rounded minutes into hours", () => expect(formatDuration(calculatePassage({ ...base, distanceNm:59.6, speedKnots:60 }).durationMinutes)).toBe("1 h 0 min"));
  it("never rounds practical fuel down and flags inadequate usable fuel", () => { const result=calculatePassage({ ...base, engineHours:.3, fuelLitresPerHour:2, additionalFuelLitres:0, reservePercent:10, usableFuelLitres:.8 }); expect(result).toMatchObject({practicalFuelLitres:1,hasEnoughUsableFuel:false}); expect(result.usableFuelMarginLitres).toBeCloseTo(-.2); });
  it("rolls ETA across midnight", () => expect(calculatePassage({ ...base, distanceNm:2, speedKnots:2, departureTime:"2026-01-01T23:30:00Z" }).eta).toBe("2026-01-02T00:30:00.000Z"));
  it("renders the same instant with locale, zone and DST offset explicit", () => {
    expect(formatEta("2026-03-29T00:30:00.000Z", "en-GB", "Europe/Prague")).toContain("GMT+1");
    expect(formatEta("2026-03-29T01:30:00.000Z", "en-GB", "Europe/Prague")).toContain("GMT+2");
    expect(formatEta("2026-03-29T01:30:00.000Z", "cs-CZ", "Europe/Prague")).toContain("Europe/Prague");
  });
  it("rejects Prague's spring DST gap and exposes both autumn overlap instants", () => {
    expect(possibleInstants("2026-03-29T02:30", "Europe/Prague")).toEqual([]);
    expect(possibleInstants("2026-10-25T02:30", "Europe/Prague")).toEqual(["2026-10-25T00:30:00.000Z", "2026-10-25T01:30:00.000Z"]);
  });
  it("rejects zero reserve and invalid model inputs", () => expect(validatePassageInput({ ...base, distanceNm:0, speedKnots:81, engineHours:-1, fuelLitresPerHour:-1, additionalFuelLitres:-1, reservePercent:0, usableFuelLitres:0 })).toHaveLength(7));
  it("rejects invalid calculation", () => expect(() => calculatePassage({ ...base, speedKnots:0 })).toThrow(RangeError));
  it.each([
    ["blank-normalised zero",{distanceNm:0},"distanceNm"],
    ["negative",{additionalFuelLitres:-1},"additionalFuelLitres"],
    ["NaN",{speedKnots:Number.NaN},"speedKnots"],
    ["Infinity",{fuelLitresPerHour:Number.POSITIVE_INFINITY},"fuelLitresPerHour"],
    ["tiny speed",{speedKnots:Number.MIN_VALUE},"speedKnots"],
    ["exponent overflow",{usableFuelLitres:Number("1e309")},"usableFuelLitres"],
  ])("rejects %s deterministically",(_name,override,field)=>expect(passageValidationIssues({...base,...override})).toEqual(expect.arrayContaining([expect.objectContaining({field})])));
  it("bounds derived duration independently of raw speed bounds",()=>expect(passageValidationIssues({...base,distanceNm:2000,speedKnots:.1})).toEqual(expect.arrayContaining([expect.objectContaining({field:"duration"})])));
  it("rejects fractions that disagree with the documented input precision",()=>expect(passageValidationIssues({...base,distanceNm:18.05})).toEqual(expect.arrayContaining([expect.objectContaining({field:"distanceNm",message:expect.stringContaining("increments of 0.1")})])));
  it("rejects underflowed/non-positive derived fuel",()=>expect(passageValidationIssues({...base,engineHours:Number.MIN_VALUE,fuelLitresPerHour:.1,additionalFuelLitres:0})).toEqual(expect.arrayContaining([expect.objectContaining({field:"fuelTotal"})])));
  it("rejects an ETA beyond the JavaScript Date boundary before calculation",()=>{const input={...base,distanceNm:160,speedKnots:80,departureTime:"+275760-09-12T23:00:00.000Z"};expect(passageValidationIssues(input)).toEqual(expect.arrayContaining([expect.objectContaining({field:"departureTime",message:expect.stringContaining("representable ETA")})]));expect(()=>calculatePassage(input)).toThrow(RangeError)});
  const point=(id:string,distanceNm:number|null):PlanWaypoint=>({id,name:id,latitude:"",longitude:"",inboundLeg:distanceNm===null?null:{course:0,distanceNm,notes:"",tidalGate:"",weatherWindow:""}});
  it("has no imaginary leg or ETA for a lone departure",()=>{const route=[point("A",null)];expect(totalRouteDistance(route)).toBe(0);expect(calculateLegEtas(route,"2026-01-01T00:00:00Z",3)).toEqual([])});
  it("calculates exactly one leg and destination ETA for two points",()=>{const route=[point("A",null),point("B",6)];expect(totalRouteDistance(route)).toBe(6);expect(calculateLegEtas(route,"2026-01-01T00:00:00Z",3)).toEqual(["2026-01-01T02:00:00.000Z"])});
  it("accumulates intermediate and destination ETAs without a leg beyond destination", () => {const route=[point("A",null),point("B",6),point("C",3),point("D",1.5)];expect(totalRouteDistance(route)).toBe(10.5);expect(calculateLegEtas(route,"2026-01-01T00:00:00Z",3)).toEqual(["2026-01-01T02:00:00.000Z","2026-01-01T03:00:00.000Z","2026-01-01T03:30:00.000Z"])});
});
