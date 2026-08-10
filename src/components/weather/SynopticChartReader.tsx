import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const synopticScenarios = [
  {
    label: "North Atlantic chart centred west of Ireland: 988 hPa centre inside 992 and 996 hPa isobars; a semicircle front extends east, a triangle front southwest, and alternating symbols north; the warm sector lies between the east and southwest fronts",
    question: "A yacht south of the centre is in the warm sector. Which observation sequence best supports that the cold front is passing?",
    options: [
      "Pressure bottoms then rises; true wind veers from southwest toward west or northwest; heavy rain gives way to showers and cooler air",
      "Pressure stays steady; true wind remains light and variable; visibility steadily improves in warming air",
      "Pressure rises slowly while true wind backs northeast; continuous drizzle begins and temperature rises",
    ],
    answer: 0,
    feedback: [
      "That combined tendency is consistent with a typical Northern Hemisphere cold-front passage south of the low: rising pressure, a veer, a rain band then showers, and cooler air. Confirm it against forecasts and observations.",
      "Steady pressure and light variable wind do not fit the drawn tight frontal depression or provide evidence that its cold front is passing.",
      "Backing northeast, warming air and new continuous drizzle are not the expected combined signal for this cold-front passage.",
    ],
  },
  {
    label: "British Isles chart with a front line running west-southwest to east-northeast; attached triangle apexes point north toward warmer air, with colder air labelled to the south",
    question: "The north-advancing front is forecast to reach a tidal gate during a strong opposing stream. What is the safest planning response?",
    options: [
      "Treat its arrival time as exact and press on because conditions clear immediately at the line",
      "Allow timing margin, assess wind-against-tide seas, and prepare for a squall, heavy rain, a wind shift and reduced visibility",
      "Expect only gradual high cloud and no abrupt change because every front behaves like a warm front",
    ],
    answer: 1,
    feedback: [
      "A chart front is a moving zone, not an exact line or guaranteed clearance time. Pressing on removes margin for timing error and hazardous wind-against-tide seas.",
      "Correct. Triangle symbols identify the cold-air advance; a cold-front zone can bring squalls, heavy rain, a wind shift and poor visibility. Timing and severity still require current forecasts.",
      "Gradually lowering cloud and prolonged rain are more typical warm-front cues. A cold front can produce a shorter, more abrupt change.",
    ],
  },
  {
    label: "Northern Hemisphere chart west of Ireland: a 988 hPa centre marked L is enclosed by 992 and 996 hPa isobars; curved surface-flow arrows east of the centre point northward and arrows north of it point westward, both slightly inward",
    question: "What practical wind assessment is best supported by this chart?",
    options: [
      "Surface true wind circulates anticlockwise and slightly inward; closer isobars support stronger wind, but forecast and local effects still matter",
      "Wind must be calm at every low-pressure centre regardless of nearby isobar spacing",
      "Surface true wind circulates clockwise around the low and its strength is fixed by the centre pressure alone",
    ],
    answer: 0,
    feedback: [
      "Correct. In the Northern Hemisphere, surface wind around a low is anticlockwise and crosses slightly toward lower pressure. Gradient, forecasts and local effects qualify the expected strength.",
      "Wind may be lighter very near a centre, but the chart does not justify calm conditions everywhere; isobar spacing and the system's movement remain important.",
      "Clockwise circulation applies to a Northern Hemisphere high. A single centre value does not determine wind strength; the pressure gradient is the key chart signal.",
    ],
  },
] as const;

const STORAGE_KEY = "weather-synoptic-reader-v1";
type ReaderState = { scenario: number; selections: Array<number | null>; checked: boolean[]; finished: boolean };
const emptyState = (): ReaderState => ({ scenario: 0, selections: synopticScenarios.map(() => null), checked: synopticScenarios.map(() => false), finished: false });

const loadState = (): ReaderState => {
  if (typeof window === "undefined") return emptyState();
  try {
    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "null") as Partial<ReaderState> | null;
    if (!saved || !Number.isInteger(saved.scenario) || saved.scenario! < 0 || saved.scenario! >= synopticScenarios.length || !Array.isArray(saved.selections) || !Array.isArray(saved.checked)) return emptyState();
    return { scenario: saved.scenario!, selections: synopticScenarios.map((_, index) => Number.isInteger(saved.selections![index]) ? saved.selections![index]! : null), checked: synopticScenarios.map((_, index) => saved.checked![index] === true), finished: saved.finished === true };
  } catch {
    return emptyState();
  }
};

const ChartFrame = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className="rounded-lg border bg-sky-50 p-2 text-slate-700 dark:bg-slate-950 dark:text-slate-200 sm:p-3">
    <svg viewBox="0 0 600 300" className="block h-auto w-full" role="img" aria-label={`Simplified synoptic chart: ${label}`}>
      <title>{label}</title>
      <rect width="600" height="300" fill="currentColor" opacity="0.025" />
      <g data-chart-layer="geography" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.42">
        <path d="M410 45l24 12 12 28-12 25 10 25-13 31-24 13-9-28 7-31-12-27 8-24z" />
        <path d="M367 108l18 7 8 23-12 23-20-4-7-22z" />
        <path d="M446 181l24 3 29 18" />
      </g>
      <g fill="currentColor" fontSize="14" opacity="0.7">
        <text x="348" y="104">Ireland</text>
        <text x="438" y="42">Great Britain</text>
        <text x="24" y="278">North Atlantic</text>
      </g>
      {children}
    </svg>
  </div>
);

const Isobars = ({ circulation = false }: { circulation?: boolean }) => (
  <g data-chart-layer="isobars" fill="none" stroke="currentColor">
    <ellipse cx="205" cy="118" rx="58" ry="44" strokeWidth="2.5" data-isobar="988" />
    <ellipse cx="205" cy="118" rx="97" ry="72" strokeWidth="2" data-isobar="992" />
    <ellipse cx="205" cy="118" rx="139" ry="101" strokeWidth="2" data-isobar="996" />
    <g fill="currentColor" stroke="none" fontSize="13" fontWeight="600">
      <text x="190" y="70">988</text>
      <text x="187" y="42">992</text>
      <text x="181" y="16">996 hPa</text>
      <text x="193" y="128" fontSize="27">L</text>
    </g>
    {circulation && <>
      <defs><marker id="wind-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0L10 5 0 10z" fill="currentColor" /></marker></defs>
      <path data-chart-marker="anticlockwise-low" data-circulation="anticlockwise" d="M286 146A89 72 0 0 1 171 183" strokeWidth="4" markerEnd="url(#wind-arrow)" />
      <path d="M124 91A89 72 0 0 1 240 54" strokeWidth="4" markerEnd="url(#wind-arrow)" />
    </>}
  </g>
);

const IntegratedFrontalDepression = () => (
  <ChartFrame label={synopticScenarios[0].label}>
    <Isobars />
    <g data-chart-marker="integrated-frontal-system" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <g data-front-type="warm" data-connected-to="low" data-direction="north" aria-label="Warm front advancing north; red semicircles attached north of the front line" stroke="#b91c1c" strokeWidth="5">
        <path d="M220 131C300 139 368 145 485 151" />
        <path d="M273 136Q286 112 299 138M335 141Q348 117 361 143M399 145Q412 121 425 147M457 149Q468 129 479 150" />
      </g>
      <g data-front-type="cold" data-connected-to="low" data-direction="east" aria-label="Cold front advancing east; blue triangle apexes point east from the front line" stroke="#1d4ed8" strokeWidth="5">
        <path d="M196 138C171 174 139 211 91 273" />
        <path d="M169 176l18 13-27 8zM139 213l18 14-28 7zM108 251l17 14-27 6z" fill="none" />
      </g>
      <g data-front-type="occluded" data-connected-to="low" data-direction="east" aria-label="Occluded front advancing east; alternating triangles and semicircles attached east of the line" stroke="#7e22ce" strokeWidth="5">
        <path d="M199 102C191 72 180 43 163 18" />
        <path d="M190 75L205 66 186 59ZM178 47Q197 48 196 35" />
      </g>
    </g>
    <path data-warm-sector="true" d="M213 145C260 161 277 202 243 239C194 224 163 203 151 185Z" fill="#f59e0b" opacity="0.16" stroke="currentColor" strokeDasharray="5 5" />
    <text x="204" y="190" fill="currentColor" fontSize="14" fontWeight="700">Warm sector</text>
    <text x="447" y="126" fill="currentColor" fontSize="12">advancing north</text>
  </ChartFrame>
);

const ColdFrontChart = () => (
  <ChartFrame label={synopticScenarios[1].label}>
    <g data-chart-marker="cold-front" data-direction="north" data-front-type="cold" fill="none" stroke="#1d4ed8" strokeWidth="6" strokeLinejoin="round" aria-label="Cold front advancing north; triangle apexes point north from the front line">
      <path d="M105 165C220 145 338 160 505 125" />
      <path d="M165 155l18-22 11 19zM252 151l20-23 10 25zM344 151l21-25 10 22zM437 140l20-25 11 20z" />
    </g>
    <g fill="currentColor" fontSize="15" fontWeight="600">
      <text x="84" y="205">Colder air</text><text x="386" y="96">Warmer air</text><text x="226" y="194">Triangles point toward movement</text>
    </g>
  </ChartFrame>
);

const CirculationChart = () => (
  <ChartFrame label={synopticScenarios[2].label}>
    <Isobars circulation />
    <text x="347" y="232" fill="currentColor" fontSize="15" fontWeight="600">Surface flow arrows</text>
  </ChartFrame>
);

export const SynopticChartReader = () => {
  const [state, setState] = useState<ReaderState>(loadState);
  const { scenario, selections, checked, finished } = state;
  const current = synopticScenarios[scenario];
  const selection = selections[scenario];
  const answered = checked[scenario];
  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);
  const choose = (value: number) => {
    if (answered) return;
    setState((previous) => ({ ...previous, selections: previous.selections.map((selected, index) => index === scenario ? value : selected) }));
  };
  const checkAnswer = () => {
    if (selection === null || answered) return;
    setState((previous) => ({ ...previous, checked: previous.checked.map((value, index) => index === scenario ? true : value) }));
  };
  const next = () => {
    if (!answered) return;
    if (scenario === synopticScenarios.length - 1) setState((previous) => ({ ...previous, finished: true }));
    else setState((previous) => ({ ...previous, scenario: previous.scenario + 1 }));
  };
  const restart = () => setState(emptyState());

  if (finished) return (
    <Card>
      <CardHeader><CardTitle>Synoptic chart reader complete</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <p role="status">You completed all {synopticScenarios.length} applied chart challenges.</p>
        <p className="text-sm text-muted-foreground">This practice result is stored on this device, but it does not mark the Weather Systems theory lesson complete or award progress.</p>
        <Button onClick={restart}>Restart chart reader</Button>
      </CardContent>
    </Card>
  );
  return (
    <Card>
      <CardHeader><CardTitle>Synoptic chart reader</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <p aria-live="polite" className="text-sm font-medium">Chart {scenario + 1} of {synopticScenarios.length}</p>
        {scenario === 0 ? <IntegratedFrontalDepression /> : scenario === 1 ? <ColdFrontChart /> : <CirculationChart />}
        <p id="synoptic-question" className="font-medium">{current.question}</p>
        <div className="grid gap-2" role="group" aria-labelledby="synoptic-question">
          {current.options.map((option, index) => <Button key={option} variant="outline" className="h-auto min-h-10 whitespace-normal py-2 text-left justify-start" aria-pressed={selection === index} data-answer-state={answered ? index === current.answer ? "correct" : selection === index ? "incorrect" : "unselected" : selection === index ? "selected" : "unselected"} disabled={answered} onClick={() => choose(index)}>{option}</Button>)}
        </div>
        {answered && selection !== null && <div role="status" className="rounded-md border p-3"><p className="font-semibold">{selection === current.answer ? "Correct." : "Not quite."}</p><p>{current.feedback[selection]}</p>{selection !== current.answer && <p className="mt-2"><strong>Best answer:</strong> {current.options[current.answer]}</p>}</div>}
        <div className="flex flex-wrap gap-2">
          <Button onClick={checkAnswer} disabled={selection === null || answered}>Check answer</Button>
          <Button variant="outline" onClick={next} disabled={!answered}>{scenario === synopticScenarios.length - 1 ? "Finish reader" : "Next chart"}</Button>
        </div>
        <p className="text-sm text-muted-foreground">Choose one answer, then check it. That attempt locks for review; continue to the next chart. Practice state is saved on this device and remains separate from lesson completion.</p>
      </CardContent>
    </Card>
  );
};
