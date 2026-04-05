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
  Sparkles,
  AlertTriangle,
  Clock,
  Gamepad2,
  CheckCircle2,
  Sun,
  Moon,
} from "lucide-react";
import {
  FlareIdentificationDrill,
  type DrillResult,
} from "@/components/safety/FlareIdentificationDrill";
import { useProgress } from "@/hooks/useProgress";
import { TOPIC_IDS } from "@/constants/topicRegistry";
import { flareTypes } from "@/data/flareTypes";

const FlaresTheory = () => {
  const navigate = useNavigate();
  const { saveProgress } = useProgress();
  const [theoryCompleted, setTheoryCompleted] = useState(false);

  const handleMarkComplete = useCallback(() => {
    saveProgress(TOPIC_IDS.SAFETY_FLARES, true, 100, 10);
    setTheoryCompleted(true);
  }, [saveProgress]);

  const handleDrillComplete = useCallback(
    (result: DrillResult) => {
      if (result.totalAnswered === 0) return;
      const score = Math.round(
        (result.correctCount / result.totalAnswered) * 100,
      );
      saveProgress(TOPIC_IDS.SAFETY_FLARES_DRILL, true, score, 10);
    },
    [saveProgress],
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
              <h1 className="text-xl font-bold">Flares & Pyrotechnics</h1>
              <p className="text-sm text-muted-foreground">
                Distress Signals, Identification & Usage
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 h-auto">
            <TabsTrigger value="overview" className="py-2">
              <Sparkles className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="flare-types" className="py-2">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Flare Types
            </TabsTrigger>
            <TabsTrigger value="expiry" className="py-2">
              <Clock className="w-4 h-4 mr-2" />
              Expiry & Storage
            </TabsTrigger>
            <TabsTrigger value="drill" className="py-2">
              <Gamepad2 className="w-4 h-4 mr-2" />
              Drill
            </TabsTrigger>
          </TabsList>

          {/* ── OVERVIEW ──────────────────────────────────────────── */}
          <TabsContent value="overview" className="space-y-6">
            <div className="prose dark:prose-invert max-w-none">
              <h2 className="text-2xl font-bold">
                Distress Flares & Pyrotechnics
              </h2>
              <p>
                Pyrotechnic distress signals are a critical part of your
                safety equipment. A Day Skipper must be able to identify each
                type of flare, know when to use it, and understand the legal
                requirements for carriage and expiry.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card className="border-l-4 border-l-red-500">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                    Distress Signals
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Red flares and orange smoke are internationally recognised
                    distress signals. Using them when not in distress is a
                    criminal offence. They mean: &quot;I am in grave and
                    imminent danger and require immediate assistance.&quot;
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-amber-500">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                    Collision Warning
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    A white hand flare is NOT a distress signal — it is used
                    only to warn other vessels of your presence to avoid
                    collision. Using a red flare for collision warning would
                    trigger an unnecessary rescue response.
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-muted/50">
              <CardContent className="pt-6">
                <p className="text-sm font-medium">
                  <strong>Key principle:</strong> Choose the right flare for
                  the situation — long-range attraction (parachute rocket),
                  close-range pinpointing (hand flare), daytime signalling
                  (orange smoke), or collision warning (white flare). Using
                  the wrong type wastes a limited resource and may delay
                  rescue.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── FLARE TYPES ───────────────────────────────────────── */}
          <TabsContent value="flare-types" className="space-y-6">
            <div className="prose dark:prose-invert max-w-none">
              <h2 className="text-2xl font-bold">Flare Types</h2>
              <p>
                A Day Skipper must recognise all five flare types, know their
                range, burn time, and whether they are suitable for day,
                night, or both.
              </p>
            </div>

            <div className="grid gap-4">
              {flareTypes.map((flare) => (
                <Card key={flare.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>{flare.name}</CardTitle>
                      <div className="flex gap-1">
                        {flare.daySuitability && (
                          <Badge variant="outline" className="gap-1">
                            <Sun className="w-3 h-3" />
                            Day
                          </Badge>
                        )}
                        {flare.nightSuitability && (
                          <Badge variant="outline" className="gap-1">
                            <Moon className="w-3 h-3" />
                            Night
                          </Badge>
                        )}
                      </div>
                    </div>
                    <CardDescription>{flare.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm font-medium mb-1">Range</p>
                        <p className="text-xs text-muted-foreground">
                          {flare.range}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-1">Burn Time</p>
                        <p className="text-xs text-muted-foreground">
                          {flare.burnTime}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-1">Usage</p>
                        <p className="text-xs text-muted-foreground">
                          {flare.usage}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* ── EXPIRY & STORAGE ──────────────────────────────────── */}
          <TabsContent value="expiry" className="space-y-6">
            <div className="prose dark:prose-invert max-w-none">
              <h2 className="text-2xl font-bold">
                Expiry Rules & Safe Storage
              </h2>
              <p>
                Pyrotechnic flares have a limited shelf life and must be
                stored, maintained, and disposed of correctly. Carrying
                expired flares is not only unreliable — in some
                jurisdictions it is also illegal.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Shelf Life</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-2">
                  <p>
                    All pyrotechnic flares are stamped with a date of
                    manufacture. The typical shelf life is <strong>3 years</strong>{" "}
                    from manufacture. Check the expiry date printed on each
                    flare before every passage.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Storage</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-2">
                  <p>
                    Store flares in a cool, dry, readily accessible location —
                    ideally a dedicated flare locker or waterproof container
                    near the companionway. Every crew member should know where
                    they are kept.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Disposal</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-2">
                  <p>
                    Never throw expired flares overboard, fire them off
                    casually, or store them as backups. Return expired flares
                    to a coastguard station or marine chandlery for safe
                    professional disposal.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Carriage Requirements</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-2">
                  <p>
                    While UK law does not mandate specific flare types for
                    pleasure craft, the MCA and RYA strongly recommend
                    carrying a minimum outfit appropriate to your sailing
                    area. Coastal: hand flares and orange smoke. Offshore:
                    add parachute rockets.
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-destructive/5 border-destructive/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                  Safety Warning
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                <ul className="list-disc list-inside space-y-1">
                  <li>
                    Always hold handheld flares at arm&apos;s length on the
                    downwind side to avoid burns from dripping residue.
                  </li>
                  <li>
                    Never fire a parachute rocket under a helicopter — it
                    reaches 300 m altitude and could endanger the aircraft.
                  </li>
                  <li>
                    Wear gloves if possible — flares burn at extremely high
                    temperatures.
                  </li>
                  <li>
                    Brief all crew on flare types and locations at the start
                    of every passage.
                  </li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── DRILL TAB ─────────────────────────────────────────── */}
          <TabsContent value="drill" className="space-y-6">
            <div className="prose dark:prose-invert max-w-none">
              <h2 className="text-2xl font-bold">
                Flare Identification Drill
              </h2>
              <p>
                Test your knowledge: given a scenario at sea, choose the
                correct flare. In a real emergency, picking the wrong flare
                wastes precious time and resources.
              </p>
            </div>

            <FlareIdentificationDrill onComplete={handleDrillComplete} />

            <div className="mt-8 p-6 bg-muted/50 rounded-xl text-center border">
              <h3 className="text-lg font-bold mb-2">
                Ready for the Theory Test?
              </h3>
              <p className="text-muted-foreground mb-4">
                Challenge yourself with questions on flare types, usage, and
                regulations.
              </p>
              <Button
                onClick={() => navigate("/quiz/safety-flares-quiz")}
                className="min-w-[200px]"
              >
                Take the Flares Quiz
              </Button>
            </div>
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
            onClick={() => navigate("/safety")}
          >
            Back to Safety Menu
          </Button>
        </div>
      </main>
    </div>
  );
};

export default FlaresTheory;
