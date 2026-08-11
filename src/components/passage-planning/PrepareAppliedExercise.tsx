import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { PREPARE_EXERCISE_REVISION, prepareScenarios, type PrepareDecision } from "@/data/prepareSteps";

export type PrepareArtifact = { catalogueRevision: string; scenarioId: string; responses: string[]; decision: PrepareDecision; completedAt: string };
type Draft = { catalogueRevision: string; scenarioId: string; responses: string[]; decision?: PrepareDecision };
const STORAGE_KEY = "prepare-applied-exercise";
const decisions: PrepareDecision[] = ["go", "delay", "divert", "abort"];

const readDraft = (): Draft | null => { try { const value = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null") as Draft | null; const scenario = prepareScenarios.find(({ id }) => id === value?.scenarioId); if (!value || value.catalogueRevision !== PREPARE_EXERCISE_REVISION || !scenario || !Array.isArray(value.responses)) return null; return { ...value, responses: value.responses.slice(0, scenario.answers.length).filter((item): item is string => typeof item === "string") }; } catch { return null; } };

export function PrepareAppliedExercise({ alreadyCompleted = false, onComplete }: { alreadyCompleted?: boolean; onComplete: (artifact: PrepareArtifact) => Promise<boolean> }) {
  const initial = useMemo(readDraft, []);
  const [scenarioId, setScenarioId] = useState(initial?.scenarioId ?? prepareScenarios[0]?.id ?? "");
  const [responses, setResponses] = useState<string[]>(initial?.responses ?? []);
  const [decision, setDecision] = useState<PrepareDecision | undefined>(initial?.decision);
  const [feedback, setFeedback] = useState(""); const [saving, setSaving] = useState(false); const [completed, setCompleted] = useState(alreadyCompleted);
  const scenario = prepareScenarios.find(({ id }) => id === scenarioId);
  const step = responses.length; const total = (scenario?.answers.length ?? 0) + 1; const objective = Math.min(step + (decision ? 1 : 0), total);
  useEffect(() => { if (alreadyCompleted) setCompleted(true); }, [alreadyCompleted]);
  useEffect(() => { if (!scenario) return; try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ catalogueRevision: PREPARE_EXERCISE_REVISION, scenarioId, responses, decision })); } catch { /* exercise remains usable without storage */ } }, [scenario, scenarioId, responses, decision]);
  if (!scenario) return <section aria-labelledby="prepare-exercise"><h2 id="prepare-exercise" className="text-2xl font-semibold">Applied PREPARE exercise</h2><p role="status">No valid exercise scenarios are currently available. Review the structured PREPARE checklist above.</p></section>;
  const chooseStep = (answer: string) => { const expected = scenario.answers[step]; if (answer !== expected) { setFeedback("Not yet. Choose the action that records evidence and preserves safety margins; do not assume an unchecked item is satisfactory."); return; } setResponses([...responses, answer]); setFeedback(`Correct. ${answer}.`); };
  const chooseDecision = (answer: PrepareDecision) => { setDecision(answer); setFeedback(answer === scenario.decision ? `Correct. ${scenario.decisionReason}` : `Not yet. ${scenario.decisionReason}`); };
  const finish = async () => { if (decision !== scenario.decision || saving || completed) return; setSaving(true); const artifact = { catalogueRevision: PREPARE_EXERCISE_REVISION, scenarioId, responses, decision, completedAt: new Date().toISOString() }; const saved = await onComplete(artifact); setSaving(false); if (saved) { setCompleted(true); setFeedback("Completion saved. Your reviewable decision record remains below."); } else setFeedback("Completion was not saved. Your exercise evidence remains available; retry when ready."); };
  const choices = step < scenario.answers.length ? [scenario.answers[step], "Continue on the planned route and check this later"] : [];
  return <section aria-labelledby="prepare-exercise" className="min-w-0 space-y-4"><div><h2 id="prepare-exercise" className="text-2xl font-semibold">Applied PREPARE exercise</h2><p className="text-sm text-muted-foreground">Complete every PREPARE objective, then make and save a safety decision. Scenarios are fictional training aids; use current official information for a real passage.</p></div>
    <div className="flex flex-wrap gap-2" aria-label="Choose coastal scenario">{prepareScenarios.map(item => <Button key={item.id} className="min-h-11 max-w-full whitespace-normal" variant={item.id === scenarioId ? "default" : "outline"} aria-pressed={item.id === scenarioId} onClick={() => { setScenarioId(item.id); setResponses([]); setDecision(undefined); setFeedback(""); }}>{item.title}</Button>)}</div>
    <Card className="forced-colors:border-[CanvasText]"><CardContent className="space-y-4 pt-6"><h3 className="text-xl font-bold">{scenario.title}</h3><p>{scenario.situation}</p><div role="img" aria-label={scenario.visualSummary} className="rounded-lg border-2 border-dashed p-4 text-sm forced-colors:border-[CanvasText]"><strong>Checklist route flow</strong><p>{scenario.visualSummary}</p></div>
      <div><div className="flex flex-wrap justify-between gap-2"><span id="prepare-progress-label" className="font-semibold">Objective progress</span><span>{objective} of {total}</span></div><Progress aria-labelledby="prepare-progress-label" aria-valuenow={total ? Math.round(objective / total * 100) : 0} value={total ? objective / total * 100 : 0} className="motion-reduce:[&>div]:transition-none forced-colors:border" /></div>
      {step < scenario.answers.length ? <fieldset className="space-y-2"><legend className="font-semibold">Step {step + 1} of {scenario.answers.length}: {scenario.stepPrompts[step]}</legend>{choices.map(choice => <Button key={choice} variant="outline" className="mr-2 h-auto min-h-11 whitespace-normal text-left forced-colors:border-[CanvasText]" onClick={() => chooseStep(choice)}>{choice}</Button>)}</fieldset> : <fieldset className="space-y-2"><legend className="font-semibold">Decision: go, delay, divert or abort?</legend><div className="flex flex-wrap gap-2">{decisions.map(item => <Button key={item} className="min-h-11 capitalize" aria-pressed={decision === item} variant={decision === item ? "default" : "outline"} onClick={() => chooseDecision(item)}>{item}</Button>)}</div></fieldset>}
      <p role="status" aria-live="polite" className="min-h-6">{feedback || `Complete objective ${Math.min(step + 1, total)} of ${total}.`}</p>
      <Button className="min-h-11" disabled={completed || saving || decision !== scenario.decision || responses.length !== scenario.answers.length} onClick={() => void finish()}>{completed ? "Completion saved" : saving ? "Saving…" : "Save evidence-based completion"}</Button>
      {(responses.length > 0 || decision) && <section aria-labelledby="prepare-artifact"><h4 id="prepare-artifact" className="font-bold">Reviewable decision record</h4><ol className="list-decimal pl-5">{responses.map((answer, index) => <li key={`${index}-${answer}`}><strong>{scenario.stepPrompts[index]}:</strong> {answer}</li>)}</ol>{decision && <p><strong>Decision:</strong> {decision}. {decision === scenario.decision ? scenario.decisionReason : "Reassessment required before completion."}</p>}</section>}
    </CardContent></Card><p className="text-xs text-muted-foreground">The route visual has equivalent structured text. Labels and words carry all meaning; completion does not depend on colour or motion.</p></section>;
}
