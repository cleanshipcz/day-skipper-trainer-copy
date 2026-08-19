import { useNavigate, useSearchParams } from "react-router-dom";
import { useState, useCallback, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  ArrowLeft,
  Flame,
  ToggleLeft,
  Wind,
  Box,
  AlertTriangle,
  Radar,
  CheckCircle2,
} from "lucide-react";
import { useProgress } from "@/hooks/useProgress";
import { TOPIC_IDS } from "@/constants/topicRegistry";
import { carbonMonoxideSources, gasLockerReview, gasLockerSources, gasSafetyTopics, lpgDetectorSources } from "@/data/gasSafety";

import { GasLockerDrainDiagram } from "@/components/safety/GasLockerDrainDiagram";
import { MarineLpgInstallationGuide } from "@/components/safety/MarineLpgInstallationGuide";
import { GasSafetyPractice } from "@/components/safety/GasSafetyPractice";
import { isCurrentGasSafetyMastery, type GasSafetyMastery } from "@/components/safety/gasSafetyMastery";
import { getQueuedProgress } from "@/features/offline/progressQueue";

const PROGRESS_LOAD_TIMEOUT_MS = 10_000;
const bestEffortRemoveMarker = (key: string | null) => {
  if (!key) return;
  try { localStorage.removeItem(key); } catch { /* The durable queue/remote row remains authoritative. */ }
};
const bestEffortWriteMarker = (key: string | null) => {
  if (!key) return;
  try { localStorage.setItem(key, "true"); } catch { /* The durable queue entry remains authoritative. */ }
};

/**
 * Tab configuration mapping gas safety topic IDs to their display metadata.
 * Order matches the gasSafetyTopics data file for consistent rendering.
 */
const TAB_CONFIG = [
  { topicId: "lpg-properties", icon: Flame, shortLabel: "LPG" },
  { topicId: "isolation-valves", icon: ToggleLeft, shortLabel: "Valves" },
  { topicId: "bilge-sniff-test", icon: Wind, shortLabel: "Leak Response" },
  { topicId: "gas-locker-requirements", icon: Box, shortLabel: "Locker" },
  { topicId: "carbon-monoxide", icon: AlertTriangle, shortLabel: "CO" },
  { topicId: "detector-placement", icon: Radar, shortLabel: "Detectors" },
] as const;

const GasSafetyTheory = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const fromVictualling = searchParams.get("from") === "victualling";
  const backDestination = fromVictualling ? "/victualling" : "/safety";
  const { ownerId, loadProgressDetailed, saveProgressDetailed } = useProgress();
  const [theoryCompleted, setTheoryCompleted] = useState(false);
  const [queuedOffline, setQueuedOffline] = useState(false);
  const [loadState, setLoadState] = useState<"loading" | "ready" | "anonymous" | "failed">("loading");
  const [saveState, setSaveState] = useState<"idle" | "saving" | "failed">("idle");
  const [practiceMastery, setPracticeMastery] = useState<GasSafetyMastery | null>(null);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const activeSaveRef = useRef<symbol | null>(null);
  const mountedRef = useRef(true);
  const ownerRef = useRef(ownerId);
  ownerRef.current = ownerId;
  const queuedMarkerKey = ownerId ? `gas-safety-completion-queued:gas-safety-practice-v1:${ownerId}` : null;

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    setPracticeMastery(null);
  }, [ownerId]);

  useEffect(() => {
    let active = true;
    setLoadState("loading");
    setSaveState("idle");
    setTheoryCompleted(false);
    setQueuedOffline(false);
    activeSaveRef.current = null;
    let loadTimeout: number | undefined;
    const hydrate = async () => {
      const deadline = Date.now() + PROGRESS_LOAD_TIMEOUT_MS;
      const beforeDeadline = <T,>(operation: Promise<T>) => Promise.race([
        operation,
        new Promise<never>((_, reject) => {
          loadTimeout = window.setTimeout(() => reject(new Error("Progress hydration timed out")), Math.max(0, deadline - Date.now()));
        }),
      ]);
      let result: Awaited<ReturnType<typeof loadProgressDetailed>>;
      try {
        result = await beforeDeadline(loadProgressDetailed(TOPIC_IDS.SAFETY_GAS));
      } catch {
        result = { status: "failed", record: null };
      } finally {
        if (loadTimeout !== undefined) window.clearTimeout(loadTimeout);
        loadTimeout = undefined;
      }
      if (!active) return;
      if (result.status === "anonymous") {
        setLoadState("anonymous");
        return;
      }
      let locallyQueued = false;
      if (ownerId) {
        try {
          const queue = await beforeDeadline(getQueuedProgress(ownerId));
          if (!active) return;
          locallyQueued = queue.some((entry) => entry.topicId === TOPIC_IDS.SAFETY_GAS && entry.completed && entry.status === "pending");
          if (!locallyQueued) bestEffortRemoveMarker(queuedMarkerKey);
        } catch {
          if (result.status !== "remote" || !result.record.completed) {
            setLoadState("failed");
            return;
          }
        } finally {
          if (loadTimeout !== undefined) window.clearTimeout(loadTimeout);
          loadTimeout = undefined;
        }
      }
      if (result.status === "failed") {
        if (locallyQueued) {
          setTheoryCompleted(true);
          setQueuedOffline(true);
          setLoadState("ready");
        } else setLoadState("failed");
        return;
      }
      const remotelyCompleted = result.status === "remote" && Boolean(result.record.completed);
      const savedMastery = result.status === "remote" ? result.record.answers_history?.gasSafetyMastery : null;
      if (isCurrentGasSafetyMastery(savedMastery)) setPracticeMastery(savedMastery);
      setTheoryCompleted(remotelyCompleted || locallyQueued);
      setQueuedOffline(!remotelyCompleted && locallyQueued);
      if (remotelyCompleted) bestEffortRemoveMarker(queuedMarkerKey);
      setLoadState("ready");
    };
    void hydrate();
    return () => {
      active = false;
      if (loadTimeout !== undefined) window.clearTimeout(loadTimeout);
    };
  }, [loadAttempt, loadProgressDetailed, ownerId, queuedMarkerKey]);

  const handleMarkComplete = useCallback(async () => {
    if (loadState !== "ready" || theoryCompleted || !practiceMastery || activeSaveRef.current) return;
    const saveToken = Symbol("gas-safety-save");
    const saveOwner = ownerId;
    activeSaveRef.current = saveToken;
    setSaveState("saving");
    let result: Awaited<ReturnType<typeof saveProgressDetailed>> = "failed";
    try {
      result = await saveProgressDetailed(TOPIC_IDS.SAFETY_GAS, true, 100, 10, { gasSafetyMastery: practiceMastery });
    } catch {
      result = "failed";
    } finally {
      if (activeSaveRef.current === saveToken) activeSaveRef.current = null;
    }
    if (!mountedRef.current || ownerRef.current !== saveOwner || activeSaveRef.current !== null) return;
    if (result === "remote" || result === "queued") {
      setTheoryCompleted(true);
      setQueuedOffline(result === "queued");
      setSaveState("idle");
      if (queuedMarkerKey) {
        if (result === "queued") bestEffortWriteMarker(queuedMarkerKey);
        else bestEffortRemoveMarker(queuedMarkerKey);
      }
    } else setSaveState("failed");
  }, [loadState, ownerId, practiceMastery, queuedMarkerKey, saveProgressDetailed, theoryCompleted]);

  const completionAnnouncement = theoryCompleted
    ? queuedOffline ? "Completion is durably queued on this device and will sync when you reconnect." : "Completion saved to your account."
    : saveState === "saving" ? "Saving gas safety completion…"
      : saveState === "failed" ? "Completion was not saved. Check your connection and retry."
        : loadState === "loading" ? "Loading saved gas safety progress…"
          : loadState === "failed" ? "Saved progress could not be loaded. Retry loading progress."
            : loadState === "anonymous" ? "Sign in to save completion and earn progress for this lesson."
              : practiceMastery ? "Gas safety mastery recorded. Save completion when ready." : "Complete both gas safety practice scenarios to unlock completion.";

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
              onClick={() => navigate(backDestination)}
            >
              <ArrowLeft aria-hidden="true" className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">Gas Safety</h1>
              <p className="text-sm text-muted-foreground">
                LPG & Carbon Monoxide Risks Aboard
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="mb-6"><CardContent className="pt-6 text-sm text-muted-foreground">Apply the vessel's documented procedures, appliance and detector manufacturer instructions, competent inspection advice and applicable rules. Installation details and required checks vary; if the system is unfamiliar, damaged or suspect, isolate it and obtain competent help.</CardContent></Card>
        <Tabs defaultValue="lpg-properties" className="space-y-6">
          <TabsList aria-label="Gas safety lesson sections" className="grid h-auto w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
            {TAB_CONFIG.map(({ topicId, icon: Icon, shortLabel }) => (
              <TabsTrigger key={topicId} value={topicId} className="h-auto min-h-11 whitespace-normal py-2">
                <Icon aria-hidden="true" className="mr-2 size-4 shrink-0" />
                {shortLabel}
              </TabsTrigger>
            ))}
          </TabsList>

          {gasSafetyTopics.map((topic) => (
            <TabsContent key={topic.id} value={topic.id} className="space-y-6">
              <div className="prose dark:prose-invert max-w-none">
                <h2 className="text-2xl font-bold">{topic.title}</h2>
                <p>{topic.content}</p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Key Points</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside space-y-2 text-sm">
                    {topic.keyPoints.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
              {topic.id === "isolation-valves" && <MarineLpgInstallationGuide />}
              {topic.id === "gas-locker-requirements" && (
                <>
                  <GasLockerDrainDiagram />
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Source scope and review status</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                      <p className="text-muted-foreground">
                        Sources checked {gasLockerReview.sourceCheckedOn}. {gasLockerReview.releaseNote}
                      </p>
                      <ul className="list-disc space-y-2 pl-5">
                        {gasLockerSources.map((source) => (
                          <li key={source.id}>
                            <a
                              href={source.href}
                              target="_blank"
                              rel="noreferrer"
                              className="text-primary underline underline-offset-4"
                            >
                              {source.label}
                            </a>
                            <span className="text-muted-foreground"> — {source.scope}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </>
              )}
              {topic.id === "carbon-monoxide" && <Card><CardHeader><CardTitle className="text-base">CO source scope</CardTitle></CardHeader><CardContent className="space-y-3 text-sm"><p className="text-muted-foreground">Educational guidance checked 2026-08-12. The alarm and vessel manufacturer instructions control exact installation and operation; seek urgent professional medical advice after suspected exposure.</p><ul className="list-disc space-y-2 pl-5">{carbonMonoxideSources.map(source => <li key={source.id}><a href={source.href} target="_blank" rel="noreferrer" className="text-primary underline underline-offset-4">{source.label}</a><span className="text-muted-foreground"> — {source.scope}</span></li>)}</ul></CardContent></Card>}
              {topic.id === "detector-placement" && <Card><CardHeader><CardTitle className="text-base">LPG detector source scope</CardTitle></CardHeader><CardContent className="space-y-3 text-sm"><p className="text-muted-foreground">Guidance checked 2026-08-12. These sources do not establish one detector rule or mounting position for every craft; the applicable regime, vessel design and equipment instructions control.</p><ul className="list-disc space-y-2 pl-5">{lpgDetectorSources.map(source => <li key={source.id}><a href={source.href} target="_blank" rel="noreferrer" className="text-primary underline underline-offset-4">{source.label}</a><span className="text-muted-foreground"> — {source.scope}</span></li>)}</ul></CardContent></Card>}
            </TabsContent>
          ))}
        </Tabs>

        <div className="mt-10"><GasSafetyPractice evidenceOwnerKey={`${ownerId ?? "anonymous"}:gas-safety-practice-v1`} onMastery={setPracticeMastery} /></div>

        {/* Completion button + back navigation */}
        <div className="flex flex-col items-center gap-4 pt-12 pb-8">
          {loadState === "anonymous" && <div className="space-y-3 rounded-md border p-4 text-center"><p>Sign in to save completion and earn progress for this lesson.</p><Button type="button" variant="outline" onClick={() => navigate("/auth")}>Sign in</Button></div>}
          {loadState === "failed" && <div role="alert" className="space-y-3 rounded-md border border-destructive p-4 text-center"><p>Saved progress could not be loaded. Completion is unavailable until loading succeeds.</p><Button type="button" variant="outline" onClick={() => setLoadAttempt((attempt) => attempt + 1)}>Retry loading progress</Button></div>}
          {saveState === "failed" && <p role="alert" className="rounded-md border border-destructive p-4 text-center">Completion was not saved. Check your connection and retry.</p>}
          {queuedOffline && <p className="rounded-md border p-4 text-center">Completion is queued offline for this account and will sync when you reconnect.</p>}
          <Button
            size="lg"
            className="w-full md:w-auto gap-2"
            variant={theoryCompleted ? "outline" : "default"}
            disabled={loadState !== "ready" || theoryCompleted || !practiceMastery || saveState === "saving"}
            onClick={() => void handleMarkComplete()}
          >
            {theoryCompleted ? (
              <>
                <CheckCircle2 aria-hidden="true" className="w-5 h-5" />
                {queuedOffline ? "Queued offline" : "Completed"}
              </>
            ) : (
              loadState === "loading" ? "Loading progress…" : loadState === "anonymous" ? "Sign in to complete" : loadState === "failed" ? "Progress unavailable" : !practiceMastery ? "Complete the gas safety practice" : saveState === "saving" ? "Saving completion…" : saveState === "failed" ? "Retry saving completion" : "Mark as Complete"
            )}
          </Button>
          <p role="status" aria-live="polite" aria-atomic="true" className="text-center text-sm text-muted-foreground">{completionAnnouncement}</p>
          <Button
            size="lg"
            variant="outline"
            className="w-full md:w-auto"
            onClick={() => navigate(backDestination)}
          >
            {fromVictualling ? "Back to Victualling" : "Back to Safety Menu"}
          </Button>
        </div>
      </main>
    </div>
  );
};

export default GasSafetyTheory;
