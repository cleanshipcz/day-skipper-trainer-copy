/**
 * IALA Buoyage Theory page.
 *
 * Covers IALA Region A buoyage system: lateral marks, cardinal marks
 * (with clock-face mnemonic), isolated danger, safe water, special marks,
 * and new danger marks. Includes an interactive BuoyIdentifier drill.
 *
 * @see docs/FEATURE_TASKS.md — Story E2-S1
 */
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
  Compass,
  Navigation,
  AlertTriangle,
  Gamepad2,
  CheckCircle2,
} from "lucide-react";
import { BuoyIdentifier, type BuoyDrillResult } from "@/components/pilotage/BuoyIdentifier";
import { useProgress } from "@/hooks/useProgress";
import { ialaBuoys } from "@/data/ialabuoys";

const TOPIC_ID = "pilotage-buoyage";
const POINTS_ON_COMPLETE = 10;

const lateralBuoys = ialaBuoys.filter((b) => b.category === "lateral");
const cardinalBuoys = ialaBuoys.filter((b) => b.category === "cardinal");
const otherBuoys = ialaBuoys.filter(
  (b) =>
    b.category === "isolated-danger" ||
    b.category === "safe-water" ||
    b.category === "special" ||
    b.category === "new-danger"
);

const BuoyageTheory = () => {
  const navigate = useNavigate();
  const { saveProgress } = useProgress();
  const [theoryCompleted, setTheoryCompleted] = useState(false);

  const handleMarkComplete = useCallback(() => {
    saveProgress(TOPIC_ID, true, 100, POINTS_ON_COMPLETE);
    setTheoryCompleted(true);
  }, [saveProgress]);

  const handleDrillComplete = useCallback(
    (_result: BuoyDrillResult) => {
      // Drill completion is informational — main completion is via the button
    },
    []
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
              onClick={() => navigate("/pilotage")}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">IALA Buoyage</h1>
              <p className="text-sm text-muted-foreground">
                Region A Navigation Marks
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Tabs defaultValue="lateral" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 h-auto">
            <TabsTrigger value="lateral" className="py-2">
              <Navigation className="w-4 h-4 mr-2" />
              Lateral
            </TabsTrigger>
            <TabsTrigger value="cardinal" className="py-2">
              <Compass className="w-4 h-4 mr-2" />
              Cardinal
            </TabsTrigger>
            <TabsTrigger value="other" className="py-2">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Other Marks
            </TabsTrigger>
            <TabsTrigger value="drill" className="py-2">
              <Gamepad2 className="w-4 h-4 mr-2" />
              Drill
            </TabsTrigger>
          </TabsList>

          {/* ── LATERAL MARKS ────────────────────────────────────────── */}
          <TabsContent value="lateral" className="space-y-6">
            <div className="prose dark:prose-invert max-w-none">
              <h2 className="text-2xl font-bold">IALA Region A — Lateral Marks</h2>
              <p>
                The International Association of Marine Aids to Navigation and
                Lighthouse Authorities (IALA) divides the world into two regions.
                The UK and most of Europe use <strong>IALA Region A</strong>,
                where the principle is:{" "}
                <em>red to port (left) and green to starboard (right)</em> when
                entering a channel from seaward.
              </p>
              <p>
                Remember the mnemonic: <strong>"Is there any red port left?"</strong>{" "}
                — red marks the port side. Lateral marks define the edges of a
                navigable channel.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {lateralBuoys.map((buoy) => (
                <Card key={buoy.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      {buoy.name}
                    </CardTitle>
                    <CardDescription>{buoy.visualDescriptor}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="font-medium">Colour</p>
                        <p className="text-muted-foreground">{buoy.colour}</p>
                      </div>
                      <div>
                        <p className="font-medium">Top Mark</p>
                        <p className="text-muted-foreground">{buoy.topMarkShape}</p>
                      </div>
                      <div>
                        <p className="font-medium">Light</p>
                        <p className="text-muted-foreground">{buoy.lightCharacteristic}</p>
                      </div>
                    </div>
                    <div className="pt-2 border-t">
                      <p className="text-sm">{buoy.meaning}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* ── CARDINAL MARKS ───────────────────────────────────────── */}
          <TabsContent value="cardinal" className="space-y-6">
            <div className="prose dark:prose-invert max-w-none">
              <h2 className="text-2xl font-bold">Cardinal Marks</h2>
              <p>
                Cardinal marks indicate the direction of the deepest or safest
                water relative to the mark. They are named by the compass
                quadrant in which you should pass: a <strong>North Cardinal</strong>{" "}
                means pass to the north of the mark.
              </p>
              <p>
                The colour bands and top marks follow a logical pattern based on
                the orientation of the two black cones.
              </p>
            </div>

            {/* Clock-face mnemonic (AC-4) */}
            <Card className="bg-muted/50 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Compass className="w-5 h-5" />
                  The Clock-Face Mnemonic
                </CardTitle>
                <CardDescription>
                  Use a clock face to remember the number of flashes for each
                  cardinal mark's light pattern.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div className="p-3 rounded-lg bg-background border">
                    <p className="text-2xl font-bold">12</p>
                    <p className="text-sm font-medium">North</p>
                    <p className="text-xs text-muted-foreground">
                      Continuous (VQ / Q)
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-background border">
                    <p className="text-2xl font-bold">3</p>
                    <p className="text-sm font-medium">East</p>
                    <p className="text-xs text-muted-foreground">3 flashes</p>
                  </div>
                  <div className="p-3 rounded-lg bg-background border">
                    <p className="text-2xl font-bold">6</p>
                    <p className="text-sm font-medium">South</p>
                    <p className="text-xs text-muted-foreground">
                      6 flashes + long
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-background border">
                    <p className="text-2xl font-bold">9</p>
                    <p className="text-sm font-medium">West</p>
                    <p className="text-xs text-muted-foreground">9 flashes</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Think of a clock face: North is at 12 (continuous), East at 3
                  (3 flashes), South at 6 (6 flashes + long flash), West at 9 (9
                  flashes). The long flash on the South cardinal distinguishes it
                  from East.
                </p>
              </CardContent>
            </Card>

            <div className="grid gap-4">
              {cardinalBuoys.map((buoy) => (
                <Card key={buoy.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{buoy.name}</CardTitle>
                      <Badge variant="outline">{buoy.lightCharacteristic}</Badge>
                    </div>
                    <CardDescription>{buoy.visualDescriptor}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="grid md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="font-medium">Colour</p>
                        <p className="text-muted-foreground">{buoy.colour}</p>
                      </div>
                      <div>
                        <p className="font-medium">Top Mark</p>
                        <p className="text-muted-foreground">{buoy.topMarkShape}</p>
                      </div>
                      <div>
                        <p className="font-medium">Meaning</p>
                        <p className="text-muted-foreground">{buoy.meaning}</p>
                      </div>
                    </div>
                    {buoy.clockFaceMnemonic && (
                      <div className="pt-2 border-t">
                        <p className="text-sm text-primary/80">
                          <strong>Mnemonic:</strong> {buoy.clockFaceMnemonic}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* ── OTHER MARKS ──────────────────────────────────────────── */}
          <TabsContent value="other" className="space-y-6">
            <div className="prose dark:prose-invert max-w-none">
              <h2 className="text-2xl font-bold">
                Isolated Danger, Safe Water, Special &amp; New Danger Marks
              </h2>
              <p>
                Beyond lateral and cardinal marks, the IALA system includes
                several additional mark types that a Day Skipper must recognise.
              </p>
            </div>

            <div className="grid gap-4">
              {otherBuoys.map((buoy) => {
                const categoryLabel =
                  buoy.category === "isolated-danger"
                    ? "Isolated Danger"
                    : buoy.category === "safe-water"
                      ? "Safe Water"
                      : buoy.category === "special"
                        ? "Special Mark"
                        : "New Danger";
                return (
                  <Card key={buoy.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{buoy.name}</CardTitle>
                        <Badge variant="secondary">{categoryLabel}</Badge>
                      </div>
                      <CardDescription>{buoy.visualDescriptor}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="grid md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="font-medium">Colour</p>
                          <p className="text-muted-foreground">{buoy.colour}</p>
                        </div>
                        <div>
                          <p className="font-medium">Top Mark</p>
                          <p className="text-muted-foreground">{buoy.topMarkShape}</p>
                        </div>
                        <div>
                          <p className="font-medium">Light</p>
                          <p className="text-muted-foreground">
                            {buoy.lightCharacteristic}
                          </p>
                        </div>
                      </div>
                      <div className="pt-2 border-t">
                        <p className="text-sm">{buoy.meaning}</p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* ── DRILL TAB ────────────────────────────────────────────── */}
          <TabsContent value="drill" className="space-y-6">
            <div className="prose dark:prose-invert max-w-none">
              <h2 className="text-2xl font-bold">Buoy Identification Drill</h2>
              <p>
                Test your knowledge: given a buoy description, identify the
                correct buoy type. At sea, quick recognition can prevent a
                grounding.
              </p>
            </div>

            <BuoyIdentifier onComplete={handleDrillComplete} />
          </TabsContent>
        </Tabs>

        {/* Completion button + back navigation */}
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
            onClick={() => navigate("/pilotage")}
          >
            Back to Pilotage Menu
          </Button>
        </div>
      </main>
    </div>
  );
};

export default BuoyageTheory;
