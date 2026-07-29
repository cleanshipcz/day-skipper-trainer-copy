import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { calculatePlanSummary, type PilotagePlanSummary, type PilotageWaypoint } from "./pilotagePlan";

interface PilotagePlanBuilderProps {
  readonly onComplete: (summary: PilotagePlanSummary) => void;
}

const GUIDED_WAYPOINTS: readonly PilotageWaypoint[] = [
  { id: "guided-1", name: "Safe-water mark", bearing: 32, distance: 0.8, tidalOffset: 4, notes: "Confirm Q(6)+LFl.10s before turning." },
  { id: "guided-2", name: "Outer transit", bearing: 74, distance: 1.2, tidalOffset: -3, notes: "Bring church tower in line with white warehouse." },
  { id: "guided-3", name: "Harbour entrance", bearing: 18, distance: 0.6, tidalOffset: 2, notes: "Call harbour on VHF; speed limit 5 knots." },
];

const createId = () => `waypoint-${Date.now()}-${Math.random().toString(16).slice(2)}`;

export const PilotagePlanBuilder = ({ onComplete }: PilotagePlanBuilderProps) => {
  const [waypoints, setWaypoints] = useState<PilotageWaypoint[]>([...GUIDED_WAYPOINTS]);
  const [speedKnots, setSpeedKnots] = useState(5);
  const [draft, setDraft] = useState({ name: "", bearing: "0", distance: "0.5", tidalOffset: "0", notes: "" });
  const [completed, setCompleted] = useState(false);
  const summary = useMemo(() => calculatePlanSummary(waypoints, speedKnots), [waypoints, speedKnots]);

  const addWaypoint = () => {
    const name = draft.name.trim();
    const bearing = Number(draft.bearing);
    const distance = Number(draft.distance);
    const tidalOffset = Number(draft.tidalOffset);
    if (!name || !Number.isFinite(bearing) || bearing < 0 || bearing >= 360 || !Number.isFinite(distance) || distance <= 0 || !Number.isFinite(tidalOffset)) return;
    setWaypoints((current) => [...current, { id: createId(), name, bearing, distance, tidalOffset, notes: draft.notes.trim() }]);
    setDraft({ name: "", bearing: "0", distance: "0.5", tidalOffset: "0", notes: "" });
    setCompleted(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle>1. Harbour approach</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">A guided example is loaded for Port Victoria. Adjust it or add your own waypoints.</p>
          <Label htmlFor="speed">Planned speed through water (knots)</Label>
          <Input id="speed" aria-label="Planned speed" type="number" min="0.5" step="0.5" value={speedKnots} onChange={(event) => setSpeedKnots(Number(event.target.value))} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>2. Waypoints</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {waypoints.map((waypoint, index) => (
            <div key={waypoint.id} className="rounded-lg border p-3 text-sm">
              <div className="flex justify-between gap-3"><strong>{index + 1}. {waypoint.name}</strong><Button variant="ghost" size="sm" onClick={() => setWaypoints((current) => current.filter((item) => item.id !== waypoint.id))}>Remove</Button></div>
              <p>{waypoint.bearing.toString().padStart(3, "0")}° · {waypoint.distance} NM · tidal time adjustment {waypoint.tidalOffset >= 0 ? "+" : ""}{waypoint.tidalOffset} min</p>
              {waypoint.notes && <p className="text-muted-foreground">{waypoint.notes}</p>}
            </div>
          ))}
          <div className="grid gap-3 md:grid-cols-2">
            <div><Label htmlFor="waypoint-name">Waypoint name</Label><Input id="waypoint-name" value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} /></div>
            <div><Label htmlFor="bearing">Bearing (°T)</Label><Input id="bearing" type="number" min="0" max="359" value={draft.bearing} onChange={(event) => setDraft({ ...draft, bearing: event.target.value })} /></div>
            <div><Label htmlFor="distance">Distance (NM)</Label><Input id="distance" type="number" min="0.1" step="0.1" value={draft.distance} onChange={(event) => setDraft({ ...draft, distance: event.target.value })} /></div>
            <div><Label htmlFor="tidal-offset">Tidal offset (minutes)</Label><Input id="tidal-offset" type="number" value={draft.tidalOffset} onChange={(event) => setDraft({ ...draft, tidalOffset: event.target.value })} /></div>
          </div>
          <Label htmlFor="notes">Pilotage notes</Label>
          <Textarea id="notes" value={draft.notes} onChange={(event) => setDraft({ ...draft, notes: event.target.value })} placeholder="Lights, clearing bearings, VHF call, contingency…" />
          <Button onClick={addWaypoint}>Add waypoint</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>3. Review and brief the crew</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <p><strong>{summary.totalDistance} NM</strong> total · <strong>{summary.estimatedMinutes} minutes</strong> estimated</p>
          <p className="text-sm text-muted-foreground">Check every heading against the chart, identify abort points, and brief the helm before entering confined water.</p>
          <Button disabled={waypoints.length === 0 || speedKnots <= 0 || completed} onClick={() => { onComplete(summary); setCompleted(true); }}>
            {completed ? "Plan completed" : "Complete pilotage plan"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
