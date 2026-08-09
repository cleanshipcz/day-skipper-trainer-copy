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
    expect(conservativeWindow({ start: 721.1, end: 723.9 })).toEqual({ start: 725, end: 720 });
    expect(formatTidalTime(1439.6)).toBe("00:00 (+1 day)");
  });

  it("represents a non-five-minute equality exactly and rejects a narrower-than-five-minute display window", () => {
    const equality = plan({ high: { minutes: 722, height: 5 }, followingLow: { minutes: 1082, height: 1 }, draft: 4, clearance: 1 });
    expect(equality.status).toBe("boundary");
    expect(equality.safeWindows).toEqual([{ start: 722, end: 722 }]);
    const narrow = plan({ high: { minutes: 722, height: 5 }, followingLow: { minutes: 1082, height: 1 }, draft: 4.99999, clearance: 0 });
    expect(narrow.status).toBe("no_usable_window");
    expect(narrow.safeWindows[0].start).toBeLessThan(narrow.safeWindows[0].end);
    expect(conservativeWindow(narrow.safeWindows[0]).start).toBeGreaterThan(conservativeWindow(narrow.safeWindows[0]).end);
  });

  it("rejects a nonzero exact interval whose inward-rounded endpoints coincide", () => {
    const result = plan({
      previousLow: { minutes: 718, height: 4.99987815 },
      high: { minutes: 720, height: 5 },
      followingLow: { minutes: 722, height: 4.99987815 },
      draft: 4.9999,
      clearance: 0,
    });
    // Use a normal-duration model with analytic crossings close to noon instead.
    const normalDuration = plan({ draft: 4.9999, clearance: 0 });
    expect(result.status).toBe("out_of_model");
    expect(normalDuration.safeWindows[0].start).toBeLessThan(normalDuration.safeWindows[0].end);
    expect(conservativeWindow(normalDuration.safeWindows[0]).start).toBe(conservativeWindow(normalDuration.safeWindows[0]).end);
    expect(normalDuration.status).toBe("no_usable_window");
  });

  it("preserves real safe intervals when the requirement equals either or both low waters", () => {
    const atPrevious = plan({ previousLow: { minutes: 360, height: 2 }, followingLow: { minutes: 1080, height: 1 }, draft: 2, clearance: 0 });
    expect(atPrevious.status).toBe("boundary");
    expect(atPrevious.safeWindows[0].start).toBe(360);
    expect(atPrevious.safeWindows[0].end).toBeLessThan(1080);

    const atFollowing = plan({ previousLow: { minutes: 360, height: 1 }, followingLow: { minutes: 1080, height: 2 }, draft: 2, clearance: 0 });
    expect(atFollowing.status).toBe("boundary");
    expect(atFollowing.safeWindows[0].start).toBeGreaterThan(360);
    expect(atFollowing.safeWindows[0].end).toBe(1080);

    const atBoth = plan({ draft: 1, clearance: 0 });
    expect(atBoth.status).toBe("boundary");
    expect(atBoth.safeWindows).toEqual([{ start: 360, end: 1080 }]);
  });

  it("supports finite negative and high tidal values", () => {
    const result = plan({ previousLow: { minutes: 360, height: -3 }, high: { minutes: 720, height: 18 }, followingLow: { minutes: 1080, height: -2 }, chartedDepth: -1 });
    expect(result.status).toBe("safe_window");
    expect(result.crossings.every(Number.isFinite)).toBe(true);
  });
});
