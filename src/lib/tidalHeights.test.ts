import { describe, expect, it } from "vitest";
import { calculatePassagePlan, conservativeWindow, formatTidalTime, heightAtTime, minutesAfterMidnight, normaliseFollowingTime, timeForHeight } from "./tidalHeights";

const plan = (overrides = {}) => calculatePassagePlan({
  previousLow: { minutes: 360, height: 1 }, high: { minutes: 720, height: 5 },
  followingLow: { minutes: 1080, height: 1 }, draft: 2, clearance: 1, chartedDepth: 0,
  ...overrides,
});

describe("tidal passage calculations", () => {
  it("interpolates only within a bounded limb", () => {
    expect(heightAtTime({ minutes: 600, height: 4.8 }, { minutes: 960, height: 1.2 }, 720)).toBeCloseTo(3.9, 6);
    expect(() => heightAtTime({ minutes: 600, height: 4 }, { minutes: 960, height: 1 }, 990)).toThrow(RangeError);
  });

  it("keeps overnight chronology and answers on the next date", () => {
    const hw = normaliseFollowingTime(minutesAfterMidnight("21:40"), minutesAfterMidnight("03:50"));
    expect(hw).toBe(1670);
    expect(formatTidalTime(timeForHeight({ minutes: 1300, height: 0.8 }, { minutes: hw, height: 4.6 }, 2.7))).toBe("00:45 (+1 day)");
    const overnight = plan({
      previousLow: { minutes: 20 * 60, height: 1 },
      high: { minutes: 26 * 60, height: 5 },
      followingLow: { minutes: 32 * 60, height: 1 },
    });
    expect(overnight.status).toBe("safe_window");
    expect(formatTidalTime(overnight.safeWindows[0].end)).toContain("+1 day");
  });

  it("rejects equal, inverted, invalid and implausible events", () => {
    expect(plan({ high: { minutes: 720, height: 1 } }).status).toBe("out_of_model");
    expect(plan({ high: { minutes: 360, height: 5 } }).status).toBe("out_of_model");
    expect(plan({ high: { minutes: 400, height: 5 } }).status).toBe("out_of_model");
    expect(plan({ high: { minutes: 720, height: 31 } }).status).toBe("out_of_model");
    expect(plan({ chartedDepth: 101 }).status).toBe("out_of_model");
    expect(plan({ draft: Number.NaN }).status).toBe("invalid");
    expect(() => timeForHeight({ minutes: 0, height: 2 }, { minutes: 1, height: 2 }, 2)).toThrow(RangeError);
  });

  it("reports always safe, never safe and equality boundaries", () => {
    expect(plan({ chartedDepth: 3 }).status).toBe("always_safe");
    expect(plan({ draft: 6 }).status).toBe("never_safe");
    expect(plan({ draft: 4, clearance: 1 }).status).toBe("boundary");
    expect(plan({ draft: 1, clearance: 0 }).status).toBe("boundary");
  });

  it("finds zero, one and two exact crossings without clipping", () => {
    expect(plan({ chartedDepth: 3 }).crossings).toHaveLength(0);
    const one = plan({ previousLow: { minutes: 360, height: 3 } });
    expect(one.crossings).toHaveLength(1);
    const two = plan();
    expect(two.crossings).toHaveLength(2);
    expect(two.crossings[0]).toBe(540);
    expect(two.crossings[1]).toBe(900);
  });

  it("uses conservative five-minute display boundaries", () => {
    expect(conservativeWindow({ start: 541.1, end: 898.9 })).toEqual({ start: 545, end: 895 });
    expect(formatTidalTime(1439.6)).toBe("00:00 (+1 day)");
  });

  it("supports finite negative and high tidal values", () => {
    const result = plan({ previousLow: { minutes: 360, height: -3 }, high: { minutes: 720, height: 18 }, followingLow: { minutes: 1080, height: -2 }, chartedDepth: -1 });
    expect(result.status).toBe("safe_window");
    expect(result.crossings.every(Number.isFinite)).toBe(true);
  });
});
