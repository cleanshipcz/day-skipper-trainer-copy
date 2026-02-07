import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, LifeBuoy, Megaphone, Ship, Anchor, AlertTriangle, Gamepad2 } from "lucide-react";
import { MOBSortingGame } from "@/components/safety/MOBSortingGame";
import { useProgress } from "@/hooks/useProgress";
import { useEffect } from "react";

const ManOverboardTheory = () => {
  const navigate = useNavigate();
  const { saveProgress } = useProgress();

  useEffect(() => {
    saveProgress("safety-mob", true, 100, 10);
  }, [saveProgress]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-ocean-light/10 to-background pb-20">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/safety")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">Man Overboard (MOB)</h1>
              <p className="text-sm text-muted-foreground">Immediate Actions & Recovery</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Tabs defaultValue="actions" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 h-auto">
            <TabsTrigger value="actions" className="py-2">
              <Megaphone className="w-4 h-4 mr-2" />
              Immediate Actions
            </TabsTrigger>
            <TabsTrigger value="distress" className="py-2">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Distress Call
            </TabsTrigger>
            <TabsTrigger value="drill" className="py-2">
              <Gamepad2 className="w-4 h-4 mr-2" />
              Drills
            </TabsTrigger>
            <TabsTrigger value="maneuvers" className="py-2">
              <Ship className="w-4 h-4 mr-2" />
              Maneuvers
            </TabsTrigger>
            <TabsTrigger value="recovery" className="py-2">
              <LifeBuoy className="w-4 h-4 mr-2" />
              Recovery
            </TabsTrigger>
          </TabsList>

          {/* IMMEDIATE ACTIONS */}
          <TabsContent value="actions" className="space-y-6">
            <div className="prose dark:prose-invert max-w-none">
              <h2 className="text-2xl font-bold">Seconds Count</h2>
              <p>
                When someone falls overboard, the first few seconds are critical. Do not jump in after them. Follow the
                standard drill ensuring nothing is missed.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card className="border-l-4 border-l-red-500">
                <CardHeader>
                  <CardTitle>1. SHOUT</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-bold text-lg">"MAN OVERBOARD!"</p>
                  <p className="text-muted-foreground text-sm mt-2">
                    Alert the entire crew immediately. Noise is essential.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-orange-500">
                <CardHeader>
                  <CardTitle>2. THROW</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Throw the nearest lifebuoy, danbuoy, or floating object.</p>
                  <p className="text-muted-foreground text-sm mt-2">
                    Even if they have a lifejacket, this marks the position and gives them a target.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-yellow-500">
                <CardHeader>
                  <CardTitle>3. POINT</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Assign a dedicated lookout to point continuously at the casualty.</p>
                  <p className="text-muted-foreground text-sm mt-2">
                    "Do not take your eyes off them to look at buttons or charts."
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-blue-500">
                <CardHeader>
                  <CardTitle>4. MARK</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Press the MOB button on the GPS/Plotter immediately.</p>
                  <p className="text-muted-foreground text-sm mt-2">
                    This gives you a position to return to if visual contact is lost.
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* DISTRESS CALL */}
          <TabsContent value="distress" className="space-y-6">
            <div className="prose dark:prose-invert max-w-none">
              <h2 className="text-2xl font-bold">Calling for Help</h2>
              <p>
                A Man Overboard situation is a situation of <strong>grave and imminent danger</strong>. A MAYDAY call is
                justified and recommended.
              </p>
            </div>

            <Card className="bg-destructive/5 border-destructive/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Megaphone className="w-5 h-5 text-destructive" />
                  MAYDAY Procedure
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 font-mono text-sm">
                <div className="p-4 bg-background rounded border">
                  <p className="text-destructive font-bold">MAYDAY, MAYDAY, MAYDAY</p>
                  <p>ALL STATIONS, ALL STATIONS, ALL STATIONS</p>
                  <p className="mt-2 font-bold">THIS IS YACHT [NAME], [NAME], [NAME]</p>
                  <p>CALLSIGN [Callsign] ... MMSI [MMSI]</p>
                  <p className="mt-4 text-destructive font-bold">MAYDAY YACHT [NAME]</p>
                  <p>MY POSITION IS [Latitude / Longitude] (Or: "1 mile south of...")</p>
                  <p className="mt-2 font-bold bg-yellow-100 dark:bg-yellow-900/30 p-1 inline-block">MAN OVERBOARD</p>
                  <p>REQUIRE IMMEDIATE ASSISTANCE</p>
                  <p className="mt-2">OVER</p>
                </div>
                <p className="text-muted-foreground font-sans">
                  *Press the red DSC Distress button for 5 seconds before voice transmission if possible.*
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* MANEUVERS */}
          <TabsContent value="maneuvers" className="space-y-6">
            <div className="prose dark:prose-invert max-w-none mb-6">
              <h2 className="text-2xl font-bold">Getting Back to the Casualty</h2>
              <p>
                Start your engine immediately, even if sailing. Ensure lines are clear of the prop. Approach the
                casualty so they are on the <strong>LEEWARD</strong> side (boat protects them from wind/waves).
              </p>
            </div>

            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Under Power: The Williamson Turn</CardTitle>
                  <CardDescription>Best for open water when position is generated by GPS</CardDescription>
                </CardHeader>
                <CardContent>
                  <ol className="list-decimal list-inside space-y-2">
                    <li>Note the compass heading.</li>
                    <li>Turn 60° to one side.</li>
                    <li>Turn hard over the OTHER way until you are on the reciprocal course.</li>
                    <li>Steer back down your track line.</li>
                  </ol>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Under Sail: The Reach-Tack-Reach (Figure 8)</CardTitle>
                  <CardDescription>Quickest return method when under sail</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-muted p-4 rounded-lg">
                      <h4 className="font-bold mb-2">1. The Beam Reach</h4>
                      <p className="text-sm">Turn away onto a Beam Reach. Sail for ~5-6 boat lengths.</p>
                    </div>
                    <div className="bg-muted p-4 rounded-lg">
                      <h4 className="font-bold mb-2">2. The Tack</h4>
                      <p className="text-sm">Tack the boat. Do not gybe (too dangerous with untrained crew).</p>
                    </div>
                    <div className="bg-muted p-4 rounded-lg">
                      <h4 className="font-bold mb-2">3. The Return</h4>
                      <p className="text-sm">
                        Bear away onto a broad reach initially if needed, then aim for the casualty.
                      </p>
                    </div>
                    <div className="bg-muted p-4 rounded-lg">
                      <h4 className="font-bold mb-2">4. The Approach</h4>
                      <p className="text-sm">Luff up to stop beside the casualty, keeping them on the LEEWARD bow.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Under Sail: Heaving To</CardTitle>
                  <CardDescription>Good for short-handed crews to calm the boat instantly</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>
                    Tack the boat but <strong>leave the jib sheet cleated</strong> (back the jib). Turn the wheel hard
                    to windward. The boat will stall and drift slowly.
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* DRILL TAB */}
          <TabsContent value="drill" className="space-y-6">
            <div className="prose dark:prose-invert max-w-none">
              <h2 className="text-2xl font-bold">Procedural Drills</h2>
              <p>In an emergency, muscle memory saves lives. Test your knowledge of the sequence of events.</p>
            </div>

            <MOBSortingGame />

            <div className="mt-8 p-6 bg-muted/50 rounded-xl text-center border">
              <h3 className="text-lg font-bold mb-2">Ready for the Theory Test?</h3>
              <p className="text-muted-foreground mb-4">Challenge yourself with 5 questions on Man Overboard theory.</p>
              <Button onClick={() => navigate("/quiz/safety-mob-quiz")} className="min-w-[200px]">
                Take the MOB Quiz
              </Button>
            </div>
          </TabsContent>

          {/* RECOVERY */}
          <TabsContent value="recovery" className="space-y-6">
            <div className="prose dark:prose-invert max-w-none">
              <h2 className="text-2xl font-bold">Getting Them On Board</h2>
              <p>This is often the hardest part. A wet adult in sailing gear is extremely heavy.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Swimming Ladder</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">
                    Only works if the casualty is conscious and fit. Most MOBs quickly lose strength due to cold shock.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Halyard Hoist</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">Attach a spinnaker or main halyard to their harness. Winch them up.</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Parbuckle</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">
                    Use a triangular sail (storm jib) or specialized mat attached to the rail. Roll them up the side
                    using a halyard.
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-orange-50 dark:bg-orange-950/20 border-orange-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Anchor className="w-5 h-5 text-orange-600" />
                  Cold Shock & Hypothermia
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  Treat the casualty for hypothermia horizontally. Do not let them stand up quickly as cold blood from
                  legs can cause heart failure ("Reflow Syndrome").
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-center pt-12 pb-8">
          <Button size="lg" className="w-full md:w-auto" onClick={() => navigate("/safety")}>
            Back to Safety Menu
          </Button>
        </div>
      </main>
    </div>
  );
};

export default ManOverboardTheory;
