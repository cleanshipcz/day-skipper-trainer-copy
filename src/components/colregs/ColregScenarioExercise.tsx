import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export type ColregScenario = {
  id: string; title: string; rule: string; conditions: string; geometry: string;
  own: string; target: string; observation: string; risk: string;
  answers: readonly [string, string, string, string];
  distractors: readonly [readonly string[], readonly string[], readonly string[], readonly string[]];
};

// Scenario data is exported so its legal/geometry invariants can be tested directly.
// eslint-disable-next-line react-refresh/only-export-components
export const COLREG_SCENARIOS: readonly ColregScenario[] = [
  { id: "sailing", title: "Sailing vessels on the same tack", rule: "Rules 5, 7, 8, 12 and 17", conditions: "Daylight, clear visibility, open water", geometry: "Target 045° relative, 0.7 NM, steady bearing; both steering 000°", own: "Sailing vessel, wind from port, leeward", target: "Sailing vessel, wind from port, windward", observation: "Repeated bearings remain 045° while range closes.", risk: "Risk exists: steady bearing and decreasing range.", answers: ["Sailing encounter, same side of wind", "Target is windward and must keep out of the way; we continue the assessment", "Initially maintain course and speed; may act when target's failure becomes apparent and must act when her action alone cannot avoid collision", "Monitor bearing, range and target action; use the Rule 17 escalation if needed and continue until finally past and clear"], distractors: [["Head-on power-driven encounter", "Insufficient information: stop observing"], ["We must give way because target is to starboard", "Neither vessel has responsibilities"], ["Make several small alterations", "Alter to port immediately"], ["Stop monitoring once target turns", "Assume passing distance is safe"]] },
  { id: "overtaking", title: "Overtaking from abaft the beam", rule: "Rules 5, 7, 8 and 13", conditions: "Night, clear visibility, open water", geometry: "We approach target from 150° relative to her heading, 0.5 NM, course 020° versus 015°", own: "Power-driven vessel, 9 kn", target: "Power-driven vessel, 5 kn; sternlight aspect", observation: "Only her stern aspect is visible and range is decreasing.", risk: "Risk exists; if in doubt, treat as overtaking.", answers: ["Overtaking", "We are overtaking and must keep out of the way", "Take early, substantial action for a safe passing distance", "Remain clear until finally past and clear"], distractors: [["Crossing", "No risk because courses differ"], ["Target must keep out of our way", "Responsibilities switch once abeam"], ["Hold course regardless of CPA", "Pass close to reduce time"], ["Duty ends when abeam", "Resume before checking clearance"]] },
  { id: "head-on", title: "Nearly reciprocal power-driven courses", rule: "Rules 5, 7, 8 and 14", conditions: "Daylight, vessels in sight, open water", geometry: "Target dead ahead, 1.2 NM, steady bearing; courses 090° and 272°", own: "Power-driven vessel, 7 kn", target: "Power-driven vessel, 8 kn", observation: "Ahead aspect, reciprocal courses, closing range.", risk: "Risk exists; doubt means assume head-on.", answers: ["Head-on", "Both vessels must alter to starboard", "Make an early, substantial starboard alteration for port-to-port passing", "Verify the other alteration and safe passing until past and clear"], distractors: [["Crossing", "No risk until under 0.5 NM"], ["Only the smaller vessel gives way", "We are stand-on"], ["Alter to port", "Wait for the other vessel"], ["Return immediately after altering", "Monitor visually only once"]] },
  { id: "crossing", title: "Crossing with target to starboard", rule: "Rules 5, 7, 8, 15 and 16", conditions: "Daylight, vessels in sight, open water", geometry: "Target 060° relative, 0.9 NM, steady bearing; own 000°, target 270°", own: "Power-driven vessel, 6 kn", target: "Power-driven vessel, 7 kn", observation: "Target remains on starboard bow while range closes.", risk: "Risk exists from systematic observation.", answers: ["Crossing", "We are give-way because the target is on our starboard side", "Take early, substantial action; if circumstances admit avoid crossing ahead", "Check CPA trend and continue until finally past and clear"], distractors: [["Overtaking", "Head-on"], ["We are stand-on", "The faster vessel gives way"], ["Alter to port across her bow", "Maintain course without contingency"], ["One bearing is sufficient", "Stop observing after action"]] },
  { id: "channel", title: "Narrow channel and traffic lane", rule: "Rules 5, 7, 8, 9 and 10", conditions: "Clear visibility; marked narrow channel adjoining a TSS", geometry: "Deep-draught power vessel astern at 0.8 NM in channel; our intended crossing is 30° to lane flow", own: "Sailing vessel under 20 m", target: "Power-driven vessel constrained to channel, following traffic lane", observation: "Target closes along the channel; proposed crossing would delay her.", risk: "Impeding risk exists even before collision risk develops.", answers: ["Channel/TSS duties control", "We must not impede the channel-bound lane-following vessel", "Wait clear; if obliged to cross a TSS, use a heading as nearly right angles as practicable", "Monitor traffic and do not enter until the passage remains clear"], distractors: [["Ordinary crossing only", "Sailing vessel always stands on"], ["Target must avoid us", "Rule 18 removes Rule 9 duties"], ["Cross diagonally for a shorter turn", "Anchor in the channel"], ["Check only the chart", "Proceed when bearing changes once"]] },
  { id: "fog", title: "Radar contact in restricted visibility", rule: "Rules 5–10 and 19", conditions: "Dense fog; vessels not in sight", geometry: "Radar target 020° relative, 1.5 NM, decreasing range and near-steady bearing", own: "Power-driven vessel, engines ready", target: "Unknown vessel detected by radar alone, forward of beam", observation: "Plot indicates close quarters may develop; target type/status is unknown.", risk: "Insufficient information to say no risk; continue systematic plotting and deem risk if in doubt.", answers: ["Restricted visibility, not an in-sight crossing classification", "No stand-on/give-way claim; apply Rule 19 with Rules 5–10", "Act in ample time; if altering, so far as possible avoid port for this forward contact", "Continue radar/aural watch; reduce further and navigate with extreme caution if required"], distractors: [["Head-on confirmed", "No risk because target is unseen"], ["We are stand-on", "Target is definitely sailing"], ["Alter to port", "Maintain speed until visual"], ["Stop plotting after one alteration", "Assume target has detected us"]] },
];

const STEPS = ["Classify", "Responsibilities", "Action", "Monitor"] as const;
const RELATIVE_BEARINGS: Readonly<Record<string, number>> = { sailing: 45, overtaking: 0, "head-on": 0, crossing: 60, channel: 180, fog: 20 };

export function ColregScenarioExercise({ onScenarioCompleted }: { onScenarioCompleted?: (scenarioId: string) => void }) {
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [step, setStep] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const decisionRef = useRef<HTMLFieldSetElement>(null);
  const previousStage = useRef({ scenarioIndex, step });
  const scenario = COLREG_SCENARIOS[scenarioIndex];
  const unrotatedChoices = [scenario.answers[step], ...scenario.distractors[step]];
  const choiceOffset = (scenarioIndex + step) % unrotatedChoices.length;
  const choices = [...unrotatedChoices.slice(choiceOffset), ...unrotatedChoices.slice(0, choiceOffset)];
  const bearingRadians = RELATIVE_BEARINGS[scenario.id] * Math.PI / 180;
  const targetX = 300 + Math.sin(bearingRadians) * 105;
  const targetY = 190 - Math.cos(bearingRadians) * 105;
  useEffect(() => {
    const changed = previousStage.current.scenarioIndex !== scenarioIndex || previousStage.current.step !== step;
    previousStage.current = { scenarioIndex, step };
    if (changed) decisionRef.current?.focus();
  }, [scenarioIndex, step]);
  const choose = (choice: string) => {
    if (choice === scenario.answers[step]) {
      setFeedback(`Correct. ${choice}`);
      if (step < 3) setStep(step + 1); else onScenarioCompleted?.(scenario.id);
    } else setFeedback(`Not yet. Recheck ${scenario.rule}: use the stated observations and do not assume facts that are missing.`);
  };
  const next = () => { setScenarioIndex((scenarioIndex + 1) % COLREG_SCENARIOS.length); setStep(0); setFeedback(null); };
  return <section aria-labelledby="applied-colregs" className="space-y-4">
    <div><h2 id="applied-colregs" className="text-2xl font-semibold">Applied encounter exercises</h2><p className="text-sm text-muted-foreground">Observe → classify → assign responsibilities → act → monitor until finally past and clear. If in doubt, deem risk to exist; scanty information never proves no risk.</p></div>
    <div className="flex flex-wrap gap-2" aria-label="Choose scenario">{COLREG_SCENARIOS.map((item, index) => <Button key={item.id} variant={index === scenarioIndex ? "default" : "outline"} onClick={() => { setScenarioIndex(index); setStep(0); setFeedback(null); }}>{index + 1}. {item.title}</Button>)}</div>
    <Card><CardContent className="pt-6 space-y-5">
      <div className="grid lg:grid-cols-2 gap-5">
        <svg viewBox="0 0 600 300" role="img" aria-labelledby={`scene-title-${scenario.id} scene-desc-${scenario.id}`} className="w-full rounded-lg border bg-slate-950 text-white">
          <title id={`scene-title-${scenario.id}`}>{scenario.title}</title><desc id={`scene-desc-${scenario.id}`}>{scenario.conditions}. Own vessel: {scenario.own}. Target: {scenario.target}. Geometry: {scenario.geometry}. {scenario.observation}</desc>
          <path d="M300 210 L280 245 L320 245 Z" fill="none" stroke="currentColor" strokeWidth="5"/><text x="330" y="235" fill="currentColor" fontSize="18">OWN: heading ↑</text>
          <g transform={`translate(${targetX} ${targetY})`}><circle r="24" fill="none" stroke="currentColor" strokeWidth="5"/><text x="30" y="6" fill="currentColor" fontSize="18">TARGET</text></g>
          <path d={`M300 190 L${targetX} ${targetY}`} stroke="currentColor" strokeDasharray="10 8" strokeWidth="3"/><text x="25" y="35" fill="currentColor" fontSize="17">{scenario.geometry}</text><text x="25" y="65" fill="currentColor" fontSize="16">Relative position is schematic; labels state exact geometry.</text>
        </svg>
        <div className="space-y-2 text-sm"><h3 className="text-lg font-bold">{scenario.title}</h3><p><strong>Conditions:</strong> {scenario.conditions}</p><p><strong>Own vessel:</strong> {scenario.own}</p><p><strong>Target:</strong> {scenario.target}</p><p><strong>Relative geometry:</strong> {scenario.geometry}</p><p><strong>Observation:</strong> {scenario.observation}</p><p><strong>Risk assessment:</strong> {scenario.risk}</p><p><strong>Applicable basis:</strong> {scenario.rule}</p></div>
      </div>
      <ol className="grid grid-cols-2 md:grid-cols-4 gap-2" aria-label="Decision workflow">{STEPS.map((label, index) => <li key={label} className={`rounded border p-2 text-center text-sm ${index === step ? "font-bold ring-2 ring-primary" : ""}`} aria-current={index === step ? "step" : undefined}>{index + 1}. {label}</li>)}</ol>
      <fieldset ref={decisionRef} tabIndex={-1} className="space-y-2 outline-none focus-visible:ring-2 focus-visible:ring-primary"><legend className="font-semibold">{STEPS[step]}: choose the best assessment</legend><div className="grid sm:grid-cols-2 gap-2">{choices.map(choice => <Button key={choice} variant="outline" className="h-auto min-h-11 whitespace-normal text-left justify-start" onClick={() => choose(choice)}>{choice}</Button>)}</div></fieldset>
      <div aria-live="polite" className="min-h-6 text-sm font-medium">{feedback}</div>
      {step === 3 && feedback?.startsWith("Correct") && <Button onClick={next}>Next scenario</Button>}
    </CardContent></Card>
    <p className="text-xs text-muted-foreground">Static geometry is intentionally labelled and has an equivalent text description. Controls are native buttons for keyboard, touch and assistive technology. State changes do not depend on animation and respect reduced-motion preferences.</p>
  </section>;
}
