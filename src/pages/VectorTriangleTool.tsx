import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle2, ChevronRight, RotateCcw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useCompletion } from "@/hooks/useCompletion";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { VectorTriangleVisualizer } from "@/components/navigation/VectorTriangleVisualizer";

const VectorTriangleTool = () => {
  const navigate = useNavigate();
  const { completeTopic } = useCompletion();
  const [markedComplete, setMarkedComplete] = useState(false);

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

  const checkAnswer = () => {
    // We need to calculate the actual Resulting Ground Track from inputs
    // Replicating logic from Visualizer roughly for verification
    const toRad = (deg: number) => (deg - 90) * (Math.PI / 180);
    const SCALE = 30; // arbitrary, cancels out

    // Water Vector
    const wx = boatSpeed * Math.cos(toRad(userHeading));
    const wy = boatSpeed * Math.sin(toRad(userHeading));

    // Tide Vector
    const tx = tideRate * Math.cos(toRad(tideSet));
    const ty = tideRate * Math.sin(toRad(tideSet));

    // Result Ground Vector
    const gx = wx + tx;
    const gy = wy + ty;

    const ResultAngle = ((Math.atan2(gy, gx) * 180) / Math.PI + 90 + 360) % 360;

    // Compare angles (handling 359 vs 0 wrap)
    let diff = Math.abs(ResultAngle - targetHeading);
    if (diff > 180) diff = 360 - diff;

    if (diff < 5) {
      // 5 degrees tolerance
      setDrillFeedback("correct");
    } else {
      setDrillFeedback("incorrect");
    }
  };

  const handleComplete = () => {
    completeTopic("tides-vector-tool");
    setMarkedComplete(true);
  };

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
            {markedComplete ? (
              <Button variant="outline" className="text-green-600 border-green-200 bg-green-50" disabled>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Completed
              </Button>
            ) : (
              <Button onClick={handleComplete}>
                Mark as Complete <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            )}
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
            <VectorTriangleVisualizer
              waterTrackHeading={userHeading} // Input for Drill
              waterTrackSpeed={boatSpeed}
              groundTrackHeading={groundTrackHeading} // Input for Solver
              tideSet={tideSet}
              tideRate={tideRate}
              mode={drillMode ? "drill" : "solver"}
              drillTarget={targetHeading}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default VectorTriangleTool;
