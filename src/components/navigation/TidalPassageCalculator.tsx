import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Clock, Ship, AlertTriangle, ArrowDown, ArrowUp } from "lucide-react";

interface TideInput {
  time: string;
  height: number;
}

const TidalPassageCalculator = () => {
  // State for inputs
  const [hw, setHw] = useState<TideInput>({ time: "12:00", height: 4.5 });
  const [lw, setLw] = useState<TideInput>({ time: "18:00", height: 0.8 });
  const [draft, setDraft] = useState<number>(1.5);
  const [clearance, setClearance] = useState<number>(1.0);
  const [chartedDepth, setChartedDepth] = useState<number>(0.5); // Positive = Depth, Negative = Drying Height? Usually drying is underlined. Let's assume Charted Depth (always add to tide).
  // Note: If drying height, user enters negative depth? Or we explicitly ask?
  // Let's stick to "Charted Depth" where drying heights are negative inputs for simplicity, or provide a toggle.
  // Standard: Charted Depth. If Drying, it's e.g. -2m.

  // Parse time to decimal hours
  const parseTime = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    return h + m / 60;
  };

  const formatTime = (decimal: number) => {
    let h = Math.floor(decimal);
    let m = Math.round((decimal - h) * 60);
    if (m === 60) {
      h += 1;
      m = 0;
    }
    h = h % 24;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
  };

  // Calculations
  const calculations = useMemo(() => {
    const hwTime = parseTime(hw.time);
    const lwTime = parseTime(lw.time);

    // Handle day crossing? For simplicity assume single cycle within 24h or relative order.
    // If LW < HW, it's before. If LW > HW, it's after.
    // Let's normalize to a single 12h plot centered on the "Port" event?
    // Actually, user defines the window.

    // Required Height of Tide
    const requiredTotalDepth = draft + clearance;
    const requiredTideHeight = requiredTotalDepth - chartedDepth;

    // Generate Points for the Graph (every 10 minutes)
    const points = [];
    const safeWindows: { start: number; end: number }[] = [];

    // Determine range to plot: Start from min(HW, LW) - 1h to max(HW, LW) + 1h
    // Or just a fixed duration?
    // Let's do a standard Standard Port curve approximation (Sine wave)
    // Range = HW - LW.
    // Mean Level = (HW + LW) / 2
    // Duration = LW_Time - HW_Time (approx 6h).

    // What if user inputs widely separated times?
    // Let's assume standard semi-diurnal.

    // For smooth plotting, let's sort times.
    const t1 = Math.min(hwTime, lwTime);
    const t2 = Math.max(hwTime, lwTime);
    const isHighFirst = hwTime < lwTime;

    const duration = t2 - t1;
    // Period T approx 12.4h, so half period is ~6.2h.
    // We'll fit a cosine wave between the two points.

    const startPlot = t1 - 1;
    const endPlot = t2 + 1;
    const step = 0.25; // 15 mins

    let currentWindowStart: number | null = null;

    for (let t = startPlot; t <= endPlot; t += 0.1) {
      // Calculate height at time t
      // Cosine interpolation:
      // Phase 0 at HW, PI at LW.
      // angle = (t - hwTime) / (lwTime - hwTime) * PI ... wait.
      const timeDiff = t - hwTime;
      // Duration from HW to LW is (lwTime - hwTime) (could be negative)
      const halfCycle = lwTime - hwTime;
      const angle = (timeDiff / halfCycle) * Math.PI; // 0 at HW, PI at LW.

      // Height = Mean + Amplitude * cos(angle)
      // Amplitude = (HW - LW) / 2
      // At HW (angle 0): Mean + Amp = HW. Correct.
      // At LW (angle PI): Mean - Amp = LW. Correct.
      const mean = (hw.height + lw.height) / 2;
      const amp = (hw.height - lw.height) / 2;

      const h = mean + amp * Math.cos(angle);

      const isSafe = h >= requiredTideHeight;
      points.push({ time: t, height: h, isSafe });

      // Window Logic
      if (isSafe && currentWindowStart === null) {
        currentWindowStart = t;
      } else if (!isSafe && currentWindowStart !== null) {
        safeWindows.push({ start: currentWindowStart, end: t });
        currentWindowStart = null;
      }
    }
    if (currentWindowStart !== null) {
      safeWindows.push({ start: currentWindowStart, end: endPlot });
    }

    return { points, requiredTideHeight, safeWindows };
  }, [hw, lw, draft, clearance, chartedDepth]);

  // SVG Dimensions
  const WIDTH = 600;
  const HEIGHT = 300;
  const PADDING = 40;

  // Scales
  const tMin = calculations.points[0]?.time || 0;
  const tMax = calculations.points[calculations.points.length - 1]?.time || 24;
  const hMax = Math.max(hw.height, 6); // At least 6m scale
  const hMin = 0;

  const scaleX = (t: number) => PADDING + ((t - tMin) / (tMax - tMin)) * (WIDTH - 2 * PADDING);
  const scaleY = (h: number) => HEIGHT - PADDING - (h / hMax) * (HEIGHT - 2 * PADDING);

  // Generate Path
  const pathD = calculations.points.reduce((path, p, i) => {
    const x = scaleX(p.time);
    const y = scaleY(p.height);
    return path + (i === 0 ? `M ${x},${y}` : ` L ${x},${y}`);
  }, "");

  // Drill Mode State
  const [drillMode, setDrillMode] = useState(false);
  const [drillQuestion, setDrillQuestion] = useState<{ time: number; isSafe: boolean } | null>(null);
  const [drillFeedback, setDrillFeedback] = useState<"correct" | "incorrect" | null>(null);
  const [scenarioId, setScenarioId] = useState<number | null>(null);

  const startDrill = () => {
    // Generate Random Scenario
    const rHwH = 3.5 + Math.random() * 3; // 3.5 - 6.5m
    const rLwH = 0.5 + Math.random() * 1.5; // 0.5 - 2.0m
    const rDraft = 1.0 + Math.random() * 1.5; // 1.0 - 2.5m
    const rClear = 0.5 + Math.random() * 1.0; // 0.5 - 1.5m
    const rDepth = -2.0 + Math.random() * 4.0; // -2.0 to +2.0m

    // Random Times (HW between 10:00 and 14:00)
    const rHwT = 10 + Math.random() * 4;
    const rLwT = rHwT + 5.5 + Math.random() * 1.0; // ~6h later

    setHw({ time: formatTime(rHwT), height: Number(rHwH.toFixed(1)) });
    setLw({ time: formatTime(rLwT), height: Number(rLwH.toFixed(1)) });
    setDraft(Number(rDraft.toFixed(1)));
    setClearance(Number(rClear.toFixed(1)));
    setChartedDepth(Number(rDepth.toFixed(1)));

    // Generate Question: "Is it safe at [Time]?"
    // Pick a time between HW-3 and LW+3
    const qTime = rHwT - 2 + Math.random() * (rLwT - rHwT + 4);
    const nextScenarioId = Math.floor(Math.random() * 1000);

    // Calculate answer (re-using logic is tricky outside useMemo, but we can check later)
    setDrillQuestion({ time: qTime, isSafe: false }); // isSafe calculated on check
    setScenarioId(nextScenarioId);
    setDrillFeedback(null);
    setDrillMode(true);
  };

  const checkAnswer = (userSaysSafe: boolean) => {
    if (!drillQuestion) return;

    // Re-verify safe status for the specific question time
    const depth = draft + clearance - chartedDepth;
    // Calculate Tide Height at qTime
    // (copy logic from useMemo or move generation to util?)
    // Inline quick calc:
    const hwT = parseTime(hw.time); // Current State (set by drill)
    const lwT = parseTime(lw.time);
    const mean = (hw.height + lw.height) / 2;
    const amp = (hw.height - lw.height) / 2;
    const halfCycle = lwT - hwT;
    const angle = ((drillQuestion.time - hwT) / halfCycle) * Math.PI;
    const h = mean + amp * Math.cos(angle);

    const actuallySafe = h >= depth;

    if (userSaysSafe === actuallySafe) {
      setDrillFeedback("correct");
    } else {
      setDrillFeedback("incorrect");
    }
  };

  const exitDrill = () => {
    setDrillMode(false);
    setDrillQuestion(null);
    setDrillFeedback(null);
    setScenarioId(null);
  };

  // Required Line logic... (keep existing)
  const reqY = scaleY(calculations.requiredTideHeight);
  const isReqLineVisible = calculations.requiredTideHeight >= 0 && calculations.requiredTideHeight <= hMax;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-slate-100 p-4 rounded-lg border">
        <div>
          <h3 className="font-bold text-slate-800">Practice Exercises</h3>
          <p className="text-sm text-slate-500">Test your skills with random scenarios</p>
        </div>
        {drillMode ? (
          <Button variant="outline" onClick={exitDrill} className="border-red-200 text-red-600 hover:bg-red-50">
            Exit Drill
          </Button>
        ) : (
          <Button onClick={startDrill} className="bg-blue-600">
            Start New Scenario
          </Button>
        )}
      </div>

      {drillMode && drillQuestion && (
        <Card className="border-2 border-blue-500 bg-blue-50/50">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
              <div>
                <h4 className="font-bold text-lg mb-2 text-blue-800">Scenario #{scenarioId ?? 0}</h4>
                <p className="mb-4">
                  Assess the inputs below. Is it safe to cross the bar at
                  <span className="font-bold text-xl ml-2 bg-white px-2 py-1 rounded shadow-sm">
                    {formatTime(drillQuestion.time)}
                  </span>
                  ?
                </p>
                {drillFeedback === null ? (
                  <div className="flex gap-4">
                    <Button
                      size="lg"
                      className="bg-green-600 hover:bg-green-700 w-32"
                      onClick={() => checkAnswer(true)}
                    >
                      YES, Safe
                    </Button>
                    <Button size="lg" className="bg-red-600 hover:bg-red-700 w-32" onClick={() => checkAnswer(false)}>
                      NO, Unsafe
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div
                      className={`text-lg font-bold ${drillFeedback === "correct" ? "text-green-600" : "text-red-600"}`}
                    >
                      {drillFeedback === "correct" ? "Correct! Well done." : "Incorrect. Check the graph!"}
                    </div>
                    <Button variant="outline" onClick={startDrill}>
                      Next Scenario
                    </Button>
                  </div>
                )}
              </div>
              {/* Hide graph initially? Or show clearly? 
                        Pedagogically, seeing the graph helps confirm. 
                        Maybe blur the Safe Windows initially?
                        Let's keep it visible for learning reinforcement. 
                    */}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Existing UI ... Wrap inputs in disabled if drillMode? */}
      <div className={`grid md:grid-cols-2 gap-6 ${drillMode ? "pointer-events-none opacity-90" : ""}`}>
        {/* ... inputs ... */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Vessel & Depth</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Draft (m)</Label>
                <Input type="number" step="0.1" value={draft} onChange={(e) => setDraft(Number(e.target.value))} />
              </div>
              <div className="space-y-2">
                <Label>Clearance (m)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={clearance}
                  onChange={(e) => setClearance(Number(e.target.value))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Charted Depth (m)</Label>
              <div className="flex gap-2 items-center">
                <Input
                  type="number"
                  step="0.1"
                  value={chartedDepth}
                  onChange={(e) => setChartedDepth(Number(e.target.value))}
                />
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  (Use negative for Drying ex: -1.2)
                </span>
              </div>
            </div>

            <div className="p-3 bg-muted rounded-md text-sm">
              <div className="flex justify-between font-medium">
                <span>Required Tide:</span>
                <span>{calculations.requiredTideHeight.toFixed(2)}m</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>(Draft + Safety - Depth)</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tide Data</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2 font-medium text-blue-600">
                <ArrowUp className="w-4 h-4" /> High Water
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs">Time</Label>
                  <Input type="time" value={hw.time} onChange={(e) => setHw({ ...hw, time: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Height (m)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={hw.height}
                    onChange={(e) => setHw({ ...hw, height: Number(e.target.value) })}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-2 border-t">
              <div className="flex items-center gap-2 font-medium text-red-600">
                <ArrowDown className="w-4 h-4" /> Low Water
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs">Time</Label>
                  <Input type="time" value={lw.time} onChange={(e) => setLw({ ...lw, time: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Height (m)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={lw.height}
                    onChange={(e) => setLw({ ...lw, height: Number(e.target.value) })}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Visualization */}
      <Card>
        <CardHeader>
          <CardTitle>Passage Planning Window</CardTitle>
          <CardDescription>
            Safe passage windows are highlighted in <span className="text-green-600 font-bold">green</span>.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="w-full overflow-x-auto">
            <svg
              width="100%"
              height={HEIGHT}
              viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
              className="mx-auto border border-slate-100 rounded bg-slate-50/50"
            >
              {/* Axes */}
              <line x1={PADDING} y1={HEIGHT - PADDING} x2={WIDTH - PADDING} y2={HEIGHT - PADDING} stroke="#94a3b8" />
              <line x1={PADDING} y1={PADDING} x2={PADDING} y2={HEIGHT - PADDING} stroke="#94a3b8" />

              {/* Grid Lines H */}
              {[0, 1, 2, 3, 4, 5, 6].map((h) => {
                if (h > hMax) return null;
                const y = scaleY(h);
                return (
                  <g key={h}>
                    <line x1={PADDING} y1={y} x2={WIDTH - PADDING} y2={y} stroke="#e2e8f0" strokeDasharray="3,3" />
                    <text x={PADDING - 5} y={y + 4} textAnchor="end" fontSize="10" fill="#64748b">
                      {h}m
                    </text>
                  </g>
                );
              })}

              {/* Time Labels (Approx every hour) */}
              {calculations.points
                .filter((_, i) => i % 4 === 0)
                .map((p) => {
                  const x = scaleX(p.time);
                  return (
                    <text key={p.time} x={x} y={HEIGHT - PADDING + 15} textAnchor="middle" fontSize="10" fill="#64748b">
                      {Math.floor(p.time) % 24}:
                      {Math.round((p.time % 1) * 60)
                        .toString()
                        .padStart(2, "0")}
                    </text>
                  );
                })}

              {/* Required Tide Line (Red Limit) */}
              {isReqLineVisible && (
                <>
                  <line
                    x1={PADDING}
                    y1={reqY}
                    x2={WIDTH - PADDING}
                    y2={reqY}
                    stroke="#dc2626"
                    strokeWidth="2"
                    strokeDasharray="4,2"
                  />
                  <text
                    x={WIDTH - PADDING - 10}
                    y={reqY - 5}
                    textAnchor="end"
                    fill="#dc2626"
                    fontSize="10"
                    fontWeight="bold"
                  >
                    Required: {calculations.requiredTideHeight.toFixed(1)}m
                  </text>

                  {/* Shading Unsafe Area (Below Line) */}
                  <rect
                    x={PADDING}
                    y={reqY}
                    width={WIDTH - 2 * PADDING}
                    height={Math.max(0, HEIGHT - PADDING - reqY)}
                    fill="#dc2626"
                    fillOpacity="0.05"
                  />
                </>
              )}

              {/* Safe Windows Highlight - Hidden during drill until answered */}
              {(!drillMode || drillFeedback !== null) &&
                calculations.safeWindows.map((win, i) => {
                  const x1 = scaleX(win.start);
                  const x2 = scaleX(win.end);
                  return (
                    <rect
                      key={i}
                      x={x1}
                      y={PADDING}
                      width={x2 - x1}
                      height={HEIGHT - 2 * PADDING}
                      fill="#16a34a"
                      fillOpacity="0.1"
                    />
                  );
                })}

              {/* Tide Curve */}
              <path d={pathD} fill="none" stroke="#2563eb" strokeWidth="2" />

              {/* HW/LW Dots */}
              <circle cx={scaleX(parseTime(hw.time))} cy={scaleY(hw.height)} r="4" fill="#2563eb" />
              <circle cx={scaleX(parseTime(lw.time))} cy={scaleY(lw.height)} r="4" fill="#2563eb" />
            </svg>
          </div>

          {/* Windows Text Summary */}
          <div className="mt-4 p-4 bg-green-50 border border-green-100 rounded-lg">
            <h4 className="font-semibold text-green-800 flex items-center gap-2">
              <Clock className="w-4 h-4" /> Safe Navigation Windows
            </h4>
            {calculations.safeWindows.length > 0 ? (
              <div className="mt-2 flex flex-wrap gap-2">
                {calculations.safeWindows.map((w, i) => (
                  <Badge key={i} variant="outline" className="bg-white border-green-200 text-green-700">
                    {formatTime(w.start)} — {formatTime(w.end)}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-sm text-red-600 font-medium">
                No safe passage windows available with current parameters!
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TidalPassageCalculator;
