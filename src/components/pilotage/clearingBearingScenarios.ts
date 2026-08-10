export interface ChartPoint { readonly x: number; readonly y: number }
export type BearingRule = "NLT" | "NMT";

export interface ClearingBearingScenario {
  readonly id: string;
  readonly title: string;
  readonly task: string;
  readonly landmark: { readonly name: string; readonly position: ChartPoint };
  readonly hazard: { readonly name: string; readonly position: ChartPoint; readonly radius: number; readonly margin: number };
  readonly tangent: "left" | "right";
  readonly safeObserver: ChartPoint;
  readonly chartNote: string;
}

export const normalizeBearing = (value: number) => ((value % 360) + 360) % 360;

/** True bearing from one chart point to another (chart y increases south). */
export const trueBearing = (from: ChartPoint, to: ChartPoint) =>
  normalizeBearing((Math.atan2(to.x - from.x, from.y - to.y) * 180) / Math.PI);

export const signedBearingDifference = (bearing: number, reference: number) =>
  ((bearing - reference + 540) % 360) - 180;

export const tangentPoint = (scenario: ClearingBearingScenario): ChartPoint => {
  const { position: landmark } = scenario.landmark;
  const { position: centre, radius, margin } = scenario.hazard;
  const r = radius + margin;
  const dx = landmark.x - centre.x;
  const dy = landmark.y - centre.y;
  const distanceSquared = dx * dx + dy * dy;
  if (distanceSquared <= r * r) throw new Error("Landmark must lie outside the clearance circle");
  const baseX = centre.x + (r * r * dx) / distanceSquared;
  const baseY = centre.y + (r * r * dy) / distanceSquared;
  const factor = (r * Math.sqrt(distanceSquared - r * r)) / distanceSquared;
  const sign = scenario.tangent === "left" ? 1 : -1;
  return { x: baseX + sign * -dy * factor, y: baseY + sign * dx * factor };
};

export const solutionFor = (scenario: ClearingBearingScenario) => {
  const boundary = tangentPoint(scenario);
  // A hand-bearing compass at the boundary observes towards the named mark.
  const bearing = trueBearing(boundary, scenario.landmark.position);
  const safeBearing = trueBearing(scenario.safeObserver, scenario.landmark.position);
  const rule: BearingRule = signedBearingDifference(safeBearing, bearing) > 0 ? "NLT" : "NMT";
  return { boundary, bearing, rule, safeBearing };
};

export type AnswerResult =
  | { readonly kind: "invalid"; readonly message: string }
  | { readonly kind: "incorrect"; readonly message: string }
  | { readonly kind: "correct"; readonly message: string };

export const assessClearingBearing = (
  rawBearing: string,
  rule: BearingRule | "",
  scenario: ClearingBearingScenario,
  tolerance = 2,
): AnswerResult => {
  if (!/^\d{1,3}(?:\.\d+)?$/.test(rawBearing.trim())) {
    return { kind: "invalid", message: "Enter a numeric true bearing from 000° to 359°." };
  }
  const value = Number(rawBearing);
  if (!Number.isFinite(value) || value < 0 || value >= 360) {
    return { kind: "invalid", message: "Enter a true bearing from 000° to 359°." };
  }
  if (!rule) return { kind: "invalid", message: "Choose NLT or NMT to identify the safe side." };
  const solution = solutionFor(scenario);
  const bearingCorrect = Math.abs(signedBearingDifference(value, solution.bearing)) <= tolerance;
  if (!bearingCorrect || rule !== solution.rule) {
    const bearingHelp = bearingCorrect
      ? "Your plotted limit is sound, but the inequality selects the hazard side."
      : "Replot the line from the named mark tangent to the outside of the shaded clearance margin, then read the reciprocal bearing from vessel to mark.";
    return { kind: "incorrect", message: `${bearingHelp} Check one test position in the labelled safe-water area before retrying.` };
  }
  return { kind: "correct", message: `Limit ${Math.round(solution.bearing).toString().padStart(3, "0")}°T ${solution.rule}. The line is tangent to the clearance margin and the test position confirms the safe side.` };
};

export const CLEARING_BEARING_SCENARIOS: readonly ClearingBearingScenario[] = [
  {
    id: "shoal-approach", title: "Rocky shoal approach",
    task: "Use the church spire and the charted shoal plus its shaded clearance margin. Plot the limiting line, measure the true bearing from vessel to spire, and choose the inequality that keeps the vessel in the labelled channel.",
    landmark: { name: "Church Spire", position: { x: 105, y: 55 } },
    hazard: { name: "Rocky Shoal", position: { x: 300, y: 170 }, radius: 22, margin: 18 },
    tangent: "left", safeObserver: { x: 125, y: 260 }, chartNote: "Dredged channel · 5.2 m",
  },
  {
    id: "wreck-headland", title: "Wreck off North Head",
    task: "Use North Head light and the wreck's shaded clearance margin. Plot the limiting line, measure the true bearing from vessel to light, and choose the inequality that keeps the vessel in the labelled safe-water sector.",
    landmark: { name: "North Head Light", position: { x: 390, y: 52 } },
    hazard: { name: "Wreck", position: { x: 245, y: 184 }, radius: 18, margin: 20 },
    tangent: "right", safeObserver: { x: 420, y: 255 }, chartNote: "Safe water · depth 7.8 m",
  },
] as const;
