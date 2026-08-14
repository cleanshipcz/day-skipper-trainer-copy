import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, LifeBuoy, Megaphone, Ship, Anchor, AlertTriangle, Gamepad2 } from "lucide-react";
import { MOBSortingGame } from "@/components/safety/MOBSortingGame";
import type { MobDrillScenarioKey } from "@/components/safety/mobDrillModel";
import { MOB_MAYDAY_VOICE_OPENING, MOB_RECOVERY_CONSTRAINTS, MOB_SAIL_RETURN_GUIDANCE, MOB_THEORY_OUTCOMES, MOB_THEORY_RELEASE_REVIEW, MOB_THEORY_SOURCES, isMobTheoryReleaseApproved, type MobTheoryReleaseReview } from "@/data/mobGuidance";
import { TOPIC_IDS } from "@/constants/topicRegistry";
import { useTheoryCompletionGate } from "@/features/progress/useTheoryCompletionGate";

interface ManOverboardTheoryProps { readonly releaseReview?: MobTheoryReleaseReview }

const ManOverboardTheory = ({ releaseReview = MOB_THEORY_RELEASE_REVIEW }: ManOverboardTheoryProps) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("actions");
  const evidenceIds = useMemo(() => ["actions", "distress", "maneuvers", "recovery", "drill-immediate", "drill-approach"], []);
  const completion = useTheoryCompletionGate({ topicId: TOPIC_IDS.SAFETY_MOB, requiredSectionIds: evidenceIds, catalogueRevision: "mob-theory-drill-v2", pointsOnComplete: 10 });
  const selectTab = useCallback((value: string) => {
    if (activeTab !== "drill") void completion.markSectionVisited(activeTab);
    setActiveTab(value);
    if (value !== "drill") void completion.markSectionVisited(value);
  }, [activeTab, completion]);
  const recordDrill = useCallback((scenario: MobDrillScenarioKey) => {
    void completion.markSectionVisited(`drill-${scenario}`);
  }, [completion]);
  if (!isMobTheoryReleaseApproved(releaseReview)) return <main className="container mx-auto max-w-2xl px-4 py-8"><Card className="border-amber-500" data-testid="mob-theory-release-gate"><CardHeader><CardTitle>MOB guidance awaiting qualified review</CardTitle><CardDescription>The lesson, drill and assessment hand-off remain withheld until qualified seamanship and medical reviewers record identities, qualifications, approval date and source evidence.</CardDescription></CardHeader><CardContent><Button onClick={() => navigate("/safety")}>Back to Safety Menu</Button></CardContent></Card></main>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-ocean-light/10 to-background pb-20">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" aria-label="Back to Safety Menu" onClick={() => navigate("/safety")}>
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
        <Tabs value={activeTab} onValueChange={selectTab} className="space-y-6">
          <TabsList aria-label="Man overboard lesson sections" className="grid h-auto w-full grid-cols-1 gap-1 sm:grid-cols-2 lg:grid-cols-5">
            <TabsTrigger value="actions" className="min-h-11 whitespace-normal py-2">
              <Megaphone className="w-4 h-4 mr-2" />
              Immediate Actions
            </TabsTrigger>
            <TabsTrigger value="distress" className="min-h-11 whitespace-normal py-2">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Distress Call
            </TabsTrigger>
            <TabsTrigger value="drill" className="min-h-11 whitespace-normal py-2">
              <Gamepad2 className="w-4 h-4 mr-2" />
              Drills
            </TabsTrigger>
            <TabsTrigger value="maneuvers" className="min-h-11 whitespace-normal py-2">
              <Ship className="w-4 h-4 mr-2" />
              Maneuvers
            </TabsTrigger>
            <TabsTrigger value="recovery" className="min-h-11 whitespace-normal py-2">
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
              <p><strong>Control and delegate concurrently:</strong> the helm controls speed/course and prevents a second casualty while available crew shout the alarm, throw flotation/visible markers, press the electronic MOB mark, point continuously, send distress communications and prepare the practised recovery point. Combine roles only when crew numbers require it; never casually abandon helm or lookout.</p>
            </div>
            <Card><CardHeader><CardTitle>Prevention, short-handed and tethered casualties</CardTitle></CardHeader><CardContent className="space-y-2 text-sm"><p>Prevent the fall: brief movement, lifejackets/harnesses, clipping arrangements, jackstays and night/heavy-weather controls for the actual vessel. Inspect accessible recovery equipment and rehearse with a safe training object in varied roles and conditions.</p><p>A single-handed sailor may have nobody able to turn back: remaining attached, reliable boarding arrangements, personal alerting and conservative movement controls are central. For a tethered casualty, slow and stop the vessel safely, prevent dragging and propeller exposure, and use a practised retrieval method—do not assume the tether itself enables recovery.</p></CardContent></Card>

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
                  <p className="text-destructive font-bold">{MOB_MAYDAY_VOICE_OPENING[0]}</p>
                  <p className="mt-2 font-bold">{MOB_MAYDAY_VOICE_OPENING[1]}</p>
                  <p>CALLSIGN / MMSI / OTHER IDENTIFICATION [as applicable]</p>
                  <p className="mt-4 text-destructive font-bold">MAYDAY YACHT [NAME]</p>
                  <p>MY POSITION IS [Latitude / Longitude] (Or: "1 mile south of...")</p>
                  <p className="mt-2 font-bold bg-yellow-100 dark:bg-yellow-900/30 p-1 inline-block">MAN OVERBOARD</p>
                  <p>REQUIRE IMMEDIATE ASSISTANCE</p>
                  <p>PERSONS ON BOARD [number]; [other useful information]</p>
                  <p>DESCRIPTION OF CASUALTY / CLOTHING / FLOTATION [if known]</p>
                  <p>VESSEL DESCRIPTION AND INTENTIONS [recovery action / assistance rendezvous]</p>
                  <p className="mt-2">OVER</p>
                </div>
                <p className="text-muted-foreground font-sans">
                  *If suitable DSC equipment is fitted, send the DSC distress alert as instructed by its manufacturer,
                  then follow with this voice message on Channel 16. Without DSC, call directly on Channel 16.*
                </p>
                <p className="text-muted-foreground font-sans">Delegate the radio if possible so helm and lookout continue. If recovery is doubtful, contact is lost, crew capacity is inadequate or the casualty cannot be lifted, escalate immediately and continue updating the coastguard/rescue coordinator; do not wait for a failed attempt.</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* MANEUVERS */}
          <TabsContent value="maneuvers" className="space-y-6">
            <div className="prose dark:prose-invert max-w-none mb-6">
              <h2 className="text-2xl font-bold">Getting Back to the Casualty</h2>
              <p>
                Choose and brief a controlled return appropriate to your vessel, rig, wind and sea state. If using the
                engine, first ensure lines are clear of the propeller. There is no universally safe approach side:
                plan the recovery point and an abort route, approach slowly, and aim to stop alongside.
              </p>
            </div>
            <figure className="rounded-lg border p-4" aria-labelledby="mob-return-title mob-return-caption"><h3 id="mob-return-title" className="font-semibold">Return-and-approach decision loop</h3><svg viewBox="0 0 720 150" role="img" aria-label="Decision flow from maintain contact, through select a practised vessel-dependent return, prepare recovery and propeller exclusion, approach under control, then either secure and lift or abort, reset and call for help." className="mt-3 w-full"><title>MOB return and approach decision loop</title><desc>No fixed distance or universal manoeuvre is shown. Each stage is constrained by vessel, weather, crew, contact and sea room.</desc><path d="M20 75H690" stroke="currentColor" strokeWidth="3"/><g fill="Canvas" stroke="currentColor" strokeWidth="2">{[70,220,370,520,670].map((x)=><circle key={x} cx={x} cy="75" r="38"/>)}</g><g textAnchor="middle" className="fill-current text-[13px]"><text x="70" y="70">CONTACT</text><text x="70" y="87">+ CONTROL</text><text x="220" y="70">SELECT</text><text x="220" y="87">RETURN</text><text x="370" y="70">PREPARE</text><text x="370" y="87">+ BRIEF</text><text x="520" y="70">APPROACH</text><text x="520" y="87">/ ABORT</text><text x="670" y="70">SECURE</text><text x="670" y="87">+ RECOVER</text></g></svg><figcaption id="mob-return-caption" className="mt-2 text-sm text-muted-foreground">A decision aid, not a track plot: vessel, rig, propulsion, wind, sea, traffic, visibility, contact, crew capability and sea room determine every transition.</figcaption></figure>

            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Under Power: The Williamson Turn</CardTitle>
                  <CardDescription>A powered-ship option for making good the original track</CardDescription>
                </CardHeader>
                <CardContent>
                  <ol className="list-decimal list-inside space-y-2">
                    <li>Note the compass heading.</li>
                    <li>Follow the vessel's practised Williamson-turn procedure if it is suitable.</li>
                    <li>Account for sea room, traffic, visibility, wind and sea state.</li>
                    <li>Maintain the lookout and monitor the marked MOB position throughout.</li>
                  </ol>
                  <p className="text-sm text-muted-foreground mt-4">
                    The standard large-vessel helm sequence is not an exact guarantee for every craft. Use a different
                    controlled return when the vessel or conditions make this turn unsuitable.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Under Sail: The Reach-Tack-Reach (Figure 8)</CardTitle>
                  <CardDescription>{MOB_SAIL_RETURN_GUIDANCE.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-muted p-4 rounded-lg">
                      <h4 className="font-bold mb-2">1. The Beam Reach</h4>
                      <p className="text-sm">{MOB_SAIL_RETURN_GUIDANCE.initialLeg}</p>
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
                      <p className="text-sm">
                        Use the vessel's practised final approach, slow under control, and abort early if it becomes
                        unsafe. Keep the casualty clear of a turning propeller.
                      </p>
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
                    Heaving-to may stabilise some yachts and buy organising time, but the method and result vary with rig, hull, sail plan and conditions. Use only a practised vessel-specific procedure; it is not a universal return or recovery position.
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

            <MOBSortingGame onScenarioComplete={recordDrill} />

            <div className="mt-8 p-6 bg-muted/50 rounded-xl text-center border">
              <h3 className="text-lg font-bold mb-2">Ready for the Theory Test?</h3>
              <p className="text-muted-foreground mb-4">
                Apply the complete recovery plan across 12 scenarios. Review this lesson and practise your vessel's own
                recovery plan first; missed objectives link back here for remediation.
              </p>
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
                  <p className="text-sm">Use only a rated lifting point, sling or harness attachment approved for recovery, with compatible blocks, halyard/hoist and safe working loads. A lifejacket lifting becket is usable only when its instructions explicitly permit it. Never lift by the neck, arms or an unverified clip.</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Parbuckle</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">
                    Use a purpose-made or practised compatible system secured to rated strong points. Control crushing, snagging and falls; keep recovery crew secured and do not overload rails or fittings.
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
                  If hypothermia is possible, recover and handle the casualty gently in a horizontal or near-horizontal
                  position where practicable. Vertical recovery can increase cardiac-arrest risk. Once alongside, keep
                  the engine in neutral or stop it as vessel control and conditions allow; never expose the casualty to
                  a turning propeller. For an unresponsive casualty, support the airway during securing and near-horizontal recovery where practicable; once aboard assess response, airway and breathing, start indicated resuscitation using current training, prevent further heat loss, monitor continuously and coordinate professional medical/rescue care. Do not force walking, rub limbs, give alcohol or assume recovery aboard ends the emergency.
                </p>
              </CardContent>
            </Card>
            <Card><CardHeader><CardTitle>If recovery is beyond the crew</CardTitle></CardHeader><CardContent className="text-sm">Keep the casualty secured and airway supported if achievable without creating another casualty. Maintain distress traffic, position and vessel control; request lifeboat, helicopter or nearby-vessel assistance early and follow rescue coordination instructions. If an approach becomes unstable, abort under control, retain lookout/mark, reset equipment and roles, then return—never send an unplanned swimmer.</CardContent></Card>
          </TabsContent>
        </Tabs>

        <section className="mt-8 rounded-lg border p-4" aria-labelledby="mob-progress-heading">
          <h2 id="mob-progress-heading" className="text-lg font-bold">Lesson completion evidence</h2>
          <p className="mt-1 text-sm text-muted-foreground">Review all four theory sections and successfully practise both drill scenarios. This records learning activity, not operational mastery.</p>
          {completion.loadState === "loading" && <p role="status" className="mt-3 text-sm">Restoring your MOB progress…</p>}
          {completion.loadState === "failed" && <div className="mt-3"><p role="alert" className="text-sm text-destructive">Progress could not be restored. Completion is disabled until the load succeeds.</p><Button className="mt-2 min-h-11" variant="outline" onClick={completion.retryLoad}>Retry progress load</Button></div>}
          {completion.loadState === "ready" && <div className="mt-3 space-y-2"><p role="status" aria-live="polite" className="text-sm">{completion.isCompletionDurable ? "MOB lesson completion is recorded." : `${completion.visitedSectionIds.length} of ${evidenceIds.length} learning activities recorded.`}</p><Button className="min-h-11" disabled={!completion.canComplete || completion.saveState === "saving" || completion.isCompletionDurable} onClick={() => void completion.markCompleted()}>{completion.isCompletionDurable ? "Completion recorded" : completion.saveState === "saving" ? "Saving completion…" : "Record lesson completion"}</Button>{completion.saveState === "failed" && <div><p role="alert" className="text-sm text-destructive">{completion.canComplete ? "Completion was not saved or confirmed." : "Partial learning progress was not saved."}</p><Button className="mt-2 min-h-11" variant="outline" onClick={() => void (completion.canComplete ? completion.markCompleted() : completion.retrySave())}>{completion.canComplete ? "Retry completion save" : "Retry progress save"}</Button></div>}{completion.saveState === "queued" && <p role="status" className="text-sm">Completion is saved offline and queued to sync.</p>}{completion.saveState === "local" && <p role="status" className="text-sm">Anonymous completion is saved in this browser.</p>}</div>}
        </section>

        <section className="mt-8 space-y-4 rounded-lg border p-4" aria-labelledby="mob-handoff"><h2 id="mob-handoff" className="text-xl font-bold">Reviewed outcomes and constraints</h2><p>These stable outcome identifiers are the theory/assessment contract for the separate drill redesign; they describe decisions, not proof of competence.</p><ul className="list-disc pl-5">{MOB_THEORY_OUTCOMES.map((outcome)=><li key={outcome}><code>{outcome}</code></li>)}</ul><h3 className="font-semibold">Non-negotiable constraints</h3><ul className="list-disc pl-5">{MOB_RECOVERY_CONSTRAINTS.map((constraint)=><li key={constraint}>{constraint}</li>)}</ul><h3 className="font-semibold">Sources and review basis</h3><ul className="list-disc pl-5">{MOB_THEORY_SOURCES.map((source)=><li key={source}>{source}</li>)}</ul></section>

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
