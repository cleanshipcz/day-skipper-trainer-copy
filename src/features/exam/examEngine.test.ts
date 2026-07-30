import { describe, expect, it } from "vitest";
import { remainingSeconds, scoreExam, selectExamQuestions } from "./examEngine";

const question = (id: string, correctAnswer = 0) => ({
  id, question: id, options: ["a", "b"], correctAnswer, explanation: "why",
});

describe("exam engine", () => {
  it("selects unique questions across topics and respects the requested limit", () => {
    const selected = selectExamQuestions({ colregs: [question("1"), question("2")], victualling: [question("1")] }, 3, () => 0);
    expect(selected).toHaveLength(3);
    expect(new Set(selected.map((item) => `${item.topicId}:${item.id}`)).size).toBe(3);
  });

  it("scores overall and by topic, treating incomplete answers as incorrect", () => {
    const result = scoreExam([
      { ...question("1"), topicId: "a" },
      { ...question("2", 1), topicId: "a" },
      { ...question("3"), topicId: "b" },
    ], [0, null, 1], 65);
    expect(result).toMatchObject({ score: 1, percentage: 33, passed: false });
    expect(result.topicBreakdown.a).toEqual({ correct: 1, total: 2, percentage: 50 });
  });

  it("never returns a negative timer value", () => {
    expect(remainingSeconds(1_000, 10, 15_000)).toBe(0);
  });
});
