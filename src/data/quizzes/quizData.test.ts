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
  { topicId: "safety-flares-quiz", fileName: "safetyFlares" },
  { topicId: "safety", fileName: "safety" },
  { topicId: "pilotage", fileName: "pilotage" },
  { topicId: "weather", fileName: "weather" },
  { topicId: "passage-planning", fileName: "passagePlanning" },
] as const;

const EXPECTED_QUESTION_COUNTS: Record<string, number> = {
  "nautical-terms-quiz": 32,
  ropework: 12,
  anchorwork: 12,
  victualling: 16,
  engine: 12,
  rig: 12,
  colregs: 20,
  "lights-signals": 20,
  "safety-mob-quiz": 12,
  "safety-fire-quiz": 8,
  "safety-life-raft-quiz": 10,
  "safety-flares-quiz": 10,
  safety: 24,
  pilotage: 20,
  weather: 21,
  "passage-planning": 30,
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

describe("Ropework taught-to-assessed coverage", () => {
  it("documents meaningful assessment coverage for every knot taught at /ropework", async () => {
    const [{ knots }, { default: questions, ropeworkAssessmentCoverage }] = await Promise.all([
      import("../ropeworkKnots"),
      import("./ropework"),
    ]);
    const questionIds = new Set(questions.map((question) => question.id));

    expect(Object.keys(ropeworkAssessmentCoverage).sort()).toEqual(
      knots.map((knot) => knot.id).sort(),
    );
    for (const knot of knots) {
      const assessedBy = ropeworkAssessmentCoverage[knot.id];
      expect(assessedBy.length, `${knot.name} has no assessment coverage`).toBeGreaterThan(0);
      for (const questionId of assessedBy) {
        expect(questionIds.has(questionId), `${knot.name} references missing question ${questionId}`).toBe(true);
      }
    }
  });

  it("does not assess concepts outside the seven self-contained knot lessons", async () => {
    const { default: questions, ropeworkAssessmentCoverage } = await import("./ropework");
    const cataloguedIds = new Set(Object.values(ropeworkAssessmentCoverage).flat());

    expect([...cataloguedIds].sort()).toEqual(questions.map((question) => question.id).sort());
  });

  it("preserves the reviewed safety qualifications and excludes removed untaught handling advice", async () => {
    const { default: questions } = await import("./ropework");
    const byId = new Map(questions.map((question) => [question.id, question]));
    const correctOption = (id: string) => {
      const question = byId.get(id);
      expect(question, `Missing safety-critical question ${id}`).toBeDefined();
      return question!.options[question!.correctAnswer];
    };
    const assessmentCopy = questions
      .flatMap((question) => [question.question, ...question.options, question.explanation])
      .join(" ");

    expect(byId.get("r1")?.correctAnswer).toBe(1);
    expect(correctOption("r1")).toContain("backup protection against cyclic slack loading");
    expect(correctOption("r1")).toContain("must release under load");
    expect(byId.get("r1")?.explanation).toContain("cyclic loading or shaking while slack can work it loose");
    expect(byId.get("r1")?.explanation).toContain("cannot be released while loaded");

    expect(byId.get("r2")?.correctAnswer).toBe(2);
    expect(correctOption("r2")).toContain("fender attachment");
    expect(correctOption("r2")).toContain("can bind after heavy loading");
    expect(byId.get("r2")?.explanation).toContain("not a sole critical mooring attachment");
    expect(byId.get("r2")?.explanation).toContain("does not guarantee ready release");

    expect(byId.get("r5")?.correctAnswer).toBe(1);
    expect(correctOption("r5")).toBe("Reef Knot");
    expect(byId.get("r5")?.explanation).toContain("binding knot");
    expect(byId.get("r5")?.explanation).toContain("can spill, capsize, or pull undone");

    expect(byId.get("r6")?.correctAnswer).toBe(1);
    expect(correctOption("r6")).toContain("round turn controlling the strain");
    expect(correctOption("r6")).toContain("two same-direction half hitches");
    expect(byId.get("r6")?.explanation).toContain("can tighten or jam after heavy or sustained loading");
    expect(byId.get("r6")?.explanation).toContain("not a promise of ready release under load");

    expect(assessmentCopy).not.toMatch(
      /coil|flak(?:e|ing)|clockwise|counterclockwise|rope lay|laid rope|braided line|heat|thermal|melt|seal(?:ing)?|hot knife|flame|burn|fume|ventilat|synthetic (?:fibre|fiber|rope)|whip(?:ping)?|cleat|locking turn/i,
    );
  });
});

describe("MOB safety guidance", () => {
  it("preserves context-dependent recovery, distress and casualty-handling safeguards", async () => {
    const { default: questions } = await import("./safetyMob");
    const byId = new Map(questions.map((question) => [question.id, question]));
    const correctOption = (id: string) => {
      const question = byId.get(id);
      expect(question, `Missing safety-critical question ${id}`).toBeDefined();
      return question!.options[question!.correctAnswer];
    };
    const copyFor = (...ids: string[]) =>
      ids.flatMap((id) => {
        const question = byId.get(id)!;
        return [question.question, ...question.options, question.explanation];
      }).join(" ");

    expect(correctOption("mob2")).toMatch(/vessel, rig, wind and sea state/i);
    expect(byId.get("mob2")?.explanation).toMatch(/abort early/i);
    expect(byId.get("mob2")?.explanation).toMatch(/neutral or stop the engine/i);
    expect(copyFor("mob2")).not.toMatch(/casualty (?:is|on your) (?:the )?leeward side/i);

    expect(correctOption("mob4")).toBe("Returning to a casualty in open water/fog");
    expect(byId.get("mob4")?.explanation).toMatch(/not a universal small-craft response/i);
    expect(byId.get("mob4")?.explanation).toMatch(/vessel handling, sea room, traffic and conditions/i);
    expect(byId.get("mob4")?.explanation).not.toMatch(/brings the vessel back exactly/i);
    expect(correctOption("mob9")).toMatch(/vessel- and condition-dependent/i);
    expect(byId.get("mob9")?.explanation).toMatch(/not an exact guarantee for every craft/i);
    expect(byId.get("mob9")?.explanation).toMatch(/sea room, traffic and conditions/i);

    expect(correctOption("mob5")).toMatch(/horizontally or near-horizontally/i);
    expect(copyFor("mob5")).not.toMatch(/reflow syndrome|cold blood.*rush/i);

    expect(correctOption("mob8")).toMatch(/DSC distress alert.*Channel 16/i);
    expect(byId.get("mob8")?.explanation).toMatch(/Channel 70.*digital-only/i);

    expect(correctOption("mob12")).toMatch(/assistance required.*other useful information/i);
    expect(byId.get("mob12")?.explanation).toMatch(/MMSI is not universally available/i);
  });

  it("keeps the supporting lesson's MAYDAY opening and sailing return context safe", async () => {
    const { MOB_MAYDAY_VOICE_OPENING, MOB_SAIL_RETURN_GUIDANCE } = await import("../mobGuidance");
    const sailingGuidance = Object.values(MOB_SAIL_RETURN_GUIDANCE).join(" ");

    expect(MOB_MAYDAY_VOICE_OPENING).toEqual([
      "MAYDAY, MAYDAY, MAYDAY",
      "THIS IS YACHT [NAME], [NAME], [NAME]",
    ]);
    expect(MOB_MAYDAY_VOICE_OPENING.join(" ")).not.toMatch(/all stations/i);
    expect(sailingGuidance).toMatch(/one practised return option/i);
    expect(sailingGuidance).toMatch(/vessel, rig, wind, sea state, sea room and recovery plan/i);
    expect(sailingGuidance).not.toMatch(/quickest|5\s*[–-]\s*6 boat lengths/i);
  });
});

describe("Quiz data registry", () => {
  it("should asynchronously load every known topic", async () => {
    // given
    // - the registry module
    const { loadAllQuizTopics } = await import("./index");
    const quizRegistry = await loadAllQuizTopics();

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

  it("should not contain any topic IDs beyond the known ones", async () => {
    // given
    const { topicIds } = await import("./index");
    const knownTopicIds = ALL_TOPIC_FILES.map((t) => t.topicId);

    // when
    const registryKeys = [...topicIds];

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
  rig: ["rg1", "rg2", "rg3", "rg4", "rg5"],
  "safety-mob-quiz": ["mob1", "mob2", "mob3", "mob4", "mob5"],
};

const EXPANDED_TOPICS = [
  { topicId: "ropework", fileName: "ropework" },
  { topicId: "anchorwork", fileName: "anchorwork" },
  { topicId: "victualling", fileName: "victualling" },
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
        const questions: readonly Question[] = mod.default;

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
        const questions: readonly Question[] = mod.default;

        // when
        const firstFiveIds = questions.slice(0, 5).map((q) => q.id);

        // then
        expect(firstFiveIds).toEqual(ORIGINAL_IDS[topicId]);
      });

      it("should have at least 10 questions (AC-1)", async () => {
        // given
        const mod = await import(`./${fileName}.ts`);
        const questions: readonly Question[] = mod.default;

        // then
        expect(questions.length).toBeGreaterThanOrEqual(10);
      });

      it("should have every option with non-empty text", async () => {
        // given
        const mod = await import(`./${fileName}.ts`);
        const questions: readonly Question[] = mod.default;

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
        const questions: readonly Question[] = mod.default;

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
    const questions: readonly Question[] = mod.default;

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
    const questions: readonly Question[] = mod.default;

    // when
    const first = shuffleWithRng([...questions], createSeededRng(1));
    const second = shuffleWithRng([...questions], createSeededRng(2));

    // then
    expect(first).not.toEqual(second);
  });
});

describe("Quiz data topic metadata", () => {
  it("should export topicMeta with title and subtitle for all 13 topics", async () => {
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

/**
 * E1-S6: Comprehensive Safety Quiz — additional structural tests.
 *
 * AC-1: >= 20 questions spanning MOB, fire, life raft, flares, personal safety, gas safety.
 * AC-2: Questions follow the shared Question interface (covered by generic tests above).
 * AC-4: Existing /quiz/safety-mob route backward compatible (sub-quiz IDs unchanged).
 */
describe("E1-S6: Comprehensive Safety Quiz", () => {
  it("should contain at least 20 questions (AC-1)", async () => {
    // given
    const mod = await import("./safety.ts");
    const questions: readonly Question[] = mod.default;

    // then
    expect(questions.length).toBeGreaterThanOrEqual(20);
  });

  it("should span all 6 required sub-topics via question ID prefixes (AC-1)", async () => {
    // given
    // - the comprehensive safety quiz
    const mod = await import("./safety.ts");
    const questions: readonly Question[] = mod.default;

    // - the 6 required sub-topic prefixes
    const requiredPrefixes = ["mob", "fire", "raft", "flare", "personal", "gas"];

    // when
    const ids = questions.map((q) => q.id);

    // then
    for (const prefix of requiredPrefixes) {
      const matching = ids.filter((id) => id.startsWith(`safety-${prefix}`));
      expect(
        matching.length,
        `Expected at least one question with prefix "safety-${prefix}", found none`,
      ).toBeGreaterThanOrEqual(1);
    }
  });

  it("should have question IDs that do not collide with sub-quiz IDs (AC-4 backward compat)", async () => {
    // given
    // - the comprehensive safety quiz
    const safetyMod = await import("./safety.ts");
    const safetyQuestions: readonly Question[] = safetyMod.default;

    // - existing sub-quiz files
    const mobMod = await import("./safetyMob.ts");
    const fireMod = await import("./safetyFire.ts");
    const raftMod = await import("./safetyLifeRaft.ts");
    const flareMod = await import("./safetyFlares.ts");

    const subQuizIds = new Set([
      ...mobMod.default.map((q: Question) => q.id),
      ...fireMod.default.map((q: Question) => q.id),
      ...raftMod.default.map((q: Question) => q.id),
      ...flareMod.default.map((q: Question) => q.id),
    ]);

    // when
    const safetyIds = safetyQuestions.map((q) => q.id);

    // then — no overlap means the sub-quizzes remain independent
    for (const id of safetyIds) {
      expect(subQuizIds.has(id), `Comprehensive safety ID "${id}" collides with a sub-quiz ID`).toBe(false);
    }
  });

  it("should be registered in quizRegistry under key 'safety' (AC-3)", async () => {
    // given
    const { loadQuizTopic } = await import("./index");
    const questions = await loadQuizTopic("safety");

    // then
    expect(Array.isArray(questions)).toBe(true);
    expect(questions.length).toBeGreaterThanOrEqual(20);
  });

  it("should have topicMeta for 'safety' with title and subtitle (AC-3)", async () => {
    // given
    const { topicMeta } = await import("./index");

    // then
    expect(topicMeta).toHaveProperty("safety");
    expect(topicMeta["safety"].title.length).toBeGreaterThan(0);
    expect(topicMeta["safety"].subtitle.length).toBeGreaterThan(0);
  });

  it("should not affect existing safety-mob-quiz registration (AC-4)", async () => {
    // given
    const { loadQuizTopic } = await import("./index");

    // then — existing sub-quizzes still present and unchanged
    expect(await loadQuizTopic("safety-mob-quiz")).toHaveLength(12);
    expect(await loadQuizTopic("safety-fire-quiz")).toHaveLength(8);
    expect(await loadQuizTopic("safety-life-raft-quiz")).toHaveLength(10);
    expect(await loadQuizTopic("safety-flares-quiz")).toHaveLength(10);
  });
});
