import { useMemo, useRef, useState } from "react";
import { Compass, Maximize2, Minimize2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ChartSurface from "./ChartSurface";
import {
  angularDifference, CHART_HEIGHT, CHART_WIDTH, clientToSvgPoint, FIX_TOLERANCE, landmarks,
  lineFromLandmark, magneticToTrue, minutesApart, normalizeBearing, reciprocal, SCENARIO_ORACLE, solveFix, type Landmark, type Lop,
} from "./fixExercise";

interface RecordedSight { landmark: Landmark; time: string; log: string; trueBearing: number }

const lineEnds = (lop: Lop) => {
  const radians = lop.reciprocalBearing * Math.PI / 180;
  const dx = Math.sin(radians) * 900;
  const dy = -Math.cos(radians) * 900;
  return { x1: lop.origin.x - dx, y1: lop.origin.y - dy, x2: lop.origin.x + dx, y2: lop.origin.y + dy };
};

const UnifiedChartTable = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [selected, setSelected] = useState<Landmark | null>(null);
  const [time, setTime] = useState("1042");
  const [log, setLog] = useState("18.6");
  const [trueInput, setTrueInput] = useState("");
  const [recorded, setRecorded] = useState<RecordedSight[]>([]);
  const [plotChoice, setPlotChoice] = useState("");
  const [reciprocalInput, setReciprocalInput] = useState("");
  const [lops, setLops] = useState<Lop[]>([]);
  const [feedback, setFeedback] = useState("Sight a conspicuous object, then record and correct its bearing.");
  const solution = useMemo(() => solveFix(lops), [lops]);
  const terminal = lops.length === 3 && solution !== null;
  const passed = terminal && Math.hypot(solution.fix.x - SCENARIO_ORACLE.x, solution.fix.y - SCENARIO_ORACLE.y) <= FIX_TOLERANCE;
  const annotation = recorded.length ? `${recorded[0].time}${recorded.at(-1)?.time !== recorded[0].time ? `–${recorded.at(-1)?.time}` : ""}` : "";

  const sight = (landmark: Landmark) => {
    if (terminal) return;
    setSelected(landmark);
    setTrueInput("");
    setFeedback(`${landmark.name} bears ${landmark.magneticBearing.toFixed(1)}°M. With 5°W variation, calculate °T.`);
  };

  const record = () => {
    if (!selected) return setFeedback("Sight an object first.");
    const hours = Number(time.slice(0, 2));
    const minutes = Number(time.slice(2));
    if (!/^\d{4}$/.test(time) || hours > 23 || minutes > 59 || !Number.isFinite(Number(log))) return setFeedback("Record a valid 24-hour time as four digits and a numeric log reading.");
    if (recorded.length) {
      const first = recorded[0];
      const firstMinutes = Number(first.time.slice(0, 2)) * 60 + Number(first.time.slice(2));
      const currentMinutes = hours * 60 + minutes;
      if (minutesApart(currentMinutes, firstMinutes) > 2 || Math.abs(Number(log) - Number(first.log)) > 0.3) return setFeedback(`Take the sights in quick succession. Stay within 2 minutes and 0.3 NM of the first record (${first.time}, log ${first.log}), or reset for a new sequence.`);
    }
    const entered = Number(trueInput);
    const correct = magneticToTrue(selected.magneticBearing);
    if (!Number.isFinite(entered) || angularDifference(entered, correct) > 1) return setFeedback(`Check Compass → True. ${selected.magneticBearing.toFixed(1)}°M minus 5°W = ${correct.toFixed(1)}°T.`);
    if (recorded.some((item) => item.landmark.id === selected.id)) return setFeedback(`${selected.name} is already recorded; choose independent evidence.`);
    const next = { landmark: selected, time, log, trueBearing: normalizeBearing(entered) };
    setRecorded((items) => [...items, next]);
    setPlotChoice(selected.id);
    setReciprocalInput("");
    setSelected(null);
    setFeedback(`Recorded ${selected.name} at ${time}, log ${log}. Enter its reciprocal and tap that object on the chart.`);
  };

  const plotAt = (event: React.MouseEvent<SVGSVGElement>) => {
    if (terminal) return;
    const sighted = recorded.find((item) => item.landmark.id === plotChoice);
    if (!sighted) return setFeedback("Record a corrected sight, then select it for plotting.");
    const point = clientToSvgPoint(event.clientX, event.clientY, event.currentTarget.getBoundingClientRect());
    const nearest = landmarks.reduce((best, item) => Math.hypot(item.x - point.x, item.y - point.y) < Math.hypot(best.x - point.x, best.y - point.y) ? item : best);
    if (nearest.id !== sighted.landmark.id || Math.hypot(nearest.x - point.x, nearest.y - point.y) > 30) return setFeedback(`Start the LOP at ${sighted.landmark.name}; tap its chart symbol.`);
    if (lops.some((lop) => lop.landmarkId === nearest.id)) return setFeedback(`${nearest.name} already has an LOP. Duplicate lines do not add evidence.`);
    const entered = Number(reciprocalInput);
    const correct = reciprocal(sighted.trueBearing);
    if (!Number.isFinite(entered)) return setFeedback("Enter the reciprocal bearing before plotting.");
    if (angularDifference(entered, sighted.trueBearing) <= 2) return setFeedback(`That is the bearing to the object. Plot the reciprocal ${correct.toFixed(1)}°T back from it.`);
    if (angularDifference(entered, correct) > 2) return setFeedback(`Check the reciprocal: add or subtract 180°. Expected ${correct.toFixed(1)}°T.`);
    const next = [...lops, lineFromLandmark(nearest, entered)];
    setLops(next);
    setFeedback(next.length === 3 ? "Three unique LOPs plotted. The fix is now assessed against the scenario evidence." : `LOP ${next.length} accepted. Sight another object.`);
  };

  const reset = () => {
    setSelected(null); setRecorded([]); setLops([]); setPlotChoice(""); setTrueInput(""); setReciprocalInput(""); setTime("1042"); setLog("18.6");
    setFeedback("Sight a conspicuous object, then record and correct its bearing.");
  };

  return <Card className={fullscreen ? "fixed inset-0 z-50 flex h-dvh flex-col rounded-none bg-background" : "mt-8 border-2 border-primary/20"}>
    <CardHeader className="flex-row flex-wrap items-start justify-between gap-3 pb-3">
      <div><CardTitle className="flex items-center gap-2"><Compass className="h-5 w-5" />Position-fix chart table</CardTitle><CardDescription>Sight → record/correct → plot three unique reciprocal LOPs → assess the fix.</CardDescription></div>
      <div className="flex gap-2"><Button variant="outline" size="sm" onClick={reset}><RotateCcw className="mr-2 h-4 w-4" />Reset</Button><Button aria-label={fullscreen ? "Exit full screen chart" : "Open full screen chart"} variant="outline" size="icon" onClick={() => setFullscreen((value) => !value)}>{fullscreen ? <Minimize2 /> : <Maximize2 />}</Button></div>
    </CardHeader>
    <CardContent className={`grid min-h-0 gap-4 ${fullscreen ? "flex-1 overflow-auto p-3 lg:grid-cols-[22rem_1fr]" : "lg:grid-cols-[20rem_1fr]"}`}>
      <div className="space-y-4 text-sm">
        <fieldset disabled={terminal} className="space-y-2"><legend className="font-bold">1. Sight and record</legend><div className="flex flex-wrap gap-2">{landmarks.map((item) => <Button key={item.id} type="button" size="sm" variant={selected?.id === item.id ? "default" : "outline"} onClick={() => sight(item)}>Sight {item.name}</Button>)}</div>
        {selected && <div className="grid grid-cols-3 gap-2 rounded border p-2"><label>Time<input aria-label="Observation time" className="mt-1 w-full rounded border p-2" value={time} onChange={(e) => setTime(e.target.value)} /></label><label>Log NM<input aria-label="Log reading" className="mt-1 w-full rounded border p-2" value={log} onChange={(e) => setLog(e.target.value)} /></label><label>True °T<input aria-label="Corrected true bearing" inputMode="decimal" className="mt-1 w-full rounded border p-2" value={trueInput} onChange={(e) => setTrueInput(e.target.value)} /></label><Button className="col-span-3" type="button" onClick={record}>Record corrected sight</Button></div>}</fieldset>
        {recorded.length > 0 && <div><strong>Recorded evidence</strong><ol className="mt-1 list-decimal pl-5">{recorded.map((item) => <li key={item.landmark.id}>{item.time}, log {item.log}: {item.landmark.name} {item.landmark.magneticBearing.toFixed(1)}°M → {item.trueBearing.toFixed(1)}°T</li>)}</ol><p className="mt-1 text-muted-foreground">Keep observations within 2 minutes and 0.3 NM so this exercise can treat them as one fix; otherwise transfer LOPs to a common time.</p></div>}
        <fieldset disabled={terminal || !recorded.length} className="space-y-2"><legend className="font-bold">2. Plot reciprocal</legend><label>Recorded sight<select aria-label="Sight to plot" className="ml-2 rounded border p-2" value={plotChoice} onChange={(e) => setPlotChoice(e.target.value)}><option value="">Choose…</option>{recorded.map((item) => <option key={item.landmark.id} value={item.landmark.id}>{item.landmark.name}</option>)}</select></label><label className="block">Reciprocal °T<input aria-label="Reciprocal bearing" inputMode="decimal" className="ml-2 w-24 rounded border p-2" value={reciprocalInput} onChange={(e) => setReciprocalInput(e.target.value)} /></label><p>Then tap/click the matching object on the chart.</p></fieldset>
        <p role="status" aria-live="polite" className="rounded border bg-muted p-3">{feedback}</p>
        {terminal && solution && <div role="status" className={`rounded border-2 p-3 ${passed ? "border-green-600 bg-green-50 text-green-950" : "border-red-600 bg-red-50 text-red-950"}`}><strong>{passed ? `Fix passed — ${annotation}` : `Assessment failed — ${annotation}`}</strong><p>Calculated position: ({solution.fix.x.toFixed(1)}, {solution.fix.y.toFixed(1)}). Cocked-hat radius: {solution.uncertainty.toFixed(1)} chart units.</p><p>{passed ? "Fix agrees with the independently specified scenario position." : `Fix is outside the ${FIX_TOLERANCE}-unit tolerance. Review the recorded corrections and reciprocals, then reset and retry.`}</p></div>}
      </div>
      <div className="aspect-[8/5] w-full self-start overflow-hidden rounded border">
        <ChartSurface ref={svgRef} width={CHART_WIDTH} height={CHART_HEIGHT} scale={100} viewBox="0 0 800 500" className="cursor-crosshair touch-manipulation" onClick={plotAt}>
          {landmarks.map((item) => <g key={item.id} aria-label={item.name}><circle cx={item.x} cy={item.y} r="10" fill="#d04297" stroke="white" strokeWidth="2" /><text x={item.x} y={item.y - 15} textAnchor="middle" fontSize="13" fontWeight="bold">{item.name}</text></g>)}
          {lops.map((lop) => { const line = lineEnds(lop); return <line key={lop.landmarkId} {...line} stroke="black" strokeWidth="2" />; })}
          {solution?.intersections.map((point, index) => <circle key={index} cx={point.x} cy={point.y} r="4" fill="#ef4444" />)}
          {terminal && solution && <g><circle cx={solution.fix.x} cy={solution.fix.y} r={Math.max(6, solution.uncertainty)} fill="none" stroke={passed ? "#15803d" : "#dc2626"} strokeWidth="3" /><text x={solution.fix.x + 10} y={solution.fix.y - 10} fontWeight="bold">{passed ? `FIX ${annotation}` : `CHECK ${annotation}`}</text></g>}
        </ChartSurface>
      </div>
    </CardContent>
  </Card>;
};

export default UnifiedChartTable;
