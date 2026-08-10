import { useCallback, useState } from "react";
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
  const scenario = CLEARING_BEARING_SCENARIOS[index];
  const solution = solutionFor(scenario);
  const solved = result?.kind === "correct";
  const last = index === CLEARING_BEARING_SCENARIOS.length - 1;

  const submit = useCallback(() => setResult(assessClearingBearing(String(bearing), rule, scenario)), [bearing, rule, scenario]);
  const next = () => { setIndex((value) => value + 1); setBearing(180); setRule(""); setResult(null); };
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
      <figure>
        <div className="overflow-hidden rounded-xl border bg-blue-50/50">
          <ChartSurface width={500} height={300} scale={100} viewBox="0 0 500 300" role="img" aria-label={`Practice chart: ${scenario.landmark.name}, ${scenario.hazard.name}, clearance margin and safe-water area`}>
            <title>{`Practice chart: ${scenario.landmark.name}, ${scenario.hazard.name}, clearance margin and safe-water area`}</title>
            <path d="M0 25 Q120 100 190 25 L0 0 Z" fill="#d6c39a" stroke="#765f36" strokeWidth="2" />
            <path d="M35 270 Q210 235 465 270" fill="none" stroke="#60a5fa" strokeWidth="32" opacity=".18" />
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
        </div><figcaption className="mt-2 text-xs text-muted-foreground">The dashed red perimeter includes the required clearing margin. The green limiting line appears only after a correct answer.</figcaption>
      </figure>
      <section id="nonvisual-chart-data" aria-labelledby="chart-measurements-heading" className="rounded-lg border p-3 text-sm"><h4 id="chart-measurements-heading" className="font-semibold">Chart measurements</h4><ul className="mt-1 list-disc pl-5"><li>From {scenario.landmark.name}, the centre of {scenario.hazard.name} is {Math.abs(offset.x)} units {offset.x >= 0 ? "east" : "west"} and {Math.abs(offset.y)} units {offset.y >= 0 ? "south" : "north"}.</li><li>Hazard radius {scenario.hazard.radius} units plus required margin {scenario.hazard.margin} units gives a clearance radius of {scenario.hazard.radius + scenario.hazard.margin} units.</li><li>Target criterion: rotate the ray from the mark towards the vessel until its signed clearance margin is zero (tangent), then independently choose the safe-side rule using the test position.</li></ul></section>
      <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end"><div><div className="flex items-center justify-between"><Label htmlFor="clearing-bearing">Rotate plotting line</Label><output htmlFor="clearing-bearing" className="font-mono text-sm">Measured: {bearing.toString().padStart(3, "0")}°T</output></div><input className="h-11 w-full accent-primary" id="clearing-bearing" aria-label="Rotate plotting line, measured true bearing" aria-describedby="nonvisual-chart-data clearance-relation" type="range" min="0" max="359" step="1" value={bearing} disabled={solved} onKeyDown={(event) => { if (event.key === "ArrowRight" || event.key === "ArrowUp") { event.preventDefault(); adjustBearing(1); } else if (event.key === "ArrowLeft" || event.key === "ArrowDown") { event.preventDefault(); adjustBearing(-1); } }} onChange={(event) => { setBearing(Number(event.target.value)); setResult(null); }} /><p className="text-xs text-muted-foreground">Drag the control or use arrow keys to rotate the blue line until it is tangent to the outside of the clearance margin.</p><p id="clearance-relation" role="status" aria-live="polite" aria-atomic="true" className="mt-2 font-medium">{relationText}</p></div>
        <fieldset disabled={solved}><legend className="mb-2 text-sm font-medium">Safe-side rule</legend><div className="flex gap-2">{(["NLT", "NMT"] as const).map((value) => <Button key={value} type="button" variant={rule === value ? "default" : "outline"} aria-pressed={rule === value} onClick={() => { setRule(value); setResult(null); }}>{value}</Button>)}</div></fieldset></div>
      <Button onClick={submit} disabled={solved}>Check plotted answer</Button>
      {result && <div role={result.kind === "incorrect" || result.kind === "invalid" ? "alert" : "status"} className={`flex gap-2 rounded-lg p-3 text-sm ${solved ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>{solved ? <CheckCircle2 aria-hidden="true" className="h-5 w-5 shrink-0" /> : <XCircle aria-hidden="true" className="h-5 w-5 shrink-0" />}<span>{result.message}</span></div>}
      {solved && (last ? <div className="space-y-2"><Button onClick={() => void finish()} disabled={completionState === "saving" || completionState === "done"}>{completionState === "saving" ? "Saving mastery…" : completionState === "done" ? "Mastery recorded" : completionState === "failed" ? "Retry saving mastery" : "Record mastery"}</Button>{completionState === "failed" && <p role="alert" className="text-sm text-red-700">Mastery was not saved. Check your connection and retry.</p>}</div> : <Button onClick={next}>Next scenario</Button>)}
    </CardContent>
  </Card>;
};
