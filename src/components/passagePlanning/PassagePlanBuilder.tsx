import { useCallback, useEffect, useMemo, useState, type SetStateAction } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { calculateLegEtas, totalRouteDistance, type PlanLeg, type PlanWaypoint } from "@/features/passagePlanning/calculations";
import {
  PASSAGE_PLAN_CACHE_VERSION,
  parsePassagePlanCache,
  passagePlanCacheKey,
  removeWaypoint,
  reorderWaypoint,
  validatePassagePlan,
  type PassagePlan,
} from "@/features/passagePlanning/passagePlan";
import { useProgress } from "@/hooks/useProgress";
import { TOPIC_IDS } from "@/constants/topicRegistry";
import { useAuth } from "@/contexts/AuthHooks";
import { readStored, writeStored } from "@/features/persistence/browserStorage";

const ANONYMOUS_SESSION_KEY = "day-skipper-passage-plan-anonymous-session";
const example: PlanWaypoint[] = [
  { id:"1", name:"Portsmouth entrance", latitude:"50°47.4'N", longitude:"001°06.5'W", inboundLeg:null },
  { id:"2", name:"Bembridge Ledge", latitude:"50°41.0'N", longitude:"001°04.0'W", inboundLeg:{ course:225, distanceNm:7, notes:"Keep clear of main channel", tidalGate:"Depart HW Portsmouth -1h to +1h", weatherWindow:"Visibility > 3nm; wind ≤ F5" } },
  { id:"3", name:"Bembridge Harbour", latitude:"50°41.4'N", longitude:"001°05.4'W", inboundLeg:{ course:270, distanceNm:9, notes:"Check overfalls", tidalGate:"Round before west-going stream strengthens", weatherWindow:"Avoid wind against tide" } },
];
const blank = (departure = false): PlanWaypoint => ({ id:crypto.randomUUID(), name:"", latitude:"", longitude:"", inboundLeg:departure ? null : { course:0, distanceNm:0, notes:"", tidalGate:"", weatherWindow:"" } });
const initialPlan = (): PassagePlan => ({ version:PASSAGE_PLAN_CACHE_VERSION, name:"Solent practice passage", departure:"2026-07-30T09:00", speed:5, fuelRate:2, reservePercent:20, points:example });
const anonymousSessionId = () => {
  let id = readStored(sessionStorage, ANONYMOUS_SESSION_KEY, {
    decode: (value) => typeof value === "string" && /^[0-9a-f-]{36}$/i.test(value) ? value : null,
  });
  if (!id) {
    id = crypto.randomUUID();
    writeStored(sessionStorage, ANONYMOUS_SESSION_KEY, id);
  }
  return id;
};

export function PassagePlanBuilder() {
  const { user } = useAuth();
  const { loadProgress, saveProgress } = useProgress();
  const [errors, setErrors] = useState<string[]>([]);
  const cacheKey = useMemo(() => passagePlanCacheKey(user?.id ?? null, anonymousSessionId()), [user?.id]);
  const [planState, setPlanState] = useState<{ key: string; plan: PassagePlan }>(() => ({ key:cacheKey, plan:initialPlan() }));
  // Never render state owned by a different auth/cache boundary, even for the
  // single render before effects run.
  const plan = planState.key === cacheKey ? planState.plan : initialPlan();
  const setPlan = useCallback((next: SetStateAction<PassagePlan>) => {
    setPlanState(previous => {
      const current = previous.key === cacheKey ? previous.plan : initialPlan();
      return { key:cacheKey, plan:typeof next === "function" ? next(current) : next };
    });
  }, [cacheKey]);

  useEffect(() => {
    let active = true;
    // Blank user-derived state synchronously at the auth/cache boundary. A
    // previous account's plan must not remain visible while hydration waits.
    setPlan(initialPlan());
    setErrors([]);
    const cached = readStored(localStorage, cacheKey, {
      decode: (value) => parsePassagePlanCache(JSON.stringify(value)),
    });
    if (cached) {
      setPlan(cached);
    } else if (user) {
      void loadProgress("passage-planning-builder").then(row => {
        const history = row?.answers_history;
        const persisted = history && typeof history === "object" && !Array.isArray(history) && "plan" in history
          ? parsePassagePlanCache(JSON.stringify(history.plan))
          : null;
        if (active) setPlan(persisted ?? initialPlan());
      });
    }
    return () => { active = false; };
  }, [cacheKey, loadProgress, setPlan, user]);

  const etas = useMemo(() => calculateLegEtas(plan.points, plan.departure, plan.speed), [plan.points, plan.departure, plan.speed]);
  const total = totalRouteDistance(plan.points);
  const updatePoint = (id: string, key: "name" | "latitude" | "longitude", value: string) =>
    setPlan(current => ({ ...current, points:current.points.map(point => point.id === id ? { ...point, [key]:value } : point) }));
  const updateLeg = (id: string, key: keyof PlanLeg, value: string) =>
    setPlan(current => ({ ...current, points:current.points.map(point => point.id === id && point.inboundLeg ? { ...point, inboundLeg:{ ...point.inboundLeg, [key]:key === "course" || key === "distanceNm" ? Number(value) : value } } : point) }));
  const removePoint = (id: string) => setPlan(current => ({ ...current, points:removeWaypoint(current.points, id) }));
  const movePoint = (index: number, offset: -1 | 1) => setPlan(current => {
    const target = index + offset;
    if (target < 0 || target >= current.points.length) return current;
    return { ...current, points:reorderWaypoint(current.points, index, target) };
  });
  const setNumeric = (key: "speed" | "fuelRate" | "reservePercent", value: string) => setPlan(current => ({ ...current, [key]:value === "" ? undefined : Number(value) }));
  const save = async () => {
    const validationErrors = validatePassagePlan(plan);
    setErrors(validationErrors);
    if (validationErrors.length) return;
    writeStored(localStorage, cacheKey, plan);
    await saveProgress(TOPIC_IDS.PASSAGE_PLANNING_BUILDER, true, 100, 15, { plan });
  };

  return <div className="space-y-5">
    <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
      <div><Label htmlFor="plan-name">Plan name</Label><Input id="plan-name" value={plan.name} onChange={event => setPlan(current => ({ ...current, name:event.target.value }))}/></div>
      <div><Label htmlFor="departure">Departure</Label><Input id="departure" type="datetime-local" value={plan.departure} onChange={event => setPlan(current => ({ ...current, departure:event.target.value }))}/></div>
      <div><Label htmlFor="speed">SOG (knots)</Label><Input id="speed" type="number" min="0.1" max="80" value={plan.speed ?? ""} onChange={event => setNumeric("speed", event.target.value)}/></div>
      <div><Label htmlFor="fuel-rate">Fuel rate (L/h, optional)</Label><Input id="fuel-rate" type="number" min="0.1" max="500" value={plan.fuelRate ?? ""} onChange={event => setNumeric("fuelRate", event.target.value)}/></div>
      <div><Label htmlFor="fuel-reserve">Fuel reserve (%, optional)</Label><Input id="fuel-reserve" type="number" min="0" max="200" value={plan.reservePercent ?? ""} onChange={event => setNumeric("reservePercent", event.target.value)}/></div>
    </div>
    {errors.length > 0 && <div role="alert" className="rounded-md border border-destructive p-4 text-destructive"><p className="font-semibold">Fix the following before saving:</p><ul className="list-disc pl-5">{errors.map(error => <li key={error}>{error}</li>)}</ul></div>}
    <p className="text-sm text-muted-foreground">Waypoints are ordered from departure to destination. Each arrival waypoint contains the course, distance, gate, weather and notes for the leg from the waypoint immediately above it.</p>
    {plan.points.map((point, index) => <Card key={point.id} className="break-inside-avoid">
      <CardHeader className="flex-row items-center justify-between gap-2"><CardTitle>{index === 0 ? "Departure" : `Leg ${index}: ${plan.points[index - 1].name || "previous waypoint"} → ${point.name || "arrival waypoint"}`}</CardTitle><div className="flex gap-1"><Button aria-label={`Move waypoint ${index + 1} up`} variant="outline" size="sm" disabled={index === 0} onClick={() => movePoint(index, -1)}>↑</Button><Button aria-label={`Move waypoint ${index + 1} down`} variant="outline" size="sm" disabled={index === plan.points.length - 1} onClick={() => movePoint(index, 1)}>↓</Button><Button aria-label={`Remove waypoint ${index + 1}`} variant="destructive" size="sm" onClick={() => removePoint(point.id)}>Remove</Button></div></CardHeader>
      <CardContent className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {(["name","latitude","longitude"] as const).map(key => <div key={key}><Label htmlFor={`${point.id}-${key}`}>{({ name:index === 0 ? "Departure waypoint" : index === plan.points.length - 1 ? "Destination waypoint" : "Arrival waypoint", latitude:"Latitude", longitude:"Longitude" } as const)[key]}</Label><Input id={`${point.id}-${key}`} value={point[key]} onChange={event => updatePoint(point.id, key, event.target.value)}/></div>)}
        {point.inboundLeg && <>
          {(["course","distanceNm","tidalGate","weatherWindow"] as const).map(key => <div key={key}><Label htmlFor={`${point.id}-${key}`}>{({ course:"Course for inbound leg (°)", distanceNm:"Distance for inbound leg (nm)", tidalGate:"Tidal gate for inbound leg", weatherWindow:"Weather for inbound leg" } as const)[key]}</Label><Input id={`${point.id}-${key}`} type={key === "course" || key === "distanceNm" ? "number" : "text"} value={point.inboundLeg[key]} onChange={event => updateLeg(point.id, key, event.target.value)}/></div>)}
          <div className="sm:col-span-2 lg:col-span-3"><Label htmlFor={`${point.id}-notes`}>Notes for inbound leg and arrival</Label><Textarea id={`${point.id}-notes`} value={point.inboundLeg.notes} onChange={event => updateLeg(point.id, "notes", event.target.value)}/></div>
          <p>Arrival ETA: <b>{etas[index - 1] ? new Date(etas[index - 1]).toLocaleString() : "—"}</b></p>
        </>}
      </CardContent>
    </Card>)}
    <div className="print:hidden flex flex-wrap gap-2"><Button variant="outline" onClick={() => setPlan(current => ({ ...current, points:[...current.points, blank(current.points.length === 0)] }))}>Add waypoint</Button><Button onClick={save}>Save & complete plan</Button><Button variant="outline" onClick={() => window.print()}>Print plan</Button></div>
    <Card><CardContent className="pt-6"><b>Total: {total.toFixed(1)} nm · {plan.speed > 0 ? (total / plan.speed).toFixed(1) : "—"} hours</b>{plan.fuelRate !== undefined && plan.speed > 0 && <span> · Fuel with {plan.reservePercent ?? 0}% reserve: {(total / plan.speed * plan.fuelRate * (1 + (plan.reservePercent ?? 0) / 100)).toFixed(1)} L</span>}</CardContent></Card>
  </div>;
}
