import { describe, expect, it } from "vitest";
import { BEAUFORT_SCALE_SOURCE, beaufortScale, conditionsForForce, forceForWindSpeed, normalizeWindSpeed } from "./beaufortScale";

const authoritativeValues = [
  [0, "<1", "Calm", "Calm (glassy)", null, null],
  [1, "1–3", "Light air", "Calm (rippled)", "0.1 m", "0.1 m"],
  [2, "4–6", "Light breeze", "Smooth (wavelets)", "0.2 m", "0.3 m"],
  [3, "7–10", "Gentle breeze", "Slight", "0.6 m", "1.0 m"],
  [4, "11–16", "Moderate breeze", "Slight–moderate", "1.0 m", "1.5 m"],
  [5, "17–21", "Fresh breeze", "Moderate", "2.0 m", "2.5 m"],
  [6, "22–27", "Strong breeze", "Rough", "3.0 m", "4.0 m"],
  [7, "28–33", "Near gale", "Rough–very rough", "4.0 m", "5.5 m"],
  [8, "34–40", "Gale", "Very rough–high", "5.5 m", "7.5 m"],
  [9, "41–47", "Severe gale", "High", "7.0 m", "10.0 m"],
  [10, "48–55", "Storm", "Very high", "9.0 m", "12.5 m"],
  [11, "56–63", "Violent storm", "Very high", "11.5 m", "16.0 m"],
  [12, "64+", "Hurricane force", "Phenomenal", "14 m+", null],
] as const;

const authoritativeSpeedLimits = [
  [0, 0], [1, 3], [4, 6], [7, 10], [11, 16], [17, 21], [22, 27],
  [28, 33], [34, 40], [41, 47], [48, 55], [56, 63], [64, Number.POSITIVE_INFINITY],
] as const;

describe("Beaufort scale", () => {
  it("contains every force from zero through twelve", () => {
    expect(beaufortScale.map(({ force }) => force)).toEqual([...Array(13).keys()]);
  });

  it("matches the Met Office marine terms, sea descriptions and two distinct wave-height columns", () => {
    expect(beaufortScale.map(({ force, knots, description, seaState, probableWaveHeight, probableMaximumWaveHeight }) =>
      [force, knots, description, seaState, probableWaveHeight, probableMaximumWaveHeight]
    )).toEqual(authoritativeValues);
    expect(beaufortScale.map(({ minKnots, maxKnots }) => [minKnots, maxKnots])).toEqual(authoritativeSpeedLimits);
    expect(BEAUFORT_SCALE_SOURCE.url).toBe("https://weather.metoffice.gov.uk/guides/coast-and-sea/beaufort-scale");
  });

  it.each([[0, 0], [0.49, 0], [0.5, 1], [1, 1], [3, 1], [3.49, 1], [3.5, 2], [3.51, 2], [4, 2], [10, 3], [10.49, 3], [10.5, 4], [10.75, 4], [11, 4], [27.49, 6], [27.5, 7], [63.49, 11], [63.5, 12], [64, 12], [100.4, 12]])(
    "maps %s knots to force %s",
    (knots, force) => expect(forceForWindSpeed(knots)?.force).toBe(force)
  );

  it("normalizes decimal readings to the nearest whole knot, with halves rounded up", () => {
    expect(normalizeWindSpeed(3.49)).toBe(3);
    expect(normalizeWindSpeed(3.5)).toBe(4);
    expect(normalizeWindSpeed(10.75)).toBe(11);
    expect(normalizeWindSpeed(64.6)).toBe(65);
  });

  it("keeps every displayed integer range and every rounded transition coherent", () => {
    beaufortScale.forEach(({ force, minKnots, maxKnots }) => {
      expect(forceForWindSpeed(minKnots)?.force).toBe(force);
      if (Number.isFinite(maxKnots)) {
        expect(forceForWindSpeed(maxKnots)?.force).toBe(force);
      }
      if (force > 0) {
        expect(forceForWindSpeed(minKnots - 0.5001)?.force).toBe(force - 1);
        expect(forceForWindSpeed(minKnots - 0.5)?.force).toBe(force);
        expect(forceForWindSpeed(minKnots + 0.0001)?.force).toBe(force);
      }
    });
  });

  it("rejects negative and non-finite speeds and supports reverse lookup", () => {
    expect(forceForWindSpeed(-1)).toBeUndefined();
    expect(forceForWindSpeed(Number.NaN)).toBeUndefined();
    expect(forceForWindSpeed(Number.POSITIVE_INFINITY)).toBeUndefined();
    expect(normalizeWindSpeed(-0.01)).toBeUndefined();
    expect(conditionsForForce(5)?.description).toBe("Fresh breeze");
    expect(conditionsForForce(13)).toBeUndefined();
  });
});
