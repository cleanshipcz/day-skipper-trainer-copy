import { useNavigate } from "react-router-dom";
import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  ArrowLeft,
  Target,
  Map as MapIcon,
  ArrowLeftRight,
  Compass,
  Gamepad2,
  CheckCircle2,
} from "lucide-react";
import { ClearingBearingTool } from "@/components/pilotage/ClearingBearingTool";
import { useProgress } from "@/hooks/useProgress";
import { TOPIC_IDS } from "@/constants/topicRegistry";

type WorkedLimitProps = {
  title: string;
  limit: string;
  safeLabel: string;
  mirror?: boolean;
};

const WorkedLimit = ({ title, limit, safeLabel, mirror = false }: WorkedLimitProps) => (
  <figure className="space-y-2">
    <svg
      viewBox="0 0 420 230"
      role="img"
      aria-label={`${title}. Charted object, observer sector, hazard and safety margin. The blue shaded side is safe water: ${safeLabel}.`}
      className="w-full rounded-md border bg-sky-50 dark:bg-slate-950"
    >
      <title>{title}</title>
      <desc>Worked chart diagram. A limiting line runs from the charted object past the hazard and its margin. Blue hatching explicitly marks the safe observer sector.</desc>
      <defs>
        <pattern id={`safe-${mirror ? "right" : "left"}`} width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="10" height="10" fill="#dbeafe" />
          <line x1="0" y1="0" x2="0" y2="10" stroke="#60a5fa" strokeWidth="3" />
        </pattern>
      </defs>
      <polygon points={mirror ? "65,38 335,192 420,230 420,0 65,0" : "65,38 335,192 420,230 0,230 0,0 65,0"} fill={`url(#safe-${mirror ? "right" : "left"})`} opacity="0.9" />
      <line x1="65" y1="38" x2="390" y2="223" stroke="currentColor" strokeWidth="3" />
      <circle cx="65" cy="38" r="10" fill="#f59e0b" stroke="#713f12" strokeWidth="2" />
      <text x="82" y="28" className="fill-current text-[13px] font-semibold">Charted object</text>
      <circle cx="275" cy="153" r="24" fill="#ef4444" opacity="0.8" />
      <circle cx="275" cy="153" r="38" fill="none" stroke="#dc2626" strokeWidth="3" strokeDasharray="7 5" />
      <text x="245" y="158" className="fill-white text-[12px] font-bold">HAZARD</text>
      <text x="284" y="112" className="fill-red-700 dark:fill-red-300 text-[12px]">margin</text>
      <path d={mirror ? "M340 65 l8 18 l-16 0 z" : "M105 180 l8 18 l-16 0 z"} fill="#172554" />
      <text x={mirror ? "300" : "45"} y={mirror ? "58" : "218"} className="fill-current text-[12px]">Observer sector</text>
      <text x={mirror ? "270" : "12"} y="90" className="fill-blue-900 dark:fill-blue-100 text-[14px] font-bold">SAFE SIDE</text>
      <text x="160" y="96" className="fill-current text-[12px] font-semibold">{limit}</text>
    </svg>
    <figcaption className="text-sm text-muted-foreground">{safeLabel}</figcaption>
  </figure>
);

const ClearingBearingsTheory = () => {
  const navigate = useNavigate();
  const { saveProgress } = useProgress();
  const [theoryCompleted, setTheoryCompleted] = useState(false);

  const handleMarkComplete = useCallback(() => {
    saveProgress(TOPIC_IDS.PILOTAGE_CLEARING_BEARINGS, true, 100, 10);
    setTheoryCompleted(true);
  }, [saveProgress]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-ocean-light/10 to-background pb-20">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              aria-label="back"
              onClick={() => navigate("/pilotage")}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">Clearing Bearings</h1>
              <p className="text-sm text-muted-foreground">
                Using bearings to stay in safe water
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Tabs defaultValue="purpose" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 h-auto">
            <TabsTrigger value="purpose" className="py-2">
              <Target className="w-4 h-4 mr-2" />
              Purpose
            </TabsTrigger>
            <TabsTrigger value="plotting" className="py-2">
              <MapIcon className="w-4 h-4 mr-2" />
              Plotting
            </TabsTrigger>
            <TabsTrigger value="conventions" className="py-2">
              <ArrowLeftRight className="w-4 h-4 mr-2" />
              Conventions
            </TabsTrigger>
            <TabsTrigger value="monitoring" className="py-2">
              <Compass className="w-4 h-4 mr-2" />
              Monitoring
            </TabsTrigger>
            <TabsTrigger value="practice" className="py-2">
              <Gamepad2 className="w-4 h-4 mr-2" />
              Practice
            </TabsTrigger>
          </TabsList>

          {/* ── PURPOSE ──────────────────────────────────────────── */}
          <TabsContent value="purpose" className="space-y-6">
            <div className="prose dark:prose-invert max-w-none">
              <h2 className="text-2xl font-bold">
                Purpose of Clearing Bearings
              </h2>
              <p>
                A clearing bearing is a compass bearing of a known, charted
                object that defines the boundary of safe water. By monitoring
                the bearing of the object as you sail, you can ensure your
                vessel stays clear of a hazard without needing a continuous
                fix.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card className="border-l-4 border-l-blue-500">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Target className="w-5 h-5 text-blue-500" />
                    When to Use
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-2">
                  <p>
                    Clearing bearings are essential when navigating near
                    hazards such as rocks, shoals, or wrecks. They are
                    particularly useful during coastal pilotage when
                    visibility allows you to see the reference object.
                  </p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Approaching harbours with off-lying dangers</li>
                    <li>Sailing along a coast with submerged hazards</li>
                    <li>Rounding headlands with rocks or reefs</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-green-500">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    Key Advantage
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  <p>
                    Unlike a full position fix (which requires multiple
                    bearings or instruments), a single clearing bearing needs
                    only one identifiable object and a hand-bearing compass.
                    This makes it quick and simple to use while helming.
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-muted/50">
              <CardContent className="pt-6">
                <p className="text-sm font-medium">
                  <strong>Remember:</strong> A clearing bearing does not tell
                  you exactly where you are — it tells you where you are{" "}
                  <em>not</em>. It defines the boundary between safe water
                  and danger.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── PLOTTING ─────────────────────────────────────────── */}
          <TabsContent value="plotting" className="space-y-6">
            <div className="prose dark:prose-invert max-w-none">
              <h2 className="text-2xl font-bold">
                Plotting Clearing Bearings on a Chart
              </h2>
              <p>
                To establish a clearing bearing, you need to draw a line on
                the chart from a conspicuous, identifiable object that just
                clears the hazard you wish to avoid.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <WorkedLimit title="Worked NLT 045 degrees True limit" limit="Limit 045°T" safeLabel="Safe in this plotted observer sector: NLT 045°T; danger is below the line." />
              <WorkedLimit title="Worked NMT 320 degrees True limit" limit="Limit 320°T" safeLabel="Safe in this plotted observer sector: NMT 320°T; danger is above the line." mirror />
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Step-by-Step Plotting</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-3">
                <ol className="list-decimal list-inside space-y-2">
                  <li>
                    <strong>Identify the hazard</strong> on the chart — a rock,
                    shoal, wreck, or shallow area.
                  </li>
                  <li>
                    <strong>Choose a conspicuous landmark</strong> that is
                    visible from the approach and charted — a lighthouse,
                    church spire, or headland.
                  </li>
                  <li>
                    <strong>Draw a line</strong> from the landmark that just
                    clears the edge of the hazard (or its safety margin).
                  </li>
                  <li>
                    <strong>Measure the bearing</strong> of the line using a
                    plotter or protractor — this is your clearing bearing
                    (True).
                  </li>
                  <li>
                    <strong>Shade and label the safe observer sector</strong> from the chart geometry. NLT/NMT records that plotted side; it does not determine it.
                  </li>
                  <li>
                    <strong>Convert to Magnetic</strong> if using a hand-bearing
                    compass (apply variation and any deviation).
                  </li>
                  <li>
                    <strong>Label the line</strong> on the chart with the bearing
                    and NLT/NMT convention.
                  </li>
                </ol>
              </CardContent>
            </Card>

            <Card className="bg-muted/50">
              <CardContent className="pt-6">
                <p className="text-sm">
                  <strong>Safety margin:</strong> Allow for draught, height of tide above chart datum, under-keel clearance, survey quality and chart/position uncertainty. Tide changes available depth, not the charted hazard's position. If the margin can no longer be assured, use the pre-planned safe action, slow or stop where safe, and obtain a reliable fix—while still accounting for traffic, depth and collision risk.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── CONVENTIONS ───────────────────────────────────────── */}
          <TabsContent value="conventions" className="space-y-6">
            <div className="prose dark:prose-invert max-w-none">
              <h2 className="text-2xl font-bold">
                NLT &amp; NMT Conventions
              </h2>
              <p>
                Clearing bearings use two conventions to indicate which side
                of the bearing is safe. Understanding these is critical to
                avoid sailing into danger.
              </p>
              <p className="font-medium">The inequality is valid only inside the observer sector drawn on the chart. Bearings are circular, not an ordinary number line.</p>
            </div>

            <Card>
              <CardHeader><CardTitle className="text-lg">North-wrap example: 359° / 000°</CardTitle></CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>A plotted safe sector runs clockwise from 355°T through north to 005°T. An observation of 359°T, then 001°T, remains in that sector: it has crossed 000°, not jumped to the other side of the hazard.</p>
                <p><strong>Never decide this case with raw “359 ≥ 005” arithmetic.</strong> Follow the explicitly shaded chart side and compare angular movement within the planned sector.</p>
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2">
              <Card className="border-l-4 border-l-green-600">
                <CardHeader>
                  <CardTitle className="text-lg">
                    Not Less Than (NLT)
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-2">
                  <p>
                    The observed bearing of the landmark must be{" "}
                    <strong>equal to or greater than</strong> the clearing
                    bearing to remain in safe water.
                  </p>
                  <p>
                    <em>Example:</em> If the clearing bearing of a church spire
                    is NLT 045°T, then observing a bearing of 050°T means you
                    are safe. Observing 040°T means you are on the wrong side
                    — closer to the hazard.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-amber-600">
                <CardHeader>
                  <CardTitle className="text-lg">
                    Not More Than (NMT)
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-2">
                  <p>
                    The observed bearing of the landmark must be{" "}
                    <strong>equal to or less than</strong> the clearing bearing
                    to remain in safe water.
                  </p>
                  <p>
                    <em>Example:</em> If the clearing bearing of a lighthouse is
                    NMT 320°T, then observing 315°T means you are safe.
                    Observing 325°T means you are too close to the hazard.
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-destructive/5 border-destructive/20">
              <CardContent className="pt-6">
                <p className="text-sm font-medium">
                  <strong>Critical Warning:</strong> Confusing NLT and NMT can
                  put you on the wrong side of the hazard. Always double-check
                  by asking: "If the bearing increases, am I moving towards or
                  away from danger?"
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── MONITORING ────────────────────────────────────────── */}
          <TabsContent value="monitoring" className="space-y-6">
            <div className="prose dark:prose-invert max-w-none">
              <h2 className="text-2xl font-bold">
                Using a Compass to Monitor Clearing Bearings
              </h2>
              <p>
                Once you have established a clearing bearing, you must
                regularly monitor it with a hand-bearing compass to ensure you
                remain in safe water.
              </p>
            </div>

            <Card>
              <CardHeader><CardTitle className="text-lg">Worked conversion for the observing instrument</CardTitle></CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p><strong>Chart limit 045° True → 041° Magnetic → 043° Compass.</strong></p>
                <p>Example corrections for the <strong>hand-bearing compass actually used</strong>: variation 4°W, so 045°T − 4° = 041°M; that instrument's checked deviation is 2°W, so 041°M + 2° = 043°C. Reverse check: 043°C − 2° = 041°M + 4° = 045°T.</p>
                <p>Write the signs and reference beside every value. Do not borrow the steering-compass deviation card: deviation is specific to the instrument, heading, installation and nearby magnetic influences. If the hand-bearing compass error is not known, establish it or compare in True/Magnetic using another suitable observation.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Monitoring Procedure</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-3">
                <ol className="list-decimal list-inside space-y-2">
                  <li>
                    <strong>Positively identify the object</strong> by appearance, charted position, bearing and another feature; never accept a plausible silhouette alone.
                  </li>
                  <li>
                    <strong>Take regular bearings</strong> of the landmark using
                    a hand-bearing compass — every few minutes, or more
                    frequently in restricted waters.
                  </li>
                  <li>
                    <strong>Compare the observed bearing</strong> to the
                    clearing bearing written on your chart or passage plan.
                  </li>
                  <li>
                    <strong>Apply the NLT/NMT rule:</strong>
                    <ul className="list-disc list-inside ml-4 mt-1">
                      <li>
                        NLT: safe if observed ≥ clearing bearing
                      </li>
                      <li>
                        NMT: safe if observed ≤ clearing bearing
                      </li>
                    </ul>
                  </li>
                  <li>
                    <strong>Monitor the trend</strong>, not just one reading. Increasing frequency near the limit gives time to act before the margin is consumed.
                  </li>
                  <li>
                    <strong>Cross-check</strong> with fixes, depth/soundings, transits, radar or GNSS as appropriate. One clearing limit protects one side only; it is neither a position fix nor proof that every hazard is clear.
                  </li>
                  <li>
                    <strong>If the trend approaches or crosses the unsafe side</strong>, execute the pre-planned corrective course or contingency only when consistent with traffic, collision regulations, depth and channel limits; reduce speed or stop where safe and regain a reliable position.
                  </li>
                </ol>
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Hand-Bearing Compass Tips</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-2">
                  <ul className="list-disc list-inside space-y-1">
                    <li>Stand clear of metal fittings and electronics</li>
                    <li>Brace yourself against the motion of the boat</li>
                    <li>Read the compass at eye level</li>
                    <li>Take three readings and use the average</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Common Pitfalls</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-2">
                  <ul className="list-disc list-inside space-y-1">
                    <li>Forgetting to apply variation (True → Magnetic)</li>
                    <li>Confusing NLT and NMT — always verify on chart</li>
                    <li>Not monitoring frequently enough in tidal waters</li>
                    <li>Using the wrong landmark (misidentification)</li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-muted/50">
              <CardHeader><CardTitle className="text-lg">Keep the plan current</CardTitle></CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>Before relying on the limit, check the chart edition and corrections, chart notes and source/quality information, the relevant Sailing Directions and current Notices to Mariners. Confirm the object remains conspicuous and the planned sector is usable at the expected tide and visibility.</p>
                <p className="font-medium">Authoritative references</p>
                <ul className="list-disc list-inside space-y-1">
                  <li><a className="underline" href="https://www.admiralty.co.uk/maritime-safety-information/admiralty-notices-to-mariners" target="_blank" rel="noreferrer">UK Hydrographic Office — ADMIRALTY Notices to Mariners</a></li>
                  <li><a className="underline" href="https://www.gov.uk/government/publications/mgn-379-mf-navigation-use-of-electronic-navigation-aids" target="_blank" rel="noreferrer">MCA MGN 379 (M+F) — use of electronic navigation aids</a></li>
                  <li><a className="underline" href="https://www.gov.uk/government/publications/solas-v-regulations-safety-of-navigation" target="_blank" rel="noreferrer">MCA — SOLAS Chapter V safety of navigation guidance</a></li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── PRACTICE ──────────────────────────────────────────── */}
          <TabsContent value="practice" className="space-y-6">
            <div className="prose dark:prose-invert max-w-none">
              <h2 className="text-2xl font-bold">
                Clearing Bearing Exercises
              </h2>
              <p>
                Test your knowledge: given a chart with hazards and landmarks,
                determine the correct clearing bearing for each scenario.
              </p>
            </div>

            <ClearingBearingTool />
          </TabsContent>
        </Tabs>

        {/* Completion & Navigation */}
        <div className="flex flex-col items-center gap-4 pt-12 pb-8">
          <Button
            size="lg"
            className="w-full md:w-auto gap-2"
            variant={theoryCompleted ? "outline" : "default"}
            disabled={theoryCompleted}
            onClick={handleMarkComplete}
          >
            {theoryCompleted ? (
              <>
                <CheckCircle2 className="w-5 h-5" />
                Completed
              </>
            ) : (
              "Mark as Complete"
            )}
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="w-full md:w-auto"
            onClick={() => navigate("/pilotage")}
          >
            Back to Pilotage Menu
          </Button>
        </div>
      </main>
    </div>
  );
};

export default ClearingBearingsTheory;
