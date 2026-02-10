import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Compass, RotateCw, Globe } from "lucide-react";
import { useEffect } from "react";
import { useTheoryCompletionGate } from "@/features/progress/useTheoryCompletionGate";
import CompassConverter from "@/components/navigation/CompassConverter";
import DeviationDrill from "@/components/navigation/DeviationDrill";

const CompassTheory = () => {
  const navigate = useNavigate();
  const { canComplete, markCompleted, markSectionVisited } = useTheoryCompletionGate({
    topicId: "compass-theory",
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
    <div className="min-h-screen bg-gradient-to-br from-background via-ocean-light/10 to-background pb-20">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/navigation")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">The Magnetic Compass</h1>
              <p className="text-sm text-muted-foreground">Variation, Deviation and the CADET Rule</p>
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

        {/* CADET Rule */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <RotateCw className="w-6 h-6 text-green-500" />
            The CADET Rule
          </h2>
          <Card className="overflow-hidden">
            <div className="p-6">
              <p className="text-lg mb-6">To convert between Compass, Magnetic, and True, use the standard mnemonic:</p>

              <div className="bg-muted p-6 rounded-xl border border-border text-center mb-6">
                <span className="text-4xl font-black tracking-widest text-primary">C A D E T</span>
                <p className="mt-2 text-xl font-medium">Compass to True, Add East</p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-semibold text-lg mb-2">Compass → True</h3>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 flex items-center justify-center text-sm font-bold">
                        +
                      </span>
                      <span>ADD East errors</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 flex items-center justify-center text-sm font-bold">
                        -
                      </span>
                      <span>SUBTRACT West errors</span>
                    </li>
                  </ul>
                  <p className="mt-4 text-sm text-muted-foreground italic">"At Easter we Buy (Add) Eggs"</p>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-2">True → Compass</h3>
                  <p className="text-sm mb-2 text-muted-foreground">Reverse the logic:</p>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 flex items-center justify-center text-sm font-bold">
                        -
                      </span>
                      <span>SUBTRACT East errors</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 flex items-center justify-center text-sm font-bold">
                        +
                      </span>
                      <span>ADD West errors</span>
                    </li>
                  </ul>
                  <p className="mt-4 text-sm text-muted-foreground italic">
                    "True Virgins Make Dull Company: True - Var - Mag - Dev - Comp"
                  </p>
                </div>
              </div>

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
                Practice converting headings for different courses. Remember: T - V - D = C.
              </p>
              <DeviationDrill />
            </CardContent>
          </Card>
        </section>

        {/* Deviation & Variation */}
        <section className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-bold text-lg mb-2">Variation</h3>
                <p className="text-muted-foreground">
                  Caused by the Earth's magnetic field not matching the geographic poles.
                </p>
                <ul className="list-disc list-inside mt-2 text-sm text-muted-foreground">
                  <li>
                    Found on the compass rose of the <b>Chart</b>.
                  </li>
                  <li>Changes with time and location.</li>
                  <li>Not affected by the vessel heading.</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <h3 className="font-bold text-lg mb-2">Deviation</h3>
                <p className="text-muted-foreground">
                  Caused by iron/electronics on the vessel deflecting the compass.
                </p>
                <ul className="list-disc list-inside mt-2 text-sm text-muted-foreground">
                  <li>
                    Found on the vessel's <b>Deviation Card</b>.
                  </li>
                  <li>
                    Changes with the vessel's <b>Heading</b>.
                  </li>
                  <li>Unique to each vessel.</li>
                </ul>
              </CardContent>
            </Card>
          </div>
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
