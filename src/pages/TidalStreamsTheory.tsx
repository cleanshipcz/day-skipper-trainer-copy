import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TOPIC_IDS } from "@/constants/topicRegistry";
import { TheoryCompletionButton } from "@/features/progress/TheoryCompletionButton";
import { solveCourseToSteer } from "@/lib/navigation/tidalCourse";

type ReadinessAnswer = "" | "071" | "090" | "109";

const workedSolution = solveCourseToSteer({ desiredTrackTrue: 90, boatSpeed: 6, streamSetTrue: 180, streamRate: 2, intervalHours: 1, legDistance: 5.7 });
if (!workedSolution) throw new Error("The published tidal-stream teaching example must remain feasible");
const workedCourse = workedSolution.courseTrue.toFixed(1);
const workedDistance = workedSolution.distanceMadeGood.toFixed(3);
const workedSog = workedSolution.speedOverGround.toFixed(3);
const workedEtaHours = (workedSolution.etaMinutes / 60).toFixed(3);
const workedEtaMinutes = workedSolution.etaMinutes.toFixed(2);

const TidalStreamsTheory = () => {
  const navigate = useNavigate();
  const [readinessAnswer, setReadinessAnswer] = useState<ReadinessAnswer>("");
  const readinessPassed = readinessAnswer === "071";

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-card/90 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" aria-label="Back to tides menu" onClick={() => navigate("/navigation/tides")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div><h1 className="text-xl font-bold">Chart-ready course to steer</h1><p className="text-sm text-muted-foreground">A complete tidal-vector construction</p></div>
          </div>
          <TheoryCompletionButton topicId={TOPIC_IDS.TIDES_STREAMS_THEORY} catalogueRevision="tides-streams-theory-v2" evidenceId="chart-ready-cts-check" evidenceSatisfied={readinessPassed} lockedLabel="Complete the readiness check" />
        </div>
      </header>

      <main className="container mx-auto max-w-4xl space-y-8 px-4 py-8">
        <section className="space-y-4" aria-labelledby="language-heading">
          <h2 id="language-heading" className="text-2xl font-bold text-primary">Use the words precisely</h2>
          <Card><CardContent className="pt-6">
            <dl className="grid gap-4 md:grid-cols-2">
              <div><dt className="font-bold">Heading</dt><dd>The direction the bow points. It is not necessarily the direction the boat moves.</dd></div>
              <div><dt className="font-bold">Course / course to steer (CTS)</dt><dd>A planned direction of travel; here, the heading to maintain after allowing for stream and, separately, leeway.</dd></div>
              <div><dt className="font-bold">Desired ground track</dt><dd>The intended line over the seabed from the departure position toward the destination.</dd></div>
              <div><dt className="font-bold">Course made good (CMG)</dt><dd>The direction actually achieved over the ground between two observed positions.</dd></div>
              <div><dt className="font-bold">Through-water vector</dt><dd>The boat's motion relative to the water: direction through the water and boat speed.</dd></div>
              <div><dt className="font-bold">Speed over ground (SOG)</dt><dd>The rate of motion over the seabed, measured in knots.</dd></div>
              <div><dt className="font-bold">Set and rate</dt><dd><strong>Set</strong> is the direction the stream flows <em>toward</em>; <strong>rate</strong> is its speed in knots. <strong>Drift</strong> is the distance the stream carries the boat during the chosen interval.</dd></div>
            </dl>
          </CardContent></Card>
        </section>

        <section className="space-y-4" aria-labelledby="worked-heading">
          <h2 id="worked-heading" className="text-2xl font-bold text-primary">Worked chart construction</h2>
          <Card>
            <CardHeader><CardTitle>Training example: A to B</CardTitle><CardDescription>Invented teaching data only — not an almanac prediction and not suitable for navigation.</CardDescription></CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-md border-l-4 border-amber-500 bg-amber-50 p-4 text-sm text-amber-950">
                On a fictional training chart, depart A at 1200 on a desired ground track of <strong>090°T</strong>. Boat speed is <strong>6.0 kn</strong>. For 1200–1300, an invented stream diamond gives <strong>set 180°T, rate 2.0 kn</strong>. Use a <strong>one-hour interval</strong> and a common scale of <strong>1 cm = 1 NM</strong>.
              </div>

              <figure className="space-y-3">
                <svg viewBox="0 0 720 360" role="img" aria-labelledby="cts-diagram-title cts-diagram-desc" className="h-auto w-full rounded-lg border bg-slate-50">
                  <title id="cts-diagram-title">Course-to-steer vector triangle for the worked example</title>
                  <desc id="cts-diagram-desc">From A, the red tidal arrow goes two nautical miles south to T. A six nautical mile blue through-water arrow goes from T toward bearing {Math.round(workedSolution.courseTrue).toString().padStart(3, "0")} degrees true to G. G lies {workedSolution.distanceMadeGood.toFixed(1)} nautical miles east of A on the green desired ground track.</desc>
                  <defs><marker id="red-arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto"><path d="M0,0 L0,6 L9,3 z" fill="#dc2626" /></marker><marker id="blue-arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto"><path d="M0,0 L0,6 L9,3 z" fill="#2563eb" /></marker><marker id="green-arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto"><path d="M0,0 L0,6 L9,3 z" fill="#15803d" /></marker></defs>
                  <path d="M90 145 H650" stroke="#15803d" strokeWidth="4" markerEnd="url(#green-arrow)" />
                  <path d="M90 145 V305" stroke="#dc2626" strokeWidth="5" markerEnd="url(#red-arrow)" />
                  <path d="M90 305 L543 145" stroke="#2563eb" strokeWidth="5" markerEnd="url(#blue-arrow)" />
                  <path d="M90 145 L543 145" stroke="#15803d" strokeWidth="7" markerEnd="url(#green-arrow)" />
                  <path d="M90 72 V120 M75 96 H105" stroke="#334155" strokeWidth="3" /><text x="112" y="100" fontSize="20" fill="#334155">N</text>
                  <circle cx="90" cy="145" r="7" fill="#0f172a" /><circle cx="90" cy="305" r="7" fill="#0f172a" /><circle cx="543" cy="145" r="7" fill="#0f172a" />
                  <text x="55" y="137" fontSize="20" fontWeight="bold">A</text><text x="55" y="332" fontSize="20" fontWeight="bold">T</text><text x="552" y="137" fontSize="20" fontWeight="bold">G</text>
                  <text x="285" y="128" fontSize="18" fill="#15803d">ground: 090°T, 5.7 NM</text><text x="105" y="235" fontSize="18" fill="#dc2626">stream: 180°T, 2.0 NM</text><text x="270" y="252" fontSize="18" fill="#2563eb" transform="rotate(-19 270 252)">through water: 071°T, 6.0 NM</text>
                </svg>
                <figcaption className="text-sm text-muted-foreground">Vector addition is head-to-tail: A→T (stream) + T→G (through water) = A→G (motion over ground).</figcaption>
              </figure>

              <ol className="list-decimal space-y-3 pl-5">
                <li>From A, draw the desired ground-track ray <strong>090°T</strong>.</li>
                <li>Convert every speed to distance for the <em>same</em> one-hour interval: tidal drift = 2.0 kn × 1 h = <strong>2.0 NM</strong>; boat distance through water = 6.0 kn × 1 h = <strong>6.0 NM</strong>.</li>
                <li>From A, plot the tidal vector <strong>2.0 NM toward 180°T</strong>, ending at T.</li>
                <li>With dividers at 6.0 NM, centre on T and cut the desired-track ray at G. Join T to G. Measure T→G as <strong>{workedCourse}°T</strong>, recorded to the nearest whole degree as <strong>{Math.round(workedSolution.courseTrue).toString().padStart(3, "0")}°T</strong>.</li>
                <li>Measure A→G: √(6² − 2²) = {workedDistance} NM, recorded as <strong>{workedSolution.distanceMadeGood.toFixed(1)} NM distance made good (DMG)</strong>. SOG = {workedSog} NM ÷ 1 h = <strong>{workedSolution.speedOverGround.toFixed(1)} kn</strong>. On this ideal construction CMG is 090°T.</li>
                <li>For a 5.7 NM leg, use the unrounded SOG: ETA = 5.7 NM ÷ {workedSog} kn = <strong>{workedEtaHours} h = {workedEtaMinutes} minutes</strong>, recorded to the nearest minute as <strong>{Math.round(workedSolution.etaMinutes)} minutes after departure, 1300</strong>. Retain unrounded values until the final chart answer; otherwise rounding can shift ETA.</li>
              </ol>

              <div className="overflow-x-auto"><table className="w-full border-collapse text-sm"><caption className="mb-2 text-left font-bold">Structured record matching the diagram</caption><thead><tr><th className="border p-2 text-left">Vector</th><th className="border p-2 text-left">Direction (true)</th><th className="border p-2 text-left">Distance / interval</th></tr></thead><tbody><tr><td className="border p-2">A→T, stream</td><td className="border p-2">180° (toward)</td><td className="border p-2">2.0 NM in 1 h</td></tr><tr><td className="border p-2">T→G, through water</td><td className="border p-2">070.5° → 071°</td><td className="border p-2">6.0 NM in 1 h</td></tr><tr><td className="border p-2">A→G, over ground</td><td className="border p-2">090°</td><td className="border p-2">5.657 → 5.7 NM in 1 h</td></tr></tbody></table></div>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-4" aria-labelledby="boundaries-heading">
          <h2 id="boundaries-heading" className="text-2xl font-bold text-primary">Add leeway, then convert the reference</h2>
          <Card><CardContent className="space-y-4 pt-6">
            <p>The triangle gives a <strong>direction through the water of 071°T</strong>. It does not include wind leeway. If the planning estimate is 4° leeway to starboard, point the bow 4° to port: <strong>heading 067°T</strong>. State the assumed leeway and side; do not silently fold it into the tidal vector.</p>
            <p>Only after tidal and leeway allowances are complete should the true heading be converted. For this invented conversion example only: variation 3°W gives 067°T + 3° = <strong>070°M</strong>; deviation 2°E gives 070°M − 2° = <strong>068°C</strong>. Use the current chart's variation and the vessel's deviation card in real planning.</p>
            <p>Bearings wrap through north: for example, 358° + 5° = <strong>003°</strong>, not 363°. Label every value °T, °M or °C and every speed kn or distance NM.</p>
          </CardContent></Card>
        </section>

        <section className="space-y-4" aria-labelledby="edge-heading">
          <h2 id="edge-heading" className="text-2xl font-bold text-primary">When one stream vector is not enough</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Card><CardHeader><CardTitle>Changing stream, same interval</CardTitle></CardHeader><CardContent className="space-y-2 text-sm"><p>For the same 1200–1300 interval, suppose the invented stream is 180°T at 2 kn for 30 minutes, then 000°T at 1 kn for 30 minutes. Plot consecutive displacements: 1.0 NM south, then 0.5 NM north. Net drift is 0.5 NM south.</p><p>With 6.0 NM through-water distance, the recomputed result is CTS <strong>085.2°T → 085°T</strong>, DMG <strong>5.98 NM → 6.0 NM</strong>, and SOG <strong>5.98 kn → 6.0 kn</strong>. Do not add hourly rates or mix a half-hour tidal drift with a one-hour boat vector.</p></CardContent></Card>
            <Card><CardHeader><CardTitle>No feasible intersection</CardTitle></CardHeader><CardContent className="space-y-2 text-sm"><p>If the desired track is 090°T, boat speed is 6 kn, and stream is 180°T at 7 kn for one hour, the 6 NM divider arc from the tidal-vector tip cannot reach the east-going track. The required 7 NM northward component exceeds the boat's 6 NM capability.</p><p>No CTS exists for those assumptions. Re-plan the time, route, speed or destination; never extend the boat vector to manufacture an answer.</p></CardContent></Card>
          </div>
        </section>

        <section className="space-y-4" aria-labelledby="monitor-heading">
          <h2 id="monitor-heading" className="text-2xl font-bold text-primary">Limitations and monitoring</h2>
          <Card><CardContent className="space-y-3 pt-6"><p>A paper construction is a forecast, not proof of what the boat will do. Stream predictions, boat speed, steering, wind/leeway and sea state all contain uncertainty; streams can vary across a channel and near headlands.</p><p>Use official, current chart and tidal publications. During the passage, fix position at suitable intervals, compare observed CMG/SOG and cross-track error with the plan, check depth and hazards, and revise the CTS or route early. GPS assists monitoring but does not replace a safe plan or lookout.</p></CardContent></Card>
        </section>

        <section className="space-y-4 rounded-lg border p-5" aria-labelledby="check-heading">
          <h2 id="check-heading" className="text-xl font-bold">Readiness check</h2>
          <p>In the worked one-hour example, which true through-water course does the divider construction produce, before leeway and compass conversion?</p>
          <fieldset className="space-y-2"><legend className="sr-only">Choose the true through-water course</legend>{(["071", "090", "109"] as const).map((answer) => <label key={answer} className="flex items-center gap-2"><input type="radio" name="readiness-check" value={answer} checked={readinessAnswer === answer} onChange={() => setReadinessAnswer(answer)} /> {answer}°T</label>)}</fieldset>
          {readinessAnswer && <p role="status" aria-label="Readiness feedback" aria-live="polite" className={readinessPassed ? "text-green-700" : "text-red-700"}>{readinessPassed ? "Correct — 071°T is T→G, the boat's direction through the water. Apply leeway and T→M→C conversion only afterward." : readinessAnswer === "090" ? "Not yet — 090°T is the desired ground track A→G, not the through-water course. Measure T→G." : "Not yet — the correction must aim into the south-going stream. Recheck the direction of T→G and remember that set is toward 180°T."}</p>}
        </section>

        <div className="space-y-2 pt-4 text-center"><p className="text-sm text-muted-foreground">This button is the checked handoff from this lesson. The practice tool also remains independently available from the Tides menu.</p><Button size="lg" disabled={!readinessPassed} onClick={() => navigate("/navigation/tides/vector-tool")} className="bg-purple-600 hover:bg-purple-700">Open Vector Solution Tool <ChevronRight className="ml-2 h-4 w-4" /></Button></div>
      </main>
    </div>
  );
};

export default TidalStreamsTheory;
