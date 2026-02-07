import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeftRight, MoveRight } from "lucide-react";

const CompassConverter = () => {
  const [trueHeading, setTrueHeading] = useState<number | "">("");
  const [variation, setVariation] = useState<number | "">("");
  const [variationDir, setVariationDir] = useState<"E" | "W">("E");
  const [deviation, setDeviation] = useState<number | "">("");
  const [deviationDir, setDeviationDir] = useState<"E" | "W">("E");

  const [magneticHeading, setMagneticHeading] = useState<number | null>(null);
  const [compassHeading, setCompassHeading] = useState<number | null>(null);

  useEffect(() => {
    const calculate = () => {
      if (trueHeading === "" || variation === "" || deviation === "") return;

      // Compass to True: Add East (+), Subtract West (-)
      // True to Compass: Subtract East (-), Add West (+)

      // Step 1: True to Magnetic (True - Var)
      // Var East: Subtract. Var West: Add.
      let mag = Number(trueHeading);
      if (variationDir === "E") {
        mag -= Number(variation);
      } else {
        mag += Number(variation);
      }
      // Normalize to 0-360
      mag = (mag + 360) % 360;
      setMagneticHeading(Math.round(mag));

      // Step 2: Magnetic to Compass (Mag - Dev)
      // Dev East: Subtract. Dev West: Add.
      let comp = mag;
      if (deviationDir === "E") {
        comp -= Number(deviation);
      } else {
        comp += Number(deviation);
      }
      // Normalize
      comp = (comp + 360) % 360;
      setCompassHeading(Math.round(comp));
    };

    calculate();
  }, [trueHeading, variation, variationDir, deviation, deviationDir]);

  return (
    <Card className="w-full mt-8 border-2 border-primary/20 bg-gradient-to-br from-card to-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ArrowLeftRight className="w-5 h-5 text-primary" />
          Interactive CADET Converter
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center mb-8">
          {/* TRUE */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="true">True (°T)</Label>
            <Input
              id="true"
              type="number"
              min="0"
              max="359"
              placeholder="000"
              value={trueHeading}
              onChange={(e) => setTrueHeading(Number(e.target.value))}
              className="text-center font-bold text-lg"
            />
            <span className="text-xs text-center text-muted-foreground">Chart</span>
          </div>

          {/* VARIATION */}
          <div className="flex flex-col gap-2 relative">
            <Label className="text-center text-xs text-muted-foreground">Variation</Label>
            <div className="flex gap-1 justify-center items-center">
              <span className="text-sm font-bold">{variationDir === "E" ? "-" : "+"}</span>
              <Input
                type="number"
                min="0"
                max="90"
                placeholder="0"
                value={variation}
                onChange={(e) => setVariation(Number(e.target.value))}
                className="w-16 h-8 text-center"
              />
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setVariationDir((prev) => (prev === "E" ? "W" : "E"))}
              >
                {variationDir}
              </Button>
            </div>
            <MoveRight className="w-4 h-4 text-muted-foreground absolute -right-3 top-1/2 transform -translate-y-1/2 hidden md:block" />
          </div>

          {/* MAGNETIC */}
          <div className="flex flex-col gap-2 text-center opacity-70">
            <Label>Magnetic (°M)</Label>
            <div className="h-10 flex items-center justify-center font-mono text-xl bg-muted rounded-md border border-input">
              {magneticHeading ?? "--"}
            </div>
          </div>

          {/* DEVIATION */}
          <div className="flex flex-col gap-2 relative">
            <Label className="text-center text-xs text-muted-foreground">Deviation</Label>
            <div className="flex gap-1 justify-center items-center">
              <span className="text-sm font-bold">{deviationDir === "E" ? "-" : "+"}</span>
              <Input
                type="number"
                min="0"
                max="90"
                placeholder="0"
                value={deviation}
                onChange={(e) => setDeviation(Number(e.target.value))}
                className="w-16 h-8 text-center"
              />
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setDeviationDir((prev) => (prev === "E" ? "W" : "E"))}
              >
                {deviationDir}
              </Button>
            </div>
            <MoveRight className="w-4 h-4 text-muted-foreground absolute -right-3 top-1/2 transform -translate-y-1/2 hidden md:block" />
          </div>

          {/* COMPASS */}
          <div className="flex flex-col gap-2">
            <Label className="text-primary font-bold">Compass (°C)</Label>
            <div className="h-10 flex items-center justify-center font-mono text-xl font-bold bg-primary/10 text-primary rounded-md border border-primary/30">
              {compassHeading ?? "--"}
            </div>
            <span className="text-xs text-center text-muted-foreground">Steer This</span>
          </div>
        </div>

        <div className="text-center text-sm text-muted-foreground bg-muted p-3 rounded-lg">
          <p>
            Logic: <b>True</b> <span className="text-red-500">(- East)</span>{" "}
            <span className="text-green-500">(+ West)</span> = <b>Magnetic</b>{" "}
            <span className="text-red-500">(- East)</span> <span className="text-green-500">(+ West)</span> ={" "}
            <b>Compass</b>
          </p>
          <p className="mt-1 font-medium opacity-80">"True Virgins Make Dull Company"</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default CompassConverter;
