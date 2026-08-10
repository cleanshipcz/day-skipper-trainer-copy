/* eslint-disable react-refresh/only-export-components -- exported question catalogue is the assessment's testable content contract */
/*
 * Original, code-drawn teaching diagrams based on the symbol meanings in IHO INT 1,
 * 8th edition (2020), sections C–N. They are not scans or reproductions of UKHO
 * artwork. Catalogue identifiers are supplied for lookup, not as a claim that these
 * drawings are official reproductions. Sources: https://iho.int/en/int1 and UKHO's
 * ADMIRALTY copyright/licensing terms at https://www.admiralty.co.uk/copyright.
 */
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, XCircle, RefreshCcw } from "lucide-react";

type SymbolKind = "sounding" | "drying" | "rock" | "wreck" | "obstruction" | "lateral" | "safe-water" | "cardinal" | "light" | "cable" | "pipeline" | "anchorage" | "chart-note";
type Question = { id: string; kind: SymbolKind; prompt: string; answer: string; options: string[]; explanation: string; reference: string };

export const CHART_SYMBOL_ATTEMPT_KEY = "day-skipper:chart-symbol-assessment:v1";
type StoredAttempt = { version: 1; index: number; choice: string; checked: boolean; correctIds: string[]; complete: boolean };
const emptyAttempt: StoredAttempt = { version: 1, index: 0, choice: "", checked: false, correctIds: [], complete: false };
const loadAttempt = (): StoredAttempt => {
  try {
    const value = JSON.parse(localStorage.getItem(CHART_SYMBOL_ATTEMPT_KEY) ?? "null") as Partial<StoredAttempt> | null;
    if (value?.version === 1 && Number.isInteger(value.index) && Number(value.index) >= 0 && Number(value.index) < 13 && Array.isArray(value.correctIds)) {
      return {
        version: 1,
        index: Number(value.index),
        choice: typeof value.choice === "string" ? value.choice : "",
        checked: value.checked === true,
        correctIds: [...new Set(value.correctIds.filter((id): id is string => typeof id === "string"))],
        complete: value.complete === true && value.index === 12,
      };
    }
  } catch { /* Invalid or unavailable storage starts a new attempt safely. */ }
  return emptyAttempt;
};

export const chartSymbolQuestions: Question[] = [
  { id: "sounding", kind: "sounding", prompt: "What does this black italic figure mean?", answer: "A charted depth of 3.7 m below chart datum", options: ["A charted depth of 3.7 m below chart datum", "A drying height of 3.7 m", "A least overhead clearance of 3.7 m", "A spot height 3.7 m above land datum"], explanation: "Soundings are depths below the chart's stated Chart Datum (CD), in the units stated in the title. A small subscript is the decimal digit: 3₇ means 3.7 m.", reference: "INT 1 I 10; Chart 5011 I" },
  { id: "drying", kind: "drying", prompt: "What does the underlined green figure identify?", answer: "A drying height of 1.2 m above chart datum", options: ["A drying height of 1.2 m above chart datum", "A depth of 1.2 m below chart datum", "A 12 m height above mean high water", "A clearance of 1.2 m below a cable"], explanation: "An underlined figure in the intertidal tint is a drying height above CD. Subtract it from predicted tide height to estimate water over the feature.", reference: "INT 1 I 15; Chart 5011 I" },
  { id: "rock", kind: "rock", prompt: "Identify this rock symbol and its navigational implication.", answer: "Rock awash at chart datum; treat as a danger", options: ["Rock awash at chart datum; treat as a danger", "Rock always visible; safe to pass close", "Wreck with depth unknown", "Isolated sounding deeper than 20 m"], explanation: "The cross-like rock form denotes a rock awash at the level of CD. Rock variants distinguish always dry, awash and submerged; surrounding danger lines and depths alter the assessment.", reference: "INT 1 K 10–14; Chart 5011 K" },
  { id: "wreck", kind: "wreck", prompt: "What is shown by this magenta danger line around a wreck hull?", answer: "A dangerous wreck with depth unknown", options: ["A dangerous wreck with depth unknown", "A wreck known to be safe at all tides", "A marina with a breakwater", "Foul ground where anchoring is recommended"], explanation: "A wreck symbol enclosed by a danger line indicates a dangerous wreck whose safe clearance is not established. A wreck with a swept or known depth uses a different variant and depth annotation.", reference: "INT 1 K 20–27; Chart 5011 K" },
  { id: "obstruction", kind: "obstruction", prompt: "What does the dotted danger circle with Obstn mean?", answer: "An underwater obstruction of unknown safe depth", options: ["An underwater obstruction of unknown safe depth", "A spoil-ground boundary", "A prohibited anchorage", "A measured submarine pipeline"], explanation: "Obstn identifies an obstruction. With no safe depth stated, allow for danger; dotted danger limits and accompanying sounding/clearance must be read together.", reference: "INT 1 K 40–43; Chart 5011 K" },
  { id: "lateral", kind: "lateral", prompt: "In IALA Region A, identify this red can buoy.", answer: "Port-hand lateral buoy; leave to port when entering", options: ["Port-hand lateral buoy; leave to port when entering", "Starboard-hand lateral beacon; leave to starboard when entering", "Isolated-danger buoy", "Safe-water pillar buoy"], explanation: "In Region A a port-hand mark is red, with can shape or can topmark. A buoy floats; a beacon is fixed. The chart may show pillar/spar variants, so use colour, topmark and any light together.", reference: "INT 1 Q 130; IALA MBS; Chart 5011 Q" },
  { id: "safe-water", kind: "safe-water", prompt: "Identify the red-and-white vertically striped spherical mark.", answer: "Safe-water buoy; navigable water all around", options: ["Safe-water buoy; navigable water all around", "Isolated danger with water all around", "Special mark defining a recreation area", "North cardinal beacon"], explanation: "Safe-water marks have red/white vertical stripes and a red spherical topmark. The light, when fitted, is white: Iso, Oc, LFl 10s or Morse A.", reference: "INT 1 Q 130.5; IALA MBS; Chart 5011 Q" },
  { id: "cardinal", kind: "cardinal", prompt: "The two black cones point upward. What is the safe side?", answer: "North of the north cardinal mark", options: ["North of the north cardinal mark", "South of a south cardinal mark", "East of an east cardinal mark", "Either side of a safe-water mark"], explanation: "Both cone topmarks point up for north. Its bands are black over yellow and its white light is continuous quick or very quick flashing. Pass to the named side.", reference: "INT 1 Q 130.3; IALA MBS; Chart 5011 Q" },
  { id: "light", kind: "light", prompt: "Decode Fl(2) R 6s 8m 5M beside the beacon.", answer: "Two red flashes every 6 s; height 8 m; nominal range 5 M", options: ["Two red flashes every 6 s; height 8 m; nominal range 5 M", "A fixed white light visible for 6 M", "Two lights, red then white, 8 seconds apart", "A red buoy in 8 m depth with 5 m clearance"], explanation: "Fl(2) is a group of two flashes, R is red, 6s is the period, 8m is focal height above the chart's height datum and 5M is nominal range in nautical miles.", reference: "INT 1 P 10–16; Chart 5011 P" },
  { id: "cable", kind: "cable", prompt: "What does the magenta wavy line labelled Cable indicate?", answer: "A submarine cable; avoid anchoring or trawling over it", options: ["A submarine cable; avoid anchoring or trawling over it", "A recommended track", "A depth contour", "An overhead power cable with stated clearance"], explanation: "A submarine cable is charted on the seabed. Do not anchor or trawl over it. Overhead cables use a different symbol and may carry a vertical-clearance figure.", reference: "INT 1 L 30–32; Chart 5011 L" },
  { id: "pipeline", kind: "pipeline", prompt: "What does the magenta line with repeated circles mean?", answer: "A submarine pipeline; anchoring and seabed contact may be hazardous", options: ["A submarine pipeline; anchoring and seabed contact may be hazardous", "A ferry route", "A boundary between chart datums", "A line of mooring buoys"], explanation: "The repeated-circle line distinguishes a submarine pipeline from a cable. Avoid anchoring/trawling: damage may release hazardous contents and the pipe may stand proud of the seabed.", reference: "INT 1 L 40–44; Chart 5011 L" },
  { id: "anchorage", kind: "anchorage", prompt: "What does the magenta anchor inside a circle designate?", answer: "A designated anchorage area or berth", options: ["A designated anchorage area or berth", "A prohibited anchorage", "A mooring buoy", "A harbour master's office"], explanation: "An anchor symbol marks a designated anchorage/berth; limits, berth numbers and notes may qualify its use. A crossed anchor means anchoring prohibited, and a mooring buoy is a distinct floating aid.", reference: "INT 1 N 10–14; Chart 5011 N" },
  { id: "chart-note", kind: "chart-note", prompt: "A magenta legend says ‘See Note — restricted area’. What must the navigator do?", answer: "Read the referenced note and apply its limits before planning the passage", options: ["Read the referenced note and apply its limits before planning the passage", "Treat the text as historical information only", "Assume entry is permitted when no danger symbol is present", "Use the colour alone to decide whether the area is safe"], explanation: "A charted legend or note is part of the charted information. Read its geographic limits, restrictions, dates and authority together with the symbols; never infer permission from colour or an uncluttered area.", reference: "INT 1 A 16 and N 2; Chart 5011 A/N" },
];

export const symbolDescriptions: Record<SymbolKind, string> = {
  sounding: "Black italic 3 with a smaller subscript 7 on pale blue",
  drying: "Underlined black italic 1 with a smaller subscript 2 on green tint",
  rock: "Black upright and diagonal strokes crossing at a central dot",
  wreck: "Black hull outline inside a dotted magenta oval",
  obstruction: "The abbreviation Obstn inside a dotted magenta circle",
  lateral: "Red floating can shape with a red rectangular topmark and Fl R text",
  "safe-water": "Floating spherical-topped mark with vertical red and white body stripes",
  cardinal: "Black-over-yellow floating mark with two black cones pointing upward",
  light: "Black tower with magenta flare and the legend Fl(2) R 6s, 8m, 5M",
  cable: "Magenta wavy line labelled Cable",
  pipeline: "Magenta line interrupted by repeated open circles and labelled Pipeline",
  anchorage: "Magenta anchor inside a magenta circle",
  "chart-note": "Magenta words See Note and Restricted area",
};

const SymbolDiagram = ({ kind }: { kind: SymbolKind }) => {
  const common = { stroke: "currentColor", strokeWidth: 2, fill: "none" } as const;
  return <svg viewBox="0 0 180 100" className="h-28 w-full max-w-[220px] text-slate-950" role="img" aria-label={symbolDescriptions[kind]}>
    <defs><clipPath id="safe-water-body"><path d="M73 78l6-43h22l6 43z"/></clipPath></defs>
    <rect width="180" height="100" fill={kind === "drying" ? "#b7dcc0" : "#d9f1f5"} />
    {kind === "sounding" && <text x="75" y="62" fontFamily="serif" fontStyle="italic" fontSize="30">3<tspan dy="6" fontSize="18">7</tspan></text>}
    {kind === "drying" && <><text x="75" y="60" fontFamily="serif" fontStyle="italic" fontSize="28">1<tspan dy="6" fontSize="17">2</tspan></text><line x1="72" y1="68" x2="102" y2="68" {...common}/></>}
    {kind === "rock" && <g {...common}><path d="M90 28v44M68 50h44M74 34l32 32M106 34L74 66"/><circle cx="90" cy="50" r="5" fill="currentColor"/></g>}
    {kind === "wreck" && <g><ellipse cx="90" cy="52" rx="55" ry="35" fill="none" stroke="#b00082" strokeWidth="2" strokeDasharray="3 3"/><path d="M62 38l11 30h34l11-30-28 12zM90 24v26" {...common}/></g>}
    {kind === "obstruction" && <g><circle cx="90" cy="48" r="28" fill="none" stroke="#b00082" strokeWidth="2" strokeDasharray="3 3"/><text x="66" y="55" fontSize="17">Obstn</text></g>}
    {kind === "lateral" && <g><path d="M70 78l7-42h26l7 42z" fill="#d4202f" stroke="#6e1019" strokeWidth="2"/><path d="M76 24h28v12H76z" fill="#d4202f"/><text x="118" y="58" fontSize="15">Fl R</text></g>}
    {kind === "safe-water" && <g><path d="M73 78l6-43h22l6 43z" fill="#fff" stroke="#222" strokeWidth="2"/><g clipPath="url(#safe-water-body)"><rect x="79" y="34" width="7" height="45" fill="#d4202f"/><rect x="94" y="34" width="7" height="45" fill="#d4202f"/></g><circle cx="90" cy="23" r="10" fill="#d4202f" stroke="#6e1019" strokeWidth="2"/></g>}
    {kind === "cardinal" && <g><path d="M72 78l6-37h24l6 37z" fill="#f3d326" stroke="#222" strokeWidth="2"/><path d="M77 42h26l3 17H74z" fill="#111"/><path d="M90 5l-12 18h24zM90 22L78 40h24z" fill="#111"/></g>}
    {kind === "light" && <g><path d="M35 75h35M42 75l8-42 8 42M44 58h12" {...common}/><path d="M50 30l-12-10M50 30l12-10M50 30V14" stroke="#b00082" strokeWidth="2"/><text x="76" y="48" fill="#b00082" fontSize="13">Fl(2) R 6s</text><text x="86" y="66" fontSize="12">8m 5M</text></g>}
    {kind === "cable" && <g><path d="M15 55q15-25 30 0t30 0t30 0t30 0t30 0" fill="none" stroke="#b00082" strokeWidth="3"/><text x="62" y="25" fill="#b00082">Cable</text></g>}
    {kind === "pipeline" && <g><path d="M15 55h150" stroke="#b00082" strokeWidth="2"/>{[30,55,80,105,130,155].map(x=><circle key={x} cx={x} cy="55" r="5" fill="#d9f1f5" stroke="#b00082" strokeWidth="2"/>)}<text x="62" y="30" fill="#b00082">Pipeline</text></g>}
    {kind === "anchorage" && <g stroke="#b00082" strokeWidth="3" fill="none"><circle cx="90" cy="50" r="40"/><path d="M90 20v48M75 34h30M67 59q23 30 46 0M67 59l2 14M113 59l-2 14"/></g>}
    {kind === "chart-note" && <g fill="#b00082" fontFamily="serif" textAnchor="middle"><text x="90" y="43" fontSize="18">See Note</text><text x="90" y="66" fontSize="14">Restricted area</text></g>}
  </svg>;
};

const ChartSymbolQuiz = () => {
  const [initialAttempt] = useState(loadAttempt);
  const [index, setIndex] = useState(initialAttempt.index);
  const [choice, setChoice] = useState(initialAttempt.choice);
  const [checked, setChecked] = useState(initialAttempt.checked);
  const [correctIds, setCorrectIds] = useState<string[]>(initialAttempt.correctIds);
  const [complete, setComplete] = useState(initialAttempt.complete);
  const question = chartSymbolQuestions[index];
  const optionOffset = index % question.options.length;
  const displayedOptions = [...question.options.slice(optionOffset), ...question.options.slice(0, optionOffset)];
  const correct = choice === question.answer;
  const submit = () => { if (!choice || checked) return; setChecked(true); if (correct) setCorrectIds(ids => ids.includes(question.id) ? ids : [...ids, question.id]); };
  const next = () => { if (index === chartSymbolQuestions.length - 1) setComplete(true); else { setIndex(i => i + 1); setChoice(""); setChecked(false); } };
  const retry = () => { setIndex(0); setChoice(""); setChecked(false); setCorrectIds([]); setComplete(false); };
  const masteryTarget = 11;
  const mastered = correctIds.length >= masteryTarget;

  useEffect(() => {
    try { localStorage.setItem(CHART_SYMBOL_ATTEMPT_KEY, JSON.stringify({ version: 1, index, choice, checked, correctIds, complete } satisfies StoredAttempt)); }
    catch { /* Assessment remains usable when storage is blocked. */ }
  }, [index, choice, checked, correctIds, complete]);

  if (complete) return <Card className="mx-auto mt-8 w-full max-w-2xl border-2 border-primary"><CardContent className="space-y-4 pt-6 text-center"><h2 className="text-2xl font-bold">Assessment complete</h2><p className="text-4xl font-bold text-primary">{correctIds.length} / {chartSymbolQuestions.length}</p><p role="status">{mastered ? "Mastery achieved: at least 11 of 13 correct." : "Mastery needs 11 of 13. Review the explanations and retry the full set."}</p><Button onClick={retry}><RefreshCcw className="mr-2 h-4 w-4"/>Retry assessment</Button></CardContent></Card>;

  return <Card className="mx-auto mt-8 w-full max-w-2xl border-2 border-secondary/20"><CardHeader><CardTitle className="flex flex-wrap items-center justify-between gap-2"><span>Authoritative chart-symbol assessment</span><span className="text-sm font-normal">Question {index + 1} of {chartSymbolQuestions.length}</span></CardTitle><progress className="w-full" aria-label="Assessment progress" value={index + 1} max={chartSymbolQuestions.length}/></CardHeader><CardContent className="space-y-5"><div className="rounded-xl border bg-muted p-3"><SymbolDiagram kind={question.kind}/></div><form onSubmit={e => { e.preventDefault(); submit(); }}><fieldset disabled={checked} className="space-y-3"><legend className="mb-3 font-medium">{question.prompt}</legend>{displayedOptions.map(option => <label key={option} className="flex min-h-11 cursor-pointer items-start gap-3 rounded-md border p-3 has-[:focus-visible]:ring-2 has-[:checked]:border-primary"><input type="radio" name={`question-${question.id}`} value={option} checked={choice === option} onChange={e => setChoice(e.target.value)} className="mt-1"/><span>{option}</span></label>)}</fieldset>{!checked && <Button className="mt-4 w-full" type="submit" disabled={!choice}>Check answer</Button>}</form>{checked && <div className={`rounded-md border p-4 ${correct ? "border-green-600 bg-green-50 text-green-950" : "border-red-600 bg-red-50 text-red-950"}`} role="status"><p className="flex items-center gap-2 font-semibold">{correct ? <CheckCircle2 aria-hidden="true"/> : <XCircle aria-hidden="true"/>}{correct ? "Correct" : `Not quite. Correct answer: ${question.answer}`}</p><p className="mt-2">{question.explanation}</p><p className="mt-2 text-sm"><strong>Catalogue:</strong> {question.reference}</p><Button onClick={next} className="mt-4 w-full">{index < chartSymbolQuestions.length - 1 ? "Next question" : "See results"}</Button></div>}<aside className="text-xs text-muted-foreground"><strong>Source and rights:</strong> These are original schematic teaching drawings, not UKHO or IHO catalogue artwork. Catalogue references identify where to verify the meaning in <a className="underline" href="https://iho.int/en/int1" target="_blank" rel="noreferrer">IHO INT 1</a>, the IALA Maritime Buoyage System and the separately published UKHO Chart 5011. Use is subject to the publisher's <a className="underline" href="https://www.admiralty.co.uk/copyright" target="_blank" rel="noreferrer">ADMIRALTY copyright and licensing terms</a>. Confirm the current chart's edition, corrections, symbols and notes.</aside></CardContent></Card>;
};

export default ChartSymbolQuiz;
