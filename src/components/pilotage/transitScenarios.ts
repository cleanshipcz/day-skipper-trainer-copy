/** Observer-view transit recognition scenarios. Coordinates are normalised (0..1). */
export interface MarkerPosition { readonly x: number; readonly y: number }
export type TransitAnswer = "left" | "aligned" | "right";

export interface TransitScenario {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly difficulty: string;
  readonly difficultyLevel: 1 | 2 | 3;
  readonly frontMarker: MarkerPosition;
  readonly rearMarker: MarkerPosition;
  /** Observer position, restricted to the charted usable-water segment. */
  readonly observer: MarkerPosition;
  readonly usableSegment: readonly [MarkerPosition, MarkerPosition];
  readonly tolerance: number;
  readonly answer: TransitAnswer;
  readonly feedback: Readonly<Record<TransitAnswer, string>>;
  readonly chartWidth: number;
  readonly chartHeight: number;
}

export const signedCrossTrack = (point: MarkerPosition, start: MarkerPosition, end: MarkerPosition): number => {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const length = Math.hypot(dx, dy);
  if (length === 0) return Number.NaN;
  return (dx * (point.y - start.y) - dy * (point.x - start.x)) / length;
};

export const isOnUsableSegment = (point: MarkerPosition, segment: readonly [MarkerPosition, MarkerPosition]): boolean => {
  const [start, end] = segment;
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const lengthSquared = dx * dx + dy * dy;
  if (lengthSquared === 0) return false;
  const projection = ((point.x - start.x) * dx + (point.y - start.y) * dy) / lengthSquared;
  return projection >= 0 && projection <= 1;
};

export const classifyTransit = (scenario: TransitScenario): TransitAnswer => {
  if (!isOnUsableSegment(scenario.observer, scenario.usableSegment)) throw new Error("Observer is outside the assessed water segment");
  const offset = signedCrossTrack(scenario.observer, scenario.rearMarker, scenario.frontMarker);
  if (!Number.isFinite(offset)) throw new Error("Transit marks must be distinct");
  if (Math.abs(offset) <= scenario.tolerance + Number.EPSILON * 16) return "aligned";
  return offset < 0 ? "left" : "right";
};

const feedback = (answer: TransitAnswer): Readonly<Record<TransitAnswer, string>> => ({
  left: answer === "left" ? "Correct: the nearer mark appears left of the rear mark." : "The nearer mark is not left of the rear mark; compare their horizontal separation again.",
  aligned: answer === "aligned" ? "Correct: the nearer mark masks the rear mark within the stated tolerance." : "The marks are visibly separated, so this is not the on-transit sight picture.",
  right: answer === "right" ? "Correct: the nearer mark appears right of the rear mark." : "The nearer mark is not right of the rear mark; compare their horizontal separation again.",
});

export const TRANSIT_SCENARIOS: readonly TransitScenario[] = [
  { id: "aligned", title: "Recognise the transit", description: "From the useful, charted water segment, identify the front mark's apparent position relative to the rear mark.", difficulty: "Foundation", difficultyLevel: 1, rearMarker: {x:.5,y:.18}, frontMarker:{x:.5,y:.38}, observer:{x:.5,y:.78}, usableSegment:[{x:.2,y:.78},{x:.8,y:.78}], tolerance:.025, answer:"aligned", feedback:feedback("aligned"), chartWidth:600, chartHeight:400 },
  { id: "front-left", title: "Read a port-side sight picture", description: "Identify which side the nearer (front) mark appears on. No safety outside the highlighted segment is implied.", difficulty: "Applied", difficultyLevel: 2, rearMarker:{x:.5,y:.18}, frontMarker:{x:.5,y:.38}, observer:{x:.68,y:.78}, usableSegment:[{x:.2,y:.78},{x:.8,y:.78}], tolerance:.025, answer:"left", feedback:feedback("left"), chartWidth:600, chartHeight:400 },
  { id: "front-right", title: "Read a starboard-side sight picture", description: "Identify which side the nearer (front) mark appears on. Depth and hazard clearance apply only to the highlighted assessed segment.", difficulty: "Mastery", difficultyLevel: 3, rearMarker:{x:.5,y:.18}, frontMarker:{x:.5,y:.38}, observer:{x:.32,y:.78}, usableSegment:[{x:.2,y:.78},{x:.8,y:.78}], tolerance:.025, answer:"right", feedback:feedback("right"), chartWidth:600, chartHeight:400 },
].map(s => ({...s, answer: classifyTransit(s)})) as readonly TransitScenario[];
