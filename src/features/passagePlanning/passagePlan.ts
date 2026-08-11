import type { PlanWaypoint } from "./calculations";

export const PASSAGE_PLAN_CACHE_VERSION = 2;

export interface PassagePlan {
  version: typeof PASSAGE_PLAN_CACHE_VERSION;
  name: string;
  departure: string;
  speed: number;
  fuelRate?: number;
  reservePercent?: number;
  points: PlanWaypoint[];
}

const emptyInboundLeg = () => ({ course:0, distanceNm:0, notes:"", tidalGate:"", weatherWindow:"" });
const assertUniqueIds = (points: readonly PlanWaypoint[]) => {
  if (new Set(points.map(point => point.id)).size !== points.length) throw new Error("Waypoint identifiers must be unique before route editing.");
};

function reconcileWaypointPredecessors(previous: readonly PlanWaypoint[], next: readonly PlanWaypoint[]): PlanWaypoint[] {
  const previousPredecessor = new Map(previous.map((point, index) => [point.id, index > 0 ? previous[index - 1].id : null]));
  return next.map((point, index) => {
    if (index === 0) return { ...point, inboundLeg:null };
    const predecessorId = next[index - 1].id;
    const predecessorUnchanged = previousPredecessor.get(point.id) === predecessorId;
    return { ...point, inboundLeg:predecessorUnchanged && point.inboundLeg ? point.inboundLeg : emptyInboundLeg() };
  });
}

/** Preserves the ordered-route invariant after add/remove/reorder operations. */
export function normalizeWaypointOrder(points: readonly PlanWaypoint[]): PlanWaypoint[] {
  return points.map((point, index) => index === 0
    ? { ...point, inboundLeg:null }
    : { ...point, inboundLeg:point.inboundLeg ?? emptyInboundLeg() });
}

export function removeWaypoint(points: readonly PlanWaypoint[], id: string): PlanWaypoint[] {
  assertUniqueIds(points);
  return reconcileWaypointPredecessors(points, points.filter(point => point.id !== id));
}

export function insertWaypoint(points: readonly PlanWaypoint[], point: PlanWaypoint, index: number): PlanWaypoint[] {
  assertUniqueIds(points);
  if (points.some(candidate => candidate.id === point.id)) throw new Error(`Duplicate waypoint id: ${point.id}`);
  const target = Math.max(0, Math.min(index, points.length));
  const inserted = [...points.slice(0, target), point, ...points.slice(target)];
  return reconcileWaypointPredecessors(points, inserted);
}

export function reorderWaypoint(points: readonly PlanWaypoint[], index: number, target: number): PlanWaypoint[] {
  assertUniqueIds(points);
  if (index < 0 || target < 0 || index >= points.length || target >= points.length || index === target) return [...points];
  const reordered = [...points];
  [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
  return reconcileWaypointPredecessors(points, reordered);
}

const isWaypoint = (value: unknown): value is PlanWaypoint => {
  if (!value || typeof value !== "object") return false;
  const point = value as Record<string, unknown>;
  const basic = ["id", "name", "latitude", "longitude"].every(
    (key) => typeof point[key] === "string",
  );
  if (!basic || !("inboundLeg" in point)) return false;
  if (point.inboundLeg === null) return true;
  if (!point.inboundLeg || typeof point.inboundLeg !== "object") return false;
  const leg = point.inboundLeg as Record<string, unknown>;
  return ["notes", "tidalGate", "weatherWindow"].every(key => typeof leg[key] === "string")
    && typeof leg.course === "number" && typeof leg.distanceNm === "number";
};

export function parsePassagePlanCache(raw: string | null): PassagePlan | null {
  if (!raw) return null;
  try {
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== "object") return null;
    const plan = value as Record<string, unknown>;
    if (
      plan.version !== PASSAGE_PLAN_CACHE_VERSION ||
      typeof plan.name !== "string" ||
      typeof plan.departure !== "string" ||
      typeof plan.speed !== "number" ||
      !Array.isArray(plan.points) ||
      !plan.points.every(isWaypoint) ||
      (plan.fuelRate !== undefined && typeof plan.fuelRate !== "number") ||
      (plan.reservePercent !== undefined && typeof plan.reservePercent !== "number")
    ) return null;
    const parsed = plan as unknown as PassagePlan;
    return validatePassagePlan(parsed).length === 0 ? parsed : null;
  } catch {
    return null;
  }
}

export function validatePassagePlan(plan: PassagePlan): string[] {
  const errors: string[] = [];
  if (!plan.name.trim()) errors.push("Plan name is required.");
  if (!plan.departure || Number.isNaN(Date.parse(plan.departure))) errors.push("Choose a valid departure time.");
  if (!Number.isFinite(plan.speed) || plan.speed <= 0 || plan.speed > 80) errors.push("SOG must be greater than 0 and no more than 80 knots.");
  if (plan.points.length < 2) errors.push("Add a departure and at least one destination waypoint.");
  if (new Set(plan.points.map(point => point.id)).size !== plan.points.length) errors.push("Waypoint identifiers must be unique. Reload or reset this plan before editing.");
  plan.points.forEach((point, index) => {
    const label = index === 0 ? "Departure" : `Leg ${index}`;
    if (!point.name.trim()) errors.push(`${label}: waypoint name is required.`);
    if (index === 0 && point.inboundLeg !== null) errors.push("Departure must not have an inbound leg.");
    if (index > 0 && point.inboundLeg === null) errors.push(`${label}: inbound leg is required.`);
    if (index > 0 && point.inboundLeg) {
      if (!Number.isFinite(point.inboundLeg.distanceNm) || point.inboundLeg.distanceNm <= 0 || point.inboundLeg.distanceNm > 2000) errors.push(`${label}: distance must be greater than 0 and no more than 2,000 nm.`);
      if (!Number.isFinite(point.inboundLeg.course) || point.inboundLeg.course < 0 || point.inboundLeg.course >= 360) errors.push(`${label}: course must be between 0° and 359.9°.`);
    }
  });
  if (plan.fuelRate !== undefined && (!Number.isFinite(plan.fuelRate) || plan.fuelRate <= 0 || plan.fuelRate > 500)) errors.push("Fuel rate must be greater than 0 and no more than 500 litres/hour.");
  if (plan.reservePercent !== undefined && (!Number.isFinite(plan.reservePercent) || plan.reservePercent < 0 || plan.reservePercent > 200)) errors.push("Fuel reserve must be between 0% and 200%.");
  return errors;
}

export function passagePlanCacheKey(userId: string | null, anonymousSessionId: string): string {
  return `day-skipper-passage-plan:${userId ?? `anonymous:${anonymousSessionId}`}`;
}
