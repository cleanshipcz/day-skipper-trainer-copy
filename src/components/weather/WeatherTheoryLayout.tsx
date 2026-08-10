import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useProgress } from "@/hooks/useProgress";

export interface TheorySection {
  title: string;
  body: ReactNode;
}

export const WeatherTheoryLayout = ({ title, subtitle, topicId, sections, children }: {
  title: string;
  subtitle: string;
  topicId: string;
  sections: readonly TheorySection[];
  children?: ReactNode;
}) => {
  const navigate = useNavigate();
  const { ownerId, loadProgressDetailed, saveProgressDetailed } = useProgress();
  const [complete, setComplete] = useState(false);
  const [queuedOffline, setQueuedOffline] = useState(false);
  const [loadState, setLoadState] = useState<"loading" | "ready" | "anonymous" | "error">("loading");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const savingRef = useRef(false);
  const queuedMarkerKey = ownerId ? `weather-theory-queued:${ownerId}:${topicId}` : null;
  useEffect(() => {
    let active = true;
    setLoadState("loading");
    setSaveError(false);
    setComplete(false);
    setQueuedOffline(false);
    void loadProgressDetailed(topicId).then((result) => {
      if (!active) return;
      if (result.status === "anonymous") {
        setLoadState("anonymous");
        return;
      }
      const locallyQueued = queuedMarkerKey !== null && window.localStorage.getItem(queuedMarkerKey) === "true";
      if (locallyQueued && result.status === "failed") {
        setComplete(true);
        setQueuedOffline(true);
        setLoadState("ready");
        return;
      }
      if (result.status === "failed") {
        setLoadState("error");
        return;
      }
      const remotelyComplete = result.status === "remote" && Boolean(result.record.completed);
      const queuedWithoutRemoteCompletion = !remotelyComplete && locallyQueued;
      setComplete(remotelyComplete || queuedWithoutRemoteCompletion);
      setQueuedOffline(queuedWithoutRemoteCompletion);
      if (remotelyComplete && queuedMarkerKey) window.localStorage.removeItem(queuedMarkerKey);
      setLoadState("ready");
      if (result.status === "missing" && !queuedWithoutRemoteCompletion) {
        void saveProgressDetailed(topicId, false, 0, 0, { engagementState: "started" });
      }
    });
    return () => {
      active = false;
    };
  }, [loadAttempt, loadProgressDetailed, queuedMarkerKey, saveProgressDetailed, topicId]);
  const finish = async () => {
    if (complete || loadState !== "ready" || savingRef.current) return;
    savingRef.current = true;
    setSaving(true);
    setSaveError(false);
    try {
      const result = await saveProgressDetailed(topicId, true, 100, 10, { completionState: "completed" });
      if (result === "remote" || result === "queued") {
        setComplete(true);
        setQueuedOffline(result === "queued");
        if (queuedMarkerKey) {
          if (result === "queued") window.localStorage.setItem(queuedMarkerKey, "true");
          else window.localStorage.removeItem(queuedMarkerKey);
        }
      }
      else setSaveError(true);
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-ocean-light/10 to-background pb-16">
      <header className="border-b bg-card/80 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" aria-label="Back to meteorology" onClick={() => navigate("/weather")}><ArrowLeft /></Button>
          <div><h1 className="text-xl font-bold">{title}</h1><p className="text-sm text-muted-foreground">{subtitle}</p></div>
        </div>
      </header>
      <main className="container mx-auto max-w-5xl px-4 py-8 space-y-8">
        <div className="grid md:grid-cols-2 gap-5">
          {sections.map((section) => (
            <Card key={section.title}>
              <CardHeader><CardTitle>{section.title}</CardTitle></CardHeader>
              <CardContent className="space-y-3 leading-relaxed">{section.body}</CardContent>
            </Card>
          ))}
        </div>
        {children}
        {loadState === "anonymous" && <div role="status" className="rounded-md border p-3 text-center">Sign in to save completion and earn progress for this lesson.</div>}
        {loadState === "error" && <div role="alert" className="rounded-md border border-destructive p-3 text-center"><p>We couldn’t load your lesson progress. Completion is unavailable until the read succeeds.</p><Button className="mt-2" variant="outline" onClick={() => setLoadAttempt((attempt) => attempt + 1)}>Retry loading progress</Button></div>}
        {saveError && <div role="alert" className="rounded-md border border-destructive p-3 text-center">We couldn’t save completion. Your completion was not marked; check your connection and retry.</div>}
        {queuedOffline && <div role="status" className="rounded-md border p-3 text-center">Completion is queued offline for this account and will sync when you reconnect.</div>}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={finish} disabled={loadState !== "ready" || saving || complete}>{queuedOffline ? <><CheckCircle2 className="mr-2" />Queued offline</> : complete ? <><CheckCircle2 className="mr-2" />Completed</> : loadState === "loading" ? "Loading progress…" : loadState === "anonymous" ? "Sign in to complete" : loadState === "error" ? "Progress unavailable" : saving ? "Saving completion…" : saveError ? "Retry saving completion" : "Mark theory complete"}</Button>
          <Button variant="outline" onClick={() => navigate("/weather")}>Back to Meteorology</Button>
        </div>
      </main>
    </div>
  );
};
