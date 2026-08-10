import { useEffect, useId, useRef, useState, type PointerEvent } from "react";
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
  const qualificationId = `transit-safety-${scenario.id}`;
  const titleId = `transit-picture-title-${scenario.id}`;
  const descriptionId = `transit-picture-description-${scenario.id}`;
  const relationship = LABELS[scenario.answer].toLowerCase();
  return <figure className="space-y-2"><svg viewBox={`0 0 ${scenario.chartWidth} ${scenario.chartHeight}`} className="w-full h-auto" role="img" aria-labelledby={`${titleId} ${descriptionId}`} aria-describedby={qualificationId}>
    <title id={titleId}>Observer sight picture of two transit marks</title>
    <desc id={descriptionId}>A nearer red front mark and a farther purple rear mark. In this sight picture, {relationship}.</desc>
    <rect width={scenario.chartWidth} height={scenario.chartHeight} fill="#dbeafe"/><rect y={horizon} width={scenario.chartWidth} height={scenario.chartHeight-horizon} fill="#93c5fd"/>
    <line y1={horizon} y2={horizon} x2={scenario.chartWidth} stroke="#475569"/>
    {mark(rear,"Rear",false)}{mark(front,"Front",true)}
  </svg><figcaption id={qualificationId} className="px-2 pb-2 text-sm text-muted-foreground whitespace-normal break-words">Assessment applies only on the declared useful-water segment; no clearance elsewhere is implied.</figcaption></figure>;
};

export const TransitExercise = ({onComplete}: TransitExerciseProps) => {
  const [index,setIndex] = useState(0);
  const [answer,setAnswer] = useState<TransitAnswer|null>(null);
  const scenario = TRANSIT_SCENARIOS[index];
  const correct = answer === scenario.answer;
  const feedbackRef = useRef<HTMLDivElement>(null);
  const gesture = useRef<{pointerId:number;x:number;y:number}|null>(null);
  const instructionsId = useId();
  const submit = (choice:TransitAnswer) => setAnswer(choice);
  const next = () => {
    if (index + 1 === TRANSIT_SCENARIOS.length) onComplete({correctCount:MASTERY,totalExercises:MASTERY});
    else { setIndex(index + 1); setAnswer(null); }
  };

  useEffect(() => {
    if (answer) feedbackRef.current?.focus();
  }, [answer]);

  const stopGesture = (event:PointerEvent<HTMLDivElement>, submitSwipe:boolean) => {
    const active = gesture.current;
    if (!active || active.pointerId !== event.pointerId) return;
    if (submitSwipe) {
      const dx = event.clientX - active.x;
      const dy = event.clientY - active.y;
      if (Math.abs(dx) >= 44 && Math.abs(dx) > Math.abs(dy)) submit(dx < 0 ? "left" : "right");
    }
    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    gesture.current = null;
  };

  return <Card>
    <CardHeader><CardTitle className="text-lg">{scenario.title}</CardTitle><CardDescription>{scenario.description}</CardDescription></CardHeader>
    <CardContent className="space-y-4">
      <p className="text-sm">Exercise {index+1} of {TRANSIT_SCENARIOS.length} · {scenario.difficulty}</p>
      <p className="text-sm text-muted-foreground">Mastery requires all {MASTERY} sight pictures correct. An incorrect answer must be retried.</p>
      <p id={instructionsId} className="text-sm text-muted-foreground">Choose one of the three labelled answers. You can also swipe horizontally across the picture; vertical touch scrolling remains available.</p>
      <div
        className="border rounded-lg overflow-hidden"
        style={{touchAction:"pan-y pinch-zoom"}}
        aria-describedby={instructionsId}
        onPointerDown={(event) => {
          if (correct || !event.isPrimary || (event.pointerType === "mouse" && event.button !== 0)) return;
          event.currentTarget.setPointerCapture?.(event.pointerId);
          gesture.current = {pointerId:event.pointerId,x:event.clientX,y:event.clientY};
        }}
        onPointerUp={(event)=>stopGesture(event,true)}
        onPointerCancel={(event)=>stopGesture(event,false)}
        onLostPointerCapture={(event)=>{ if (gesture.current?.pointerId === event.pointerId) gesture.current = null; }}
      >
        <TransitSightPicture scenario={scenario}/>
      </div>
      {answer && <div ref={feedbackRef} tabIndex={-1} role="status" aria-live="polite" className={`flex gap-2 rounded-lg p-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${correct?"bg-green-50 text-green-800":"bg-red-50 text-red-800"}`}>{correct?<CheckCircle2 aria-hidden="true"/>:<XCircle aria-hidden="true"/>}<span>{scenario.feedback[answer]}{!correct && " Try this sight picture again."}</span></div>}
      <fieldset disabled={correct} className="grid gap-2 sm:grid-cols-3"><legend className="sr-only">Choose the sight picture: the front mark's apparent position</legend>{(["left","aligned","right"] as const).map(choice=><Button key={choice} type="button" className="min-h-11 h-auto whitespace-normal" variant={answer===choice?"secondary":"outline"} aria-pressed={answer===choice} onClick={()=>submit(choice)}>{LABELS[choice]}</Button>)}</fieldset>
      {correct && <div className="flex justify-end"><Button onClick={next}>{index+1===TRANSIT_SCENARIOS.length?"Complete mastery":"Next sight picture"}</Button></div>}
    </CardContent>
  </Card>;
};
