import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Anchor, CheckCircle2, Trophy } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { anchorSources, topics, Topic } from "@/data/anchorTopics";
import { TOPIC_IDS } from "@/constants/topicRegistry";
import { useProgress, type ProgressSaveResult } from "@/hooks/useProgress";
import { useAuth } from "@/contexts/AuthHooks";
import { ANCHOR_PROGRESS_VERSION, isValidAnchorCatalogue, parseAnchorProgress } from "@/features/progress/anchorProgress";
import { AnchorGeometryVisuals } from "@/components/anchorwork/AnchorGeometryVisuals";

const POINTS_PER_TOPIC = 20;
const ANCHOR_CATALOGUE_VALID = isValidAnchorCatalogue(topics);

const AnchorTheorySession = () => {
  const navigate = useNavigate();
  const { loadProgressDetailed, saveProgressDetailed } = useProgress();
  const [topicList, setTopicList] = useState<Topic[]>(ANCHOR_CATALOGUE_VALID ? topics : []);
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(ANCHOR_CATALOGUE_VALID ? topics[0].id : null);
  const [tipChecks, setTipChecks] = useState<number[]>([]);
  const [persistenceStatus, setPersistenceStatus] = useState<"loading" | "ready" | "saving" | "saved" | "anonymous" | "failed">("loading");
  const [pendingCompletedIds, setPendingCompletedIds] = useState<string[] | null>(null);
  const [pendingCompletionTitle, setPendingCompletionTitle] = useState<string | null>(null);
  const [loadRevision, setLoadRevision] = useState(0);
  const [announcements, setAnnouncements] = useState<string[]>([]);
  const topicHeadingRef = useRef<HTMLHeadingElement>(null);

  const selectedTopic = useMemo(
    () => topicList.find((topic) => topic.id === selectedTopicId) ?? null,
    [selectedTopicId, topicList],
  );

  const announce = (message: string) => {
    setAnnouncements((current) => [...current, message]);
  };

  useEffect(() => {
    let cancelled = false;
    setPendingCompletedIds(null);
    if (!ANCHOR_CATALOGUE_VALID) {
      setPersistenceStatus("failed");
      return () => { cancelled = true; };
    }
    setPersistenceStatus("loading");
    void loadProgressDetailed(TOPIC_IDS.ANCHORWORK).then((result) => {
      if (cancelled) return;
      if (result.status === "remote") {
        const completedIds = parseAnchorProgress(result.record.answers_history, topics);
        if (!completedIds) {
          setPersistenceStatus("failed");
          return;
        }
        const completed = new Set(completedIds);
        setTopicList(topics.map((topic) => ({ ...topic, completed: completed.has(topic.id) })));
        setPersistenceStatus("ready");
        return;
      }
      setPersistenceStatus(result.status === "anonymous" ? "anonymous" : result.status === "failed" ? "failed" : "ready");
    }).catch(() => { if (!cancelled) setPersistenceStatus("failed"); });
    return () => { cancelled = true; };
  }, [loadProgressDetailed, loadRevision]);

  const persistCompletedIds = async (completedIds: string[], completedTopicTitle?: string) => {
    setPersistenceStatus("saving");
    setPendingCompletedIds(completedIds);
    setPendingCompletionTitle(completedTopicTitle ?? null);
    const completed = completedIds.length === topics.length;
    const score = Math.round((completedIds.length / topics.length) * 100);
    let result: ProgressSaveResult;
    try {
      result = await saveProgressDetailed(TOPIC_IDS.ANCHORWORK, completed, score, completed ? topics.length * POINTS_PER_TOPIC : 0, {
        version: ANCHOR_PROGRESS_VERSION,
        completedTopicIds: completedIds,
      });
    } catch {
      result = "failed";
    }
    if (result === "failed") {
      setPersistenceStatus("failed");
      announce("Anchorwork progress could not be saved. Use Retry save to try again.");
      return;
    }
    setPendingCompletedIds(null);
    setPendingCompletionTitle(null);
    setPersistenceStatus(result === "anonymous" ? "anonymous" : "saved");
    announce(result === "anonymous"
      ? "Completion recorded for this visit. Sign in to save it across devices."
      : result === "queued"
        ? "Anchorwork progress saved offline and queued to sync."
        : "Anchorwork progress saved.");
  };

  const selectTopic = (topic: Topic) => {
    setSelectedTopicId(topic.id);
    setTipChecks([]);
    announce(`${topic.title} selected${topic.completed ? ", completed" : ""}.`);
    requestAnimationFrame(() => topicHeadingRef.current?.focus());
  };

  const moveTopicSelection = (currentIndex: number, direction: 1 | -1) => {
    const nextIndex = (currentIndex + direction + topicList.length) % topicList.length;
    const nextTopic = topicList[nextIndex];
    selectTopic(nextTopic);
    requestAnimationFrame(() => document.getElementById(`anchor-topic-tab-${nextTopic.id}`)?.focus());
  };

  const handleTopicComplete = (topicId: string) => {
    const topic = topicList.find((t) => t.id === topicId);
    if (!topic || topic.completed || tipChecks.length !== topic.tips.length || persistenceStatus === "loading" || persistenceStatus === "saving" || persistenceStatus === "failed") return;
    const updatedTopics = topicList.map((t) => (t.id === topicId ? { ...t, completed: true } : t));
    const completedIds = updatedTopics.filter((item) => item.completed).map((item) => item.id);
    setTopicList(updatedTopics);
    setTipChecks([]);
    announce(`${topic.title} completed. ${completedIds.length} of ${topics.length} topics completed.`);
    announce("Saving anchorwork progress.");
    toast.success("Topic study check completed.");
    void persistCompletedIds(completedIds, topic.title);
    requestAnimationFrame(() => topicHeadingRef.current?.focus());
  };

  const completedCount = topicList.filter((t) => t.completed).length;
  const score = completedCount * POINTS_PER_TOPIC;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-ocean-light/10 to-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" aria-label="Back to home" onClick={() => navigate("/")}>
                <ArrowLeft aria-hidden="true" className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold">Anchorwork</h1>
                <p className="text-sm text-muted-foreground">Master anchoring techniques</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2" aria-label={`Score: ${score} points`}>
                <Trophy aria-hidden="true" className="w-5 h-5 text-accent" />
                <span aria-hidden="true" className="font-bold text-lg">{score}</span>
              </div>
              <Badge variant="secondary" role="progressbar" aria-label="Topic completion progress" aria-valuemin={0} aria-valuemax={topicList.length} aria-valuenow={completedCount} aria-valuetext={`${completedCount} of ${topicList.length} topics completed`}>
                {completedCount}/{topicList.length} completed
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <p className="mb-2 text-sm text-muted-foreground">
          Completion criteria: read each topic and confirm every key tip before marking it complete. Each completed topic is worth 20 points.
        </p>
        <div className="mb-4 text-sm">
          {persistenceStatus === "loading" && "Loading saved anchorwork progress…"}
          {persistenceStatus === "saving" && "Saving anchorwork progress…"}
          {persistenceStatus === "saved" && "Anchorwork progress saved."}
          {persistenceStatus === "anonymous" && "Progress is available for this visit. Sign in to save it across devices."}
          {!ANCHOR_CATALOGUE_VALID && (
            <span role="alert">Anchorwork lessons are unavailable because the lesson catalogue is invalid.</span>
          )}
          {ANCHOR_CATALOGUE_VALID && persistenceStatus === "failed" && (
            <span className="inline-flex items-center gap-3" role="alert">
              {pendingCompletedIds ? "Progress could not be saved." : "Saved progress could not be loaded. Completion is paused to protect your existing progress."}
              <Button
                size="sm"
                variant="outline"
                onClick={() => pendingCompletedIds ? void persistCompletedIds(pendingCompletedIds, pendingCompletionTitle ?? undefined) : setLoadRevision((revision) => revision + 1)}
              >
                {pendingCompletedIds ? "Retry save" : "Retry load"}
              </Button>
            </span>
          )}
        </div>
        <div className="sr-only" role="status" aria-live="polite" aria-relevant="additions" data-testid="anchorwork-announcements">
          {announcements.map((message, index) => <p key={`${index}-${message}`}>{message}</p>)}
        </div>
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Topics Sidebar */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">Topics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2" role="tablist" aria-label="Anchorwork topics" aria-orientation="vertical">
              {topicList.map((topic, topicIndex) => (
                <button
                  key={topic.id}
                  id={`anchor-topic-tab-${topic.id}`}
                  role="tab"
                  aria-selected={selectedTopic?.id === topic.id}
                  aria-controls="anchor-topic-panel"
                  aria-label={`${topic.title}${topic.completed ? ", completed" : ", not completed"}`}
                  tabIndex={selectedTopic?.id === topic.id ? 0 : -1}
                  onClick={() => selectTopic(topic)}
                  onKeyDown={(event) => {
                    if (event.key === "ArrowDown" || event.key === "ArrowRight") {
                      event.preventDefault();
                      moveTopicSelection(topicIndex, 1);
                    } else if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
                      event.preventDefault();
                      moveTopicSelection(topicIndex, -1);
                    } else if (event.key === "Home" || event.key === "End") {
                      event.preventDefault();
                      const nextTopic = topicList[event.key === "Home" ? 0 : topicList.length - 1];
                      selectTopic(nextTopic);
                      requestAnimationFrame(() => document.getElementById(`anchor-topic-tab-${nextTopic.id}`)?.focus());
                    }
                  }}
                  disabled={persistenceStatus === "loading" || persistenceStatus === "saving" || persistenceStatus === "failed"}
                  className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                    selectedTopic?.id === topic.id
                      ? "border-secondary bg-secondary/10"
                      : "border-border hover:border-secondary/50"
                  } ${topic.completed ? "bg-success/5 border-success/30" : ""}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm">{topic.title}</span>
                    {topic.completed && <CheckCircle2 aria-hidden="true" className="w-4 h-4 text-success" />}
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>

          {/* Content Area */}
          <div className="lg:col-span-3 space-y-6">
            {selectedTopic && (
              <>
                <Card id="anchor-topic-panel" role="tabpanel" aria-labelledby={`anchor-topic-tab-${selectedTopic.id}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle ref={topicHeadingRef} tabIndex={-1} className="text-2xl flex items-center gap-3">
                          <Anchor aria-hidden="true" className="w-8 h-8 text-primary" />
                          {selectedTopic.title}
                        </CardTitle>
                        {selectedTopic.completed && (
                          <Badge variant="default" className="bg-success mt-2">
                            <span aria-hidden="true">✓ </span>Completed
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="font-semibold mb-3 text-lg">Overview</h3>
                      <p className="text-muted-foreground leading-relaxed">{selectedTopic.content}</p>
                    </div>

                    <div className="p-4 bg-muted rounded-lg">
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <CheckCircle2 aria-hidden="true" className="w-5 h-5 text-secondary" />
                        Key Tips
                      </h3>
                      <ul className="space-y-2">
                        {selectedTopic.tips.map((tip, idx) => (
                          <li key={idx} className="text-sm text-muted-foreground flex gap-2">
                            <span className="text-accent">•</span>
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {selectedTopic.calculationGuide && (
                      <div className="space-y-4" aria-label="Scope and swinging-room calculations">
                        {selectedTopic.calculationGuide.map((section) => (
                          <section key={section.title} className="rounded-lg border p-4">
                            <h3 className="font-semibold mb-2">{section.title}</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">{section.body}</p>
                          </section>
                        ))}
                      </div>
                    )}

                    <div className="text-sm text-muted-foreground">
                      <h3 className="font-semibold mb-2 text-foreground">Authoritative review basis</h3>
                      <ul className="list-disc pl-5 space-y-1">
                        {anchorSources
                          .filter((source) => selectedTopic.sourceIds.includes(source.id))
                          .map((source) => (
                            <li key={source.id}>
                              <a className="underline underline-offset-2" href={source.url} target="_blank" rel="noreferrer">
                                {source.title}
                              </a>
                            </li>
                          ))}
                      </ul>
                      <p className="mt-2">For a particular vessel, its manuals and equipment-maker instructions control.</p>
                    </div>

                    {!selectedTopic.completed && (
                      <form onSubmit={(event) => { event.preventDefault(); handleTopicComplete(selectedTopic.id); }} className="space-y-4">
                        <fieldset disabled={persistenceStatus === "saving"}>
                          <legend className="font-semibold">Study check</legend>
                          <p className="mb-3 text-sm text-muted-foreground">Confirm each key tip after reviewing it:</p>
                          <div className="space-y-2">
                            {selectedTopic.tips.map((tip, index) => (
                              <label key={tip} className="flex items-start gap-2 text-sm">
                                <input
                                  type="checkbox"
                                  checked={tipChecks.includes(index)}
                                  onChange={(event) => setTipChecks((current) => event.target.checked ? [...current, index] : current.filter((item) => item !== index))}
                                />
                                <span>{tip}</span>
                              </label>
                            ))}
                          </div>
                        </fieldset>
                        <Button
                          type="submit"
                          className="w-full bg-primary"
                          disabled={tipChecks.length !== selectedTopic.tips.length || persistenceStatus === "saving"}
                        >
                          Complete study check
                        </Button>
                      </form>
                    )}
                  </CardContent>
                </Card>

                {/* Diagram Card */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Anchoring Diagram</CardTitle>
                        <CardDescription>Understanding scope and swinging room</CardDescription>
                      </div>
                      <Button variant="secondary" size="sm" onClick={() => navigate("/anchor-minigame")}>
                        <span aria-hidden="true">🎮 </span>Try Minigame
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <AnchorGeometryVisuals />
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>

        {ANCHOR_CATALOGUE_VALID && topicList.length > 0 && completedCount === topicList.length && (
          <Card className="mt-6 border-2 border-accent bg-accent/5">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold mb-2"><span aria-hidden="true">🎉 </span>All topics completed!</h3>
                  <p className="text-muted-foreground">Test your knowledge or practice with the minigame</p>
                </div>
                <div className="flex gap-3">
                  <Button size="lg" variant="outline" onClick={() => navigate("/anchor-minigame")}>
                    <span aria-hidden="true">🎮 </span>Play Minigame
                  </Button>
                  <Button
                    size="lg"
                    className="bg-accent text-accent-foreground hover:bg-accent/90"
                    onClick={() => navigate("/quiz/anchorwork")}
                  >
                    Take Quiz
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

const AnchorTheory = () => {
  const { user } = useAuth();
  return <AnchorTheorySession key={user?.id ?? "anonymous"} />;
};

export default AnchorTheory;
