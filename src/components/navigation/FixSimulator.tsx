import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Crosshair, CheckCircle2 } from "lucide-react";

const FixSimulator = () => {
  // Simplified 3-point fix logic
  // We have 3 landmarks at roughly 10%, 50%, and 90% width
  // User "takes a bearing" by clicking/adjusting sliders or just simulation input?
  // Let's make it interactive: User drags 3 bearing lines to intersect at a target boat position.

  // Actually, dragging lines on a canvas might be complex for a quick component.
  // Let's do a "Select Best Fix" from options, or a simple "Plot the line" where they adjust the angle.
  // Better: Interactive slider.

  // Scenario: You are somewhere south of these 3 landmarks.
  // Landmark A (Left): Lighthouse. True Bearing: 000.
  // Landmark B (Center): Church. True Bearing: 045.
  // Landmark C (Right): Buoy. True Bearing: 090.

  // No, that's too mathy.
  // Visual Approach:
  // Show a map. Click on 3 objects to "Shoot" a bearing.
  // Lines appear. If they cross well -> Good Fix.

  const [bearings, setBearings] = useState<number[]>([]);
  const [message, setMessage] = useState("Select 3 prominent objects to take a fix.");
  const [lines, setLines] = useState<{ x1: number; y1: number; x2: number; y2: number }[]>([]);

  // Mock landmarks positions on a 100x100 grid
  const landmarks = [
    { id: 1, name: "Lighthouse", x: 20, y: 20, color: "text-red-500", icon: "🗼" },
    { id: 2, name: "Church Tower", x: 50, y: 15, color: "text-blue-500", icon: "⛪" },
    { id: 3, name: "Cardinal Buoy", x: 80, y: 30, color: "text-yellow-500", icon: "📍" },
    { id: 4, name: "Small Tree", x: 35, y: 40, color: "text-green-800", icon: "🌳" }, // Distractor
  ];

  // The "True" boat position is roughly at 50, 80
  const boatPos = { x: 50, y: 80 };

  const handleObjectClick = (landmark: (typeof landmarks)[0]) => {
    if (bearings.includes(landmark.id)) return; // Already selected

    const newBearings = [...bearings, landmark.id];
    setBearings(newBearings);

    // Draw line from landmark to boat (simulated bearing line)
    // In reality, you draw FROM the object, along the reciprocal bearing.
    setLines([...lines, { x1: landmark.x, y1: landmark.y, x2: boatPos.x, y2: boatPos.y }]);

    if (newBearings.length === 1) {
      setMessage("Good start. Fix position is a Line of Position (LOP). Need more.");
    } else if (newBearings.length === 2) {
      setMessage("Better. Two lines give a position, but a third confirms it.");
    } else if (newBearings.length === 3) {
      // Check if they picked the 3 best ones (1, 2, 3 are spread out, 4 is too close/obscure?)
      // Ideally we want 60-120 degree spread.
      // 1 is Left, 2 is Center, 3 is Right. Good spread.
      // 4 is close to 2.
      const hasGoodSpread = newBearings.includes(1) && newBearings.includes(3);
      if (hasGoodSpread) {
        setMessage("Perfect! Excellent 'cut' with wide angles. Position Fixed.");
      } else {
        setMessage("Position fixed, though the angle between objects is narrow. Warning!");
      }
    }
  };

  const reset = () => {
    setBearings([]);
    setLines([]);
    setMessage("Select 3 prominent objects to take a fix.");
  };

  return (
    <Card className="w-full mt-8 border-2 border-secondary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crosshair className="w-5 h-5 text-secondary" />
          Visual Fix Simulator
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative w-full aspect-video bg-blue-50 rounded-xl border border-blue-100 overflow-hidden cursor-crosshair mb-4">
          {/* Grid/Chart effect */}
          <div
            className="absolute inset-0 opacity-10"
            style={{ backgroundImage: "radial-gradient(#000 1px, transparent 1px)", backgroundSize: "20px 20px" }}
          ></div>

          {/* Landmarks */}
          {landmarks.map((lm) => (
            <button
              key={lm.id}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-white/50 transition-all ${
                bearings.includes(lm.id) ? "scale-125 ring-2 ring-primary bg-white/80" : ""
              }`}
              style={{ left: `${lm.x}%`, top: `${lm.y}%` }}
              onClick={() => handleObjectClick(lm)}
              disabled={bearings.length >= 3 && !bearings.includes(lm.id)}
            >
              <span className="text-2xl" role="img" aria-label={lm.name}>
                {lm.icon}
              </span>
            </button>
          ))}

          {/* Bearing Lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {lines.map((line, i) => (
              <line
                key={i}
                x1={`${line.x1}%`}
                y1={`${line.y1}%`}
                x2={`${line.x2}%`}
                y2={`${line.y2}%`}
                stroke="black"
                strokeWidth="2"
                strokeDasharray="5,5"
                opacity="0.6"
              />
            ))}
          </svg>

          {/* Boat (only appears at end?) No, let's show where we are vaguely */}
          <div
            className="absolute transform -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${boatPos.x}%`, top: `${boatPos.y}%` }}
          >
            <div className="w-4 h-4 bg-primary rounded-full animate-pulse ring-4 ring-primary/20"></div>
          </div>
        </div>

        <div className="flex items-center justify-between bg-muted p-4 rounded-lg">
          <p className="font-medium">{message}</p>
          {bearings.length > 0 && (
            <Button variant="outline" size="sm" onClick={reset}>
              Reset
            </Button>
          )}
          {bearings.length === 3 && <CheckCircle2 className="w-6 h-6 text-green-500 ml-2" />}
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Click on the landmarks (Tower, Church, Buoy) to take bearing lines.
        </p>
      </CardContent>
    </Card>
  );
};

export default FixSimulator;
