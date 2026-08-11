import { useCallback, useEffect, useMemo, useRef, useState, type SetStateAction } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { calculateLegEtas, isValidLatitude, isValidLongitude, parseWaypointCoordinate, routeGeometryIssues, totalRouteDistance, type PlanLeg, type PlanWaypoint } from "@/features/passagePlanning/calculations";
import {
  PASSAGE_PLAN_CACHE_VERSION,
  calculatePassagePlanSummary,
  decodePassagePlanRecord,
  insertWaypoint,
  makePassagePlanRecord,
  passagePlanCacheKey,
  reconcilePassagePlanRecords,
  removeWaypoint,
  reorderWaypoint,
  validatePassagePlan,
  type PassagePlan,
  type PassagePlanRecord,
} from "@/features/passagePlanning/passagePlan";
import { useProgress } from "@/hooks/useProgress";
import { TOPIC_IDS } from "@/constants/topicRegistry";
import { useAuth } from "@/contexts/AuthHooks";
import { readStored, writeStored } from "@/features/persistence/browserStorage";

const ANONYMOUS_SESSION_KEY = "day-skipper-passage-plan-anonymous-session";
const example: PlanWaypoint[] = [
  { id:"1", name:"Portsmouth entrance", latitude:"50°47.4'N", longitude:"001°06.5'W", inboundLeg:null },
  { id:"2", name:"Bembridge Ledge", latitude:"50°41.0'N", longitude:"001°04.0'W", inboundLeg:{ course:225, distanceNm:7, notes:"Keep clear of main channel", tidalGate:"Depart HW Portsmouth -1h to +1h", weatherWindow:"Visibility > 3nm; wind ≤ F5" } },
  { id:"3", name:"Bembridge Harbour", latitude:"50°41.4'N", longitude:"001°05.4'W", inboundLeg:{ course:270, distanceNm:1, notes:"Check overfalls", tidalGate:"Round before west-going stream strengthens", weatherWindow:"Avoid wind against tide" } },
];
const blank = (departure = false): PlanWaypoint => ({ id:crypto.randomUUID(), name:"", latitude:"", longitude:"", inboundLeg:departure ? null : { course:0, distanceNm:0, notes:"", tidalGate:"", weatherWindow:"" } });
const localDateTime=(date:Date)=>new Date(date.getTime()-date.getTimezoneOffset()*60_000).toISOString().slice(0,16);
const initialPlan = (): PassagePlan => ({ version:PASSAGE_PLAN_CACHE_VERSION, name:"Solent practice passage", departure:localDateTime(new Date(Date.now()+24*3_600_000)), speed:5, fuelRate:2, reservePercent:20, points:example, coordinateFormat:"degrees-decimal-minutes", datum:"WGS84", coordinatePrecision:"0.1 minute (about 185 m latitude)", safety:{departureBerth:"Portsmouth berth to harbour entrance",destinationBerth:"Bembridge harbour entrance to allocated berth",limits:"Wind no more than F5; visibility at least 3 nm; remain within vessel draft and crew limits",abortDecision:"Delay before departure or abort/divert before Bembridge approach if any limit is exceeded",alternatives:"Return Portsmouth; divert Cowes; hold offshore only if conditions and traffic permit",manualVerification:""},provenance:{weather:"",tide:"",chart:"",publications:"",preparedAt:"",revisedAt:""} });
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
  const progress = useProgress();
  const { loadProgress, saveProgress } = progress;
  const [errors, setErrors] = useState<string[]>([]);
  const [status, setStatus] = useState("");
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [syncState,setSyncState]=useState<"loading"|"local"|"saving"|"queued"|"synced"|"failed"|"conflict"|"completed">("loading");
  const [conflict,setConflict]=useState<{local:PassagePlanRecord;remote:PassagePlanRecord}|null>(null);
  const [anonymousCandidate,setAnonymousCandidate]=useState<PassagePlanRecord|null>(null);
  const recordRef=useRef<PassagePlanRecord|null>(null);
  const mutationRevision = useRef(0);
  const [manualRevision,setManualRevision]=useState<number|null>(null);
  const [freshnessRevision,setFreshnessRevision]=useState<number|null>(null);
  const [undo, setUndo] = useState<{ plan: PassagePlan; message: string; focusId: string } | null>(null);
  const cacheKey = useMemo(() => passagePlanCacheKey(user?.id ?? null, anonymousSessionId()), [user?.id]);
  const ownerId=user?.id ?? `anonymous:${anonymousSessionId()}`;
  const [planState, setPlanState] = useState<{ key: string; plan: PassagePlan }>(() => ({ key:cacheKey, plan:initialPlan() }));
  const [savedPlan, setSavedPlan] = useState<PassagePlan>(() => initialPlan());
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
    const fresh = initialPlan();
    setPlan(fresh);
    setSavedPlan(fresh);
    setErrors([]);
    setDirty(false);
    setUndo(null);
    setStatus("Loading saved plan…");setSyncState("loading");setConflict(null);setAnonymousCandidate(null);recordRef.current=null;
    setManualRevision(null);
    setFreshnessRevision(null);
    mutationRevision.current = 0;
    let localFailure="";let local:PassagePlanRecord|null=null;
    try { const raw=localStorage.getItem(cacheKey);const decoded=decodePassagePlanRecord(raw,ownerId);if(decoded.ok)local=decoded.record;else if(raw!==null)localFailure=decoded.message; } catch { localFailure="Saved-plan storage is unavailable."; }
    const applyRecord=(record:PassagePlanRecord,state:typeof syncState,remoteSource=false)=>{recordRef.current=record;setPlan(record.plan);setSavedPlan(record.plan);setSyncState(state);setDirty(false);setStatus(state==="completed"?"Completed plan loaded.":state==="synced"?"Plan synced.":"Local draft loaded.");const validation=validatePassagePlan(record.plan);if(validation.length)setErrors([remoteSource?"The remote plan was recovered but needs correction; its safe fields have been preserved.":"Saved plan was recovered but needs correction; its safe fields have been preserved.",...validation]);};
    if(!user){if(local)applyRecord(local,local.completedRevision===local.revision?"completed":"local");else {setSyncState("local");setStatus("New anonymous local draft.");if(localFailure)setErrors([`${localFailure} The training example is shown instead; verify every value before use.`]);}}
    else { const anonymousOwner=`anonymous:${anonymousSessionId()}`;try{const candidate=decodePassagePlanRecord(localStorage.getItem(passagePlanCacheKey(null,anonymousSessionId())),anonymousOwner);if(candidate.ok)setAnonymousCandidate(candidate.record);}catch{/* storage warning is handled above */} void loadProgress("passage-planning-builder").then(row=>{
      if(!active||mutationRevision.current>0)return;const history=row?.answers_history;const raw=history&&typeof history==="object"&&!Array.isArray(history)?JSON.stringify((history as Record<string,unknown>).passagePlanRecord ?? (history as Record<string,unknown>).plan ?? null):null;const remoteDecoded=decodePassagePlanRecord(raw,ownerId);const remote=remoteDecoded.ok?remoteDecoded.record:null;const choice=reconcilePassagePlanRecords(local,remote);
      if(choice?.status==="conflict"){setConflict({local:choice.local,remote:choice.remote});setSyncState("conflict");setStatus("Conflicting local and remote drafts need your choice.");applyRecord(choice.local,"conflict");return;}
      if(choice){applyRecord(choice.record,choice.record.completedRevision===choice.record.revision?"completed":choice.status==="remote"||choice.status==="same"?"synced":"local",choice.status==="remote");if(localFailure&&choice.status==="remote")setErrors(previous=>[`${localFailure} No local values were used.`,...previous]);if(choice.status==="remote"&&!remoteDecoded.migrated)writeStored(localStorage,cacheKey,choice.record);}
      else {setSyncState("local");setStatus("No saved plan found; a new local draft is ready.");if(localFailure)setErrors([`${localFailure} No local values were used. No remote plan was available; the training example is shown and must be verified.`]);else if(raw)setErrors([`${remoteDecoded.ok?"":remoteDecoded.message} The training example is shown instead; no saved-plan values were silently used.`]);}
    });}
    return () => { active = false; };
  }, [cacheKey, loadProgress, ownerId, setPlan, user]);

  useEffect(()=>{if(!dirty||saving||syncState==="loading"||syncState==="conflict")return;const timer=window.setTimeout(()=>{const record=makePassagePlanRecord(plan,ownerId,recordRef.current);recordRef.current=record;writeStored(localStorage,cacheKey,record);setSavedPlan(plan);setDirty(false);setSyncState("local");setStatus("Draft saved locally. Sign in or complete the plan to sync it.");},400);return()=>window.clearTimeout(timer)},[cacheKey,dirty,ownerId,plan,saving,syncState]);

  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => { if (dirty) { event.preventDefault();event.returnValue=""; } };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const etas = useMemo(() => calculateLegEtas(plan.points, plan.departure, plan.speed), [plan.points, plan.departure, plan.speed]);
  const summary = useMemo(()=>calculatePassagePlanSummary(plan),[plan]);
  const markChanged = () => { mutationRevision.current += 1;setManualRevision(null);setFreshnessRevision(null);setDirty(true);setUndo(null); };
  const updatePoint = (id: string, key: "name" | "latitude" | "longitude", value: string) => {
    markChanged();setPlan(current => ({ ...current, points:current.points.map(point => point.id === id ? { ...point, [key]:value } : point) }));
  };
  const updateLeg = (id: string, key: keyof PlanLeg, value: string) => {
    markChanged();setPlan(current => ({ ...current, points:current.points.map(point => point.id === id && point.inboundLeg ? { ...point, inboundLeg:{ ...point.inboundLeg, [key]:key === "course" || key === "distanceNm" ? Number(value) : value } } : point) }));
  };
  const focusWaypoint = (id: string) => window.setTimeout(() => document.getElementById(`${id}-name`)?.focus(), 0);
  const announce = (message: string, next: PassagePlan) => {
    const issues = validatePassagePlan(next).length;
    setStatus(`${message} Route total ${totalRouteDistance(next.points).toFixed(1)} nautical miles. ${issues} validation ${issues === 1 ? "issue" : "issues"}.`);
    mutationRevision.current += 1;setDirty(true);
  };
  const removePoint = (id: string) => {
    const index = plan.points.findIndex(point => point.id === id);
    const point = plan.points[index];
    if (!point) return;
    const affected = index < plan.points.length - 1 ? ` The inbound leg to ${plan.points[index + 1].name || "the following waypoint"} will be cleared.` : "";
    if (!window.confirm(`Remove ${point.name || `waypoint ${index + 1}`}?${affected}`)) return;
    const previous = plan;
    const points = removeWaypoint(plan.points, id);
    const next = { ...plan, points };
    setUndo({ plan:previous, message:`Restored ${point.name || `waypoint ${index + 1}`}.`, focusId:id });
    setPlan(next);
    const focus = points[Math.min(index, points.length - 1)]?.id;
    if (focus) focusWaypoint(focus);
    announce(`Removed ${point.name || "unnamed waypoint"} from position ${index + 1}.${affected}`, next);
  };
  const movePoint = (index: number, offset: -1 | 1) => {
    const target = index + offset;
    if (target < 0 || target >= plan.points.length) return;
    const next = { ...plan, points:reorderWaypoint(plan.points, index, target) };
    const moved = next.points[target];
    setUndo(null);setPlan(next);focusWaypoint(moved.id);
    announce(`Moved ${moved.name || "unnamed waypoint"} to position ${target + 1}. Changed inbound legs were cleared.`, next);
  };
  const addPoint = (index: number) => {
    const point = blank(plan.points.length === 0);
    const next = { ...plan, points:insertWaypoint(plan.points, point, index) };
    setPlan(next);setUndo(null);focusWaypoint(point.id);
    announce(`Added waypoint at position ${index + 1}.`, next);
  };
  const undoChange = () => {
    if (!undo) return;
    mutationRevision.current += 1;setPlan(undo.plan);setStatus(undo.message);focusWaypoint(undo.focusId);setUndo(null);setDirty(true);
  };
  const setNumeric = (key: "speed" | "fuelRate" | "reservePercent", value: string) => { markChanged();setPlan(current => ({ ...current, [key]:value === "" ? undefined : Number(value) })); };
  const setSafety = (key:keyof PassagePlan["safety"],value:string)=>{markChanged();setPlan(current=>({...current,safety:{...current.safety,[key]:value}}))};
  const setProvenance = (key:keyof PassagePlan["provenance"],value:string)=>{markChanged();setPlan(current=>({...current,provenance:{...current.provenance,[key]:value}}))};
  const save = async () => {
    if (saving) return;
    const validationErrors = validatePassagePlan(plan);
    if(manualRevision!==mutationRevision.current)validationErrors.push("A current independent manual route verification acknowledgement is required.");
    if(freshnessRevision!==mutationRevision.current)validationErrors.push("A current source-freshness acknowledgement is required.");
    setErrors(validationErrors);
    if (validationErrors.length) {
      const firstBadCoordinate=plan.points.find(point=>!parseWaypointCoordinate(point.latitude,point.longitude));
      const firstSafety=(["departureBerth","destinationBerth","limits","abortDecision","alternatives"] as const).find(key=>!plan.safety[key].trim());
      const target=firstBadCoordinate?`${firstBadCoordinate.id}-${isValidLatitude(firstBadCoordinate.latitude)?"longitude":"latitude"}`:firstSafety?`safety-${firstSafety}`:!plan.name.trim()?"plan-name":!plan.departure?"departure":null;
      window.setTimeout(()=>target?document.getElementById(target)?.focus():document.getElementById("plan-errors")?.focus(),0);return;
    }
    const base=recordRef.current;
    const draft=base&&JSON.stringify(base.plan)===JSON.stringify(plan)?base:makePassagePlanRecord(plan,ownerId,base);
    recordRef.current=draft;writeStored(localStorage, cacheKey, draft);
    const submittedPlan = plan;
    const submittedRevision = mutationRevision.current;
    setSaving(true);setSyncState("saving");setStatus("Saving plan completion…");
    try {
      const saveDetailed=(progress as {saveProgressDetailed?:typeof saveProgress}).saveProgressDetailed;
      const outcome=saveDetailed?await saveDetailed(TOPIC_IDS.PASSAGE_PLANNING_BUILDER,true,100,15,{passagePlanRecord:{...draft,completedRevision:draft.revision},plan:submittedPlan}):await saveProgress(TOPIC_IDS.PASSAGE_PLANNING_BUILDER, true, 100, 15, { plan:submittedPlan });
      const saved=outcome===true||outcome==="remote"||outcome==="queued"||outcome==="anonymous";
      if (saved) {
        const completed={...draft,completedRevision:draft.revision};recordRef.current=completed;writeStored(localStorage,cacheKey,completed);
        setSavedPlan(submittedPlan);
        if (mutationRevision.current === submittedRevision) { setDirty(false);setUndo(null);setSyncState(outcome==="queued"?"queued":outcome==="anonymous"?"local":"completed");setStatus(outcome==="queued"?"Plan completion queued offline and will sync when online.":outcome==="anonymous"?"Plan completed in local anonymous storage. Sign in and explicitly migrate it to sync.":"Plan saved locally and completion persisted; it is synced and completed. No unsaved changes remain."); }
        else { setDirty(true);setStatus("Submitted plan persisted, but newer route changes remain unsaved. Save again when ready."); }
      }
      else { setDirty(true);setSyncState(outcome==="conflict"?"conflict":"failed");setStatus(outcome==="conflict"?"Remote plan changed. Resolve the conflict before retrying completion.":"Plan saved locally, but completion was not persisted. Retry saving when ready."); }
    } catch {
      setDirty(true);setSyncState("failed");setStatus("Plan saved locally, but completion persistence failed. Your edits remain available; retry saving when ready.");
    } finally { setSaving(false); }
  };
  const saveDraft=()=>{const record=makePassagePlanRecord(plan,ownerId,recordRef.current);recordRef.current=record;writeStored(localStorage,cacheKey,record);setSavedPlan(plan);setDirty(false);setSyncState("local");setStatus("Draft saved locally. It is not marked complete.");};
  const chooseConflict=(selected:PassagePlanRecord)=>{const resolved=makePassagePlanRecord(selected.plan,ownerId,{...selected,revision:Math.max(conflict?.local.revision??0,conflict?.remote.revision??0)});recordRef.current=resolved;writeStored(localStorage,cacheKey,resolved);setPlan(resolved.plan);setSavedPlan(resolved.plan);setConflict(null);setDirty(true);setSyncState("local");setStatus("Conflict resolved into a new local revision. Save to sync it.");};
  const migrateAnonymous=()=>{if(!anonymousCandidate||!user)return;const migrated=makePassagePlanRecord(anonymousCandidate.plan,user.id,recordRef.current);recordRef.current=migrated;writeStored(localStorage,cacheKey,migrated);setPlan(migrated.plan);setSavedPlan(migrated.plan);setAnonymousCandidate(null);setDirty(true);setSyncState("local");setStatus("Anonymous draft copied safely to this account as a new revision. Save or complete it to sync.");};
  const reset = () => {
    if (dirty && !window.confirm("Discard all unsaved route changes and restore the last saved plan?")) return;
    mutationRevision.current += 1;setManualRevision(null);setFreshnessRevision(null);const next=savedPlan;setPlan(next);setErrors([]);setUndo(null);setDirty(false);setStatus("Unsaved changes discarded; last saved plan restored.");focusWaypoint(next.points[0].id);
  };

  return <div className="space-y-5">
    <p className="sr-only" role="status" aria-live="polite">{status}</p>
    <div className="rounded-md border p-3 text-sm"><strong>Persistence: {syncState.replace("-"," ")}</strong><span> — {status}</span>{syncState==="failed"&&<Button className="ml-2" size="sm" variant="outline" onClick={save}>Retry sync</Button>}</div>
    {conflict&&<div role="alert" className="rounded-md border border-amber-600 p-3"><strong>Local and remote plans conflict.</strong><p>Choose which draft to keep. The choice creates a newer revision; neither source is silently overwritten.</p><div className="flex gap-2"><Button variant="outline" onClick={()=>chooseConflict(conflict.local)}>Keep local draft</Button><Button variant="outline" onClick={()=>chooseConflict(conflict.remote)}>Use remote draft</Button></div></div>}
    {anonymousCandidate&&<div className="rounded-md border border-amber-600 p-3"><strong>Anonymous draft available.</strong><p>It remains separate from your account unless you explicitly copy it.</p><Button variant="outline" onClick={migrateAnonymous}>Copy anonymous draft to my account</Button></div>}
    <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
      <div><Label htmlFor="plan-name">Plan name</Label><Input id="plan-name" value={plan.name} onChange={event => {markChanged();setPlan(current => ({ ...current, name:event.target.value }))}}/></div>
      <div><Label htmlFor="departure">Departure</Label><Input id="departure" type="datetime-local" value={plan.departure} onChange={event => {markChanged();setPlan(current => ({ ...current, departure:event.target.value }))}}/></div>
      <div><Label htmlFor="speed">SOG (knots)</Label><Input id="speed" type="number" min="0.1" max="80" value={plan.speed ?? ""} onChange={event => setNumeric("speed", event.target.value)}/></div>
      <div><Label htmlFor="fuel-rate">Fuel rate (L/h, optional)</Label><Input id="fuel-rate" type="number" min="0.1" max="500" value={plan.fuelRate ?? ""} onChange={event => setNumeric("fuelRate", event.target.value)}/></div>
      <div><Label htmlFor="fuel-reserve">Fuel reserve (%, optional; blank means 0%)</Label><Input id="fuel-reserve" type="number" min="0" max="200" step="0.1" value={plan.reservePercent ?? ""} onChange={event => setNumeric("reservePercent", event.target.value)}/></div>
    </div>
    {errors.length > 0 && <div id="plan-errors" tabIndex={-1} role="alert" className="rounded-md border border-destructive p-4 text-destructive"><p className="font-semibold">Fix the following before saving:</p><ul className="list-disc pl-5">{errors.map(error => <li key={error}>{error}</li>)}</ul></div>}
    <p className="text-sm text-muted-foreground">Waypoints are ordered from departure to destination. Each arrival waypoint contains the course, distance, gate, weather and notes for the leg from the waypoint immediately above it.</p>
    <fieldset className="grid gap-3 rounded-md border p-4 sm:grid-cols-2"><legend className="font-semibold">Berth-to-berth safety and PREPARE decisions</legend>{(["departureBerth","destinationBerth","limits","abortDecision","alternatives"] as const).map(key=><div key={key}><Label htmlFor={`safety-${key}`}>{({departureBerth:"Departure berth and exit",destinationBerth:"Destination approach and berth",limits:"Explicit operating limits and gates",abortDecision:"Go/delay/divert/abort triggers",alternatives:"Safe alternatives"} as const)[key]}</Label><Textarea id={`safety-${key}`} value={plan.safety[key]} onChange={event=>setSafety(key,event.target.value)}/></div>)}<label className="flex items-start gap-2"><input type="checkbox" checked={manualRevision===mutationRevision.current} onChange={event=>setManualRevision(event.target.checked?mutationRevision.current:null)}/><span>I independently checked this current route on the stated chart/publications; this builder does not prove hazard clearance.</span></label></fieldset>
    <fieldset className="grid gap-3 rounded-md border p-4 sm:grid-cols-2"><legend className="font-semibold">Current source provenance</legend>{(["weather","tide","chart","publications"] as const).map(key=><div key={key}><Label htmlFor={`source-${key}`}>{`Current ${key} source, edition/issue and validity`}</Label><Input id={`source-${key}`} value={plan.provenance[key]} onChange={event=>setProvenance(key,event.target.value)}/></div>)}{(["preparedAt","revisedAt"] as const).map(key=><div key={key}><Label htmlFor={`source-${key}`}>{key==="preparedAt"?"Prepared at":"Revised at"}</Label><Input id={`source-${key}`} type="datetime-local" value={plan.provenance[key]} onChange={event=>setProvenance(key,event.target.value)}/></div>)}</fieldset>
    <label className="flex items-start gap-2 rounded-md border border-amber-600 p-3 text-sm"><input type="checkbox" checked={freshnessRevision===mutationRevision.current} onChange={event=>setFreshnessRevision(event.target.checked?mutationRevision.current:null)}/><span><strong>Source freshness policy:</strong> I checked issue/validity and correction status now. Prepared/revised times must be within 30 days, not future, and ordered; departure must be within 24 hours past to one year ahead. Recheck sources immediately before departure.</span></label>
    {plan.points.map((point, index) => <Card key={point.id} className="break-inside-avoid">
      <CardHeader className="flex-row items-center justify-between gap-2"><CardTitle>{index === 0 ? "Departure" : `Leg ${index}: ${plan.points[index - 1].name || "previous waypoint"} → ${point.name || "arrival waypoint"}`}</CardTitle><div className="flex flex-wrap gap-1"><Button aria-label={`Move ${point.name || `waypoint ${index + 1}`} up`} variant="outline" size="sm" disabled={index === 0} onClick={() => movePoint(index, -1)}>↑</Button><Button aria-label={`Move ${point.name || `waypoint ${index + 1}`} down`} variant="outline" size="sm" disabled={index === plan.points.length - 1} onClick={() => movePoint(index, 1)}>↓</Button><Button aria-label={`Insert waypoint after ${point.name || `waypoint ${index + 1}`}`} variant="outline" size="sm" onClick={() => addPoint(index + 1)}>Insert after</Button><Button aria-label={`Remove ${point.name || `waypoint ${index + 1}`}`} variant="destructive" size="sm" onClick={() => removePoint(point.id)}>Remove</Button></div></CardHeader>
      <CardContent className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {(["name","latitude","longitude"] as const).map(key => {const coordinateInvalid=key==="latitude"?!isValidLatitude(point.latitude):key==="longitude"?!isValidLongitude(point.longitude):false;return <div key={key}><Label htmlFor={`${point.id}-${key}`}>{({ name:index === 0 ? "Departure waypoint" : index === plan.points.length - 1 ? "Destination waypoint" : "Arrival waypoint", latitude:"WGS84 latitude (DD°MM.mmm'N/S)", longitude:"WGS84 longitude (DDD°MM.mmm'E/W)" } as const)[key]}</Label><Input id={`${point.id}-${key}`} aria-invalid={coordinateInvalid||undefined} aria-describedby={coordinateInvalid?`${point.id}-${key}-error`:undefined} value={point[key]} onChange={event => updatePoint(point.id, key, event.target.value)}/>{coordinateInvalid&&<p id={`${point.id}-${key}-error`} className="text-sm text-destructive">Enter a valid {key} in degrees and decimal minutes with hemisphere.</p>}</div>})}
        {point.inboundLeg && <>
          {(["course","distanceNm","tidalGate","weatherWindow"] as const).map(key => <div key={key}><Label htmlFor={`${point.id}-${key}`}>{({ course:"Course for inbound leg (°)", distanceNm:"Distance for inbound leg (nm)", tidalGate:"Tidal gate for inbound leg", weatherWindow:"Weather for inbound leg" } as const)[key]}</Label><Input id={`${point.id}-${key}`} type={key === "course" || key === "distanceNm" ? "number" : "text"} value={point.inboundLeg[key]} onChange={event => updateLeg(point.id, key, event.target.value)}/></div>)}
          <div className="sm:col-span-2 lg:col-span-3"><Label htmlFor={`${point.id}-notes`}>Notes for inbound leg and arrival</Label><Textarea id={`${point.id}-notes`} value={point.inboundLeg.notes} onChange={event => updateLeg(point.id, "notes", event.target.value)}/></div>
          <p>Arrival ETA: <b>{etas[index - 1] ? new Date(etas[index - 1]).toLocaleString() : "—"}</b></p>
        </>}
      </CardContent>
    </Card>)}
    <div className="print:hidden flex flex-wrap gap-2"><Button variant="outline" onClick={() => addPoint(plan.points.length)}>Add waypoint at end</Button>{undo && <Button variant="outline" onClick={undoChange}>Undo last removal</Button>}<Button variant="outline" disabled={saving} onClick={saveDraft}>Save draft</Button><Button disabled={saving||syncState==="conflict"} onClick={save}>{saving ? "Saving plan…" : "Save & complete plan"}</Button><Button variant="outline" onClick={reset}>Reset unsaved changes</Button><Button variant="outline" onClick={() => window.print()}>Print plan</Button></div>
    <Card><CardContent className="pt-6">{summary.ok?<><b>Total: {summary.totalDistanceNm.toFixed(1)} nm · {summary.calculation.hours.toFixed(1)} hours</b>{plan.fuelRate !== undefined&&<span> · Fuel with {plan.reservePercent ?? 0}% reserve: {summary.calculation.fuelWithReserveLitres.toFixed(1)} L</span>}</>:<b>Totals unavailable until calculation inputs are corrected.</b>}</CardContent></Card>
    {routeGeometryIssues(plan.points).length>0&&<aside className="rounded-md border border-amber-600 p-3"><strong>Geometry advisories (not automatic rejection)</strong><ul className="list-disc pl-5">{routeGeometryIssues(plan.points).map(issue=><li key={issue}>{issue} Routed legs may legitimately detour; manually verify the intended course and track.</li>)}</ul></aside>}
    <div className="overflow-x-auto"><table className="w-full caption-bottom text-sm"><caption className="text-left font-semibold">Ordered route review — schematic values only, not evidence of hazard clearance</caption><thead><tr><th scope="col">Position</th><th scope="col">Waypoint</th><th scope="col">WGS84 coordinate</th><th scope="col">Inbound leg</th><th scope="col">Arrival ETA</th></tr></thead><tbody>{plan.points.map((point,index)=><tr key={point.id}><th scope="row">{index+1}</th><td>{point.name||"Unnamed"}</td><td>{point.latitude} {point.longitude}</td><td>{point.inboundLeg?`${point.inboundLeg.course}° / ${point.inboundLeg.distanceNm} nm`:"Departure"}</td><td>{index?etas[index-1]?new Date(etas[index-1]).toLocaleString():"Invalid":"Departure time"}</td></tr>)}</tbody></table></div>
  </div>;
}
