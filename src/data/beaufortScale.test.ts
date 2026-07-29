import { describe, expect, it } from "vitest";
import { beaufortScale, conditionsForForce, forceForWindSpeed } from "./beaufortScale";

describe("Beaufort scale", () => {
  it("contains every force from zero through twelve", () => {
    expect(beaufortScale.map(({ force }) => force)).toEqual([...Array(13).keys()]);
  });

  it.each([[0, 0], [1, 1], [10, 3], [11, 4], [27, 6], [64, 12], [100, 12]])(
    "maps %s knots to force %s",
    (knots, force) => expect(forceForWindSpeed(knots)?.force).toBe(force)
  );

  it("rejects invalid speeds and supports reverse lookup", () => {
    expect(forceForWindSpeed(-1)).toBeUndefined();
    expect(forceForWindSpeed(Number.NaN)).toBeUndefined();
    expect(conditionsForForce(5)?.description).toBe("Fresh breeze");
    expect(conditionsForForce(13)).toBeUndefined();
  });
});
