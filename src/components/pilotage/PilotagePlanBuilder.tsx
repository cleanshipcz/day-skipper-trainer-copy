import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { calculatePlanSummary, GUIDED_WAYPOINTS, validatePilotageWaypoint, type PilotagePlanSummary, type PilotageWaypoint } from "./pilotagePlan";

interface PilotagePlanBuilderProps {
  readonly onComplete: (summary: PilotagePlanSummary) => Promise<boolean>;
}

const createId = () => `waypoint-${Date.now()}-${Math.random().toString(16).slice(2)}`;

export const PilotagePlanBuilder = ({ onComplete }: PilotagePlanBuilderProps) => {
  const [waypoints, setWaypoints] = useState<PilotageWaypoint[]>([...GUIDED_WAYPOINTS]);
  const [draft, setDraft] = useState({ name: "", bearing: "0", distance: "0.5", speedOverGround: "5", notes: "" });
  const [validationError, setValidationError] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);
  const [saving, setSaving] = useState(false);
  const summary = useMemo(() => calculatePlanSummary(waypoints), [waypoints]);

  const addWaypoint = () => {
    const name = draft.name.trim();
    const bearing = Number(draft.bearing);
    const distance = Number(draft.distance);
    const speedOverGround = Number(draft.speedOverGround);
    const waypoint = { id: createId(), name, bearing, distance, speedOverGround, notes: draft.notes.trim() };
    const error = validatePilotageWaypoint(waypoint);
    if (error) { setValidationError(error); return; }
    setValidationError(null);
    setWaypoints((current) => [...current, waypoint]);
    setDraft({ name: "", bearing: "0", distance: "0.5", speedOverGround: "5", notes: "" });
    setCompleted(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle>1. Harbour approach</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">A fictional training approach is loaded. Names and characteristics are invented but use IALA Region A conventions; do not use it for navigation.</p>
          <p className="text-sm">Each leg states a course to steer in degrees true (°T), distance, and planned speed over ground (SOG). Times are calculated as distance ÷ SOG × 60 and rounded to the nearest minute.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>2. Waypoints</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {waypoints.map((waypoint, index) => (
            <div key={waypoint.id} className="rounded-lg border p-3 text-sm">
              <div className="flex justify-between gap-3"><strong>{index + 1}. {waypoint.name}</strong><Button variant="ghost" size="sm" disabled={saving} onClick={() => { setWaypoints((current) => current.filter((item) => item.id !== waypoint.id)); setCompleted(false); }}>Remove</Button></div>
              <p>CTS {waypoint.bearing.toString().padStart(3, "0")}°T · {waypoint.distance} NM · SOG {waypoint.speedOverGround} kn · {Math.round((waypoint.distance / waypoint.speedOverGround) * 60)} min</p>
              {waypoint.notes && <p className="text-muted-foreground">{waypoint.notes}</p>}
            </div>
          ))}
          <div className="grid gap-3 md:grid-cols-2">
            <div><Label htmlFor="waypoint-name">Leg name</Label><Input id="waypoint-name" value={draft.name} disabled={saving} onChange={(event) => setDraft({ ...draft, name: event.target.value })} /></div>
            <div><Label htmlFor="bearing">Course to steer (°T)</Label><Input id="bearing" type="number" min="0" max="359.999" step="0.1" value={draft.bearing} disabled={saving} onChange={(event) => setDraft({ ...draft, bearing: event.target.value })} /></div>
            <div><Label htmlFor="distance">Distance (NM)</Label><Input id="distance" type="number" min="0.1" step="0.1" value={draft.distance} disabled={saving} onChange={(event) => setDraft({ ...draft, distance: event.target.value })} /></div>
            <div><Label htmlFor="sog">Planned SOG (knots)</Label><Input id="sog" type="number" min="0.1" max="50" step="0.1" value={draft.speedOverGround} disabled={saving} onChange={(event) => setDraft({ ...draft, speedOverGround: event.target.value })} /></div>
          </div>
          {validationError && <p role="alert" className="text-sm text-destructive">{validationError}</p>}
          <Label htmlFor="notes">Pilotage notes</Label>
          <Textarea id="notes" value={draft.notes} disabled={saving} onChange={(event) => setDraft({ ...draft, notes: event.target.value })} placeholder="Lights, clearing bearings, VHF call, contingency…" />
          <Button disabled={saving} onClick={addWaypoint}>Add waypoint</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>3. Review and brief the crew</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <p><strong>{summary.totalDistance} NM</strong> total · <strong>{summary.estimatedMinutes} minutes</strong> estimated</p>
          <p className="text-sm text-muted-foreground">Check every heading against the chart, identify abort points, and brief the helm before entering confined water.</p>
          <Button
            disabled={waypoints.length === 0 || completed || saving}
            onClick={async () => {
              setSaving(true);
              try {
                const saved = await onComplete(summary);
                if (saved) setCompleted(true);
              } finally {
                setSaving(false);
              }
            }}
          >
            {saving ? "Saving plan…" : completed ? "Plan completed" : "Complete pilotage plan"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
