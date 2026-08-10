export interface PilotageWaypoint {
  readonly id: string;
  readonly name: string;
  /** Course to steer, degrees true, from the previous point to this point. */
  readonly bearing: number;
  readonly distance: number;
  /** Planned speed over ground for this leg, in knots. */
  readonly speedOverGround: number;
  readonly notes: string;
}

export interface PilotagePlanSummary {
  readonly waypoints: readonly PilotageWaypoint[];
  readonly totalDistance: number;
  readonly estimatedMinutes: number;
}

export const GUIDED_WAYPOINTS: readonly PilotageWaypoint[] = [
  { id: "guided-1", name: "Approach to Fairway safe-water mark", bearing: 32, distance: 0.8, speedOverGround: 4.8, notes: "Identify the red-and-white vertically striped safe-water mark; white light Iso.10s." },
  { id: "guided-2", name: "Fairway mark to outer leading line", bearing: 74, distance: 1.2, speedOverGround: 4.5, notes: "Steer 074°T until the fictional chapel tower and white warehouse are in transit." },
  { id: "guided-3", name: "Leading line to harbour entrance", bearing: 18, distance: 0.6, speedOverGround: 4, notes: "Pass between the port-hand red can (Fl R 4s) and starboard-hand green conical mark (Fl G 4s). Call harbour before entry." },
];

const MAX_LEG_DISTANCE_NM = 100;
const MAX_SPEED_OVER_GROUND_KNOTS = 50;

export const validatePilotageWaypoint = (waypoint: PilotageWaypoint): string | null => {
  if (!waypoint.name.trim()) return "Give the leg a name.";
  if (!Number.isFinite(waypoint.bearing) || waypoint.bearing < 0 || waypoint.bearing >= 360) {
    return "Course must be a finite value from 0° to 359.999° true.";
  }
  if (!Number.isFinite(waypoint.distance) || waypoint.distance <= 0 || waypoint.distance > MAX_LEG_DISTANCE_NM) {
    return `Distance must be greater than 0 and no more than ${MAX_LEG_DISTANCE_NM} NM.`;
  }
  if (!Number.isFinite(waypoint.speedOverGround) || waypoint.speedOverGround <= 0 || waypoint.speedOverGround > MAX_SPEED_OVER_GROUND_KNOTS) {
    return `SOG must be greater than 0 and no more than ${MAX_SPEED_OVER_GROUND_KNOTS} knots.`;
  }
  return null;
};

export const calculatePlanSummary = (
  waypoints: readonly PilotageWaypoint[],
): PilotagePlanSummary => {
  for (const waypoint of waypoints) {
    const error = validatePilotageWaypoint(waypoint);
    if (error) throw new RangeError(`${waypoint.name || "Unnamed leg"}: ${error}`);
  }

  const totalDistance = waypoints.reduce((total, waypoint) => total + waypoint.distance, 0);
  const passageMinutes = waypoints.reduce(
    (total, waypoint) => total + (waypoint.distance / waypoint.speedOverGround) * 60,
    0,
  );
  return {
    waypoints,
    totalDistance: Number(totalDistance.toFixed(2)),
    estimatedMinutes: Math.round(passageMinutes),
  };
};
