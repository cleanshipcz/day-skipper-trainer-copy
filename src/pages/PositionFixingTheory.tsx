import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Crosshair, Globe, MapPin, Target, Compass } from "lucide-react";
import { useProgress } from "@/hooks/useProgress";
import { useEffect } from "react";
// import FixSimulator from "@/components/navigation/FixSimulator"; // Keeping for reference if needed, but unused
import UnifiedChartTable from "@/components/navigation/unified/UnifiedChartTable";

const PositionFixingTheory = () => {
  const navigate = useNavigate();
  const { saveProgress } = useProgress();

  useEffect(() => {
    // Mark as completed on visit
    saveProgress("position-theory", true, 100, 10);
  }, [saveProgress]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-ocean-light/10 to-background pb-20">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/navigation")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">Position Fixing</h1>
              <p className="text-sm text-muted-foreground">Knowing Where You Are</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl space-y-8">
        {/* Intro */}
        <section>
          <div className="prose dark:prose-invert max-w-none">
            <p className="text-lg leading-relaxed">
              Defining your position accurately is the cornerstone of navigation. You must be able to define your
              position using the global grid system (Latitude & Longitude) and verify it using objects in the real world
              (Visual Fixes).
            </p>
          </div>
        </section>

        {/* Latitude & Longitude */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <Globe className="w-6 h-6 text-primary" />
            Latitude & Longitude
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-bold text-lg mb-2">Latitude (Lat)</h3>
                <p className="text-muted-foreground mb-4">Measures North or South of the Equator (0°).</p>
                <ul className="list-disc list-inside text-sm text-foreground space-y-1">
                  <li>Lines run Horizontal (Parallels).</li>
                  <li>
                    Scale is on the <b>Side</b> of the chart.
                  </li>
                  <li>1 minute of Latitude = 1 Nautical Mile.</li>
                  <li>Format: 50° 45'.5 N</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <h3 className="font-bold text-lg mb-2">Longitude (Long)</h3>
                <p className="text-muted-foreground mb-4">Measures East or West of the Prime Meridian (0°).</p>
                <ul className="list-disc list-inside text-sm text-foreground space-y-1">
                  <li>Lines run Vertical (Meridians).</li>
                  <li>
                    Scale is on the <b>Top/Bottom</b> of the chart.
                  </li>
                  <li>
                    <b>NEVER</b> measure distance on the Longitude scale.
                  </li>
                  <li>Format: 001° 30'.2 W</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Visual Fixes */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <Crosshair className="w-6 h-6 text-red-500" />
            Visual Fixes
          </h2>
          <Card className="overflow-hidden">
            <div className="p-6">
              <p className="mb-6">
                A "Fix" is a position determined by reference to real-world objects. The most common method is the
                <b> Three Point Fix</b> using visual bearings.
              </p>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="flex flex-col gap-2">
                  <div className="p-3 bg-muted rounded-lg flex items-center justify-center h-24">
                    <Target className="w-10 h-10 text-primary" />
                  </div>
                  <h3 className="font-bold">1. Select Objects</h3>
                  <p className="text-sm text-muted-foreground">
                    Choose 3 charted objects spread roughly 60° - 120° apart for the best "cut".
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="p-3 bg-muted rounded-lg flex items-center justify-center h-24">
                    <Compass className="w-10 h-10 text-primary" />
                  </div>
                  <h3 className="font-bold">2. Take Bearings</h3>
                  <p className="text-sm text-muted-foreground">
                    Use a hand-bearing compass. Record the time and the log reading.
                    <b> Convert to True!</b> (Compass → True).
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="p-3 bg-muted rounded-lg flex items-center justify-center h-24">
                    <MapPin className="w-10 h-10 text-primary" />
                  </div>
                  <h3 className="font-bold">3. Plot on Chart</h3>
                  <p className="text-sm text-muted-foreground">
                    Draw the lines from the objects. Where they intersect is your position. If they form a "Cocked Hat"
                    (triangle), you are inside it.
                  </p>
                </div>
              </div>

              <UnifiedChartTable />
            </div>
          </Card>
        </section>

        <section className="space-y-4">
          <Card className="bg-muted">
            <CardContent className="pt-6">
              <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Dead Reckoning (DR) vs Estimated Position (EP)
              </h3>
              <div className="grid md:grid-cols-2 gap-8 mt-4">
                <div>
                  <strong className="block mb-1">Dead Reckoning (DR)</strong>
                  <p className="text-sm text-muted-foreground">
                    Your position based ONLY on Course Steered and Distance Run (Log). Does not account for tide or
                    leeway.
                  </p>
                </div>
                <div>
                  <strong className="block mb-1">Estimated Position (EP)</strong>
                  <p className="text-sm text-muted-foreground">
                    Your DR position corrected for the effects of Tide and Leeway. This is your best guess without a
                    Fix.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Action Button */}
        <div className="flex justify-center pt-8">
          <Button size="lg" onClick={() => navigate("/navigation")}>
            Back to Menu
          </Button>
        </div>
      </main>
    </div>
  );
};

export default PositionFixingTheory;
