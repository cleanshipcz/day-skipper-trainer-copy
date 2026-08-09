/* eslint-disable react-refresh/only-export-components -- exported navigation maths are the drill's testable contract */
import { useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trophy, CheckCircle, RefreshCw } from "lucide-react";

/** Signed degrees: east is positive, west is negative. Card headings are compass headings. */
export const DEVIATION_CARD = [
  { compass: 0, deviation: -2 },
  { compass: 45, deviation: -4 },
  { compass: 90, deviation: -5 },
  { compass: 135, deviation: -3 },
  { compass: 180, deviation: 0 },
  { compass: 225, deviation: 3 },
  { compass: 270, deviation: 5 },
  { compass: 315, deviation: 2 },
] as const;

const headings = [0, 45, 90, 135, 180, 225, 270, 315];
export const normalizeHeading = (heading: number) => ((heading % 360) + 360) % 360;
const angularDifference = (a: number, b: number) => Math.abs(((a - b + 540) % 360) - 180);
const heading = (value: number) => Math.round(normalizeHeading(value)).toString().padStart(3, "0");
const signed = (value: number, decimals = 0) => value === 0 ? "0°" : `${Math.abs(value).toFixed(decimals)}°${value > 0 ? "E" : "W"}`;

export function deviationAtCompassHeading(compassHeading: number) {
  const compass = normalizeHeading(compassHeading);
  const lowerIndex = Math.floor(compass / 45);
  const lower = DEVIATION_CARD[lowerIndex];
  const upper = DEVIATION_CARD[(lowerIndex + 1) % DEVIATION_CARD.length];
  const fraction = (compass - lower.compass) / 45;
  return lower.deviation + (upper.deviation - lower.deviation) * fraction;
}

export function solveCompassHeading(trueHeading: number, variation: number) {
  const magnetic = normalizeHeading(trueHeading - variation);
  let compass = magnetic;
  let iterations = 0;
  for (; iterations < 25; iterations += 1) {
    const next = normalizeHeading(magnetic - deviationAtCompassHeading(compass));
    if (angularDifference(next, compass) < 0.0001) { compass = next; break; }
    compass = next;
  }
  const deviation = deviationAtCompassHeading(compass);
  const lowerCompass = Math.floor(compass / 45) * 45;
  return { trueHeading: normalizeHeading(trueHeading), variation, magnetic, compass, deviation, iterations: iterations + 1, bracket: [lowerCompass, (lowerCompass + 45) % 360] as const };
}

const DeviationDrill = () => {
  const [variation, setVariation] = useState(-5);
  const [inputs, setInputs] = useState<Record<number, string>>({});
  const [results, setResults] = useState<Record<number, boolean>>({});
  const [completed, setCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const summaryRef = useRef<HTMLDivElement>(null);
  const firstAnswerRef = useRef<HTMLInputElement>(null);
  const rows = headings.map((trueHeading) => solveCompassHeading(trueHeading, variation));

  const handleSubmit = () => {
    let newScore = 0;
    const newResults: Record<number, boolean> = {};
    rows.forEach((row) => {
      const answer = Number(inputs[row.trueHeading]);
      const correct = Number.isFinite(answer) && angularDifference(answer, Math.round(row.compass)) < 0.5;
      newResults[row.trueHeading] = correct;
      if (correct) newScore += 1;
    });
    setResults(newResults);
    setScore(newScore);
    setCompleted(true);
    requestAnimationFrame(() => summaryRef.current?.focus());
  };

  const reset = () => {
    setInputs({}); setResults({}); setCompleted(false); setScore(0);
    setVariation((previous) => previous === -5 ? 4 : -5);
    requestAnimationFrame(() => firstAnswerRef.current?.focus());
  };

  return <Card className="mt-8 w-full min-w-0 overflow-hidden border-2 border-primary/20 bg-card">
    <CardHeader><CardTitle className="flex items-center gap-2"><Trophy aria-hidden className="h-5 w-5 text-yellow-500"/>Deviation-card drill</CardTitle><CardDescription>Convert each true heading to compass. Variation is <strong>{signed(variation)}</strong>. Enter compass headings rounded to the nearest degree.</CardDescription></CardHeader>
    <CardContent className="min-w-0 space-y-6">
      <section aria-labelledby="deviation-card-heading" className="min-w-0 space-y-2">
        <h3 id="deviation-card-heading" className="font-semibold">Vessel deviation card</h3>
        <p className="text-sm text-muted-foreground">The first row is <strong>compass heading (°C)</strong>, not true or magnetic heading.</p>
        <div className="overflow-x-auto" role="region" aria-label="Vessel deviation card; scroll horizontally to see all headings" tabIndex={0}><Table><TableCaption className="sr-only">Deviation values by compass heading</TableCaption><TableBody><TableRow><TableHead scope="row" className="sticky left-0 z-10 bg-card">Compass heading</TableHead>{DEVIATION_CARD.map((entry) => <TableCell key={entry.compass}>{heading(entry.compass)}°C</TableCell>)}</TableRow><TableRow><TableHead scope="row" className="sticky left-0 z-10 bg-card">Deviation</TableHead>{DEVIATION_CARD.map((entry) => <TableCell key={entry.compass}>{signed(entry.deviation)}</TableCell>)}</TableRow></TableBody></Table></div>
      </section>

      <aside className="rounded-md border bg-muted/30 p-4 text-sm space-y-2">
        <h3 className="font-semibold">Deterministic lookup method</h3>
        <p>Use east-positive signs. First calculate magnetic: <strong>M = T − variation</strong>. Deviation belongs to the resulting compass heading, so solve <strong>C = M − deviation(C)</strong>.</p>
        <p>Start with C₀ = M, linearly interpolate between the two adjacent compass-card entries (including 315°→000° across north), then repeat Cₙ₊₁ = M − deviation(Cₙ) until the change is below 0.0001°. The drill caps this deterministic iteration at 25 passes and rounds only the final compass answer.</p>
      </aside>

      <div className="overflow-x-auto" role="region" aria-label="Compass drill answers; scroll horizontally to see all columns" tabIndex={0}><Table><TableCaption className="sr-only">True-to-compass calculation practice and feedback</TableCaption><TableHeader><TableRow><TableHead scope="col">True</TableHead><TableHead scope="col">Variation</TableHead><TableHead scope="col">Magnetic</TableHead><TableHead scope="col">Card entries used</TableHead><TableHead scope="col">Interpolated deviation</TableHead><TableHead scope="col">Compass answer</TableHead></TableRow></TableHeader><TableBody>{rows.map((row, index) => {
        const feedbackId = `answer-feedback-${row.trueHeading}`;
        const expected = heading(row.compass);
        return <TableRow key={row.trueHeading}><TableCell className="font-bold">{heading(row.trueHeading)}°T</TableCell><TableCell>{signed(variation)}</TableCell><TableCell>{heading(row.magnetic)}°M</TableCell><TableCell data-testid={`bracket-${row.trueHeading}`}>{completed ? `${heading(row.bracket[0])}–${heading(row.bracket[1])}°C` : <span className="text-muted-foreground">Shown after check</span>}</TableCell><TableCell data-testid={`deviation-${row.trueHeading}`}>{completed ? signed(row.deviation, 1) : <span className="text-muted-foreground">Shown after check</span>}</TableCell><TableCell className="min-w-72"><div className="flex items-center gap-2"><Input ref={index === 0 ? firstAnswerRef : undefined} aria-label={`Compass answer in degrees compass for ${heading(row.trueHeading)} degrees true`} aria-invalid={completed ? !results[row.trueHeading] : undefined} aria-describedby={completed ? feedbackId : undefined} className={`w-28 min-h-11 ${completed ? results[row.trueHeading] ? "border-green-500 bg-green-50 text-green-900" : "border-red-500 bg-red-50" : ""}`} placeholder="000" inputMode="numeric" value={inputs[row.trueHeading] || ""} onChange={(event) => setInputs((previous) => ({ ...previous, [row.trueHeading]: event.target.value }))} disabled={completed}/>{completed && results[row.trueHeading] && <CheckCircle aria-hidden className="h-4 w-4 text-green-500"/>}</div>{completed && <p id={feedbackId} className="mt-2 text-sm"><strong>{results[row.trueHeading] ? "Correct." : "Incorrect."}</strong> Expected {expected}°C. {heading(row.magnetic)}°M − {signed(row.deviation, 1)} deviation = {expected}°C.</p>}</TableCell></TableRow>;
      })}</TableBody></Table></div>

      <section aria-labelledby="worked-heading" className="rounded-md border p-4 text-sm space-y-1">
        <h3 id="worked-heading" className="font-semibold">Worked interpolation example</h3>
        <p>For a separate 337.5°C lookup, the heading is halfway from the 315°C card entry (+2°E) to 000°C (2°W). Linear interpolation gives 0° deviation. This demonstrates the north-wrap method without supplying an answer to the assessed rows.</p>
      </section>

      <div className="flex items-center justify-between">{completed ? <div ref={summaryRef} tabIndex={-1} role="status" aria-live="polite" aria-atomic="true" className="flex flex-col items-start gap-3 sm:flex-row sm:items-center"><span className="text-lg font-bold">Submission complete. Score: {score}/{headings.length}. Review the feedback in each row.</span><Button onClick={reset} variant="outline" className="min-h-11"><RefreshCw aria-hidden className="mr-2 h-4 w-4"/>New drill</Button></div> : <Button onClick={handleSubmit} className="min-h-11 w-full">Check answers</Button>}</div>
    </CardContent>
  </Card>;
};

export default DeviationDrill;
