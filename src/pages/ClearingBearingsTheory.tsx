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
                  <strong>Tip:</strong> Always add a safety margin beyond the
                  hazard when drawing your clearing bearing line. Chart
                  accuracy and tidal height can shift actual danger zones.
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
            </div>

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
              <CardHeader>
                <CardTitle className="text-lg">Monitoring Procedure</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-3">
                <ol className="list-decimal list-inside space-y-2">
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
                    <strong>If the bearing drifts</strong> to the wrong side,
                    alter course immediately to move back into safe water.
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
