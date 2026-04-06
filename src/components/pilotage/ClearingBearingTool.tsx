import { useState, useRef, useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  XCircle,
  Map as MapIcon,
  Navigation,
} from "lucide-react";
import ChartSurface from "@/components/navigation/unified/ChartSurface";

// ── Types ────────────────────────────────────────────────────────────────

interface Point {
  readonly x: number;
  readonly y: number;
}

type Convention = "NLT" | "NMT";

interface ClearingBearingScenario {
  readonly id: number;
  readonly title: string;
  readonly description: string;
  readonly convention: Convention;
  readonly conventionLabel: string;
  /** Landmark the user should take the bearing FROM (observation point). */
  readonly landmark: { readonly name: string; readonly position: Point };
  /** The hazard to avoid. */
  readonly hazard: { readonly name: string; readonly position: Point; readonly radius: number };
  /** The vessel's intended track area. */
  readonly vesselArea: Point;
  /** Correct clearing bearing in degrees True. */
  readonly correctBearing: number;
  /** Acceptable tolerance in degrees. */
  readonly tolerance: number;
  readonly hint: string;
}

interface Feedback {
  readonly success: boolean;
  readonly text: string;
}

interface ClearingBearingToolProps {
  readonly onAllScenariosComplete?: () => void;
}

// ── Scenario Data ────────────────────────────────────────────────────────

const SCENARIOS: readonly ClearingBearingScenario[] = [
  {
    id: 1,
    title: "Avoiding the Rocky Shoal",
    description:
      "You are approaching a harbour from the south. A rocky shoal lies to the east of the safe channel. " +
      "Plot a clearing bearing from the Church Spire to keep clear of the rocks. " +
      "The bearing of the Church Spire must be Not Less Than (NLT) 045°T to remain in safe water.",
    convention: "NLT",
    conventionLabel: "Not Less Than (NLT)",
    landmark: { name: "Church Spire", position: { x: 200, y: 80 } },
    hazard: { name: "Rocky Shoal", position: { x: 350, y: 180 }, radius: 30 },
    vesselArea: { x: 200, y: 250 },
    correctBearing: 45,
    tolerance: 5,
    hint: "Draw a line from the Church Spire that just clears the east side of the hazard. The bearing must be ≥ 045°T.",
  },
  {
    id: 2,
    title: "Passing the Submerged Wreck",
    description:
      "You are sailing west along the coast. A submerged wreck lies south of your planned track. " +
      "Plot a clearing bearing from the Lighthouse to stay north of the wreck. " +
      "The bearing of the Lighthouse must be Not More Than (NMT) 320°T to remain safe.",
    convention: "NMT",
    conventionLabel: "Not More Than (NMT)",
    landmark: { name: "Lighthouse", position: { x: 380, y: 60 } },
    hazard: { name: "Submerged Wreck", position: { x: 280, y: 200 }, radius: 25 },
    vesselArea: { x: 150, y: 120 },
    correctBearing: 320,
    tolerance: 5,
    hint: "Draw a line from the Lighthouse that just clears the north side of the wreck. The bearing must be ≤ 320°T.",
  },
] as const;

const SCALE_PX_PER_NM = 100;
const CHART_WIDTH = 500;
const CHART_HEIGHT = 300;

// ── Component ────────────────────────────────────────────────────────────

export const ClearingBearingTool = ({
  onAllScenariosComplete,
}: ClearingBearingToolProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [bearingInput, setBearingInput] = useState("");
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [solvedScenarios, setSolvedScenarios] = useState<ReadonlySet<number>>(
    new Set(),
  );
  const svgRef = useRef<SVGSVGElement>(null);

  const scenario = SCENARIOS[currentIndex];
  const isLastScenario = currentIndex === SCENARIOS.length - 1;
  const allSolved =
    solvedScenarios.size === SCENARIOS.length ||
    (solvedScenarios.size === SCENARIOS.length - 1 &&
      feedback?.success === true);

  const checkBearing = useCallback(() => {
    const value = parseFloat(bearingInput);
    if (Number.isNaN(value) || value < 0 || value >= 360) {
      setFeedback({
        success: false,
        text: "Please enter a valid bearing between 0 and 359.",
      });
      return;
    }

    // Calculate bearing difference accounting for 360° wrap
    const rawDiff = Math.abs(value - scenario.correctBearing);
    const diff = Math.min(rawDiff, 360 - rawDiff);

    if (diff <= scenario.tolerance) {
      setFeedback({
        success: true,
        text: `Correct! The clearing bearing is ${scenario.correctBearing}°T (${scenario.convention}). Your answer of ${value}°T is within tolerance.`,
      });
      setSolvedScenarios((prev) => new Set([...prev, scenario.id]));
    } else {
      setFeedback({
        success: false,
        text: `Incorrect. Your bearing of ${value}°T does not match the expected clearing bearing. Remember the ${scenario.conventionLabel} convention. Try again.`,
      });
    }
  }, [bearingInput, scenario]);

  const handleNextScenario = useCallback(() => {
    if (isLastScenario) return;
    setCurrentIndex((prev) => prev + 1);
    setBearingInput("");
    setFeedback(null);
  }, [isLastScenario]);

  const handleFinish = useCallback(() => {
    onAllScenariosComplete?.();
  }, [onAllScenariosComplete]);

  /** Draw a bearing line from landmark at the given angle. */
  const bearingLineEnd = (
    origin: Point,
    bearingDeg: number,
    length: number,
  ): Point => {
    // True bearing: 0° = North (up), clockwise.
    // SVG: x-right, y-down. Convert bearing to SVG angle.
    const rad = ((bearingDeg - 90) * Math.PI) / 180;
    return {
      x: origin.x + Math.cos(rad) * length,
      y: origin.y + Math.sin(rad) * length,
    };
  };

  // Show the solution line only after a correct answer
  const showSolution = feedback?.success === true;
  const solutionEnd = bearingLineEnd(
    scenario.landmark.position,
    scenario.correctBearing,
    300,
  );

  return (
    <Card className="w-full border-2 border-primary/20 bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapIcon className="w-5 h-5 text-primary" />
          Clearing Bearing Exercise
        </CardTitle>
        <CardDescription>
          <span className="font-semibold">
            Scenario {scenario.id} of {SCENARIOS.length}:
          </span>{" "}
          {scenario.title}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Scenario description */}
        <div className="p-3 bg-secondary/20 rounded-lg border border-secondary text-sm">
          <p>{scenario.description}</p>
          <p className="mt-2 text-xs text-muted-foreground italic">
            Hint: {scenario.hint}
          </p>
        </div>

        {/* Convention badge */}
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className={
              scenario.convention === "NLT"
                ? "border-green-500 text-green-700"
                : "border-amber-500 text-amber-700"
            }
          >
            <Navigation className="w-3 h-3 mr-1" />
            {scenario.conventionLabel}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {scenario.convention === "NLT"
              ? "Bearing must be greater than or equal to the clearing bearing"
              : "Bearing must be less than or equal to the clearing bearing"}
          </span>
        </div>

        {/* Chart */}
        <div className="bg-blue-50/50 rounded-xl border overflow-hidden relative select-none">
          <ChartSurface
            ref={svgRef}
            width={CHART_WIDTH}
            height={CHART_HEIGHT}
            scale={SCALE_PX_PER_NM}
            viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
          >
            {/* Hazard zone (red circle) */}
            <circle
              cx={scenario.hazard.position.x}
              cy={scenario.hazard.position.y}
              r={scenario.hazard.radius}
              fill="rgba(239, 68, 68, 0.3)"
              stroke="#ef4444"
              strokeWidth={2}
              strokeDasharray="4,4"
            />
            <text
              x={scenario.hazard.position.x}
              y={scenario.hazard.position.y + scenario.hazard.radius + 14}
              textAnchor="middle"
              fontSize={10}
              fill="#ef4444"
              fontWeight="bold"
            >
              {scenario.hazard.name}
            </text>

            {/* Landmark (magenta diamond) */}
            <g
              transform={`translate(${scenario.landmark.position.x}, ${scenario.landmark.position.y})`}
            >
              <polygon
                points="0,-8 6,0 0,8 -6,0"
                fill="#d04297"
                stroke="white"
                strokeWidth={1}
              />
              <text
                y={-12}
                textAnchor="middle"
                fontSize={11}
                fill="#d04297"
                fontWeight="bold"
                stroke="white"
                strokeWidth={0.4}
                paintOrder="stroke"
              >
                {scenario.landmark.name}
              </text>
            </g>

            {/* Vessel area marker */}
            <g
              transform={`translate(${scenario.vesselArea.x}, ${scenario.vesselArea.y})`}
            >
              <circle r={5} fill="#3b82f6" stroke="white" strokeWidth={1} />
              <text
                y={16}
                textAnchor="middle"
                fontSize={9}
                fill="#3b82f6"
                fontWeight="bold"
              >
                Your Vessel
              </text>
            </g>

            {/* Solution line (shown after correct answer) */}
            {showSolution && (
              <line
                x1={scenario.landmark.position.x}
                y1={scenario.landmark.position.y}
                x2={solutionEnd.x}
                y2={solutionEnd.y}
                stroke="#16a34a"
                strokeWidth={2}
                strokeDasharray="6,3"
              />
            )}
          </ChartSurface>
        </div>

        {/* Bearing input */}
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <Label htmlFor="bearing-input">
              Your Clearing Bearing (°T)
            </Label>
            <Input
              id="bearing-input"
              type="number"
              min={0}
              max={359}
              step={1}
              placeholder="e.g. 045"
              value={bearingInput}
              onChange={(e) => setBearingInput(e.target.value)}
              disabled={feedback?.success === true}
            />
          </div>
          <Button
            onClick={checkBearing}
            disabled={!bearingInput || feedback?.success === true}
          >
            Check Answer
          </Button>
        </div>

        {/* Plot a clearing bearing to keep in safe water. */}
        <p className="text-xs text-muted-foreground">
          Plot the clearing bearing on the chart above and enter your answer.
        </p>

        {/* Feedback */}
        {feedback && (
          <div
            className={`p-3 rounded-lg flex items-start gap-2 ${
              feedback.success
                ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
            }`}
          >
            {feedback.success ? (
              <CheckCircle2 className="w-5 h-5 mt-0.5 shrink-0" />
            ) : (
              <XCircle className="w-5 h-5 mt-0.5 shrink-0" />
            )}
            <span className="text-sm">{feedback.text}</span>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex justify-end gap-2">
          {feedback?.success && !isLastScenario && (
            <Button onClick={handleNextScenario} variant="default">
              Next Scenario &rarr;
            </Button>
          )}
          {feedback?.success && isLastScenario && allSolved && (
            <Button onClick={handleFinish} variant="default">
              Complete Exercises
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
