import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ExternalLink, Trophy } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { knots, Knot } from "@/data/ropeworkKnots";
import { TOPIC_IDS } from "@/constants/topicRegistry";
import { useProgress, type ProgressSaveResult } from "@/hooks/useProgress";
import { useAuth } from "@/contexts/AuthHooks";
import { KnotDiagram } from "@/components/ropework/KnotDiagram";

const POINTS_PER_KNOT = 15;
const ROPEWORK_PROGRESS_VERSION = 1;

type RopeworkProgress = {
  version: typeof ROPEWORK_PROGRESS_VERSION;
  learnedKnotIds: string[];
};

const parseRopeworkProgress = (value: unknown): string[] | null => {
  if (typeof value === "string") {
    try { value = JSON.parse(value); } catch { return null; }
  }
  if (!value || typeof value !== "object") return null;
  const payload = value as Partial<RopeworkProgress>;
  if (payload.version !== ROPEWORK_PROGRESS_VERSION || !Array.isArray(payload.learnedKnotIds)) return null;
  const validIds = new Set(knots.map((knot) => knot.id));
  if (payload.learnedKnotIds.some((id) => typeof id !== "string" || !validIds.has(id))) return null;
  return [...new Set(payload.learnedKnotIds)];
};

const RopeworkSession = () => {
  const navigate = useNavigate();
  const { loadProgressDetailed, saveProgressDetailed } = useProgress();
  const [selectedKnot, setSelectedKnot] = useState<Knot | null>(null);
  const [knotList, setKnotList] = useState<Knot[]>(knots);
  const [score, setScore] = useState(0);
  const [announcement, setAnnouncement] = useState("");
  const [practiceChoice, setPracticeChoice] = useState<number | null>(null);
  const [practiceResult, setPracticeResult] = useState<"idle" | "incorrect" | "correct">("idle");
  const [persistenceStatus, setPersistenceStatus] = useState<"loading" | "ready" | "saving" | "saved" | "anonymous" | "failed">("loading");
  const [pendingLearnedIds, setPendingLearnedIds] = useState<string[] | null>(null);
  const [loadRevision, setLoadRevision] = useState(0);
  const knotButtonRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const detailsHeadingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    let cancelled = false;
    setPendingLearnedIds(null);
    setPersistenceStatus("loading");
    void loadProgressDetailed(TOPIC_IDS.ROPEWORK).then((result) => {
      if (cancelled) return;
      if (result.status === "remote") {
        const learnedIds = parseRopeworkProgress(result.record.answers_history);
        if (learnedIds) {
          const learned = new Set(learnedIds);
          setKnotList(knots.map((knot) => ({ ...knot, discovered: learned.has(knot.id) })));
          setScore(learnedIds.length * POINTS_PER_KNOT);
        }
        setPersistenceStatus("ready");
      } else {
        setPersistenceStatus(result.status === "anonymous" ? "anonymous" : result.status === "failed" ? "failed" : "ready");
      }
    }).catch(() => {
      if (!cancelled) setPersistenceStatus("failed");
    });
    return () => { cancelled = true; };
  }, [loadProgressDetailed, loadRevision]);

  const persistLearnedIds = async (learnedIds: string[]) => {
    setPersistenceStatus("saving");
    setPendingLearnedIds(learnedIds);
    const complete = learnedIds.length === knots.length;
    const nextScore = Math.round((learnedIds.length / knots.length) * 100);
    let result: ProgressSaveResult;
    try {
      result = await saveProgressDetailed(TOPIC_IDS.ROPEWORK, complete, nextScore, complete ? knots.length * POINTS_PER_KNOT : 0, {
        version: ROPEWORK_PROGRESS_VERSION,
        learnedKnotIds: learnedIds,
      });
    } catch {
      result = "failed";
    }
    if (result === "failed") {
      setPersistenceStatus("failed");
      return;
    }
    setPendingLearnedIds(null);
    setPersistenceStatus(result === "anonymous" ? "anonymous" : "saved");
  };

  const handleKnotClick = (knot: Knot) => {
    if (persistenceStatus === "loading" || persistenceStatus === "saving" || persistenceStatus === "failed") return;
    setSelectedKnot(knot);
    setPracticeChoice(null);
    setPracticeResult("idle");
    setAnnouncement(`${knot.name} lesson opened. Complete its practice check to earn credit.`);
  };

  const handlePracticeSubmit = () => {
    if (!selectedKnot || practiceChoice === null || selectedKnot.discovered) return;
    if (practiceChoice !== selectedKnot.practice.correctOption) {
      setPracticeResult("incorrect");
      setAnnouncement(`Not quite. Review the ${selectedKnot.name} lesson and try again.`);
      return;
    }

    const learnedIds = knotList.filter((item) => item.discovered).map((item) => item.id).concat(selectedKnot.id);
    const nextCount = learnedIds.length;
    setKnotList((previous) => previous.map((knot) => knot.id === selectedKnot.id ? { ...knot, discovered: true } : knot));
    setSelectedKnot((previous) => previous ? { ...previous, discovered: true } : previous);
    setScore(nextCount * POINTS_PER_KNOT);
    setPracticeResult("correct");
    void persistLearnedIds(learnedIds);
    setAnnouncement(nextCount === knots.length
      ? `${selectedKnot.name} practice passed. All ${knots.length} knots learned. The ropework quiz is ready.`
      : `${selectedKnot.name} practice passed. 15 points earned. ${nextCount} of ${knots.length} knots learned.`);
  };

  const discoveredCount = useMemo(
    () => knotList.filter((knot) => knot.discovered).length,
    [knotList],
  );

  useEffect(() => {
    if (selectedKnot) detailsHeadingRef.current?.focus();
  }, [selectedKnot]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-ocean-light/10 to-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" aria-label="Back to Home" onClick={() => navigate("/")}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold">Ropework & Knots</h1>
                <p className="text-sm text-muted-foreground">Master essential sailing knots</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2" aria-label={`Score: ${score} points`}>
                <Trophy className="w-5 h-5 text-accent" />
                <span className="font-bold text-lg">{score}</span>
              </div>
              <Badge variant="secondary" aria-label={`${discoveredCount} of ${knotList.length} knots learned`}>
                {discoveredCount}/{knotList.length} learned
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <p className="mb-4 text-sm text-muted-foreground">Completion criteria: open each lesson and pass its practice check. Each first pass earns 15 points; all 7 knots earn 105 points and unlock the ropework quiz. Exploring lessons and incorrect attempts do not reduce your score.</p>
        <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
          {announcement}
        </p>
        <div className="mb-4 text-sm" aria-live="polite">
          {persistenceStatus === "loading" && "Loading saved ropework progress…"}
          {persistenceStatus === "saving" && "Saving ropework progress…"}
          {persistenceStatus === "saved" && "Ropework progress saved."}
          {persistenceStatus === "anonymous" && "Progress is available for this visit. Sign in to save it across devices."}
          {persistenceStatus === "failed" && (
            <span className="inline-flex items-center gap-3">
              {pendingLearnedIds ? "Progress could not be saved." : "Saved progress could not be loaded. Learning is paused to protect your existing progress."}
              {pendingLearnedIds ? (
                <Button size="sm" variant="outline" onClick={() => void persistLearnedIds(pendingLearnedIds)}>Retry save</Button>
              ) : (
                <Button size="sm" variant="outline" onClick={() => setLoadRevision((revision) => revision + 1)}>Retry load</Button>
              )}
            </span>
          )}
        </div>
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Knots Grid */}
          <div className="lg:col-span-2 grid md:grid-cols-2 gap-4">
            {knotList.map((knot) => (
              <Card
                key={knot.id}
                className={`relative transition-all hover:scale-105 ${
                  selectedKnot?.id === knot.id ? "ring-2 ring-secondary" : ""
                } ${knot.discovered ? "border-success/50" : ""}`}
              >
                <button
                  ref={(element) => { knotButtonRefs.current[knot.id] = element; }}
                  type="button"
                  aria-pressed={selectedKnot?.id === knot.id}
                  aria-labelledby={`${knot.id}-name`}
                  aria-describedby={`${knot.id}-uses ${knot.id}-state`}
                  className="absolute inset-0 z-10 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  onClick={() => handleKnotClick(knot)}
                  disabled={persistenceStatus === "loading" || persistenceStatus === "saving" || persistenceStatus === "failed"}
                />
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle id={`${knot.id}-name`} className="text-lg">{knot.name}</CardTitle>
                    <Badge
                      variant={
                        knot.difficulty === "Easy"
                          ? "default"
                          : knot.difficulty === "Medium"
                          ? "secondary"
                          : "destructive"
                      }
                    >
                      {knot.difficulty}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p id={`${knot.id}-uses`} className="text-sm text-muted-foreground mb-3">{knot.uses}</p>
                  <span id={`${knot.id}-state`} className="sr-only">
                    {knot.discovered ? "Learned" : "Not learned"}
                  </span>
                  {knot.discovered && (
                    <Badge variant="default" className="bg-success">
                      ✓ Learned
                    </Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Details Panel */}
          <Card className="lg:col-span-1 sticky top-24 h-fit">
            <CardHeader>
              <CardTitle ref={detailsHeadingRef} tabIndex={selectedKnot ? -1 : undefined}>
                {selectedKnot ? `${selectedKnot.name} details` : "Select a Knot"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedKnot ? (
                <div className="space-y-4">
                  <KnotDiagram knot={selectedKnot} />
                  <div>
                    <h3 className="font-semibold mb-2">Uses:</h3>
                    <p className="text-sm text-muted-foreground">{selectedKnot.uses}</p>
                  </div>

                  <form className="space-y-3 border-t pt-4" onSubmit={(event) => { event.preventDefault(); handlePracticeSubmit(); }}>
                    <fieldset disabled={selectedKnot.discovered || persistenceStatus === "saving"}>
                      <legend className="font-semibold">Practice check: {selectedKnot.practice.question}</legend>
                      <div className="mt-3 space-y-2">
                        {selectedKnot.practice.options.map((option, index) => (
                          <label key={option} className="flex cursor-pointer items-start gap-2 text-sm">
                            <input
                              type="radio"
                              name={`practice-${selectedKnot.id}`}
                              value={index}
                              checked={practiceChoice === index}
                              onChange={() => { setPracticeChoice(index); setPracticeResult("idle"); }}
                            />
                            <span>{option}</span>
                          </label>
                        ))}
                      </div>
                    </fieldset>
                    {!selectedKnot.discovered && <Button type="submit" className="w-full" disabled={practiceChoice === null || persistenceStatus === "saving"}>Check answer</Button>}
                    {practiceResult === "incorrect" && <p role="alert" className="text-sm text-destructive">Not quite. Review the purpose and steps, then choose again.</p>}
                    {(practiceResult === "correct" || selectedKnot.discovered) && <p className="text-sm text-success">Practice passed — 15 points earned.</p>}
                  </form>

                  <div>
                    <h3 className="font-semibold mb-2">Steps:</h3>
                    <ol className="space-y-2">
                      {selectedKnot.steps.map((step, idx) => (
                        <li key={idx} className="text-sm text-muted-foreground flex gap-2">
                          <span className="font-bold text-primary">{idx + 1}.</span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  <Button asChild className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                    <a href={selectedKnot.tutorialUrl} target="_blank" rel="noopener noreferrer" onClick={() => setAnnouncement(`Opening optional external tutorial for ${selectedKnot.name} in a new tab.`)}>
                    Optional external tutorial
                    <ExternalLink className="w-4 h-4 ml-2" />
                    </a>
                  </Button>
                  <p className="text-xs text-muted-foreground">{selectedKnot.tutorialTitle}. External content may be blocked, offline, moved, or unavailable. The diagram and steps above remain the complete lesson.</p>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => knotButtonRefs.current[selectedKnot.id]?.focus()}
                  >
                    Back to {selectedKnot.name} in knot list
                  </Button>
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  Select a knot to see its self-contained diagram and steps
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {discoveredCount === knotList.length && (
          <Card className="mt-6 border-2 border-accent bg-accent/5" role="region" aria-labelledby="ropework-completion-heading">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 id="ropework-completion-heading" className="text-xl font-bold mb-2">🎉 All knots learned! Ready for the quiz?</h3>
                  <p className="text-muted-foreground">Test your ropework knowledge</p>
                </div>
                <Button
                  size="lg"
                  className="bg-accent text-accent-foreground hover:bg-accent/90"
                  onClick={() => navigate("/quiz/ropework")}
                >
                  Take Quiz
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

const RopeworkTheory = () => {
  const { user } = useAuth();
  return <RopeworkSession key={user?.id ?? "anonymous"} />;
};

export default RopeworkTheory;
