import { useCallback, useId, useRef, useState } from "react";
import { CheckCircle2, Map as MapIcon, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import ChartSurface from "@/components/navigation/unified/ChartSurface";
import { assessClearingBearing, clearanceRelationFor, CLEARING_BEARING_SCENARIOS, normalizeBearing, solutionFor, type BearingRule } from "./clearingBearingScenarios";

interface Props { readonly onAllScenariosComplete?: () => boolean | Promise<boolean> }

export const ClearingBearingTool = ({ onAllScenariosComplete }: Props) => {
  const [index, setIndex] = useState(0);
  const [bearing, setBearing] = useState(180);
  const [rule, setRule] = useState<BearingRule | "">("");
  const [result, setResult] = useState<ReturnType<typeof assessClearingBearing> | null>(null);
  const [completionState, setCompletionState] = useState<"ready" | "saving" | "failed" | "done">("ready");
  const feedbackRef = useRef<HTMLDivElement>(null);
  const bearingRef = useRef<HTMLInputElement>(null);
  const feedbackId = useId();
  const scenario = CLEARING_BEARING_SCENARIOS[index];
  const solution = solutionFor(scenario);
  const solved = result?.kind === "correct";
  const last = index === CLEARING_BEARING_SCENARIOS.length - 1;

  const submit = useCallback(() => {
    setResult(assessClearingBearing(String(bearing), rule, scenario));
    requestAnimationFrame(() => feedbackRef.current?.focus());
  }, [bearing, rule, scenario]);
  const next = () => {
    setIndex((value) => value + 1); setBearing(180); setRule(""); setResult(null);
    requestAnimationFrame(() => bearingRef.current?.focus());
  };
  const plottingEnd = { x: scenario.landmark.position.x + Math.sin(((bearing + 180) * Math.PI) / 180) * 330, y: scenario.landmark.position.y - Math.cos(((bearing + 180) * Math.PI) / 180) * 330 };
  const relation = clearanceRelationFor(bearing, scenario);
  const offset = { x: scenario.hazard.position.x - scenario.landmark.position.x, y: scenario.hazard.position.y - scenario.landmark.position.y };
  const relationText = relation.kind === "crossing"
    ? `Plotting line intersects the clearance area by ${Math.abs(relation.margin).toFixed(1)} chart units.`
    : relation.kind === "tangent"
      ? `Plotting line is tangent to the clearance boundary; signed margin ${relation.margin.toFixed(1)} chart units.`
      : relation.kind === "clear"
        ? `Plotting line clears the clearance area by ${relation.margin.toFixed(1)} chart units.`
        : `Plotting ray points away from the hazard; rotate it towards the described hazard offset.`;
  const adjustBearing = (delta: number) => { setBearing((value) => normalizeBearing(value + delta)); setResult(null); };
  const finish = async () => {
    if (completionState === "saving" || completionState === "done") return;
    setCompletionState("saving");
    try { setCompletionState(await onAllScenariosComplete?.() === false ? "failed" : "done"); }
    catch { setCompletionState("failed"); }
  };

  return <Card className="w-full border-2 border-primary/20">
    <CardHeader><CardTitle className="flex items-center gap-2"><MapIcon aria-hidden="true" className="h-5 w-5" />Clearing-bearing mastery</CardTitle>
      <CardDescription>Scenario {index + 1} of {CLEARING_BEARING_SCENARIOS.length}: {scenario.title}</CardDescription></CardHeader>
    <CardContent className="space-y-5">
      <div className="rounded-lg border bg-secondary/20 p-3 text-sm"><p>{scenario.task}</p><p className="mt-2 font-medium">Bearing reference: true north (000°T), measured clockwise at the vessel towards the named mark.</p></div>
      <figure aria-labelledby="practice-chart-caption">
        <div className="aspect-[5/3] min-h-48 w-full overflow-hidden rounded-xl border bg-blue-50/50 sm:min-h-64">
          <ChartSurface width={500} height={300} scale={100} viewBox="0 0 500 300" ariaLabel={`Practice chart for ${scenario.title}`} description={`${scenario.landmark.name} is the magenta diamond used as the bearing mark. ${scenario.hazard.name} is the red hazard and its dashed red ring is the required clearance boundary. The blue circle marks a known safe-water observation. The solid blue line is the bearing being plotted from the mark; after a correct answer, a dashed green line shows the safe limiting tangent.`}>
            <path d="M0 25 Q120 100 190 25 L0 0 Z" fill="#d6c39a" stroke="#765f36" strokeWidth="2" />
            <ellipse cx={scenario.safeObserver.x} cy={scenario.safeObserver.y} rx={scenario.safeArea.radiusX} ry={scenario.safeArea.radiusY} fill="#60a5fa" opacity=".18" stroke="#2563eb" strokeDasharray="5 4" />
            <text x="20" y="22" fontSize="11" fill="#604b28">Coastline</text>
            <text x={scenario.safeObserver.x} y={scenario.safeObserver.y + 24} textAnchor="middle" fontSize="11" fill="#1d4ed8">{scenario.chartNote}</text>
            <circle cx={scenario.safeObserver.x} cy={scenario.safeObserver.y} r="6" fill="#2563eb" /><text x={scenario.safeObserver.x} y={scenario.safeObserver.y - 10} textAnchor="middle" fontSize="10">Test position</text>
            <circle cx={scenario.hazard.position.x} cy={scenario.hazard.position.y} r={scenario.hazard.radius + scenario.hazard.margin} fill="#fca5a555" stroke="#dc2626" strokeDasharray="5 4" />
            <circle cx={scenario.hazard.position.x} cy={scenario.hazard.position.y} r={scenario.hazard.radius} fill="#ef444466" stroke="#991b1b" />
            <text x={scenario.hazard.position.x} y={scenario.hazard.position.y + 4} textAnchor="middle" fontSize="10" fontWeight="bold">{scenario.hazard.name}</text>
            <g transform={`translate(${scenario.landmark.position.x} ${scenario.landmark.position.y})`}><polygon points="0,-9 7,0 0,9 -7,0" fill="#c026d3" /><text y="-13" textAnchor="middle" fontSize="11" fontWeight="bold">{scenario.landmark.name}</text></g>
            <path d="M455 25v35m-8-25 8-10 8 10" stroke="#111827" fill="none" /><text x="455" y="75" textAnchor="middle" fontSize="10">TRUE NORTH</text>
            <line data-testid="plotting-line" x1={scenario.landmark.position.x} y1={scenario.landmark.position.y} x2={plottingEnd.x} y2={plottingEnd.y} stroke="#2563eb" strokeWidth="2" />
            {solved && <line x1={scenario.landmark.position.x} y1={scenario.landmark.position.y} x2={solution.boundary.x} y2={solution.boundary.y} stroke="#15803d" strokeWidth="3" strokeDasharray="7 4" />}
          </ChartSurface>
        </div><figcaption id="practice-chart-caption" className="mt-2 text-sm text-muted-foreground">The magenta diamond is {scenario.landmark.name}; the solid red circle is {scenario.hazard.name}; its dashed red perimeter includes the required clearing margin. The blue circle is the known safe-water test position. The green limiting line appears only after a correct answer.</figcaption>
      </figure>
      <section id="nonvisual-chart-data" aria-labelledby="chart-measurements-heading" className="rounded-lg border p-3 text-sm"><h4 id="chart-measurements-heading" className="font-semibold">Chart measurements</h4><ul className="mt-1 list-disc pl-5"><li>From {scenario.landmark.name}, the centre of {scenario.hazard.name} is {Math.abs(offset.x)} units {offset.x >= 0 ? "east" : "west"} and {Math.abs(offset.y)} units {offset.y >= 0 ? "south" : "north"}.</li><li>Hazard radius {scenario.hazard.radius} units plus required margin {scenario.hazard.margin} units gives a clearance radius of {scenario.hazard.radius + scenario.hazard.margin} units.</li><li>The blue test position is a known safe-water observation. From {scenario.landmark.name}, it is {Math.abs(scenario.safeObserver.x - scenario.landmark.position.x)} units {scenario.safeObserver.x >= scenario.landmark.position.x ? "east" : "west"} and {Math.abs(scenario.safeObserver.y - scenario.landmark.position.y)} units {scenario.safeObserver.y >= scenario.landmark.position.y ? "south" : "north"}.</li><li>Find both zero-margin tangents. Select the tangent nearest the known-safe observation without crossing the clearance area. Compare the vessel-to-mark bearing at that limit with the bearing at the known-safe observation: if the safe bearing is numerically greater choose NLT; if it is smaller choose NMT. These scenarios do not cross 000°.</li></ul></section>
      <form onSubmit={(event) => { event.preventDefault(); if (!solved) submit(); }} className="space-y-4">
        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-end"><div><div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between"><Label htmlFor="clearing-bearing">Rotate plotting line</Label><output htmlFor="clearing-bearing" className="font-mono text-sm">Measured: {bearing.toString().padStart(3, "0")}°T</output></div><input ref={bearingRef} className="h-11 w-full touch-pan-y accent-primary" id="clearing-bearing" aria-label="Rotate plotting line, measured true bearing" aria-describedby={`nonvisual-chart-data clearance-relation ${result ? feedbackId : ""}`} type="range" min="0" max="359" step="1" value={bearing} disabled={solved} onKeyDown={(event) => { if (event.key === "ArrowRight" || event.key === "ArrowUp") { event.preventDefault(); adjustBearing(1); } else if (event.key === "ArrowLeft" || event.key === "ArrowDown") { event.preventDefault(); adjustBearing(-1); } }} onChange={(event) => { setBearing(Number(event.target.value)); setResult(null); }} /><p className="text-xs text-muted-foreground">Drag the control or use arrow keys to rotate the blue line until it is tangent to the outside of the clearance margin.</p><p id="clearance-relation" role="status" aria-live="polite" aria-atomic="true" className="mt-2 font-medium">{relationText}</p></div>
          <fieldset disabled={solved}><legend className="mb-2 text-sm font-medium">Safe-side rule</legend><div className="flex flex-wrap gap-2">{(["NLT", "NMT"] as const).map((value) => <Button className="min-h-11 min-w-16" key={value} type="button" variant={rule === value ? "default" : "outline"} aria-pressed={rule === value} onClick={() => { setRule(value); setResult(null); }}>{value}</Button>)}</div></fieldset></div>
        <Button className="min-h-11 w-full sm:w-auto" type="submit" disabled={solved}>Check plotted answer</Button>
      </form>
      {result && <div ref={feedbackRef} id={feedbackId} tabIndex={-1} role="region" aria-label="Answer feedback" className={`flex scroll-mt-24 gap-2 rounded-lg p-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring ${solved ? "bg-green-100 text-green-900" : "bg-red-100 text-red-900"}`}>{solved ? <CheckCircle2 aria-hidden="true" className="h-5 w-5 shrink-0" /> : <XCircle aria-hidden="true" className="h-5 w-5 shrink-0" />}<span>{result.message}</span></div>}
      {solved && (last ? <div className="space-y-2"><Button className="min-h-11" onClick={() => void finish()} disabled={completionState === "saving" || completionState === "done"}>{completionState === "saving" ? "Saving mastery…" : completionState === "done" ? "Mastery recorded" : completionState === "failed" ? "Retry saving mastery" : "Record mastery"}</Button>{completionState === "failed" && <p role="alert" className="text-sm text-red-700">Mastery was not saved. Check your connection and retry.</p>}</div> : <Button className="min-h-11" onClick={next}>Next scenario</Button>)}
    </CardContent>
  </Card>;
};
