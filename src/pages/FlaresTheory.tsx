import { useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
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
} from "@/components/safety/FlareIdentificationDrill";
import { useProgress } from "@/hooks/useProgress";
import { TOPIC_IDS } from "@/constants/topicRegistry";
import { evdsGuidance, flareOperatingSequence, flareReview, flareSources, flareStorageBoundary, flareTypes, isFlareContentReleased, representativeManufacturerInstructions, solasAndMakerBoundary, ukCarriageGuidance } from "@/data/flareTypes";
import { FlareSchematic } from "@/components/safety/FlareSchematic";

const REQUIRED_FLARE_THEORY_SECTIONS = ["overview", "flare-types", "expiry", "drill"] as const;

const FlaresTheory = () => {
  const navigate = useNavigate();
  const { ownerId, loadProgressDetailed, saveProgressDetailed } = useProgress();
  const [visited, setVisited] = useState(() => new Set(["overview"]));
  const [theoryState, setTheoryState] = useState<"loading" | "ready" | "saving" | "confirmed" | "queued" | "anonymous" | "failed">("loading");
  const theoryCompleted = ["confirmed", "queued", "anonymous"].includes(theoryState);

  useEffect(() => {
    let current = true;
    if (!isFlareContentReleased) { setTheoryState("ready"); return () => { current = false; }; }
    void loadProgressDetailed(TOPIC_IDS.SAFETY_FLARES).then(result => {
      if (!current) return;
      const evidence = result.record?.answers_history as { revision?: unknown; visitedSectionIds?: unknown } | null;
      const complete = result.record?.completed === true && evidence?.revision === "flare-theory-evidence-v1" && Array.isArray(evidence.visitedSectionIds) && REQUIRED_FLARE_THEORY_SECTIONS.every(id => evidence.visitedSectionIds!.includes(id));
      setTheoryState(complete ? "confirmed" : "ready");
    });
    return () => { current = false; };
  }, [loadProgressDetailed]);

  const handleMarkComplete = useCallback(async () => {
    if (!isFlareContentReleased || theoryCompleted || theoryState === "saving" || !REQUIRED_FLARE_THEORY_SECTIONS.every(id => visited.has(id))) return;
    setTheoryState("saving");
    try {
      const result = await saveProgressDetailed(TOPIC_IDS.SAFETY_FLARES, true, 100, 10, { revision: "flare-theory-evidence-v1", ownerId, visitedSectionIds: REQUIRED_FLARE_THEORY_SECTIONS });
      setTheoryState(result === "remote" ? "confirmed" : result === "queued" ? "queued" : result === "anonymous" ? "anonymous" : "failed");
    } catch { setTheoryState("failed"); }
  }, [ownerId, saveProgressDetailed, theoryCompleted, theoryState, visited]);


  if (!isFlareContentReleased) return <main className="container mx-auto max-w-2xl p-6"><Card role="status" className="forced-colors:border-[CanvasText]"><CardHeader><CardTitle>Flare lesson release blocked</CardTitle><CardDescription>Qualified-practitioner approval for content version {flareReview.contentVersion} is not evidenced. Revised theory, identification drill and completion controls are unavailable; no progress is loaded, saved, restored or awarded.</CardDescription></CardHeader><CardContent><Button variant="outline" onClick={() => navigate("/safety")}><ArrowLeft className="mr-2 size-4" />Back to Safety</Button></CardContent></Card></main>;

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
        <Tabs defaultValue="overview" className="space-y-6" onValueChange={value => setVisited(previous => new Set(previous).add(value))}>
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
                Identify the printed signal type, purpose and operating label—not casing colour alone. Dimensions, mechanisms, performance and service life vary by product.
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
                    <FlareSchematic id={flare.id} label={flare.visualLabel} />
                    <p className="my-3 text-sm"><strong>Recognition:</strong> {flare.recognition}</p>
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
            <Card><CardHeader><CardTitle>Prepare, operate and handle a misfire</CardTitle></CardHeader><CardContent><ol className="list-decimal space-y-2 pl-5 text-sm">{flareOperatingSequence.map((step) => <li key={step}>{step}</li>)}</ol></CardContent></Card>
            <Card><CardHeader><CardTitle>Electronic visual distress signals (EVDS)</CardTitle></CardHeader><CardContent><p className="text-sm text-muted-foreground">{evdsGuidance}</p></CardContent></Card>
            <Card><CardHeader><CardTitle>Approval and product instructions</CardTitle></CardHeader><CardContent><p className="text-sm text-muted-foreground">{solasAndMakerBoundary}</p></CardContent></Card>
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
                    Check the expiry or service-life date printed on every unit. Do not infer a universal life from another maker or product.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Storage</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-2">
                  <p>
                    {flareStorageBoundary}
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
                    casually, or store them as backups. In the UK, HM Coastguard and RNLI stations do not accept unwanted flares. Arrange acceptance before travel through a registered disposal point, supplier, marina/port, participating council facility or specialist contractor.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Carriage Requirements</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-2">
                  <p>
                    {ukCarriageGuidance}
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
                    Follow the handling and wind instructions printed on the exact device; do not transfer a method between products.
                  </li>
                  <li>
                    Never fire a parachute rocket under a helicopter — it
                    can reach aircraft operating overhead and could endanger them.
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
            <Card><CardHeader><CardTitle>Sources, version and review boundary</CardTitle></CardHeader><CardContent className="space-y-3 text-sm"><p>{flareReview.reviewScope} Content version {flareReview.contentVersion}; reviewed {flareReview.reviewedOn}.</p><p className="font-medium">Manual verification limit: {flareReview.manualVerification}</p><ul className="list-disc space-y-2 pl-5">{[...flareSources, ...representativeManufacturerInstructions].map((source) => <li key={source.id}><a href={source.href} target="_blank" rel="noreferrer" className="text-primary underline underline-offset-4">{source.label}</a><span className="text-muted-foreground"> — {source.version}</span></li>)}</ul></CardContent></Card>
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

            <FlareIdentificationDrill />

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
            disabled={theoryCompleted || theoryState === "loading" || theoryState === "saving" || !REQUIRED_FLARE_THEORY_SECTIONS.every(id => visited.has(id))}
            onClick={() => void handleMarkComplete()}
          >
            {theoryCompleted ? (
              <>
                <CheckCircle2 className="w-5 h-5" />
                {theoryState === "queued" ? "Completion queued" : theoryState === "anonymous" ? "Completed on this device" : "Completed"}
              </>
            ) : (
              theoryState === "loading" ? "Loading saved progress…" : theoryState === "saving" ? "Saving completion…" : theoryState === "failed" ? "Retry completion save" : REQUIRED_FLARE_THEORY_SECTIONS.every(id => visited.has(id)) ? "Save theory completion" : "Visit all four sections to complete"
            )}
          </Button>
          <p role="status" aria-live="polite" className="text-center text-sm text-muted-foreground">{theoryState === "failed" ? "Theory completion was not saved; retry when ready." : theoryState === "queued" ? "Theory completion is durably queued for account sync." : theoryState === "anonymous" ? "Theory completion is stored for this anonymous device; sign in for cross-device restore." : theoryState === "confirmed" ? "Theory completion restored and confirmed for this account." : `${visited.size} of ${REQUIRED_FLARE_THEORY_SECTIONS.length} required sections visited.`}</p>
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
