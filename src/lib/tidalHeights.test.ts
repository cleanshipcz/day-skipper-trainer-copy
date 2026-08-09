import { describe, expect, it } from "vitest";
import { formatTidalTime, heightAtTime, minutesAfterMidnight, normaliseFollowingTime, timeForHeight } from "./tidalHeights";

describe("tidal height calculations", () => {
  it("calculates height at a time on falling and rising limbs", () => {
    expect(heightAtTime({ minutes: 600, height: 4.8 }, { minutes: 960, height: 1.2 }, 720)).toBeCloseTo(3.9, 6);
    expect(heightAtTime({ minutes: 960, height: 1.2 }, { minutes: 1320, height: 4.8 }, 1080)).toBeCloseTo(2.1, 6);
  });

  it("solves both rising and falling times for the same height", () => {
    expect(timeForHeight({ minutes: 600, height: 4.8 }, { minutes: 960, height: 1.2 }, 3)).toBe(780);
    expect(timeForHeight({ minutes: 960, height: 1.2 }, { minutes: 1300, height: 4.6 }, 3)).toBeCloseTo(1136.37, 2);
  });

  it("keeps a following event and answer on the next date", () => {
    const hw = minutesAfterMidnight("21:40");
    const lw = normaliseFollowingTime(hw, minutesAfterMidnight("03:50"));
    expect(lw).toBe(1670);
    expect(formatTidalTime(timeForHeight({ minutes: hw, height: 4.6 }, { minutes: lw, height: 0.8 }, 2.7))).toBe("00:45 (+1 day)");
  });

  it("rejects requests outside the selected published limb", () => {
    expect(() => heightAtTime({ minutes: 600, height: 4 }, { minutes: 960, height: 1 }, 990)).toThrow(RangeError);
    expect(() => timeForHeight({ minutes: 600, height: 4 }, { minutes: 960, height: 1 }, 5)).toThrow(RangeError);
    expect(() => timeForHeight({ minutes: 600, height: 2 }, { minutes: 960, height: 2 }, 2)).toThrow(RangeError);
  });

  it("carries a rounded minute into the following day", () => {
    expect(formatTidalTime(1439.6)).toBe("00:00 (+1 day)");
  });
});
