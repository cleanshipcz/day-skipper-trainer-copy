import { useState } from "react";
import { Button } from "@/components/ui/button";

const locations = ["Wire beside its terminal", "Chainplate/deck interface", "Headsail sheet and lead", "Sail reefing patch"] as const;
const scenarios = [
  { prompt: "The lower wire has a broken strand beside the swage.", location: locations[0], action: "No-sail: keep clear of the sharp, loaded stay; secure/unload only to a competent plan and refer it." },
  { prompt: "A fresh rust-coloured run appears where the chainplate enters the deck.", location: locations[1], action: "Unresolved structural evidence: record it, do not simply tighten or seal it, and obtain competent assessment before sailing." },
  { prompt: "The headsail sheet is glazed and deeply chafed where its changed lead crosses a stanchion.", location: locations[2], action: "Depower and replace or correct the specified lead before loading; also investigate why the lead changed." },
] as const;

export const RigEvidencePractice = ({ onComplete }: { onComplete: () => void }) => {
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<string>("");
  const [feedback, setFeedback] = useState("");
  const scenario = scenarios[step];
  const done = step >= scenarios.length;

  if (done) return <div className="rounded-lg border-2 border-success p-4" role="status"><strong>Evidence walk-round practice complete.</strong><p className="text-sm text-muted-foreground">You located and evaluated all three observations. This practice is not evidence about a real vessel.</p></div>;
  const check = () => {
    if (!selected) { setFeedback("Choose the place where you would locate and identify the evidence first."); return; }
    if (selected !== scenario.location) { setFeedback("Not yet. Trace the observation to the named component and its attachment or lead; do not infer condition from a different area."); return; }
    setFeedback(`Correct location. ${scenario.action}`);
  };
  const correct = selected === scenario.location && feedback.startsWith("Correct");
  return <div className="rounded-lg border p-4" data-testid="rig-evidence-practice">
    <p className="text-sm font-medium">Observation {step + 1} of {scenarios.length}</p><p className="mt-2 font-semibold">{scenario.prompt}</p>
    <fieldset className="mt-3"><legend className="text-sm">Where must you locate and evaluate the evidence?</legend><div className="mt-2 grid gap-2 sm:grid-cols-2">{locations.map((location) => <label key={location} className="flex min-h-11 items-center gap-2 rounded-md border p-3"><input type="radio" name={`evidence-${step}`} checked={selected === location} onChange={() => { setSelected(location); setFeedback(""); }}/>{location}</label>)}</div></fieldset>
    <div className="mt-3 flex items-center gap-3"><Button onClick={correct ? () => { const next = step + 1; setStep(next); setSelected(""); setFeedback(""); if (next === scenarios.length) onComplete(); } : check}>{correct ? "Next observation" : "Evaluate evidence"}</Button><p aria-live="polite" className="text-sm">{feedback}</p></div>
  </div>;
};

