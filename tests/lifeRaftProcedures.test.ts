import { describe, it, expect } from "vitest";
import {
  lifeRaftTypes,
  solasPackContents,
  abandonShipSteps,
  boardingProcedureSteps,
  actionsInRaftSteps,
  deploymentProcedureSteps,
  type LifeRaftType,
  type SolasPackItem,
  type ProcedureStep,
} from "../src/data/lifeRaftProcedures";

describe("lifeRaftTypes data", () => {
  it("should export a non-empty array of life raft types", () => {
    expect(Array.isArray(lifeRaftTypes)).toBe(true);
    expect(lifeRaftTypes.length).toBeGreaterThanOrEqual(2);
  });

  it("should have valid structure for every life raft type", () => {
    for (const raft of lifeRaftTypes) {
      // then - required string fields are non-empty
      expect(raft.id).toBeTruthy();
      expect(raft.name).toBeTruthy();
      expect(raft.description).toBeTruthy();

      // then - features is a non-empty array of strings
      expect(raft.features.length).toBeGreaterThan(0);
      for (const feature of raft.features) {
        expect(typeof feature).toBe("string");
        expect(feature.length).toBeGreaterThan(0);
      }
    }
  });

  it("should have unique IDs for every life raft type", () => {
    // given
    const ids = lifeRaftTypes.map((r) => r.id);

    // then
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("solasPackContents data", () => {
  it("should export a non-empty array of SOLAS pack items", () => {
    expect(Array.isArray(solasPackContents)).toBe(true);
    expect(solasPackContents.length).toBeGreaterThanOrEqual(8);
  });

  it("should have valid structure for every SOLAS pack item", () => {
    for (const item of solasPackContents) {
      expect(item.id).toBeTruthy();
      expect(item.name).toBeTruthy();
      expect(item.purpose).toBeTruthy();
    }
  });

  it("should have unique IDs for every SOLAS pack item", () => {
    // given
    const ids = solasPackContents.map((i) => i.id);

    // then
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("abandonShipSteps data", () => {
  it("should export a non-empty array of abandon ship procedure steps", () => {
    expect(Array.isArray(abandonShipSteps)).toBe(true);
    expect(abandonShipSteps.length).toBeGreaterThanOrEqual(5);
  });

  it("should have valid structure for every step", () => {
    for (const step of abandonShipSteps) {
      expect(step.id).toBeTruthy();
      expect(step.text).toBeTruthy();
    }
  });

  it("should have unique IDs for every step", () => {
    // given
    const ids = abandonShipSteps.map((s) => s.id);

    // then
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("deploymentProcedureSteps data", () => {
  it("should export a non-empty array of deployment procedure steps", () => {
    expect(Array.isArray(deploymentProcedureSteps)).toBe(true);
    expect(deploymentProcedureSteps.length).toBeGreaterThanOrEqual(4);
  });

  it("should have valid structure for every step", () => {
    for (const step of deploymentProcedureSteps) {
      expect(step.id).toBeTruthy();
      expect(step.text).toBeTruthy();
    }
  });

  it("should have unique IDs for every step", () => {
    const ids = deploymentProcedureSteps.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("boardingProcedureSteps data", () => {
  it("should export a non-empty array of boarding procedure steps", () => {
    expect(Array.isArray(boardingProcedureSteps)).toBe(true);
    expect(boardingProcedureSteps.length).toBeGreaterThanOrEqual(4);
  });

  it("should have valid structure for every step", () => {
    for (const step of boardingProcedureSteps) {
      expect(step.id).toBeTruthy();
      expect(step.text).toBeTruthy();
    }
  });

  it("should have unique IDs for every step", () => {
    const ids = boardingProcedureSteps.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("actionsInRaftSteps data", () => {
  it("should export a non-empty array of actions in the raft steps", () => {
    expect(Array.isArray(actionsInRaftSteps)).toBe(true);
    expect(actionsInRaftSteps.length).toBeGreaterThanOrEqual(4);
  });

  it("should have valid structure for every step", () => {
    for (const step of actionsInRaftSteps) {
      expect(step.id).toBeTruthy();
      expect(step.text).toBeTruthy();
    }
  });

  it("should have unique IDs for every step", () => {
    const ids = actionsInRaftSteps.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
