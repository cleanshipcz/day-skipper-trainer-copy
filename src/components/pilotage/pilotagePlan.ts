export const PILOTAGE_DRAFT_VERSION = 2 as const;
export const PILOTAGE_DRAFT_KEY = "day-skipper:pilotage-plan:draft";

export interface PilotageWaypoint {
  readonly id: string;
  readonly name: string;
  readonly mark: string;
  /** Course to steer, degrees true, from the previous point to this point. */
  readonly bearing: number;
  readonly distance: number;
  /** Planned speed over ground for this leg, in knots. */
  readonly speedOverGround: number;
  readonly hazards: string;
  readonly safeLimits: string;
  readonly monitoring: string;
  readonly depthAndTide: string;
  readonly communications: string;
  readonly abortAndContingency: string;
  readonly notes: string;
}

export interface PilotagePlanSummary {
  readonly waypoints: readonly PilotageWaypoint[];
  readonly totalDistance: number;
  readonly estimatedMinutes: number;
}

export interface PilotageDraft { readonly version: typeof PILOTAGE_DRAFT_VERSION; readonly waypoints: readonly PilotageWaypoint[]; }

export const GUIDED_WAYPOINTS: readonly PilotageWaypoint[] = [
  { id: "guided-1", name: "Fairway safe-water mark", mark: "Red/white vertical safe-water mark, Iso.W.10s", bearing: 32, distance: 0.8, speedOverGround: 4.8, hazards: "Shoal water outside the buoyed fairway", safeLimits: "Remain inside the fictional 5 m charted contour", monitoring: "Confirm Iso.W.10s and cross-check depth", depthAndTide: "Minimum planned depth 3.2 m; rising stream", communications: "Crew brief before the mark", abortAndContingency: "Remain seaward if mark or depth cannot be confirmed", notes: "Fictional training data — not for navigation." },
  { id: "guided-2", name: "Outer leading line", mark: "Fictional chapel tower over white warehouse", bearing: 74, distance: 1.2, speedOverGround: 4.5, hazards: "Cross-stream set toward the south shoal", safeLimits: "Transit must remain aligned; clearing bearing 060°T minimum", monitoring: "Monitor transit and depth every minute", depthAndTide: "Allow 1 kn southerly stream; minimum UKC 1.0 m", communications: "Helm reports any transit opening", abortAndContingency: "Turn back to safe-water mark if transit cannot be held", notes: "CTS is illustrative and must be checked against a current chart." },
  { id: "guided-3", name: "Harbour entrance", mark: "Red can Fl.R.4s / green cone Fl.G.4s (IALA A)", bearing: 18, distance: 0.6, speedOverGround: 4, hazards: "Traffic and narrow entrance", safeLimits: "Pass centrally between lateral marks", monitoring: "Identify both lights and watch inbound traffic", depthAndTide: "Minimum planned depth 2.8 m", communications: "Call fictional harbour on VHF 12 before entry", abortAndContingency: "Hold outside or return to leading line if entry is obstructed", notes: "Reduce speed for wash." },
];

const requiredText: readonly [keyof PilotageWaypoint, string][] = [
  ["name", "leg name"], ["mark", "mark or feature"], ["hazards", "hazards"], ["safeLimits", "safe limits"],
  ["monitoring", "monitoring method"], ["depthAndTide", "depth and tide"], ["communications", "communications"],
  ["abortAndContingency", "abort or contingency action"],
];

export const validatePilotageWaypoint = (waypoint: PilotageWaypoint): string | null => {
  if (!waypoint.id.trim()) return "Add a leg identifier.";
  for (const [key, label] of requiredText) if (!String(waypoint[key]).trim()) return `Add ${label}.`;
  if (!Number.isFinite(waypoint.bearing) || waypoint.bearing < 0 || waypoint.bearing >= 360) return "Course must be a finite value from 0° to 359.999° true.";
  if (!Number.isFinite(waypoint.distance) || waypoint.distance <= 0 || waypoint.distance > 100) return "Distance must be greater than 0 and no more than 100 NM.";
  if (!Number.isFinite(waypoint.speedOverGround) || waypoint.speedOverGround <= 0 || waypoint.speedOverGround > 50) return "SOG must be greater than 0 and no more than 50 knots.";
  return null;
};

export const validatePlanCoverage = (waypoints: readonly PilotageWaypoint[]): string[] => {
  if (!waypoints.length) return ["Add at least one leg before briefing the plan."];
  return waypoints.flatMap((waypoint, index) => {
    const error = validatePilotageWaypoint(waypoint);
    return error ? [`Leg ${index + 1} (${waypoint.name || "unnamed"}): ${error} Correct the highlighted leg so the cockpit plan covers every safety item.`] : [];
  });
};

export const calculatePlanSummary = (waypoints: readonly PilotageWaypoint[]): PilotagePlanSummary => {
  const errors = validatePlanCoverage(waypoints); if (errors.length) throw new RangeError(errors[0]);
  const totalDistance = waypoints.reduce((sum, leg) => sum + leg.distance, 0);
  const minutes = waypoints.reduce((sum, leg) => sum + leg.distance / leg.speedOverGround * 60, 0);
  return { waypoints, totalDistance: Number(totalDistance.toFixed(2)), estimatedMinutes: Math.round(minutes) };
};

export const parsePilotageDraft = (raw: string | null): PilotageDraft | null => {
  if (!raw) return null;
  try {
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== "object") return null;
    const candidate = value as Record<string, unknown>;
    if (candidate.version !== PILOTAGE_DRAFT_VERSION || !Array.isArray(candidate.waypoints)) return null;
    const textKeys: readonly (keyof PilotageWaypoint)[] = ["id", "name", "mark", "hazards", "safeLimits", "monitoring", "depthAndTide", "communications", "abortAndContingency", "notes"];
    const numberKeys: readonly (keyof PilotageWaypoint)[] = ["bearing", "distance", "speedOverGround"];
    const expectedKeys = [...textKeys, ...numberKeys];
    const validShape = candidate.waypoints.every((item) => item !== null && typeof item === "object"
      && Object.keys(item).length === expectedKeys.length
      && Object.keys(item).every((key) => expectedKeys.includes(key as keyof PilotageWaypoint))
      && textKeys.every((key) => typeof (item as Record<string, unknown>)[key] === "string")
      && numberKeys.every((key) => typeof (item as Record<string, unknown>)[key] === "number"));
    if (!validShape || validatePlanCoverage(candidate.waypoints as PilotageWaypoint[]).length) return null;
    return candidate as unknown as PilotageDraft;
  } catch { return null; }
};
