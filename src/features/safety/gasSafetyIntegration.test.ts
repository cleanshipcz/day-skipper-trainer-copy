/**
 * Integration tests for Gas Safety sub-module wiring.
 *
 * Verifies that the gas safety topic is correctly registered in the
 * topic registry, routes, and safety menu — ensuring the full data flow
 * from navigation to progress tracking.
 *
 * @see docs/FEATURE_TASKS.md — Story E1-S5, AC-2, AC-3
 */
import { describe, expect, it } from "vitest";
import { topicRegistry, TOPIC_IDS, getTopicById } from "@/constants/topicRegistry";
import { appRoutes } from "@/app/routes";

describe("Gas Safety — Topic Registry Integration", () => {
  it("should have SAFETY_GAS defined in TOPIC_IDS", () => {
    // then
    expect(TOPIC_IDS.SAFETY_GAS).toBe("safety-gas");
  });

  it("should have a safety-gas entry in the topic registry", () => {
    // when
    const entry = getTopicById("safety-gas");

    // then
    expect(entry).toBeDefined();
    expect(entry!.id).toBe("safety-gas");
    expect(entry!.label).toBe("Gas Safety");
    expect(entry!.parentId).toBe("safety");
    expect(entry!.route).toBe("/safety/gas");
    expect(entry!.syllabusArea).toBe(4);
  });

  it("should include safety-gas in the safety parent's submoduleIds", () => {
    // given
    const safetyParent = getTopicById("safety");

    // then
    expect(safetyParent).toBeDefined();
    expect(safetyParent!.submoduleIds).toContain("safety-gas");
  });
});

describe("Gas Safety — Route Integration", () => {
  it("should have a /safety/gas route defined in appRoutes", () => {
    // when
    const gasRoute = appRoutes.find((r) => r.path === "/safety/gas");

    // then
    expect(gasRoute).toBeDefined();
    expect(typeof gasRoute!.importPage).toBe("function");
    expect(typeof gasRoute!.lazyElement).toBe("object");
  });
});

describe("Gas Safety — Progress Integration", () => {
  it("should use topic ID 'safety-gas' matching the registry for progress tracking", () => {
    // given
    const registryEntry = getTopicById(TOPIC_IDS.SAFETY_GAS);

    // then
    expect(registryEntry).toBeDefined();
    expect(registryEntry!.id).toBe("safety-gas");
    expect(registryEntry!.route).toBe("/safety/gas");
  });

  it("should have safety-gas as a leaf topic with no submodules", () => {
    // given
    const entry = getTopicById("safety-gas");

    // then
    expect(entry).toBeDefined();
    expect(entry!.submoduleIds).toEqual([]);
  });
});
