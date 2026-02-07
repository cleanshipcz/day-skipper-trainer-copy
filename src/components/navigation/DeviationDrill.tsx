import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trophy, CheckCircle, RefreshCw } from "lucide-react";

// Mock Deviation Data (Usually from a generic curve)
// Heading: Deviation
const DEVIATION_DATA: Record<string, number> = {
  "000": -2, // 2W
  "045": -4, // 4W
  "090": -5, // 5W
  "135": -3, // 3W
  "180": 0, // 0
  "225": +3, // 3E
  "270": +5, // 5E
  "315": +2, // 2E
};

const headings = ["000", "045", "090", "135", "180", "225", "270", "315"]; // Simplified 45 deg steps for mobile friendliness, ideally 15 deg.
// Let's stick to 45 for UI space, but mention it.

const DeviationDrill = () => {
  const [variation, setVariation] = useState(-5); // 5W fixed for this drill
  const [inputs, setInputs] = useState<Record<string, string>>({}); // User inputs for Compass Heading
  const [results, setResults] = useState<Record<string, boolean>>({});
  const [completed, setCompleted] = useState(false);
  const [score, setScore] = useState(0);

  const checkRow = (heading: string, val: string) => {
    // CADET Logic Check
    // Given True Heading.
    // Variation is -5 (5W).
    // Magnetic = True - Var (Subtract West? NO! Add West for T->M).
    // Wait. CADET: Compass -> True Add East.
    // Therefore True -> Compass Subtract East.
    // True -> Magnetic: Subtract East Var, Add West Var.
    // Magnetic -> Compass: Subtract East Dev, Add West Dev.

    const T = Number(heading);
    const Var = variation; // -5 = 5W

    // T -> M
    // If Var is -5 (5W), we ADD.
    // M = T - Var (if Var is regular signed integer where E is + and W is -)
    // Let's use standard math: T - V - D = C?
    // Let's test: T=000, V=5W (-5). CADET says C->T Add East.
    // So C + (-5) + D = T ? No.
    // C + V + D = T (if E is pos).
    // So C = T - V - D.

    // Example: T=000, V=-5 (5W), D=-2 (2W).
    // C = 000 - (-5) - (-2) = 000 + 5 + 2 = 007.
    // Let's check CADET.
    // C=007. Dev=2W. Mag = 007 - 2 = 005.
    // Mag=005. Var=5W. True = 005 - 5 = 000.
    // Correct.

    const dev = DEVIATION_DATA[heading];
    const correctC = (T - variation - dev + 360) % 360;

    const userC = Number(val);
    return Math.abs(userC - correctC) < 1; // Allow slight float tolerance if needed, though ints used
  };

  const handleInputChange = (heading: string, val: string) => {
    setInputs((prev) => ({ ...prev, [heading]: val }));
  };

  const handleSubmit = () => {
    let newScore = 0;
    const newResults: Record<string, boolean> = {};

    headings.forEach((h) => {
      const isCorrect = checkRow(h, inputs[h]);
      newResults[h] = isCorrect;
      if (isCorrect) newScore++;
    });

    setResults(newResults);
    setScore(newScore);
    setCompleted(true);
  };

  const reset = () => {
    setInputs({});
    setResults({});
    setCompleted(false);
    setScore(0);
    // Randomize variation slightly?
    setVariation((prev) => (prev === -5 ? 4 : -5)); // Toggle 5W / 4E
  };

  return (
    <Card className="w-full mt-8 border-2 border-primary/20 bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          Deviation Table Drill
        </CardTitle>
        <CardDescription>
          Fill in the Compass Courses.
          <br />
          Variation is{" "}
          <b>
            {Math.abs(variation)}° {variation > 0 ? "E" : "W"}
          </b>
          .
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">True (°T)</TableHead>
              <TableHead className="w-[80px]">Var</TableHead>
              <TableHead className="w-[80px]">Mag (°M)</TableHead>
              <TableHead className="w-[80px]">Dev</TableHead>
              <TableHead>Compass (°C)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {headings.map((h) => {
              const T = Number(h);
              // Pre-calculate Mag for the user as a hint? Or make them do it?
              // Syllabus says "repetitive calculation". They should do at least C.
              // Let's show Mag to break it down.
              const Mag = (T - variation + 360) % 360;
              const Dev = DEVIATION_DATA[h];
              const devStr = Math.abs(Dev) + (Dev >= 0 ? "E" : "W");

              return (
                <TableRow key={h}>
                  <TableCell className="font-bold">{h}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {Math.abs(variation)}
                    {variation > 0 ? "E" : "W"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{Mag.toString().padStart(3, "0")}</TableCell>
                  <TableCell>{devStr}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Input
                        className={`w-20 ${
                          completed
                            ? results[h]
                              ? "border-green-500 bg-green-50 text-green-900"
                              : "border-red-500 bg-red-50"
                            : ""
                        }`}
                        placeholder="???"
                        value={inputs[h] || ""}
                        onChange={(e) => handleInputChange(h, e.target.value)}
                        disabled={completed}
                      />
                      {completed && results[h] && <CheckCircle className="w-4 h-4 text-green-500" />}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        <div className="mt-6 flex justify-between items-center">
          {completed ? (
            <div className="flex items-center gap-4">
              <span className="font-bold text-lg">
                Score: {score}/{headings.length}
              </span>
              <Button onClick={reset} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" /> New Drill
              </Button>
            </div>
          ) : (
            <Button onClick={handleSubmit} className="w-full">
              Check Answers
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DeviationDrill;
