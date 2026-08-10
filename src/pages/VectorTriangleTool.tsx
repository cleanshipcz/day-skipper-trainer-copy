import { Button } from "@/components/ui/button";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { VectorTriangleVisualizer } from "@/components/navigation/VectorTriangleVisualizer";
import { TOPIC_IDS } from "@/constants/topicRegistry";
import { TheoryCompletionButton } from "@/features/progress/TheoryCompletionButton";
import { scoreCourse, solveCourseToSteer } from "@/features/navigation/vectorSolver";

interface PreciseNumberInputProps { id: string; label: string; value: number; onValidValue: (value: number) => void; onDraftValidity?: (valid: boolean) => void; min: number; max: number; step: number; unit: string }

export const PreciseNumberInput = ({ id, label, value, onValidValue, onDraftValidity, min, max, step, unit }: PreciseNumberInputProps) => {
  const [draft, setDraft] = useState(String(value));
  const lastEmitted = useRef<number | null>(null);
  useEffect(() => {
    if (lastEmitted.current === value) return;
    setDraft(String(value));
  }, [value]);
  const parsed = draft.trim() === "" ? null : Number(draft);
  const error = parsed === null || !Number.isFinite(parsed)
    ? "Enter a finite number."
    : parsed < min || parsed > max
      ? `Enter a value from ${min} to ${max}${unit}.`
      : null;
  const helpId = `${id}-help`;
  const errorId = `${id}-error`;
  return <div className="space-y-1">
    <Label htmlFor={id}>{label}</Label>
    <div className="flex items-center gap-2"><Input id={id} type="number" inputMode="decimal" min={min} max={max} step={step} value={draft} aria-invalid={Boolean(error)} aria-describedby={`${helpId}${error ? ` ${errorId}` : ""}`} onChange={(event) => {
      const next = event.currentTarget.value;
      setDraft(next);
      const candidate = next.trim() === "" ? null : Number(next);
      const valid = candidate !== null && Number.isFinite(candidate) && candidate >= min && candidate <= max;
      onDraftValidity?.(valid);
      if (valid) {
        lastEmitted.current = candidate;
        onValidValue(candidate);
      }
    }} /><span>{unit}</span></div>
    <p id={helpId} className="text-xs text-muted-foreground">Allowed range: {min} to {max}{unit}.</p>
    {error && <p id={errorId} role="alert" className="text-xs font-medium text-red-700">{error}</p>}
  </div>;
};

const VectorTriangleTool = () => {
  const navigate = useNavigate();

  // State for Vector Triangle Inputs
  const [groundTrackHeading, setGroundTrack] = useState(90); // Desired Course (Solver Mode) / Result (Drill Mode)
  const [boatSpeed, setBoatSpeed] = useState(5.0);
  const [tideSet, setTideSet] = useState(180);
  const [tideRate, setTideRate] = useState(2.0);

  // Drill Mode State
  const [drillMode, setDrillMode] = useState(false);
  const [userHeading, setUserHeading] = useState(90); // User controls this in Drill Mode
  const [targetHeading, setTargetHeading] = useState(90); // The random goal
  const [drillFeedback, setDrillFeedback] = useState<"correct" | "incorrect" | null>(null);
  const [invalidDrafts, setInvalidDrafts] = useState<Record<string, boolean>>({});
  const draftValidity = (id: string) => (valid: boolean) => setInvalidDrafts((current) => ({ ...current, [id]: !valid }));
  const hasInvalidDraft = Object.values(invalidDrafts).some(Boolean);

  const startDrill = () => {
    // Randomize Scenario
    const rTarget = Math.floor(Math.random() * 360);
    const rSet = Math.floor(Math.random() * 360);
    const rRate = 1 + Math.floor(Math.random() * 30) / 10; // 1.0 - 4.0
    const rSpeed = 4 + Math.floor(Math.random() * 40) / 10; // 4.0 - 8.0

    setTargetHeading(rTarget);
    setTideSet(rSet);
    setTideRate(rRate);
    setBoatSpeed(rSpeed);

    // Reset User Heading to something random FAR from the likely solution
    // Likely solution is vaguely near rTarget.
    const randomOffset = 90 + Math.floor(Math.random() * 180);
    setUserHeading((rTarget + randomOffset) % 360);

    setDrillFeedback(null);
    setDrillMode(true);
  };

  const exitDrill = () => {
    setDrillMode(false);
    setGroundTrack(90); // Reset to default solver state
    setDrillFeedback(null);
  };

  const checkAnswer = () => setDrillFeedback(scoreCourse(userHeading, { desiredTrackDeg: targetHeading, boatSpeedKn: boatSpeed, tideSetDeg: tideSet, tideRateKn: tideRate }).correct ? "correct" : "incorrect");

  const solution = solveCourseToSteer({ desiredTrackDeg: groundTrackHeading, boatSpeedKn: boatSpeed, tideSetDeg: tideSet, tideRateKn: tideRate });

  // Check for success in drill mode
  // We need the ACTUAL Ground Track resulting from userHeading + Tide.
  // The Visualizer calculates this... but we don't have access to it here easily without moving logic up.
  // We can duplicate the quick calculation or move logic.
  // Let's rely on visual matching for now, or do a quick check:
  // We can add a "Check Answer" button or just let them visually align it (which is powerful enough).
  // "Align the Green Line (Ground Track) with the Yellow Target Line".

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate("/navigation/tides")}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold">Vector Solution Tool</h1>
                <p className="text-sm text-muted-foreground">Calculate Course to Steer</p>
              </div>
            </div>
            <TheoryCompletionButton topicId={TOPIC_IDS.TIDES_VECTOR_TOOL} catalogueRevision="tides-vector-tool-v1" evidenceId="successful-heading-drill" evidenceSatisfied={drillFeedback === "correct"} lockedLabel="Solve the heading drill" />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex justify-end mb-4">
          {drillMode ? (
            <Button variant="destructive" onClick={exitDrill}>
              Exit Drill Mode
            </Button>
          ) : (
            <Button className="bg-blue-600" onClick={startDrill}>
              Start "Find the Heading" Drill
            </Button>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Controls */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-xl border shadow-sm space-y-6">
              <h3 className="font-semibold text-lg border-b pb-2">{drillMode ? "Drill Controls" : "Inputs"}</h3>

              <div className="space-y-4">
                {drillMode ? (
                  /* DRILL MODE CONTROLS */
                  <div className="space-y-6">
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded text-yellow-800 text-sm">
                      <strong>Goal:</strong> Adjust your Boat Heading until your <strong>Green Ground Track</strong>{" "}
                      matches the <strong>Yellow Target ({targetHeading}°)</strong>.
                    </div>

                    <div className="space-y-2">
                      <Label className="text-blue-600 font-bold">Your Heading (Water Track)</Label>
                      <div className="flex items-center gap-4">
                        <Slider
                          value={[userHeading]}
                          max={359}
                          step={1}
                          onValueChange={(v) => setUserHeading(v[0])}
                          className="flex-1"
                        />
                        <span className="w-12 text-right font-mono font-bold text-blue-600">{userHeading}°</span>
                      </div>
                    </div>
                    <div className="text-sm text-slate-500">
                      Boat Speed: {boatSpeed}kn <br />
                      Tide: {tideSet}° @ {tideRate}kn
                    </div>

                    {drillFeedback === "correct" ? (
                      <div className="bg-green-100 text-green-800 p-3 rounded font-bold text-center border border-green-200">
                        ✅ Correct! Good job.
                        <Button className="w-full mt-2 bg-green-700 hover:bg-green-800" onClick={startDrill}>
                          Next Scenario
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Button
                          className={`w-full ${
                            drillFeedback === "incorrect" ? "bg-red-600 hover:bg-red-700" : "bg-blue-600"
                          }`}
                          onClick={checkAnswer}
                        >
                          {drillFeedback === "incorrect" ? "❌ Try Again (Check Heading)" : "Check Answer"}
                        </Button>
                        {drillFeedback === "incorrect" && (
                          <p className="text-xs text-red-600 text-center font-medium">
                            Your Ground Track (Green) does not match the Target (Yellow).
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  /* SOLVER MODE CONTROLS */
                  <>
                    <div className="rounded border bg-slate-50 p-3 text-sm"><p className="font-semibold">Precise keyboard inputs</p><p>Enter true bearings and speeds; sliders below provide coarse adjustment.</p></div>
                    <PreciseNumberInput id="desired-track" label="Desired track over ground (true)" value={groundTrackHeading} onValidValue={setGroundTrack} onDraftValidity={draftValidity("desired-track")} min={0} max={359.9} step={0.1} unit="°T" />
                    <PreciseNumberInput id="boat-speed" label="Boat speed through water" value={boatSpeed} onValidValue={setBoatSpeed} onDraftValidity={draftValidity("boat-speed")} min={0.1} max={100} step={0.1} unit="kn" />
                    <div className="space-y-2">
                      <Label>Desired Course (Ground Track)</Label>
                      <div className="flex items-center gap-4">
                        <Slider
                          value={[groundTrackHeading]}
                          max={359}
                          step={1}
                          onValueChange={(v) => setGroundTrack(v[0])}
                          className="flex-1"
                        />
                        <span className="w-12 text-right font-mono font-bold">{groundTrackHeading}°</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Boat Speed (Knots)</Label>
                      <div className="flex items-center gap-4">
                        <Slider
                          value={[boatSpeed]}
                          max={10}
                          min={1}
                          step={0.1}
                          onValueChange={(v) => setBoatSpeed(v[0])}
                          className="flex-1"
                        />
                        <span className="w-12 text-right font-mono font-bold">{boatSpeed}kn</span>
                      </div>
                    </div>
                  </>
                )}

                {/* Tide Controls (Always visible but read-only in Drill?) No, usually standard controls. 
                    In Drill Mode, let's hide or disable Tide Controls to keep focus on Heading? 
                    Actually, keeping them visible helps user see what they are fighting.
                    Let's disable them in Drill Mode.
                */}
                <div className={`pt-4 border-t space-y-4 ${drillMode ? "opacity-50 pointer-events-none" : ""}`}>
                  {!drillMode && <PreciseNumberInput id="tide-set" label="Tidal set (toward, true)" value={tideSet} onValidValue={setTideSet} onDraftValidity={draftValidity("tide-set")} min={0} max={359.9} step={0.1} unit="°T" />}
                  {!drillMode && <PreciseNumberInput id="tide-rate" label="Tidal rate" value={tideRate} onValidValue={setTideRate} onDraftValidity={draftValidity("tide-rate")} min={0} max={20} step={0.1} unit="kn" />}
                  <div className="space-y-2">
                    <Label className="text-red-700">Tide Set (Direction)</Label>
                    <div className="flex items-center gap-4">
                      <Slider
                        value={[tideSet]}
                        max={359}
                        step={1}
                        onValueChange={(v) => setTideSet(v[0])}
                        className="flex-1"
                      />
                      <span className="w-12 text-right font-mono font-bold text-red-700">{tideSet}°</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-red-700">Tide Rate (Speed)</Label>
                    <div className="flex items-center gap-4">
                      <Slider
                        value={[tideRate]}
                        max={6}
                        min={0}
                        step={0.1}
                        onValueChange={(v) => setTideRate(v[0])}
                        className="flex-1"
                      />
                      <span className="w-12 text-right font-mono font-bold text-red-700">{tideRate}kn</span>
                    </div>
                  </div>
                </div>
              </div>

              {!drillMode && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setGroundTrack(90);
                    setBoatSpeed(5);
                    setTideSet(180);
                    setTideRate(2);
                  }}
                  className="w-full"
                >
                  <RotateCcw className="w-4 h-4 mr-2" /> Reset Default
                </Button>
              )}
            </div>

            <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-900 leading-relaxed">
              {drillMode ? (
                <p>
                  In this drill, you are the navigator. You know where you want to go (Yellow Line) and what the tide is
                  doing (Red Arrows). Use the Heading Slider to point the boat (Blue Line) so that your actual green
                  track lines up with the destination.
                </p>
              ) : (
                <div className="space-y-2">
                  <p>
                    <strong>Standard Calculation:</strong>
                  </p>
                  <p>
                    You define where you want to go (Ground Track) and the tide. The tool calculates where you must
                    point the boat (Water Track/Heading) to get there.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Visualizer */}
          <div className="lg:col-span-2">
            {hasInvalidDraft && !drillMode ? <div role="alert" className="rounded-xl border border-red-300 bg-red-50 p-5 font-semibold text-red-800">Correct the highlighted numeric input. The diagram and computed result are withheld until every input is valid.</div> : <VectorTriangleVisualizer
              waterTrackHeading={userHeading} // Input for Drill
              waterTrackSpeed={boatSpeed}
              groundTrackHeading={groundTrackHeading} // Input for Solver
              tideSet={tideSet}
              tideRate={tideRate}
              mode={drillMode ? "drill" : "solver"}
              drillTarget={targetHeading}
            />}
            {!drillMode && !hasInvalidDraft && <section aria-labelledby="solution-breakdown" className="mt-4 space-y-3 rounded-xl border bg-card p-5 text-sm">
              <h2 id="solution-breakdown" className="text-lg font-bold">Reproducible vector breakdown</h2>
              <p><strong>Convention:</strong> true bearings clockwise from north; east/north are the common component basis; tidal set is the direction <em>toward</em> which the water flows. Course/CTS is the intended through-water direction used by this no-leeway model; heading is where the bow points and may differ with leeway; track is motion over ground.</p>
              {solution.feasible ? <>
                <dl className="grid gap-2 sm:grid-cols-2">
                  <div><dt className="font-semibold">Tide (east, north)</dt><dd>{solution.tide.eastKn.toFixed(4)}, {solution.tide.northKn.toFixed(4)} kn</dd></div>
                  <div><dt className="font-semibold">Cross / along-track tide</dt><dd>{solution.crossTrackTideKn.toFixed(4)}, {solution.alongTrackTideKn.toFixed(4)} kn</dd></div>
                  <div><dt className="font-semibold">Through water (east, north)</dt><dd>{solution.throughWater.eastKn.toFixed(4)}, {solution.throughWater.northKn.toFixed(4)} kn</dd></div>
                  <div><dt className="font-semibold">Over ground (east, north)</dt><dd>{solution.overGround.eastKn.toFixed(4)}, {solution.overGround.northKn.toFixed(4)} kn</dd></div>
                </dl>
                <p><strong>Unrounded result:</strong> CTS {solution.courseToSteerDeg.toFixed(6)}°T; SOG {solution.speedOverGroundKn.toFixed(6)} kn. <strong>Display policy:</strong> round only the final steering answer to the nearest degree and SOG to 0.1 kn; calculations retain full precision.</p>
              </> : <p role="alert" className="font-semibold text-red-700">{solution.reason} Change the route, departure time, assumed speed, or wait for a different stream; no stale result is displayed.</p>}
              <p><strong>Model limits:</strong> constant boat speed and one uniform tidal vector only. It omits leeway, changing/spatial streams, sea state, steering error and position uncertainty. Use current official publications; monitor fixes, cross-track error, observed CMG/SOG, depth, weather and traffic, then revise the plan early.</p>
            </section>}
          </div>
        </div>
      </main>
    </div>
  );
};

export default VectorTriangleTool;
