import { type FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { calculatePlanSummary, GUIDED_WAYPOINTS, parsePilotageDraft, PILOTAGE_DRAFT_KEY, PILOTAGE_DRAFT_VERSION, validatePilotageWaypoint, validatePlanCoverage, type PilotagePlanSummary, type PilotageWaypoint } from "./pilotagePlan";

interface Props { readonly onComplete: (summary: PilotagePlanSummary) => Promise<boolean>; }
type LegDraft = Record<"name" | "bearing" | "distance" | "speedOverGround" | "mark" | "hazards" | "safeLimits" | "monitoring" | "depthAndTide" | "communications" | "abortAndContingency" | "notes", string>;
const emptyDraft = (): LegDraft => ({ name: "", bearing: "0", distance: "0.5", speedOverGround: "5", mark: "", hazards: "", safeLimits: "", monitoring: "", depthAndTide: "", communications: "", abortAndContingency: "", notes: "" });
const createId = () => `waypoint-${Date.now()}-${Math.random().toString(16).slice(2)}`;
const toDraft = (leg: PilotageWaypoint): LegDraft => ({ ...leg, bearing: String(leg.bearing), distance: String(leg.distance), speedOverGround: String(leg.speedOverGround) });

export const PilotagePlanBuilder = ({ onComplete }: Props) => {
  const [waypoints, setWaypoints] = useState<PilotageWaypoint[]>(() => parsePilotageDraft(localStorage.getItem(PILOTAGE_DRAFT_KEY))?.waypoints.slice() ?? [...GUIDED_WAYPOINTS]);
  const [draft, setDraft] = useState(emptyDraft);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [invalidField, setInvalidField] = useState<string | null>(null);
  const [briefed, setBriefed] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const coverage = useMemo(() => validatePlanCoverage(waypoints), [waypoints]);
  const summary = useMemo(() => coverage.length ? null : calculatePlanSummary(waypoints), [coverage.length, waypoints]);

  useEffect(() => { localStorage.setItem(PILOTAGE_DRAFT_KEY, JSON.stringify({ version: PILOTAGE_DRAFT_VERSION, waypoints })); }, [waypoints]);
  const changed = () => { setCompleted(false); setBriefed(false); };
  const update = (key: keyof LegDraft, value: string) => {
    setDraft((current) => ({ ...current, [key]: value }));
    const fieldId: Partial<Record<keyof LegDraft, string>> = { name: "waypoint-name", mark: "mark", bearing: "bearing", distance: "distance", speedOverGround: "sog", hazards: "hazards", safeLimits: "safe-limits", monitoring: "monitoring", depthAndTide: "depth-tide", communications: "communications", abortAndContingency: "contingency" };
    if (invalidField === fieldId[key]) { setInvalidField(null); setValidationError(null); setAnnouncement("Correction entered; submit to validate the leg."); }
  };
  const saveLeg = (event?: FormEvent) => {
    event?.preventDefault();
    const leg: PilotageWaypoint = { ...draft, id: editingId ?? createId(), name: draft.name.trim(), mark: draft.mark.trim(), bearing: Number(draft.bearing), distance: Number(draft.distance), speedOverGround: Number(draft.speedOverGround), hazards: draft.hazards.trim(), safeLimits: draft.safeLimits.trim(), monitoring: draft.monitoring.trim(), depthAndTide: draft.depthAndTide.trim(), communications: draft.communications.trim(), abortAndContingency: draft.abortAndContingency.trim(), notes: draft.notes.trim() };
    const error = validatePilotageWaypoint(leg); if (error) {
      setValidationError(error);
      const id = error.includes("name") ? "waypoint-name" : error.includes("mark") ? "mark" : error.includes("Course") ? "bearing" : error.includes("Distance") ? "distance" : error.includes("SOG") ? "sog" : error.includes("hazard") ? "hazards" : error.includes("safe limit") ? "safe-limits" : error.includes("monitoring") ? "monitoring" : error.includes("depth") ? "depth-tide" : error.includes("communications") ? "communications" : "contingency";
      requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>(`#${id}`)?.focus());
      setInvalidField(id);
      setAnnouncement(`Leg not saved. ${error}`);
      return;
    }
    setWaypoints((current) => editingId ? current.map((item) => item.id === editingId ? leg : item) : [...current, leg]);
    setDraft(emptyDraft()); setEditingId(null); setValidationError(null); setInvalidField(null); changed(); setAnnouncement(editingId ? `Updated ${leg.name}.` : `Added ${leg.name}.`);
  };
  const move = (index: number, direction: -1 | 1) => setWaypoints((current) => { const next = [...current]; [next[index], next[index + direction]] = [next[index + direction], next[index]]; return next; });

  let cumulative = 0;
  return <div className="space-y-6">
    <p className="sr-only" role="status" aria-live="polite">{announcement}</p>
    <section className="hidden print:block" data-testid="print-cockpit-plan"><h2 className="text-xl font-bold">Pilotage cockpit plan — fictional training scenario</h2><p>{summary ? `${summary.totalDistance} NM · ${summary.estimatedMinutes} minutes estimated` : "Draft requires correction before use"}</p>{waypoints.map((leg, index) => { const cumulativeMinutes = waypoints.slice(0, index + 1).reduce((sum, item) => sum + item.distance / item.speedOverGround * 60, 0); return <article key={leg.id} className="break-inside-avoid border-b py-2"><h3 className="font-bold">{index + 1}. {leg.name}</h3><p>CTS {String(leg.bearing).padStart(3, "0")}°T · {leg.distance} NM · SOG {leg.speedOverGround} kn · leg {(leg.distance / leg.speedOverGround * 60).toFixed(1)} min · cumulative {cumulativeMinutes.toFixed(1)} min</p><p><strong>Mark:</strong> {leg.mark}</p><p><strong>Hazards / limits:</strong> {leg.hazards}; {leg.safeLimits}</p><p><strong>Monitor / depth & tide:</strong> {leg.monitoring}; {leg.depthAndTide}</p><p><strong>Comms / abort:</strong> {leg.communications}; {leg.abortAndContingency}</p></article>; })}</section>
    <Card className="print:hidden"><CardHeader><CardTitle>1. Harbour approach</CardTitle></CardHeader><CardContent className="space-y-2 text-sm"><p>A clearly fictional IALA Region A training approach is loaded. Never use it for navigation.</p><p>Timing = distance ÷ SOG × 60. Legs show 0.1 minute; cumulative time uses full precision and is shown to 0.1 minute.</p><p>Drafts save automatically in this browser using plan format version {PILOTAGE_DRAFT_VERSION} and reopen on return.</p></CardContent></Card>

    <Card className="print:hidden"><CardHeader><CardTitle>2. Build and order the legs</CardTitle></CardHeader><CardContent className="space-y-4">
      <ol className="space-y-4" aria-label="Ordered pilotage legs">{waypoints.map((leg, index) => { const legMinutes = leg.distance / leg.speedOverGround * 60; cumulative += legMinutes; return <li key={leg.id} className="rounded-lg border p-3 text-sm break-words">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"><strong>{index + 1}. {leg.name}</strong><div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap"><Button className="min-h-11 min-w-11" variant="ghost" size="sm" aria-label={`Move leg ${index + 1}, ${leg.name}, up`} disabled={saving || index === 0} onClick={() => { move(index, -1); changed(); setAnnouncement(`Moved ${leg.name} to position ${index}.`); }}>↑</Button><Button className="min-h-11 min-w-11" variant="ghost" size="sm" aria-label={`Move leg ${index + 1}, ${leg.name}, down`} disabled={saving || index === waypoints.length - 1} onClick={() => { move(index, 1); changed(); setAnnouncement(`Moved ${leg.name} to position ${index + 2}.`); }}>↓</Button><Button className="min-h-11" variant="ghost" size="sm" aria-label={`Edit leg ${index + 1}, ${leg.name}`} disabled={saving} onClick={() => { setEditingId(leg.id); setDraft(toDraft(leg)); requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>("#waypoint-name")?.focus()); }}>Edit</Button><Button className="min-h-11" variant="ghost" size="sm" aria-label={`Remove leg ${index + 1}, ${leg.name}`} disabled={saving} onClick={() => { setWaypoints((items) => items.filter((item) => item.id !== leg.id)); changed(); setAnnouncement(`Removed ${leg.name}.`); }}>Remove</Button></div></div>
        <p>CTS {String(leg.bearing).padStart(3, "0")}°T · {leg.distance} NM · SOG {leg.speedOverGround} kn · {legMinutes.toFixed(1)} min · cumulative {cumulative.toFixed(1)} min</p>
        <dl className="mt-2 grid gap-x-4 md:grid-cols-2"><div><dt className="font-medium">Mark</dt><dd>{leg.mark}</dd></div><div><dt className="font-medium">Hazards / safe limits</dt><dd>{leg.hazards}; {leg.safeLimits}</dd></div><div><dt className="font-medium">Monitor / depth & tide</dt><dd>{leg.monitoring}; {leg.depthAndTide}</dd></div><div><dt className="font-medium">Comms / contingency</dt><dd>{leg.communications}; {leg.abortAndContingency}</dd></div></dl>
      </li>; })}</ol>
      <form ref={formRef} onSubmit={saveLeg} noValidate className="space-y-3" aria-labelledby="leg-form-heading"><fieldset disabled={saving}><legend id="leg-form-heading" className="font-semibold">{editingId ? "Edit pilotage leg" : "Add a pilotage leg"}</legend><p id="leg-form-help" className="text-sm text-muted-foreground">All safety fields are required. Numeric constraints and units are shown with each field.</p><div className="grid min-w-0 gap-3 md:grid-cols-2">
        <Field label="Leg name" id="waypoint-name" value={draft.name} set={(v) => update("name", v)} disabled={saving} invalid={invalidField === "waypoint-name"} />
        <Field label="Mark or feature" id="mark" value={draft.mark} set={(v) => update("mark", v)} disabled={saving} invalid={invalidField === "mark"} />
        <Field label="Course to steer (°T)" id="bearing" value={draft.bearing} set={(v) => update("bearing", v)} disabled={saving} invalid={invalidField === "bearing"} type="number" />
        <Field label="Distance (NM)" id="distance" value={draft.distance} set={(v) => update("distance", v)} disabled={saving} invalid={invalidField === "distance"} type="number" />
        <Field label="Planned SOG (knots)" id="sog" value={draft.speedOverGround} set={(v) => update("speedOverGround", v)} disabled={saving} invalid={invalidField === "sog"} type="number" />
        <Field label="Hazards" id="hazards" value={draft.hazards} set={(v) => update("hazards", v)} disabled={saving} invalid={invalidField === "hazards"} />
        <Field label="Safe limits" id="safe-limits" value={draft.safeLimits} set={(v) => update("safeLimits", v)} disabled={saving} invalid={invalidField === "safe-limits"} />
        <Field label="Monitoring" id="monitoring" value={draft.monitoring} set={(v) => update("monitoring", v)} disabled={saving} invalid={invalidField === "monitoring"} />
        <Field label="Depth and tide" id="depth-tide" value={draft.depthAndTide} set={(v) => update("depthAndTide", v)} disabled={saving} invalid={invalidField === "depth-tide"} />
        <Field label="Communications" id="communications" value={draft.communications} set={(v) => update("communications", v)} disabled={saving} invalid={invalidField === "communications"} />
        <Field label="Abort and contingency" id="contingency" value={draft.abortAndContingency} set={(v) => update("abortAndContingency", v)} disabled={saving} invalid={invalidField === "contingency"} />
      </div>
      <Label htmlFor="notes">Pilotage notes</Label><Textarea id="notes" value={draft.notes} disabled={saving} onChange={(e) => update("notes", e.target.value)} />
      {validationError && <p id="leg-form-error" role="alert" className="text-sm text-destructive">{validationError} Complete every safety field; “none identified” is acceptable only after checking the chart.</p>}
      <div className="flex flex-col gap-2 sm:flex-row"><Button className="min-h-11" type="submit" disabled={saving}>{editingId ? "Save leg" : "Add waypoint"}</Button>{editingId && <Button className="min-h-11" type="button" variant="outline" onClick={() => { setEditingId(null); setDraft(emptyDraft()); }}>Cancel edit</Button>}</div></fieldset></form>
    </CardContent></Card>

    <Card className="print:hidden"><CardHeader><CardTitle>3. Validate, review and brief</CardTitle></CardHeader><CardContent className="space-y-3">
      {coverage.length ? <div role="alert"><p className="font-medium">Coverage needs correction:</p><ul className="list-disc pl-5">{coverage.map((error) => <li key={error}>{error}</li>)}</ul></div> : <p>Coverage complete: every leg records a mark, course, distance, hazard, safe limit, monitoring, depth/tide, communications and contingency.</p>}
      {summary && <p><strong>{summary.totalDistance} NM</strong> total · <strong>{summary.estimatedMinutes} minutes</strong> estimated (rounded final total)</p>}
      <label className="flex min-h-11 cursor-pointer items-center gap-3 py-1"><input className="h-5 w-5 shrink-0" type="checkbox" checked={briefed} disabled={saving || coverage.length > 0} onChange={(e) => setBriefed(e.target.checked)} /><span>I can brief the ordered plan from memory: marks, limits, monitoring, communications and when to abort.</span></label>
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap"><Button className="min-h-11" variant="outline" disabled={!summary} onClick={() => window.print()}>Print / export cockpit plan</Button><Button className="min-h-11" disabled={!summary || !briefed || completed || saving} onClick={async () => { if (!summary) return; setSaving(true); setAnnouncement("Saving pilotage plan."); try { const saved = await onComplete(summary); if (saved) { setCompleted(true); setAnnouncement("Pilotage plan saved and completed."); } else setAnnouncement("Pilotage plan was not saved. Try again."); } catch { setAnnouncement("Pilotage plan could not be saved. Try again."); } finally { setSaving(false); } }}>{saving ? "Saving plan…" : completed ? "Plan completed" : "Complete pilotage plan"}</Button></div>
    </CardContent></Card>
  </div>;
};

const Field = ({ label, id, value, set, disabled, invalid, type = "text" }: { label: string; id: string; value: string; set: (value: string) => void; disabled: boolean; invalid: boolean; type?: string }) => {
  const numeric = type === "number";
  const constraint = id === "bearing" ? "0 to less than 360 degrees true" : id === "distance" ? "Greater than 0 to 100 nautical miles" : id === "sog" ? "Greater than 0 to 50 knots" : "Required";
  const min = id === "bearing" ? 0 : numeric ? 0.001 : undefined;
  const max = id === "bearing" ? 359.999 : id === "distance" ? 100 : id === "sog" ? 50 : undefined;
  return <div className="min-w-0"><Label htmlFor={id}>{label}</Label><Input className="min-h-11" id={id} type={type} min={min} max={max} step={numeric ? "any" : undefined} required aria-invalid={invalid} aria-describedby={`${id}-help${invalid ? " leg-form-error" : ""}`} value={value} disabled={disabled} onChange={(e) => set(e.target.value)} /><p id={`${id}-help`} className="text-xs text-muted-foreground">{constraint}</p></div>;
};
