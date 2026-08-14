import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowDown, ArrowUp, CheckCircle2, RefreshCcw, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MOB_RECOVERY_CONSTRAINTS } from "@/data/mobGuidance";
import { isValidMobDrillOrder, MOB_DRILL_SCENARIOS, type MobDrillScenarioKey, type MobDrillStep, saveMobDrillEvidence, shuffleMobDrillSteps } from "./mobDrillModel";

interface MOBSortingGameProps {
  readonly onScenarioComplete?: (scenario: MobDrillScenarioKey) => void;
}

export const MOBSortingGame = ({ onScenarioComplete }: MOBSortingGameProps) => {
  const [scenarioKey, setScenarioKey] = useState<MobDrillScenarioKey>("immediate");
  const [steps, setSteps] = useState<MobDrillStep[]>(() => shuffleMobDrillSteps("immediate"));
  const [result, setResult] = useState<boolean | null>(null);
  const [announcement, setAnnouncement] = useState("Immediate response scenario loaded in a shuffled order.");
  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const reset = (key = scenarioKey) => { setSteps(shuffleMobDrillSteps(key)); setResult(null); setAnnouncement(`${MOB_DRILL_SCENARIOS[key].title} reset in a shuffled order.`); };
  useEffect(() => { reset(scenarioKey); }, [scenarioKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const move = (index: number, delta: -1 | 1) => {
    const destination = index + delta;
    if (destination < 0 || destination >= steps.length) return;
    const movedId = steps[index].id;
    setSteps((current) => { const next = [...current]; [next[index], next[destination]] = [next[destination], next[index]]; return next; });
    setResult(null);
    setAnnouncement(`${steps[index].text} moved to position ${destination + 1} of ${steps.length}.`);
    const preferredDirection = delta === -1 ? (destination > 0 ? "up" : "down") : (destination < steps.length - 1 ? "down" : "up");
    requestAnimationFrame(() => buttonRefs.current[`${movedId}:${preferredDirection}`]?.focus());
  };

  const check = () => {
    const valid = isValidMobDrillOrder(scenarioKey, steps); setResult(valid);
    if (valid) {
      const saved = saveMobDrillEvidence(scenarioKey);
      onScenarioComplete?.(scenarioKey);
      setAnnouncement(`Practice sequence accepted. ${saved ? "Completion evidence saved on this device." : "Evidence could not be saved on this device."} This does not demonstrate operational mastery.`);
    } else {
      const firstBoundary = steps.findIndex((step, index) => index > 0 && steps[index - 1].phase > step.phase);
      const misplaced = steps[firstBoundary];
      setAnnouncement(`Sequence needs review: “${misplaced.text}” belongs before the preceding later-stage action. Keep concurrent roles together, then try again.`);
    }
  };

  return <section className="min-w-0 space-y-4" aria-labelledby="mob-drill-heading">
    <div><h2 id="mob-drill-heading" className="text-xl font-bold">MOB decision and crew-role drill</h2><p className="text-sm text-muted-foreground">A source-aligned practice check, not proof of competence. Rehearse the actual vessel plan with qualified supervision.</p></div>
    <fieldset><legend className="mb-2 font-medium">Choose a scenario</legend><div className="flex flex-col gap-2 sm:flex-row">
      {(Object.keys(MOB_DRILL_SCENARIOS) as MobDrillScenarioKey[]).map((key) => <label key={key} className="flex min-h-11 cursor-pointer items-center gap-2 rounded-md border px-3 py-2"><input type="radio" name="mob-scenario" value={key} checked={scenarioKey === key} onChange={() => setScenarioKey(key)} /><span>{MOB_DRILL_SCENARIOS[key].title}</span></label>)}
    </div></fieldset>
    <Card className="min-w-0 border-2 border-primary/20"><CardHeader><div className="flex flex-wrap items-start justify-between gap-2"><div className="min-w-0"><CardTitle>{MOB_DRILL_SCENARIOS[scenarioKey].title}</CardTitle><CardDescription>{MOB_DRILL_SCENARIOS[scenarioKey].description}</CardDescription></div>{result && <Badge className="gap-1 bg-green-600"><CheckCircle2 aria-hidden="true" className="h-3 w-3"/>Practised</Badge>}</div></CardHeader>
      <CardContent className="space-y-4"><ol className="space-y-2" aria-label="Reorder the scenario actions">
        {steps.map((step, index) => <li key={step.id}><div className={`flex min-w-0 flex-col gap-2 rounded-lg border p-3 ${result === true ? "border-green-300 bg-green-50/50 dark:bg-green-950/20" : result === false ? "border-red-300" : "bg-card"}`}>
          <div className="flex min-w-0 items-start gap-3"><Badge variant="outline" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full p-0">{index + 1}</Badge><div className="min-w-0"><p className="break-words font-medium">{step.text}</p><p className="text-xs text-muted-foreground">Role: {step.role}</p></div></div>
          <div className="flex shrink-0 gap-2 self-end sm:self-auto"><Button ref={(node) => { buttonRefs.current[`${step.id}:up`] = node; }} type="button" variant="outline" size="icon" className="h-11 w-11 touch-manipulation" disabled={index === 0 || result === true} onClick={() => move(index, -1)} aria-label={`Move ${step.text} up`}><ArrowUp aria-hidden="true"/></Button><Button ref={(node) => { buttonRefs.current[`${step.id}:down`] = node; }} type="button" variant="outline" size="icon" className="h-11 w-11 touch-manipulation" disabled={index === steps.length - 1 || result === true} onClick={() => move(index, 1)} aria-label={`Move ${step.text} down`}><ArrowDown aria-hidden="true"/></Button></div>
        </div></li>)}
      </ol><div className="flex flex-col gap-2 sm:flex-row"><Button className="min-h-11 flex-1" onClick={check} disabled={result === true}>Check decision boundaries</Button><Button className="min-h-11" variant="outline" onClick={() => reset()}><RefreshCcw aria-hidden="true" className="mr-2 h-4 w-4"/>Reset and shuffle</Button></div>
      <div className={`rounded-md border p-3 text-sm ${result === false ? "border-red-300" : ""}`} role="status" aria-live="polite" aria-atomic="true">{result === true ? <CheckCircle2 aria-hidden="true" className="mr-2 inline h-4 w-4"/> : result === false ? <XCircle aria-hidden="true" className="mr-2 inline h-4 w-4"/> : null}{announcement}</div>
      {result === false && <p className="text-sm"><Link className="font-medium text-primary underline" to="/safety/mob#mob-handoff">Review the source-aligned theory outcomes and constraints</Link>, then return to the drill.</p>}
      <details className="text-sm"><summary className="cursor-pointer font-medium">Safety boundaries used by this drill</summary><ul className="mt-2 list-disc space-y-1 pl-5">{MOB_RECOVERY_CONSTRAINTS.map((constraint) => <li key={constraint}>{constraint}</li>)}</ul></details>
      </CardContent></Card>
  </section>;
};
