import { useEffect, useId, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, PlayCircle, XCircle } from "lucide-react";
import { validateDepthAnswer, waterOverFeature, type TidalDepthScenario } from "./tidalDepth";

const SCENARIOS: readonly TidalDepthScenario[] = [
  { id: "A", tide: 1.4, chartValue: 3.2, feature: "sounding" },
  { id: "B", tide: 2.3, chartValue: 1.1, feature: "drying" },
  { id: "C", tide: 0.8, chartValue: 1.4, feature: "drying" },
  { id: "D", tide: 0, chartValue: 0.6, feature: "drying" },
  { id: "E", tide: 3.1, chartValue: 0.9, feature: "sounding" },
  { id: "F", tide: 1.7, chartValue: 1.7, feature: "drying" },
];

const TidalVisualizer = () => {
  const titleId = useId();
  const descId = useId();
  const [manualTide, setManualTide] = useState([2.5]);
  const [drillActive, setDrillActive] = useState(false);
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(0);
  const [layout, setLayout] = useState<"compact" | "standard" | "wide">(() =>
    window.innerWidth < 768 ? "compact" : window.innerWidth < 1280 ? "standard" : "wide");
  const scenario = SCENARIOS[index];
  const result = waterOverFeature(scenario);
  const tide = drillActive ? scenario.tide : manualTide[0];
  const featureValue = drillActive ? scenario.chartValue : 3.2;
  const feature = drillActive ? scenario.feature : "sounding";
  const diagramResult = feature === "sounding" ? tide + featureValue : tide - featureValue;
  const finished = drillActive && index >= SCENARIOS.length - 1 && feedback?.ok;
  const completed = finished || feedback?.text.startsWith("Drill complete");
  const layoutClass = layout === "compact"
    ? "grid grid-cols-1 gap-4"
    : layout === "standard"
      ? "grid grid-cols-[minmax(0,1fr)_minmax(17rem,0.8fr)] gap-5"
      : "grid grid-cols-[minmax(0,1.2fr)_minmax(20rem,0.8fr)] gap-8";

  useEffect(() => {
    const updateLayout = () => setLayout(window.innerWidth < 768 ? "compact" : window.innerWidth < 1280 ? "standard" : "wide");
    window.addEventListener("resize", updateLayout);
    return () => window.removeEventListener("resize", updateLayout);
  }, []);

  const diagram = useMemo(() => {
    const datumY = 190;
    const scale = 38;
    const surfaceY = datumY - tide * scale;
    const featureY = feature === "sounding" ? datumY + featureValue * scale : datumY - featureValue * scale;
    return { datumY, surfaceY, featureY };
  }, [feature, featureValue, tide]);

  const resetQuestion = (next: number) => {
    setIndex(next);
    setAnswer("");
    setFeedback(null);
  };
  const start = () => {
    setDrillActive(true); setScore(0); setAnswered(0); resetQuestion(0);
  };
  const check = () => {
    if (feedback?.ok || completed) return;
    const error = validateDepthAnswer(answer, result);
    if (error) { setFeedback({ ok: false, text: error }); return; }
    setScore((value) => value + 1);
    setAnswered((value) => value + 1);
    setFeedback({ ok: true, text: result < 0
      ? `Correct: water depth is 0.0 m; the feature remains ${Math.abs(result).toFixed(1)} m uncovered.`
      : result === 0 ? "Correct: the feature is awash, with 0.0 m water depth."
      : `Correct: ${result.toFixed(1)} m of water covers the feature.` });
  };
  const skip = () => {
    if (feedback?.ok || completed) return;
    setAnswered((value) => value + 1);
    if (index < SCENARIOS.length - 1) resetQuestion(index + 1);
    else setFeedback({ ok: false, text: "Drill complete. Retry to practise skipped or missed cases." });
  };

  return (
    <Card className="w-full border-blue-200 bg-slate-50">
      <CardHeader><CardTitle>Interactive Tidal Curves</CardTitle><CardDescription><span className="sr-only">Interactive tidal depth drill. </span>Use Chart Datum consistently: a sounding is below datum; a drying height is above it.</CardDescription></CardHeader>
      <CardContent className="space-y-6">
        <section className="rounded-lg border bg-white p-4 space-y-3" aria-labelledby="depth-method">
          <h3 id="depth-method" className="font-semibold">Depth, clearance and UKC are different values</h3>
          <p className="text-sm">Water depth = charted sounding + predicted height of tide. For a drying height, subtract the drying height from the tide. A zero or negative result means no water covers the feature; report 0 m water and the amount still uncovered.</p>
          <p className="text-sm"><strong>Worked sounding:</strong> 3.2 m + 1.4 m tide = 4.6 m water depth. With 2.0 m draught, static UKC is 2.6 m. After 0.3 m squat and 0.2 m wave/heel allowances, dynamic UKC is 2.1 m.</p>
          <p className="text-sm"><strong>Worked drying height:</strong> 0.8 m tide − 1.4 m drying height = −0.6 m, so water depth is 0 m and the feature is 0.6 m uncovered.</p>
        </section>

        <div data-testid="tidal-layout" data-layout={layout} className={layoutClass}>
          <div className="min-w-0 space-y-3">
            <Label id="tide-slider-label">Height of Tide: <strong>{tide.toFixed(1)} m above CD</strong></Label>
            <Slider aria-labelledby="tide-slider-label" value={[tide]} min={0} max={6} step={0.1} disabled={drillActive}
              onValueChange={setManualTide} />
            <p className="text-sm" aria-live="polite">Diagram result: {diagramResult > 0 ? `${diagramResult.toFixed(1)} m covered` : diagramResult === 0 ? "awash: 0.0 m covered" : `${Math.abs(diagramResult).toFixed(1)} m uncovered; 0.0 m water depth`}.</p>
          </div>
          {!drillActive ? <Button onClick={start} variant="outline"><PlayCircle className="mr-2 h-4 w-4" />Start drill</Button> :
            <div className="space-y-2" data-testid="drill-panel">
              <p className="font-medium">Question {index + 1} of {SCENARIOS.length} · score {score}/{answered}</p>
              <p>{feature === "drying" ? `Drying height ${featureValue.toFixed(1)} m` : `Charted sounding ${featureValue.toFixed(1)} m`}; tide {tide.toFixed(1)} m. What is the water depth?</p>
              <Label htmlFor="depth-answer">Water depth (m)</Label>
              <div className="flex flex-wrap gap-2"><Input id="depth-answer" inputMode="decimal" placeholder="Depth (m)" value={answer} onChange={(event) => { setAnswer(event.target.value); setFeedback(null); }} className="w-28" />
                <Button onClick={check} disabled={feedback?.ok || Boolean(completed)}>Check</Button><Button variant="ghost" onClick={skip} disabled={feedback?.ok || Boolean(completed)}>Skip</Button></div>
              {feedback && <p role="status" className={feedback.ok ? "text-green-700" : "text-red-700"}>{feedback.ok ? <CheckCircle2 className="mr-1 inline h-4 w-4" /> : <XCircle className="mr-1 inline h-4 w-4" />}{feedback.text}</p>}
              {feedback?.ok && !finished && <Button variant="outline" onClick={() => resetQuestion(index + 1)}>Next question</Button>}
              {completed && <div className="space-y-2"><p className="font-semibold">Complete: {score}/{SCENARIOS.length}. {score >= 5 ? "Mastery achieved." : "Review the worked examples and retry."}</p><Button onClick={start}>Retry drill</Button></div>}
            </div>}
        </div>

        <figure data-testid="tidal-figure" className="w-full min-w-0 overflow-hidden rounded-xl border bg-sky-50">
          <svg role="img" aria-labelledby={`${titleId} ${descId}`} viewBox="0 0 600 390" className="block h-auto w-full min-w-0">
            <title id={titleId}>Tidal depth cross-section for scenario {drillActive ? scenario.id : "example"}</title>
            <desc id={descId}>Chart Datum, sea surface at {tide.toFixed(1)} metres above datum, and a {feature} of {featureValue.toFixed(1)} metres. {diagramResult > 0 ? `${diagramResult.toFixed(1)} metres of water covers it.` : diagramResult === 0 ? "The feature is awash, with zero metres of water depth." : `There is zero metres of water depth; it is ${Math.abs(diagramResult).toFixed(1)} metres uncovered.`}</desc>
            <rect width="600" height="390" fill="#e0f2fe"/><rect y={Math.max(0, diagram.surfaceY)} width="600" height={390 - Math.max(0, diagram.surfaceY)} fill="#60a5fa" opacity=".48"/>
            <path d="M0 340 L600 340 L600 390 L0 390Z" fill="#c8bda1"/>
            {feature === "sounding" ? <path d={`M0 340 L600 ${Math.min(370, diagram.featureY)} L600 390 L0 390Z`} fill="#a89d82"/> : <path d={`M390 340 Q470 ${diagram.featureY} 550 340Z`} fill="#78716c"/>}
            <line x1="0" x2="600" y1={diagram.datumY} y2={diagram.datumY} stroke="#475569" strokeDasharray="8 6"/><text x="12" y={diagram.datumY - 8}>Chart Datum (CD)</text>
            <line x1="0" x2="600" y1={diagram.surfaceY} y2={diagram.surfaceY} stroke="#1d4ed8" strokeWidth="3"/><text x="410" y={Math.max(18, diagram.surfaceY - 8)}>Sea surface {tide.toFixed(1)} m</text>
            <text x="20" y="370">{feature === "sounding" ? `Sounding ${featureValue.toFixed(1)} m below CD` : `Drying height ${featureValue.toFixed(1)} m above CD`}</text>
          </svg>
          <figcaption className="p-3 text-sm"><dl className="grid gap-1 sm:grid-cols-[auto_1fr]"><dt className="font-semibold">Predicted tide</dt><dd>{tide.toFixed(1)} m above CD</dd><dt className="font-semibold">Charted feature</dt><dd>{featureValue.toFixed(1)} m {feature === "sounding" ? "below" : "above"} CD</dd><dt className="font-semibold">Water over feature</dt><dd>{Math.max(0, diagramResult).toFixed(1)} m{diagramResult < 0 ? ` (${Math.abs(diagramResult).toFixed(1)} m uncovered)` : ""}</dd></dl></figcaption>
        </figure>
      </CardContent>
    </Card>
  );
};

export default TidalVisualizer;
