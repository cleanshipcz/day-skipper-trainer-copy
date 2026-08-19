import { useEffect, useId, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GAS_SAFETY_CRITICAL_SCENARIOS, GAS_SAFETY_MASTERY_REVISION, type GasSafetyMastery, type GasSafetyScenarioId } from "./gasSafetyMastery";
type Choice = {
  id: string;
  label: string;
  correct?: boolean;
  feedback: string;
};
type Scenario = {
  id: GasSafetyScenarioId;
  title: string;
  prompt: string;
  choices: Choice[];
};
const scenarios: Scenario[] = [
  {
    id: "lpg-leak",
    title: "Gas smell or leak warning",
    prompt: "You enter a closed-up boat and smell gas. What is the safest response?",
    choices: [
      {
        id: "switch",
        label: "Turn on the electric bilge blower, then search for the leak.",
        feedback: "Not safe. Operating an electrical switch or fan may create an ignition source. Do not search for the leak yourself.",
      },
      {
        id: "response",
        label: "Operate no electrical switches. If safely reachable, isolate LPG and extinguish flames; evacuate, ventilate naturally from outside, raise the alarm and keep the system out of use for competent testing.",
        correct: true,
        feedback: "Correct. This avoids creating an ignition source and keeps people clear while natural ventilation and competent help address the suspected leak.",
      },
      {
        id: "cylinder",
        label: "Disconnect the cylinder and carry it through the accommodation.",
        feedback: "Not safe. Do not handle or move a cylinder whose leak cannot be stopped safely. Withdraw, keep others away and summon emergency help.",
      },
    ],
  },
  {
    id: "co-alarm",
    title: "Carbon-monoxide alarm",
    prompt: "The CO alarm sounds while crew are below. What should you do?",
    choices: [
      {
        id: "silence",
        label: "Silence it and wait below to see whether it alarms again.",
        feedback: "Not safe. CO cannot be assessed by smell and may incapacitate people. Treat the alarm as real.",
      },
      {
        id: "response",
        label: "Get everyone into fresh air; stop sources only if safe, call emergency services and seek urgent medical advice. Do not re-enter until responders say it is safe; oxygen is only for trained, equipped responders.",
        correct: true,
        feedback: "Correct. Fresh air and urgent medical or emergency advice come first; an alarm is not an appliance troubleshooting exercise.",
      },
      {
        id: "window",
        label: "Open one window and continue using the cooker while watching the alarm.",
        feedback: "Not safe. Stop exposure and evacuate. Ventilation alone does not establish that the source is controlled or the space is safe.",
      },
    ],
  },
];
const diagrams = [
  {
    id: "accumulation",
    title: "LPG accumulation and drainage",
    desc: "LPG vapour sinks to the locker low point. A clear pipe falls continuously to an overboard outlet above the at-rest waterline; vapour must not drain into accommodation.",
    labels: ["Outside-access locker", "Vapour falls", "Continuous fall", "Outlet above waterline"],
    path: "M55 40h90v80H55z M100 120L245 150 M20 175h260",
  },
  {
    id: "isolation",
    title: "Safe isolation flow",
    desc: "If gas is suspected: do not operate electrical switches; isolate only when the designated control is safely reachable; evacuate, ventilate naturally from outside and summon help.",
    labels: ["No switches", "Isolate if safe", "Evacuate", "Natural ventilation", "Get help"],
    path: "M25 90h240 M65 82l8 8-8 8 M130 82l8 8-8 8 M195 82l8 8-8 8",
  },
  {
    id: "detectors",
    title: "Boat CO alarm placement",
    desc: "A certified audible BS EN 50291-2 boat alarm protects living and sleeping areas. Follow its manufacturer instructions, confirm it can be heard where people sleep, avoid heat and steam, and use a sleeping breathing-zone position only where instructed—there is no universal height.",
    labels: ["Living area protected", "Audible in sleeping area", "Away from heat and steam", "Manufacturer location controls", "Test button • battery • expiry • never disable"],
    path: "M35 155V45h220v110 M90 115h35v25H90z M185 65h35v25h-35z",
  },
] as const;
const PracticeDiagrams = () => (
  <div className="grid min-w-0 gap-4 lg:grid-cols-3">
    {diagrams.map((item) => (
      <figure key={item.id} className="min-w-0 rounded-lg border bg-muted/30 p-3 forced-colors:border-[CanvasText]" aria-labelledby={`${item.id}-title`}>
        <svg viewBox="0 0 290 200" role="img" aria-labelledby={`${item.id}-title ${item.id}-desc`} className="h-auto w-full max-w-full">
          <title id={`${item.id}-title`}>{item.title}</title>
          <desc id={`${item.id}-desc`}>{item.desc}</desc>
          <path d={item.path} fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          {item.id === "detectors" && (
            <g fill="currentColor" fontSize="10">
              <text x="42" y="59">
                LIVING AREA
              </text>
              <text x="174" y="79">
                SLEEPING AREA
              </text>
              <circle cx="155" cy="105" r="8" fill="none" stroke="currentColor" strokeWidth="3" />
              <text x="132" y="128">
                AUDIBLE CO ALARM
              </text>
              <path d="M155 94V74M145 98l-17-12M165 98l17-12" fill="none" stroke="currentColor" strokeWidth="2" />
              <text x="39" y="149">
                HEAT / STEAM: KEEP CLEAR
              </text>
              <text x="33" y="190">
                HEIGHT / BREATHING ZONE: MAKER INSTRUCTIONS
              </text>
            </g>
          )}
        </svg>
        <figcaption className="break-words text-sm">
          <strong>{item.title}.</strong> {item.desc}
          <ul className="mt-2 list-disc pl-5">
            {item.labels.map((label) => (
              <li key={label}>{label}</li>
            ))}
          </ul>
        </figcaption>
      </figure>
    ))}
  </div>
);
export function GasSafetyPractice({ onMastery, evidenceOwnerKey = "anonymous" }: { onMastery: (evidence: GasSafetyMastery | null) => void; evidenceOwnerKey?: string }) {
  const prefix = useId();
  const emitted = useRef(false);
  const onMasteryRef = useRef(onMastery);
  onMasteryRef.current = onMastery;
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  useEffect(() => {
    emitted.current = false;
    setAnswers({});
    setChecked({});
    onMasteryRef.current(null);
  }, [evidenceOwnerKey]);
  const mastered = scenarios.filter((s) => checked[s.id] && s.choices.find((c) => c.id === answers[s.id])?.correct).map((s) => s.id);
  const check = (scenario: Scenario) => {
    const next = { ...checked, [scenario.id]: true };
    setChecked(next);
    const complete = scenarios.every((s) => next[s.id] && s.choices.find((c) => c.id === answers[s.id])?.correct);
    if (complete && !emitted.current) {
      emitted.current = true;
      onMastery({
        revision: GAS_SAFETY_MASTERY_REVISION,
        masteredScenarioIds: [...GAS_SAFETY_CRITICAL_SCENARIOS],
      });
    }
  };
  const reset = () => {
    emitted.current = false;
    setAnswers({});
    setChecked({});
    onMastery(null);
  };
  return (
    <section aria-labelledby="gas-practice-title" className="min-w-0 space-y-6">
      <div>
        <h2 id="gas-practice-title" className="text-2xl font-bold">
          Safety-critical gas practice
        </h2>
        <p className="text-muted-foreground">Use the diagrams, then correct both emergency decisions. This produces in-session mastery evidence only; it is not saved and does not complete the lesson.</p>
      </div>
      <PracticeDiagrams />
      <aside aria-labelledby="gas-practice-sources" className="rounded-lg border p-4 text-sm forced-colors:border-[CanvasText]">
        <h3 id="gas-practice-sources" className="font-semibold">
          Practice source scope and review status
        </h3>
        <p className="mt-2 text-muted-foreground">The LPG leak and isolation response follows current RYA and Gas Safe Register boat guidance. CO alarm, evacuation, fresh-air, re-entry and placement wording follows UK government and alarm-manufacturer guidance; exact alarm instructions and the vessel procedure control. Sources checked 2026-08-12. No qualified practitioner approval is recorded; this practice does not certify an installation or emergency response.</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>
            <a className="text-primary underline" href="https://www.rya.org.uk/water-safety/gas-safety/gas-safety-on-boats/" target="_blank" rel="noreferrer">
              RYA: Gas safety on boats
            </a>{" "}
            — suspected LPG escape and isolation scope.
          </li>
          <li>
            <a className="text-primary underline" href="https://www.gassaferegister.co.uk/media/drxliecz/gas-on-boats-factsheet.pdf" target="_blank" rel="noreferrer">
              Gas Safe Register: Gas on boats factsheet
            </a>{" "}
            — LPG warning, owner action and competent-work boundaries.
          </li>
          <li>
            <a className="text-primary underline" href="https://www.gov.uk/government/publications/fire-safety-on-boats/fire-safety-on-boats-accessible-version" target="_blank" rel="noreferrer">
              UK government: Fire safety on boats
            </a>{" "}
            — CO alarms, escape and routine boat safety checks.
          </li>
        </ul>
      </aside>
      <div className="grid min-w-0 gap-4 md:grid-cols-2">
        {scenarios.map((scenario, index) => {
          const selected = scenario.choices.find((c) => c.id === answers[scenario.id]);
          return (
            <Card key={scenario.id} className="min-w-0 forced-colors:border-[CanvasText]">
              <CardHeader>
                <CardTitle className="break-words text-lg">
                  {index + 1}. {scenario.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="min-w-0 space-y-3">
                <fieldset>
                  <legend className="break-words font-medium">{scenario.prompt}</legend>
                  <div className="mt-3 space-y-2">
                    {scenario.choices.map((choice) => (
                      <label key={choice.id} className="flex min-h-11 min-w-0 cursor-pointer items-start gap-3 rounded-md border p-3 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring forced-colors:border-[CanvasText]">
                        <input
                          className="mt-0.5 size-5 shrink-0"
                          type="radio"
                          name={`${prefix}-${scenario.id}`}
                          checked={answers[scenario.id] === choice.id}
                          onChange={() => {
                            if (emitted.current) {
                              emitted.current = false;
                              onMastery(null);
                            }
                            setAnswers((v) => ({
                              ...v,
                              [scenario.id]: choice.id,
                            }));
                            setChecked((v) => ({ ...v, [scenario.id]: false }));
                          }}
                        />
                        <span className="min-w-0 break-words">{choice.label}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
                <Button type="button" variant="outline" className="h-auto min-h-11 whitespace-normal" disabled={!selected} onClick={() => check(scenario)}>
                  Check {scenario.title.toLowerCase()}
                </Button>
                {checked[scenario.id] && selected && (
                  <p role={selected.correct ? "status" : "alert"} aria-live="polite" className={`break-words rounded-md border p-3 text-sm forced-colors:text-[CanvasText] ${selected.correct ? "border-emerald-700 text-emerald-700 dark:text-emerald-300" : "border-destructive text-destructive"}`}>
                    {selected.feedback}
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
      <div className="flex min-w-0 flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between forced-colors:border-[CanvasText]">
        <p role="status" aria-live="polite" aria-atomic="true" className="break-words">
          <strong>
            {mastered.length} of {scenarios.length}
          </strong>{" "}
          safety-critical responses mastered. {mastered.length === scenarios.length ? "In-session mastery signal ready." : "Correct both responses to produce the mastery signal."}
        </p>
        <Button type="button" variant="outline" className="min-h-11 shrink-0" onClick={reset}>
          Reset practice
        </Button>
      </div>
    </section>
  );
}
