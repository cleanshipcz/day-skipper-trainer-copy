import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ExternalLink, Play, Trophy } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { knots, Knot } from "@/data/ropeworkKnots";

const RopeworkTheory = () => {
  const navigate = useNavigate();
  const [selectedKnot, setSelectedKnot] = useState<Knot | null>(null);
  const [knotList, setKnotList] = useState<Knot[]>(knots);
  const [score, setScore] = useState(0);

  const handleKnotClick = (knot: Knot) => {
    if (!knot.discovered) {
      setKnotList((prevKnots) =>
        prevKnots.map((currentKnot) =>
          currentKnot.id === knot.id ? { ...currentKnot, discovered: true } : currentKnot,
        ),
      );
      setScore((prevScore) => prevScore + 15);
    }

    setSelectedKnot((prevSelectedKnot) =>
      prevSelectedKnot?.id === knot.id ? { ...prevSelectedKnot, discovered: true } : knot,
    );
  };

  const discoveredCount = useMemo(
    () => knotList.filter((knot) => knot.discovered).length,
    [knotList],
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-ocean-light/10 to-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold">Ropework & Knots</h1>
                <p className="text-sm text-muted-foreground">Master essential sailing knots</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-accent" />
                <span className="font-bold text-lg">{score}</span>
              </div>
              <Badge variant="secondary">
                {discoveredCount}/{knotList.length} learned
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Knots Grid */}
          <div className="lg:col-span-2 grid md:grid-cols-2 gap-4">
            {knotList.map((knot) => (
              <Card
                key={knot.id}
                className={`cursor-pointer transition-all hover:scale-105 ${
                  selectedKnot?.id === knot.id ? "ring-2 ring-secondary" : ""
                } ${knot.discovered ? "border-success/50" : ""}`}
                onClick={() => handleKnotClick(knot)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{knot.name}</CardTitle>
                    <Badge
                      variant={
                        knot.difficulty === "Easy"
                          ? "default"
                          : knot.difficulty === "Medium"
                          ? "secondary"
                          : "destructive"
                      }
                    >
                      {knot.difficulty}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">{knot.uses}</p>
                  {knot.discovered && (
                    <Badge variant="default" className="bg-success">
                      ✓ Learned
                    </Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Details Panel */}
          <Card className="lg:col-span-1 sticky top-24 h-fit">
            <CardHeader>
              <CardTitle>{selectedKnot ? selectedKnot.name : "Select a Knot"}</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedKnot ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Uses:</h3>
                    <p className="text-sm text-muted-foreground">{selectedKnot.uses}</p>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Steps:</h3>
                    <ol className="space-y-2">
                      {selectedKnot.steps.map((step, idx) => (
                        <li key={idx} className="text-sm text-muted-foreground flex gap-2">
                          <span className="font-bold text-primary">{idx + 1}.</span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  <Button
                    className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
                    onClick={() => window.open(selectedKnot.tutorialUrl, "_blank")}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Watch Tutorial
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  Click on a knot to see details and video tutorial
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {discoveredCount === knotList.length && (
          <Card className="mt-6 border-2 border-accent bg-accent/5">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold mb-2">🎉 All knots learned! Ready for the quiz?</h3>
                  <p className="text-muted-foreground">Test your ropework knowledge</p>
                </div>
                <Button
                  size="lg"
                  className="bg-accent text-accent-foreground hover:bg-accent/90"
                  onClick={() => navigate("/quiz/ropework")}
                >
                  Take Quiz
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default RopeworkTheory;
