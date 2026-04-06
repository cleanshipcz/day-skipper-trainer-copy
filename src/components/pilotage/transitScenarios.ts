/**
 * Transit exercise scenarios data.
 *
 * Each scenario defines a harbour chart layout with front/rear transit markers
 * and a starting vessel position. The user must drag the vessel onto the
 * transit line (the line passing through both markers).
 *
 * Scenarios are ordered by increasing difficulty:
 *   1 = Beginner  — wide tolerance, straight transit, helpful hints
 *   2 = Intermediate — tighter tolerance, angled transit
 *   3 = Advanced — tight tolerance, angled transit, no hints
 *
 * @see docs/FEATURE_TASKS.md — Story E2-S2, AC-2
 */

export interface MarkerPosition {
  readonly x: number;
  readonly y: number;
}

export interface TransitScenario {
  /** Unique identifier for this scenario. */
  readonly id: string;
  /** Short title displayed above the chart. */
  readonly title: string;
  /** Description / instruction text for the student. */
  readonly description: string;
  /** Human-readable difficulty label. */
  readonly difficulty: string;
  /** Numeric difficulty level (1–3) for ordering. */
  readonly difficultyLevel: 1 | 2 | 3;
  /** Position of the front (nearer) transit marker on the chart. */
  readonly frontMarker: MarkerPosition;
  /** Position of the rear (farther) transit marker on the chart. */
  readonly rearMarker: MarkerPosition;
  /** Initial vessel position (off the transit line). */
  readonly vesselStart: MarkerPosition;
  /** Perpendicular distance tolerance in pixels for "on transit". */
  readonly tolerancePx: number;
  /** Chart viewport width. */
  readonly chartWidth: number;
  /** Chart viewport height. */
  readonly chartHeight: number;
}

/**
 * Calculates the perpendicular distance from a point to a line defined by
 * two points (the transit markers).
 *
 * Uses the formula: |Ax + By + C| / sqrt(A² + B²)
 * where the line through (x1,y1) and (x2,y2) is:
 *   A = y2 - y1, B = x1 - x2, C = x2*y1 - x1*y2
 */
export const perpendicularDistance = (
  point: MarkerPosition,
  lineStart: MarkerPosition,
  lineEnd: MarkerPosition,
): number => {
  const a = lineEnd.y - lineStart.y;
  const b = lineStart.x - lineEnd.x;
  const c = lineEnd.x * lineStart.y - lineStart.x * lineEnd.y;
  const denominator = Math.sqrt(a * a + b * b);
  if (denominator === 0) return 0;
  return Math.abs(a * point.x + b * point.y + c) / denominator;
};

/**
 * Checks whether a vessel position is "on transit" — within the
 * tolerance distance of the line through the two markers.
 */
export const isOnTransit = (
  vesselPos: MarkerPosition,
  scenario: TransitScenario,
): boolean =>
  perpendicularDistance(vesselPos, scenario.frontMarker, scenario.rearMarker) <=
  scenario.tolerancePx;

export const TRANSIT_SCENARIOS: readonly TransitScenario[] = [
  {
    id: "harbour-approach",
    title: "Harbour Approach — Straight Transit",
    description:
      "Drag your vessel to align with the two leading marks at the harbour entrance. " +
      "When the front and rear markers line up, you are on the safe approach transit.",
    difficulty: "Beginner",
    difficultyLevel: 1,
    frontMarker: { x: 300, y: 350 },
    rearMarker: { x: 300, y: 150 },
    vesselStart: { x: 180, y: 420 },
    tolerancePx: 25,
    chartWidth: 600,
    chartHeight: 500,
  },
  {
    id: "channel-entry",
    title: "Channel Entry — Angled Transit",
    description:
      "Navigate into a narrow channel using an angled transit. " +
      "The leading marks are offset — align your vessel precisely on the transit line.",
    difficulty: "Intermediate",
    difficultyLevel: 2,
    frontMarker: { x: 350, y: 370 },
    rearMarker: { x: 250, y: 150 },
    vesselStart: { x: 450, y: 430 },
    tolerancePx: 18,
    chartWidth: 600,
    chartHeight: 500,
  },
  {
    id: "rocky-passage",
    title: "Rocky Passage — Tight Transit",
    description:
      "Thread through a rock-strewn passage using a tight transit between two marks. " +
      "Precision is critical — even a small deviation puts you in danger.",
    difficulty: "Advanced",
    difficultyLevel: 3,
    frontMarker: { x: 320, y: 380 },
    rearMarker: { x: 220, y: 120 },
    vesselStart: { x: 450, y: 400 },
    tolerancePx: 12,
    chartWidth: 600,
    chartHeight: 500,
  },
] as const;
