/**
 * Transits & Leading Lines theory page.
 *
 * Covers all AC-1 requirements:
 *   - What a transit is
 *   - How leading lines guide approach
 *   - Natural vs charted transits
 *   - Maintaining a transit
 *   - Clearing transits
 *
 * Also embeds the interactive TransitExercise component (AC-2, AC-3)
 * and completes the module via useTheoryCompletionGate (AC-4).
 *
 * @see docs/FEATURE_TASKS.md — Story E2-S2
 */
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowLeft,
  Navigation,
  Eye,
  Map,
  Compass,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";
import { useTheoryCompletionGate } from "@/features/progress/useTheoryCompletionGate";
import { TOPIC_IDS } from "@/constants/topicRegistry";
import { TransitExercise } from "@/components/pilotage/TransitExercise";

const TransitsTheory = () => {
  const navigate = useNavigate();
  const { canComplete, markCompleted, markSectionVisited } = useTheoryCompletionGate({
    topicId: TOPIC_IDS.PILOTAGE_TRANSITS,
    requiredSectionIds: ["read-content", "complete-exercise"],
    pointsOnComplete: 10,
  });

  const [exerciseDone, setExerciseDone] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const viewportBottom = window.scrollY + window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;
      if (docHeight <= 0) return;

      const scrollPercent = (viewportBottom / docHeight) * 100;
      if (scrollPercent >= 80) {
        void markSectionVisited("read-content");
      }
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [markSectionVisited]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-ocean-light/10 to-background pb-20">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/pilotage")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">Transits &amp; Leading Lines</h1>
              <p className="text-sm text-muted-foreground">Pilotage — Visual Navigation Aids</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl space-y-8">
        {/* ── What is a Transit ─────────────────────────────────────────── */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <Eye className="w-6 h-6 text-primary" />
            What is a Transit?
          </h2>
          <div className="prose dark:prose-invert max-w-none">
            <p className="text-lg leading-relaxed">
              A <strong>transit</strong> (or <em>range</em>) occurs when two fixed objects appear
              to line up from the observer's position. When you see two charted features — such
              as two beacons, a lighthouse and a church spire, or two posts — in line, you know
              you are somewhere on the straight line that passes through both objects.
            </p>
            <p>
              Alignment proves only that you are on the marks' extended line. It does
              <strong> not</strong> prove that the water is safe. Follow it as a leading line only
              after the current chart and sailing directions identify the marks, the direction
              of use, and the safe, usable part of the line.
            </p>
          </div>
        </section>

        {/* ── Leading Lines ────────────────────────────────────────────── */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <Navigation className="w-6 h-6 text-teal-500" />
            How Leading Lines Guide Approach
          </h2>
          <Card>
            <CardContent className="pt-6 space-y-4">
              <p>
                <strong>Leading lines</strong> (also called <em>leading marks</em> or{" "}
                <em>range marks</em>) are pairs of markers deliberately placed to guide vessels
                along a safe channel. The front mark is lower and nearer; the rear mark is
                higher and farther away.
              </p>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-4 bg-muted rounded-lg">
                  <h3 className="font-bold mb-2">How to use them</h3>
                  <ol className="list-decimal list-inside text-sm space-y-1">
                    <li>Identify the front and rear marks on the chart and visually.</li>
                    <li>Steer so the rear mark appears <strong>directly above</strong> the front mark.</li>
                    <li>If the rear mark is right of the front mark, you are right of the line — plan a safe track back towards the line.</li>
                    <li>If the rear mark is left of the front mark, you are left of the line — plan a safe track back towards the line.</li>
                  </ol>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <h3 className="font-bold mb-2">Key advantages</h3>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    <li>Gives a sensitive, immediate indication of lateral displacement.</li>
                    <li>No instruments needed — purely visual.</li>
                    <li>Can be precise within its charted useful segment and visibility limits.</li>
                    <li>Immediately shows if tide or wind is setting you off track.</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* ── Natural vs Charted Transits ──────────────────────────────── */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <Map className="w-6 h-6 text-blue-500" />
            Natural vs Charted Transits
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-bold text-lg mb-2">Charted Transits</h3>
                <p className="text-muted-foreground mb-3">
                  Shown on the chart with their identity and direction. Read the charted
                  bearing in the stated direction: a reciprocal course may not be authorised
                  or safe.
                </p>
                <ul className="list-disc list-inside text-sm space-y-1">
                  <li>Match each mark by name/description, position, structure and light character.</li>
                  <li>Confirm the charted bearing/direction and the line's useful segment.</li>
                  <li>Front and rear marks are distinctive in shape/colour.</li>
                  <li>At night, use only if the chart/List of Lights confirms both lights and their sectors/ranges.</li>
                  <li>Do not extend the line beyond charted lateral or along-track limits.</li>
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-bold text-lg mb-2">Natural Transits</h3>
                <p className="text-muted-foreground mb-3">
                  Two fixed, positively identified features may provide a useful position line,
                  but they are not a surveyed safe track unless the chart says so.
                </p>
                <ul className="list-disc list-inside text-sm space-y-1">
                  <li>Church spire with a headland edge.</li>
                  <li>Pier end with a conspicuous tree.</li>
                  <li>Two hilltops or chimneys in line.</li>
                  <li>Useful when no official marks exist.</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* ── Maintaining a Transit ────────────────────────────────────── */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <Compass className="w-6 h-6 text-amber-500" />
            Maintaining a Transit
          </h2>
          <Card className="bg-muted">
            <CardContent className="pt-6 space-y-4">
              <p>Use this observer-view rule while looking towards the marks:</p>
              <div className="p-4 bg-background rounded-lg border">
                <p className="font-bold text-center text-lg mb-2">
                  &quot;The rear mark appears on the same side as the vessel is from the line.&quot;
                </p>
                <p className="text-sm text-center text-muted-foreground">
                  If the rear mark appears to move <strong>right</strong> of the front mark, you
                  are to the <strong>right</strong> of the line. That identifies your lateral
                  position; it does not, by itself, prescribe a helm direction.
                </p>
              </div>
              <figure className="rounded-lg border bg-background p-4">
                <svg
                  viewBox="0 0 720 230"
                  role="img"
                  aria-labelledby="transit-observer-title transit-observer-desc"
                  className="h-auto w-full"
                >
                  <title id="transit-observer-title">Observer view of transit mark alignment</title>
                  <desc id="transit-observer-desc">
                    Three labelled views. Left of the transit line, the rear triangular mark appears left of the front rectangular mark. On the line they align. Right of the line, the rear mark appears right of the front mark.
                  </desc>
                  {[0, 240, 480].map((x) => (
                    <g key={x} transform={`translate(${x} 0)`}>
                      <rect x="8" y="8" width="224" height="210" rx="8" fill="none" stroke="currentColor" />
                      <path d="M20 155 H220" stroke="currentColor" strokeDasharray="8 5" />
                    </g>
                  ))}
                  <g transform="translate(0 0)">
                    <path d="M76 82 L94 116 H58 Z" fill="none" stroke="currentColor" strokeWidth="4" />
                    <rect x="118" y="113" width="32" height="42" fill="none" stroke="currentColor" strokeWidth="4" />
                    <text x="120" y="185" textAnchor="middle" fill="currentColor" fontSize="15" fontWeight="700">LEFT OF LINE</text>
                    <text x="120" y="205" textAnchor="middle" fill="currentColor" fontSize="13">rear appears left</text>
                  </g>
                  <g transform="translate(240 0)">
                    <path d="M120 70 L138 104 H102 Z" fill="none" stroke="currentColor" strokeWidth="4" />
                    <rect x="104" y="113" width="32" height="42" fill="none" stroke="currentColor" strokeWidth="4" />
                    <text x="120" y="185" textAnchor="middle" fill="currentColor" fontSize="15" fontWeight="700">ON THE LINE</text>
                    <text x="120" y="205" textAnchor="middle" fill="currentColor" fontSize="13">marks aligned</text>
                  </g>
                  <g transform="translate(480 0)">
                    <path d="M164 82 L182 116 H146 Z" fill="none" stroke="currentColor" strokeWidth="4" />
                    <rect x="90" y="113" width="32" height="42" fill="none" stroke="currentColor" strokeWidth="4" />
                    <text x="120" y="185" textAnchor="middle" fill="currentColor" fontSize="15" fontWeight="700">RIGHT OF LINE</text>
                    <text x="120" y="205" textAnchor="middle" fill="currentColor" fontSize="13">rear appears right</text>
                  </g>
                  <text x="16" y="28" fill="currentColor" fontSize="12">△ rear (farther)</text>
                  <text x="16" y="47" fill="currentColor" fontSize="12">□ front (nearer)</text>
                </svg>
                <figcaption className="mt-3 text-sm text-muted-foreground">
                  Shape, position and text carry the meaning; colour is not required. This is
                  the view from the vessel looking towards the marks. The labels show position,
                  not the alteration to make.
                </figcaption>
              </figure>
              <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm dark:border-amber-800 dark:bg-amber-950">
                <p className="font-bold">Position first; safe alteration second</p>
                <p className="mt-2">
                  Move or steer towards the transit line only when it is safe to do so. A
                  port/starboard rule is valid only in the narrow case where the vessel is
                  heading towards the marks, approximately along the intended leading-line
                  direction: then a vessel right of the line would normally alter to port, and
                  one left of the line would normally alter to starboard. On a reciprocal or
                  oblique heading, or if the vessel is already converging, that mapping can be
                  wrong. The planned course, traffic, depths, dangers and ordinary safe
                  navigation govern the actual alteration.
                </p>
              </div>
              <div className="grid md:grid-cols-3 gap-4 mt-4">
                <div className="text-center p-3">
                  <div className="text-3xl mb-2">✅</div>
                  <strong className="block text-sm">On Transit</strong>
                  <p className="text-xs text-muted-foreground">
                    Marks aligned — you are on the line, not necessarily in safe water.
                  </p>
                </div>
                <div className="text-center p-3">
                  <div className="text-3xl mb-2" aria-hidden="true">R</div>
                  <strong className="block text-sm">Rear Mark Right</strong>
                  <p className="text-xs text-muted-foreground">
                    You are right of the line — recover towards the line when safe.
                  </p>
                </div>
                <div className="text-center p-3">
                  <div className="text-3xl mb-2" aria-hidden="true">L</div>
                  <strong className="block text-sm">Rear Mark Left</strong>
                  <p className="text-xs text-muted-foreground">
                    You are left of the line — recover towards the line when safe.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* ── Clearing Transits ────────────────────────────────────────── */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-green-500" />
            Clearing Transits
          </h2>
          <Card>
            <CardContent className="pt-6 space-y-4">
              <p>
                A <strong>clearing line</strong> is a chart-plotted boundary through two positively
                identified fixed marks. Unlike a leading line, you do not steer along it: you
                keep the vessel on the named safe side, with a deliberate margin.
              </p>
              <div className="p-4 bg-amber-50 dark:bg-amber-950 rounded-lg border border-amber-200 dark:border-amber-800">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-bold text-sm">Chart-based worked example (training names)</p>
                    <p className="text-sm">
                      On a training chart, plot the line through <strong>West Pier Light</strong>
                      (near mark) and <strong>St Anne's Church spire</strong> (far mark). Soundings
                      and the drying rock place the danger north of the plotted line, so the
                      passage plan names <strong>south of the line as the safe side</strong>. Keep
                      the church spire visibly open to the south (left in the planned observer
                      view), and set a further offing inside the safe side for position
                      uncertainty, tide, wind and handling. Alignment is the limit — not the
                      target and not the moment to begin correcting.
                    </p>
                  </div>
                </div>
              </div>
              <ul className="list-disc list-inside text-sm space-y-1 mt-2">
                <li>
                  <strong>Open</strong> only describes separation; it is safe only on the side named in the plan.
                </li>
                <li>
                  <strong>Closed / In transit</strong> = the marks line up — you are on the boundary.
                </li>
                <li>Verify the safe side from charted dangers and depths; write the mark order and expected left/right view into the plan.</li>
                <li>Use the line only where both marks remain distinct and visible; haze, darkness, backlighting, obstruction, light sectors and nominal/geographical range can remove the cue.</li>
                <li>Cross-check position and depth by independent means. A clearing line does not account for uncharted change or guarantee under-keel clearance.</li>
              </ul>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-4" aria-labelledby="before-use-heading">
          <h2 id="before-use-heading" className="text-2xl font-semibold">Before relying on either line</h2>
          <Card>
            <CardContent className="pt-6 space-y-3">
              <ol className="list-decimal list-inside text-sm space-y-2">
                <li>Use the largest-scale current official chart; identify both marks without ambiguity.</li>
                <li>Check the charted bearing/direction, useful segment, lateral limits, dangers and depths.</li>
                <li>Check current Sailing Directions, List of Lights, local notices, Notices to Mariners and navigational warnings.</li>
                <li>Allow for visibility, light characteristics/sectors/ranges, height of eye, tide, wind, position uncertainty and manoeuvring room.</li>
                <li>Brief a loss-of-visual-reference action and monitor by independent position and depth information.</li>
              </ol>
              <p className="text-sm font-medium">
                Training sketches are not navigation data. Do not infer a safe side, bearing or
                clearance from appearance alone.
              </p>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-3" aria-labelledby="sources-heading">
          <h2 id="sources-heading" className="text-2xl font-semibold">Authoritative references</h2>
          <ul className="list-disc list-inside text-sm space-y-2">
            <li>
              <a className="underline" href="https://www.gov.uk/government/publications/mgn-610-mf-amendment-1-solas-chapter-v-guidance-on-the-merchant-shipping-safety-of-navigation-regulations-2020/mgn-610-mf-amendment-1-navigation-solas-chapter-v-guidance-on-the-merchant-shipping-safety-of-navigation-regulations-2020" target="_blank" rel="noreferrer">MCA MGN 610 (M+F), Amendment 1</a>
              {" "}— charts must show navigational marks and dangers; charts and publications must be adequate and up to date.
            </li>
            <li>
              <a className="underline" href="https://www.admiralty.co.uk/publications/publications-and-reference-guides/general-publications-and-reference-guides" target="_blank" rel="noreferrer">UKHO ADMIRALTY general publications and reference guides</a>
              {" "}— chart symbols (NP5011), The Mariner's Handbook (NP100), current editions and amendments.
            </li>
            <li>
              <a className="underline" href="https://msi.admiralty.co.uk/NoticesToMariners/About" target="_blank" rel="noreferrer">UKHO ADMIRALTY Notices to Mariners</a>
              {" "}— weekly safety-critical corrections to charts and publications.
            </li>
          </ul>
        </section>

        {/* ── Interactive Exercise ──────────────────────────────────────── */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <Navigation className="w-6 h-6 text-primary" />
            Practice: Transit Alignment Exercise
          </h2>
          <p className="text-muted-foreground">
            Read each observer sight picture and identify where the front mark appears relative to the rear mark. Complete all three assessments
            of increasing difficulty.
          </p>
          <TransitExercise
            onComplete={(result) => {
              void markSectionVisited("complete-exercise");
              setExerciseDone(true);
            }}
          />
          {exerciseDone && (
            <p className="text-sm text-green-600 dark:text-green-400 font-medium text-center">
              ✓ Exercise completed!
            </p>
          )}
        </section>

        {/* ── Complete Module Button ────────────────────────────────────── */}
        <div className="flex justify-center pt-8">
          <Button
            size="lg"
            disabled={!canComplete}
            onClick={async () => {
              await markCompleted();
              navigate("/pilotage");
            }}
          >
            {canComplete ? "Complete Module" : "Scroll through module to complete"}
          </Button>
        </div>
      </main>
    </div>
  );
};

export default TransitsTheory;
