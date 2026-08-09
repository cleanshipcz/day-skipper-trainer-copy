import { useMemo, useState } from "react";
import { AlertTriangle, ArrowDown, ArrowUp, Clock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { calculatePassagePlan, conservativeWindow, formatTidalTime, heightAtTime, minutesAfterMidnight, normaliseFollowingTime } from "@/lib/tidalHeights";

type EventState = { time: string; height: string };
const WIDTH = 600;
const HEIGHT = 300;
const PADDING = 48;

const numberOrNaN = (value: string) => value.trim() === "" ? Number.NaN : Number(value);

const TidalPassageCalculator = () => {
  const [previousLow, setPreviousLow] = useState<EventState>({ time: "06:00", height: "0.8" });
  const [high, setHigh] = useState<EventState>({ time: "12:00", height: "4.5" });
  const [followingLow, setFollowingLow] = useState<EventState>({ time: "18:00", height: "0.8" });
  const [draft, setDraft] = useState("1.5");
  const [clearance, setClearance] = useState("1.0");
  const [chartedDepth, setChartedDepth] = useState("0.5");

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

  const eventInput = (title: string, icon: React.ReactNode, value: EventState, setValue: (value: EventState) => void, prefix: string) => (
    <div className="space-y-3 border-b pb-4 last:border-b-0 last:pb-0">
      <div className="flex items-center gap-2 font-medium text-blue-700">{icon}{title}</div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label htmlFor={`${prefix}-time`}>Time</Label>
          <Input id={`${prefix}-time`} type="time" value={value.time} aria-invalid={Boolean(model.plan.errors[`${prefix}.time`])} onChange={(event) => setValue({ ...value, time: event.target.value })} />
          {model.plan.errors[`${prefix}.time`] && <p className="text-xs text-red-700">{model.plan.errors[`${prefix}.time`]}</p>}
        </div>
        <div className="space-y-1">
          <Label htmlFor={`${prefix}-height`}>Height above chart datum (m)</Label>
          <Input id={`${prefix}-height`} type="number" step="0.1" value={value.height} aria-invalid={Boolean(model.plan.errors[`${prefix}.height`])} onChange={(event) => setValue({ ...value, height: event.target.value })} />
          {model.plan.errors[`${prefix}.height`] && <p className="text-xs text-red-700">{model.plan.errors[`${prefix}.height`]}</p>}
        </div>
      </div>
    </div>
  );

  const statusCopy = {
    always_safe: "Always safe within the entered event window (subject to the stated assumptions).",
    never_safe: "Never safe within the entered event window.",
    safe_window: "A predicted safe window exists within the entered events.",
    no_usable_window: "The mathematical safe interval is narrower than one usable five-minute planning interval.",
    boundary: "Boundary case: the required height equals a published tidal event.",
    out_of_model: "Out of model: correct the event sequence before using a result.",
    invalid: "Invalid input: correct the highlighted fields before using a result.",
  }[model.plan.status];

  return <div className="space-y-6">
    <Card className="border-amber-200 bg-amber-50/50">
      <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><AlertTriangle className="h-5 w-5" /> Scope and assumptions</CardTitle></CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p>This teaching aid applies smooth harmonic interpolation only between a preceding LW, the intervening HW, and the following LW from one official tide table. It does not extrapolate beyond those events and is not a navigational prediction.</p>
        <p>Use consecutive events for the same standard port, chart datum and stated local time zone. Start with the date of the preceding LW; each earlier clock time is explicitly treated as falling on the next calendar day. Confirm secondary-port corrections where applicable.</p>
        <p>Predictions omit pressure, wind, waves, swell, silting and survey uncertainty. Check current official predictions and observations, and choose clearance for the vessel, conditions and consequences.</p>
      </CardContent>
    </Card>

    <div className="grid gap-6 md:grid-cols-2">
      <Card><CardHeader><CardTitle className="text-lg">Vessel and charted value</CardTitle></CardHeader><CardContent className="space-y-4">
        {([["draft", "Draft (m)", draft, setDraft], ["clearance", "Under-keel clearance (m)", clearance, setClearance], ["chartedDepth", "Signed charted value (m)", chartedDepth, setChartedDepth]] as const).map(([key, label, value, setter]) => <div className="space-y-1" key={key}>
          <Label htmlFor={key}>{label}</Label><Input id={key} type="number" step="0.1" value={value} aria-invalid={Boolean(model.plan.errors[key])} onChange={(event) => setter(event.target.value)} />
          {model.plan.errors[key] && <p className="text-xs text-red-700">{model.plan.errors[key]}</p>}
        </div>)}
        <div className="rounded-md bg-slate-100 p-3 text-sm"><p><strong>Depth example:</strong> 2.0 m charted depth → enter <strong>+2.0</strong>.</p><p><strong>Drying example:</strong> 1.2 m drying height → enter <strong>−1.2</strong>.</p></div>
        {model.plan.requiredTide !== null && <p className="font-medium">Required height of tide: {model.plan.requiredTide.toFixed(1)} m</p>}
      </CardContent></Card>
      <Card><CardHeader><CardTitle className="text-lg">Bounding tidal events</CardTitle><CardDescription>Enter consecutive LW–HW–LW events in chronological order.</CardDescription></CardHeader><CardContent className="space-y-4">
        {eventInput("Preceding Low Water", <ArrowDown className="h-4 w-4" />, previousLow, setPreviousLow, "previousLow")}
        {eventInput("High Water", <ArrowUp className="h-4 w-4" />, high, setHigh, "high")}
        {eventInput("Following Low Water", <ArrowDown className="h-4 w-4" />, followingLow, setFollowingLow, "followingLow")}
      </CardContent></Card>
    </div>

    <Card><CardHeader><CardTitle>Passage planning window</CardTitle><CardDescription>{statusCopy}</CardDescription></CardHeader><CardContent>
      {chart ? <>
        <div className="w-full overflow-x-auto"><svg role="img" aria-label="Predicted tidal height and required height within the entered events" width="100%" height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="min-w-[36rem] rounded border bg-slate-50">
          {chart.heightTicks.map((tick) => <g key={tick}><line x1={PADDING} x2={WIDTH-PADDING} y1={chart.y(tick)} y2={chart.y(tick)} stroke="#e2e8f0" /><text x={PADDING-6} y={chart.y(tick)+4} textAnchor="end" fontSize="10">{tick.toFixed(1)}m</text></g>)}
          {chart.timeTicks.map((tick) => <text key={tick} x={chart.x(tick)} y={HEIGHT-PADDING+18} textAnchor="middle" fontSize="10">{formatTidalTime(tick)}</text>)}
          {chart.safeRects.map((rect, index) => <rect key={index} x={rect.x} y={PADDING} width={rect.width} height={HEIGHT-PADDING*2} fill="#16a34a" fillOpacity="0.12" />)}
          {chart.requiredLineVisible && <line x1={PADDING} x2={WIDTH-PADDING} y1={chart.y(model.plan.requiredTide as number)} y2={chart.y(model.plan.requiredTide as number)} stroke="#dc2626" strokeWidth="2" strokeDasharray="4 3" />}
          <path d={chart.path} fill="none" stroke="#2563eb" strokeWidth="2" />
        </svg></div>
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
