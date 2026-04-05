import { useNavigate } from "react-router-dom";
import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Flame,
  ShieldAlert,
  Droplets,
  ShieldCheck,
  Gamepad2,
  CheckCircle2,
} from "lucide-react";
import { FireExtinguisherDrill, type DrillResult } from "@/components/safety/FireExtinguisherDrill";
import { useProgress } from "@/hooks/useProgress";
import { TOPIC_IDS } from "@/constants/topicRegistry";
import { fireExtinguishers } from "@/data/fireExtinguishers";

const FireSafetyTheory = () => {
  const navigate = useNavigate();
  const { saveProgress } = useProgress();
  const [theoryCompleted, setTheoryCompleted] = useState(false);

  const handleMarkComplete = useCallback(() => {
    saveProgress(TOPIC_IDS.SAFETY_FIRE, true, 100, 10);
    setTheoryCompleted(true);
  }, [saveProgress]);

  const handleDrillComplete = useCallback(
    (result: DrillResult) => {
      const score = Math.round(
        (result.correctCount / result.totalAnswered) * 100
      );
      saveProgress(TOPIC_IDS.SAFETY_FIRE_DRILL, true, score, 10);
    },
    [saveProgress]
  );

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
              onClick={() => navigate("/safety")}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">Fire Safety</h1>
              <p className="text-sm text-muted-foreground">
                Prevention, Types & Extinguishers
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Tabs defaultValue="fire-triangle" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 h-auto">
            <TabsTrigger value="fire-triangle" className="py-2">
              <Flame className="w-4 h-4 mr-2" />
              Fire Triangle
            </TabsTrigger>
            <TabsTrigger value="fire-types" className="py-2">
              <ShieldAlert className="w-4 h-4 mr-2" />
              Fire Types
            </TabsTrigger>
            <TabsTrigger value="extinguishers" className="py-2">
              <Droplets className="w-4 h-4 mr-2" />
              Extinguishers
            </TabsTrigger>
            <TabsTrigger value="prevention" className="py-2">
              <ShieldCheck className="w-4 h-4 mr-2" />
              Prevention
            </TabsTrigger>
            <TabsTrigger value="drill" className="py-2">
              <Gamepad2 className="w-4 h-4 mr-2" />
              Drill
            </TabsTrigger>
          </TabsList>

          {/* ── FIRE TRIANGLE ──────────────────────────────────────── */}
          <TabsContent value="fire-triangle" className="space-y-6">
            <div className="prose dark:prose-invert max-w-none">
              <h2 className="text-2xl font-bold">The Fire Triangle</h2>
              <p>
                A fire needs three elements to ignite and sustain. Remove any one
                side of the triangle and the fire goes out. Understanding this
                principle is the foundation of both fire prevention and
                firefighting.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <Card className="border-l-4 border-l-red-500">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Flame className="w-5 h-5 text-red-500" />
                    Heat
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    The ignition source — sparks, electrical faults, friction, or
                    an open flame. On a boat, common sources include the galley
                    stove, engine exhaust, and electrical wiring.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-orange-500">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Flame className="w-5 h-5 text-orange-500" />
                    Fuel
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Any combustible material — diesel, petrol, gas (butane /
                    propane), wood, fabric, fibreglass, or cooking oil. Boats
                    carry many fuel sources in a confined space.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-blue-500">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Flame className="w-5 h-5 text-blue-500" />
                    Oxygen
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Air provides the oxygen. Boats have ventilated engine spaces
                    and open hatches, meaning oxygen is readily available. Closing
                    hatches and vents can starve a fire.
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-muted/50">
              <CardContent className="pt-6">
                <p className="text-sm font-medium">
                  <strong>Key principle:</strong> Every firefighting method works
                  by removing one side of the triangle — water cools (removes{" "}
                  <em>heat</em>), a fire blanket smothers (removes{" "}
                  <em>oxygen</em>), and shutting off a gas valve cuts the{" "}
                  <em>fuel</em>.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── FIRE TYPES ─────────────────────────────────────────── */}
          <TabsContent value="fire-types" className="space-y-6">
            <div className="prose dark:prose-invert max-w-none">
              <h2 className="text-2xl font-bold">Fire Classifications</h2>
              <p>
                Different fuels burn differently. Using the wrong extinguisher can
                make a fire worse — for example, water on a chip-pan fire causes
                a fireball. Know your classes.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card className="border-l-4 border-l-green-600">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Badge className="bg-green-600">A</Badge>
                    Class A — Solids
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Ordinary combustible solids: wood, paper, fabric, rope, and
                    fibreglass. These fires leave ash. Most cabin and deck fires
                    are Class A.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-yellow-600">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Badge className="bg-yellow-600">B</Badge>
                    Class B — Flammable Liquids
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Flammable liquids and liquefiable solids: diesel, petrol,
                    paraffin, cooking oil, paint, and varnish. Never use water —
                    it spreads burning liquid.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-blue-600">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Badge className="bg-blue-600">C</Badge>
                    Class C — Flammable Gases
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Flammable gases: butane, propane, and natural gas. On boats,
                    LPG from the galley cooker is the main risk. Always shut off
                    the gas supply before fighting the fire.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-purple-600">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Badge className="bg-purple-600">E</Badge>
                    Electrical Fires
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Not an official class but a critical marine hazard. Fires
                    involving live electrical equipment — panels, wiring,
                    chargers. Isolate the power first if safe. Never use water or
                    foam.
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ── EXTINGUISHERS ──────────────────────────────────────── */}
          <TabsContent value="extinguishers" className="space-y-6">
            <div className="prose dark:prose-invert max-w-none">
              <h2 className="text-2xl font-bold">Extinguisher Types</h2>
              <p>
                A Day Skipper must know the four extinguisher types commonly
                carried on yachts, their colour codes, and which fire classes
                they are suitable for.
              </p>
            </div>

            <div className="grid gap-4">
              {fireExtinguishers.map((ext) => (
                <Card key={ext.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>{ext.type}</CardTitle>
                      <Badge variant="outline">
                        Colour: {ext.colourCode}
                      </Badge>
                    </div>
                    <CardDescription>{ext.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm font-medium mb-2">
                          Suitable Classes
                        </p>
                        <div className="flex gap-1">
                          {ext.suitableClasses.map((cls) => (
                            <Badge key={cls} variant="secondary">
                              {cls}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-2">Advantages</p>
                        <ul className="text-xs text-muted-foreground space-y-1">
                          {ext.advantages.map((adv) => (
                            <li key={adv}>✓ {adv}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-2">
                          Disadvantages
                        </p>
                        <ul className="text-xs text-muted-foreground space-y-1">
                          {ext.disadvantages.map((dis) => (
                            <li key={dis}>✗ {dis}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* ── PREVENTION & ENGINE ROOM ───────────────────────────── */}
          <TabsContent value="prevention" className="space-y-6">
            <div className="prose dark:prose-invert max-w-none">
              <h2 className="text-2xl font-bold">Fire Prevention at Sea</h2>
              <p>
                Prevention is always better than firefighting, especially on a
                boat where escape routes are limited and help may be hours away.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Galley Safety</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-2">
                  <p>
                    Never leave cooking unattended. Keep a fire blanket within
                    arm's reach of the stove. Use fiddle rails to prevent pans
                    sliding off in a seaway.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Gas System</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-2">
                  <p>
                    Turn off gas at the bottle after each use. Check hoses and
                    connections regularly for leaks (use soapy water). Ensure the
                    gas locker drains overboard, not into the bilge.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Electrical Systems</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-2">
                  <p>
                    Check wiring for chafe, especially where it passes through
                    bulkheads. Use correct fuse ratings. Isolate battery banks
                    when leaving the boat unattended.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Fuel Handling</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-2">
                  <p>
                    No smoking during refuelling. Close all hatches and ports.
                    Wipe up spills immediately. Run the bilge blower for several
                    minutes before starting a petrol engine.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Engine Room Fire Procedure */}
            <Card className="bg-destructive/5 border-destructive/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-destructive" />
                  Engine Room Fire Procedure
                </CardTitle>
                <CardDescription>
                  Engine room fires are the most common serious fire on yachts.
                  Follow this procedure immediately.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>
                    <strong>STOP the engine</strong> — remove the ignition
                    source and reduce air flow.
                  </li>
                  <li>
                    <strong>CLOSE all hatches and ventilators</strong> to the
                    engine space — starve the fire of oxygen.
                  </li>
                  <li>
                    <strong>SHUT OFF the fuel supply</strong> at the fuel cock
                    on the tank.
                  </li>
                  <li>
                    <strong>DISCHARGE extinguisher</strong> through the engine
                    hatch port (a small opening) — do NOT open the main hatch
                    fully or you will feed the fire with air.
                  </li>
                  <li>
                    <strong>SEND a Mayday</strong> if the fire is not brought
                    under control quickly.
                  </li>
                  <li>
                    <strong>PREPARE to abandon ship</strong> — ready the life
                    raft and grab bag, but only as a last resort.
                  </li>
                </ol>
                <p className="text-xs text-muted-foreground mt-3">
                  Use CO2 or dry powder — never water — on an engine room fire.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── DRILL TAB ──────────────────────────────────────────── */}
          <TabsContent value="drill" className="space-y-6">
            <div className="prose dark:prose-invert max-w-none">
              <h2 className="text-2xl font-bold">Extinguisher Matching Drill</h2>
              <p>
                Test your knowledge: given a fire scenario, choose the correct
                extinguisher. In a real emergency, hesitation costs lives.
              </p>
            </div>

            <FireExtinguisherDrill onComplete={handleDrillComplete} />

            <div className="mt-8 p-6 bg-muted/50 rounded-xl text-center border">
              <h3 className="text-lg font-bold mb-2">
                Ready for the Theory Test?
              </h3>
              <p className="text-muted-foreground mb-4">
                Challenge yourself with questions on fire safety theory.
              </p>
              <Button
                onClick={() => navigate("/quiz/safety-fire-quiz")}
                className="min-w-[200px]"
              >
                Take the Fire Safety Quiz
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        {/* H2: Explicit completion button + back navigation */}
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
            onClick={() => navigate("/safety")}
          >
            Back to Safety Menu
          </Button>
        </div>
      </main>
    </div>
  );
};

export default FireSafetyTheory;
