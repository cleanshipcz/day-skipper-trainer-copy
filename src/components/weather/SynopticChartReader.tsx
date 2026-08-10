import type { ReactNode } from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const synopticScenarios = [
  { label: "Frontal depression west of Ireland, with labelled isobars, connected fronts and a warm sector", question: "With the low to the west, which system is shown?", options: ["Low pressure", "High pressure", "Ridge"], answer: 0 },
  { label: "Cold front moving east across the British Isles, shown by attached triangles", question: "Which front do the triangles identify?", options: ["Warm", "Cold", "Occluded"], answer: 1 },
  { label: "Northern Hemisphere low with labelled isobars and anticlockwise surface circulation", question: "How does surface wind circulate around the low?", options: ["Clockwise", "Anticlockwise", "Straight inward"], answer: 1 },
] as const;

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
      <g data-front-type="warm" data-connected-to="low" data-direction="east" aria-label="Warm front moving east; red semicircles attached north of the front line" stroke="#b91c1c" strokeWidth="5">
        <path d="M220 131C300 139 368 145 485 151" />
        <path d="M273 136a13 13 0 0 1 26 2M335 141a13 13 0 0 1 26 2M399 145a13 13 0 0 1 26 2M457 149a11 11 0 0 1 22 1" />
      </g>
      <g data-front-type="cold" data-connected-to="low" data-direction="southeast" aria-label="Cold front moving southeast; blue triangles attached east of the front line" stroke="#1d4ed8" strokeWidth="5">
        <path d="M196 138C171 174 139 211 91 273" />
        <path d="M169 176l18 13-27 8zM139 213l18 14-28 7zM108 251l17 14-27 6z" fill="none" />
      </g>
      <g data-front-type="occluded" data-connected-to="low" data-direction="north" aria-label="Occluded front moving north; alternating triangles and semicircles attached east of the line" stroke="#7e22ce" strokeWidth="5">
        <path d="M199 102C191 72 180 43 163 18" />
        <path d="M190 75l15-9-19-7zM178 47a11 11 0 0 1 18-12" />
      </g>
    </g>
    <path data-warm-sector="true" d="M213 145C260 161 277 202 243 239C194 224 163 203 151 185Z" fill="#f59e0b" opacity="0.16" stroke="currentColor" strokeDasharray="5 5" />
    <text x="204" y="190" fill="currentColor" fontSize="14" fontWeight="700">Warm sector</text>
    <text x="467" y="138" fill="currentColor" fontSize="12">moving east</text>
  </ChartFrame>
);

const ColdFrontChart = () => (
  <ChartFrame label={synopticScenarios[1].label}>
    <g data-chart-marker="cold-front" data-direction="east" data-front-type="cold" fill="none" stroke="#1d4ed8" strokeWidth="6" strokeLinejoin="round">
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
    <text x="347" y="232" fill="currentColor" fontSize="15" fontWeight="600">Anticlockwise, slightly inward</text>
  </ChartFrame>
);

export const SynopticChartReader = () => {
  const [scenario, setScenario] = useState(0);
  const [answer, setAnswer] = useState<number | null>(null);
  const current = synopticScenarios[scenario];
  const choose = (value: number) => setAnswer(value);
  return (
    <Card>
      <CardHeader><CardTitle>Synoptic chart reader</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        {scenario === 0 ? <IntegratedFrontalDepression /> : scenario === 1 ? <ColdFrontChart /> : <CirculationChart />}
        <p className="font-medium">{current.question}</p>
        <div className="grid sm:grid-cols-3 gap-2" role="group" aria-label="Chart answer">
          {current.options.map((option, index) => <Button key={option} variant="outline" onClick={() => choose(index)}>{option}</Button>)}
        </div>
        {answer !== null && <p role="status">{answer === current.answer ? "Correct" : `Review the chart: ${current.options[current.answer]}.`}</p>}
        <Button onClick={() => { setScenario((scenario + 1) % synopticScenarios.length); setAnswer(null); }}>Next chart</Button>
      </CardContent>
    </Card>
  );
};
