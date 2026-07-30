import { describe, expect, it } from "vitest";
import { clampInteger, parseExamSession } from "./examSession";

const valid = {
  attemptId: "123e4567-e89b-12d3-a456-426614174000",
  questions: [{ id: "q", topicId: "safety", question: "Q?", options: ["a", "b"], correctAnswer: 0, explanation: "x" }],
  answers: [null], flagged: [], current: 0, startedAt: 1_000, durationSeconds: 300,
  passMark: 70, submitted: false, elapsedSeconds: null, saveStatus: "pending",
};

describe("exam session validation", () => {
  it("hydrates a valid session and converts interrupted saving to retryable pending", () => {
    expect(parseExamSession(JSON.stringify({ ...valid, saveStatus: "saving" }), 2_000)?.saveStatus).toBe("pending");
  });
  it.each([
    { ...valid, current: 2 },
    { ...valid, answers: [8] },
    { ...valid, startedAt: 99_999 },
    { ...valid, questions: [{ ...valid.questions[0], correctAnswer: 4 }] },
  ])("rejects malformed or unsafe hydrated state", (value) => {
    expect(parseExamSession(JSON.stringify(value), 2_000)).toBeNull();
  });
  it("strictly clamps configuration", () => {
    expect(clampInteger("999", 48, 10, 100)).toBe(100);
    expect(clampInteger("wat", 65, 1, 100)).toBe(65);
  });
});
