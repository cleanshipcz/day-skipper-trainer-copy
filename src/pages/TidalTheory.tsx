import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ChevronRight, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useCompletion } from "@/hooks/useCompletion";

const TidalTheory = () => {
  const navigate = useNavigate();
  const { completeTopic } = useCompletion();
  const [markedComplete, setMarkedComplete] = useState(false);

  const handleComplete = () => {
    completeTopic("tides-theory");
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
                <h1 className="text-xl font-bold">Understanding Tidal Phenomena</h1>
                <p className="text-sm text-muted-foreground">The forces behind the tides</p>
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
        {/* Section 1: Introduction */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-primary">The Generating Forces</h2>
          <Card>
            <CardContent className="pt-6 space-y-4">
              <p className="text-lg leading-relaxed">
                Tides are the vertical rise and fall of the sea level caused by the gravitational attraction of the
                <strong> Moon</strong> and the <strong>Sun</strong> on the Earth's oceans.
              </p>
              <div className="bg-slate-50 p-6 rounded-lg border border-slate-100 flex flex-col md:flex-row items-center gap-8">
                <div className="flex-1 space-y-2">
                  <h3 className="font-semibold text-lg">The Moon's Influence</h3>
                  <p className="text-muted-foreground">
                    The Moon is the dominant force because it is much closer to Earth than the Sun. Its gravity pulls
                    the water on the side of Earth facing it, creating a "bulge".
                  </p>
                </div>
                <div className="w-32 h-32 relative flex items-center justify-center">
                  {/* Simple visual representation */}
                  <div className="absolute w-20 h-20 rounded-full bg-blue-500 opacity-20 animate-pulse scale-150" />
                  <div className="w-16 h-16 rounded-full bg-blue-600 z-10 grid place-items-center text-white text-xs font-bold">
                    Earth
                  </div>
                  <div className="absolute -right-12 w-8 h-8 rounded-full bg-slate-400 grid place-items-center text-[8px] text-white">
                    Moon
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Section 2: Springs and Neaps */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-primary">Springs and Neaps</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-l-4 border-l-blue-500">
              <CardHeader>
                <CardTitle>Spring Tides</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  Occur when the Earth, Moon, and Sun are <strong>aligned</strong> (New Moon or Full Moon). The
                  gravitational forces combine.
                </p>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  <li>Higher High Waters</li>
                  <li>Lower Low Waters</li>
                  <li>Greater Range</li>
                  <li>Stronger Streams</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500">
              <CardHeader>
                <CardTitle>Neap Tides</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  Occur when the Moon is at <strong>right angles</strong> to the Sun relative to Earth (First or Last
                  Quarter). The forces oppose each other.
                </p>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  <li>Lower High Waters</li>
                  <li>Higher Low Waters</li>
                  <li>Smaller Range</li>
                  <li>Weaker Streams</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Section 3: Real World Complexity */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-primary">Real World Tides</h2>
          <Card>
            <CardContent className="pt-6 space-y-4">
              <p>
                Tides don't just bulge; they move as very long waves. In the North Atlantic, these waves interact with
                the continental shelf and the geography of the British Isles.
              </p>
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <h3 className="font-semibold">Amphidromic Systems</h3>
                  <p className="text-sm text-muted-foreground">
                    Due to the Earth's rotation (Coriolis effect), tidal waves in the North Sea rotate around nodal
                    points called <strong>Amphidromic Points</strong> where there is almost no tidal range.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    This rotation is generally <strong>anti-clockwise</strong> in the northern hemisphere.
                  </p>
                </div>
                <div className="aspect-video bg-white rounded-lg flex items-center justify-center border overflow-hidden shadow-sm">
                  <img
                    src="/amphidromic.png"
                    alt="Amphidromic System Diagram"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
};

export default TidalTheory;
