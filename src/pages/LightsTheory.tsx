import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Lightbulb, AlertTriangle, Volume2, Flame } from "lucide-react";
import { useEffect } from "react";
import { useTheoryCompletionGate } from "@/features/progress/useTheoryCompletionGate";
import { TOPIC_IDS } from "@/constants/topicRegistry";
import { PartCLights, PartCShapes } from "@/components/colregs/PartCLightsShapes";
import { PartDSoundSignals } from "@/components/colregs/PartDSoundSignals";
import { AnnexIVDistressSignals } from "@/components/colregs/AnnexIVDistressSignals";

const LightsTheory = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedSection = searchParams.get("section");
  const hashSection = location.hash === "#rule-37" ? "distress" : undefined;
  const activeSection = hashSection ?? (["lights", "shapes", "sounds", "distress"].includes(requestedSection ?? "") ? requestedSection! : "lights");
  const { canComplete, markCompleted, markSectionVisited } = useTheoryCompletionGate({
    topicId: TOPIC_IDS.LIGHTS_THEORY,
    requiredSectionIds: ["lights", "shapes", "sounds", "distress"],
    pointsOnComplete: 10,
  });

  useEffect(() => {
    void markSectionVisited(activeSection);
  }, [activeSection, markSectionVisited]);

  useEffect(() => {
    const targetId = location.hash.slice(1);
    if (!/^rule-(?:23|25|27|30|32|33|34|35|36|37)$/.test(targetId)) return;
    const target = document.getElementById(targetId);
    target?.scrollIntoView({ block: "start" });
    target?.focus({ preventScroll: true });
  }, [activeSection, location.hash]);

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
        <Tabs value={activeSection} className="space-y-6" onValueChange={(value) => {
          setSearchParams({ section: value });
          void markSectionVisited(value);
        }}>
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
              <p>Rules 20–31: prescribed lights, day shapes and the conditions that make each display meaningful.</p>
            </div>
            <PartCLights />
            {/* Legacy summary removed: it omitted Rules 20–22, 24, 28 and 31 and collapsed conditional displays into unsafe dot mnemonics.
            <div className="grid md:grid-cols-2 gap-6">
              <Card id="rule-23" tabIndex={-1} className="scroll-mt-28 focus:outline-none">
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

              <Card id="rule-25" tabIndex={-1} className="scroll-mt-28 focus:outline-none">
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

              <Card id="rule-27" tabIndex={-1} className="scroll-mt-28 focus:outline-none">
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
            </div> */}
          </TabsContent>

          {/* SHAPES TAB */}
          <TabsContent value="shapes" className="space-y-6">
            <div className="prose dark:prose-invert max-w-none">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <AlertTriangle className="text-red-500" /> Day Shapes
              </h2>
              <p>Rules 20–31 day shapes, with their status and operating conditions.</p>
            </div>
            <PartCShapes />
            {/* Legacy silhouettes lacked structured equivalents and operation-specific combinations.
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card id="rule-30" tabIndex={-1} className="text-center p-4 flex flex-col items-center justify-center scroll-mt-28 focus:outline-none">
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
            </div> */}
          </TabsContent>

          {/* SOUNDS TAB */}
          <TabsContent value="sounds" className="space-y-6">
            <div className="prose dark:prose-invert max-w-none">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Volume2 className="text-blue-500" /> Part D: Sound Signals
              </h2>
            </div>

            <PartDSoundSignals />
          </TabsContent>

          {/* DISTRESS TAB */}
          <TabsContent value="distress" className="space-y-6">
            <div className="prose dark:prose-invert max-w-none">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Flame className="text-orange-500" /> Distress Signals (Annex IV)
              </h2>
              <p>Rule 37 recognition, limitations and immediate receiving-vessel response.</p>
            </div>
            <AnnexIVDistressSignals />
          </TabsContent>
        </Tabs>

        <div className="flex justify-center pt-12 pb-8">
          <Button
            size="lg"
            className="w-full md:w-auto"
            disabled={!canComplete}
            onClick={async () => {
              await markCompleted();
              navigate("/rules/lights");
            }}
          >
            {canComplete ? "Complete Module" : "Explore all sections to complete"}
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
