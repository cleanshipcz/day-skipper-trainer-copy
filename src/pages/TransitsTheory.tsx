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
              This principle is fundamental to pilotage. By deliberately steering to keep two
              marks &quot;in transit&quot;, a navigator can follow a precise track across the
              water without instruments.
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
                    <li>If the rear mark drifts right, you have drifted left — correct to starboard.</li>
                    <li>If the rear mark drifts left, you have drifted right — correct to port.</li>
                  </ol>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <h3 className="font-bold mb-2">Key advantages</h3>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    <li>Works day and night (lit marks have distinctive light patterns).</li>
                    <li>No instruments needed — purely visual.</li>
                    <li>Very high precision for narrow channels.</li>
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
                  Shown on charts with a dashed line and bearing. These are officially
                  surveyed leading lines placed specifically for navigation.
                </p>
                <ul className="list-disc list-inside text-sm space-y-1">
                  <li>Marked with the bearing to steer (e.g., Ldg Lts 045°).</li>
                  <li>Front and rear marks are distinctive in shape/colour.</li>
                  <li>Often lit for night passage.</li>
                  <li>Maintained by harbour/port authorities.</li>
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-bold text-lg mb-2">Natural Transits</h3>
                <p className="text-muted-foreground mb-3">
                  Any two charted features that a navigator identifies and uses as an
                  improvised transit — not officially designated as leading marks.
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
              <p>
                Holding a transit requires constant small corrections. The key principle is:
              </p>
              <div className="p-4 bg-background rounded-lg border">
                <p className="font-bold text-center text-lg mb-2">
                  &quot;The rear mark moves in the same direction as your drift.&quot;
                </p>
                <p className="text-sm text-center text-muted-foreground">
                  If the rear mark appears to move <strong>right</strong> of the front mark, you
                  are being set to the <strong>left</strong> — steer right to correct.
                </p>
              </div>
              <div className="grid md:grid-cols-3 gap-4 mt-4">
                <div className="text-center p-3">
                  <div className="text-3xl mb-2">✅</div>
                  <strong className="block text-sm">On Transit</strong>
                  <p className="text-xs text-muted-foreground">
                    Both marks perfectly aligned — you are on the safe track.
                  </p>
                </div>
                <div className="text-center p-3">
                  <div className="text-3xl mb-2">➡️</div>
                  <strong className="block text-sm">Rear Mark Right</strong>
                  <p className="text-xs text-muted-foreground">
                    You have drifted left — alter course to starboard.
                  </p>
                </div>
                <div className="text-center p-3">
                  <div className="text-3xl mb-2">⬅️</div>
                  <strong className="block text-sm">Rear Mark Left</strong>
                  <p className="text-xs text-muted-foreground">
                    You have drifted right — alter course to port.
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
                A <strong>clearing transit</strong> is a transit used to ensure you stay in safe
                water — rather than guiding you <em>along</em> a line, it tells you which side
                of a line you must stay on.
              </p>
              <div className="p-4 bg-amber-50 dark:bg-amber-950 rounded-lg border border-amber-200 dark:border-amber-800">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-bold text-sm">Example</p>
                    <p className="text-sm">
                      &quot;Keep the lighthouse <strong>open to the right</strong> of the church
                      spire.&quot; — As long as the lighthouse is visible to the right of the
                      spire, you are in safe water. If they close (line up or cross), you have
                      entered the danger zone.
                    </p>
                  </div>
                </div>
              </div>
              <ul className="list-disc list-inside text-sm space-y-1 mt-2">
                <li>
                  <strong>Open</strong> = the two marks are separated — you are on the safe side.
                </li>
                <li>
                  <strong>Closed / In transit</strong> = the marks line up — you are on the boundary.
                </li>
                <li>Plotted on the chart as a dashed line with shading on the danger side.</li>
                <li>Particularly useful near shoals, rocks, or traffic separation schemes.</li>
              </ul>
            </CardContent>
          </Card>
        </section>

        {/* ── Interactive Exercise ──────────────────────────────────────── */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <Navigation className="w-6 h-6 text-primary" />
            Practice: Transit Alignment Exercise
          </h2>
          <p className="text-muted-foreground">
            Drag the vessel to line up with the transit markers. Try all three exercises
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
