import { describe, expect, test } from "vitest";
import { badgeCatalogue, evaluateBadges } from "@/data/badges";
import { calculateStreak } from "./streaks";

describe("engagement rules", () => {
  test("should define every required badge category with at least fifteen immutable definitions", () => {
    expect(badgeCatalogue).toHaveLength(15);
    expect(new Set(badgeCatalogue.map(({ id }) => id)).size).toBe(15);
    expect(new Set(badgeCatalogue.map(({ category }) => category)).size).toBe(5);
  });

  test("should unlock quiz, points, topic, syllabus and streak milestones explainably", () => {
    const unlocked = evaluateBadges({
      completedTopicIds: ["navigation", "safety"],
      quizPercentages: [72, 100],
      points: 500,
      currentStreak: 7,
      totalRootTopics: 2,
    });

    expect(unlocked).toEqual(expect.arrayContaining([
      "first-quiz", "perfect-score", "points-500", "navigation-master",
      "safety-first", "full-syllabus", "streak-7",
    ]));
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
});
