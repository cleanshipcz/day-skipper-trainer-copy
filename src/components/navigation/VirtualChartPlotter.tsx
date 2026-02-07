import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Ruler,
  Crosshair,
  Map as MapIcon,
  RotateCcw,
  MousePointer2,
  PlayCircle,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import ChartSurface from "./unified/ChartSurface";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type Tool = "pan" | "plot" | "distance" | "bearing";

interface Point {
  x: number;
  y: number;
}

interface Challenge {
  id: number;
  text: string;
  type: "dist" | "bearing" | "plot";
  tool: Tool;
  targetValue?: number; // For dist/bearing
  targetPoint?: Point; // For plotting
  tolerance?: number;
  hint: string;
}

// 0,0 is Top Left (50°15'N, 001°35'W)
// HEIGHT 3NM, WIDTH 5NM. 1NM = 100px.
// L1: 100, 100
// L2: 400, 200
// L3: 250, 50

const CHALLENGES: Challenge[] = [
  {
    id: 1,
    text: "Measure the distance from the Spire (L1) to the Buoy (L2).",
    type: "dist",
    tool: "distance",
    targetValue: 3.16, // sqrt(300^2 + 100^2) = 316px = 3.16NM
    tolerance: 0.2,
    hint: "Select the 'Dist' tool and drag from the Spire to the Buoy.",
  },
  {
    id: 2,
    text: "Find the Bearing from the Wreck (L3) to the Buoy (L2).",
    type: "bearing",
    tool: "bearing",
    targetValue: 135, // dx 150, dy 150. atan2(150, -150) -> 135 deg
    tolerance: 5,
    hint: "Select 'Bearing'. Drag FROM the Wreck TO the Buoy.",
  },
  {
    id: 3,
    text: "How far is the Lighthouse (L4) from the Fort (L5)?",
    type: "dist",
    tool: "distance",
    // L4(800,600) to L5(600,300). dx=200, dy=300. sqrt(130000) = 360.55 = 3.61NM
    targetValue: 3.61,
    tolerance: 0.2,
    hint: "Measure distance between L4 and L5.",
  },
  {
    id: 4,
    text: "What is the bearing FROM Spire (L1) TO Lighthouse (L4)?",
    type: "bearing",
    tool: "bearing",
    // L1(100,100) to L4(800,600). dx=700, dy=500. atan2(500,700)=35.5 deg. +90 = 125.5 deg.
    targetValue: 125.5,
    tolerance: 5,
    hint: "Drag from Spire to Lighthouse. Remember: Bearings are 'From -> To'.",
  },
  {
    id: 5,
    text: "Plot a position at 50°13.0'N 001°32.0'W",
    type: "plot",
    tool: "plot",
    // Top Left: 50°15'N, 001°35'W
    // Target Lat: 13.0N -> 2 mins South -> 200px down (Y=200)
    // Target Long: 32.0W -> 3 mins East -> 300px right (X=300)
    targetPoint: { x: 300, y: 200 },
    tolerance: 20, // 20px radius = 0.2NM error margin
    hint: "Use the grid lines. Each large square is 1 minute.",
  },
  {
    id: 6,
    text: "Plot a position at 50°12.5'N 001°30.5'W",
    type: "plot",
    tool: "plot",
    // Lat: 15 - 12.5 = 2.5' South -> 250px Y.
    // Long: 35 - 30.5 = 4.5' East -> 450px X.
    targetPoint: { x: 450, y: 250 },
    tolerance: 20,
    hint: "Halfway between grid lines. 2.5' South, 4.5' East of Origin.",
  },
  {
    id: 7,
    text: "Plot a position at 50°14.8'N 001°34.5'W",
    type: "plot",
    tool: "plot",
    // Lat: 15 - 14.8 = 0.2' South -> 20px Y.
    // Long: 35 - 34.5 = 0.5' East -> 50px X.
    targetPoint: { x: 50, y: 20 },
    tolerance: 15,
    hint: "Very close to the Top Left corner.",
  },
  {
    id: 8,
    text: "What is the Reciprocal Bearing from Buoy (L2) to Wreck (L3)?",
    type: "bearing",
    tool: "bearing",
    // L2(400,200) to L3(250,50). dx=-150, dy=-150. atan2(-150,-150)=-135. +90=-45. +360=315.
    targetValue: 315,
    tolerance: 5,
    hint: "Drag FROM Buoy TO Wreck. It's the opposite of Exercise 2.",
  },
];

const VirtualChartPlotter = () => {
  // State
  const [activeTool, setActiveTool] = useState<Tool>("pan");
  const [points, setPoints] = useState<Point[]>([]);

  // Interaction State
  const [dragStart, setDragStart] = useState<Point | null>(null);
  const [dragCurrent, setDragCurrent] = useState<Point | null>(null);

  // Pan State (ViewBox origin)
  const [panOffset, setPanOffset] = useState<Point>({ x: 0, y: 0 });
  const [panStart, setPanStart] = useState<Point | null>(null); // Screen coordinates for panning

  const [measurements, setMeasurements] = useState<{ type: "dist" | "bearing"; val: string; raw: number }[]>([]);

  const [drillActive, setDrillActive] = useState(false);
  const [currentChallengeIndex, setCurrentChallengeIndex] = useState(0);
  const [feedback, setFeedback] = useState<{ success: boolean; text: string } | null>(null);

  // Zoom State
  const [zoomLevel, setZoomLevel] = useState(1); // 1 = 100% (5NM width), 2 = 200% (10NM width - zoomed out, showing more)
  // Wait, standard convention: Zoom Level > 1 usually means "Zoomed In".
  // Let's stick to "Scale".
  // Scale 1 = Normal. Scale 2 = Magnified (Zoom In)? No, SVG viewbox works opposite.
  // Larger ViewBox = Smaller objects = Zoom Out.
  // Let's call state "viewScale".
  // viewScale 1 = 5NM wide.
  // viewScale 2 = 10NM wide (Zoomed Out).
  // viewScale 0.5 = 2.5NM wide (Zoomed In).
  const [viewScale, setViewScale] = useState(1);

  const svgRef = useRef<SVGSVGElement>(null);

  // Large World Dimensions
  const WORLD_WIDTH_NM = 12;
  const WORLD_HEIGHT_NM = 8;
  const SCALE_PIXELS_PER_NM = 100;

  const WORLD_WIDTH_PX = WORLD_WIDTH_NM * SCALE_PIXELS_PER_NM;
  const WORLD_HEIGHT_PX = WORLD_HEIGHT_NM * SCALE_PIXELS_PER_NM;

  // Base View Dimensions
  const BASE_VIEW_WIDTH_NM = 5;
  const BASE_VIEW_HEIGHT_NM = 3;

  const VIEW_WIDTH_PX = BASE_VIEW_WIDTH_NM * SCALE_PIXELS_PER_NM * viewScale;
  const VIEW_HEIGHT_PX = BASE_VIEW_HEIGHT_NM * SCALE_PIXELS_PER_NM * viewScale;

  const landmarks = [
    { id: "L1", x: 100, y: 100, name: "Spire" },
    { id: "L2", x: 400, y: 200, name: "Buoy 'A'" },
    { id: "L3", x: 250, y: 50, name: "Wreck" },
    { id: "L4", x: 800, y: 600, name: "Lighthouse" },
    { id: "L5", x: 600, y: 300, name: "Fort" },
  ];

  const getCoordinates = (x: number, y: number) => {
    // 50-15N is Top (y=0). y increases South.
    // 01-35W is Left (x=0). x increases East.
    const latMinutes = 15 - y / SCALE_PIXELS_PER_NM;
    const longMinutes = 35 - x / SCALE_PIXELS_PER_NM;
    const latDeg = 50;
    const longDeg = 1;
    return `${latDeg}°${latMinutes.toFixed(1)}'N ${longDeg.toString().padStart(3, "0")}°${longMinutes.toFixed(1)}'W`;
  };

  const getDistance = (p1: Point, p2: Point) => {
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    const pixelDist = Math.sqrt(dx * dx + dy * dy);
    return pixelDist / SCALE_PIXELS_PER_NM;
  };

  const getBearing = (p1: Point, p2: Point) => {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    let deg = Math.atan2(dy, dx) * (180 / Math.PI);
    deg = (deg + 90 + 360) % 360; // Convert SVG angle to True Bearing
    return deg;
  };

  // Helper to convert screen coordinates to SVG coordinates (taking Pan into account)
  const getSVGPoint = (e: React.PointerEvent) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const rect = svgRef.current.getBoundingClientRect();

    // Calculate current view width based on scale
    const currentViewWidth = BASE_VIEW_WIDTH_NM * SCALE_PIXELS_PER_NM * viewScale;
    const currentViewHeight = BASE_VIEW_HEIGHT_NM * SCALE_PIXELS_PER_NM * viewScale;

    const scaleX = currentViewWidth / rect.width;
    const scaleY = currentViewHeight / rect.height;

    // Screen delta
    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;

    // Map to World
    return {
      x: clickX + panOffset.x,
      y: clickY + panOffset.y,
    };
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    // For Pan, we need SCREEN coords to calculate delta
    if (activeTool === "pan") {
      setPanStart({ x: e.clientX, y: e.clientY });
      e.currentTarget.setPointerCapture(e.pointerId);
      return;
    }

    const { x, y } = getSVGPoint(e);

    if (activeTool === "plot") {
      setPoints([...points, { x, y }]);
      if (drillActive) checkPlot({ x, y });
    } else if (activeTool === "distance" || activeTool === "bearing") {
      setDragStart({ x, y });
      setDragCurrent({ x, y });
      e.currentTarget.setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (activeTool === "pan" && panStart) {
      const dx = e.clientX - panStart.x; // Screen pixels
      const dy = e.clientY - panStart.y;

      // Adjust movement speed by zoom level so dragging feels 1:1 with cursor
      const moveScale = viewScale;

      setPanOffset((prev) => ({
        x: Math.max(0, Math.min(WORLD_WIDTH_PX - VIEW_WIDTH_PX, prev.x - dx * moveScale)),
        y: Math.max(0, Math.min(WORLD_HEIGHT_PX - VIEW_HEIGHT_PX, prev.y - dy * moveScale)),
      }));
      setPanStart({ x: e.clientX, y: e.clientY });
      return;
    }

    if (dragStart && (activeTool === "distance" || activeTool === "bearing")) {
      const { x, y } = getSVGPoint(e);
      setDragCurrent({ x, y });
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    e.currentTarget.releasePointerCapture(e.pointerId);

    if (activeTool === "pan") {
      setPanStart(null);
      return;
    }

    if (activeTool === "distance" && dragStart && dragCurrent) {
      const dist = getDistance(dragStart, dragCurrent);
      setMeasurements((prev) => [...prev.slice(-4), { type: "dist", val: dist.toFixed(2) + " NM", raw: dist }]);
      if (drillActive) checkMeasurement(dist, "dist");
    } else if (activeTool === "bearing" && dragStart && dragCurrent) {
      const brg = getBearing(dragStart, dragCurrent);
      setMeasurements((prev) => [
        ...prev.slice(-4),
        { type: "bearing", val: Math.round(brg).toString().padStart(3, "0") + "°T", raw: brg },
      ]);
      if (drillActive) checkMeasurement(brg, "bearing");
    }
    setDragStart(null);
    setDragCurrent(null);
  };

  const clear = () => {
    setPoints([]);
    setMeasurements([]);
    setDragStart(null);
    setDragCurrent(null);
    setFeedback(null);
    setPanOffset({ x: 0, y: 0 }); // Reset View
    setViewScale(1);
  };
  // ... (Drill Logic omitted for brevity, unchanged) ...
  // Drill Logic
  const startDrill = () => {
    setDrillActive(true);
    setCurrentChallengeIndex(0);
    setFeedback(null);
    clear();
    setActiveTool("pan");
    // Auto zoom out for the long distance challenge to help user
    if (currentChallengeIndex === 2) setViewScale(2);
  };

  const nextChallenge = () => {
    if (currentChallengeIndex < CHALLENGES.length - 1) {
      setCurrentChallengeIndex((prev) => prev + 1);
      setFeedback(null);
      clear();
      // Auto-zoom heuristics for specific challenges
      const nextIdx = currentChallengeIndex + 1;
      if (
        CHALLENGES[nextIdx].type === "dist" &&
        CHALLENGES[nextIdx].targetValue &&
        CHALLENGES[nextIdx].targetValue > 3
      ) {
        setViewScale(2); // Zoom out for long drills
      }
    } else {
      setDrillActive(false);
      setFeedback({ success: true, text: "All Challenges Completed! Well done." });
    }
  };

  const checkMeasurement = (val: number, type: "dist" | "bearing") => {
    const challenge = CHALLENGES[currentChallengeIndex];
    if (challenge.type !== type) return;

    const diff = Math.abs(val - (challenge.targetValue || 0));
    // Bearing wrap around check
    let adjustedDiff = diff;
    if (type === "bearing") {
      const rawDiff = Math.abs(val - (challenge.targetValue || 0));
      adjustedDiff = Math.min(rawDiff, 360 - rawDiff);
    }

    if (adjustedDiff <= (challenge.tolerance || 0.1)) {
      setFeedback({
        success: true,
        text: "Correct! " + (adjustedDiff < (challenge.tolerance || 0.1) / 2 ? "Spot on." : "Close enough."),
      });
    } else {
      setFeedback({
        success: false,
        text: `Incorrect. You got ${val.toFixed(1)}, expected ~${
          challenge.targetValue
        }. Remember: Bearing is measured clockwise from North.`,
      });
    }
  };

  const checkPlot = (p: Point) => {
    const challenge = CHALLENGES[currentChallengeIndex];
    if (challenge.type !== "plot" || !challenge.targetPoint) return;

    const dist = Math.sqrt(Math.pow(p.x - challenge.targetPoint.x, 2) + Math.pow(p.y - challenge.targetPoint.y, 2));
    if (dist <= (challenge.tolerance || 20)) {
      setFeedback({ success: true, text: "Position Correct!" });
    } else {
      setFeedback({ success: false, text: "Position Incorrect. Check your coordinates." });
    }
  };

  const handleZoom = (direction: "in" | "out") => {
    setViewScale((prev) => {
      const newScale = direction === "in" ? prev - 0.25 : prev + 0.25;
      return Math.max(0.5, Math.min(2.5, newScale)); // Clamp scale
    });
  };

  return (
    <Card className="w-full mt-8 border-2 border-primary/20 bg-card">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <MapIcon className="w-5 h-5 text-primary" />
            Virtual Chart Plotter
          </span>
          <div className="flex gap-2 flex-wrap">
            <div className="flex border rounded-md overflow-hidden mr-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleZoom("in")}
                disabled={viewScale <= 0.5}
                className="h-9 w-9 rounded-none border-r"
              >
                <span className="font-bold text-lg">+</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleZoom("out")}
                disabled={viewScale >= 2.5}
                className="h-9 w-9 rounded-none"
              >
                <span className="font-bold text-lg">-</span>
              </Button>
            </div>

            {!drillActive && (
              <Button onClick={startDrill} variant="default" className="bg-green-600 hover:bg-green-700">
                <PlayCircle className="w-4 h-4 mr-2" /> Start Exercises
              </Button>
            )}
            <Button
              variant={activeTool === "pan" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTool("pan")}
            >
              <MousePointer2 className="w-4 h-4 mr-1" /> Pan
            </Button>
            <Button
              variant={activeTool === "plot" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTool("plot")}
            >
              <Crosshair className="w-4 h-4 mr-1" /> Plot
            </Button>
            <Button
              variant={activeTool === "distance" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTool("distance")}
            >
              <Ruler className="w-4 h-4 mr-1" /> Dist
            </Button>
            <Button
              variant={activeTool === "bearing" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTool("bearing")}
            >
              <RotateCcw className="w-4 h-4 mr-1" /> Bearing
            </Button>
            <Button variant="ghost" size="sm" onClick={clear}>
              Clear
            </Button>
          </div>
        </CardTitle>

        <CardDescription>
          {drillActive ? (
            <div className="mt-2 p-3 bg-secondary/20 rounded-lg border border-secondary text-foreground">
              <span className="font-bold block mb-1">
                Challenge {currentChallengeIndex + 1}/{CHALLENGES.length}:
              </span>
              {CHALLENGES[currentChallengeIndex].text}
              {feedback && (
                <div
                  className={`mt-2 p-2 rounded flex items-center gap-2 ${
                    feedback.success
                      ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                      : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                  }`}
                >
                  {feedback.success ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                  <span>{feedback.text}</span>
                  {feedback.success && currentChallengeIndex < CHALLENGES.length && (
                    <Button
                      size="sm"
                      variant="link"
                      onClick={nextChallenge}
                      className="text-inherit font-bold underline ml-auto"
                    >
                      Next Challenge &rarr;
                    </Button>
                  )}
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-2 italic">
                Hint: {CHALLENGES[currentChallengeIndex].hint}
              </p>
            </div>
          ) : activeTool === "plot" ? (
            "Click to mark a position."
          ) : activeTool === "distance" ? (
            "Drag between two points to measure distance."
          ) : activeTool === "bearing" ? (
            "Drag from Origin to Target to measure Bearing (Clockwise from North)."
          ) : (
            "Explore the chart or Start Exercises."
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="bg-blue-50/50 rounded-xl border overflow-hidden relative select-none touch-none">
          {/* Measurements Overlay */}
          <div className="absolute top-2 right-2 flex flex-col items-end gap-1 pointer-events-none z-10">
            {measurements.map((m, i) => (
              <Badge key={i} variant="secondary" className="shadow-sm">
                {m.type === "dist" ? "📏 " : "🧭 "}
                {m.val}
              </Badge>
            ))}
          </div>

          <div
            className="w-full h-auto cursor-crosshair"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
          >
            <ChartSurface
              ref={svgRef}
              width={WORLD_WIDTH_PX}
              height={WORLD_HEIGHT_PX}
              scale={SCALE_PIXELS_PER_NM}
              viewBox={`${panOffset.x} ${panOffset.y} ${VIEW_WIDTH_PX} ${VIEW_HEIGHT_PX}`}
              labelScale={viewScale}
            >
              {/* Landmarks Overrides */}
              {landmarks.map((lm) => (
                <g key={lm.id} transform={`translate(${lm.x}, ${lm.y})`}>
                  <circle r={4 * viewScale} fill="magenta" stroke="white" strokeWidth={1 * viewScale} />
                  <text
                    y={-8 * viewScale}
                    textAnchor="middle"
                    fontSize={12 * viewScale}
                    fill="black"
                    fontWeight="bold"
                    stroke="white"
                    strokeWidth={0.5 * viewScale}
                    paintOrder="stroke"
                  >
                    {lm.name}
                  </text>
                </g>
              ))}

              {/* User Points */}
              {points.map((p, i) => (
                <g key={i} transform={`translate(${p.x}, ${p.y})`}>
                  <line
                    x1={-5 * viewScale}
                    y1={-5 * viewScale}
                    x2={5 * viewScale}
                    y2={5 * viewScale}
                    stroke="red"
                    strokeWidth={2 * viewScale}
                  />
                  <line
                    x1={5 * viewScale}
                    y1={-5 * viewScale}
                    x2={-5 * viewScale}
                    y2={5 * viewScale}
                    stroke="red"
                    strokeWidth={2 * viewScale}
                  />
                  <text
                    y={20 * viewScale}
                    textAnchor="middle"
                    fontSize={10 * viewScale}
                    fill="red"
                    className="bg-white/50"
                  >
                    {getCoordinates(p.x, p.y)}
                  </text>
                </g>
              ))}

              {/* Active Drag Line */}
              {dragStart && dragCurrent && (
                <g>
                  <line
                    x1={dragStart.x}
                    y1={dragStart.y}
                    x2={dragCurrent.x}
                    y2={dragCurrent.y}
                    stroke={activeTool === "distance" ? "blue" : "purple"}
                    strokeWidth={2 * viewScale}
                    strokeDasharray={`${5 * viewScale},${5 * viewScale}`}
                  />
                  {activeTool === "distance" && (
                    <text
                      x={(dragStart.x + dragCurrent.x) / 2}
                      y={(dragStart.y + dragCurrent.y) / 2 - 10 * viewScale}
                      textAnchor="middle"
                      fill="blue"
                      fontWeight="bold"
                      fontSize={12 * viewScale}
                    >
                      {getDistance(dragStart, dragCurrent).toFixed(2)} NM
                    </text>
                  )}
                  {activeTool === "bearing" && (
                    <text
                      x={(dragStart.x + dragCurrent.x) / 2}
                      y={(dragStart.y + dragCurrent.y) / 2 - 10 * viewScale}
                      textAnchor="middle"
                      fill="purple"
                      fontWeight="bold"
                      fontSize={12 * viewScale}
                    >
                      {Math.round(getBearing(dragStart, dragCurrent)).toString().padStart(3, "0")}°T
                    </text>
                  )}
                </g>
              )}
            </ChartSurface>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Scale: 1 Large Square = 1 Nautical Mile (1'). Lat/Long minutes are marked on axes.
        </p>
      </CardContent>
    </Card>
  );
};

export default VirtualChartPlotter;
