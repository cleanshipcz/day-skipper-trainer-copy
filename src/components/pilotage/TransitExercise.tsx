import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, XCircle } from "lucide-react";
import { apparentMarkOffsets, TRANSIT_SCENARIOS, type TransitAnswer, type TransitScenario } from "./transitScenarios";

export interface TransitExerciseResult { readonly correctCount: number; readonly totalExercises: number }
interface TransitExerciseProps { readonly onComplete: (result: TransitExerciseResult) => void }
const LABELS: Readonly<Record<TransitAnswer,string>> = { left:"Front mark appears left", aligned:"Marks are in line", right:"Front mark appears right" };
const MASTERY = TRANSIT_SCENARIOS.length;

export const TransitSightPicture = ({scenario}:{readonly scenario:TransitScenario}) => {
  const {front,rear} = apparentMarkOffsets(scenario);
  const x = (angle:number) => scenario.chartWidth / 2 + angle * scenario.chartWidth * 0.55;
  const horizon = scenario.chartHeight * 0.62;
  const mark = (angle:number, label:string, nearer:boolean) => <g data-testid={`${label.toLowerCase()}-marker`}>
    <polygon data-x={x(angle)} points={`${x(angle)},${horizon-(nearer?60:40)} ${x(angle)-(nearer?18:12)},${horizon} ${x(angle)+(nearer?18:12)},${horizon}`} fill={nearer?"#dc2626":"#7c3aed"}/>
    <text x={x(angle)} y={horizon+scenario.chartHeight*.07} textAnchor="middle">{label}</text>
  </g>;
  return <svg viewBox={`0 0 ${scenario.chartWidth} ${scenario.chartHeight}`} className="w-full h-auto" role="img" aria-label="Observer sight picture of two transit marks">
    <rect width={scenario.chartWidth} height={scenario.chartHeight} fill="#dbeafe"/><rect y={horizon} width={scenario.chartWidth} height={scenario.chartHeight-horizon} fill="#93c5fd"/>
    <line y1={horizon} y2={horizon} x2={scenario.chartWidth} stroke="#475569"/>
    {mark(rear,"Rear",false)}{mark(front,"Front",true)}
    <text x={scenario.chartWidth*.03} y={scenario.chartHeight*.94} fontSize={scenario.chartHeight*.035}>Assessment applies only on the declared useful-water segment; no clearance elsewhere is implied.</text>
  </svg>;
};

export const TransitExercise = ({onComplete}: TransitExerciseProps) => {
  const [index,setIndex] = useState(0);
  const [answer,setAnswer] = useState<TransitAnswer|null>(null);
  const scenario = TRANSIT_SCENARIOS[index];
  const correct = answer === scenario.answer;
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
        <TransitSightPicture scenario={scenario}/>
      </div>
      <fieldset disabled={correct} className="grid gap-2 sm:grid-cols-3"><legend className="sr-only">Choose the sight picture</legend>{(["left","aligned","right"] as const).map(choice=><Button key={choice} variant="outline" onClick={()=>submit(choice)}>{LABELS[choice]}</Button>)}</fieldset>
      {answer && <div role="status" className={`flex gap-2 rounded-lg p-3 ${correct?"bg-green-50 text-green-800":"bg-red-50 text-red-800"}`}>{correct?<CheckCircle2/>:<XCircle/>}<span>{scenario.feedback[answer]}{!correct && " Try this sight picture again."}</span></div>}
      {correct && <div className="flex justify-end"><Button onClick={next}>{index+1===TRANSIT_SCENARIOS.length?"Complete mastery":"Next sight picture"}</Button></div>}
    </CardContent>
  </Card>;
};
