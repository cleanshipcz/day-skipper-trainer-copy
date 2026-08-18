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
import { isCurrentPersonalSafetyMastery } from "@/components/safety/personalSafetyMastery";
import {
  lifeJacketTypes,
  inflationMethods,
  oralInflationGuidance,
  lifejacketServicingGuidance,
  lifejacketServiceSources,
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
  const [loadAttempt, setLoadAttempt] = useState(0);
  const activeSaveRef = useRef<symbol | null>(null);
  const ownerRef = useRef(ownerId);
  ownerRef.current = ownerId;
  const queuedMarkerKey = ownerId ? `personal-safety-completion-queued:${ownerId}` : null;

  useEffect(() => {
    setPracticalMastered(false);
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
      const remotelyCompleted = result.status === "remote" && Boolean(result.record.completed);
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
      result = await saveProgressDetailed(TOPIC_IDS.SAFETY_PERSONAL, true, 100, 10);
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
  }, [loadState, ownerId, practicalMastered, queuedMarkerKey, saveProgressDetailed, theoryCompleted]);

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
          <PersonalSafetyCheck key={ownerId ?? "anonymous"} onMastery={(evidence) => setPracticalMastered(evidence !== null)} />
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
