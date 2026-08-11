import { calculatePassageValues, parseWaypointCoordinate, totalRouteDistance, type PassageCalculation, type PlanWaypoint } from "./calculations";

export const PASSAGE_PLAN_CACHE_VERSION = 3;

export interface PassagePlan {
  version: typeof PASSAGE_PLAN_CACHE_VERSION;
  name: string;
  departure: string;
  speed: number;
  fuelRate?: number;
  reservePercent?: number;
  points: PlanWaypoint[];
  coordinateFormat: "degrees-decimal-minutes";
  datum: "WGS84";
  coordinatePrecision: string;
  safety: { departureBerth:string; destinationBerth:string; limits:string; abortDecision:string; alternatives:string; manualVerification:string };
  provenance: { weather:string; tide:string; chart:string; publications:string; preparedAt:string; revisedAt:string };
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

export type PassagePlanParseResult =
  | { ok: true; plan: PassagePlan; migrated: boolean }
  | { ok: false; code: "empty" | "malformed-json" | "unsupported-version" | "invalid-structure"; message: string };

const text = (value: unknown) => typeof value === "string" ? value : "";
const finite = (value: unknown) => typeof value === "number" && Number.isFinite(value) ? value : undefined;
const sanitizeText = (value: string) => Array.from(value).filter(character=>{const code=character.charCodeAt(0);return code===9||code===10||code===13||code>=32&&code!==127}).join("").slice(0,4000);

/** Migrates shape only. Semantic validation intentionally happens after this step. */
export function decodePassagePlanCache(raw: string | null): PassagePlanParseResult {
  if (!raw) return { ok:false, code:"empty", message:"No saved passage plan was found." };
  let value: unknown;
  try { value=JSON.parse(raw); } catch { return { ok:false, code:"malformed-json", message:"The saved passage plan is not valid JSON." }; }
  if (!value || typeof value !== "object" || Array.isArray(value)) return { ok:false, code:"invalid-structure", message:"The saved passage plan has an invalid top-level structure." };
  const source=value as Record<string,unknown>;
  if (source.version !== PASSAGE_PLAN_CACHE_VERSION) return { ok:false, code:"unsupported-version", message:`Passage plan version ${String(source.version)} is not supported.` };
  if (!Array.isArray(source.points) || !source.points.every(isWaypoint) || !source.safety || typeof source.safety!=="object" || !source.provenance || typeof source.provenance!=="object") return { ok:false, code:"invalid-structure", message:"The saved passage plan is incomplete; safe fields could not be recovered." };
  const safety=source.safety as Record<string,unknown>, provenance=source.provenance as Record<string,unknown>;
  const speed=finite(source.speed);
  if(speed===undefined || source.coordinateFormat!=="degrees-decimal-minutes" || source.datum!=="WGS84") return { ok:false, code:"invalid-structure", message:"The saved passage plan has invalid required field types." };
  const plan:PassagePlan={
    version:PASSAGE_PLAN_CACHE_VERSION,
    name:sanitizeText(text(source.name)), departure:sanitizeText(text(source.departure)), speed,
    ...(finite(source.fuelRate)!==undefined?{fuelRate:finite(source.fuelRate)}:{}),
    ...(finite(source.reservePercent)!==undefined?{reservePercent:finite(source.reservePercent)}:{}),
    coordinateFormat:"degrees-decimal-minutes", datum:"WGS84", coordinatePrecision:sanitizeText(text(source.coordinatePrecision)),
    safety:{departureBerth:sanitizeText(text(safety.departureBerth)),destinationBerth:sanitizeText(text(safety.destinationBerth)),limits:sanitizeText(text(safety.limits)),abortDecision:sanitizeText(text(safety.abortDecision)),alternatives:sanitizeText(text(safety.alternatives)),manualVerification:sanitizeText(text(safety.manualVerification))},
    provenance:{weather:sanitizeText(text(provenance.weather)),tide:sanitizeText(text(provenance.tide)),chart:sanitizeText(text(provenance.chart)),publications:sanitizeText(text(provenance.publications)),preparedAt:sanitizeText(text(provenance.preparedAt)),revisedAt:sanitizeText(text(provenance.revisedAt))},
    points:source.points.map(point=>({...point,id:sanitizeText(point.id),name:sanitizeText(point.name),latitude:sanitizeText(point.latitude),longitude:sanitizeText(point.longitude),inboundLeg:point.inboundLeg&&{...point.inboundLeg,notes:sanitizeText(point.inboundLeg.notes),tidalGate:sanitizeText(point.inboundLeg.tidalGate),weatherWindow:sanitizeText(point.inboundLeg.weatherWindow)}})),
  };
  return {ok:true,plan,migrated:false};
}

export function parsePassagePlanCache(raw: string | null): PassagePlan | null {
  const result=decodePassagePlanCache(raw);
  return result.ok && validatePassagePlan(result.plan).length===0 ? result.plan : null;
}

export type PassagePlanCalculationResult = {ok:true;totalDistanceNm:number;calculation:PassageCalculation}|{ok:false;issues:string[]};
/** Uses the shared calculator model and never throws on user/persisted input. */
export function calculatePassagePlanSummary(plan:PassagePlan):PassagePlanCalculationResult {
  const totalDistanceNm=totalRouteDistance(plan.points);
  if(plan.points.length<2){const departureIssues=validatePassagePlan(plan).filter(issue=>/departure time/i.test(issue));return {ok:false,issues:["Add a departure and at least one destination waypoint before calculating totals.",...departureIssues]};}
  const duration=totalDistanceNm/plan.speed;
  const input={distanceNm:totalDistanceNm,speedKnots:plan.speed,engineHours:duration,fuelLitresPerHour:plan.fuelRate??1,additionalFuelLitres:0,reservePercent:plan.reservePercent??0,usableFuelLitres:100000,departureTime:plan.departure};
  const issues=validatePassagePlan(plan).filter(issue=>/departure time|SOG|distance|duration|ETA|Fuel rate|Fuel reserve|total fuel/i.test(issue));
  if(issues.length)return {ok:false,issues};
  try { const calculation=calculatePassageValues(input);return Number.isFinite(calculation.hours)&&Number.isFinite(calculation.fuelWithReserveLitres)?{ok:true,totalDistanceNm,calculation}:{ok:false,issues:["Derived passage totals must be finite."]}; }
  catch(error){return {ok:false,issues:[error instanceof Error?error.message:"Passage calculation failed."]}}
}

export function validatePassagePlan(plan: PassagePlan, nowMs = Date.now()): string[] {
  const errors: string[] = [];
  if (!plan.name.trim()) errors.push("Plan name is required.");
  if (!plan.departure || Number.isNaN(Date.parse(plan.departure))) errors.push("Choose a valid departure time.");
  else { const departure=Date.parse(plan.departure),now=nowMs;if(departure<now-24*3_600_000||departure>now+366*24*3_600_000)errors.push("Departure must be no more than 24 hours ago and no more than one year ahead."); }
  if (!Number.isFinite(plan.speed) || plan.speed <= 0 || plan.speed > 80) errors.push("SOG must be greater than 0 and no more than 80 knots.");
  if(plan.coordinateFormat!=="degrees-decimal-minutes"||plan.datum!=="WGS84"||!plan.coordinatePrecision.trim())errors.push("Coordinate format, WGS84 datum and stated precision are required.");
  const safetyFields=[["departure berth",plan.safety?.departureBerth],["destination berth",plan.safety?.destinationBerth],["operating limits",plan.safety?.limits],["abort decision",plan.safety?.abortDecision],["safe alternatives",plan.safety?.alternatives]] as const;
  safetyFields.forEach(([label,value])=>{if(typeof value!=="string"||!value.trim())errors.push(`Safety: ${label} is required.`)});
  if(!/issue\s*[:#]?\s*\S+.*valid(?:ity)?\s*[:#]?\s*\S+/i.test(plan.provenance?.weather??""))errors.push("Provenance: weather must record forecast issue and validity.");
  if(!/(?:table|atlas|diamond|almanac).*?(?:edition|year)\s*[:#]?\s*\S+/i.test(plan.provenance?.tide??""))errors.push("Provenance: tide must identify the table/atlas and edition or year.");
  if(!/(?:chart)\s*(?:no\.?|number|#)\s*\d+.*edition\s*[:#]?\s*\S+.*correction/i.test(plan.provenance?.chart??""))errors.push("Provenance: chart must record chart number, edition and correction status.");
  if(!/(?:almanac|sailing directions|notices).*?(?:edition|year)\s*[:#]?\s*\S+/i.test(plan.provenance?.publications??""))errors.push("Provenance: publications must identify title and edition or year.");
  if(!plan.provenance?.preparedAt||Number.isNaN(Date.parse(plan.provenance.preparedAt)))errors.push("Provenance: valid prepared time is required.");
  if(!plan.provenance?.revisedAt||Number.isNaN(Date.parse(plan.provenance.revisedAt)))errors.push("Provenance: valid revised time is required.");
  if(plan.provenance?.preparedAt&&plan.provenance?.revisedAt){const prepared=Date.parse(plan.provenance.preparedAt),revised=Date.parse(plan.provenance.revisedAt),now=nowMs;if(Number.isFinite(prepared)&&Number.isFinite(revised)&&(prepared>revised||revised>now+5*60_000||prepared<now-30*24*3_600_000))errors.push("Provenance times must be within the last 30 days, not in the future, and revised at or after prepared.")}
  if (plan.points.length < 2) errors.push("Add a departure and at least one destination waypoint.");
  if (new Set(plan.points.map(point => point.id)).size !== plan.points.length) errors.push("Waypoint identifiers must be unique. Reload or reset this plan before editing.");
  plan.points.forEach((point, index) => {
    const label = index === 0 ? "Departure" : `Leg ${index}`;
    if (!point.name.trim()) errors.push(`${label}: waypoint name is required.`);
    if(!parseWaypointCoordinate(point.latitude,point.longitude))errors.push(`${label}: coordinates must be valid WGS84 degrees and decimal minutes (latitude DD°MM.mmm'N/S, longitude DDD°MM.mmm'E/W).`);
    if (index === 0 && point.inboundLeg !== null) errors.push("Departure must not have an inbound leg.");
    if (index > 0 && point.inboundLeg === null) errors.push(`${label}: inbound leg is required.`);
    if (index > 0 && point.inboundLeg) {
      if (!Number.isFinite(point.inboundLeg.distanceNm) || point.inboundLeg.distanceNm <= 0 || point.inboundLeg.distanceNm > 2000) errors.push(`${label}: distance must be greater than 0 and no more than 2,000 nm.`);
      if (!Number.isFinite(point.inboundLeg.course) || point.inboundLeg.course < 0 || point.inboundLeg.course >= 360) errors.push(`${label}: course must be between 0° and 359.9°.`);
    }
  });
  if (plan.fuelRate !== undefined && (!Number.isFinite(plan.fuelRate) || plan.fuelRate <= 0 || plan.fuelRate > 500)) errors.push("Fuel rate must be greater than 0 and no more than 500 litres/hour.");
  if (plan.reservePercent !== undefined && (!Number.isFinite(plan.reservePercent) || plan.reservePercent < 0 || plan.reservePercent > 200)) errors.push("Fuel reserve must be between 0% and 200%.");
  const total=totalRouteDistance(plan.points), duration=total/plan.speed, eta=Date.parse(plan.departure)+duration*3_600_000;
  if(plan.points.length>=2&&(!Number.isFinite(total)||total<=0||!Number.isFinite(duration)||duration<=0||duration>1000))errors.push("Derived route duration must be finite, positive and no more than 1,000 hours.");
  else if(plan.points.length>=2&&(!Number.isFinite(eta)||Number.isNaN(new Date(eta).getTime())))errors.push("Departure plus route duration must produce a representable ETA.");
  if(plan.fuelRate!==undefined&&Number.isFinite(duration)){const fuel=duration*plan.fuelRate*(1+(plan.reservePercent??0)/100);if(!Number.isFinite(fuel)||fuel<=0||fuel>100000)errors.push("Derived total fuel must be finite, positive and no more than 100,000 litres.");}
  return errors;
}

export function passagePlanCacheKey(userId: string | null, anonymousSessionId: string): string {
  return `day-skipper-passage-plan:${userId ?? `anonymous:${anonymousSessionId}`}`;
}
