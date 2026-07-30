import { describe, expect, test } from "vitest";
import { calculateSm2, qualityForAnswer } from "./sm2";

describe("calculateSm2", () => {
  test.each([
    { quality: 5, repetitions: 0, intervalDays: 0, easeFactor: 2.5, expected: [1, 1, 2.6] },
    { quality: 5, repetitions: 1, intervalDays: 1, easeFactor: 2.6, expected: [2, 6, 2.7] },
    { quality: 4, repetitions: 2, intervalDays: 6, easeFactor: 2.5, expected: [3, 15, 2.5] },
    { quality: 2, repetitions: 8, intervalDays: 90, easeFactor: 2.5, expected: [0, 1, 2.18] },
    { quality: 0, repetitions: 0, intervalDays: 0, easeFactor: 1.3, expected: [0, 1, 1.3] },
  ])("should return the documented SM-2 vector for quality $quality", ({ quality, repetitions, intervalDays, easeFactor, expected }) => {
    // given
    const current = { repetitions, intervalDays, easeFactor };

    // when
    const result = calculateSm2(current, quality);

    // then
    expect(result.repetitions).toBe(expected[0]);
    expect(result.intervalDays).toBe(expected[1]);
    expect(result.easeFactor).toBeCloseTo(expected[2], 10);
  });

  test("should reject a quality outside the supported zero-to-five boundary", () => {
    expect(() => calculateSm2({ repetitions: 0, intervalDays: 0, easeFactor: 2.5 }, 6)).toThrow(
      "quality must be an integer from 0 to 5",
    );
  });

  test("should clamp a successful review at the persisted interval boundary", () => {
    const result = calculateSm2({ repetitions: 20, intervalDays: 36_500, easeFactor: 2.5 }, 5);

    expect(result.intervalDays).toBe(36_500);
    expect(calculateSm2(result, 5).intervalDays).toBe(36_500);
  });

  test("should map correct and incorrect answers to deterministic automatic ratings", () => {
    expect(qualityForAnswer(true)).toBe(4);
    expect(qualityForAnswer(false)).toBe(2);
  });
});
