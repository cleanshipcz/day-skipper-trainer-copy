import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Compass, AlertTriangle, Wind, Ship } from "lucide-react";
import { useProgress } from "@/hooks/useProgress";
import { useEffect } from "react";

const ColregTheory = () => {
  const navigate = useNavigate();
  const { saveProgress } = useProgress();

  useEffect(() => {
    // Mark as completed on visit
    saveProgress("colregs-theory", true, 100, 10);
  }, [saveProgress]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-ocean-light/10 to-background pb-20">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/rules-of-the-road")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">Steering & Sailing Rules</h1>
              <p className="text-sm text-muted-foreground">Part B - Rules 4-19</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl space-y-8">
        {/* Intro */}
        <section>
          <div className="prose dark:prose-invert max-w-none">
            <p className="text-lg leading-relaxed">
              The Steering and Sailing Rules are the core of collision avoidance. They define who is the "Stand-on"
              vessel (maintains course and speed) and who is the "Give-way" vessel (takes action to avoid collision).
            </p>
          </div>
        </section>

        {/* General Rules */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <Compass className="w-6 h-6 text-primary" />
            General Rules
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-bold text-lg mb-2">Rule 5: Look-out</h3>
                <p className="text-muted-foreground">
                  Every vessel must at all times maintain a proper look-out by sight and hearing as well as by all
                  available means appropriate to make a full appraisal of the situation.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <h3 className="font-bold text-lg mb-2">Rule 6: Safe Speed</h3>
                <p className="text-muted-foreground">
                  Every vessel must proceed at a safe speed so that she can take proper and effective action to avoid
                  collision and stop within a distance appropriate to the circumstances.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <h3 className="font-bold text-lg mb-2">Rule 7: Risk of Collision</h3>
                <p className="text-muted-foreground">
                  Use all available means to determine if risk of collision exists. If there is any doubt, such risk
                  shall be deemed to exist.
                  <br />
                  <span className="italic text-primary">Warning sign: Constant bearing, decreasing range.</span>
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <h3 className="font-bold text-lg mb-2">Rule 8: Action to Avoid Collision</h3>
                <p className="text-muted-foreground">
                  Action must be positive, made in ample time, and with due regard to good seamanship. Alteration of
                  course should be large enough to be readily apparent.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <h3 className="font-bold text-lg mb-2">Rule 9: Narrow Channels</h3>
                <p className="text-muted-foreground">
                  Keep as near to the outer limit of the channel on your STARBOARD side as is safe. Small vessels
                  (&lt;20m) and sailing vessels implies must not impede safe passage.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <h3 className="font-bold text-lg mb-2">Rule 10: TSS</h3>
                <p className="text-muted-foreground">
                  Proceed in the general direction of traffic flow. Keep clear of the separation zone. Join/leave at the
                  termination or at a shallow angle. Cross at right angles.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Sailing Rules */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <Wind className="w-6 h-6 text-blue-500" />
            Rule 12: Sailing Vessels
          </h2>
          <Card className="overflow-hidden">
            <div className="grid md:grid-cols-2">
              <div className="p-6 flex flex-col justify-center">
                <ul className="space-y-4">
                  <li className="flex gap-3">
                    <Badge variant="outline" className="h-fit mt-1">
                      1
                    </Badge>
                    <div>
                      <span className="font-bold">Wind on different sides:</span>
                      <p className="text-muted-foreground">The vessel with wind on the PORT side gives way.</p>
                      <p className="text-sm italic text-blue-500 mt-1">"Port gives way to Starboard"</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <Badge variant="outline" className="h-fit mt-1">
                      2
                    </Badge>
                    <div>
                      <span className="font-bold">Wind on same side:</span>
                      <p className="text-muted-foreground">The vessel to WINDWARD gives way.</p>
                      <p className="text-sm italic text-blue-500 mt-1">"Windward gives way to Leeward"</p>
                    </div>
                  </li>
                </ul>
              </div>
              <div className="bg-muted/30 p-6 flex items-center justify-center border-l border-border">
                <img
                  src="/images/colregs/sailing.png"
                  alt="Sailing Rules"
                  className="max-w-full h-auto rounded-lg shadow-sm"
                />
              </div>
            </div>
          </Card>
        </section>

        {/* Power Driven Rules */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <Ship className="w-6 h-6 text-red-500" />
            Power-Driven Vessels
          </h2>

          <div className="space-y-6">
            {/* Overtaking */}
            <Card>
              <div className="grid md:grid-cols-2">
                <div className="p-6">
                  <h3 className="font-bold text-lg mb-2">Rule 13: Overtaking</h3>
                  <p className="text-muted-foreground mb-4">
                    Any vessel overtaking any other shall keep out of the way of the vessel being overtaken.
                  </p>
                  <div className="p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                    <p className="text-sm text-yellow-600 dark:text-yellow-400 font-medium">
                      An overtaking vessel is always the give-way vessel, regardless of sail vs power.
                    </p>
                  </div>
                </div>
                <div className="bg-muted/30 p-6 flex items-center justify-center border-l border-border">
                  <img src="/images/colregs/quiz_overtaking.png" alt="Overtaking" className="max-w-[200px] h-auto" />
                </div>
              </div>
            </Card>

            {/* Head-on */}
            <Card>
              <div className="grid md:grid-cols-2">
                <div className="p-6">
                  <h3 className="font-bold text-lg mb-2">Rule 14: Head-on Situation</h3>
                  <p className="text-muted-foreground">
                    When two power-driven vessels are meeting on reciprocal courses involving risk of collision, each
                    shall alter her course to STARBOARD so that each shall pass on the port side of the other.
                  </p>
                </div>
                <div className="bg-muted/30 p-6 flex items-center justify-center border-l border-border">
                  <img src="/images/colregs/headon.png" alt="Head On" className="max-w-[200px] h-auto" />
                </div>
              </div>
            </Card>

            {/* Crossing */}
            <Card>
              <div className="grid md:grid-cols-2">
                <div className="p-6">
                  <h3 className="font-bold text-lg mb-2">Rule 15: Crossing Situation</h3>
                  <p className="text-muted-foreground mb-4">
                    When two power-driven vessels are crossing, the vessel which has the other on her own STARBOARD side
                    shall keep out of the way.
                  </p>
                  <p className="font-medium italic">"If it's on your right, it's in the right!" (You give way)</p>
                </div>
                <div className="bg-muted/30 p-6 flex items-center justify-center border-l border-border">
                  <img src="/images/colregs/crossing.png" alt="Crossing" className="max-w-[200px] h-auto" />
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* Actions */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-green-500" />
            Action to Take
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-bold text-lg mb-2">Rule 16: Give-way Vessel</h3>
                <p className="text-muted-foreground">
                  Take <span className="font-semibold text-primary">early and substantial action</span> to keep well
                  clear.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-bold text-lg mb-2">Rule 17: Stand-on Vessel</h3>
                <p className="text-muted-foreground">
                  Keep your course and speed.
                  <br />
                  <span className="text-sm italic">
                    Exception: You MAY take action if they aren't, and MUST take action if collision is inevitable.
                  </span>
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Hierarchy */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-amber-500" />
            Rule 18: Hierarchy
          </h2>
          <Card>
            <CardContent className="pt-6">
              <p className="mb-4">Order of priority (Stand-on over vessels below):</p>
              <ol className="space-y-2 list-decimal list-inside font-medium bg-muted/50 p-4 rounded-lg">
                <li className="text-red-500">Not Under Command (NUC) - Highest Priority</li>
                <li className="text-orange-500">Restricted in Ability to Maneuver (RAM)</li>
                <li className="text-amber-500">Constrained by Draft (CBD)</li>
                <li className="text-yellow-500">Fishing (engaged in fishing)</li>
                <li className="text-blue-500">Sailing</li>
                <li className="text-gray-500">Power-driven vessels</li>
                <li className="text-gray-400">Seaplanes / WIG craft</li>
              </ol>
              <p className="mt-4 text-sm text-muted-foreground text-center italic">
                Mnemonic: "New Reels Catch Fish So Quick"
              </p>
            </CardContent>
          </Card>
        </section>

        <div className="flex justify-center pt-8">
          <Button size="lg" onClick={() => navigate("/rules-of-the-road")}>
            Complete Module
          </Button>
        </div>
      </main>
    </div>
  );
};

export default ColregTheory;
