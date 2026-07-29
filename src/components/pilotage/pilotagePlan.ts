export interface PilotageWaypoint {
  readonly id: string;
  readonly name: string;
  readonly bearing: number;
  readonly distance: number;
  readonly tidalOffset: number;
  readonly notes: string;
}

export interface PilotagePlanSummary {
  readonly waypoints: readonly PilotageWaypoint[];
  readonly totalDistance: number;
  readonly estimatedMinutes: number;
}

export const calculatePlanSummary = (
  waypoints: readonly PilotageWaypoint[],
  speedKnots: number,
): PilotagePlanSummary => {
  const totalDistance = waypoints.reduce((total, waypoint) => total + waypoint.distance, 0);
  const passageMinutes = speedKnots > 0 ? (totalDistance / speedKnots) * 60 : 0;
  const tidalMinutes = waypoints.reduce((total, waypoint) => total + waypoint.tidalOffset, 0);
  return {
    waypoints,
    totalDistance: Number(totalDistance.toFixed(2)),
    estimatedMinutes: Math.max(0, Math.round(passageMinutes + tidalMinutes)),
  };
};
