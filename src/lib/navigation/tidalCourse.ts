export interface CourseSolution {
  courseTrue: number;
  distanceMadeGood: number;
  speedOverGround: number;
  etaMinutes: number;
}

export interface CourseProblem {
  desiredTrackTrue: number;
  boatSpeed: number;
  streamSetTrue: number;
  streamRate: number;
  intervalHours: number;
  legDistance: number;
}

export const normalizeBearing = (bearing: number) => ((bearing % 360) + 360) % 360;

const components = (bearing: number, magnitude: number) => {
  const radians = normalizeBearing(bearing) * Math.PI / 180;
  return { east: Math.sin(radians) * magnitude, north: Math.cos(radians) * magnitude };
};

/** Solves the forward intersection between a desired ground-track ray and the boat-distance circle. */
export const solveCourseToSteer = (problem: CourseProblem): CourseSolution | null => {
  const { desiredTrackTrue, boatSpeed, streamSetTrue, streamRate, intervalHours, legDistance } = problem;
  if (boatSpeed <= 0 || streamRate < 0 || intervalHours <= 0 || legDistance < 0) return null;

  const groundUnit = components(desiredTrackTrue, 1);
  const stream = components(streamSetTrue, streamRate * intervalHours);
  const boatDistance = boatSpeed * intervalHours;
  const projection = groundUnit.east * stream.east + groundUnit.north * stream.north;
  const discriminant = boatDistance ** 2 - (stream.east ** 2 + stream.north ** 2 - projection ** 2);
  if (discriminant < 0) return null;

  const distanceMadeGood = projection + Math.sqrt(discriminant);
  if (distanceMadeGood < 0) return null;
  const throughWater = {
    east: groundUnit.east * distanceMadeGood - stream.east,
    north: groundUnit.north * distanceMadeGood - stream.north,
  };
  const courseTrue = normalizeBearing(Math.atan2(throughWater.east, throughWater.north) * 180 / Math.PI);
  const speedOverGround = distanceMadeGood / intervalHours;

  return { courseTrue, distanceMadeGood, speedOverGround, etaMinutes: legDistance / speedOverGround * 60 };
};
