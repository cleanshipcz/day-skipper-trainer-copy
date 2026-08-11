import { describe, expect, it, vi } from "vitest";
import type { Question } from "@/data/quizzes/types";
import {
  ANONYMOUS_QUIZ_SESSION_MAX_AGE_MS, anonymousQuizSessionKey, buildQuizSessionProgress,
  clearAnonymousQuizSession, createEmptyQuizAnswers, parseCompletedQuizSession, parseSavedQuizSession,
  isCurrentCompletedQuizCatalogue,
  persistQuizSessionProgress, restoreAnonymousQuizSession, saveAnonymousQuizSession,
} from "./sessionProgress";

const question = (id: string, options = ["Wrong", "Right"]): Question => ({
  id, question: `${id}?`, options, correctAnswer: 1, explanation: "Because.",
});
const catalogue = [question("q1"), question("q2", ["No", "Yes", "Maybe"])] as const;

describe("quiz session progress helpers", () => {
  it("creates empty answers arrays", () => {
    expect(createEmptyQuizAnswers(3)).toEqual([null, null, null]);
  });

  it("persists stable question and option identities", () => {
    expect(buildQuizSessionProgress([1, 2], 1, catalogue)).toMatchObject({
      version: 3,
      answers: [{ questionId: "q1", optionId: "Right" }, { questionId: "q2", optionId: "Maybe" }],
      currentQuestionId: "q2",
    });
  });

  it("restores completed answer evidence for result review without treating it as an active session", () => {
    const completed = { ...buildQuizSessionProgress([1, 0], 1, catalogue), completed: true };
    expect(parseSavedQuizSession(completed, catalogue)).toBeNull();
    expect(parseCompletedQuizSession(completed, catalogue)).toEqual({ answers: [1, 0], currentQuestion: 1 });
  });

  it("restores answers after question and option reorder", () => {
    const saved = buildQuizSessionProgress([1, 2], 1, catalogue);
    const reordered = [question("q2", ["Maybe", "No", "Yes"]), question("q1", ["Right", "Wrong"])] as const;
    expect(parseSavedQuizSession(saved, reordered)).toEqual({ answers: [0, 0], currentQuestion: 0 });
  });

  it("restores version 2 current answers as tentative rather than assessed", () => {
    const saved = { ...buildQuizSessionProgress([1, 2], 1, catalogue), version: 2 };

    expect(parseSavedQuizSession(saved, catalogue)).toEqual({
      answers: [1, null],
      currentQuestion: 1,
      tentativeAnswer: 2,
    });
  });

  it("recovers safely when questions are added or removed", () => {
    const saved = buildQuizSessionProgress([1, 1], 1, catalogue);
    expect(parseSavedQuizSession(saved, [question("new"), question("q1")])).toEqual({ answers: [null, 1], currentQuestion: 0 });
    expect(parseSavedQuizSession(saved, [question("q1")])).toEqual({ answers: [1], currentQuestion: 0 });
  });

  it.each([-1, 0.5, 2, Number.NaN])("rejects invalid answer index %s before persistence", (answer) => {
    expect(() => buildQuizSessionProgress([answer, null], 0, catalogue)).toThrow("invalid quiz answer");
  });

  it.each([-1, 0.5, 2, Number.NaN])("rejects invalid current question %s", (currentQuestion) => {
    expect(() => buildQuizSessionProgress([null, null], currentQuestion, catalogue)).toThrow("invalid quiz session");
  });

  it("rejects duplicate question and option identities", () => {
    expect(parseSavedQuizSession({ version: 2, catalogueVersion: "x", answers: [], currentQuestionId: "q1" }, [question("q1"), question("q1")])).toBeNull();
    expect(parseSavedQuizSession({ version: 2, catalogueVersion: "x", answers: [], currentQuestionId: "q1" }, [question("q1", ["Same", "Same"])] )).toBeNull();
    expect(parseSavedQuizSession({ version: 2, catalogueVersion: "x", answers: [{ questionId: "q1", optionId: null }, { questionId: "q1", optionId: null }], currentQuestionId: "q1" }, [question("q1")])).toBeNull();
  });

  it.each([
    undefined,
    null,
    [],
    { version: 2, catalogueVersion: "x", answers: "bad", currentQuestionId: "q1" },
    { version: 2, catalogueVersion: "x", answers: [null], currentQuestionId: "q1" },
    { version: 2, catalogueVersion: "x", answers: [{ questionId: 1, optionId: null }], currentQuestionId: "q1" },
    { version: 2, catalogueVersion: "x", answers: [{ questionId: "q1", optionId: 1 }], currentQuestionId: "q1" },
  ])("rejects malformed payload %#", (raw) => {
    expect(parseSavedQuizSession(raw as never, catalogue)).toBeNull();
  });

  it("does not restore or overwrite completed records", () => {
    const saved = buildQuizSessionProgress([1, 1], 1, catalogue);
    expect(parseSavedQuizSession(saved, catalogue, true)).toBeNull();
    expect(parseSavedQuizSession({ ...saved, completed: true }, catalogue)).toBeNull();
  });

  it("validates completed catalogue identity without restoring its answers", () => {
    const saved = buildQuizSessionProgress([1, 2], 1, catalogue);
    expect(isCurrentCompletedQuizCatalogue(saved, catalogue)).toBe(true);
    expect(isCurrentCompletedQuizCatalogue({ ...saved, catalogueVersion: "retired" }, catalogue)).toBe(false);
    expect(isCurrentCompletedQuizCatalogue(saved, [question("replacement")])).toBe(false);
    expect(parseSavedQuizSession(saved, catalogue, true)).toBeNull();
  });

  it("migrates only identity-safe unanswered legacy sessions", () => {
    expect(parseSavedQuizSession({ answers: [null, null], currentQuestion: 1 }, catalogue)).toEqual({ answers: [null, null], currentQuestion: 1 });
    expect(parseSavedQuizSession({ answers: [1, null], currentQuestion: 1 }, catalogue)).toBeNull();
    expect(parseSavedQuizSession({ answers: [null], currentQuestion: 0 }, catalogue)).toBeNull();
    expect(parseSavedQuizSession({ answers: [null, null], currentQuestion: -1 }, catalogue)).toBeNull();
  });

  it("clears an answer whose saved option identity no longer exists", () => {
    const saved = buildQuizSessionProgress([1, null], 0, catalogue);
    expect(parseSavedQuizSession(saved, [question("q1", ["Wrong", "Changed"]), catalogue[1]])).toEqual({ answers: [null, null], currentQuestion: 0 });
  });

  it("persists authenticated identity payloads using the canonical key", async () => {
    const saveProgress = vi.fn();
    const progress = buildQuizSessionProgress([1, null], 0, catalogue);
    await persistQuizSessionProgress({ isAuthenticated: true, topicKey: "engine", saveProgress, progress });
    expect(saveProgress).toHaveBeenCalledWith("quiz-engine", false, 0, 0, progress);
  });

  it.each([
    [false, "failed"],
    ["failed", "failed"],
    ["queued", "queued"],
    [true, "saved"],
  ])("reports persistence result %s as %s", async (saveResult, expected) => {
    const result = await persistQuizSessionProgress({
      isAuthenticated: true,
      topicKey: "engine",
      saveProgress: vi.fn().mockResolvedValue(saveResult),
      progress: buildQuizSessionProgress([1, null], 0, catalogue),
    });
    expect(result).toBe(expected);
  });

  it("turns rejected persistence into a recoverable failure", async () => {
    const result = await persistQuizSessionProgress({
      isAuthenticated: true,
      topicKey: "engine",
      saveProgress: vi.fn().mockRejectedValue(new Error("offline")),
      progress: buildQuizSessionProgress([1, null], 0, catalogue),
    });
    expect(result).toBe("failed");
  });

  it("skips persistence for anonymous users", async () => {
    const saveProgress = vi.fn();
    await persistQuizSessionProgress({ isAuthenticated: false, topicKey: "engine", saveProgress, progress: buildQuizSessionProgress([null, null], 0, catalogue) });
    expect(saveProgress).not.toHaveBeenCalled();
  });

  it("resumes anonymous identity-safe progress after reload and refreshes a short expiry", () => {
    sessionStorage.clear();
    const progress = buildQuizSessionProgress([1, null], 1, catalogue);
    expect(saveAnonymousQuizSession(sessionStorage, "engine", progress, 1_000)).toEqual({ ok: true });
    expect(restoreAnonymousQuizSession(sessionStorage, "engine", catalogue, 1_001)).toEqual({
      status: "restored", session: { answers: [1, null], currentQuestion: 1 },
    });
    expect(JSON.parse(sessionStorage.getItem(anonymousQuizSessionKey("engine")) ?? "{}").expiresAt)
      .toBe(1_000 + ANONYMOUS_QUIZ_SESSION_MAX_AGE_MS);
  });

  it("expires and removes anonymous progress", () => {
    sessionStorage.clear();
    saveAnonymousQuizSession(sessionStorage, "engine", buildQuizSessionProgress([1, null], 0, catalogue), 1_000);
    expect(restoreAnonymousQuizSession(sessionStorage, "engine", catalogue, 1_000 + ANONYMOUS_QUIZ_SESSION_MAX_AGE_MS).status).toBe("expired");
    expect(sessionStorage.getItem(anonymousQuizSessionKey("engine"))).toBeNull();
  });

  it.each([
    ["malformed", "{bad", "invalid"],
    ["wrong envelope version", JSON.stringify({ version: 99, expiresAt: Date.now() + 1_000, progress: {} }), "invalid"],
  ])("fails closed for %s anonymous storage", (_label, value, status) => {
    sessionStorage.clear();
    sessionStorage.setItem(anonymousQuizSessionKey("engine"), value);
    expect(restoreAnonymousQuizSession(sessionStorage, "engine", catalogue).status).toBe(status);
  });

  it("removes anonymous progress after catalogue identity changes", () => {
    sessionStorage.clear();
    saveAnonymousQuizSession(sessionStorage, "engine", buildQuizSessionProgress([1, null], 0, catalogue));
    expect(restoreAnonymousQuizSession(sessionStorage, "engine", [question("replacement")]).status).toBe("stale");
    expect(sessionStorage.getItem(anonymousQuizSessionKey("engine"))).toBeNull();
  });

  it("continues safely when session storage is denied or over quota", () => {
    const denied = { setItem: () => { throw new Error("denied"); } } as unknown as Storage;
    const quota = { setItem: () => { throw new DOMException("full", "QuotaExceededError"); } } as unknown as Storage;
    const progress = buildQuizSessionProgress([null, null], 0, catalogue);
    expect(saveAnonymousQuizSession(denied, "engine", progress)).toEqual({ ok: false, reason: "unavailable" });
    expect(saveAnonymousQuizSession(quota, "engine", progress)).toEqual({ ok: false, reason: "quota" });
  });

  it("clears only the requested anonymous topic", () => {
    sessionStorage.clear();
    const progress = buildQuizSessionProgress([null, null], 0, catalogue);
    saveAnonymousQuizSession(sessionStorage, "engine", progress);
    saveAnonymousQuizSession(sessionStorage, "weather", progress);
    clearAnonymousQuizSession(sessionStorage, "engine");
    expect(sessionStorage.getItem(anonymousQuizSessionKey("engine"))).toBeNull();
    expect(sessionStorage.getItem(anonymousQuizSessionKey("weather"))).not.toBeNull();
  });
});
