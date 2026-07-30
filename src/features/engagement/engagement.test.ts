import { describe, expect, test } from "vitest";
import { badgeCatalogue } from "@/data/badges";
import { calculateStreak, fetchAllStreakTimestamps } from "./streaks";

describe("engagement rules", () => {
  test("should define every required badge category with at least fifteen immutable definitions", () => {
    expect(badgeCatalogue).toHaveLength(15);
    expect(new Set(badgeCatalogue.map(({ id }) => id)).size).toBe(15);
    expect(new Set(badgeCatalogue.map(({ category }) => category)).size).toBe(5);
    expect(badgeCatalogue.every(({ unlockCondition }) => unlockCondition.length > 5)).toBe(true);
  });

  test("should calculate Prague calendar-day streaks across DST and ignore duplicate events", () => {
    expect(calculateStreak([
      "2026-03-27T23:30:00Z",
      "2026-03-28T23:30:00Z",
      "2026-03-29T22:30:00Z",
      "2026-03-29T23:00:00Z",
    ], "2026-03-30T12:00:00Z")).toBe(3);
  });

  test("should stop at a missing Prague calendar day", () => {
    expect(calculateStreak([
      "2026-10-23T22:30:00Z",
      "2026-10-25T23:30:00Z",
    ], "2026-10-26T12:00:00Z")).toBe(1);
  });

  test("returns zero when neither today nor yesterday has activity", () => {
    expect(calculateStreak([], "2026-07-30T12:00:00Z")).toBe(0);
  });

  test("should count thirty backdated review receipts created today as one reward day", () => {
    const serverReceiptTimes = Array.from({ length: 30 }, () => "2026-07-30T10:00:00Z");
    expect(calculateStreak(serverReceiptTimes, "2026-07-30T12:00:00Z")).toBe(1);
  });

  test("should load and count Prague streaks longer than 366 days across result pages", async () => {
    const timestamps = Array.from({ length: 400 }, (_, offset) => {
      const day = new Date("2026-07-30T12:00:00Z");
      day.setUTCDate(day.getUTCDate() - offset);
      return day.toISOString();
    });
    const requestedRanges: Array<[number, number]> = [];

    const loaded = await fetchAllStreakTimestamps(async (from, to) => {
      requestedRanges.push([from, to]);
      return timestamps.slice(from, to + 1);
    }, 128);

    expect(requestedRanges).toEqual([[0, 127], [128, 255], [256, 383], [384, 511]]);
    expect(calculateStreak(loaded, "2026-07-30T12:00:00Z")).toBe(400);
  });
});
