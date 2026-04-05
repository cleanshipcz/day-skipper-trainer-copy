/**
 * Interactive transit alignment exercise.
 *
 * Renders an SVG harbour chart with front/rear transit markers.
 * The user drags a vessel element to align it with the transit line.
 * Visual feedback (colour change) shows when the vessel is on/off transit.
 *
 * @see docs/FEATURE_TASKS.md — Story E2-S2, AC-2, AC-3
 */
import { useState, useCallback, useRef, type PointerEvent as ReactPointerEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckCircle2, XCircle, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import {
  TRANSIT_SCENARIOS,
  isOnTransit,
  type MarkerPosition,
  type TransitScenario,
} from "./transitScenarios";

/** Result payload passed to onComplete when all exercises are finished. */
export interface TransitExerciseResult {
  readonly correctCount: number;
  readonly totalExercises: number;
}

interface TransitExerciseProps {
  /** Called once when the student finishes all scenarios. */
  readonly onComplete: (result: TransitExerciseResult) => void;
}

interface ExerciseState {
  readonly currentIndex: number;
  readonly vesselPos: MarkerPosition;
  readonly checked: boolean;
  readonly onTransit: boolean;
  readonly correctCount: number;
}

const initialState = (scenario: TransitScenario): ExerciseState => ({
  currentIndex: 0,
  vesselPos: { x: scenario.vesselStart.x, y: scenario.vesselStart.y },
  checked: false,
  onTransit: false,
  correctCount: 0,
});

/** Renders a triangle marker on the SVG chart. */
const TransitMarker = ({
  pos,
  label,
  testId,
}: {
  readonly pos: MarkerPosition;
  readonly label: string;
  readonly testId: string;
}) => (
  <g data-testid={testId}>
    <polygon
      points={`${pos.x},${pos.y - 14} ${pos.x - 10},${pos.y + 6} ${pos.x + 10},${pos.y + 6}`}
      fill="#dc2626"
      stroke="#991b1b"
      strokeWidth={1.5}
    />
    <text
      x={pos.x}
      y={pos.y + 22}
      textAnchor="middle"
      fontSize={11}
      fill="#1e293b"
      fontWeight="bold"
    >
      {label}
    </text>
  </g>
);

/** Renders the draggable vessel on the SVG chart. */
const Vessel = ({
  pos,
  onTransit,
  checked,
}: {
  readonly pos: MarkerPosition;
  readonly onTransit: boolean;
  readonly checked: boolean;
}) => {
  const fillColor = !checked ? "#3b82f6" : onTransit ? "#22c55e" : "#ef4444";

  return (
    <g data-testid="vessel" style={{ cursor: "grab" }}>
      {/* Vessel body */}
      <polygon
        points={`${pos.x},${pos.y - 16} ${pos.x - 12},${pos.y + 8} ${pos.x + 12},${pos.y + 8}`}
        fill={fillColor}
        stroke="#1e293b"
        strokeWidth={2}
      />
      {/* Centre dot */}
      <circle cx={pos.x} cy={pos.y} r={3} fill="white" />
    </g>
  );
};

/** Renders hazard areas and water on the harbour chart. */
const HarbourChart = ({
  scenario,
}: {
  readonly scenario: TransitScenario;
}) => (
  <>
    {/* Water background */}
    <rect width={scenario.chartWidth} height={scenario.chartHeight} fill="#bfdbfe" rx={4} />

    {/* Land / harbour walls */}
    <rect x={0} y={0} width={80} height={scenario.chartHeight} fill="#a3a3a3" opacity={0.6} />
    <rect
      x={scenario.chartWidth - 80}
      y={0}
      width={80}
      height={scenario.chartHeight}
      fill="#a3a3a3"
      opacity={0.6}
    />

    {/* Rocks / hazards - increasing with difficulty */}
    {scenario.difficultyLevel >= 2 && (
      <>
        <circle cx={140} cy={280} r={12} fill="#78716c" opacity={0.7} />
        <circle cx={460} cy={260} r={10} fill="#78716c" opacity={0.7} />
        <text x={140} y={284} textAnchor="middle" fontSize={9} fill="white">
          Rk
        </text>
        <text x={460} y={264} textAnchor="middle" fontSize={9} fill="white">
          Rk
        </text>
      </>
    )}
    {scenario.difficultyLevel >= 3 && (
      <>
        <circle cx={200} cy={340} r={10} fill="#78716c" opacity={0.7} />
        <circle cx={400} cy={200} r={14} fill="#78716c" opacity={0.7} />
        <text x={200} y={344} textAnchor="middle" fontSize={9} fill="white">
          Rk
        </text>
        <text x={400} y={204} textAnchor="middle" fontSize={9} fill="white">
          Rk
        </text>
      </>
    )}

    {/* Depth soundings */}
    <text x={200} y={200} fontSize={10} fill="#1e40af" opacity={0.5}>
      3.2m
    </text>
    <text x={350} y={300} fontSize={10} fill="#1e40af" opacity={0.5}>
      4.1m
    </text>
    <text x={250} y={420} fontSize={10} fill="#1e40af" opacity={0.5}>
      5.8m
    </text>
  </>
);

export const TransitExercise = ({ onComplete }: TransitExerciseProps) => {
  const firstScenario = TRANSIT_SCENARIOS[0];
  const [state, setState] = useState<ExerciseState>(initialState(firstScenario));

  const svgRef = useRef<SVGSVGElement>(null);
  const isDragging = useRef(false);

  const scenario = TRANSIT_SCENARIOS[state.currentIndex];

  const getPointerPosition = useCallback(
    (e: ReactPointerEvent<SVGSVGElement>): MarkerPosition | null => {
      const svg = svgRef.current;
      if (!svg) return null;
      const rect = svg.getBoundingClientRect();
      return {
        x: Math.max(0, Math.min(scenario.chartWidth, e.clientX - rect.left)),
        y: Math.max(0, Math.min(scenario.chartHeight, e.clientY - rect.top)),
      };
    },
    [scenario.chartWidth, scenario.chartHeight],
  );

  const handlePointerDown = useCallback(
    (e: ReactPointerEvent<SVGSVGElement>) => {
      if (state.checked) return;
      const pos = getPointerPosition(e);
      if (!pos) return;

      // Only start drag if near the vessel
      const dx = pos.x - state.vesselPos.x;
      const dy = pos.y - state.vesselPos.y;
      if (Math.sqrt(dx * dx + dy * dy) < 30) {
        isDragging.current = true;
        (e.target as Element).setPointerCapture?.(e.pointerId);
      }
    },
    [state.checked, state.vesselPos, getPointerPosition],
  );

  const handlePointerMove = useCallback(
    (e: ReactPointerEvent<SVGSVGElement>) => {
      if (!isDragging.current || state.checked) return;
      const pos = getPointerPosition(e);
      if (!pos) return;
      setState((prev) => ({ ...prev, vesselPos: pos }));
    },
    [state.checked, getPointerPosition],
  );

  const handlePointerUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  const handleCheckAlignment = useCallback(() => {
    const onLine = isOnTransit(state.vesselPos, scenario);
    setState((prev) => ({
      ...prev,
      checked: true,
      onTransit: onLine,
      correctCount: onLine ? prev.correctCount + 1 : prev.correctCount,
    }));

    if (onLine) {
      toast.success("On transit! Your vessel is aligned with the leading marks.");
    } else {
      toast.error("Off transit — your vessel is not on the leading line. Try again next time!");
    }
  }, [state.vesselPos, scenario]);

  const handleNext = useCallback(() => {
    const nextIndex = state.currentIndex + 1;
    if (nextIndex >= TRANSIT_SCENARIOS.length) {
      onComplete({
        correctCount: state.correctCount,
        totalExercises: TRANSIT_SCENARIOS.length,
      });
      return;
    }

    const nextScenario = TRANSIT_SCENARIOS[nextIndex];
    setState({
      currentIndex: nextIndex,
      vesselPos: { x: nextScenario.vesselStart.x, y: nextScenario.vesselStart.y },
      checked: false,
      onTransit: false,
      correctCount: state.correctCount,
    });
  }, [state.currentIndex, state.correctCount, onComplete]);

  const isLast = state.currentIndex === TRANSIT_SCENARIOS.length - 1;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{scenario.title}</CardTitle>
            <CardDescription>{scenario.description}</CardDescription>
          </div>
          <div className="text-right text-sm text-muted-foreground">
            <div>
              Exercise {state.currentIndex + 1} of {TRANSIT_SCENARIOS.length}
            </div>
            <div className="font-medium">{scenario.difficulty}</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Harbour chart SVG */}
        <div className="border rounded-lg overflow-hidden bg-muted">
          <svg
            ref={svgRef}
            viewBox={`0 0 ${scenario.chartWidth} ${scenario.chartHeight}`}
            className="w-full h-auto touch-none"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          >
            <HarbourChart scenario={scenario} />

            {/* Transit line (shown after check for feedback) */}
            {state.checked && (
              <line
                x1={scenario.frontMarker.x}
                y1={scenario.frontMarker.y}
                x2={scenario.rearMarker.x}
                y2={scenario.rearMarker.y}
                stroke={state.onTransit ? "#22c55e" : "#ef4444"}
                strokeWidth={2}
                strokeDasharray="8 4"
                opacity={0.7}
              />
            )}

            {/* Transit markers */}
            <TransitMarker pos={scenario.frontMarker} label="Front" testId="front-marker" />
            <TransitMarker pos={scenario.rearMarker} label="Rear" testId="rear-marker" />

            {/* Draggable vessel */}
            <Vessel pos={state.vesselPos} onTransit={state.onTransit} checked={state.checked} />
          </svg>
        </div>

        {/* Feedback after checking */}
        {state.checked && (
          <div
            className={`flex items-center gap-2 p-3 rounded-lg ${
              state.onTransit
                ? "bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-200"
                : "bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-200"
            }`}
          >
            {state.onTransit ? (
              <>
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-medium">On Transit — Well done!</span>
              </>
            ) : (
              <>
                <XCircle className="w-5 h-5" />
                <span className="font-medium">Off Transit — The vessel is not on the leading line.</span>
              </>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex justify-end gap-3">
          {!state.checked ? (
            <Button onClick={handleCheckAlignment}>Check Alignment</Button>
          ) : (
            <Button onClick={handleNext}>
              {isLast ? "Finish Exercise" : "Next Exercise"}
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
