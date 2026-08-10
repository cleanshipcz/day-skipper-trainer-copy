import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

type Scenario = {
  id: string;
  title: string;
  situation: string;
  visual: { left: string; middle: string; right: string; caption: string };
  question: string;
  options: readonly string[];
  correct: number;
  explanation: string;
};

// Exported for focused safety-content and accessibility regression tests.
// eslint-disable-next-line react-refresh/only-export-components
export const fogScenarios: readonly Scenario[] = [
  { id: "forecast-recognition", title: "Recognise a developing fog risk", situation: "At 0630 the Inshore Waters Forecast says ‘fog patches, very poor at times’. Air/dew point is 12/11 °C, sea temperature 10 °C and a light onshore wind crosses the planned harbour approach.", visual: { left: "12 °C air", middle: "11 °C dew point", right: "10 °C sea", caption: "Moist air is close to saturation and is moving over colder water toward the approach." }, question: "What is the defensible departure decision?", options: ["Depart because the visibility term is only a forecast", "Delay and obtain a later observation and harbour report before committing", "Rely on sunrise to clear the fog", "Depart if AIS shows no targets"], correct: 1, explanation: "Correct. The forecast, one-degree spread, colder sea and onshore flow reinforce an advection-fog risk. A later observation and local report test that risk before escape options narrow." },
  { id: "visibility-loss", title: "Respond to sudden visibility loss", situation: "Visibility collapses near a headland before a busy approach. The yacht is still making passage speed and the crew are below.", visual: { left: "Headland 0.7 NM", middle: "Visibility falling", right: "Traffic ahead", caption: "The yacht has sea room now, but the headland and traffic approach are closing the available margin." }, question: "Which immediate sequence best preserves control?", options: ["Continue to the waypoint while calling the marina", "Slow to a safe speed, call crew, post a lookout, hand steer, show lights and sound the correct signal, then fix position and reassess", "Turn sharply offshore before checking contacts", "Keep speed so radar targets have steadier vectors"], correct: 1, explanation: "Correct. Control speed and heading first, establish lookout and readiness, comply with lights and sound signals, then use position, depth and contacts to execute a pre-briefed safe option." },
  { id: "radar-ais-limits", title: "Use radar and AIS without overconfidence", situation: "Rain clutter obscures the inner radar ranges. AIS shows one ship, while an intermittent weak echo appears two points on the bow with no AIS symbol.", visual: { left: "Rain clutter", middle: "Weak echo", right: "No AIS match", caption: "The radar shows rain clutter and an intermittent echo; the AIS display shows one separate ship and no symbol matching the echo." }, question: "How should the weak contact be assessed?", options: ["Ignore it because it has no AIS identity", "Use the ship’s AIS vector as a substitute", "Change range and clutter settings, acquire repeated observations, maintain sight-and-hearing lookout and treat doubt as risk", "Wait for one stable ARPA vector before slowing"], correct: 2, explanation: "Correct. Small craft may lack AIS and may be weak in rain or sea clutter. Repeated radar observations and the full lookout establish movement; scanty information cannot dismiss collision risk." },
  { id: "sound-signal", title: "Interpret a signal ahead", situation: "In dense fog you hear one prolonged blast apparently forward of the beam. It repeats within two minutes. No reliable radar or AIS contact is available.", visual: { left: "— prolonged", middle: "Ahead", right: "No contact", caption: "A power-driven vessel making way may be ahead, but sound direction and distance are uncertain in fog." }, question: "What does the signal require from your yacht?", options: ["It establishes that the other vessel must give way", "Unless satisfied no risk exists, reduce to minimum steerage speed, take all way off if necessary and navigate with extreme caution", "Answer with one short blast and maintain course", "Alter to port to pass starboard-to-starboard"], correct: 1, explanation: "Correct. The signal describes status, not right of way. Rule 19 requires the cautious speed response when a fog signal is heard apparently forward of the beam unless collision risk is ruled out." },
  { id: "rule-19-risk", title: "Make a Rule 19 collision-risk decision", situation: "A radar contact 20° on the starboard bow is not in sight. Three observations show steady bearing and decreasing range; close quarters are developing.", visual: { left: "Bearing steady", middle: "Range decreasing", right: "Forward of beam", caption: "Three plots place the unseen contact forward of the beam at the same bearing and successively shorter ranges." }, question: "Which action follows Rule 19?", options: ["Treat yourself as stand-on under the crossing rule", "Wait for sidelights before deciding", "Act early and substantially; avoid a port alteration for this forward contact, consider speed reduction, then keep plotting until past and clear", "Make several small alterations to make ARPA recalculate"], correct: 2, explanation: "Correct. In-sight crossing rules do not classify this encounter. Timely action is required; avoid port for a contact forward of the beam (unless overtaking), and verify the result continuously." },
] as const;

export const FogScenarioPractice = ({ completedIds, enabled, onComplete }: { completedIds: readonly string[]; enabled: boolean; onComplete: (id: string) => void }) => {
  const firstIncomplete = Math.max(0, fogScenarios.findIndex((scenario) => !completedIds.includes(scenario.id)));
  const [index, setIndex] = useState(firstIncomplete === -1 ? fogScenarios.length - 1 : firstIncomplete);
  const [selected, setSelected] = useState<number | null>(null);
  const [feedback, setFeedback] = useState("");
  const [answered, setAnswered] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const scenario = fogScenarios[index];
  const complete = completedIds.includes(scenario.id);
  useEffect(() => { setSelected(null); setFeedback(""); setAnswered(false); }, [index]);
  const check = () => {
    if (selected === null) { setFeedback("Choose an action before checking your decision."); return; }
    setAnswered(true);
    if (selected === scenario.correct) { setFeedback(scenario.explanation); if (!complete) onComplete(scenario.id); }
    else setFeedback(`Not yet. ${scenario.explanation.replace("Correct. ", "Review: ")}`);
  };
  const move = (next: number) => { setIndex(next); requestAnimationFrame(() => headingRef.current?.focus()); };
  return <section aria-labelledby="fog-practice-heading" className="min-w-0 space-y-4 rounded-lg border p-4 sm:p-6 forced-colors:border-[CanvasText]">
    <div><h2 id="fog-practice-heading" className="text-xl font-semibold">Fog decision scenarios</h2><p className="text-sm text-muted-foreground">Complete all five operational decisions. Wrong answers stay available for review and retry; progress is saved after each correct decision.</p></div>
    <div className="flex flex-wrap gap-2" aria-label="Scenario progress">{fogScenarios.map((item, itemIndex) => <Button key={item.id} type="button" variant={itemIndex === index ? "default" : "outline"} className="h-auto min-h-11 whitespace-normal" aria-current={itemIndex === index ? "step" : undefined} onClick={() => move(itemIndex)}>Scenario {itemIndex + 1}{completedIds.includes(item.id) ? " — complete" : ""}</Button>)}</div>
    <article className="min-w-0 space-y-4 rounded-md bg-muted/40 p-3 sm:p-5">
      <h3 ref={headingRef} tabIndex={-1} className="text-lg font-semibold outline-none focus-visible:ring-2 focus-visible:ring-ring">{index + 1}. {scenario.title}</h3>
      <p>{scenario.situation}</p>
      <figure className="overflow-hidden rounded-md border bg-background p-3 forced-colors:border-[CanvasText]">
        <svg viewBox="0 0 720 150" role="img" aria-labelledby={`fog-visual-${scenario.id} fog-caption-${scenario.id}`} className="h-auto w-full text-foreground">
          <title id={`fog-visual-${scenario.id}`}>Operational situation diagram</title>
          <path d="M40 90 H680" stroke="currentColor" strokeWidth="3" strokeDasharray="10 8" opacity=".55" />
          {[scenario.visual.left, scenario.visual.middle, scenario.visual.right].map((label, i) => <g key={label} transform={`translate(${70 + i * 240} 35)`}><circle cx="55" cy="55" r="42" fill="none" stroke="currentColor" strokeWidth="3" /><text x="55" y="51" textAnchor="middle" className="fill-current text-[15px] font-semibold"><tspan x="55">{label.split(" ").slice(0, 2).join(" ")}</tspan><tspan x="55" dy="19">{label.split(" ").slice(2).join(" ")}</tspan></text></g>)}
        </svg>
        <figcaption id={`fog-caption-${scenario.id}`} className="mt-2 text-sm text-muted-foreground"><span className="font-medium text-foreground">Diagram meaning: </span>{scenario.visual.caption}</figcaption>
      </figure>
      <fieldset disabled={!enabled || complete}><legend className="font-medium">{scenario.question}</legend><div className="mt-2 grid min-w-0 gap-2">{scenario.options.map((option, optionIndex) => <label key={option} className="flex min-h-11 min-w-0 cursor-pointer items-start gap-3 rounded-md border bg-background p-3 forced-colors:border-[CanvasText]"><input type="radio" name={`fog-${scenario.id}`} className="mt-0.5 size-5 shrink-0" checked={selected === optionIndex} onChange={() => { setSelected(optionIndex); setFeedback(""); setAnswered(false); }} /><span className="min-w-0 break-words">{option}</span></label>)}</div></fieldset>
      {complete ? <p role="status" className="rounded-md border border-success p-3">Scenario complete. {scenario.explanation}</p> : <><Button type="button" className="h-auto min-h-11 whitespace-normal" disabled={!enabled} onClick={check}>{answered ? "Check again" : "Check decision"}</Button>{feedback && <div role={answered && selected !== scenario.correct ? "alert" : "status"} className="rounded-md border p-3"><p>{feedback}</p>{answered && selected !== scenario.correct && <Button type="button" variant="outline" className="mt-2" onClick={() => { setSelected(null); setAnswered(false); setFeedback("Review the scenario and choose a different action."); }}>Retry scenario</Button>}</div>}</>}
      <div className="flex flex-col gap-2 sm:flex-row sm:justify-between"><Button type="button" variant="outline" className="min-h-11" disabled={index === 0} onClick={() => move(index - 1)}>Previous scenario</Button><Button type="button" variant="outline" className="min-h-11" disabled={index === fogScenarios.length - 1} onClick={() => move(index + 1)}>Next scenario</Button></div>
    </article>
  </section>;
};
