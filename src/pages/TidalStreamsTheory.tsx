import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, ChevronRight, CheckCircle2, Navigation } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useCompletion } from "@/hooks/useCompletion";

const TidalStreamsTheory = () => {
  const navigate = useNavigate();
  const { completeTopic } = useCompletion();
  const [markedComplete, setMarkedComplete] = useState(false);

  const handleComplete = () => {
    completeTopic("tides-streams-theory");
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
                <h1 className="text-xl font-bold">Course to Steer (CTS) Theory</h1>
                <p className="text-sm text-muted-foreground">The Vector Triangle</p>
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
        {/* Section 1: The Problem */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-primary">The Effect of Current</h2>
          <Card>
            <CardContent className="pt-6 space-y-4">
              <p>
                As a vessel moves through the water, the water itself is moving (the <strong>Tidal Stream</strong>). If
                you simply steer towards your destination, the tide will push you off course. To arrive at your
                waypoint, you must calculate a <strong>Course to Steer (CTS)</strong> that counteracts this drift.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Section 2: The Vector Triangle */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-primary">The Vector Triangle</h2>
          <Card>
            <CardHeader>
              <CardTitle>Three Component Vectors</CardTitle>
              <CardDescription>
                We use a vector triangle to find the CTS. It is composed of three lines, each representing speed and
                direction.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <div className="font-bold text-2xl text-blue-600">1</div>
                    <div>
                      <h4 className="font-bold text-blue-900">Water Track</h4>
                      <p className="text-sm text-muted-foreground">The boat's heading and speed through the water.</p>
                      <p className="text-xs font-bold mt-1 text-blue-700">CTS (Heading) + Boat Speed</p>
                      <p className="text-xs mt-1 text-slate-500">Arrow: 1 head</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-100">
                    <div className="font-bold text-2xl text-green-600">2</div>
                    <div>
                      <h4 className="font-bold text-green-900">Ground Track</h4>
                      <p className="text-sm text-muted-foreground">The boat's actual path and speed over the seabed.</p>
                      <p className="text-xs font-bold mt-1 text-green-700">
                        CMG (Course Made Good) + SOG (Speed Over Ground)
                      </p>
                      <p className="text-xs mt-1 text-slate-500">Arrow: 2 heads</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-100">
                    <div className="font-bold text-2xl text-red-600">3</div>
                    <div>
                      <h4 className="font-bold text-red-900">Tidal Vector</h4>
                      <p className="text-sm text-muted-foreground">
                        The direction (Set) and speed (Rate) of the current.
                      </p>
                      <p className="text-xs font-bold mt-1 text-red-700">Set + Rate</p>
                      <p className="text-xs mt-1 text-slate-500">Arrow: 3 heads</p>
                    </div>
                  </div>
                </div>

                {/* Diagram Placeholder or Simple SVG */}
                <div className="flex items-center justify-center bg-slate-50 rounded-xl border p-4">
                  <div className="relative w-64 h-64 border border-dashed border-slate-300 rounded-full bg-white flex items-center justify-center">
                    <p className="text-sm text-center text-muted-foreground italic">
                      Imagine the tide pushing the boat sideways.
                      <br />
                      We steer INTO the tide to go straight.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Section 3: Solving the Triangle */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-primary">How to Plot</h2>
          <Card>
            <CardContent className="pt-6 space-y-2">
              <ol className="list-decimal list-inside space-y-3">
                <li className="pl-2">
                  Draw your <strong>Ground Track</strong> (Desired path) from Point A.
                </li>
                <li className="pl-2">
                  From Point A, plot the <strong>Tidal Vector</strong> (Set and Rate for the hour). This pushes you
                  OFFLINE.
                </li>
                <li className="pl-2">
                  From the end of the Tide Vector, set your dividers to <strong>Boat Speed</strong>.
                </li>
                <li className="pl-2">Arc the dividers to cut the Ground Track line.</li>
                <li className="pl-2">
                  Join the end of the Tide Vector to this cut on the Ground Track. This line is your{" "}
                  <strong>Water Track (CTS)</strong>.
                </li>
                <li className="pl-2">Measure the angle of this line to find your Course to Steer.</li>
              </ol>
            </CardContent>
          </Card>
        </section>

        <div className="flex justify-center pt-8">
          <Button
            size="lg"
            onClick={() => navigate("/navigation/tides/vector-tool")}
            className="bg-purple-600 hover:bg-purple-700"
          >
            Open Vector Solution Tool <ChevronRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </main>
    </div>
  );
};

export default TidalStreamsTheory;
