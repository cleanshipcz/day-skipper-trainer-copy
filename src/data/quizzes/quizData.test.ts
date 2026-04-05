import { describe, expect, it } from "vitest";
import type { Question } from "./types";

const ALL_TOPIC_FILES = [
  { topicId: "nautical-terms-quiz", fileName: "nauticalTerms" },
  { topicId: "ropework", fileName: "ropework" },
  { topicId: "anchorwork", fileName: "anchorwork" },
  { topicId: "victualling", fileName: "victualling" },
  { topicId: "engine", fileName: "engine" },
  { topicId: "rig", fileName: "rig" },
  { topicId: "colregs", fileName: "colregs" },
  { topicId: "lights-signals", fileName: "lightsSignals" },
  { topicId: "safety-mob-quiz", fileName: "safetyMob" },
  { topicId: "safety-fire-quiz", fileName: "safetyFire" },
  { topicId: "safety-life-raft-quiz", fileName: "safetyLifeRaft" },
] as const;

const EXPECTED_QUESTION_COUNTS: Record<string, number> = {
  "nautical-terms-quiz": 20,
  ropework: 12,
  anchorwork: 12,
  victualling: 12,
  engine: 12,
  rig: 12,
  colregs: 20,
  "lights-signals": 20,
  "safety-mob-quiz": 12,
  "safety-fire-quiz": 8,
  "safety-life-raft-quiz": 10,
};

describe("Quiz data files", () => {
  describe.each(ALL_TOPIC_FILES)(
    "$fileName ($topicId)",
    ({ topicId, fileName }) => {
      let questions: Question[];

      it("should export a non-empty questions array as default export", async () => {
        // given
        // - the data file for this topic
        const mod = await import(`./${fileName}.ts`);

        // when
        questions = mod.default;

        // then
        expect(Array.isArray(questions)).toBe(true);
        expect(questions.length).toBeGreaterThan(0);
      });

      it("should preserve exact question count from original Quiz.tsx", async () => {
        // given
        // - the data file loaded
        const mod = await import(`./${fileName}.ts`);
        questions = mod.default;

        // then
        expect(questions.length).toBe(EXPECTED_QUESTION_COUNTS[topicId]);
      });

      it("should have valid Question shape for every question", async () => {
        // given
        // - the data file loaded
        const mod = await import(`./${fileName}.ts`);
        questions = mod.default;

        // then
        for (const q of questions) {
          expect(q).toHaveProperty("id");
          expect(typeof q.id).toBe("string");
          expect(q.id.length).toBeGreaterThan(0);

          expect(q).toHaveProperty("question");
          expect(typeof q.question).toBe("string");

          expect(q).toHaveProperty("options");
          expect(Array.isArray(q.options)).toBe(true);
          expect(q.options.length).toBeGreaterThanOrEqual(2);

          expect(q).toHaveProperty("correctAnswer");
          expect(typeof q.correctAnswer).toBe("number");
          expect(q.correctAnswer).toBeGreaterThanOrEqual(0);
          expect(q.correctAnswer).toBeLessThan(q.options.length);

          expect(q).toHaveProperty("explanation");
          expect(typeof q.explanation).toBe("string");
        }
      });

      it("should have unique question IDs", async () => {
        // given
        // - the data file loaded
        const mod = await import(`./${fileName}.ts`);
        questions = mod.default;

        // when
        const ids = questions.map((q: Question) => q.id);
        const uniqueIds = new Set(ids);

        // then
        expect(uniqueIds.size).toBe(ids.length);
      });
    },
  );
});

describe("Quiz data registry", () => {
  it("should export a quizRegistry mapping all 9 topic IDs to question arrays", async () => {
    // given
    // - the registry module
    const { quizRegistry } = await import("./index");

    // then
    expect(quizRegistry).toBeDefined();
    expect(typeof quizRegistry).toBe("object");

    for (const { topicId } of ALL_TOPIC_FILES) {
      expect(quizRegistry).toHaveProperty(topicId);
      expect(Array.isArray(quizRegistry[topicId])).toBe(true);
      expect(quizRegistry[topicId].length).toBe(
        EXPECTED_QUESTION_COUNTS[topicId],
      );
    }
  });

  it("should not contain any topic IDs beyond the 9 known ones", async () => {
    // given
    const { quizRegistry } = await import("./index");
    const knownTopicIds = ALL_TOPIC_FILES.map((t) => t.topicId);

    // when
    const registryKeys = Object.keys(quizRegistry);

    // then
    expect(registryKeys.sort()).toEqual([...knownTopicIds].sort());
  });
});

/**
 * E0-S2 AC-5: Existing quiz scores are not invalidated — new questions append, don't replace.
 * We verify that the original question IDs from E0-S1 are still present in each expanded topic.
 */
const ORIGINAL_IDS: Record<string, readonly string[]> = {
  ropework: ["r1", "r2", "r3", "r4", "r5"],
  anchorwork: ["a1", "a2", "a3", "a4", "a5"],
  victualling: ["v1", "v2", "v3", "v4", "v5"],
  engine: ["e1", "e2", "e3", "e4", "e5"],
  rig: ["rg1", "rg2", "rg3", "rg4", "rg5"],
  "safety-mob-quiz": ["mob1", "mob2", "mob3", "mob4", "mob5"],
};

const EXPANDED_TOPICS = [
  { topicId: "ropework", fileName: "ropework" },
  { topicId: "anchorwork", fileName: "anchorwork" },
  { topicId: "victualling", fileName: "victualling" },
  { topicId: "engine", fileName: "engine" },
  { topicId: "rig", fileName: "rig" },
  { topicId: "safety-mob-quiz", fileName: "safetyMob" },
] as const;

describe("E0-S2: Expanded quiz backward compatibility", () => {
  describe.each(EXPANDED_TOPICS)(
    "$fileName ($topicId)",
    ({ topicId, fileName }) => {
      it("should still contain all original question IDs from E0-S1", async () => {
        // given
        // - the expanded data file for this topic
        const mod = await import(`./${fileName}.ts`);
        const questions: Question[] = mod.default;

        // when
        const ids = questions.map((q) => q.id);

        // then
        for (const originalId of ORIGINAL_IDS[topicId]) {
          expect(ids).toContain(originalId);
        }
      });

      it("should have original questions in the same order at the start", async () => {
        // given
        // - the expanded data file for this topic
        const mod = await import(`./${fileName}.ts`);
        const questions: Question[] = mod.default;

        // when
        const firstFiveIds = questions.slice(0, 5).map((q) => q.id);

        // then
        expect(firstFiveIds).toEqual(ORIGINAL_IDS[topicId]);
      });

      it("should have at least 10 questions (AC-1)", async () => {
        // given
        const mod = await import(`./${fileName}.ts`);
        const questions: Question[] = mod.default;

        // then
        expect(questions.length).toBeGreaterThanOrEqual(10);
      });

      it("should have every option with non-empty text", async () => {
        // given
        const mod = await import(`./${fileName}.ts`);
        const questions: Question[] = mod.default;

        // then
        for (const q of questions) {
          for (const opt of q.options) {
            expect(opt.trim().length).toBeGreaterThan(0);
          }
        }
      });

      it("should have non-empty explanation for every question", async () => {
        // given
        const mod = await import(`./${fileName}.ts`);
        const questions: Question[] = mod.default;

        // then
        for (const q of questions) {
          expect(q.explanation.trim().length).toBeGreaterThan(0);
        }
      });
    },
  );
});

describe("E0-S2 AC-4: Randomization works with expanded pools", () => {
  it("should produce deterministic shuffles with 12-question pools", async () => {
    // given
    // - randomization utilities
    const { createSeededRng, shuffleWithRng } = await import(
      "../../features/quiz/randomization"
    );
    // - a 12-question pool
    const mod = await import("./victualling.ts");
    const questions: Question[] = mod.default;

    // when
    const first = shuffleWithRng([...questions], createSeededRng(42));
    const second = shuffleWithRng([...questions], createSeededRng(42));

    // then
    expect(first).toEqual(second);
    expect(first.length).toBe(questions.length);
  });

  it("should produce different orders with different seeds on 12-question pools", async () => {
    // given
    const { createSeededRng, shuffleWithRng } = await import(
      "../../features/quiz/randomization"
    );
    const mod = await import("./engine.ts");
    const questions: Question[] = mod.default;

    // when
    const first = shuffleWithRng([...questions], createSeededRng(1));
    const second = shuffleWithRng([...questions], createSeededRng(2));

    // then
    expect(first).not.toEqual(second);
  });
});

describe("Quiz data topic metadata", () => {
  it("should export topicMeta with title and subtitle for all 9 topics", async () => {
    // given
    const { topicMeta } = await import("./index");

    // then
    expect(topicMeta).toBeDefined();

    for (const { topicId } of ALL_TOPIC_FILES) {
      expect(topicMeta).toHaveProperty(topicId);
      expect(typeof topicMeta[topicId].title).toBe("string");
      expect(topicMeta[topicId].title.length).toBeGreaterThan(0);
      expect(typeof topicMeta[topicId].subtitle).toBe("string");
      expect(topicMeta[topicId].subtitle.length).toBeGreaterThan(0);
    }
  });
});
