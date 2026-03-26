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
] as const;

const EXPECTED_QUESTION_COUNTS: Record<string, number> = {
  "nautical-terms-quiz": 20,
  ropework: 5,
  anchorwork: 5,
  victualling: 5,
  engine: 5,
  rig: 5,
  colregs: 20,
  "lights-signals": 20,
  "safety-mob-quiz": 5,
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
