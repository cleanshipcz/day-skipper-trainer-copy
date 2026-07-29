import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const synopticScenarios = [
  { label: "Depression west of Ireland", question: "With the low to the west, which system is shown?", options: ["Low pressure", "High pressure", "Ridge"], answer: 0 },
  { label: "Blue triangles advancing east", question: "Which front do blue triangles identify?", options: ["Warm", "Cold", "Occluded"], answer: 1 },
  { label: "Northern Hemisphere low", question: "How does surface wind circulate around the low?", options: ["Clockwise", "Anticlockwise", "Straight inward"], answer: 1 },
] as const;

export const SynopticChartReader = () => {
  const [scenario, setScenario] = useState(0);
  const [answer, setAnswer] = useState<number | null>(null);
  const current = synopticScenarios[scenario];
  const choose = (value: number) => setAnswer(value);
  return (
    <Card>
      <CardHeader><CardTitle>Synoptic chart reader</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="relative h-48 rounded-lg bg-sky-50 dark:bg-slate-900 border overflow-hidden" role="img" aria-label={`Simplified synoptic chart: ${current.label}`}>
          <div className="absolute left-1/3 top-1/3 rounded-full border-4 border-slate-500 w-24 h-24 flex items-center justify-center text-3xl font-bold">{scenario === 0 ? "L" : scenario === 2 ? "L" : "◀◀◀"}</div>
          <div className="absolute inset-4 rounded-[50%] border border-slate-400" />
          <div className="absolute inset-10 rounded-[50%] border border-slate-400" />
        </div>
        <p className="font-medium">{current.question}</p>
        <div className="grid sm:grid-cols-3 gap-2" role="group" aria-label="Chart answer">
          {current.options.map((option, index) => <Button key={option} variant="outline" onClick={() => choose(index)}>{option}</Button>)}
        </div>
        {answer !== null && <p role="status">{answer === current.answer ? "Correct" : `Review the chart: ${current.options[current.answer]}.`}</p>}
        <Button onClick={() => { setScenario((scenario + 1) % synopticScenarios.length); setAnswer(null); }}>Next chart</Button>
      </CardContent>
    </Card>
  );
};
