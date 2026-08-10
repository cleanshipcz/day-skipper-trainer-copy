import { scoreCourse, solveCourseToSteer, type VectorInput } from "./vectorSolver";

export interface VectorDrillScenario extends VectorInput {
  id: string;
}

export const VECTOR_DRILL_TOLERANCE_DEG = 5;
export const VECTOR_DRILL_MASTERY_TARGET = 3;

export function recordMasteredScenario(currentIds: ReadonlySet<string>, scenarioId: string) {
  if (currentIds.has(scenarioId)) return currentIds;
  return new Set([...currentIds, scenarioId]);
}

/** A small, reproducible catalogue covers wrap-around, ordinary cross-tide, and impossible routes. */
export const VECTOR_DRILL_SCENARIOS: readonly VectorDrillScenario[] = [
  { id: "north-east-cross", desiredTrackDeg: 0, boatSpeedKn: 5, tideSetDeg: 90, tideRateKn: 2 },
  { id: "bearing-wrap", desiredTrackDeg: 359, boatSpeedKn: 5, tideSetDeg: 90, tideRateKn: 1 },
  { id: "south-west-cross", desiredTrackDeg: 225, boatSpeedKn: 6, tideSetDeg: 315, tideRateKn: 2.5 },
  { id: "following-stream", desiredTrackDeg: 90, boatSpeedKn: 5, tideSetDeg: 90, tideRateKn: 2 },
  { id: "cross-stream-impossible", desiredTrackDeg: 0, boatSpeedKn: 4, tideSetDeg: 90, tideRateKn: 5 },
] as const;

export type VectorDrillAnswer = { kind: "heading"; headingDeg: number } | { kind: "infeasible" };

export function scoreVectorDrillAnswer(scenario: VectorDrillScenario, answer: VectorDrillAnswer) {
  const solution = solveCourseToSteer(scenario);
  if (!solution.feasible) {
    return { correct: answer.kind === "infeasible", solution, errorDeg: null, actualTrackDeg: null };
  }
  if (answer.kind === "infeasible") return { correct: false, solution, errorDeg: null, actualTrackDeg: null };
  const scored = scoreCourse(answer.headingDeg, scenario, VECTOR_DRILL_TOLERANCE_DEG);
  return { correct: scored.correct, solution, errorDeg: scored.errorDeg, actualTrackDeg: scored.actual.trackDeg };
}

export function describeVectorDrillReasoning(scenario: VectorDrillScenario) {
  const solution = solveCourseToSteer(scenario);
  if (!solution.feasible) return solution.reason;
  const correction = ((solution.courseToSteerDeg - scenario.desiredTrackDeg + 540) % 360) - 180;
  const direction = correction < 0 ? "port (anticlockwise)" : correction > 0 ? "starboard (clockwise)" : "neither side";
  return `The tide contributes ${Math.abs(solution.crossTrackTideKn).toFixed(2)} kn across the desired track. Counter it by steering ${Math.abs(correction).toFixed(1)}° to ${direction}: CTS ${solution.courseToSteerDeg.toFixed(1)}°T. The resulting speed over ground is ${solution.speedOverGroundKn.toFixed(1)} kn.`;
}
