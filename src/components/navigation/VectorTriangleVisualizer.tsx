import { Card } from "@/components/ui/card";
import { useState } from "react";

interface VectorTriangleVisualizerProps {
  waterTrackHeading: number; // CTS (Input in Drill Mode, Result in Solver Mode)
  waterTrackSpeed: number; // Boat Speed
  groundTrackHeading: number; // COG (Desired in Solver Mode, Result in Drill Mode)
  tideSet: number; // Direction
  tideRate: number; // Speed
  mode?: "solver" | "drill"; // Default solver
  drillTarget?: number; // The target bearing to hit in drill mode
}

export const VectorTriangleVisualizer = ({
  waterTrackHeading,
  waterTrackSpeed,
  groundTrackHeading,
  tideSet,
  tideRate,
  mode = "solver",
  drillTarget,
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

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const AX_val = AX; // Changed from let to const, keeping original value
  const AY_val = AY; // Changed from let to const, keeping original value
  let BX = 0,
    BY = 0;
  let CX = 0,
    CY = 0;
  let validSolution = false;
  let calculatedResults = { heading: 0, speed: 0, groundHeading: 0 };

  // Common Tide Vector
  const tideVecX = tideRate * SCALE * Math.cos(toRad(tideSet));
  const tideVecY = tideRate * SCALE * Math.sin(toRad(tideSet));

  if (mode === "drill") {
    // DRILL MODE: Forward Calculation
    // A -> B (Water Track: User Input Heading & Speed)
    // B -> C (Tide: Set & Rate)
    // A -> C (Resulting Ground Track)

    validSolution = true;

    // B = A + WaterVector
    const waterVecX = waterTrackSpeed * SCALE * Math.cos(toRad(waterTrackHeading));
    const waterVecY = waterTrackSpeed * SCALE * Math.sin(toRad(waterTrackHeading));

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
    const gAngle = ((Math.atan2(gy, gx) * 180) / Math.PI + 90 + 360) % 360;

    calculatedResults = {
      heading: waterTrackHeading, // Input CTS
      speed: gSpeed, // Resulting SOG
      groundHeading: gAngle, // Resulting COG
    };
  } else {
    // SOLVER MODE: Inverse Calculation (Find CTS)
    // Existing Logic
    const gDirX = Math.cos(toRad(groundTrackHeading));
    const gDirY = Math.sin(toRad(groundTrackHeading));
    const dotTD = gDirX * tideVecX + gDirY * tideVecY;
    const lenT2 = tideVecX * tideVecX + tideVecY * tideVecY;
    const R = waterTrackSpeed * SCALE;
    const QA = 1;
    const QB = -2 * dotTD;
    const QC = lenT2 - R * R;
    const discriminant = QB * QB - 4 * QA * QC;

    if (discriminant >= 0) {
      const t1 = (-QB + Math.sqrt(discriminant)) / (2 * QA);
      const t2 = (-QB - Math.sqrt(discriminant)) / (2 * QA);
      const t = Math.max(t1, t2);

      if (t > 0) {
        validSolution = true;
        CX = AX + t * gDirX;
        CY = AY + t * gDirY;
        BX = CX - tideVecX;
        BY = CY - tideVecY;

        // Calculate Heading A->B
        const dx = BX - AX;
        const dy = BY - AY;
        const hAngle = ((Math.atan2(dy, dx) * 180) / Math.PI + 90 + 360) % 360;

        calculatedResults = {
          heading: hAngle, // Resulting CTS
          speed: t / SCALE, // Resulting SOG
          groundHeading: groundTrackHeading, // Input COG
        };
      }
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
      <div className="relative w-full h-[500px] bg-slate-50">
        <div className="absolute top-4 left-4 z-10 bg-white/90 p-3 rounded-lg border shadow-sm text-sm space-y-1">
          <h4 className="font-bold border-b pb-1 mb-1">Results</h4>
          {validSolution ? (
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

        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className={`mx-auto ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
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
