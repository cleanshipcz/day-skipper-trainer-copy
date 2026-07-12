import { describe, it, expect } from "vitest";
import {
  topicRegistry,
  getTopicById,
  getTopicsByParent,
  TOPIC_IDS,
} from "../src/constants/topicRegistry";
import { appRoutes } from "../src/app/routes";

describe("Pilotage Clearing Bearings — Topic Registry", () => {
  it("should have a pilotage root topic in the registry", () => {
    // when
    const pilotage = getTopicById("pilotage");

    // then
    expect(pilotage).toBeDefined();
    expect(pilotage!.label).toBe("Pilotage");
    expect(pilotage!.parentId).toBeNull();
    expect(pilotage!.route).toBe("/pilotage");
    expect(pilotage!.syllabusArea).toBe(11);
  });

  it("should have a pilotage-clearing-bearings sub-topic in the registry", () => {
    // when
    const clearingBearings = getTopicById("pilotage-clearing-bearings");

    // then
    expect(clearingBearings).toBeDefined();
    expect(clearingBearings!.label).toBe("Clearing Bearings");
    expect(clearingBearings!.parentId).toBe("pilotage");
    expect(clearingBearings!.route).toBe("/pilotage/clearing-bearings");
    expect(clearingBearings!.syllabusArea).toBe(11);
  });

  it("should list pilotage-clearing-bearings as a child of the pilotage topic", () => {
    // when
    const children = getTopicsByParent("pilotage");

    // then
    const childIds = children.map((c) => c.id);
    expect(childIds).toContain("pilotage-clearing-bearings");
  });

  it("should include pilotage-clearing-bearings in the pilotage submoduleIds", () => {
    // when
    const pilotage = getTopicById("pilotage");

    // then
    expect(pilotage!.submoduleIds).toContain("pilotage-clearing-bearings");
  });

  it("should expose TOPIC_IDS constants for pilotage and clearing bearings", () => {
    // then
    expect(TOPIC_IDS.PILOTAGE).toBe("pilotage");
    expect(TOPIC_IDS.PILOTAGE_CLEARING_BEARINGS).toBe(
      "pilotage-clearing-bearings",
    );
  });
});

describe("Pilotage Clearing Bearings — Routes", () => {
  it("should have a /pilotage route registered", () => {
    // when
    const route = appRoutes.find((r) => r.path === "/pilotage");

    // then
    expect(route).toBeDefined();
  });

  it("should have a /pilotage/clearing-bearings route registered", () => {
    // when
    const route = appRoutes.find(
      (r) => r.path === "/pilotage/clearing-bearings",
    );

    // then
    expect(route).toBeDefined();
  });
});
