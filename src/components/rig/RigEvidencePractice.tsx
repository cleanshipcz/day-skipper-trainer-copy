import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

const locations = ["Wire beside its terminal", "Chainplate/deck interface", "Headsail sheet and lead", "Sail reefing patch"] as const;
const scenarios = [
  { prompt: "The lower wire has a broken strand beside the swage.", location: locations[0], decision: "No-sail; keep clear and refer under a competent securing/unloading plan", decisions: ["Tape the strand smooth and monitor it under sail", "No-sail; keep clear and refer under a competent securing/unloading plan", "Tension the stay until the broken strand closes"] },
  { prompt: "A fresh rust-coloured run appears where the chainplate enters the deck.", location: locations[1], decision: "Record as unresolved hidden-structure evidence and obtain assessment before sailing", decisions: ["Seal the deck entry because the visible plate is still straight", "Record as unresolved hidden-structure evidence and obtain assessment before sailing", "Tighten the accessible fasteners and treat movement as the only defect"] },
  { prompt: "The headsail sheet is glazed and deeply chafed where its changed lead crosses a stanchion.", location: locations[2], decision: "Depower; correct the specified lead and replace or assess the damaged line before loading", decisions: ["Depower; correct the specified lead and replace or assess the damaged line before loading", "Move the chafed section away from the stanchion and continue", "Use extra winch turns so the damaged cover carries less load"] },
] as const;

export const RigEvidencePractice = ({ onComplete }: { onComplete: () => void }) => {
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<string>("");
  const [locationCorrect, setLocationCorrect] = useState(false);
  const [decision, setDecision] = useState<string>("");
  const [feedback, setFeedback] = useState("");
  const scenario = scenarios[step];
  const done = step >= scenarios.length;
  const stepHeadingRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (step > 0) stepHeadingRef.current?.focus();
  }, [step]);

  if (done) return <div ref={stepHeadingRef} tabIndex={-1} className="rounded-lg border-2 border-success p-4 outline-none focus-visible:ring-2 focus-visible:ring-ring" role="status" aria-live="polite" aria-atomic="true"><strong>Evidence walk-round practice complete.</strong><p className="text-sm text-muted-foreground">You located and evaluated all three observations. Continue to the completion summary and Rig quiz link below. This practice is not evidence about a real vessel.</p></div>;
  const checkLocation = () => {
    if (!selected) { setFeedback("Choose the place where you would locate and identify the evidence first."); return; }
    if (selected !== scenario.location) { setFeedback("Not yet. Trace the observation to the named component and its attachment or lead; do not infer condition from a different area."); return; }
    setLocationCorrect(true); setFeedback("Correct location. Now decide what this evidence supports and what action is safe.");
  };
  const checkDecision = () => {
    if (!decision) { setFeedback("Choose a bounded interpretation and action before continuing."); return; }
    if (decision !== scenario.decision) { setFeedback("Not safe. Do not conceal, retension, tighten through, reposition, or load-test a defect as a substitute for assessment. Keep the system depowered and apply the stated stop boundary."); return; }
    setFeedback(`Correct decision. ${scenario.decision}.`);
  };
  const decisionCorrect = locationCorrect && decision === scenario.decision && feedback.startsWith("Correct decision");
  return <div className="min-w-0 rounded-lg border p-4 forced-colors:border-[CanvasText]" data-testid="rig-evidence-practice" aria-describedby="rig-practice-instructions">
    <h3 ref={stepHeadingRef} tabIndex={-1} className="text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring">Observation {step + 1} of {scenarios.length}</h3><p className="mt-2 break-words font-semibold">{scenario.prompt}</p>
    <fieldset className="mt-3"><legend className="text-sm">Where must you locate and evaluate the evidence?</legend><div className="mt-2 grid gap-2 sm:grid-cols-2">{locations.map((location) => <label key={location} className="flex min-h-11 min-w-0 items-center gap-2 rounded-md border p-3 forced-colors:border-[CanvasText]"><input className="size-5 shrink-0" type="radio" name={`evidence-${step}`} checked={selected === location} onChange={() => { setSelected(location); setLocationCorrect(false); setDecision(""); setFeedback(""); }}/><span className="min-w-0 break-words">{location}</span></label>)}</div></fieldset>
    {!locationCorrect && <Button className="mt-3" onClick={checkLocation}>Check location</Button>}
    {locationCorrect && <fieldset className="mt-4"><legend className="text-sm">What does this evidence require?</legend><div className="mt-2 grid gap-2">{scenario.decisions.map((option) => <label key={option} className="flex min-h-11 min-w-0 items-center gap-2 rounded-md border p-3 forced-colors:border-[CanvasText]"><input className="size-5 shrink-0" type="radio" name={`decision-${step}`} checked={decision === option} onChange={() => { setDecision(option); setFeedback(""); }}/><span className="min-w-0 break-words">{option}</span></label>)}</div></fieldset>}
    <div className="mt-3 flex flex-wrap items-center gap-3">{locationCorrect && <Button onClick={decisionCorrect ? () => { const next = step + 1; setStep(next); setSelected(""); setLocationCorrect(false); setDecision(""); setFeedback(""); if (next === scenarios.length) onComplete(); } : checkDecision}>{decisionCorrect ? "Next observation" : "Evaluate decision"}</Button>}<p role="status" aria-live="polite" aria-atomic="true" className="min-w-0 break-words text-sm">{feedback}</p></div>
  </div>;
};
