import { useNavigate } from "react-router-dom";
import { useState, useCallback, useEffect, useRef } from "react";
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
  Shield,
  LifeBuoy,
  Link,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { useProgress } from "@/hooks/useProgress";
import { TOPIC_IDS } from "@/constants/topicRegistry";
import { getQueuedProgress } from "@/features/offline/progressQueue";
import { isCurrentPersonalSafetyMastery, type PersonalSafetyMastery } from "@/components/safety/personalSafetyMastery";
import {
  lifeJacketTypes,
  inflationMethods,
  oralInflationGuidance,
  lifejacketServicingGuidance,
  lifejacketServiceSources,
  lifejacketEmergencyFeatures,
  lifejacketAttachmentGuidance,
  personalBeaconScenarios,
  personalBeaconChecks,
  lifejacketEmergencyReview,
  lifejacketEmergencySources,
  tetherJackstayReview,
  tetherJackstaySources,
  safetyEquipmentTopics,
} from "@/data/personalSafetyEquipment";
import { PersonalSafetyCheck } from "@/components/safety/PersonalSafetyCheck";

const bestEffortRemoveQueuedMarker = (key: string | null) => {
  if (!key) return;
  try { localStorage.removeItem(key); } catch { /* IndexedDB and the remote row are authoritative. */ }
};

const bestEffortWriteQueuedMarker = (key: string | null) => {
  if (!key) return;
  try { localStorage.setItem(key, "true"); } catch { /* The durable queue entry remains authoritative. */ }
};

const PersonalSafetyTheory = () => {
  const navigate = useNavigate();
  const { ownerId, loadProgressDetailed, saveProgressDetailed } = useProgress();
  const [theoryCompleted, setTheoryCompleted] = useState(false);
  const [queuedOffline, setQueuedOffline] = useState(false);
  const [loadState, setLoadState] = useState<"loading" | "ready" | "anonymous" | "failed">("loading");
  const [saveState, setSaveState] = useState<"idle" | "saving" | "failed">("idle");
  const [practicalMastered, setPracticalMastered] = useState(false);
  const [practicalEvidence, setPracticalEvidence] = useState<PersonalSafetyMastery | null>(null);
  const practicalEvidenceRef = useRef<PersonalSafetyMastery | null>(null);
  practicalEvidenceRef.current = practicalEvidence;
  const [loadAttempt, setLoadAttempt] = useState(0);
  const activeSaveRef = useRef<symbol | null>(null);
  const ownerRef = useRef(ownerId);
  ownerRef.current = ownerId;
  const queuedMarkerKey = ownerId ? `personal-safety-completion-queued:personal-safety-practical-v2:${ownerId}` : null;

  useEffect(() => {
    setPracticalMastered(false);
    setPracticalEvidence(null);
    practicalEvidenceRef.current = null;
  }, [ownerId]);

  useEffect(() => {
    let active = true;
    setLoadState("loading");
    setSaveState("idle");
    setTheoryCompleted(false);
    setQueuedOffline(false);
    activeSaveRef.current = null;
    const hydrate = async () => {
      let result: Awaited<ReturnType<typeof loadProgressDetailed>>;
      try {
        result = await loadProgressDetailed(TOPIC_IDS.SAFETY_PERSONAL);
      } catch {
        result = { status: "failed", record: null };
      }
      if (!active) return;
      if (result.status === "anonymous") {
        setLoadState("anonymous");
        return;
      }
      let locallyQueued = false;
      if (ownerId) {
        try {
          const queue = await getQueuedProgress(ownerId);
          if (!active) return;
          locallyQueued = queue.some((entry) =>
            entry.userId === ownerId
            && entry.topicId === TOPIC_IDS.SAFETY_PERSONAL
            && entry.completed
            && entry.status === "pending"
            && isCurrentPersonalSafetyMastery(entry.answersHistory?.personalSafetyMastery));
          if (!locallyQueued) bestEffortRemoveQueuedMarker(queuedMarkerKey);
        } catch {
          if (result.status !== "remote" || !result.record.completed) {
            setLoadState("failed");
            return;
          }
        }
      }
      if (!active) return;
      if (result.status === "failed") {
        if (locallyQueued) {
          setTheoryCompleted(true);
          setQueuedOffline(true);
          setLoadState("ready");
        } else setLoadState("failed");
        return;
      }
      const savedEvidence = result.status === "remote" ? result.record.answers_history?.personalSafetyMastery : null;
      const currentEvidence = isCurrentPersonalSafetyMastery(savedEvidence) ? savedEvidence : null;
      const remotelyCompleted = result.status === "remote" && Boolean(result.record.completed) && currentEvidence !== null;
      const effectiveEvidence = practicalEvidenceRef.current ?? currentEvidence;
      setPracticalEvidence(effectiveEvidence);
      setPracticalMastered(effectiveEvidence !== null);
      setTheoryCompleted(remotelyCompleted || locallyQueued);
      setQueuedOffline(!remotelyCompleted && locallyQueued);
      if (remotelyCompleted) bestEffortRemoveQueuedMarker(queuedMarkerKey);
      setLoadState("ready");
    };
    void hydrate();
    return () => { active = false; };
  }, [loadAttempt, loadProgressDetailed, ownerId, queuedMarkerKey]);

  const handleMarkComplete = useCallback(async () => {
    if (loadState !== "ready" || theoryCompleted || !practicalMastered || activeSaveRef.current) return;
    const saveToken = Symbol("personal-safety-save");
    const saveOwner = ownerId;
    activeSaveRef.current = saveToken;
    setSaveState("saving");
    let result: Awaited<ReturnType<typeof saveProgressDetailed>> = "failed";
    try {
      result = await saveProgressDetailed(TOPIC_IDS.SAFETY_PERSONAL, true, 100, 10, { personalSafetyMastery: practicalEvidence });
    } catch {
      result = "failed";
    } finally {
      if (activeSaveRef.current === saveToken) activeSaveRef.current = null;
    }
    if (ownerRef.current !== saveOwner || activeSaveRef.current !== null) return;
    if (result === "remote" || result === "queued") {
      setTheoryCompleted(true);
      setQueuedOffline(result === "queued");
      setSaveState("idle");
      if (queuedMarkerKey) {
        if (result === "queued") bestEffortWriteQueuedMarker(queuedMarkerKey);
        else bestEffortRemoveQueuedMarker(queuedMarkerKey);
      }
    } else setSaveState("failed");
  }, [loadState, ownerId, practicalEvidence, practicalMastered, queuedMarkerKey, saveProgressDetailed, theoryCompleted]);

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
              <h1 className="text-xl font-bold">Personal Safety Equipment</h1>
              <p className="text-sm text-muted-foreground">
                Buoyancy Aids, Lifejackets, Harnesses & Personal Gear
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
              <Shield className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="life-jackets" className="py-2">
              <LifeBuoy className="w-4 h-4 mr-2" />
              Buoyancy aids & lifejackets
            </TabsTrigger>
            <TabsTrigger value="equipment" className="py-2">
              <Link className="w-4 h-4 mr-2" />
              Equipment
            </TabsTrigger>
            <TabsTrigger value="servicing" className="py-2">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Servicing
            </TabsTrigger>
          </TabsList>

          {/* ── OVERVIEW ──────────────────────────────────────────── */}
          <TabsContent value="overview" className="space-y-6">
            <div className="prose dark:prose-invert max-w-none">
              <h2 className="text-2xl font-bold">
                Personal Safety Equipment
              </h2>
              <p>
                Personal safety equipment is the last line of defence between
                a crew member and the sea. A Day Skipper must understand the
                different types of life jacket, when to wear them, how they
                work, and how to maintain them. Equally important is
                understanding harnesses, tethers, jacklines, and kill cords
                — the equipment that keeps you on the boat in the first place.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card className="border-l-4 border-l-blue-500">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LifeBuoy className="w-5 h-5 text-blue-500" />
                    Buoyancy aids & lifejackets
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    ISO 12402 distinguishes Level 50 buoyancy aids from
                    Level 100, 150, and 275 lifejackets. Choose for the
                    conditions, clothing, equipment, and the manufacturer's
                    stated fit and performance — a higher level alone does
                    not guarantee that every wearer will turn face-up.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-amber-500">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Link className="w-5 h-5 text-amber-500" />
                    Stay on Board
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    The best safety strategy is preventing crew from going
                    overboard. Harnesses, tethers, and jacklines keep you
                    attached to the vessel. A correctly fitted, functioning
                    kill cord should stop the engine if the helm operator is
                    thrown clear, reducing the risk of an uncontrolled craft
                    and propeller injury.
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-muted/50">
              <CardContent className="pt-6">
                <p className="text-sm font-medium">
                  <strong>Key principle:</strong> Wear the right buoyancy aid or lifejacket
                  for the conditions, ensure it is properly fitted, fasten the
                  crotch strap where one is provided, and clip on with a harness and tether
                  before conditions deteriorate, and always attach the kill
                  cord when at the helm.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Emergency features: find and check them before use</CardTitle>
                <CardDescription>Locations and operation vary by model. Open only what the maker permits, and practise with the actual lifejacket instructions.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <figure className="rounded-lg border bg-muted/30 p-4" aria-labelledby="lifejacket-features-caption">
                  <svg viewBox="0 0 760 480" role="img" aria-labelledby="lifejacket-diagram-title lifejacket-diagram-desc" aria-describedby="lifejacket-feature-key" className="h-auto w-full" preserveAspectRatio="xMidYMid meet">
                    <title id="lifejacket-diagram-title">Inflated lifejacket emergency-feature positions</title>
                    <desc id="lifejacket-diagram-desc">Front view of an inflated horseshoe lifejacket. Numbered positional leader lines identify the sprayhood over the head, emergency light high on the wearer's left lobe, retroreflective patches on both upper lobes, and whistle low on the wearer's right lobe. Exact positions vary by manufacturer.</desc>
                    <g fill="none" stroke="currentColor" strokeWidth="5" strokeLinejoin="round">
                      <circle cx="380" cy="105" r="42" />
                      <path d="M315 95 Q380 28 445 95 L432 150 Q420 190 456 350 Q420 405 380 425 Q340 405 304 350 Q340 190 328 150Z" fill="hsl(var(--muted))" />
                      <path d="M333 105 Q380 52 427 105 L420 145 Q380 120 340 145Z" fill="hsl(var(--background))" />
                      <path d="M330 76 Q380 34 430 76 L445 120 Q380 88 315 120Z" strokeDasharray="8 6" />
                      <path d="M326 140l45 36M434 140l-45 36" strokeWidth="12" />
                      <rect x="407" y="172" width="25" height="32" rx="5" fill="hsl(var(--background))" />
                      <circle cx="330" cy="298" r="13" fill="hsl(var(--background))" />
                    </g>
                    <g aria-hidden="true" fill="currentColor" fontSize="28" fontWeight="700" textAnchor="middle">
                      <path d="M315 82H115" stroke="currentColor" strokeWidth="4" /><circle cx="315" cy="82" r="7" /><circle cx="82" cy="82" r="27" fill="hsl(var(--background))" stroke="currentColor" strokeWidth="4" /><text x="82" y="92">1</text>
                      <path d="M420 187H645" stroke="currentColor" strokeWidth="4" /><circle cx="420" cy="187" r="7" /><circle cx="678" cy="187" r="27" fill="hsl(var(--background))" stroke="currentColor" strokeWidth="4" /><text x="678" y="197">2</text>
                      <path d="M345 158H115" stroke="currentColor" strokeWidth="4" /><circle cx="345" cy="158" r="7" /><circle cx="82" cy="158" r="27" fill="hsl(var(--background))" stroke="currentColor" strokeWidth="4" /><text x="82" y="168">3</text>
                      <path d="M330 298H115" stroke="currentColor" strokeWidth="4" /><circle cx="330" cy="298" r="7" /><circle cx="82" cy="298" r="27" fill="hsl(var(--background))" stroke="currentColor" strokeWidth="4" /><text x="82" y="308">4</text>
                    </g>
                  </svg>
                  <ol id="lifejacket-feature-key" className="mt-4 grid list-none gap-2 p-0 text-sm sm:grid-cols-2" aria-label="Lifejacket diagram callout key">
                    <li className="rounded-md border bg-background p-3"><strong>1 — Sprayhood:</strong> over the head and inflated lobes.</li>
                    <li className="rounded-md border bg-background p-3"><strong>2 — Emergency light:</strong> high on the illustrated wearer&apos;s left lobe.</li>
                    <li className="rounded-md border bg-background p-3"><strong>3 — Retroreflective material:</strong> patches on both upper lobes.</li>
                    <li className="rounded-md border bg-background p-3"><strong>4 — Whistle:</strong> reachable low on the illustrated wearer&apos;s right lobe.</li>
                  </ol>
                  <figcaption id="lifejacket-features-caption" className="mt-3 text-sm text-muted-foreground">Labelled feature map for the inflated lifejacket: whistle and emergency light must be reachable and exposed; retroreflective patches face searchers; the sprayhood covers the head and inflated lobes without obscuring the airway or light. Exact positions are manufacturer-specific.</figcaption>
                </figure>
                <div className="grid gap-4 md:grid-cols-2">
                  {lifejacketEmergencyFeatures.map((feature) => (
                    <section key={feature.id} aria-labelledby={`feature-${feature.id}`} className="rounded-lg border p-4">
                      <h3 id={`feature-${feature.id}`} className="font-semibold">{feature.name}</h3>
                      <p className="mt-2 text-sm text-muted-foreground">{feature.purpose}</p>
                      <p className="mt-2 text-sm"><strong>Before use:</strong> {feature.preUse}</p>
                      <p className="mt-2 text-sm"><strong>In the water:</strong> {feature.emergencyUse}</p>
                    </section>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── BUOYANCY AIDS & LIFEJACKETS ──────────────────────── */}
          <TabsContent value="life-jackets" className="space-y-6">
            <div className="prose dark:prose-invert max-w-none">
              <h2 className="text-2xl font-bold">Buoyancy aids & lifejackets</h2>
              <p>
                ISO 12402 personal flotation devices are classified by level.
                A Day Skipper must know whether a buoyancy aid or lifejacket
                is appropriate for the conditions and understand the difference
                between manual, water-activated automatic, and hydrostatic
                pressure-activated inflation.
              </p>
            </div>

            {/* Life jacket type cards */}
            <div className="grid gap-4">
              {lifeJacketTypes.map((lj) => (
                <Card key={lj.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>{lj.name}</CardTitle>
                      <Badge
                        variant={lj.buoyancyRating === "50N" ? "outline" : "default"}
                        className="gap-1"
                      >
                        {lj.buoyancyRating}
                      </Badge>
                    </div>
                    <CardDescription>{lj.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium mb-1">Suitable For</p>
                        <p className="text-xs text-muted-foreground">
                          {lj.suitableFor}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-1">
                          Self-righting performance
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {lj.selfRightingPerformance}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Inflation methods */}
            <div className="prose dark:prose-invert max-w-none mt-8">
              <h3 className="text-xl font-bold">
                Inflation Methods
              </h3>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {inflationMethods.map((method) => (
                <Card key={method.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{method.name}</CardTitle>
                    <CardDescription>{method.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm font-medium mb-1 text-green-600">
                        Advantages
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {method.advantages}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-1 text-red-600">
                        Disadvantages
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {method.disadvantages}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="bg-muted/50">
              <CardHeader>
                <CardTitle className="text-lg">Oral inflation: backup and top-up</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{oralInflationGuidance}</p>
              </CardContent>
            </Card>

            {/* Crotch straps card */}
            <Card className="bg-destructive/5 border-destructive/20 mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                  Crotch Strap — Critical Fitting Point
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                <p className="mb-2">
                  A crotch strap passes between the legs and prevents the
                  life jacket from riding up over the wearer&apos;s head in
                  the water. Without a properly fastened crotch strap, a
                  life jacket can slip off entirely in rough seas.
                </p>
                <ul className="list-disc list-inside space-y-1">
                  {safetyEquipmentTopics
                    .find((t) => t.id === "crotch-straps")
                    ?.keyPoints.map((point, i) => <li key={i}>{point}</li>)}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── EQUIPMENT (harnesses, tethers, jacklines, kill cords) ── */}
          <TabsContent value="equipment" className="space-y-6">
            <div className="prose dark:prose-invert max-w-none">
              <h2 className="text-2xl font-bold">
                Harnesses, Tethers, Jacklines & Kill Cords
              </h2>
              <p>
                Preventing a crew member from going overboard is far more
                effective than recovering them from the water. The following
                equipment works together to keep you on the boat.
              </p>
            </div>

            {safetyEquipmentTopics
              .filter((t) =>
                ["harnesses-tethers", "jacklines", "kill-cords"].includes(t.id),
              )
              .map((topic) => (
                <Card key={topic.id}>
                  <CardHeader>
                    <CardTitle>{topic.name}</CardTitle>
                    <CardDescription>{topic.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                      {topic.keyPoints.map((point, i) => (
                        <li key={i}>{point}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}

            <Card>
              <CardHeader><CardTitle>Attachment points: stay attached versus recover</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p><strong>Harness / tether attachment:</strong> {lifejacketAttachmentGuidance.harness}</p>
                <p><strong>Lifting / recovery loop:</strong> {lifejacketAttachmentGuidance.recovery}</p>
                <p className="rounded-md border border-destructive/30 bg-destructive/5 p-3"><strong>Do not improvise:</strong> {lifejacketAttachmentGuidance.warning}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>PLB or AIS-MOB? Match the alert path to the passage</CardTitle><CardDescription>Names do not guarantee capabilities. Read the current model specification and confirm fit with the activity, vessel, radios, displays, and rescue plan.</CardDescription></CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="grid gap-3 md:grid-cols-3">
                  {personalBeaconScenarios.map((scenario) => <section key={scenario.title} className="rounded-lg border p-3"><h3 className="font-semibold">{scenario.title}</h3><p className="mt-2 text-muted-foreground">{scenario.choice}</p></section>)}
                </div>
                <ul className="list-disc space-y-2 pl-5">{personalBeaconChecks.map((check) => <li key={check}>{check}</li>)}</ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Lifejacket emergency-feature evidence boundaries</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p className="text-muted-foreground">Sources checked {lifejacketEmergencyReview.sourceCheckedOn}. World Sailing OSR section 5.01 is an offshore-racing requirement within its categories, not universal law. For an ordinary Day Skipper passage, use it proportionately alongside the passage risk assessment, RYA guidance, actual equipment instructions, vessel fit, and applicable law. {lifejacketEmergencyReview.releaseNote}</p>
                <ul className="list-disc space-y-2 pl-5">{lifejacketEmergencySources.map((source) => <li key={source.id}><a className="text-primary underline underline-offset-4" href={source.href} target="_blank" rel="noreferrer">{source.label}</a><span className="text-muted-foreground"> — {source.scope}</span></li>)}</ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Tether and jackstay evidence boundaries</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p className="text-muted-foreground">
                  Source claims checked {tetherJackstayReview.sourceCheckedOn}. Recreational PFD context,
                  ISO 12401 product conformity, and World Sailing offshore-racing rules have different scopes.
                  {" "}{tetherJackstayReview.releaseNote}
                </p>
                <ul className="list-disc space-y-2 pl-5">
                  {tetherJackstaySources.map((source) => (
                    <li key={source.id} className="break-words [overflow-wrap:anywhere]">
                      <a className="text-primary underline underline-offset-4" href={source.href} target="_blank" rel="noreferrer">{source.label}</a>
                      <span className="text-muted-foreground"> — {source.scope}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── SERVICING ────────────────────────────────────────── */}
          <TabsContent value="servicing" className="space-y-6">
            <div className="prose dark:prose-invert max-w-none">
              <h2 className="text-2xl font-bold">
                Servicing & Maintenance
              </h2>
              <p>
                A life jacket is only as reliable as its last service.
                Inflatable life jackets contain mechanisms that degrade over
                time. The product label and current manufacturer instructions
                define its checks, replacement dates, service interval, and
                whether an owner may test or re-arm it.
              </p>
            </div>

            {safetyEquipmentTopics
              .filter((t) => t.id === "servicing")
              .map((topic) => (
                <Card key={topic.id}>
                  <CardHeader>
                    <CardTitle>{topic.name}</CardTitle>
                    <CardDescription>{topic.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                      {topic.keyPoints.map((point, i) => (
                        <li key={i}>{point}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}

            <div className="grid gap-4 md:grid-cols-3">
              {Object.values(lifejacketServicingGuidance).map((section) => (
                <Card key={section.name}>
                  <CardHeader>
                    <CardTitle>{section.name}</CardTitle>
                    <CardDescription>{section.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                      {section.keyPoints.map((point) => <li key={point}>{point}</li>)}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader><CardTitle>Authoritative sources and currency</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p className="text-muted-foreground">
                  Reviewed 12 August 2026. Check the product manufacturer and
                  current legislation before relying on an interval or procedure;
                  source pages and requirements can change.
                </p>
                <ul className="list-disc space-y-2 pl-5">
                  {lifejacketServiceSources.map((source) => (
                    <li key={source.href} className="break-words [overflow-wrap:anywhere]">
                      <a className="text-primary underline underline-offset-4" href={source.href} target="_blank" rel="noreferrer">{source.label}</a>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

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
                    Never assume a life jacket works — check it before every
                    passage.
                  </li>
                  <li>
                    After activation, re-arm the lifejacket only with the
                    exact cylinder, firing head or water-activated element,
                    seals, and indicators specified by its manufacturer;
                    kits and procedures are model-specific.
                  </li>
                  <li>
                    Brief all crew on how to operate their life jacket at the
                    start of every passage — especially guests and new crew.
                  </li>
                  <li>
                    Ensure every life jacket on board fits its wearer — an
                    ill-fitting jacket can be as dangerous as no jacket at all.
                  </li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="pt-10">
          <PersonalSafetyCheck key={`${ownerId ?? "anonymous"}:${practicalEvidence?.revision ?? "new"}`} initialEvidence={practicalEvidence} onMastery={(evidence) => { practicalEvidenceRef.current = evidence; setPracticalEvidence(evidence); setPracticalMastered(evidence !== null); }} />
        </div>

        {/* Completion button + back navigation */}
        <div className="flex flex-col items-center gap-4 pt-12 pb-8">
          {loadState === "anonymous" && <div role="status" className="space-y-3 rounded-md border p-4 text-center"><p>Sign in to save completion and earn progress for this lesson.</p><Button type="button" variant="outline" onClick={() => navigate("/auth")}>Sign in</Button></div>}
          {loadState === "failed" && <div role="alert" className="space-y-3 rounded-md border border-destructive p-4 text-center"><p>Saved progress could not be loaded. Completion is unavailable until loading succeeds.</p><Button type="button" variant="outline" onClick={() => setLoadAttempt((attempt) => attempt + 1)}>Retry loading progress</Button></div>}
          {saveState === "failed" && <p role="alert" className="rounded-md border border-destructive p-4 text-center">Completion was not saved. Check your connection and retry.</p>}
          {queuedOffline && <p role="status" className="rounded-md border p-4 text-center">Completion is queued offline for this account and will sync when you reconnect.</p>}
          <Button
            size="lg"
            className="w-full md:w-auto gap-2"
            variant={theoryCompleted ? "outline" : "default"}
            disabled={loadState !== "ready" || theoryCompleted || !practicalMastered || saveState === "saving"}
            onClick={() => void handleMarkComplete()}
          >
            {theoryCompleted ? (
              <>
                <CheckCircle2 className="w-5 h-5" />
                {queuedOffline ? "Queued offline" : "Completed"}
              </>
            ) : loadState === "loading" ? "Loading progress…" : loadState === "anonymous" ? "Sign in to complete" : loadState === "failed" ? "Progress unavailable" : !practicalMastered ? "Complete the practical safety check" : saveState === "saving" ? "Saving completion…" : saveState === "failed" ? "Retry saving completion" : "Mark as Complete"}
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

export default PersonalSafetyTheory;
