export interface VectorInput {
  desiredTrackDeg: number;
  boatSpeedKn: number;
  tideSetDeg: number;
  tideRateKn: number;
}

export interface VectorComponents { eastKn: number; northKn: number }

export type VectorSolution =
  | {
      feasible: true;
      input: VectorInput;
      tide: VectorComponents;
      throughWater: VectorComponents;
      overGround: VectorComponents;
      courseToSteerDeg: number;
      speedOverGroundKn: number;
      crossTrackTideKn: number;
      alongTrackTideKn: number;
    }
  | { feasible: false; input: VectorInput; reason: string; crossTrackTideKn?: number };

const EPSILON = 1e-10;
export const normalizeBearing = (degrees: number) => ((degrees % 360) + 360) % 360;
const radians = (degrees: number) => (degrees * Math.PI) / 180;
const bearingOf = ({ eastKn, northKn }: VectorComponents) =>
  normalizeBearing((Math.atan2(eastKn, northKn) * 180) / Math.PI);

/** Bearings are degrees true, speeds are knots, and tidal set is the direction toward which water flows. */
export function componentsFor(bearingDeg: number, speedKn: number): VectorComponents {
  const angle = radians(bearingDeg);
  return { eastKn: speedKn * Math.sin(angle), northKn: speedKn * Math.cos(angle) };
}

function validate(input: VectorInput): string | null {
  if (![input.desiredTrackDeg, input.boatSpeedKn, input.tideSetDeg, input.tideRateKn].every(Number.isFinite)) return "Every input must be a finite number.";
  if (input.desiredTrackDeg < 0 || input.desiredTrackDeg >= 360 || input.tideSetDeg < 0 || input.tideSetDeg >= 360) return "Bearings must be from 0° inclusive to 360° exclusive.";
  if (input.boatSpeedKn <= 0 || input.boatSpeedKn > 100) return "Boat speed must be greater than 0 and no more than 100 kn.";
  if (input.tideRateKn < 0 || input.tideRateKn > 20) return "Tidal rate must be from 0 to 20 kn.";
  return null;
}

export function solveCourseToSteer(input: VectorInput): VectorSolution {
  const error = validate(input);
  if (error) return { feasible: false, input, reason: error };
  const track = componentsFor(input.desiredTrackDeg, 1);
  const right = { eastKn: track.northKn, northKn: -track.eastKn };
  const tide = componentsFor(input.tideSetDeg, input.tideRateKn);
  const alongTrackTideKn = tide.eastKn * track.eastKn + tide.northKn * track.northKn;
  const crossTrackTideKn = tide.eastKn * right.eastKn + tide.northKn * right.northKn;
  if (Math.abs(crossTrackTideKn) > input.boatSpeedKn + EPSILON) {
    return { feasible: false, input, crossTrackTideKn, reason: `No course to steer exists: the ${Math.abs(crossTrackTideKn).toFixed(2)} kn cross-track tide exceeds the boat's ${input.boatSpeedKn.toFixed(2)} kn through-water speed.` };
  }
  const forwardWaterKn = Math.sqrt(Math.max(0, input.boatSpeedKn ** 2 - crossTrackTideKn ** 2));
  const speedOverGroundKn = alongTrackTideKn + forwardWaterKn;
  if (speedOverGroundKn <= EPSILON) return { feasible: false, input, crossTrackTideKn, reason: "No forward solution exists: the opposing tide equals or exceeds the available along-track boat speed." };
  const overGround = { eastKn: track.eastKn * speedOverGroundKn, northKn: track.northKn * speedOverGroundKn };
  const throughWater = { eastKn: overGround.eastKn - tide.eastKn, northKn: overGround.northKn - tide.northKn };
  return { feasible: true, input, tide, throughWater, overGround, courseToSteerDeg: bearingOf(throughWater), speedOverGroundKn, crossTrackTideKn, alongTrackTideKn };
}

export function resultingTrack(courseDeg: number, boatSpeedKn: number, tideSetDeg: number, tideRateKn: number) {
  const water = componentsFor(courseDeg, boatSpeedKn);
  const tide = componentsFor(tideSetDeg, tideRateKn);
  const overGround = { eastKn: water.eastKn + tide.eastKn, northKn: water.northKn + tide.northKn };
  const speedOverGroundKn = Math.hypot(overGround.eastKn, overGround.northKn);
  return { water, tide, overGround, speedOverGroundKn, trackDeg: speedOverGroundKn > EPSILON ? bearingOf(overGround) : null };
}

export function scoreCourse(courseDeg: number, input: VectorInput, toleranceDeg = 5) {
  const actual = resultingTrack(courseDeg, input.boatSpeedKn, input.tideSetDeg, input.tideRateKn);
  if (actual.trackDeg === null) return { correct: false, errorDeg: null, actual };
  const errorDeg = Math.abs(((actual.trackDeg - input.desiredTrackDeg + 540) % 360) - 180);
  return { correct: errorDeg < toleranceDeg, errorDeg, actual };
}
