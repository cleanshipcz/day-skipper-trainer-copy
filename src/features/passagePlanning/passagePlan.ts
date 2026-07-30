import type { PlanWaypoint } from "./calculations";

export const PASSAGE_PLAN_CACHE_VERSION = 1;

export interface PassagePlan {
  version: typeof PASSAGE_PLAN_CACHE_VERSION;
  name: string;
  departure: string;
  speed: number;
  fuelRate?: number;
  reservePercent?: number;
  points: PlanWaypoint[];
}

const isWaypoint = (value: unknown): value is PlanWaypoint => {
  if (!value || typeof value !== "object") return false;
  const point = value as Record<string, unknown>;
  return ["id", "name", "latitude", "longitude", "notes", "tidalGate", "weatherWindow"].every(
    (key) => typeof point[key] === "string",
  ) && typeof point.bearing === "number" && typeof point.distanceNm === "number";
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
    return plan as unknown as PassagePlan;
  } catch {
    return null;
  }
}

export function validatePassagePlan(plan: PassagePlan): string[] {
  const errors: string[] = [];
  if (!plan.name.trim()) errors.push("Plan name is required.");
  if (!plan.departure || Number.isNaN(Date.parse(plan.departure))) errors.push("Choose a valid departure time.");
  if (!Number.isFinite(plan.speed) || plan.speed <= 0 || plan.speed > 80) errors.push("SOG must be greater than 0 and no more than 80 knots.");
  if (!plan.points.length) errors.push("Add at least one waypoint.");
  plan.points.forEach((point, index) => {
    const leg = `Leg ${index + 1}`;
    if (!point.name.trim()) errors.push(`${leg}: waypoint name is required.`);
    if (!Number.isFinite(point.distanceNm) || point.distanceNm <= 0 || point.distanceNm > 2000) errors.push(`${leg}: distance must be greater than 0 and no more than 2,000 nm.`);
    if (!Number.isFinite(point.bearing) || point.bearing < 0 || point.bearing >= 360) errors.push(`${leg}: bearing must be between 0° and 359.9°.`);
  });
  if (plan.fuelRate !== undefined && (!Number.isFinite(plan.fuelRate) || plan.fuelRate <= 0 || plan.fuelRate > 500)) errors.push("Fuel rate must be greater than 0 and no more than 500 litres/hour.");
  if (plan.reservePercent !== undefined && (!Number.isFinite(plan.reservePercent) || plan.reservePercent < 0 || plan.reservePercent > 200)) errors.push("Fuel reserve must be between 0% and 200%.");
  return errors;
}

export function passagePlanCacheKey(userId: string | null, anonymousSessionId: string): string {
  return `day-skipper-passage-plan:${userId ?? `anonymous:${anonymousSessionId}`}`;
}
