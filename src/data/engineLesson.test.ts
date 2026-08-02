import { describe, expect, it } from "vitest";
import { inspectionExamples, lessonStages, practiceScenarios } from "./engineLesson";

describe("engine practical lesson catalogue", () => {
  it("keeps the operational routine in inspectable order", () => {
    expect(lessonStages.map(({ id }) => id)).toEqual(["pre-start", "post-start", "monitor", "shutdown", "record"]);
    for (const stage of lessonStages) {
      expect(stage.example.length).toBeGreaterThan(80);
      expect(stage.abnormal.length).toBeGreaterThan(80);
    }
  });

  it("covers the representative installation inspection set with work boundaries", () => {
    expect(inspectionExamples.map(({ id }) => id)).toEqual([
      "fluids", "fuel", "belts", "cooling", "leaks", "battery", "exhaust", "controls", "stern-gear",
    ]);
    for (const example of inspectionExamples) {
      expect(example.evidence.normal).toBeTruthy();
      expect(example.evidence.abnormal).toBeTruthy();
      expect(example.boundary).toMatch(/work|observe|inspection|start|stop|isolate|operator/i);
    }
  });

  it("provides explicit remediation for every practice decision", () => {
    for (const scenario of practiceScenarios) {
      expect(scenario.choices[scenario.answer]).toBeTruthy();
      expect(scenario.remediation.length).toBeGreaterThan(80);
    }
  });
});
