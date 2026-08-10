import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, XCircle } from "lucide-react";
import { TRANSIT_SCENARIOS, type TransitAnswer } from "./transitScenarios";

export interface TransitExerciseResult { readonly correctCount: number; readonly totalExercises: number }
interface TransitExerciseProps { readonly onComplete: (result: TransitExerciseResult) => void }
const LABELS: Readonly<Record<TransitAnswer,string>> = { left:"Front mark appears left", aligned:"Marks are in line", right:"Front mark appears right" };
const MASTERY = TRANSIT_SCENARIOS.length;

export const TransitExercise = ({onComplete}: TransitExerciseProps) => {
  const [index,setIndex] = useState(0);
  const [answer,setAnswer] = useState<TransitAnswer|null>(null);
  const scenario = TRANSIT_SCENARIOS[index];
  const correct = answer === scenario.answer;
  const px = (value:number, extent:number) => value * extent;
  const submit = (choice:TransitAnswer) => setAnswer(choice);
  const next = () => {
    if (index + 1 === TRANSIT_SCENARIOS.length) onComplete({correctCount:MASTERY,totalExercises:MASTERY});
    else { setIndex(index + 1); setAnswer(null); }
  };

  return <Card>
    <CardHeader><CardTitle className="text-lg">{scenario.title}</CardTitle><CardDescription>{scenario.description}</CardDescription></CardHeader>
    <CardContent className="space-y-4">
      <p className="text-sm">Exercise {index+1} of {TRANSIT_SCENARIOS.length} · {scenario.difficulty}</p>
      <p className="text-sm text-muted-foreground">Mastery requires all {MASTERY} sight pictures correct. An incorrect answer must be retried.</p>
      <div className="border rounded-lg overflow-hidden">
        <svg viewBox={`0 0 ${scenario.chartWidth} ${scenario.chartHeight}`} className="w-full h-auto" role="img" aria-label="Observer sight picture of two transit marks">
          <rect width={scenario.chartWidth} height={scenario.chartHeight} fill="#dbeafe"/>
          <line x1={px(scenario.usableSegment[0].x,scenario.chartWidth)} y1={px(scenario.usableSegment[0].y,scenario.chartHeight)} x2={px(scenario.usableSegment[1].x,scenario.chartWidth)} y2={px(scenario.usableSegment[1].y,scenario.chartHeight)} stroke="#2563eb" strokeWidth="8" opacity=".35"/>
          <text x="20" y="380" fontSize="12">Highlighted water segment only — no claim beyond it</text>
          {[{p:scenario.rearMarker,label:"Rear"},{p:scenario.frontMarker,label:"Front"}].map(({p,label}) => <g key={label} data-testid={`${label.toLowerCase()}-marker`}><polygon points={`${px(p.x,600)},${px(p.y,400)-18} ${px(p.x,600)-12},${px(p.y,400)+8} ${px(p.x,600)+12},${px(p.y,400)+8}`} fill={label==="Front"?"#dc2626":"#7c3aed"}/><text x={px(p.x,600)} y={px(p.y,400)+25} textAnchor="middle">{label}</text></g>)}
          <circle data-testid="observer" cx={px(scenario.observer.x,600)} cy={px(scenario.observer.y,400)} r="12" fill="#0f172a"/><text x={px(scenario.observer.x,600)} y={px(scenario.observer.y,400)+30} textAnchor="middle">Observer</text>
        </svg>
      </div>
      <fieldset disabled={correct} className="grid gap-2 sm:grid-cols-3"><legend className="sr-only">Choose the sight picture</legend>{(["left","aligned","right"] as const).map(choice=><Button key={choice} variant="outline" onClick={()=>submit(choice)}>{LABELS[choice]}</Button>)}</fieldset>
      {answer && <div role="status" className={`flex gap-2 rounded-lg p-3 ${correct?"bg-green-50 text-green-800":"bg-red-50 text-red-800"}`}>{correct?<CheckCircle2/>:<XCircle/>}<span>{scenario.feedback[answer]}{!correct && " Try this sight picture again."}</span></div>}
      {correct && <div className="flex justify-end"><Button onClick={next}>{index+1===TRANSIT_SCENARIOS.length?"Complete mastery":"Next sight picture"}</Button></div>}
    </CardContent>
  </Card>;
};
