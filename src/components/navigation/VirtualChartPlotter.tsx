/* eslint-disable react-refresh/only-export-components -- exported chart maths are the exercise's testable contract */
import { useMemo, useRef, useState } from "react";
import { CheckCircle2, Crosshair, Map as MapIcon, MousePointer2, RotateCcw, Ruler, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export type Point = { x: number; y: number };
export type PlotterTool = "pan" | "plot" | "distance" | "bearing";

const ORIGIN_LAT = 50 + 15 / 60;
const ORIGIN_LON = -(1 + 35 / 60);
const PX_PER_NM = 100;
const WORLD = { width: 1200, height: 800 };
const COS_LAT = Math.cos((ORIGIN_LAT * Math.PI) / 180);

/** Local tangent-plane chart model: x is eastward NM, y is southward NM. */
export const chartModel = {
  toPoint(lat: number, lon: number): Point {
    return { x: (lon - ORIGIN_LON) * 60 * COS_LAT * PX_PER_NM, y: (ORIGIN_LAT - lat) * 60 * PX_PER_NM };
  },
  toCoordinate(point: Point) {
    return {
      lat: ORIGIN_LAT - point.y / PX_PER_NM / 60,
      lon: ORIGIN_LON + point.x / PX_PER_NM / (60 * COS_LAT),
    };
  },
  distance(a: Point, b: Point) {
    return Math.hypot(b.x - a.x, b.y - a.y) / PX_PER_NM;
  },
  bearing(a: Point, b: Point) {
    return (Math.atan2(b.x - a.x, a.y - b.y) * 180 / Math.PI + 360) % 360;
  },
  angularDifference(a: number, b: number) {
    return Math.abs(((a - b + 540) % 360) - 180);
  },
};

export const mapClientPoint = (client: Point, rect: { left: number; top: number; width: number; height: number }, view: { x: number; y: number; width: number; height: number }): Point => ({
  x: view.x + (client.x - rect.left) / rect.width * view.width,
  y: view.y + (client.y - rect.top) / rect.height * view.height,
});

const landmarks = [
  { id: "L1", x: 100, y: 100, name: "Spire" },
  { id: "L2", x: 400, y: 200, name: "Buoy A" },
  { id: "L3", x: 250, y: 50, name: "Wreck" },
  { id: "L4", x: 800, y: 600, name: "Lighthouse" },
  { id: "L5", x: 600, y: 300, name: "Fort" },
] as const;

type Challenge = { id: number; prompt: string; tool: PlotterTool; kind: "distance" | "bearing" | "plot"; start?: Point; end?: Point; target?: Point; tolerance: number; hint: string };
const at = (id: string) => landmarks.find((landmark) => landmark.id === id)!;
export const PLOTTER_CHALLENGES: Challenge[] = [
  { id: 1, prompt: "Measure the distance from the Spire (L1) to Buoy A (L2).", tool: "distance", kind: "distance", start: at("L1"), end: at("L2"), tolerance: .2, hint: "Drag the distance tool from L1 to L2." },
  { id: 2, prompt: "Find the true bearing from the Wreck (L3) to Buoy A (L2).", tool: "bearing", kind: "bearing", start: at("L3"), end: at("L2"), tolerance: 5, hint: "Bearings are clockwise from true north: drag from L3 to L2." },
  { id: 3, prompt: "Measure the distance from the Lighthouse (L4) to the Fort (L5).", tool: "distance", kind: "distance", start: at("L4"), end: at("L5"), tolerance: .2, hint: "Zoom out, then drag between L4 and L5." },
  { id: 4, prompt: "Find the true bearing from the Spire (L1) to the Lighthouse (L4).", tool: "bearing", kind: "bearing", start: at("L1"), end: at("L4"), tolerance: 5, hint: "Drag from L1 to L4; direction matters." },
  { id: 5, prompt: "Plot 50°13.0′N 001°32.0′W.", tool: "plot", kind: "plot", target: chartModel.toPoint(50 + 13 / 60, -(1 + 32 / 60)), tolerance: .2, hint: "Use the latitude and longitude graduations." },
  { id: 6, prompt: "Plot 50°12.5′N 001°30.5′W.", tool: "plot", kind: "plot", target: chartModel.toPoint(50 + 12.5 / 60, -(1 + 30.5 / 60)), tolerance: .2, hint: "Interpolate halfway between half-minute graduations." },
  { id: 7, prompt: "Plot 50°14.8′N 001°34.5′W.", tool: "plot", kind: "plot", target: chartModel.toPoint(50 + 14.8 / 60, -(1 + 34.5 / 60)), tolerance: .15, hint: "This position is close to the north-west corner." },
  { id: 8, prompt: "Find the reciprocal true bearing from Buoy A (L2) to the Wreck (L3).", tool: "bearing", kind: "bearing", start: at("L2"), end: at("L3"), tolerance: 5, hint: "Reverse the direction used in challenge 2; the answer wraps through 360°." },
];

const answer = (challenge: Challenge) => challenge.kind === "plot" ? challenge.target! : challenge.kind === "distance" ? chartModel.distance(challenge.start!, challenge.end!) : chartModel.bearing(challenge.start!, challenge.end!);
const formatCoordinate = (point: Point) => {
  const { lat, lon } = chartModel.toCoordinate(point);
  return `50°${((lat - 50) * 60).toFixed(1)}′N 001°${((Math.abs(lon) - 1) * 60).toFixed(1)}′W`;
};

export default function VirtualChartPlotter() {
  const [tool, setTool] = useState<PlotterTool>("pan");
  const [view, setView] = useState({ x: 0, y: 0, scale: 1 });
  const [drag, setDrag] = useState<{ start: Point; current: Point } | null>(null);
  const [marks, setMarks] = useState<Point[]>([]);
  const [measurement, setMeasurement] = useState("");
  const [active, setActive] = useState(false);
  const [index, setIndex] = useState(0);
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [challengeSolved, setChallengeSolved] = useState(false);
  const [formValue, setFormValue] = useState("");
  const svgRef = useRef<SVGSVGElement>(null);
  const panRef = useRef<{ client: Point; view: Point } | null>(null);
  const viewSize = { width: 500 * view.scale, height: 300 * view.scale };
  const challenge = PLOTTER_CHALLENGES[index];

  const clientToChart = (clientX: number, clientY: number) => {
    const rect = svgRef.current!.getBoundingClientRect();
    // preserveAspectRatio="none" makes each axis map independently, including non-3:5 viewports.
    return mapClientPoint({ x: clientX, y: clientY }, rect, { x: view.x, y: view.y, width: viewSize.width, height: viewSize.height });
  };
  const clampView = (next: typeof view) => ({ ...next, x: Math.max(0, Math.min(WORLD.width - 500 * next.scale, next.x)), y: Math.max(0, Math.min(WORLD.height - 300 * next.scale, next.y)) });
  const announceTool = (next: PlotterTool) => { setTool(next); setFeedback(active && next !== challenge.tool ? { ok: false, text: `That is the ${next} tool. Challenge ${challenge.id} requires the ${challenge.tool} tool; the answer is still hidden.` } : null); };
  const assess = (value: number | Point, equivalentForm = false) => {
    if (!active || challengeSolved) return;
    setAttempts((n) => n + 1);
    if (!equivalentForm && tool !== challenge.tool) { setFeedback({ ok: false, text: `Use the ${challenge.tool} tool for this challenge. No answer has been revealed.` }); return; }
    const expected = answer(challenge);
    const error = challenge.kind === "plot" ? chartModel.distance(value as Point, expected as Point) : challenge.kind === "bearing" ? chartModel.angularDifference(value as number, expected as number) : Math.abs((value as number) - (expected as number));
    const ok = error <= challenge.tolerance;
    if (ok) { setCorrect((n) => n + 1); setChallengeSolved(true); }
    setFeedback({ ok, text: ok ? `Correct within the ${challenge.kind === "bearing" ? `${challenge.tolerance}°` : `${challenge.tolerance} NM`} tolerance.` : `Not within tolerance. Check the endpoints, direction and graduations, then retry.` });
  };
  const finishMeasurement = (a: Point, b: Point) => {
    const value = tool === "distance" ? chartModel.distance(a, b) : chartModel.bearing(a, b);
    setMeasurement(tool === "distance" ? `${value.toFixed(2)} NM` : `${Math.round(value).toString().padStart(3, "0")}°T`);
    assess(value);
  };
  const start = () => { setActive(true); setIndex(0); setAttempts(0); setCorrect(0); setChallengeSolved(false); setFeedback(null); setFormValue(""); announceTool("pan"); };
  const next = () => { if (!challengeSolved) return; if (index === 7) { setActive(false); setFeedback({ ok: true, text: `Mastery achieved: ${correct}/8 correct challenges. Retry the drill any time to improve accuracy.` }); } else { setIndex((n) => n + 1); setChallengeSolved(false); setFeedback(null); setFormValue(""); setMeasurement(""); setTool("pan"); } };
  const reset = () => { setMarks([]); setMeasurement(""); setFeedback(null); setView({ x: 0, y: 0, scale: 1 }); };
  const meridians = useMemo(() => Array.from({ length: 20 }, (_, i) => chartModel.toPoint(ORIGIN_LAT, ORIGIN_LON + i * .5 / 60).x), []);

  return <Card className="mt-8 w-full border-2 border-primary/20">
    <CardHeader><CardTitle className="flex flex-wrap items-center justify-between gap-3"><span className="flex items-center gap-2"><MapIcon aria-hidden className="h-5 w-5"/>Virtual Chart Plotter</span><span className="flex flex-wrap gap-2">
      <Button type="button" aria-label="Zoom in" onClick={() => setView((v) => clampView({ ...v, scale: Math.max(.5, v.scale - .25) }))}>+</Button><Button type="button" aria-label="Zoom out" onClick={() => setView((v) => clampView({ ...v, scale: Math.min(2.5, v.scale + .25) }))}>−</Button>
      <span role="group" aria-label="Pan chart"><Button type="button" aria-label="Pan chart west" onClick={() => setView((v) => clampView({ ...v, x: v.x - 100 * v.scale }))}>←</Button><Button type="button" aria-label="Pan chart north" onClick={() => setView((v) => clampView({ ...v, y: v.y - 100 * v.scale }))}>↑</Button><Button type="button" aria-label="Pan chart south" onClick={() => setView((v) => clampView({ ...v, y: v.y + 100 * v.scale }))}>↓</Button><Button type="button" aria-label="Pan chart east" onClick={() => setView((v) => clampView({ ...v, x: v.x + 100 * v.scale }))}>→</Button></span>
      {!active && <Button type="button" onClick={start}>Start / retry exercises</Button>}
      {(["pan", "plot", "distance", "bearing"] as PlotterTool[]).map((item) => <Button key={item} type="button" aria-pressed={tool === item} variant={tool === item ? "default" : "outline"} onClick={() => announceTool(item)}>{item === "pan" ? <MousePointer2 aria-hidden className="mr-1 h-4 w-4"/> : item === "plot" ? <Crosshair aria-hidden className="mr-1 h-4 w-4"/> : item === "distance" ? <Ruler aria-hidden className="mr-1 h-4 w-4"/> : <RotateCcw aria-hidden className="mr-1 h-4 w-4"/>}{item}</Button>)}
      <Button type="button" variant="ghost" onClick={reset}>Clear</Button></span></CardTitle>
      <div className="text-sm text-muted-foreground">{active ? <section aria-labelledby="plotter-challenge"><h3 id="plotter-challenge" className="font-semibold text-foreground">Challenge {index + 1}/8</h3><p>{challenge.prompt}</p><p className="text-xs">Required tool: <strong>{challenge.tool}</strong>. {challenge.hint}</p></section> : "Explore the chart or complete all eight exercises. One correct attempt per challenge demonstrates mastery."}</div>
    </CardHeader><CardContent>
      <div role="region" aria-label="Interactive practice chart" className="overflow-auto rounded-xl border bg-white">
        <svg ref={svgRef} role="img" aria-labelledby="chart-title chart-desc" tabIndex={0} viewBox={`${view.x} ${view.y} ${viewSize.width} ${viewSize.height}`} preserveAspectRatio="none" className="block h-[min(60vh,480px)] min-h-[300px] w-full touch-pan-y"
          onPointerDown={(e) => { if (tool === "pan") { if (e.pointerType === "touch") return; panRef.current = { client: { x: e.clientX, y: e.clientY }, view: { x: view.x, y: view.y } }; e.currentTarget.setPointerCapture?.(e.pointerId); return; } const point = clientToChart(e.clientX, e.clientY); if (tool === "plot") { setMarks((m) => [...m, point]); setMeasurement(formatCoordinate(point)); assess(point); } else { setDrag({ start: point, current: point }); e.currentTarget.setPointerCapture?.(e.pointerId); } }}
          onPointerMove={(e) => { if (panRef.current) { const rect = e.currentTarget.getBoundingClientRect(); setView((v) => clampView({ ...v, x: panRef.current!.view.x - (e.clientX - panRef.current!.client.x) / rect.width * viewSize.width, y: panRef.current!.view.y - (e.clientY - panRef.current!.client.y) / rect.height * viewSize.height })); } else if (drag) setDrag({ ...drag, current: clientToChart(e.clientX, e.clientY) }); }}
          onPointerUp={(e) => { if (panRef.current) panRef.current = null; else if (drag) { const end = clientToChart(e.clientX, e.clientY); finishMeasurement(drag.start, end); setDrag(null); } }}
          onPointerCancel={() => { panRef.current = null; setDrag(null); }}>
          <title id="chart-title">Local navigation practice chart</title><desc id="chart-desc">A local tangent-plane chart with latitude and longitude graduations, five labelled landmarks, plotted marks and measurement lines. Use the equivalent form below if pointer operation is unsuitable.</desc>
          <rect width={WORLD.width} height={WORLD.height} fill="#fff"/>
          {Array.from({ length: 17 }, (_, i) => i * 50).map((y) => <g key={y}><line x1="0" x2={WORLD.width} y1={y} y2={y} stroke="#94a3b8" strokeWidth={y % 100 ? 0.5 : 1}/><text x={view.x + 4 * view.scale} y={y - 4} fontSize={10 * view.scale} fill="#334155">{formatCoordinate({ x: 0, y }).split(" ")[0]}</text></g>)}
          {meridians.map((x, i) => <g key={x}><line x1={x} x2={x} y1="0" y2={WORLD.height} stroke="#94a3b8" strokeWidth={i % 2 ? .5 : 1}/><text x={x + 3} y={view.y + 13 * view.scale} fontSize={10 * view.scale} fill="#334155">{formatCoordinate({ x, y: 0 }).split(" ")[1]}</text></g>)}
          {landmarks.map((landmark) => <g key={landmark.id} transform={`translate(${landmark.x} ${landmark.y})`}><circle r={7 * view.scale} fill="#d04297" stroke="#111"/><text y={-11 * view.scale} textAnchor="middle" fontSize={12 * view.scale} fontWeight="bold">{landmark.name} ({landmark.id})</text></g>)}
          {marks.map((p, i) => <g key={i} stroke="#dc2626" strokeWidth={2 * view.scale}><path d={`M${p.x-6*view.scale},${p.y-6*view.scale} L${p.x+6*view.scale},${p.y+6*view.scale} M${p.x+6*view.scale},${p.y-6*view.scale} L${p.x-6*view.scale},${p.y+6*view.scale}`}/></g>)}
          {drag && (
            <line x1={drag.start.x} y1={drag.start.y} x2={drag.current.x} y2={drag.current.y} stroke="#2563eb" strokeWidth={2 * view.scale} strokeDasharray={`${6*view.scale}`}/>
          )}
        </svg>
      </div>
      <p aria-live="polite" className="mt-2 font-medium">{measurement ? `Measurement: ${measurement}.` : `Selected tool: ${tool}.`} {feedback?.text}</p>
      {feedback && <div role={feedback.ok ? "status" : "alert"} className={`mt-2 flex items-center gap-2 rounded p-2 ${feedback.ok ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>{feedback.ok ? <CheckCircle2 aria-hidden/> : <XCircle aria-hidden/>}<span>{feedback.text}</span>{feedback.ok && active && <Button type="button" variant="link" onClick={next}>Next challenge</Button>}</div>}
      {active && <form className="mt-4 rounded border p-3" onSubmit={(e) => { e.preventDefault(); const parts = formValue.trim().split(/[ ,]+/).map(Number); if (challenge.kind === "plot" && parts.length === 2 && parts.every(Number.isFinite)) assess(chartModel.toPoint(parts[0], parts[1]), true); else if (parts.length === 1 && Number.isFinite(parts[0])) assess(parts[0], true); else setFeedback({ ok: false, text: "Enter one numeric measurement, or decimal latitude and longitude separated by a comma." }); }}><label htmlFor="plotter-answer" className="block font-medium">Equivalent nonvisual answer</label><p id="plotter-answer-help" className="text-sm text-muted-foreground">Enter distance in NM or bearing in degrees. For a plotted position, enter decimal latitude, longitude (west is negative).</p><div className="mt-2 flex flex-wrap gap-2"><input id="plotter-answer" aria-describedby="plotter-answer-help" className="min-h-11 flex-1 rounded border px-3" inputMode="decimal" disabled={challengeSolved} value={formValue} onChange={(e) => setFormValue(e.target.value)}/><Button type="submit" disabled={challengeSolved}>Check answer</Button></div></form>}
      <details className="mt-4"><summary className="cursor-pointer font-medium">Landmark coordinate table</summary><div className="overflow-x-auto"><table className="w-full text-left text-sm"><caption className="sr-only">Nonvisual chart landmark positions</caption><thead><tr><th>Landmark</th><th>Coordinate</th></tr></thead><tbody>{landmarks.map((l) => <tr key={l.id}><th>{l.name} ({l.id})</th><td>{formatCoordinate(l)}</td></tr>)}</tbody></table></div></details>
      <p className="mt-2 text-center text-xs text-muted-foreground">Local tangent-plane scale: 100 chart units = 1 NM. Latitude ticks are 0.5′; longitude spacing is corrected by cos 50°15′. One-finger touch always scrolls the page; use the four Pan chart buttons to move the chart on touch devices. Mouse and pen users may also drag with Pan selected.</p>
    </CardContent></Card>;
}
