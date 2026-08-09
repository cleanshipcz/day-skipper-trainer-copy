import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeftRight, MoveRight } from "lucide-react";
import { normalizeHeading } from "./compassHeading";

type Direction = "E" | "W";
type Field = { value?: number; error?: string };

const parseField = (raw: string, label: string, max: number): Field => {
  if (raw.trim() === "") return {};
  const value = Number(raw);
  if (!Number.isFinite(value)) return { error: `${label} must be a finite number.` };
  if (value < 0 || value > max) return { error: `${label} must be between 0° and ${max}°.` };
  return { value };
};

const displayHeading = (heading: number) => String(heading).padStart(3, "0");

const CompassConverter = () => {
  const [trueHeading, setTrueHeading] = useState("");
  const [variation, setVariation] = useState("");
  const [variationDir, setVariationDir] = useState<Direction>("E");
  const [deviation, setDeviation] = useState("");
  const [deviationDir, setDeviationDir] = useState<Direction>("E");
  const [announcement, setAnnouncement] = useState("");

  const result = useMemo(() => {
    const trueField = parseField(trueHeading, "True heading", 359);
    const variationField = parseField(variation, "Variation", 90);
    const deviationField = parseField(deviation, "Deviation", 90);
    const complete = trueField.value !== undefined && variationField.value !== undefined && deviationField.value !== undefined;
    if (!complete || trueField.error || variationField.error || deviationField.error) {
      return { trueField, variationField, deviationField };
    }
    const magnetic = trueField.value! + (variationDir === "E" ? -variationField.value! : variationField.value!);
    const compass = magnetic + (deviationDir === "E" ? -deviationField.value! : deviationField.value!);
    return {
      trueField,
      variationField,
      deviationField,
      magneticHeading: normalizeHeading(magnetic),
      compassHeading: normalizeHeading(compass),
    };
  }, [trueHeading, variation, variationDir, deviation, deviationDir]);

  const error = (id: string, message?: string) =>
    message ? <span id={id} role="alert" className="text-xs text-destructive">{message}</span> : null;
  const announceResult = () => setAnnouncement(result.compassHeading === undefined
    ? "Calculation incomplete. Complete all three valid fields."
    : `Calculated course to steer: ${displayHeading(result.compassHeading)} degrees compass.`);

  return (
    <Card className="mt-8 w-full min-w-0 overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-card to-primary/5">
      <CardHeader><CardTitle className="flex items-center gap-2"><ArrowLeftRight className="w-5 h-5 text-primary" />Interactive CADET Converter</CardTitle></CardHeader>
      <CardContent className="min-w-0">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-start mb-8">
          <div className="flex flex-col gap-2">
            <Label htmlFor="true">True (°T)</Label>
            <Input id="true" aria-label="True heading in degrees true" aria-invalid={Boolean(result.trueField.error)} aria-describedby={result.trueField.error ? "true-error" : undefined} type="number" min="0" max="359" step="any" placeholder="000" value={trueHeading} onChange={(e) => setTrueHeading(e.target.value)} onBlur={announceResult} className="text-center font-bold text-lg" />
            {error("true-error", result.trueField.error)}
            <span className="text-xs text-center text-muted-foreground">Chart</span>
          </div>
          <div className="flex flex-col gap-2 relative">
            <Label htmlFor="variation" className="text-center text-xs text-muted-foreground">Variation</Label>
            <div className="flex gap-2 justify-center items-center"><span aria-hidden className="text-sm font-bold">{variationDir === "E" ? "-" : "+"}</span><Input id="variation" aria-label="Variation magnitude in degrees" aria-invalid={Boolean(result.variationField.error)} aria-describedby={result.variationField.error ? "variation-error" : undefined} type="number" min="0" max="90" step="any" placeholder="0" value={variation} onChange={(e) => setVariation(e.target.value)} onBlur={announceResult} className="w-20 min-h-11 text-center" /><Button type="button" aria-label={`Variation direction: ${variationDir === "E" ? "East" : "West"}`} aria-pressed={variationDir === "W"} variant="outline" size="sm" className="min-h-11 min-w-11 p-0" onClick={() => setVariationDir((prev) => prev === "E" ? "W" : "E")}>{variationDir}</Button></div>
            {error("variation-error", result.variationField.error)}
            <MoveRight className="w-4 h-4 text-muted-foreground absolute -right-3 top-1/2 -translate-y-1/2 hidden md:block" />
          </div>
          <div className="flex flex-col gap-2 text-center opacity-70"><Label>Magnetic (°M)</Label><output aria-label="Calculated magnetic heading in degrees magnetic" className="h-10 flex items-center justify-center font-mono text-xl bg-muted rounded-md border border-input">{result.magneticHeading === undefined ? "--" : displayHeading(result.magneticHeading)}</output></div>
          <div className="flex flex-col gap-2 relative">
            <Label htmlFor="deviation" className="text-center text-xs text-muted-foreground">Deviation</Label>
            <div className="flex gap-2 justify-center items-center"><span aria-hidden className="text-sm font-bold">{deviationDir === "E" ? "-" : "+"}</span><Input id="deviation" aria-label="Deviation magnitude in degrees" aria-invalid={Boolean(result.deviationField.error)} aria-describedby={result.deviationField.error ? "deviation-error" : undefined} type="number" min="0" max="90" step="any" placeholder="0" value={deviation} onChange={(e) => setDeviation(e.target.value)} onBlur={announceResult} className="w-20 min-h-11 text-center" /><Button type="button" aria-label={`Deviation direction: ${deviationDir === "E" ? "East" : "West"}`} aria-pressed={deviationDir === "W"} variant="outline" size="sm" className="min-h-11 min-w-11 p-0" onClick={() => setDeviationDir((prev) => prev === "E" ? "W" : "E")}>{deviationDir}</Button></div>
            {error("deviation-error", result.deviationField.error)}
            <MoveRight className="w-4 h-4 text-muted-foreground absolute -right-3 top-1/2 -translate-y-1/2 hidden md:block" />
          </div>
          <div className="flex flex-col gap-2"><Label className="text-primary font-bold">Compass (°C)</Label><output aria-label="Calculated course to steer in degrees compass" className="h-10 flex items-center justify-center font-mono text-xl font-bold bg-primary/10 text-primary rounded-md border border-primary/30">{result.compassHeading === undefined ? "--" : `${displayHeading(result.compassHeading)} degrees compass`}</output>{result.compassHeading !== undefined && <span className="text-xs text-center text-muted-foreground">Course to steer</span>}</div>
        </div>
        <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">{announcement}</p>
        <div className="text-center text-sm text-muted-foreground bg-muted p-3 rounded-lg"><p>Logic: <b>True</b> <span className="text-red-500">(- East)</span> <span className="text-green-500">(+ West)</span> = <b>Magnetic</b> <span className="text-red-500">(- East)</span> <span className="text-green-500">(+ West)</span> = <b>Compass</b></p><p className="mt-1 font-medium opacity-80">Results are rounded to the nearest whole degree and shown as 000°–359°.</p><p className="mt-1 font-medium opacity-80">&quot;True Virgins Make Dull Company&quot;</p></div>
      </CardContent>
    </Card>
  );
};

export default CompassConverter;
