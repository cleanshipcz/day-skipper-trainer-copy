import { useId, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { isCurrentPersonalSafetyMastery, PERSONAL_SAFETY_CHECK_REVISION, type PersonalSafetyMastery } from "./personalSafetyMastery";

type Answer = { id: string; label: string; correct?: boolean; feedback: string };
type Scenario = { id: string; title: string; prompt: string; answers: Answer[] };

const scenarios: Scenario[] = [
  { id: "pfd", title: "Choose the PFD", prompt: "A crew member in waterproof clothing will sail offshore in rough weather. What is the safest selection process?", answers: [
    { id: "number", label: "Choose any 275 N lifejacket; the largest number guarantees self-righting.", feedback: "Not safe. Buoyancy level alone does not guarantee turning performance for every wearer, clothing load or carried equipment." },
    { id: "matched", label: "Select a lifejacket whose manufacturer states it suits the conditions, wearer, clothing and equipment; then confirm fit.", correct: true, feedback: "Correct. Selection combines the intended conditions and product performance with wearer-specific fit and loading." },
    { id: "aid", label: "Use a Level 50 buoyancy aid because it is easier to work in offshore.", feedback: "Not safe. Level 50 aids are for competent swimmers close to help in sheltered water, not this offshore scenario." },
  ]},
  { id: "fit", title: "Fit and inspect", prompt: "Before departure, which check is complete?", answers: [
    { id: "visual", label: "Check that the cover looks clean and assume the sealed mechanism is ready.", feedback: "Incomplete. Appearance alone does not confirm the cylinder, firing head, indicators, bladder or straps are serviceable." },
    { id: "full", label: "Follow the model instructions: check condition, cylinder/mechanism and indicators, secure fit and provided crotch strap, and respect service dates.", correct: true, feedback: "Correct. Use the product-specific instructions and confirm both serviceability and fit before relying on it." },
    { id: "inflate", label: "Orally inflate it while wearing it, then fit the cylinder.", feedback: "Not safe. Do not improvise a test while wearing the lifejacket; follow its manufacturer-approved inspection and servicing procedure." },
  ]},
  { id: "tether", title: "Tether and jackline", prompt: "The deck is wet and conditions are worsening. What should the skipper decide?", answers: [
    { id: "late", label: "Wait until someone loses balance, then clip their tether to the guardrail.", feedback: "Too late and the attachment may be unsuitable. Clip on before exposure and only to strong, intended attachment points." },
    { id: "safe", label: "Rig and inspect jacklines early, choose a tether/attachment plan that keeps crew aboard, and minimise slack and transfer exposure.", correct: true, feedback: "Correct. Plan the route and attachment before conditions deteriorate; jacklines and strong points must suit the expected loads." },
    { id: "free", label: "Use the longest tether available so the wearer can reach every part of the deck.", feedback: "Not safe. Excess reach may allow a person over the side; use the arrangement that restricts the fall while allowing the task." },
  ]},
  { id: "kill-cord", title: "Kill cord", prompt: "Before operating a powered tender, what is the correct routine?", answers: [
    { id: "wheel", label: "Loop the cord around the steering wheel so it cannot restrict movement.", feedback: "Not safe. Attach it to the operator at the manufacturer-specified point, not to the controls or craft." },
    { id: "operator", label: "Test the cut-off system as instructed, attach the serviceable cord to the operator at the specified point, and carry the correct spare.", correct: true, feedback: "Correct. Reattach it whenever the operator changes; it should stop the engine if the operator is thrown clear, reducing risk rather than guaranteeing safety." },
    { id: "pocket", label: "Keep it in a pocket and pull it manually after an emergency begins.", feedback: "Not safe. The system depends on the cord already being attached while the engine is operated." },
  ]},
  { id: "beacon", title: "Personal beacon", prompt: "A coastal yacht carries AIS displays and compatible DSC radio, but the crew may also sail remotely. How should personal alerting equipment be selected and fitted?", answers: [
    { id: "ais-all", label: "Choose any AIS-MOB; the name guarantees GNSS, DSC, satellite alerting, and automatic safe deployment on every lifejacket.", feedback: "Not safe. Capabilities and compatibility are model-specific, AIS-MOB is not a 406 MHz satellite PLB, and installation must be approved for the lifejacket." },
    { id: "fit", label: "Match PLB and/or AIS-MOB alert paths and stated GNSS/AIS/DSC capabilities to the activity, vessel, receivers and rescue plan; register or program, test and fit each exactly as approved.", correct: true, feedback: "Correct. Also check battery and service expiry, and verify the installation cannot impair inflation or obscure other emergency features." },
    { id: "plb-display", label: "Choose any PLB because every PLB automatically appears as an AIS target on the yacht's display.", feedback: "Not safe. A 406 MHz GNSS PLB alerts search and rescue through satellites; it does not inherently transmit an AIS-MOB target." },
  ]},
];

const SafetyDiagram = () => (
  <figure className="min-w-0 rounded-lg border bg-muted/30 p-3 forced-colors:border-[CanvasText]">
    <svg viewBox="0 0 640 210" role="img" aria-labelledby="personal-safety-diagram-title personal-safety-diagram-desc" className="h-auto w-full max-w-full">
      <title id="personal-safety-diagram-title">Personal safety equipment decision sequence</title>
      <desc id="personal-safety-diagram-desc">Four illustrated panels show selecting and fitting a lifejacket, inspecting its mechanism and straps, clipping a short tether to a deck jackline, and attaching a kill cord to the helm operator; the caption adds the personal-beacon decision.</desc>
      <g fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M25 180h125M185 180h125M345 180h125M505 180h110" />
        <path d="M65 58c20-17 42-17 62 0l-8 75H73zM85 58l11 25 11-25M96 83v70" />
        <circle cx="245" cy="57" r="23"/><path d="M245 80v65M215 102h60M222 145l23-65 23 65"/><circle cx="277" cy="106" r="8" />
        <path d="M360 155h100M370 145V92h80v53M370 105l80 25M400 62v71M400 62l35 15"/><circle cx="400" cy="48" r="13"/>
        <path d="M525 150h80l-12-42h-55zM550 108V65M550 65h35M550 78c28 0 30 37 8 39"/><circle cx="535" cy="52" r="13"/><path d="M535 65v58M535 82l15 20" />
      </g>
    </svg>
    <figcaption className="mt-3 text-sm text-muted-foreground">
      <span>A practical sequence:</span>
      <ol className="mt-2 grid min-w-0 list-decimal gap-2 pl-5 sm:grid-cols-2 lg:grid-cols-5">
        <li className="break-words">Select and fit the right PFD.</li>
        <li className="break-words">Inspect its serviceable parts.</li>
        <li className="break-words">Clip on early to suitable points.</li>
        <li className="break-words">Attach the kill cord before starting.</li>
        <li className="break-words">Match and check the personal alert path.</li>
      </ol>
    </figcaption>
  </figure>
);

export function PersonalSafetyCheck({ onMastery, initialEvidence = null }: { onMastery: (evidence: PersonalSafetyMastery | null) => void; initialEvidence?: PersonalSafetyMastery | null }) {
  const groupPrefix = useId();
  const masteryEmitted = useRef(false);
  const restored = isCurrentPersonalSafetyMastery(initialEvidence);
  const [answers, setAnswers] = useState<Record<string, string>>(() => restored ? Object.fromEntries(scenarios.map((scenario) => [scenario.id, scenario.answers.find((answer) => answer.correct)!.id])) : {});
  const [submitted, setSubmitted] = useState<Record<string, boolean>>(() => restored ? Object.fromEntries(scenarios.map((scenario) => [scenario.id, true])) : {});
  masteryEmitted.current = masteryEmitted.current || restored;
  const mastered = scenarios.filter((scenario) => scenario.answers.find((answer) => answer.id === answers[scenario.id])?.correct && submitted[scenario.id]).map((scenario) => scenario.id);

  const check = (scenario: Scenario) => {
    if (!answers[scenario.id]) return;
    const next = { ...submitted, [scenario.id]: true };
    setSubmitted(next);
    const complete = scenarios.every((item) => item.answers.find((answer) => answer.id === answers[item.id])?.correct && next[item.id]);
    if (complete && !masteryEmitted.current) {
      masteryEmitted.current = true;
      onMastery({ revision: PERSONAL_SAFETY_CHECK_REVISION, masteredScenarioIds: scenarios.map(({ id }) => id) });
    }
  };
  const reset = () => { masteryEmitted.current = false; setAnswers({}); setSubmitted({}); onMastery(null); };

  return <section aria-labelledby="personal-safety-check-heading" className="space-y-4">
    <div><h2 id="personal-safety-check-heading" className="text-2xl font-bold">Practical personal safety check</h2><p className="text-muted-foreground">Answer every scenario correctly. Incorrect choices stay available to correct; attempts do not affect your score.</p></div>
    <SafetyDiagram />
    <div className="grid min-w-0 gap-4 md:grid-cols-2">
      {scenarios.map((scenario, index) => {
        const selected = scenario.answers.find((answer) => answer.id === answers[scenario.id]);
        const settled = Boolean(submitted[scenario.id]);
        return <Card key={scenario.id} className="min-w-0 forced-colors:border-[CanvasText]"><CardHeader><CardTitle className="break-words text-lg">{index + 1}. {scenario.title}</CardTitle></CardHeader><CardContent className="min-w-0 space-y-3">
          <fieldset className="min-w-0 space-y-2"><legend className="break-words font-medium">{scenario.prompt}</legend>
            {scenario.answers.map((answer) => <label key={answer.id} className="flex min-h-11 min-w-0 cursor-pointer items-start gap-3 rounded-md border p-3 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring forced-colors:border-[CanvasText]"><input type="radio" className="mt-0.5 size-5 shrink-0" name={`${groupPrefix}-${scenario.id}`} value={answer.id} checked={answers[scenario.id] === answer.id} onChange={() => {
              if (masteryEmitted.current) { masteryEmitted.current = false; onMastery(null); }
              setAnswers((current) => ({ ...current, [scenario.id]: answer.id }));
              setSubmitted((current) => ({ ...current, [scenario.id]: false }));
            }} /><span className="min-w-0 break-words">{answer.label}</span></label>)}
          </fieldset>
          <Button type="button" variant="outline" className="h-auto min-h-11 whitespace-normal" disabled={!answers[scenario.id]} onClick={() => check(scenario)}>Check {scenario.title.toLowerCase()}</Button>
          {settled && selected && <p role={selected.correct ? "status" : "alert"} aria-live="polite" className={`break-words rounded-md border p-3 text-sm forced-colors:text-[CanvasText] ${selected.correct ? "border-emerald-600 text-emerald-700" : "border-destructive text-destructive"}`}>{selected.feedback}</p>}
        </CardContent></Card>;
      })}
    </div>
    <div className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between forced-colors:border-[CanvasText]"><p role="status" aria-live="polite" aria-atomic="true"><strong>{mastered.length} of {scenarios.length}</strong> safety decisions mastered.{mastered.length === scenarios.length ? " Practical mastery achieved; lesson completion is unlocked." : " Correct every decision to unlock lesson completion."}</p><Button type="button" variant="outline" className="min-h-11 shrink-0" onClick={reset}>Reset practical check</Button></div>
  </section>;
}
