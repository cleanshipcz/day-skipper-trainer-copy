import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Compass, Pencil, Move, Map as MapIcon, Maximize2, Minimize2 } from "lucide-react";
import ChartSurface from "./ChartSurface";
import { PortlandPlotter, SightLine, PencilMark } from "./NavigationTools";
import SkipperMentor from "./SkipperMentor";
import { analyzeBearing } from "./navigationUtils";

interface Point {
  x: number;
  y: number;
}

const UnifiedChartTable = () => {
  const [fullscreen, setFullscreen] = useState(false);
  const [activeTool, setActiveTool] = useState<"pan" | "plotter" | "compass" | "pencil">("pan");

  // Simulation State
  const [boatPos] = useState<Point>({ x: 300, y: 300 }); // Fixed implicit boat position for this scenario
  const [plots, setPlots] = useState<{ p1: Point; p2: Point }[]>([]); // Lines drawn
  const [fixes, setFixes] = useState<Point[]>([]); // Pencil marks

  // Sighting State
  const [lastSight, setLastSight] = useState<{ name: string; mag: number } | null>(null);
  const VARIATION = 5; // 5 degrees West

  // Tool State
  const [plotterPos, setPlotterPos] = useState<Point>({ x: 100, y: 150 });
  const [plotterRotation, setPlotterRotation] = useState(0);
  const [isDraggingPlotter, setIsDraggingPlotter] = useState(false);
  const [isRotatingPlotter, setIsRotatingPlotter] = useState(false);

  const [mentorFeedback, setMentorFeedback] = useState<{
    type: "info" | "warning" | "error" | "success";
    message: string;
  } | null>(null);

  // Landmarks
  const landmarks = [
    { id: "L1", x: 100, y: 150, name: "Headland Lt" },
    { id: "L2", x: 450, y: 80, name: "North Buoy" },
    { id: "L3", x: 500, y: 350, name: "Island Beacon" },
  ];

  // --- Interaction Handlers ---

  // 1. Tool Manipulation (Drag/Rotate)
  const handlePointerMove = (e: React.PointerEvent) => {
    // Simple drag logic (assuming SVG coordinates match 1:1 for simplicity in this view,
    // normally needs getSVGPoint but we assume fullscreen/container controls roughly)
    // For robustness, we should use movementX/Y or diffs.
    if (isDraggingPlotter) {
      setPlotterPos((prev) => ({ x: prev.x + e.movementX, y: prev.y + e.movementY }));
    }
    if (isRotatingPlotter) {
      // Rotate based on relative position? Or just simple scroll?
      // Simple: movementX rotates.
      setPlotterRotation((prev) => (prev + e.movementX) % 360);
    }
  };

  const handlePointerUp = () => {
    setIsDraggingPlotter(false);
    setIsRotatingPlotter(false);
  };

  // 2. Sighting (Compass)
  const handleLandmarkClick = (lm: (typeof landmarks)[0]) => {
    if (activeTool === "compass") {
      const dx = lm.x - boatPos.x;
      const dy = boatPos.y - lm.y;
      let theta = Math.atan2(dx, dy) * (180 / Math.PI);
      if (theta < 0) theta += 360;
      const magBearing = theta + VARIATION; // Mag = True + Var (Var is West so +? No. True = Mag - Var(W). So Mag = True + Var)

      setLastSight({ name: lm.name, mag: magBearing });
      setMentorFeedback({
        type: "info",
        message: `Sighted ${lm.name}: ${Math.round(magBearing)}°M.`,
        details: `Variation is ${VARIATION}°W. Calculate True Bearing to plot.`,
      });
    }
  };

  // 3. Drawing (The "Check" Step)
  const handleDrawLine = () => {
    if (activeTool !== "plotter") return;

    // Validation: Is plotter aligned with a valid bearing?
    // Check if plotter rotation roughly matches any calculated True Bearing of a landmark
    // True Bearing = Mag - 5.
    // We iterate landmarks to see if we are aligned with ONE of them.

    let validPlot = false;
    const plotterBearing = (plotterRotation + 360) % 360; // Normalize

    for (const lm of landmarks) {
      const dx = lm.x - boatPos.x;
      const dy = boatPos.y - lm.y;
      let trueBearing = Math.atan2(dx, dy) * (180 / Math.PI);
      if (trueBearing < 0) trueBearing += 360;

      // Tolerance check (how precise is the user's plotting?)
      const diff = Math.abs(plotterBearing - trueBearing);
      const isAlignedOrbit = Math.abs(diff) < 5 || Math.abs(diff - 360) < 5;
      const isReciprocal = Math.abs(diff - 180) < 5;

      // Alignment check: Is the plotter EDGE actually near the landmark?
      // (Simplification: If angle is right, we assume they are drawing "from" the object back to ship?
      // Or "from" ship? Ship pos is unknown to them (that's the point).
      // They draw FROM the landmark, along the reciprocal? Or just Draw the LOP.
      // On chart, they draw line through Landmark at angle.
      // So check: Plotter passes through Landmark?
      // Distance of Landmark from Line defined by Plotter (Pos, Angle).

      // Line Eq: (y - y0) = tan(angle)(x - x0). x0,y0 is plotter center?
      // Plotter center: plotterPos. Angle: (plotterBearing - 90)?
      // SVG Rotation 0 is Up. Atan2 0 is Up (if arguments swapped).
      // Let's assume Plotter "Up" aligns with North.
      // Line vector: [sin(rot), -cos(rot)].
      // Normal vector: [cos(rot), sin(rot)].
      // Dist = |(lm - plotter).normal|

      const angleRad = (plotterBearing - 90) * (Math.PI / 180); // Adjust for math
      const normal = { x: Math.cos(angleRad), y: Math.sin(angleRad) }; // Very rough math check
      // Wait, standard rotation 0 = up.
      // Vector UP: (0, -1). Rotated by Theta: (sin t, -cos t).
      // Normal: (cos t, sin t).

      // ACTUALLY, Simpler validation:
      // If User angle matches Landmark True Bearing (+/- 5 deg)
      // AND User plotter is "close enough" to landmark (distance < 100px)

      const distToLandmark = Math.sqrt(Math.pow(lm.x - plotterPos.x, 2) + Math.pow(lm.y - plotterPos.y, 2));

      if (isAlignedOrbit && distToLandmark < 150) {
        validPlot = true;
        // Draw the line
        const length = 800;
        const p1 = {
          x: lm.x - length * Math.sin((plotterBearing * Math.PI) / 180),
          y: lm.y + length * Math.cos((plotterBearing * Math.PI) / 180),
        }; // Backwards
        const p2 = {
          x: lm.x + length * Math.sin((plotterBearing * Math.PI) / 180),
          y: lm.y - length * Math.cos((plotterBearing * Math.PI) / 180),
        };

        setPlots((prev) => [...prev, { p1, p2 }]);
        setMentorFeedback({ type: "success", message: `Good LOP plotted from ${lm.name}.` });
        break;
      }

      if (isReciprocal && distToLandmark < 150) {
        setMentorFeedback({ type: "warning", message: "Reciprocal! You are plotting 180° opposite." });
        return;
      }
    }

    if (!validPlot) {
      setMentorFeedback({
        type: "error",
        message: "Alignment Error.",
        details: "Ensure Plotter edge passes through a sighted object and dial is set to TRUE bearing.",
      });
    }
  };

  return (
    <Card
      className={`w-full transition-all duration-500 ${
        fullscreen ? "fixed inset-0 z-50 rounded-none h-screen bg-stone-100" : "mt-8 border-2 border-primary/20"
      }`}
      onPointerUp={handlePointerUp}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2 bg-white/80 backdrop-blur">
        <div>
          <CardTitle className="flex items-center gap-2">
            <MapIcon className="w-5 h-5 text-primary" />
            Unified Chart Table
          </CardTitle>
          <CardDescription>
            Mission: Fix position. 1. Sight object (Compass). 2. Calc True (Var 5°W). 3. Plot (Plotter).
          </CardDescription>
        </div>
        <div className="flex gap-2 items-center">
          {/* Data Display */}
          {lastSight && (
            <div className="mr-4 px-3 py-1 bg-stone-200 rounded text-xs font-mono">
              Last: {lastSight.name} @ <strong>{Math.round(lastSight.mag)}°M</strong>
            </div>
          )}

          <div className="h-6 w-px bg-stone-300 mx-2" />

          <Button
            variant={activeTool === "compass" ? "default" : "outline"}
            size="icon"
            onClick={() => setActiveTool("compass")}
            title="Hand Bearing Compass"
          >
            <Compass className="w-4 h-4" />
          </Button>
          <Button
            variant={activeTool === "plotter" ? "default" : "outline"}
            size="icon"
            onClick={() => setActiveTool("plotter")}
            title="Portland Plotter"
          >
            <Move className="w-4 h-4 rotate-45" />
          </Button>
          {activeTool === "plotter" && (
            <Button variant="default" size="sm" onClick={handleDrawLine} className="ml-2 animate-in fade-in">
              <Pencil className="w-4 h-4 mr-2" /> Draw LOP
            </Button>
          )}

          <Button variant="ghost" size="icon" onClick={() => setFullscreen(!fullscreen)}>
            {fullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>
        </div>
      </CardHeader>
      <CardContent
        className={`p-0 bg-stone-100 overflow-hidden relative ${fullscreen ? "h-[calc(100vh-80px)]" : "h-[500px]"}`}
        onPointerMove={handlePointerMove}
      >
        <ChartSurface width={800} height={500} scale={100} viewBox="0 0 800 500">
          {/* 1. Landmarks */}
          {landmarks.map((lm) => (
            <g key={lm.id} onClick={() => handleLandmarkClick(lm)} className="cursor-pointer hover:opacity-80">
              <circle cx={lm.x} cy={lm.y} r="6" fill={COLORS.MAGENTA} stroke="white" strokeWidth="2" />
              <text
                x={lm.x}
                y={lm.y - 12}
                textAnchor="middle"
                fontSize="12"
                fontWeight="bold"
                fill="black"
                stroke="white"
                strokeWidth="0.5"
              >
                {lm.name}
              </text>
            </g>
          ))}

          {/* 2. User Lines (LOPs) */}
          {plots.map((line, i) => (
            <line
              key={i}
              x1={line.p1.x}
              y1={line.p1.y}
              x2={line.p2.x}
              y2={line.p2.y}
              stroke="black"
              strokeWidth="1"
              strokeOpacity="0.6"
            />
          ))}

          {/* 3. Tools */}
          {activeTool === "plotter" && (
            <PortlandPlotter
              position={plotterPos}
              rotation={plotterRotation}
              onDragStart={(e) => {
                e.stopPropagation();
                setIsDraggingPlotter(true);
              }}
              onRotateStart={(e) => {
                e.stopPropagation();
                setIsRotatingPlotter(true);
              }}
            />
          )}
        </ChartSurface>

        {/* Pedagogical Overlay */}
        <SkipperMentor feedback={mentorFeedback} />
      </CardContent>
    </Card>
  );
};

// Re-defining colors here if not imported to avoid 'undeclared' error in simple logic copy
const COLORS = {
  MAGENTA: "#d04297",
};

export default UnifiedChartTable;
