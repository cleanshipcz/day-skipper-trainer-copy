import { useCallback, useState } from "react";
import { CheckCircle2, Map as MapIcon, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ChartSurface from "@/components/navigation/unified/ChartSurface";
import { assessClearingBearing, CLEARING_BEARING_SCENARIOS, solutionFor, type BearingRule } from "./clearingBearingScenarios";

interface Props { readonly onAllScenariosComplete?: () => void }

export const ClearingBearingTool = ({ onAllScenariosComplete }: Props) => {
  const [index, setIndex] = useState(0);
  const [bearing, setBearing] = useState("");
  const [rule, setRule] = useState<BearingRule | "">("");
  const [result, setResult] = useState<ReturnType<typeof assessClearingBearing> | null>(null);
  const scenario = CLEARING_BEARING_SCENARIOS[index];
  const solution = solutionFor(scenario);
  const solved = result?.kind === "correct";
  const last = index === CLEARING_BEARING_SCENARIOS.length - 1;

  const submit = useCallback(() => setResult(assessClearingBearing(bearing, rule, scenario)), [bearing, rule, scenario]);
  const next = () => { setIndex((value) => value + 1); setBearing(""); setRule(""); setResult(null); };

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
            {solved && <line x1={scenario.landmark.position.x} y1={scenario.landmark.position.y} x2={solution.boundary.x} y2={solution.boundary.y} stroke="#15803d" strokeWidth="3" strokeDasharray="7 4" />}
          </ChartSurface>
        </div><figcaption className="mt-2 text-xs text-muted-foreground">The dashed red perimeter includes the required clearing margin. The green limiting line appears only after a correct answer.</figcaption>
      </figure>
      <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end"><div><Label htmlFor="clearing-bearing">Measured bearing (°T)</Label><Input id="clearing-bearing" inputMode="decimal" placeholder="000–359" value={bearing} disabled={solved} onChange={(event) => { setBearing(event.target.value); setResult(null); }} /></div>
        <fieldset disabled={solved}><legend className="mb-2 text-sm font-medium">Safe-side rule</legend><div className="flex gap-2">{(["NLT", "NMT"] as const).map((value) => <Button key={value} type="button" variant={rule === value ? "default" : "outline"} aria-pressed={rule === value} onClick={() => { setRule(value); setResult(null); }}>{value}</Button>)}</div></fieldset></div>
      <Button onClick={submit} disabled={solved}>Check plotted answer</Button>
      {result && <div role={result.kind === "incorrect" || result.kind === "invalid" ? "alert" : "status"} className={`flex gap-2 rounded-lg p-3 text-sm ${solved ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>{solved ? <CheckCircle2 aria-hidden="true" className="h-5 w-5 shrink-0" /> : <XCircle aria-hidden="true" className="h-5 w-5 shrink-0" />}<span>{result.message}</span></div>}
      {solved && (last ? <Button onClick={onAllScenariosComplete}>Record mastery</Button> : <Button onClick={next}>Next scenario</Button>)}
    </CardContent>
  </Card>;
};
