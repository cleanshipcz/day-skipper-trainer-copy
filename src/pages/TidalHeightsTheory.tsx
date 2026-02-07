import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, ChevronRight, CheckCircle2, TrendingUp, Calculator } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useCompletion } from "@/hooks/useCompletion";

const TidalHeightsTheory = () => {
  const navigate = useNavigate();
  const { completeTopic } = useCompletion();
  const [markedComplete, setMarkedComplete] = useState(false);

  const handleComplete = () => {
    completeTopic("tides-heights-theory");
    setMarkedComplete(true);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate("/navigation/tides")}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold">Calculating Tidal Heights</h1>
                <p className="text-sm text-muted-foreground">Using curves and rules</p>
              </div>
            </div>
            {markedComplete ? (
              <Button variant="outline" className="text-green-600 border-green-200 bg-green-50" disabled>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Completed
              </Button>
            ) : (
              <Button onClick={handleComplete}>
                Mark as Complete <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8 max-w-4xl">
        {/* Definitions Section */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-primary">Key Definitions</h2>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                Terminology & Formulae
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-semibold text-blue-700">Tidal Levels</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>
                      <strong>Standard Port:</strong> A main port where tidal predictions are directly calculated and
                      accurately provided in the Almanac.
                    </li>
                    <li>
                      <strong>Chart Datum (CD):</strong> The level from which depths are measured on a chart. Usually
                      Lowest Astronomical Tide (LAT).
                    </li>
                    <li>
                      <strong>Height of Tide (HOT):</strong> The vertical distance of the water surface <em>above</em>{" "}
                      Chart Datum at a specific time.
                    </li>
                    <li>
                      <strong>Charted Depth:</strong> The measured vertical distance from Chart Datum to the seabed.
                    </li>
                    <li>
                      <strong>Drying Height:</strong> The height of the seabed <em>above</em> Chart Datum (shown
                      underlined on charts).
                    </li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-blue-700">Vessel & Passage</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>
                      <strong>Draft:</strong> The depth of the vessel's keel below the waterline.
                    </li>
                    <li>
                      <strong>Clearance:</strong> The safety margin required under the keel.
                    </li>
                  </ul>

                  <div className="bg-slate-100 p-3 rounded border border-slate-200 mt-4">
                    <h4 className="font-bold text-slate-800 text-sm mb-2">Essential Formulae</h4>
                    <div className="space-y-1 text-sm font-mono text-blue-600">
                      <p>Depth of Water = Charted Depth + HOT</p>
                      <p>Required HOT = Draft + Clearance - Charted Depth</p>
                      <p className="text-xs text-slate-500 italic mt-1">(If Drying Height, treat Depth as negative)</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Section 1: Standard Ports & Curves */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-primary">Tidal Curves</h2>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-500" />
                Standard Ports
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Tidal predictions for <strong>Standard Ports</strong> are very accurate. The Almanac provides a{" "}
                <strong>Tidal Curve</strong> for these ports.
              </p>
              <p className="text-muted-foreground">
                The curve allows you to find the height of tide at any time between High Water (HW) and Low Water (LW),
                or find the time at which a specific height will occur.
              </p>
              <div className="bg-slate-50 p-4 rounded-lg border text-sm space-y-2">
                <h4 className="font-semibold">The Process:</h4>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>Enter HW times and heights and LW times and heights from the tables.</li>
                  <li>Plot the HW height and LW height on the bottom scale.</li>
                  <li>Join these points with a diagonal line.</li>
                  <li>Enter the time on the bottom time scale (adjusting for Springs/Neaps).</li>
                  <li>Go up to the curve, across to the diagonal line, and down to read the height (or vice versa).</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Section 2: Rule of Twelves */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-primary">The Rule of Twelves</h2>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-green-500" />
                Quick Estimation
              </CardTitle>
              <CardDescription>
                When you don't have a curve, or need a quick mental estimate for a semi-diurnal tide (approx 6 hours
                duration).
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-8 items-start">
                <div className="space-y-4">
                  <p>
                    The tide does not rise constantly. It starts slow, accelerates in the middle hours, and slows down
                    at the end. The total range is divided into twelfths.
                  </p>
                  <ul className="space-y-2 text-sm bg-blue-50 p-4 rounded-md">
                    <li className="flex justify-between">
                      <span>1st Hour</span> <span className="font-bold">1/12</span>
                    </li>
                    <li className="flex justify-between">
                      <span>2nd Hour</span> <span className="font-bold">2/12</span>
                    </li>
                    <li className="flex justify-between">
                      <span>3rd Hour</span> <span className="font-bold">3/12</span> of Range (Fastest!)
                    </li>
                    <li className="flex justify-between">
                      <span>4th Hour</span> <span className="font-bold">3/12</span> of Range
                    </li>
                    <li className="flex justify-between">
                      <span>5th Hour</span> <span className="font-bold">2/12</span>
                    </li>
                    <li className="flex justify-between">
                      <span>6th Hour</span> <span className="font-bold">1/12</span>
                    </li>
                  </ul>
                  <p className="text-xs text-muted-foreground">
                    *Note: This is an approximation and should be used with caution, especially in shallow waters.
                  </p>
                </div>

                {/* Visual Example */}
                <div className="bg-slate-900 text-white p-6 rounded-xl shadow-lg">
                  <h4 className="font-bold mb-4 text-emerald-400">Example Calculation</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between border-b border-slate-700 pb-1">
                      <span>High Water</span> <span>12:00 (5.0m)</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-700 pb-1">
                      <span>Low Water</span> <span>18:00 (1.4m)</span>
                    </div>
                    <div className="flex justify-between text-emerald-400 font-bold py-2">
                      <span>Range</span> <span>3.6m</span>
                    </div>
                    <div className="flex justify-between opacity-80">
                      <span>1/12 of Range</span> <span>0.3m</span>
                    </div>

                    <div className="mt-4 pt-2 border-t border-slate-700">
                      <p className="mb-2">Height at 14:00 (2 hours after HW)?</p>
                      <ul className="space-y-1 text-slate-300">
                        <li>1st Hr (1.0m drop? No, 1/12 = 0.3m)</li>
                        <li>2nd Hr (2/12 = 0.6m)</li>
                        <li>Total Drop = 0.9m</li>
                        <li className="text-white font-bold pt-1">Height = 5.0m - 0.9m = 4.1m</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <div className="flex justify-center pt-8">
          <Button
            size="lg"
            onClick={() => navigate("/navigation/tides/heights-calc")}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            Go to Practice Tool <ChevronRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </main>
    </div>
  );
};

export default TidalHeightsTheory;
