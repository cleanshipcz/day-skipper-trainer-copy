import { useEffect, useMemo, useState } from "react";
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
  const [loadRevision, setLoadRevision] = useState(0);

  const selectedTopic = useMemo(
    () => topicList.find((topic) => topic.id === selectedTopicId) ?? null,
    [selectedTopicId, topicList],
  );

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

  const persistCompletedIds = async (completedIds: string[]) => {
    setPersistenceStatus("saving");
    setPendingCompletedIds(completedIds);
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
      return;
    }
    setPendingCompletedIds(null);
    setPersistenceStatus(result === "anonymous" ? "anonymous" : "saved");
  };

  const handleTopicComplete = (topicId: string) => {
    const topic = topicList.find((t) => t.id === topicId);
    if (!topic || topic.completed || tipChecks.length !== topic.tips.length || persistenceStatus === "loading" || persistenceStatus === "saving" || persistenceStatus === "failed") return;
    const updatedTopics = topicList.map((t) => (t.id === topicId ? { ...t, completed: true } : t));
    const completedIds = updatedTopics.filter((item) => item.completed).map((item) => item.id);
    setTopicList(updatedTopics);
    setTipChecks([]);
    toast.success("Topic study check completed.");
    void persistCompletedIds(completedIds);
  };

  const completedCount = topicList.filter((t) => t.completed).length;
  const score = completedCount * POINTS_PER_TOPIC;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-ocean-light/10 to-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold">Anchorwork</h1>
                <p className="text-sm text-muted-foreground">Master anchoring techniques</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-accent" />
                <span className="font-bold text-lg">{score}</span>
              </div>
              <Badge variant="secondary">
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
        <div className="mb-4 text-sm" aria-live="polite">
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
                onClick={() => pendingCompletedIds ? void persistCompletedIds(pendingCompletedIds) : setLoadRevision((revision) => revision + 1)}
              >
                {pendingCompletedIds ? "Retry save" : "Retry load"}
              </Button>
            </span>
          )}
        </div>
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Topics Sidebar */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">Topics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {topicList.map((topic) => (
                <button
                  key={topic.id}
                  onClick={() => {
                    setSelectedTopicId(topic.id);
                    setTipChecks([]);
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
                    {topic.completed && <CheckCircle2 className="w-4 h-4 text-success" />}
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>

          {/* Content Area */}
          <div className="lg:col-span-3 space-y-6">
            {selectedTopic && (
              <>
                <Card>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-2xl flex items-center gap-3">
                          <Anchor className="w-8 h-8 text-primary" />
                          {selectedTopic.title}
                        </CardTitle>
                        {selectedTopic.completed && (
                          <Badge variant="default" className="bg-success mt-2">
                            ✓ Completed
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
                        <CheckCircle2 className="w-5 h-5 text-secondary" />
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
                        🎮 Try Minigame
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="relative w-full aspect-video bg-gradient-to-b from-ocean-light/20 to-ocean/40 rounded-lg border-2 border-ocean/30 flex items-center justify-center">
                      <svg className="w-full h-full" viewBox="0 0 400 250">
                        {/* Water surface */}
                        <line
                          x1="0"
                          y1="80"
                          x2="400"
                          y2="80"
                          stroke="hsl(var(--ocean))"
                          strokeWidth="2"
                          strokeDasharray="5,5"
                        />

                        {/* Seabed */}
                        <path
                          d="M 0 200 Q 100 195 200 200 T 400 200 L 400 250 L 0 250 Z"
                          fill="hsl(var(--muted))"
                          opacity="0.3"
                        />

                        {/* Boat */}
                        <path
                          d="M 180 50 L 160 75 L 240 75 L 220 50 Z"
                          fill="hsl(var(--card))"
                          stroke="hsl(var(--primary))"
                          strokeWidth="2"
                        />
                        <rect
                          x="190"
                          y="35"
                          width="20"
                          height="15"
                          fill="hsl(var(--muted))"
                          stroke="hsl(var(--primary))"
                          strokeWidth="1"
                        />

                        {/* Anchor rode */}
                        <line x1="200" y1="75" x2="280" y2="195" stroke="hsl(var(--rope))" strokeWidth="3" />

                        {/* Anchor */}
                        <path
                          d="M 280 195 L 270 210 M 280 195 L 290 210 M 280 185 L 280 210"
                          stroke="hsl(var(--primary))"
                          strokeWidth="3"
                        />

                        {/* Scope annotation */}
                        <path d="M 200 90 L 280 90" stroke="hsl(var(--accent))" strokeWidth="1" strokeDasharray="3,3" />
                        <text x="230" y="110" fill="hsl(var(--accent))" fontSize="12" fontWeight="bold">
                          Scope 5:1
                        </text>

                        {/* Depth annotation */}
                        <path
                          d="M 150 80 L 150 195"
                          stroke="hsl(var(--secondary))"
                          strokeWidth="1"
                          strokeDasharray="3,3"
                        />
                        <text x="120" y="140" fill="hsl(var(--secondary))" fontSize="12" fontWeight="bold">
                          Depth
                        </text>
                      </svg>
                    </div>
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
                  <h3 className="text-xl font-bold mb-2">🎉 All topics completed!</h3>
                  <p className="text-muted-foreground">Test your knowledge or practice with the minigame</p>
                </div>
                <div className="flex gap-3">
                  <Button size="lg" variant="outline" onClick={() => navigate("/anchor-minigame")}>
                    🎮 Play Minigame
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
