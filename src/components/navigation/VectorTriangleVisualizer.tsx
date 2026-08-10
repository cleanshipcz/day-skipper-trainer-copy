import { Card } from "@/components/ui/card";
import { useState } from "react";
import { resultingTrack, solveCourseToSteer } from "@/features/navigation/vectorSolver";

interface VectorTriangleVisualizerProps {
  waterTrackHeading: number; // CTS (Input in Drill Mode, Result in Solver Mode)
  waterTrackSpeed: number; // Boat Speed
  groundTrackHeading: number; // COG (Desired in Solver Mode, Result in Drill Mode)
  tideSet: number; // Direction
  tideRate: number; // Speed
  mode?: "solver" | "drill"; // Default solver
  drillTarget?: number; // The target bearing to hit in drill mode
  showDrillResult?: boolean;
}

export const VectorTriangleVisualizer = ({
  waterTrackHeading,
  waterTrackSpeed,
  groundTrackHeading,
  tideSet,
  tideRate,
  mode = "solver",
  drillTarget,
  showDrillResult = true,
}: VectorTriangleVisualizerProps) => {
  const WIDTH = 600;
  const HEIGHT = 500;
  const AX = 300;
  const AY = 400;
  const SCALE = 30;

  const toRad = (deg: number) => (deg - 90) * (Math.PI / 180);

  // Pan State
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const clampPan = (value: number) => Math.max(-120, Math.min(120, value));

  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!isDragging) return;
    setPan({ x: clampPan(e.clientX - dragStart.x), y: clampPan(e.clientY - dragStart.y) });
  };

  const handlePointerUp = (e: React.PointerEvent<SVGSVGElement>) => {
    setIsDragging(false);
    if (e.currentTarget.hasPointerCapture?.(e.pointerId)) e.currentTarget.releasePointerCapture?.(e.pointerId);
  };

  const AX_val = AX; // Changed from let to const, keeping original value
  const AY_val = AY; // Changed from let to const, keeping original value
  let BX = 0,
    BY = 0;
  let CX = 0,
    CY = 0;
  let validSolution = false;
  let calculatedResults = { heading: 0, speed: 0, groundHeading: 0 };

  // Diagram coordinates use east as +x and north as -y.
  const tideVecX = tideRate * SCALE * Math.cos(toRad(tideSet));
  const tideVecY = tideRate * SCALE * Math.sin(toRad(tideSet));

  if (mode === "drill") {
    // DRILL MODE: Forward Calculation
    // A -> B (Water Track: User Input Heading & Speed)
    // B -> C (Tide: Set & Rate)
    // A -> C (Resulting Ground Track)

    validSolution = showDrillResult;

    const result = resultingTrack(waterTrackHeading, waterTrackSpeed, tideSet, tideRate);
    const waterVecX = result.water.eastKn * SCALE;
    const waterVecY = -result.water.northKn * SCALE;

    BX = AX + waterVecX;
    BY = AY + waterVecY;

    // C = B + TideVector
    CX = BX + tideVecX;
    CY = BY + tideVecY;

    // Calculate Resulting Ground Track details
    const gx = CX - AX;
    const gy = CY - AY;
    const gDist = Math.sqrt(gx * gx + gy * gy);
    const gSpeed = gDist / SCALE;
    calculatedResults = {
      heading: waterTrackHeading, // Input CTS
      speed: gSpeed, // Resulting SOG
      groundHeading: result.trackDeg ?? 0, // Resulting COG
    };
  } else {
    const solution = solveCourseToSteer({ desiredTrackDeg: groundTrackHeading, boatSpeedKn: waterTrackSpeed, tideSetDeg: tideSet, tideRateKn: tideRate });
    if (solution.feasible) {
        validSolution = true;
        CX = AX + solution.overGround.eastKn * SCALE;
        CY = AY - solution.overGround.northKn * SCALE;
        BX = CX - tideVecX;
        BY = CY - tideVecY;
        calculatedResults = {
          heading: solution.courseToSteerDeg,
          speed: solution.speedOverGroundKn,
          groundHeading: groundTrackHeading, // Input COG
        };
    }
  }

  // Deconstruct results for render (renaming to match render vars)
  const calculatedHeading = calculatedResults.heading;
  const SOG = calculatedResults.speed;
  const R = waterTrackSpeed * SCALE; // Define R for potential usage in render hints

  // Helper for Arrows
  const ArrowHead = ({
    x,
    y,
    angle,
    count,
    color,
  }: {
    x: number;
    y: number;
    angle: number;
    count: number;
    color: string;
  }) => {
    return (
      <g transform={`translate(${x},${y}) rotate(${angle})`}>
        {count === 1 && <path d="M-6,-4 L6,0 L-6,4" fill={color} />}
        {count === 2 && (
          <>
            <path d="M-3,-4 L9,0 L-3,4" fill={color} />
            <path d="M-9,-4 L3,0 L-9,4" fill={color} />
          </>
        )}
        {count === 3 && (
          <>
            <path d="M0,-4 L12,0 L0,4" fill={color} />
            <path d="M-6,-4 L6,0 L-6,4" fill={color} />
            <path d="M-12,-4 L0,0 L-12,4" fill={color} />
          </>
        )}
      </g>
    );
  };

  return (
    <Card className="w-full bg-white border-2 border-slate-200 overflow-hidden">
      <div className="relative h-[min(500px,70vh)] min-h-[320px] w-full bg-slate-50 sm:h-[500px]">
        <div className="absolute top-4 left-4 z-10 bg-white/90 p-3 rounded-lg border shadow-sm text-sm space-y-1">
          <h4 className="font-bold border-b pb-1 mb-1">Results</h4>
          {mode === "drill" && !showDrillResult ? <p>Result hidden until you check your answer.</p> : validSolution ? (
            <>
              <div className="flex justify-between gap-4">
                <span className="text-blue-600 font-medium">CTS (Heading):</span>
                <span className="font-bold">{Math.round(calculatedHeading)}°T</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-green-600 font-medium">SOG:</span>
                <span className="font-bold">{SOG.toFixed(1)} kn</span>
              </div>
            </>
          ) : (
            <div className="text-red-500 font-bold">Impossible scenario!</div>
          )}
        </div>
        <button type="button" className="absolute right-3 top-3 z-10 min-h-11 rounded border bg-white px-3 text-sm font-medium shadow-sm forced-colors:border-[CanvasText]" onClick={() => setPan({ x: 0, y: 0 })}>Reset diagram position</button>
        <p className="sr-only" role="status" aria-live="polite">Diagram offset: {pan.x} horizontal, {pan.y} vertical.</p>

        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className={`mx-auto touch-pan-y forced-colors:[filter:contrast(1.5)] ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
          role="img"
          aria-label={mode === "drill" ? `Vector drill diagram. Target track ${drillTarget} degrees true. ${showDrillResult ? `Entered course ${waterTrackHeading} degrees true; result is shown.` : "The entered course result is hidden until checked."} Use arrow keys to pan.` : `Course to steer vector triangle for desired track ${groundTrackHeading} degrees true, boat speed ${waterTrackSpeed} knots, tide set ${tideSet} degrees true at ${tideRate} knots. Use arrow keys to pan.`}
          tabIndex={0}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onKeyDown={(event) => {
            const movement = 10;
            if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) return;
            event.preventDefault();
            setPan((current) => ({
              x: clampPan(current.x + (event.key === "ArrowLeft" ? movement : event.key === "ArrowRight" ? -movement : 0)),
              y: clampPan(current.y + (event.key === "ArrowUp" ? movement : event.key === "ArrowDown" ? -movement : 0)),
            }));
          }}
        >
          <g transform={`translate(${pan.x}, ${pan.y})`}>
            {/* Start Point A */}
            <circle cx={AX} cy={AY} r={3} fill="black" />
            <text x={AX - 25} y={AY} fontSize="14" fill="black" fontWeight="bold">
              Start (A)
            </text>

            {validSolution && (
              <>
                {/* A -> B (Water Track / CTS) */}
                <line x1={AX} y1={AY} x2={BX} y2={BY} stroke="#2563eb" strokeWidth="3" />
                <ArrowHead
                  x={(AX + BX) / 2}
                  y={(AY + BY) / 2}
                  angle={(Math.atan2(BY - AY, BX - AX) * 180) / Math.PI}
                  count={1}
                  color="#2563eb"
                />
                <text x={(AX + BX) / 2 - 10} y={(AY + BY) / 2 - 20} fill="#2563eb" fontSize="12" fontWeight="bold">
                  Water Track
                </text>

                {/* B -> C (Tide) */}
                <line x1={BX} y1={BY} x2={CX} y2={CY} stroke="#dc2626" strokeWidth="2" strokeDasharray="5,5" />
                <ArrowHead
                  x={(BX + CX) / 2}
                  y={(BY + CY) / 2}
                  angle={(Math.atan2(CY - BY, CX - BX) * 180) / Math.PI}
                  count={3}
                  color="#dc2626"
                />
                <text x={(BX + CX) / 2 + 10} y={(BY + CY) / 2 + 10} fill="#dc2626" fontSize="12">
                  Tide
                </text>

                {/* A -> C (Ground Track) */}
                <line x1={AX} y1={AY} x2={CX} y2={CY} stroke="#16a34a" strokeWidth="3" strokeOpacity="0.7" />
                <ArrowHead
                  x={(AX + CX) / 2}
                  y={(AY + CY) / 2}
                  angle={(Math.atan2(CY - AY, CX - AX) * 180) / Math.PI}
                  count={2}
                  color="#16a34a"
                />
                <text x={(AX + CX) / 2 + 10} y={(AY + CY) / 2 + 20} fill="#16a34a" fontSize="12" fontWeight="bold">
                  Ground Track
                </text>

                {/* Hint Arc */}
                <circle cx={AX} cy={AY} r={R} fill="none" stroke="#2563eb" strokeOpacity="0.1" strokeDasharray="4,4" />
              </>
            )}

            {/* DRILL MODE: Show Target Ground Track Line */}
            {mode === "drill" && drillTarget !== undefined && (
              <>
                <line
                  x1={AX}
                  y1={AY}
                  x2={AX + 300 * Math.cos(toRad(drillTarget))}
                  y2={AY + 300 * Math.sin(toRad(drillTarget))}
                  stroke="#fbbf24"
                  strokeWidth="4"
                  strokeOpacity="0.5"
                  strokeDasharray="10,5"
                />
                <text
                  x={AX + 150 * Math.cos(toRad(drillTarget))}
                  y={AY + 150 * Math.sin(toRad(drillTarget))}
                  fill="#b45309"
                  fontWeight="bold"
                  fontSize="12"
                >
                  Target {drillTarget}°
                </text>
              </>
            )}
          </g>
        </svg>
      </div>
    </Card>
  );
};
