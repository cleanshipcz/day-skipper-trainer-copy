import { describe, expect, it } from "vitest";
import { countCorrectAnswers, percentageScore, pointsFromCorrectAnswers, questionProgressPercent, quizCompletionOutcome } from "./scoring";

describe("quiz scoring", () => {
  it("counts correct answers by matching selected answer index to question correctAnswer", () => {
    const answers: Array<number | null> = [1, 2, null, 0, 3];
    const questions = [{ correctAnswer: 1 }, { correctAnswer: 0 }, { correctAnswer: 2 }, { correctAnswer: 0 }];

    expect(countCorrectAnswers(answers, questions)).toBe(2);
  });

  it("returns zero percentage for empty question list", () => {
    expect(percentageScore(0, 0)).toBe(0);
  });

  it("rounds percentage score", () => {
    expect(percentageScore(7, 10)).toBe(70);
    expect(percentageScore(2, 3)).toBe(67);
  });

  it("awards 20 points per correct answer", () => {
    expect(pointsFromCorrectAnswers(0)).toBe(0);
    expect(pointsFromCorrectAnswers(3)).toBe(60);
  });

  it("awards no completion points for a failed quiz", () => {
    expect(quizCompletionOutcome(13, 20)).toEqual({
      percentage: 65,
      passed: false,
      pointsEarned: 0,
    });
  });

  it("does not turn even a passing client-scored quiz into trusted points", () => {
    expect(quizCompletionOutcome(14, 20)).toEqual({
      percentage: 70,
      passed: true,
      pointsEarned: 0,
    });
  });

  it("calculates question progress percent from zero-based question index", () => {
    expect(questionProgressPercent(0, 10)).toBe(10);
    expect(questionProgressPercent(4, 10)).toBe(50);
  });

  it("returns 0 progress when there are no questions", () => {
    expect(questionProgressPercent(0, 0)).toBe(0);
  });
});
