import { useNavigate } from "react-router-dom";
import { useState, useCallback, useMemo, useRef, useEffect } from "react";
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
import { FireExtinguisherDrill, FIRE_DRILL_PASS_PERCENT, type DrillResult } from "@/components/safety/FireExtinguisherDrill";
import { useProgress } from "@/hooks/useProgress";
import { TOPIC_IDS } from "@/constants/topicRegistry";
import { useTheoryCompletionGate } from "@/features/progress/useTheoryCompletionGate";
import {
  fireBlankets,
  fireExtinguishers,
  fireResponseScenarios,
  FIRE_SAFETY_RELEASE_REVIEW,
  isFireSafetyReleaseApproved,
  type FireSafetyReleaseReview,
} from "@/data/fireExtinguishers";

interface FireSafetyTheoryProps {
  readonly releaseReview?: FireSafetyReleaseReview;
}

const FireSafetyTheory = ({ releaseReview = FIRE_SAFETY_RELEASE_REVIEW }: FireSafetyTheoryProps) => {
  const navigate = useNavigate();
  const { saveProgressDetailed, ownerId } = useProgress();
  const theorySectionIds = useMemo(() => ["fire-triangle", "fire-types", "extinguishers", "prevention"], []);
  const theoryGate = useTheoryCompletionGate({ topicId: TOPIC_IDS.SAFETY_FIRE, requiredSectionIds: theorySectionIds, catalogueRevision: "fire-safety-v2", pointsOnComplete: 10, acceptLegacyCompleted: true });
  const [activeTab, setActiveTab] = useState("fire-triangle");
  const [drillSaveState, setDrillSaveState] = useState<"idle" | "saving" | "saved" | "queued" | "local" | "failed" | "retry">("idle");
  const drillSaveRef = useRef<{ generation: number; promise: Promise<void> } | null>(null);
  const drillOwnerRef = useRef(ownerId);
  const drillGenerationRef = useRef(0);
  const releaseApproved = isFireSafetyReleaseApproved(releaseReview);

  useEffect(() => {
    if (drillOwnerRef.current === ownerId) return;
    drillOwnerRef.current = ownerId;
    drillGenerationRef.current += 1;
    drillSaveRef.current = null;
    setDrillSaveState("idle");
  }, [ownerId]);

  const handleMarkComplete = useCallback(() => void theoryGate.markCompleted(), [theoryGate]);

  const handleDrillComplete = useCallback(
    (result: DrillResult) => {
      const generation = drillGenerationRef.current;
      if (drillSaveRef.current?.generation === generation) return;
      const total = Math.min(fireResponseScenarios.length, result.totalAnswered);
      const correct = Math.min(total, result.correctCount);
      const score = total === 0 ? 0 : Math.round((correct / total) * 100);
      const passed = total === fireResponseScenarios.length && score >= FIRE_DRILL_PASS_PERCENT;
      setDrillSaveState("saving");
      const operation = saveProgressDetailed(TOPIC_IDS.SAFETY_FIRE_DRILL, passed, score, passed ? 10 : 0, { catalogueRevision: "fire-drill-v2", correctCount: correct, totalAnswered: total, incorrectScenarioIds: result.incorrectScenarioIds, passed })
        .then((outcome) => {
          if (drillGenerationRef.current !== generation) return;
          setDrillSaveState(outcome === "remote" ? "saved" : outcome === "queued" ? "queued" : outcome === "anonymous" && result.browserPersisted ? "local" : "failed");
        })
        .finally(() => { if (drillSaveRef.current?.generation === generation) drillSaveRef.current = null; });
      drillSaveRef.current = { generation, promise: operation };
    },
    [saveProgressDetailed]
  );

  if (!releaseApproved) {
    return (
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="border-amber-500" data-testid="fire-safety-release-gate">
          <CardHeader>
            <CardTitle>Fire safety lesson awaiting competent review</CardTitle>
            <CardDescription>
              The lesson, drill and completion controls are withheld until a competent marine fire-safety reviewer records their name, qualification, approval date and source evidence.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/safety")}>Back to Safety Menu</Button>
          </CardContent>
        </Card>
      </main>
    );
  }

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
                Escape-first response, prevention & equipment
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Tabs value={activeTab} onValueChange={(value) => { setActiveTab(value); if (theorySectionIds.includes(value)) void theoryGate.markSectionVisited(value); }} className="space-y-6">
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
                    paraffin, paint, and varnish. Cooking oils and fats are Class F. Never use water —
                    it spreads burning liquid.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-red-600">
                <CardHeader><CardTitle className="flex items-center gap-2"><Badge className="bg-red-600">F</Badge>Class F — Cooking Oils &amp; Fats</CardTitle></CardHeader>
                <CardContent><p className="text-sm text-muted-foreground">High-temperature cooking oils and fats. Never use water or ordinary foam. Use equipment specifically marked for Class F; a fire blanket is separate equipment limited to a small, contained pan that can be covered safely.</p></CardContent>
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

              <Card className="border-l-4 border-l-slate-600">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Badge className="bg-slate-600">D</Badge>
                    Class D — Combustible Metals
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Burning metals require a specialist agent selected for the
                    particular metal. Ordinary ABC dry powder is not Class D
                    powder and must never be assumed suitable from its colour
                    band or the word “powder”.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-purple-600">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Badge className="bg-purple-600">Hazard</Badge>
                    Energised Electrical Equipment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Not a UK/EN fire class, but a critical marine hazard. Fires
                    involving live electrical equipment — panels, wiring,
                    chargers. Isolate the power first if safe. Before isolation,
                    use only equipment explicitly tested and marked for use on
                    energised electrical equipment.
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
                        <p className="text-xs mt-3"><strong>Selection:</strong> {ext.selectionRule}</p>
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
            <div className="prose dark:prose-invert max-w-none pt-4">
              <h2 className="text-2xl font-bold">Fire Blankets</h2>
              <p>Fire blankets are separate firefighting equipment. They are not extinguishers and do not carry extinguisher colour bands or class-suitability ratings.</p>
            </div>
            <div className="grid gap-4">
              {fireBlankets.map((blanket) => (
                <Card key={blanket.id}>
                  <CardHeader>
                    <CardTitle>{blanket.type}</CardTitle>
                    <CardDescription>{blanket.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="grid md:grid-cols-2 gap-4 text-xs text-muted-foreground">
                    <div><p className="font-medium text-foreground mb-2">Limited safe use</p><ul>{blanket.safeUse.map((item) => <li key={item}>✓ {item}</li>)}</ul></div>
                    <div><p className="font-medium text-foreground mb-2">Limitations</p><ul>{blanket.limitations.map((item) => <li key={item}>✗ {item}</li>)}</ul></div>
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
                Prevention and a rehearsed response protect people before anyone
                considers fighting a fire. The vessel's plans, installed systems
                and manufacturer instructions are authoritative.
              </p>
            </div>

            <Card className="border-destructive/40" data-testid="escape-first-procedure">
              <CardHeader>
                <CardTitle>Alarm → Muster and escape → Call → Isolate → Fight only if safe</CardTitle>
                <CardDescription>Start every response with people, escape and early communication.</CardDescription>
              </CardHeader>
              <CardContent>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li><strong>Raise the alarm:</strong> shout “Fire”, operate the alarm and alert everyone immediately.</li>
                  <li><strong>Muster and escape:</strong> account for every person, move them away from smoke and flame, put on lifejackets when appropriate and keep a viable exit. Never delay an immediate evacuation.</li>
                  <li><strong>Communicate early:</strong> offshore send a Mayday with position, people and fire details before capacity is lost. Alongside or inland, evacuate ashore where safe, call the local fire and rescue service/marina and warn nearby craft.</li>
                  <li><strong>Contain and isolate only if safe:</strong> from a safe location use labelled remote stops for engines, fuel, gas, batteries/shore power and ventilation as the vessel plan directs. Close—not enter—boundaries where that preserves containment and escape.</li>
                  <li><strong>Fight only a small, contained fire:</strong> use installed or portable equipment approved for that application, keep the exit behind you and stop immediately if smoke, heat, spread or equipment limitations threaten the route.</li>
                </ol>
                <p className="text-sm font-medium mt-4">No unprotected smoke entry. Do not pass through smoke, work alone, or let firefighting block the only escape route.</p>
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-3">
              <Card><CardHeader><CardTitle className="text-lg">Offshore</CardTitle></CardHeader><CardContent className="text-sm text-muted-foreground">Muster in the safest available position, make an early Mayday, ready survival equipment without delaying escape, and manoeuvre only if the vessel plan and conditions allow.</CardContent></Card>
              <Card><CardHeader><CardTitle className="text-lg">Alongside or inland</CardTitle></CardHeader><CardContent className="text-sm text-muted-foreground">Use a clear route ashore, call shore emergency services and the marina/navigation authority, warn adjacent craft and do not cast off a burning vessel unless directed by the authorities.</CardContent></Card>
              <Card><CardHeader><CardTitle className="text-lg">Immediate evacuation</CardTitle></CardHeader><CardContent className="text-sm text-muted-foreground">If fire or smoke threatens the last exit, evacuate now. Do not delay for shutdowns, firefighting equipment, a grab bag or property; transmit location and distress information as able.</CardContent></Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Galley Safety</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-2">
                  <p>Never leave cooking or portable heaters unattended. Secure pans, keep combustibles clear, and ensure approved equipment is visible, accessible and positioned so it can be reached without passing the hazard.</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Gas System</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-2">
                  <p>Turn gas off at the bottle after use. Inspect hoses, connections and locker drains to the service schedule; use qualified servicing and approved replacement parts.</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Batteries, charging and shore power</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-2">
                  <p>Inspect wiring, fuses, chargers, batteries, terminals and shore leads for damage, heat or corrosion. Ventilate as designed, use compatible approved chargers, avoid unattended charging and know safe remote isolation points.</p>
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

            <Card>
              <CardHeader><CardTitle className="text-lg">Detection, readiness and drills</CardTitle></CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>Test smoke/heat/CO detection and alarms as specified. Inspect and service extinguishers, fixed systems, fire blankets, shutdowns and emergency communications at the approved intervals; check seals, gauges, dates, access and certification.</p>
                <p>Keep exits and deck routes lit, unlocked and clear. Brief everyone on alarms, muster, two routes where available, distress calls, shutdown controls and survival equipment. Practise realistic drills without live discharge, smoke entry or sacrificing an escape route.</p>
              </CardContent>
            </Card>

            {/* Engine Room Fire Procedure */}
            <Card className="bg-destructive/5 border-destructive/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-destructive" />
                  Engine Room Fire Procedure
                </CardTitle>
                <CardDescription>
                  For a closed space with a system approved and sized for that space. Follow its instructions and the vessel plan.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>
                    <strong>ALARM, MUSTER, ESCAPE AND CALL EARLY.</strong> Account for everyone and confirm nobody is in the protected space.
                  </li>
                  <li>
                    <strong>KEEP THE SPACE CLOSED.</strong> Do not open a hatch to inspect or discharge; preserve the enclosure and the crew's escape route.
                  </li>
                  <li>
                    <strong>OPERATE REMOTE SHUTDOWNS</strong> for engine/generator, fuel and ventilation, plus other controls required by the vessel and system manufacturer—only from a safe location.
                  </li>
                  <li>
                    <strong>DISCHARGE THE APPROVED FIXED SYSTEM</strong> only after its evacuation and shutdown prerequisites are complete. Use a fire port only where the vessel plan and the particular approved portable unit explicitly provide for it.
                  </li>
                  <li>
                    <strong>MAINTAIN CLOSURE AND MONITOR</strong> boundaries, smoke and temperature from a safe position. Expect re-ignition because hot fuel and machinery retain heat.
                  </li>
                  <li>
                    <strong>DO NOT REOPEN.</strong> Reopening admits oxygen and may expose crew to flame, toxic products or extinguishing agent. Await the system's stated hold time and competent emergency-service advice; keep distress communications updated and remain ready to evacuate.
                  </li>
                </ol>
                <p className="text-xs text-muted-foreground mt-3">
                  The equipment ratings and limitations taught in the Extinguishers tab still apply; a medium name alone does not authorise use in an engine space.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── DRILL TAB ──────────────────────────────────────────── */}
          <TabsContent value="drill" className="space-y-6">
            <div className="prose dark:prose-invert max-w-none">
              <h2 className="text-2xl font-bold">Escape-first Response Drill</h2>
              <p>
                Practise the order of alarm, evacuation, distress communication,
                safe isolation and limited firefighting. Equipment matching is
                deliberately not assessed here.
              </p>
            </div>

            <FireExtinguisherDrill key={ownerId ?? "anonymous"} storageKey={`fire-drill:${ownerId ?? "anonymous"}:v2`} onComplete={handleDrillComplete} />
            <p role={drillSaveState === "failed" ? "alert" : "status"} aria-live="polite" aria-atomic="true" className="break-words text-sm text-muted-foreground">
              {drillSaveState === "saving" ? "Saving drill evidence…" : drillSaveState === "saved" ? "Drill evidence saved to your account." : drillSaveState === "queued" ? "Drill evidence is durably queued offline and will sync when you reconnect." : drillSaveState === "local" ? "Drill evidence is saved on this device. Sign in to sync it to an account." : drillSaveState === "failed" ? "Drill evidence could not be saved. Restart the drill and retry when ready." : `Pass requires at least ${FIRE_DRILL_PASS_PERCENT}% after all ${fireResponseScenarios.length} scenarios. A retry records evidence but does not award completion points.`}
            </p>

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
            variant={theoryGate.isCompletionDurable ? "outline" : "default"}
            disabled={!theoryGate.isHydrated || theoryGate.loadState !== "ready" || !theoryGate.canComplete || theoryGate.saveState === "saving" || theoryGate.isCompletionDurable}
            onClick={handleMarkComplete}
          >
            {theoryGate.isCompletionDurable ? (
              <>
                <CheckCircle2 className="w-5 h-5" />
                Completed
              </>
            ) : (
              theoryGate.saveState === "saving" ? "Saving…" : theoryGate.saveState === "failed" ? "Retry completion save" : theoryGate.canComplete ? "Mark as Complete" : `Review all theory sections (${theoryGate.visitedSectionIds.length} of ${theorySectionIds.length})`
            )}
          </Button>
          <p role={theoryGate.loadState === "failed" || theoryGate.saveState === "failed" ? "alert" : "status"} aria-live="polite" className="max-w-xl text-center text-sm text-muted-foreground">
            {theoryGate.loadState === "failed" ? "Saved theory evidence could not be loaded. Retry loading before completion." : theoryGate.saveState === "queued" ? "Theory completion is durably queued offline." : theoryGate.saveState === "local" ? "Theory completion is saved on this device; sign in to sync it." : theoryGate.saveState === "saved" ? "Theory completion is saved to your account." : "Open each theory section to record review evidence before completion."}
          </p>
          {theoryGate.loadState === "failed" && <Button type="button" variant="outline" onClick={theoryGate.retryLoad}>Retry loading progress</Button>}
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
