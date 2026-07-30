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
          {scenario === 0 && <>
            <div data-chart-marker="low" className="absolute left-1/3 top-1/3 rounded-full border-4 border-slate-500 w-24 h-24 flex items-center justify-center text-3xl font-bold">L</div>
            <div className="absolute inset-4 rounded-[50%] border border-slate-400" />
            <div className="absolute inset-10 rounded-[50%] border border-slate-400" />
          </>}
          {scenario === 1 && (
            <div data-chart-marker="cold-front" data-direction="east" className="absolute left-[12%] right-[12%] top-1/2 -translate-y-1/2 border-t-4 border-blue-600 text-blue-700 text-3xl tracking-[0.7rem] text-center" aria-label="Cold front with blue triangles pointing east">
              ▶ ▶ ▶ ▶
            </div>
          )}
          {scenario === 2 && (
            <div data-chart-marker="anticlockwise-low" data-circulation="anticlockwise" className="absolute inset-8 rounded-full border-2 border-slate-500 flex items-center justify-center text-3xl font-bold" aria-label="Low pressure with anticlockwise circulation">
              <span className="absolute left-2 top-1/2">↓</span><span>L ↺</span><span className="absolute right-2 top-1/2">↑</span>
            </div>
          )}
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
