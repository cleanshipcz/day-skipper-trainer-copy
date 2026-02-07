import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlayCircle, CheckCircle2, XCircle } from "lucide-react";

interface Challenge {
  tide: number;
  chartedDepth: number;
  isDrying?: boolean;
  dryingHeight?: number;
}

const TidalVisualizer = () => {
  // Model State
  const [tideHeight, setTideHeight] = useState([2.5]); // Meters above CD

  // Constants for Visuals
  const SVG_HEIGHT = 400;
  const SVG_WIDTH = 600;
  const PIXELS_PER_METER = 40;
  const CHART_DATUM_Y = 200; // Y position of Chart Datum (0m)

  // Drill State
  const [drillActive, setDrillActive] = useState(false);
  const [currentChallenge, setCurrentChallenge] = useState<Challenge>({ tide: 3.0, chartedDepth: 2.0 });
  const [userAnswer, setUserAnswer] = useState("");
  const [feedback, setFeedback] = useState<{ success: boolean; text: string } | null>(null);

  const startDrill = () => {
    setDrillActive(true);
    generateChallenge();
  };

  const generateChallenge = () => {
    const isDrying = Math.random() > 0.5;
    const tide = Number((Math.random() * 5 + 0.5).toFixed(1));

    if (isDrying) {
      const dryingHeight = Number((Math.random() * 2 + 0.5).toFixed(1));
      setCurrentChallenge({ tide, isDrying: true, dryingHeight, chartedDepth: 0 });
      // Set visual to match
      setTideHeight([tide]);
    } else {
      const chartedDepth = Number((Math.random() * 5 + 1).toFixed(1));
      setCurrentChallenge({ tide, isDrying: false, chartedDepth });
      setTideHeight([tide]);
    }
    setUserAnswer("");
    setFeedback(null);
  };

  const checkAnswer = () => {
    const ans = parseFloat(userAnswer);
    if (isNaN(ans)) return;

    let correct = 0;
    if (currentChallenge.isDrying) {
      // Actual Depth = Tide - Drying Height
      // If Tide < Drying Height, it's dry (negative or 0 depth? Usually we say "Dries X meters" or "Covered by Y meters")
      // Question: "What is the depth of water?"
      // If Tide (3m) - Drying (1m) = 2m water.
      correct = currentChallenge.tide - (currentChallenge.dryingHeight || 0);
    } else {
      // Actual Depth = Charted Depth + Tide
      correct = currentChallenge.chartedDepth + currentChallenge.tide;
    }

    // Tolerance 0.1
    if (Math.abs(ans - correct) < 0.15) {
      setFeedback({ success: true, text: "Correct!" });
      // Auto next after delay? Or button.
    } else {
      setFeedback({ success: false, text: `Incorrect. Expected ${correct.toFixed(1)}m` });
    }
  };

  // derived Y coords
  const waterLevelY = CHART_DATUM_Y - tideHeight[0] * PIXELS_PER_METER;

  // Static Seabed (Charted Depth 5m)
  const seabedY = CHART_DATUM_Y + 5 * PIXELS_PER_METER;

  return (
    <Card className="w-full border-blue-200 bg-slate-50">
      <CardHeader>
        <CardTitle className="text-blue-900">Interactive Tidal Curves</CardTitle>
        <CardDescription>
          Visualize how the <strong>Height of Tide</strong> adds to the <strong>Charted Depth</strong>.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-6">
          {/* Controls */}
          <div className="flex items-center gap-4 bg-white p-4 rounded-lg border shadow-sm">
            <div className="flex-1 space-y-2">
              <Label>
                Height of Tide: <span className="text-blue-600 font-bold text-lg">{tideHeight[0].toFixed(1)}m</span>
              </Label>
              <Slider
                value={tideHeight}
                min={0}
                max={6}
                step={0.1}
                onValueChange={(val) => {
                  setTideHeight(val);
                  if (drillActive) setDrillActive(false); // Reset drill if user plays manually
                }}
              />
            </div>

            <div className="h-10 w-px bg-slate-200 mx-2"></div>

            <div className="flex-1 flex flex-col gap-2">
              {!drillActive ? (
                <Button
                  onClick={startDrill}
                  variant="outline"
                  className="w-full border-blue-300 text-blue-700 hover:bg-blue-50"
                >
                  <PlayCircle className="w-4 h-4 mr-2" /> Start Drill
                </Button>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm font-medium">
                    {currentChallenge.isDrying
                      ? `Rock dries ${currentChallenge.dryingHeight}m. Tide is ${currentChallenge.tide}m.`
                      : `Chart depth ${currentChallenge.chartedDepth}m. Tide is ${currentChallenge.tide}m.`}
                    <br />
                    Depth of water?
                  </p>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Depth (m)"
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      className="w-24 bg-white"
                    />
                    <Button onClick={checkAnswer}>Check</Button>
                    <Button variant="ghost" onClick={generateChallenge}>
                      Skip
                    </Button>
                  </div>
                  {feedback && (
                    <p
                      className={`text-sm flex items-center gap-1 ${
                        feedback.success ? "text-green-600" : "text-red-500"
                      }`}
                    >
                      {feedback.success ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                      {feedback.text}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Visualization */}
          <div className="w-full overflow-hidden rounded-xl border bg-[#eef6fc] relative">
            <svg
              width="100%"
              height={SVG_HEIGHT}
              viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
              className="mx-auto select-none"
            >
              <defs>
                <pattern id="water" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M0 20 Q 5 5 10 20 T 20 20" fill="none" stroke="#60a5fa" strokeOpacity="0.3" />
                </pattern>
              </defs>

              {/* 1. Sky/Background */}
              <rect width={SVG_WIDTH} height={SVG_HEIGHT} fill="#e0f2fe" />

              {/* 2. Seabed (Fixed) */}
              {/* Sloping bottom from left to right */}
              <path
                d={`M 0 ${CHART_DATUM_Y} L 0 ${SVG_HEIGHT} L ${SVG_WIDTH} ${SVG_HEIGHT} L ${SVG_WIDTH} ${
                  CHART_DATUM_Y + 120
                } L 400 ${CHART_DATUM_Y + 120} L 200 ${CHART_DATUM_Y + 150} Z`}
                fill="#dcd7c1"
                stroke="#a8a29e"
              />

              {/* 3. Rock (Drying Height) */}
              {/* A rock that sticks up ABOVE CD. Let's say it dries 1.5m */}
              {/* 1.5m above CD = CHART_DATUM_Y - 1.5*40 */}
              <path
                d={`M 450 ${CHART_DATUM_Y + 120} Q 480 ${CHART_DATUM_Y - 1.5 * PIXELS_PER_METER} 510 ${
                  CHART_DATUM_Y + 120
                } Z`}
                fill="#78716c"
                stroke="#44403c"
              />
              {/* Label Rock */}
              <text
                x={480}
                y={CHART_DATUM_Y - 1.5 * PIXELS_PER_METER - 10}
                textAnchor="middle"
                fontSize="12"
                fill="#44403c"
                fontWeight="bold"
              >
                <tspan textDecoration="underline">1.5</tspan>
              </text>

              {/* 4. Chart Datum Line */}
              <line
                x1={0}
                y1={CHART_DATUM_Y}
                x2={SVG_WIDTH}
                y2={CHART_DATUM_Y}
                stroke="#94a3b8"
                strokeWidth="2"
                strokeDasharray="5,5"
              />
              <text x={10} y={CHART_DATUM_Y - 5} fontSize="12" fill="#64748b" fontWeight="bold">
                CHART DATUM (LAT)
              </text>

              {/* 5. Water (Dynamic) */}
              <rect
                x={0}
                y={waterLevelY}
                width={SVG_WIDTH}
                height={SVG_HEIGHT - waterLevelY}
                fill="#3b82f6"
                fillOpacity="0.4"
              />
              <line x1={0} y1={waterLevelY} x2={SVG_WIDTH} y2={waterLevelY} stroke="#2563eb" strokeWidth="2" />
              <text x={SVG_WIDTH - 100} y={waterLevelY - 5} fontSize="12" fill="#1e40af" fontWeight="bold">
                SEA SURFACE
              </text>

              {/* 6. Measurement Arrows */}

              {/* A: Height of Tide (CD to Surface) */}
              <g transform="translate(100, 0)">
                <line
                  x1={0}
                  y1={CHART_DATUM_Y}
                  x2={0}
                  y2={waterLevelY}
                  stroke="#1e40af"
                  strokeWidth="2"
                  markerEnd="url(#arrowhead)"
                  markerStart="url(#arrowhead)"
                />
                <text x={10} y={(CHART_DATUM_Y + waterLevelY) / 2} fill="#1e40af" fontWeight="bold" fontSize="14">
                  Height of Tide {tideHeight[0].toFixed(1)}m
                </text>
              </g>

              {/* B: Charted Depth (CD to Seabed) */}
              {/* At x=200, Seabed is at +150px (approx 3.75m) */}
              <g transform="translate(200, 0)">
                <line x1={0} y1={CHART_DATUM_Y} x2={0} y2={CHART_DATUM_Y + 150} stroke="#ca8a04" strokeWidth="2" />
                <text x={5} y={CHART_DATUM_Y + 75} fill="#ca8a04" fontWeight="bold" fontSize="14">
                  Charted Depth 3.8m
                </text>
              </g>

              {/* C: Actual Depth (Surface to Seabed) */}
              <g transform="translate(250, 0)">
                <line
                  x1={0}
                  y1={waterLevelY}
                  x2={0}
                  y2={CHART_DATUM_Y + 150}
                  stroke="#15803d"
                  strokeWidth="3"
                  pointerEvents="none"
                />
                {/* Horizontal indicators */}
                <line x1={-5} y1={waterLevelY} x2={5} y2={waterLevelY} stroke="#15803d" strokeWidth="3" />
                <line
                  x1={-5}
                  y1={CHART_DATUM_Y + 150}
                  x2={5}
                  y2={CHART_DATUM_Y + 150}
                  stroke="#15803d"
                  strokeWidth="3"
                />

                <text x={10} y={waterLevelY + 100} fill="#15803d" fontWeight="bold" fontSize="14">
                  Actual Depth {(3.75 + tideHeight[0]).toFixed(1)}m
                </text>
              </g>
            </svg>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TidalVisualizer;
