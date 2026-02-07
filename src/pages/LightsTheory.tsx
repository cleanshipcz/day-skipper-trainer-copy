import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Lightbulb, AlertTriangle, Volume2, Flame, Ship, Anchor, Wind } from "lucide-react";
import { useProgress } from "@/hooks/useProgress";
import { useEffect } from "react";

const LightsTheory = () => {
  const navigate = useNavigate();
  const { saveProgress } = useProgress();

  useEffect(() => {
    // Mark as completed on visit
    saveProgress("lights-theory", true, 100, 10);
  }, [saveProgress]);

  const LightDot = ({ color, border = false }: { color: string; border?: boolean }) => (
    <span className={`w-4 h-4 rounded-full inline-block mr-1 ${color} ${border ? "border border-gray-400" : ""}`} />
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-ocean-light/10 to-background pb-20">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/rules/lights")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">Lights, Shapes & Sounds</h1>
              <p className="text-sm text-muted-foreground">COLREGs Parts C & D + Annex IV</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Tabs defaultValue="lights" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto">
            <TabsTrigger value="lights" className="py-2">
              <Lightbulb className="w-4 h-4 mr-2" />
              Lights
            </TabsTrigger>
            <TabsTrigger value="shapes" className="py-2">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Shapes
            </TabsTrigger>
            <TabsTrigger value="sounds" className="py-2">
              <Volume2 className="w-4 h-4 mr-2" />
              Sounds
            </TabsTrigger>
            <TabsTrigger value="distress" className="py-2">
              <Flame className="w-4 h-4 mr-2" />
              Distress
            </TabsTrigger>
          </TabsList>

          {/* LIGHTS TAB */}
          <TabsContent value="lights" className="space-y-6">
            <div className="prose dark:prose-invert max-w-none">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Lightbulb className="text-yellow-500" /> Part C: Lights
              </h2>
              <p>
                Lights must be shown from <strong>sunset to sunrise</strong> and in restricted visibility.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Power-Driven Vessels (Rule 23)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-sm">Under 50m</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <LightDot color="bg-white" border /> Masthead (225°)
                      <LightDot color="bg-red-500" /> Port
                      <LightDot color="bg-green-500" /> Stbd
                      <LightDot color="bg-white" border /> Stern (135°)
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">Over 50m</h4>
                    <p className="text-sm text-muted-foreground">
                      Must show <strong>two</strong> Masthead lights (second one higher and aft).
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">Air-Cushion (Hovercraft)</h4>
                    <p className="text-sm text-muted-foreground flex items-center">
                      All-round <LightDot color="bg-yellow-400" /> flashing light
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Sailing Vessels (Rule 25)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-sm">Underway</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <LightDot color="bg-red-500" /> Port
                      <LightDot color="bg-green-500" /> Stbd
                      <LightDot color="bg-white" border /> Stern
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">NO Masthead light when under sail alone.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">Option: Tricolor</h4>
                    <p className="text-sm text-muted-foreground">
                      If &lt;20m, can combine Sidelights + Sternlight into one masthead lantern.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">Option: All-Round Red/Green</h4>
                    <div className="flex items-center gap-1 mt-1">
                      <LightDot color="bg-red-500" /> Over <LightDot color="bg-green-500" />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      "Red over Green, Sailing Machine" (Plus sidelights & sternlight)
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Fishing (Rule 26)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-sm">Trawling</h4>
                    <div className="flex items-center gap-1">
                      <LightDot color="bg-green-500" /> Over <LightDot color="bg-white" border />
                    </div>
                    <p className="text-xs italic">"Green over White, Trawling at night"</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">Fishing (Not Trawling)</h4>
                    <div className="flex items-center gap-1">
                      <LightDot color="bg-red-500" /> Over <LightDot color="bg-white" border />
                    </div>
                    <p className="text-xs italic">"Red over White, Fishing at night"</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Pilot Vessels (Rule 29)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-1">
                    <LightDot color="bg-white" border /> Over <LightDot color="bg-red-500" />
                  </div>
                  <p className="text-xs italic">"White over Red, Pilot ahead"</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>NUC & RAM (Rule 27)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-sm">Not Under Command (NUC)</h4>
                    <div className="flex items-center gap-1">
                      <LightDot color="bg-red-500" /> Over <LightDot color="bg-red-500" />
                    </div>
                    <p className="text-xs italic">"Red over Red, Captain is dead"</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">Restricted Ability to Maneuver (RAM)</h4>
                    <div className="flex items-center gap-1">
                      <LightDot color="bg-red-500" /> <LightDot color="bg-white" border />{" "}
                      <LightDot color="bg-red-500" />
                    </div>
                    <p className="text-xs text-muted-foreground">Red-White-Red vertical.</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Anchored & Aground (Rule 30)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-sm">Anchored</h4>
                    <div className="flex items-center gap-1">
                      <LightDot color="bg-white" border />
                    </div>
                    <p className="text-sm">One all-round white light (Fore part).</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">Aground</h4>
                    <div className="flex items-center gap-1">
                      <LightDot color="bg-red-500" /> Over <LightDot color="bg-red-500" />
                    </div>
                    <p className="text-sm">Plus Anchor light(s).</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* SHAPES TAB */}
          <TabsContent value="shapes" className="space-y-6">
            <div className="prose dark:prose-invert max-w-none">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <AlertTriangle className="text-red-500" /> Day Shapes
              </h2>
              <p>Black shapes displayed by day to indicate status.</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="text-center p-4 flex flex-col items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-black mb-2" />
                <h3 className="font-bold">Ball</h3>
                <p className="text-xs text-muted-foreground">At Anchor</p>
              </Card>
              <Card className="text-center p-4 flex flex-col items-center justify-center">
                <div className="w-0 h-0 border-l-[1rem] border-r-[1rem] border-b-[2rem] border-l-transparent border-r-transparent border-b-black rotate-180 mb-2" />
                <h3 className="font-bold">Cone</h3>
                <p className="text-xs text-muted-foreground">Motoring Sailing</p>
                <p className="text-[10px] text-muted-foreground">(Apex Down)</p>
              </Card>
              <Card className="text-center p-4 flex flex-col items-center justify-center">
                <div className="flex flex-col gap-1 mb-2">
                  <div className="w-6 h-6 rounded-full bg-black" />
                  <div className="w-6 h-6 rounded-full bg-black" />
                </div>
                <h3 className="font-bold">2 Balls</h3>
                <p className="text-xs text-muted-foreground">NUC</p>
              </Card>
              <Card className="text-center p-4 flex flex-col items-center justify-center">
                <div className="flex flex-col gap-1 mb-2">
                  <div className="w-6 h-6 rounded-full bg-black" />
                  <div className="w-6 h-6 rounded-full bg-black" />
                  <div className="w-6 h-6 rounded-full bg-black" />
                </div>
                <h3 className="font-bold">3 Balls</h3>
                <p className="text-xs text-muted-foreground">Aground</p>
              </Card>
              <Card className="text-center p-4 flex flex-col items-center justify-center">
                <div className=" rotate-45 w-8 h-8 bg-black mb-2" />
                <h3 className="font-bold">Diamond</h3>
                <p className="text-xs text-muted-foreground">Tow &gt; 200m</p>
              </Card>
              <Card className="text-center p-4 flex flex-col items-center justify-center">
                <div className="flex flex-col gap-1 mb-2 items-center">
                  <div className="w-6 h-6 rounded-full bg-black" />
                  <div className=" rotate-45 w-6 h-6 bg-black" />
                  <div className="w-6 h-6 rounded-full bg-black" />
                </div>
                <h3 className="font-bold">Ball-Diamond-Ball</h3>
                <p className="text-xs text-muted-foreground">RAM</p>
              </Card>
              <Card className="text-center p-4 flex flex-col items-center justify-center">
                <div className="w-6 h-12 bg-black mb-2" />
                <h3 className="font-bold">Cylinder</h3>
                <p className="text-xs text-muted-foreground">Constrained By Draft</p>
              </Card>
              <Card className="text-center p-4 flex flex-col items-center justify-center">
                <div className="flex flex-col mb-2 items-center">
                  <div className="w-0 h-0 border-l-[10px] border-r-[10px] border-b-[20px] border-l-transparent border-r-transparent border-b-black rotate-180" />
                  <div className="w-0 h-0 border-l-[10px] border-r-[10px] border-b-[20px] border-l-transparent border-r-transparent border-b-black -mt-1" />
                </div>
                <h3 className="font-bold">Hourglass</h3>
                <p className="text-xs text-muted-foreground">Fishing / Trawling</p>
              </Card>
            </div>
          </TabsContent>

          {/* SOUNDS TAB */}
          <TabsContent value="sounds" className="space-y-6">
            <div className="prose dark:prose-invert max-w-none">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Volume2 className="text-blue-500" /> Part D: Sound Signals
              </h2>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Maneuvering & Warning (Rule 34)</CardTitle>
                  <CardDescription>Only when vessels are in sight of one another</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <div className="grid grid-cols-[auto_1fr] gap-4 items-center">
                    <Badge className="w-16 justify-center">1 Short</Badge>
                    <span>
                      I am altering my course to <strong>STARBOARD</strong>
                    </span>

                    <Badge className="w-16 justify-center">2 Short</Badge>
                    <span>
                      I am altering my course to <strong>PORT</strong>
                    </span>

                    <Badge className="w-16 justify-center">3 Short</Badge>
                    <span>
                      I am operating <strong>ASTERN</strong> propulsion
                    </span>

                    <Badge variant="destructive" className="w-16 justify-center">
                      5 Short
                    </Badge>
                    <span>
                      <strong>DANGER</strong> / Doubt signal
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Restricted Visibility (Rule 35)</CardTitle>
                  <CardDescription>Tests use "Prolonged" (4-6s) and "Short" (1s) blasts</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <div className="grid grid-cols-[auto_1fr] gap-4 items-center">
                    <Badge variant="secondary" className="w-24 justify-center">
                      1 Pro
                    </Badge>
                    <span>
                      Power-driven vessel <strong>making way</strong> (every 2m)
                    </span>

                    <Badge variant="secondary" className="w-24 justify-center">
                      2 Pro
                    </Badge>
                    <span>
                      Power-driven vessel <strong>stopped</strong> (every 2m)
                    </span>

                    <Badge variant="secondary" className="w-24 justify-center text-xs">
                      1 Pro, 2 Short
                    </Badge>
                    <span>NUC, RAM, CBD, Sailing, Fishing, Towing (The "Everything Else" signal)</span>

                    <Badge variant="secondary" className="w-24 justify-center text-xs">
                      1 Pro, 3 Short
                    </Badge>
                    <span>Towed vessel (if manned)</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* DISTRESS TAB */}
          <TabsContent value="distress" className="space-y-6">
            <div className="prose dark:prose-invert max-w-none">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Flame className="text-orange-500" /> Distress Signals (Annex IV)
              </h2>
              <p>Used only when in grave and imminent danger.</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                "Gun or explosive (1 min intervals)",
                "Continuous fog horn sounding",
                "Rockets/Shells throwing red stars",
                "SOS by Morse (• • • — — — • • •)",
                "MAYDAY by Radio",
                "Code flags N over C",
                "Square flag & Ball",
                "Flames (burning barrel)",
                "Rocket Parachute Flare (Red)",
                "Hand Flare (Red)",
                "Orange Smoke",
                "Slowly raising/lowering arms",
              ].map((signal, idx) => (
                <Card key={idx} className="flex items-center p-4">
                  <AlertTriangle className="w-4 h-4 text-red-500 mr-3 shrink-0" />
                  <span className="font-medium text-sm">{signal}</span>
                </Card>
              ))}
              <Card className="flex items-center p-4 bg-red-500/10 border-red-500/50">
                <span className="font-bold text-sm">EPIRB Activate</span>
              </Card>
              <Card className="flex items-center p-4 bg-red-500/10 border-red-500/50">
                <span className="font-bold text-sm">DSC Distress Alert</span>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-center pt-12 pb-8">
          <Button size="lg" className="w-full md:w-auto" onClick={() => navigate("/rules/lights")}>
            Back to Module Menu
          </Button>
          <Button
            size="lg"
            variant="secondary"
            className="w-full md:w-auto ml-4"
            onClick={() => navigate("/quiz/lights-signals")}
          >
            Take the Quiz
          </Button>
        </div>
      </main>
    </div>
  );
};

export default LightsTheory;
