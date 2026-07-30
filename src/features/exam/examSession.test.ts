import { describe, expect, it } from "vitest";
import { clampInteger, parseExamSession, sessionBelongsTo } from "./examSession";

const valid = {
  ownerId: null,
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
  it("binds a session to exactly one anonymous or authenticated identity", () => {
    expect(parseExamSession(JSON.stringify({ ...valid, ownerId: "not-a-uuid" }), 2_000)).toBeNull();
    expect(parseExamSession(JSON.stringify({ ...valid, attemptId: "123e4567-e89b-12d3-a456-42661417400-" }), 2_000)).toBeNull();
    const parsed = parseExamSession(JSON.stringify(valid), 2_000)!;
    expect(sessionBelongsTo(parsed, null)).toBe(true);
    expect(sessionBelongsTo(parsed, "other")).toBe(false);
  });
  it.each([
    null,
    { ...valid, questions: [] },
    { ...valid, questions: [{ ...valid.questions[0], options: ["a", 2] }] },
    { ...valid, answers: [] },
    { ...valid, durationSeconds: 299 },
    { ...valid, startedAt: 0 },
  ])("rejects additional invalid persisted shapes", (value) => {
    expect(parseExamSession(JSON.stringify(value), 2_000)).toBeNull();
  });
  it("normalizes flags, submitted timing, status, and pass marks", () => {
    const parsed = parseExamSession(JSON.stringify({
      ...valid, flagged: [0, 0, -1, 2], submitted: true, elapsedSeconds: 999,
      saveStatus: "unexpected", passMark: 0,
    }), 2_000)!;
    expect(parsed).toMatchObject({ flagged: [0], elapsedSeconds: 300, saveStatus: "pending", passMark: 1 });
  });
  it("returns null for malformed JSON", () => {
    expect(parseExamSession("{bad", 2_000)).toBeNull();
  });
});
