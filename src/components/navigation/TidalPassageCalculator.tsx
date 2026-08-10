import { useId, useMemo, useState } from "react";
import { AlertTriangle, ArrowDown, ArrowUp, Clock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { calculatePassagePlan, conservativeWindow, formatTidalTime, heightAtTime, minutesAfterMidnight, normaliseFollowingTime } from "@/lib/tidalHeights";

type EventState = { time: string; height: string };
const WIDTH = 600;
const HEIGHT = 300;
const PADDING = 48;

const numberOrNaN = (value: string) => value.trim() === "" ? Number.NaN : Number(value);

type Props = { onMastery?: () => void };
const scenarios = [
  { id: "harbour-bar", name: "Harbour bar", draft: 1.4, clearance: 0.7, charted: 0.3, tide: 2.4, outcome: "safe with a positive margin", note: "a charted depth, entered as a positive value" },
  { id: "drying-bank", name: "Drying bank", draft: 1.3, clearance: 0.9, charted: -1, tide: 2.7, outcome: "unsafe with a negative margin", note: "a 1.0 m drying height, entered as a negative value" },
  { id: "shallow-channel", name: "Shallow channel", draft: 1.8, clearance: 0.6, charted: 0.9, tide: 1.5, outcome: "exactly at the boundary with no spare margin", note: "a charted depth, entered as a positive value" },
] as const;

const TidalPassageCalculator = ({ onMastery }: Props) => {
  const [previousLow, setPreviousLow] = useState<EventState>({ time: "06:00", height: "0.8" });
  const [high, setHigh] = useState<EventState>({ time: "12:00", height: "4.5" });
  const [followingLow, setFollowingLow] = useState<EventState>({ time: "18:00", height: "0.8" });
  const [draft, setDraft] = useState("1.5");
  const [clearance, setClearance] = useState("1.0");
  const [chartedDepth, setChartedDepth] = useState("0.5");
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [practiceAnswer, setPracticeAnswer] = useState("");
  const [checked, setChecked] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const practiceId = useId();
  const scenario = scenarios[scenarioIndex];
  const expected = scenario.draft + scenario.clearance - scenario.charted;
  const entered = numberOrNaN(practiceAnswer);
  const correct = checked && Number.isFinite(entered) && Math.abs(entered - expected) <= 0.05;

  const model = useMemo(() => {
    const previousMinutes = minutesAfterMidnight(previousLow.time);
    const highMinutes = normaliseFollowingTime(previousMinutes, minutesAfterMidnight(high.time));
    const followingMinutes = normaliseFollowingTime(highMinutes, minutesAfterMidnight(followingLow.time));
    const inputs = {
      previousLow: { minutes: previousMinutes, height: numberOrNaN(previousLow.height) },
      high: { minutes: highMinutes, height: numberOrNaN(high.height) },
      followingLow: { minutes: followingMinutes, height: numberOrNaN(followingLow.height) },
      draft: numberOrNaN(draft), clearance: numberOrNaN(clearance), chartedDepth: numberOrNaN(chartedDepth),
    };
    return { inputs, plan: calculatePassagePlan(inputs) };
  }, [previousLow, high, followingLow, draft, clearance, chartedDepth]);

  const chart = useMemo(() => {
    if (model.plan.status === "invalid" || model.plan.status === "out_of_model") return null;
    const { previousLow: first, high: peak, followingLow: last } = model.inputs;
    const points = Array.from({ length: 97 }, (_, index) => {
      const minutes = first.minutes + (index / 96) * (last.minutes - first.minutes);
      return { minutes, height: minutes <= peak.minutes ? heightAtTime(first, peak, minutes) : heightAtTime(peak, last, minutes) };
    });
    // Keep the curve legible when a valid vessel requirement lies outside the tidal range.
    // Off-scale requirements are described textually rather than distorting the tide scale.
    const values = [...points.map((point) => point.height), 0];
    let min = Math.min(...values);
    let max = Math.max(...values);
    const padding = Math.max((max - min) * 0.12, 0.5);
    min -= padding;
    max += padding;
    const x = (minutes: number) => PADDING + ((minutes - first.minutes) / (last.minutes - first.minutes)) * (WIDTH - PADDING * 2);
    const y = (height: number) => HEIGHT - PADDING - ((height - min) / (max - min)) * (HEIGHT - PADDING * 2);
    const tickStep = Math.max(0.5, Math.ceil(((max - min) / 5) * 2) / 2);
    const firstTick = Math.ceil(min / tickStep) * tickStep;
    const heightTicks = Array.from({ length: Math.floor((max - firstTick) / tickStep) + 1 }, (_, i) => firstTick + i * tickStep);
    const timeTicks = Array.from({ length: 5 }, (_, i) => first.minutes + (i / 4) * (last.minutes - first.minutes));
    return {
      path: points.map((point, i) => `${i ? "L" : "M"} ${x(point.minutes)},${y(point.height)}`).join(" "),
      x, y, heightTicks, timeTicks,
      requiredLineVisible: (model.plan.requiredTide as number) >= min && (model.plan.requiredTide as number) <= max,
      safeRects: model.plan.safeWindows.map((window) => ({ x: x(window.start), width: Math.max(0, x(window.end) - x(window.start)) })),
    };
  }, [model]);

  const eventInput = (title: string, icon: React.ReactNode, value: EventState, setValue: (value: EventState) => void, prefix: string) => {
    const errorId = `${prefix}-error`;
    return (
    <div className="space-y-3 border-b pb-4 last:border-b-0 last:pb-0">
      <div className="flex items-center gap-2 font-medium text-blue-700">{icon}{title}</div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label htmlFor={`${prefix}-time`}>Time</Label>
          <Input id={`${prefix}-time`} type="time" value={value.time} aria-invalid={Boolean(model.plan.errors[`${prefix}.time`])} aria-describedby={model.plan.errors[`${prefix}.time`] ? `${errorId}-time` : undefined} onChange={(event) => setValue({ ...value, time: event.target.value })} />
          {model.plan.errors[`${prefix}.time`] && <p id={`${errorId}-time`} className="text-xs text-red-700">{model.plan.errors[`${prefix}.time`]}</p>}
        </div>
        <div className="space-y-1">
          <Label htmlFor={`${prefix}-height`}>Height above chart datum (m)</Label>
          <Input id={`${prefix}-height`} type="number" step="0.1" value={value.height} aria-invalid={Boolean(model.plan.errors[`${prefix}.height`])} aria-describedby={model.plan.errors[`${prefix}.height`] ? `${errorId}-height` : undefined} onChange={(event) => setValue({ ...value, height: event.target.value })} />
          {model.plan.errors[`${prefix}.height`] && <p id={`${errorId}-height`} className="text-xs text-red-700">{model.plan.errors[`${prefix}.height`]}</p>}
        </div>
      </div>
    </div>
  ); };

  const statusCopy = {
    always_safe: "Always safe within the entered event window (subject to the stated assumptions).",
    never_safe: "Never safe within the entered event window.",
    safe_window: "A predicted safe window exists within the entered events.",
    no_usable_window: "The mathematical safe interval is narrower than one usable five-minute planning interval.",
    boundary: "Boundary case: the required height equals a published tidal event.",
    out_of_model: "Out of model: correct the event sequence before using a result.",
    invalid: "Invalid input: correct the highlighted fields before using a result.",
  }[model.plan.status];

  return <div className="min-w-0 space-y-6">
    <Card className="min-w-0 border-amber-200 bg-amber-50/50">
      <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><AlertTriangle className="h-5 w-5" /> Scope and assumptions</CardTitle></CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p>This teaching aid applies smooth harmonic interpolation only between a preceding LW, the intervening HW, and the following LW from one official tide table. It does not extrapolate beyond those events and is not a navigational prediction.</p>
        <p>Use consecutive events for the same standard port, chart datum and stated local time zone. Start with the date of the preceding LW; each earlier clock time is explicitly treated as falling on the next calendar day. Confirm secondary-port corrections where applicable.</p>
        <p>Predictions omit pressure, wind, waves, swell, silting and survey uncertainty. Check current official predictions and observations, and choose clearance for the vessel, conditions and consequences.</p>
      </CardContent>
    </Card>

    <div className="grid min-w-0 gap-6 md:grid-cols-2">
      <Card className="min-w-0"><CardHeader><CardTitle className="text-lg">Vessel and charted value</CardTitle></CardHeader><CardContent className="space-y-4">
        {([["draft", "Draft (m)", draft, setDraft], ["clearance", "Under-keel clearance (m)", clearance, setClearance], ["chartedDepth", "Signed charted value (m)", chartedDepth, setChartedDepth]] as const).map(([key, label, value, setter]) => <div className="space-y-1" key={key}>
          <Label htmlFor={key}>{label}</Label><Input id={key} type="number" step="0.1" value={value} aria-invalid={Boolean(model.plan.errors[key])} aria-describedby={[key === "chartedDepth" ? "charted-value-hint" : "", model.plan.errors[key] ? `${key}-error` : ""].filter(Boolean).join(" ") || undefined} onChange={(event) => setter(event.target.value)} />
          {model.plan.errors[key] && <p id={`${key}-error`} className="text-xs text-red-700">{model.plan.errors[key]}</p>}
        </div>)}
        <div id="charted-value-hint" className="rounded-md bg-slate-100 p-3 text-sm"><p><strong>Signed convention:</strong> charted depths are positive; drying heights are negative.</p><p>2.0 m depth → +2.0. 1.2 m drying height → −1.2.</p></div>
        {model.plan.requiredTide !== null && <p className="font-medium">Required height of tide: {model.plan.requiredTide.toFixed(1)} m</p>}
      </CardContent></Card>
      <Card className="min-w-0"><CardHeader><CardTitle className="text-lg">Bounding tidal events</CardTitle><CardDescription>Enter consecutive LW–HW–LW events in chronological order.</CardDescription></CardHeader><CardContent className="space-y-4">
        {eventInput("Preceding Low Water", <ArrowDown className="h-4 w-4" />, previousLow, setPreviousLow, "previousLow")}
        {eventInput("High Water", <ArrowUp className="h-4 w-4" />, high, setHigh, "high")}
        {eventInput("Following Low Water", <ArrowDown className="h-4 w-4" />, followingLow, setFollowingLow, "followingLow")}
      </CardContent></Card>
    </div>

    <Card className="min-w-0"><CardHeader><CardTitle>Required-tide practice</CardTitle><CardDescription>Calculate before checking. The planner stays locked after checking so the submitted attempt is unambiguous.</CardDescription></CardHeader><CardContent className="space-y-4">
      <section aria-labelledby={`${practiceId}-scenario`} className="rounded-md border p-4">
        <h3 id={`${practiceId}-scenario`} className="font-semibold">Scenario {scenarioIndex + 1} of {scenarios.length}: {scenario.name}</h3>
        <p className="text-sm">Draft {scenario.draft.toFixed(1)} m; clearance {scenario.clearance.toFixed(1)} m; signed charted value {scenario.charted > 0 ? "+" : ""}{scenario.charted.toFixed(1)} m ({scenario.note}).</p>
      </section>
      <fieldset disabled={checked} className="space-y-2 disabled:opacity-100">
        <Label htmlFor={`${practiceId}-answer`}>Required height of tide, in metres</Label>
        <Input id={`${practiceId}-answer`} type="number" inputMode="decimal" step="0.1" value={practiceAnswer} aria-describedby={`${practiceId}-constraint`} onChange={(event) => setPracticeAnswer(event.target.value)} />
        <p id={`${practiceId}-constraint`} className="text-sm text-muted-foreground">Enter to the nearest 0.1 m. Answers within 0.05 m are accepted.</p>
        <Button type="button" className="min-h-11" disabled={!Number.isFinite(entered)} onClick={() => { setChecked(true); setAttempts((value) => value + 1); if (Math.abs(entered - expected) <= 0.05) onMastery?.(); }}>Check answer</Button>
      </fieldset>
      {checked && <div role={correct ? "status" : "alert"} className={`rounded-md border p-4 text-sm ${correct ? "border-green-700" : "border-red-700"}`}>
        <p className="font-semibold">{correct ? "Correct." : "Not yet correct."} Attempt {attempts}.</p>
        <p>You entered {entered.toFixed(1)} m. Required tide = draft {scenario.draft.toFixed(1)} m + clearance {scenario.clearance.toFixed(1)} m − signed charted value ({scenario.charted.toFixed(1)} m) = {expected.toFixed(1)} m.</p>
        <p>At the scenario's predicted tide of {scenario.tide.toFixed(1)} m, the margin is {(scenario.tide - expected).toFixed(1)} m: {scenario.outcome}. Values are rounded to 0.1 m; use the unrounded calculation and conservative planning limits in practice.</p>
        {!correct && <Button type="button" className="mt-3 min-h-11" onClick={() => { setPracticeAnswer(""); setChecked(false); }}>Retry this scenario</Button>}
        {correct && <Button type="button" className="mt-3 min-h-11" onClick={() => { setScenarioIndex((value) => (value + 1) % scenarios.length); setPracticeAnswer(""); setChecked(false); setAttempts(0); }}>New scenario</Button>}
      </div>}
      <p className="text-sm">Completion evidence is earned by one correct checked attempt. Retry keeps this scenario; New scenario advances through a reproducible three-scenario set.</p>
    </CardContent></Card>

    <Card className="min-w-0"><CardHeader><CardTitle>Passage planning window</CardTitle><CardDescription>{statusCopy}</CardDescription></CardHeader><CardContent className="min-w-0">
      {chart ? <>
        <div className="w-full overflow-x-auto"><svg role="img" aria-labelledby="tidal-chart-title tidal-chart-description" width="100%" height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="min-w-[36rem] rounded border bg-slate-50">
          <title id="tidal-chart-title">Predicted tidal height and required passage height</title><desc id="tidal-chart-description">The tide curve between the three entered events. Safe intervals are also listed in text below the chart.</desc>
          {chart.heightTicks.map((tick) => <g key={tick}><line x1={PADDING} x2={WIDTH-PADDING} y1={chart.y(tick)} y2={chart.y(tick)} stroke="#e2e8f0" /><text x={PADDING-6} y={chart.y(tick)+4} textAnchor="end" fontSize="10">{tick.toFixed(1)}m</text></g>)}
          {chart.timeTicks.map((tick) => <text key={tick} x={chart.x(tick)} y={HEIGHT-PADDING+18} textAnchor="middle" fontSize="10">{formatTidalTime(tick)}</text>)}
          {chart.safeRects.map((rect, index) => <rect key={index} x={rect.x} y={PADDING} width={rect.width} height={HEIGHT-PADDING*2} fill="#16a34a" fillOpacity="0.12" />)}
          {chart.requiredLineVisible && <line x1={PADDING} x2={WIDTH-PADDING} y1={chart.y(model.plan.requiredTide as number)} y2={chart.y(model.plan.requiredTide as number)} stroke="#dc2626" strokeWidth="2" strokeDasharray="4 3" />}
          <path d={chart.path} fill="none" stroke="#2563eb" strokeWidth="2" />
        </svg></div>
        <table className="mt-4 w-full text-left text-sm"><caption className="font-semibold">Text alternative: entered tidal events</caption><thead><tr><th scope="col">Event</th><th scope="col">Time</th><th scope="col">Height</th></tr></thead><tbody><tr><th scope="row">Preceding low water</th><td>{previousLow.time}</td><td>{previousLow.height} m</td></tr><tr><th scope="row">High water</th><td>{high.time}</td><td>{high.height} m</td></tr><tr><th scope="row">Following low water</th><td>{followingLow.time}</td><td>{followingLow.height} m</td></tr></tbody></table>
        <div className="mt-4 rounded-lg border p-4"><h4 className="flex items-center gap-2 font-semibold"><Clock className="h-4 w-4" /> Result</h4>
          <p className="mt-1 text-sm">{statusCopy}</p>
          {model.plan.status === "boundary" && model.plan.safeWindows.map((window, index) => window.start === window.end
            ? <Badge key={index} variant="outline" className="mt-2 mr-2">exact boundary at {formatTidalTime(window.start)}</Badge>
            : <Badge key={index} variant="outline" className="mt-2 mr-2">about {formatTidalTime(conservativeWindow(window).start)}–{formatTidalTime(conservativeWindow(window).end)}</Badge>)}
          {model.plan.status !== "boundary" && model.plan.status !== "no_usable_window" && model.plan.safeWindows.map((window, index) => { const display = conservativeWindow(window); return <Badge key={index} variant="outline" className="mt-2 mr-2">about {formatTidalTime(display.start)}–{formatTidalTime(display.end)}</Badge>; })}
          {model.plan.status === "no_usable_window" && <p className="mt-2 text-sm font-medium text-red-700">No usable five-minute window; do not plan a passage from this result.</p>}
          {!chart.requiredLineVisible && <p className="mt-2 text-xs text-muted-foreground">The required-tide line is outside the plotted tidal-height scale; the result state above still uses the exact value.</p>}
          {model.plan.status !== "no_usable_window" && model.plan.safeWindows.some((window) => window.start < window.end) && <p className="mt-2 text-xs text-muted-foreground">Crossings are calculated analytically; usable displayed limits are rounded inward to five minutes and remain approximate.</p>}
        </div>
      </> : <div role="alert" className="rounded-md border border-red-200 bg-red-50 p-4 text-red-800"><p className="font-semibold">No result or chart is shown.</p><p className="text-sm">{statusCopy}</p></div>}
    </CardContent></Card>
  </div>;
};

export default TidalPassageCalculator;
