/**
 * Tests for pilotage topic registry entries.
 *
 * Validates that the topic registry includes pilotage parent
 * and pilotage-buoyage child entries with correct metadata.
 *
 * @see docs/FEATURE_TASKS.md — Story E2-S1
 */
import { describe, it, expect } from "vitest";
import {
  topicRegistry,
  getTopicById,
  getTopicsByParent,
  TOPIC_IDS,
} from "@/constants/topicRegistry";

describe("topicRegistry — pilotage entries", () => {
  it("should include PILOTAGE and PILOTAGE_BUOYAGE in TOPIC_IDS constants", () => {
    // then
    expect(TOPIC_IDS.PILOTAGE).toBe("pilotage");
    expect(TOPIC_IDS.PILOTAGE_BUOYAGE).toBe("pilotage-buoyage");
  });

  it("should have a pilotage parent entry with correct metadata", () => {
    // given
    const pilotage = getTopicById("pilotage");

    // then
    expect(pilotage).toBeDefined();
    expect(pilotage!.label).toBe("Pilotage");
    expect(pilotage!.parentId).toBeNull();
    expect(pilotage!.route).toBe("/pilotage");
    expect(pilotage!.syllabusArea).toBe(11);
    expect(pilotage!.submoduleIds).toContain("pilotage-buoyage");
  });

  it("should have a pilotage-buoyage child entry with correct metadata", () => {
    // given
    const buoyage = getTopicById("pilotage-buoyage");

    // then
    expect(buoyage).toBeDefined();
    expect(buoyage!.label).toBe("IALA Buoyage");
    expect(buoyage!.parentId).toBe("pilotage");
    expect(buoyage!.route).toBe("/pilotage/buoyage");
    expect(buoyage!.syllabusArea).toBe(11);
  });

  it("should return pilotage-buoyage when querying children of pilotage", () => {
    // given
    const children = getTopicsByParent("pilotage");

    // then
    expect(children.some((c) => c.id === "pilotage-buoyage")).toBe(true);
  });

  it("should include pilotage entries in the global registry array", () => {
    // then
    expect(topicRegistry.some((e) => e.id === "pilotage")).toBe(true);
    expect(topicRegistry.some((e) => e.id === "pilotage-buoyage")).toBe(true);
  });
});
