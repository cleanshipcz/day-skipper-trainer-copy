import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Compass, RotateCw, Globe } from "lucide-react";
import { useEffect } from "react";
import { useTheoryCompletionGate } from "@/features/progress/useTheoryCompletionGate";
import CompassConverter from "@/components/navigation/CompassConverter";
import DeviationDrill from "@/components/navigation/DeviationDrill";
import CompassReference from "@/components/navigation/CompassReference";
import { TOPIC_IDS } from "@/constants/topicRegistry";

const CompassTheory = () => {
  const navigate = useNavigate();
  const { canComplete, markCompleted, markSectionVisited } = useTheoryCompletionGate({
    topicId: TOPIC_IDS.COMPASS_THEORY,
    requiredSectionIds: ["read-content"],
    pointsOnComplete: 10,
  });

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
    <div className="min-h-screen overflow-x-hidden bg-gradient-to-br from-background via-ocean-light/10 to-background pb-20">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button aria-label="Back to Navigation from The Magnetic Compass" variant="ghost" size="icon" className="min-h-11 min-w-11" onClick={() => navigate("/navigation")}>
              <ArrowLeft aria-hidden className="w-5 h-5" />
            </Button>
            <div className="min-w-0">
              <h1 className="text-xl font-bold">The Magnetic Compass</h1>
              <p className="text-sm text-muted-foreground">Variation, deviation and traceable conversions</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl space-y-8">
        {/* Intro */}
        <section>
          <div className="prose dark:prose-invert max-w-none">
            <p className="text-lg leading-relaxed">
              Navigating requires converting between the direction on your chart (True) and the direction on your
              vessel's compass. To do this, you must account for two main errors: <b>Variation</b> (Earth's magnetic
              field) and
              <b>Deviation</b> (Vessel's magnetic field).
            </p>
          </div>
        </section>

        {/* The Three Norths */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <Compass className="w-6 h-6 text-primary" />
            The Three Norths
          </h2>

          <div className="grid md:grid-cols-3 gap-4">
            <Card className="bg-blue-500/5 border-blue-500/20">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <Globe className="w-8 h-8 text-blue-500 mb-3" />
                  <h3 className="font-bold text-lg mb-2">True North (T)</h3>
                  <p className="text-sm text-muted-foreground">
                    The direction to the geographic North Pole. This is what you measure on your <b>Chart</b>.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-amber-500/5 border-amber-500/20">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <RotateCw className="w-8 h-8 text-amber-500 mb-3" />
                  <h3 className="font-bold text-lg mb-2">Magnetic North (M)</h3>
                  <p className="text-sm text-muted-foreground">
                    The direction the Earth's magnetic field points. The difference from True North is <b>Variation</b>.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-red-500/5 border-red-500/20">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <Compass className="w-8 h-8 text-red-500 mb-3" />
                  <h3 className="font-bold text-lg mb-2">Compass North (C)</h3>
                  <p className="text-sm text-muted-foreground">
                    The direction your vessel's compass actually points. The difference from Magnetic North is{" "}
                    <b>Deviation</b>.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <CompassReference />

        {/* Conversion practice */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <RotateCw className="w-6 h-6 text-green-500" />
            Conversion practice
          </h2>
          <Card className="overflow-hidden">
            <div className="p-6">
              {/* Interactive Tool */}
              <CompassConverter />
            </div>
          </Card>
        </section>

        {/* Deviation Drill */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <RotateCw className="w-6 h-6 text-yellow-500" />
            Deviation Drill
          </h2>
          <Card>
            <CardContent className="pt-6">
              <p className="mb-4 text-muted-foreground">
                Practice converting headings for different courses. Use east-positive signed values and the vessel card.
              </p>
              <DeviationDrill />
            </CardContent>
          </Card>
        </section>

        {/* Action Button */}
        <div className="flex justify-center pt-8">
          <Button
            size="lg"
            disabled={!canComplete}
            onClick={async () => {
              await markCompleted();
              navigate("/navigation");
            }}
          >
            {canComplete ? "Complete Module" : "Scroll through module to complete"}
          </Button>
        </div>
      </main>
    </div>
  );
};

export default CompassTheory;
