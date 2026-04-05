import { describe, expect, it } from "vitest";
import {
  topicRegistry,
  getTopicById,
  getTopicsByParent,
  getTopicsBySyllabusArea,
  getRootTopics,
  getImplementedSyllabusAreas,
  TOTAL_SYLLABUS_AREAS,
  TOPIC_IDS,
} from "./topicRegistry";
import { appRoutes } from "@/app/routes";

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

  it("should preserve all existing progress IDs for backward compatibility (AC-4)", () => {
    // given
    // - all known progress IDs currently used in the codebase
    const existingProgressIds = [
      "nautical-terms",
      "ropework",
      "anchorwork",
      "victualling",
      "engine",
      "rig",
      "rules-of-the-road",
      "navigation",
      "safety",
      "nautical-terms-boat-parts",
      "nautical-terms-sail-controls",
      "nautical-terms-quiz",
      "colregs-theory",
      "lights-theory",
      "colregs",
      "charts-theory",
      "compass-theory",
      "position-theory",
      "safety-mob",
      "safety-flares",
      "safety-flares-drill",
      "safety-personal",
    ];

    // when
    const registryIds = topicRegistry.map((entry) => entry.id);

    // then
    for (const existingId of existingProgressIds) {
      expect(registryIds).toContain(existingId);
    }
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

  it("should cover syllabus areas 1–10 (currently implemented areas)", () => {
    for (let area = 1; area <= 10; area++) {
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
    expect(implemented).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });

  it("should track total syllabus areas as 13", () => {
    expect(TOTAL_SYLLABUS_AREAS).toBe(13);
  });

  it("should have every syllabus area 1–13 covered when all phases are complete", () => {
    // given
    // - this test documents the target coverage
    // - areas 11 (Pilotage), 12 (Meteorology), 13 (Passage Planning) are not yet implemented
    const implemented = getImplementedSyllabusAreas();
    const missingAreas = [];
    for (let area = 1; area <= TOTAL_SYLLABUS_AREAS; area++) {
      if (!implemented.includes(area)) {
        missingAreas.push(area);
      }
    }

    // then - document which areas are still missing
    // When this assertion fails with an empty array, all 13 areas are covered
    expect(missingAreas).toEqual([11, 12, 13]);
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
    const constantValues = new Set(Object.values(TOPIC_IDS));
    const registryIds = topicRegistry.map((entry) => entry.id);

    // then
    for (const id of registryIds) {
      expect(constantValues.has(id)).toBe(true);
    }
  });
});
