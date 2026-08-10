import { describe, expect, it } from "vitest";
import {
  topicRegistry,
  getTopicById,
  getTopicsByParent,
  getTopicsBySyllabusArea,
  getRootTopics,
  getImplementedSyllabusAreas,
  resolveQuizParentDestination,
  TOTAL_SYLLABUS_AREAS,
  TOPIC_IDS,
} from "./topicRegistry";
import { appRoutes } from "@/app/routes";
import { topicIds, topicMeta } from "@/data/quizzes";
import { DURABLE_PROGRESS_IDS } from "./durableProgressIds";
import type { TopicEntry } from "./topicRegistry";

// ── Helpers ──────────────────────────────────────────────────────────────

/**
 * Checks whether a concrete route path (e.g. "/quiz/colregs") matches a
 * route definition path which may contain parameters (e.g. "/quiz/:topicId").
 */
const routeMatches = (definitionPath: string, concretePath: string): boolean => {
  if (definitionPath === concretePath) return true;

  const defSegments = definitionPath.split("/");
  const concreteSegments = concretePath.split("/");
  if (defSegments.length !== concreteSegments.length) return false;

  return defSegments.every(
    (seg, i) => seg.startsWith(":") || seg === concreteSegments[i],
  );
};

// ── Registry structure ───────────────────────────────────────────────────

describe("topicRegistry", () => {
  it("should export a non-empty readonly array of TopicEntry objects", () => {
    expect(topicRegistry).toBeDefined();
    expect(Array.isArray(topicRegistry)).toBe(true);
    expect(topicRegistry.length).toBeGreaterThan(0);
  });

  it("should have unique ids across all entries", () => {
    // given
    const ids = topicRegistry.map((entry) => entry.id);

    // when
    const unique = new Set(ids);

    // then
    expect(unique.size).toBe(ids.length);
  });

  it("should define every topic with required fields", () => {
    for (const entry of topicRegistry) {
      expect(typeof entry.id).toBe("string");
      expect(entry.id.length).toBeGreaterThan(0);
      expect(typeof entry.label).toBe("string");
      expect(entry.label.length).toBeGreaterThan(0);
      expect(typeof entry.route).toBe("string");
      expect(entry.route.startsWith("/")).toBe(true);
      expect(Array.isArray(entry.submoduleIds)).toBe(true);
      expect(typeof entry.syllabusArea).toBe("number");
      expect(entry.syllabusArea).toBeGreaterThanOrEqual(1);
      expect(entry.syllabusArea).toBeLessThanOrEqual(TOTAL_SYLLABUS_AREAS);

      // parentId is nullable
      if (entry.parentId !== null) {
        expect(typeof entry.parentId).toBe("string");
      }

      // quizRoute is nullable
      if (entry.quizRoute !== null) {
        expect(typeof entry.quizRoute).toBe("string");
        expect(entry.quizRoute.startsWith("/quiz/")).toBe(true);
      }
    }
  });

  it("matches the complete durable progress ID compatibility snapshot (AC-4)", () => {
    expect(topicRegistry.map(({ id }) => id).sort()).toEqual([...DURABLE_PROGRESS_IDS].sort());
    expect(new Set(DURABLE_PROGRESS_IDS).size).toBe(50);
  });

  it("should have valid parentId references (every parentId must reference an existing topic)", () => {
    // given
    const ids = new Set(topicRegistry.map((entry) => entry.id));

    // then
    for (const entry of topicRegistry) {
      if (entry.parentId !== null) {
        expect(ids.has(entry.parentId)).toBe(true);
      }
    }
  });

  it("should have valid submoduleIds references (each submoduleId must reference an existing topic)", () => {
    // given
    const ids = new Set(topicRegistry.map((entry) => entry.id));

    // then
    for (const entry of topicRegistry) {
      for (const subId of entry.submoduleIds) {
        expect(ids.has(subId)).toBe(true);
      }
    }
  });

  it("should have submoduleIds that match children with that parentId", () => {
    for (const entry of topicRegistry) {
      if (entry.submoduleIds.length > 0) {
        // given
        // - a topic that declares submodule IDs
        const childIds = topicRegistry
          .filter((t) => t.parentId === entry.id)
          .map((c) => c.id);

        // then - every declared submoduleId should be a child of the parent
        for (const subId of entry.submoduleIds) {
          expect(childIds).toContain(subId);
        }
      }
    }
  });
});

// ── Syllabus coverage (AC-6) ─────────────────────────────────────────────

describe("topicRegistry — syllabus coverage (AC-6)", () => {
  it("should have every registry entry with a route matching a route definition in routes.tsx", () => {
    // given
    const routeDefinitionPaths = appRoutes.map((r) => r.path);

    // when / then
    for (const entry of topicRegistry) {
      const hasMatch = routeDefinitionPaths.some((defPath) =>
        routeMatches(defPath, entry.route),
      );
      expect(hasMatch).toBe(true);
    }
  });

  it("keeps every registered quiz route backed by questions and metadata", () => {
    const quizTopicIds = new Set<string>(topicIds);

    for (const entry of topicRegistry) {
      if (entry.quizRoute) {
        expect(quizTopicIds.has(entry.quizRoute.replace("/quiz/", ""))).toBe(true);
      }
    }
    expect(Object.keys(topicMeta).sort()).toEqual([...topicIds].sort());
    const reachableQuizIds = new Set(
      topicRegistry
        .flatMap(({ quizRoute }) => quizRoute ? [quizRoute.replace("/quiz/", "")] : []),
    );
    expect([...quizTopicIds].filter((id) => !reachableQuizIds.has(id))).toEqual([]);
  });

  it("keeps every dashboard root reachable with a unique concrete route", () => {
    const roots = getRootTopics();
    const rootRoutes = roots.map(({ route }) => route);

    expect(roots).toHaveLength(12);
    expect(new Set(rootRoutes).size).toBe(rootRoutes.length);
    for (const route of rootRoutes) {
      expect(appRoutes.some(({ path }) => path === route)).toBe(true);
    }
  });

  it("should cover syllabus areas 1–11 (currently implemented areas)", () => {
    for (let area = 1; area <= 11; area++) {
      // given
      const topicsInArea = topicRegistry.filter((t) => t.syllabusArea === area);

      // then
      expect(topicsInArea.length).toBeGreaterThanOrEqual(1);
    }
  });

  it("should report implemented syllabus areas accurately", () => {
    // when
    const implemented = getImplementedSyllabusAreas();

    // then
    expect(implemented).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]);
  });

  it("should track total syllabus areas as 13", () => {
    expect(TOTAL_SYLLABUS_AREAS).toBe(13);
  });

  it("should have every syllabus area 1–13 covered when all phases are complete", () => {
    // given
    // - this test documents the target coverage
    // - all areas, including Passage Planning, are now implemented
    const implemented = getImplementedSyllabusAreas();
    const missingAreas = [];
    for (let area = 1; area <= TOTAL_SYLLABUS_AREAS; area++) {
      if (!implemented.includes(area)) {
        missingAreas.push(area);
      }
    }

    // then
    expect(missingAreas).toEqual([]);
  });
});

// ── Lookup helpers ───────────────────────────────────────────────────────

describe("getTopicById", () => {
  it("should return the topic when it exists", () => {
    // given
    const knownId = topicRegistry[0].id;

    // when
    const result = getTopicById(knownId);

    // then
    expect(result).toBeDefined();
    expect(result!.id).toBe(knownId);
  });

  it("should return undefined for unknown id", () => {
    // when
    const result = getTopicById("non-existent-topic-xyz");

    // then
    expect(result).toBeUndefined();
  });
});

describe("getTopicsByParent", () => {
  it("should return child topics for a given parent id", () => {
    // given
    // - a parent topic with submodules
    const parent = topicRegistry.find((t) => t.submoduleIds.length > 0);
    expect(parent).toBeDefined();

    // when
    const children = getTopicsByParent(parent!.id);

    // then
    expect(children.length).toBe(parent!.submoduleIds.length);
    for (const child of children) {
      expect(child.parentId).toBe(parent!.id);
    }
  });

  it("should return empty array for topic with no children", () => {
    // given
    // - a leaf topic with no submodules
    const leaf = topicRegistry.find((t) => t.submoduleIds.length === 0 && t.parentId !== null);
    expect(leaf).toBeDefined();

    // when
    const children = getTopicsByParent(leaf!.id);

    // then
    expect(children).toEqual([]);
  });
});

describe("getTopicsBySyllabusArea", () => {
  it("should return all topics for a given syllabus area", () => {
    // given
    const area = topicRegistry[0].syllabusArea;

    // when
    const topics = getTopicsBySyllabusArea(area);

    // then
    expect(topics.length).toBeGreaterThan(0);
    for (const topic of topics) {
      expect(topic.syllabusArea).toBe(area);
    }
  });

  it("should return empty array for out-of-range area", () => {
    // when
    const topics = getTopicsBySyllabusArea(99);

    // then
    expect(topics).toEqual([]);
  });
});

describe("getRootTopics", () => {
  it("should return only topics with null parentId", () => {
    // when
    const roots = getRootTopics();

    // then
    expect(roots.length).toBeGreaterThan(0);
    for (const root of roots) {
      expect(root.parentId).toBeNull();
    }
  });

  it("should include all dashboard-level topics", () => {
    // given
    // - these are the current root-level topics displayed on the dashboard
    const expectedRootIds = [
      "nautical-terms",
      "ropework",
      "anchorwork",
      "victualling",
      "engine",
      "rig",
      "rules-of-the-road",
      "navigation",
      "pilotage",
      "safety",
    ];

    // when
    const roots = getRootTopics();
    const rootIds = roots.map((r) => r.id);

    // then
    for (const id of expectedRootIds) {
      expect(rootIds).toContain(id);
    }
  });
});

// ── E1-S7: Safety sub-module completeness ──────────────────────────────

describe("topicRegistry — safety sub-modules (E1-S7)", () => {
  it("should have the safety root topic with all 6 sub-module IDs", () => {
    // given
    const safetyRoot = getTopicById("safety");

    // then
    expect(safetyRoot).toBeDefined();
    expect(safetyRoot!.submoduleIds).toContain("safety-mob");
    expect(safetyRoot!.submoduleIds).toContain("safety-fire");
    expect(safetyRoot!.submoduleIds).toContain("safety-life-raft");
    expect(safetyRoot!.submoduleIds).toContain("safety-flares");
    expect(safetyRoot!.submoduleIds).toContain("safety-personal");
    expect(safetyRoot!.submoduleIds).toContain("safety-gas");
    expect(safetyRoot!.submoduleIds).toHaveLength(6);
  });

  it("should have a safety-personal topic entry with correct metadata", () => {
    // when
    const topic = getTopicById("safety-personal");

    // then
    expect(topic).toBeDefined();
    expect(topic!.label).toBe("Personal Safety Equipment");
    expect(topic!.parentId).toBe("safety");
    expect(topic!.route).toBe("/safety/personal");
    expect(topic!.syllabusArea).toBe(4);
  });

  it("should have a safety-gas topic entry with correct metadata", () => {
    // when
    const topic = getTopicById("safety-gas");

    // then
    expect(topic).toBeDefined();
    expect(topic!.label).toBe("Gas Safety");
    expect(topic!.parentId).toBe("safety");
    expect(topic!.route).toBe("/safety/gas");
    expect(topic!.syllabusArea).toBe(4);
  });

  it("should include TOPIC_IDS constants for new safety sub-modules", () => {
    expect(TOPIC_IDS.SAFETY_PERSONAL).toBe("safety-personal");
    expect(TOPIC_IDS.SAFETY_GAS).toBe("safety-gas");
  });
});

describe("TOPIC_IDS", () => {
  it("should have every value corresponding to a topic in the registry", () => {
    // given
    const registryIds = new Set(topicRegistry.map((entry) => entry.id));

    // then
    for (const value of Object.values(TOPIC_IDS)) {
      expect(registryIds.has(value)).toBe(true);
    }
  });

  it("should cover every topic in the registry", () => {
    // given
    const constantValues = new Set<string>(Object.values(TOPIC_IDS));
    const registryIds = topicRegistry.map((entry) => entry.id);

    // then
    for (const id of registryIds) {
      expect(constantValues.has(id)).toBe(true);
    }
  });
});

describe("quiz parent destinations", () => {
  it("returns the registered owning module for direct, nested, and legacy quiz topics", () => {
    expect(resolveQuizParentDestination("nautical-terms-quiz")).toEqual({ route: "/nautical-terms", label: "Nautical Terms & Boat Parts" });
    expect(resolveQuizParentDestination("lights-signals")).toEqual({ route: "/rules/lights", label: "Lights & Signals Theory" });
    expect(resolveQuizParentDestination("colregs")).toEqual({ route: "/rules-of-the-road", label: "Rules of the Road" });
    expect(resolveQuizParentDestination("ropework")).toEqual({ route: "/ropework", label: "Ropework & Knots" });
  });

  it("falls back safely for standalone, unknown, and malformed deep links", () => {
    expect(resolveQuizParentDestination("standalone-topic")).toEqual({ route: "/", label: "Home" });
    expect(resolveQuizParentDestination("../nautical-terms")).toEqual({ route: "/", label: "Home" });
    expect(resolveQuizParentDestination("")).toEqual({ route: "/", label: "Home" });
  });

  it("maps every registered quiz ID to its explicit owning parent route", () => {
    const expectedRoutes: Record<string, string> = {
      "nautical-terms-quiz": "/nautical-terms",
      victualling: "/victualling",
      engine: "/engine",
      rig: "/rig",
      ropework: "/ropework",
      anchorwork: "/anchorwork",
      safety: "/safety",
      "safety-mob-quiz": "/safety/mob",
      "safety-fire-quiz": "/safety/fire",
      "safety-life-raft-quiz": "/safety/life-raft",
      "safety-flares-quiz": "/safety/flares",
      colregs: "/rules-of-the-road",
      "lights-signals": "/rules/lights",
      pilotage: "/pilotage",
      weather: "/weather",
      "passage-planning": "/passage-planning",
    };
    const registeredQuizIds = new Set(topicRegistry.flatMap(({ quizRoute }) => quizRoute ? [quizRoute.replace("/quiz/", "")] : []));

    expect(new Set(Object.keys(expectedRoutes))).toEqual(registeredQuizIds);
    for (const [quizTopicId, expectedRoute] of Object.entries(expectedRoutes)) {
      expect(resolveQuizParentDestination(quizTopicId).route).toBe(expectedRoute);
    }
  });

  it("resolves a quiz-only registry leaf through its registered parent", () => {
    const mutableRegistry = topicRegistry as TopicEntry[];
    const quizOnlyLeaf: TopicEntry = {
      id: "synthetic-quiz-leaf",
      label: "Synthetic Quiz",
      parentId: "safety",
      route: "/quiz/synthetic-quiz-leaf",
      quizRoute: "/quiz/synthetic-quiz-leaf",
      submoduleIds: [],
      syllabusArea: 4,
    };
    mutableRegistry.push(quizOnlyLeaf);
    try {
      expect(resolveQuizParentDestination("synthetic-quiz-leaf")).toEqual({ route: "/safety", label: "Safety Procedures" });
    } finally {
      mutableRegistry.pop();
    }
  });

  it.each([
    [null, "a quiz-only leaf without a parent"],
    ["missing-parent", "a quiz-only leaf whose parent is absent"],
  ])("falls back for %s", (parentId) => {
    const mutableRegistry = topicRegistry as TopicEntry[];
    const quizOnlyLeaf: TopicEntry = {
      id: "synthetic-orphan-quiz",
      label: "Synthetic Orphan Quiz",
      parentId,
      route: "/quiz/synthetic-orphan-quiz",
      quizRoute: "/quiz/synthetic-orphan-quiz",
      submoduleIds: [],
      syllabusArea: 13,
    };
    mutableRegistry.push(quizOnlyLeaf);
    try {
      expect(resolveQuizParentDestination("synthetic-orphan-quiz")).toEqual({ route: "/", label: "Home" });
    } finally {
      mutableRegistry.pop();
    }
  });
});
