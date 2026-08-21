import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Trophy, RotateCcw, HelpCircle, ChevronRight, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useProgress, type ProgressSaveResult } from "@/hooks/useProgress";
import { useAuth } from "@/contexts/AuthHooks";
import { TOPIC_IDS } from "@/constants/topicRegistry";
import { sailControls, type SailControl } from "@/data/sailControls";
import SailControlsDiagram from "@/components/SailControlsDiagram";

type PartState = "hidden" | "guessing" | "correct" | "wrong";

interface PartProgress {
  state: PartState;
  attempts: number;
}

type DurableStatus =
  | "anonymous"
  | "loading"
  | "ready"
  | "saving"
  | "queued"
  | "remote"
  | "failed";
type DurableCompletionKnowledge = "absent" | "existing" | "unknown";
type RemoteSaveSemantics = "new" | "preserved" | "unknown";

interface SailControlsProgressPayload {
  module: "sail-controls";
  version: 1;
  score: number;
}

const isSavedPayload = (value: unknown): value is SailControlsProgressPayload => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const candidate = value as Record<string, unknown>;
  return candidate.module === "sail-controls" && candidate.version === 1 &&
    typeof candidate.score === "number" && Number.isFinite(candidate.score) &&
    candidate.score >= 0 && candidate.score <= sailControls.length * POINTS_FIRST_TRY;
};

const isDurableCompletionRecord = (value: unknown, ownerId: string) => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const candidate = value as Record<string, unknown>;
  return candidate.user_id === ownerId &&
    candidate.topic_id === TOPIC_IDS.NAUTICAL_TERMS_SAIL_CONTROLS &&
    candidate.completed === true &&
    typeof candidate.score === "number" && Number.isFinite(candidate.score) &&
    candidate.score >= 0 && candidate.score <= 100;
};

const POINTS_FIRST_TRY = 10;
const POINTS_SECOND_TRY = 5;

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

const SailControls = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { loadProgressDetailed, saveProgressDetailed } = useProgress();
  const [mode, setMode] = useState<"learn" | "quiz">("learn");
  const [partProgress, setPartProgress] = useState<Record<string, PartProgress>>(() => {
    const initial: Record<string, PartProgress> = {};
    sailControls.forEach((part) => {
      initial[part.id] = { state: "hidden", attempts: 0 };
    });
    return initial;
  });
  const [activePart, setActivePart] = useState<SailControl | null>(null);
  const [selectedPart, setSelectedPart] = useState<SailControl | null>(null); // clicked/locked selection
  const [hoveredPart, setHoveredPart] = useState<SailControl | null>(null); // hover highlight only
  const [score, setScore] = useState(0);
  const [wrongAnswer, setWrongAnswer] = useState<string | null>(null);
  const [quizQueue, setQuizQueue] = useState<SailControl[]>([]);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [quizAnnouncement, setQuizAnnouncement] = useState("");
  const questionHeadingRef = useRef<HTMLHeadingElement>(null);
  const completionHeadingRef = useRef<HTMLHeadingElement>(null);
  const transitionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const quizGenerationRef = useRef(0);
  const answerLockedRef = useRef(false);
  const ownerRef = useRef(user?.id ?? null);
  ownerRef.current = user?.id ?? null;
  const [durableStatus, setDurableStatus] = useState<DurableStatus>(user ? "loading" : "anonymous");
  const [pendingCompletion, setPendingCompletion] = useState<{ percentage: number; score: number } | null>(null);
  const [loadRevision, setLoadRevision] = useState(0);
  const [durableCompletionKnowledge, setDurableCompletionKnowledge] = useState<DurableCompletionKnowledge>(
    user ? "unknown" : "absent"
  );
  const [remoteSaveSemantics, setRemoteSaveSemantics] = useState<RemoteSaveSemantics>("new");

  const persistCompletion = useCallback(async (percentage: number, finalScore: number) => {
    if (!user) {
      setDurableStatus("anonymous");
      return;
    }
    const ownerId = user.id;
    const knowledgeBeforeSave = durableCompletionKnowledge;
    setDurableStatus("saving");
    setPendingCompletion({ percentage, score: finalScore });
    const payload: SailControlsProgressPayload = { module: "sail-controls", version: 1, score: finalScore };
    let result: ProgressSaveResult;
    try {
      result = await saveProgressDetailed(
        TOPIC_IDS.NAUTICAL_TERMS_SAIL_CONTROLS,
        true,
        percentage,
        finalScore,
        payload as unknown as Record<string, unknown>
      );
    } catch (error) {
      console.error("Error saving Sail Controls completion:", error);
      result = "failed";
    }
    if (ownerRef.current !== ownerId) return;
    if (result === "remote") {
      setRemoteSaveSemantics(
        knowledgeBeforeSave === "absent" ? "new" : knowledgeBeforeSave === "existing" ? "preserved" : "unknown"
      );
      setDurableCompletionKnowledge("existing");
    } else if (result === "queued") {
      // Replay can make this durable at any point, so a later save cannot
      // safely be described as the first remote record.
      setDurableCompletionKnowledge("unknown");
    }
    setDurableStatus(result === "remote" ? "remote" : result === "queued" ? "queued" : result === "anonymous" ? "anonymous" : "failed");
  }, [durableCompletionKnowledge, saveProgressDetailed, user]);

  useEffect(() => {
    let cancelled = false;
    const ownerId = user?.id ?? null;
    setPendingCompletion(null);
    if (!ownerId) {
      setDurableStatus("anonymous");
      return () => { cancelled = true; };
    }

    setDurableStatus("loading");
    void loadProgressDetailed(TOPIC_IDS.NAUTICAL_TERMS_SAIL_CONTROLS).then((loadResult) => {
      if (cancelled || ownerRef.current !== ownerId) return;
      if (loadResult.status === "failed") {
        setDurableCompletionKnowledge("unknown");
        setDurableStatus("failed");
        return;
      }
      const record = loadResult.record;
      let payload: unknown = record?.answers_history;
      if (typeof payload === "string") {
        try { payload = JSON.parse(payload); } catch { payload = null; }
      }
      if (isDurableCompletionRecord(record, ownerId)) {
        const restoredScore = isSavedPayload(payload)
          ? payload.score
          : Math.round(((record?.score ?? 0) / 100) * sailControls.length * POINTS_FIRST_TRY);
        setScore(restoredScore);
        setMode("quiz");
        setQuizQueue([...sailControls]);
        setCurrentQuizIndex(sailControls.length - 1);
        setActivePart(null);
        setPartProgress(Object.fromEntries(sailControls.map((part) => [part.id, { state: "correct", attempts: 1 }] as const)));
        setPendingCompletion({ percentage: record?.score ?? 0, score: restoredScore });
        setDurableCompletionKnowledge("existing");
        setRemoteSaveSemantics("preserved");
        setDurableStatus("remote");
      } else {
        setDurableCompletionKnowledge("absent");
        setRemoteSaveSemantics("new");
        setDurableStatus("ready");
      }
    }).catch((error) => {
      console.error("Error loading Sail Controls progress:", error);
      if (!cancelled && ownerRef.current === ownerId) setDurableStatus("failed");
    });
    return () => { cancelled = true; };
  }, [loadProgressDetailed, loadRevision, user?.id]);

  const invalidatePendingTransition = useCallback(() => {
    quizGenerationRef.current += 1;
    answerLockedRef.current = false;
    if (transitionTimeoutRef.current !== null) {
      clearTimeout(transitionTimeoutRef.current);
      transitionTimeoutRef.current = null;
    }
  }, []);

  useEffect(() => invalidatePendingTransition, [invalidatePendingTransition]);

  useEffect(() => {
    if (mode !== "quiz") return;
    if (activePart) {
      questionHeadingRef.current?.focus();
    } else if (quizQueue.length > 0) {
      completionHeadingRef.current?.focus();
    }
  }, [mode, activePart, currentQuizIndex, quizQueue.length]);

  // The highlighted part is either hovered or selected (hovered takes visual priority for diagram)
  const highlightedId = hoveredPart?.id || selectedPart?.id;

  const startQuiz = useCallback(() => {
    invalidatePendingTransition();
    const shuffled = shuffleArray([...sailControls]);
    setQuizQueue(shuffled);
    setCurrentQuizIndex(0);
    setActivePart(shuffled[0]);
    setMode("quiz");
    setWrongAnswer(null);
    const initial: Record<string, PartProgress> = {};
    sailControls.forEach((part) => {
      initial[part.id] = { state: "hidden", attempts: 0 };
    });
    setPartProgress(initial);
    setScore(0);
    setQuizAnnouncement(`Quiz started. Question 1 of ${sailControls.length}.`);
  }, [invalidatePendingTransition]);

  const options = useMemo(() => {
    if (!activePart) return [];
    const otherParts = sailControls.filter((p) => p.id !== activePart.id);
    const wrongOptions = shuffleArray(otherParts).slice(0, 3);
    return shuffleArray([activePart, ...wrongOptions]);
  }, [activePart]);

  const handleOptionSelect = useCallback(
    (selectedOption: SailControl) => {
      if (!activePart) return;

      if (selectedOption.id === activePart.id) {
        if (answerLockedRef.current) return;
        answerLockedRef.current = true;
        const attempts = partProgress[activePart.id].attempts;
        const points = attempts === 0 ? POINTS_FIRST_TRY : POINTS_SECOND_TRY;
        setScore((prev) => prev + points);
        setPartProgress((prev) => ({
          ...prev,
          [activePart.id]: { state: "correct", attempts: attempts + 1 },
        }));
        const isLastQuestion = currentQuizIndex === quizQueue.length - 1;
        setQuizAnnouncement(
          isLastQuestion
            ? `Correct. ${points} points. Quiz complete. Final score: ${score + points} points.`
            : `Correct. ${points} points. Next: question ${currentQuizIndex + 2} of ${quizQueue.length}.`
        );
        setWrongAnswer(null);

        const generation = quizGenerationRef.current;
        transitionTimeoutRef.current = setTimeout(() => {
          transitionTimeoutRef.current = null;
          if (generation !== quizGenerationRef.current) return;
          if (currentQuizIndex < quizQueue.length - 1) {
            const nextIndex = currentQuizIndex + 1;
            answerLockedRef.current = false;
            setCurrentQuizIndex(nextIndex);
            setActivePart(quizQueue[nextIndex]);
            setSelectedPart(null);
          } else {
            setActivePart(null);

            const finalScore = score + points;
            const maxScore = sailControls.length * POINTS_FIRST_TRY;
            const percentage = Math.round((finalScore / maxScore) * 100);
            void persistCompletion(percentage, finalScore);
          }
        }, 1000);
      } else {
        setWrongAnswer(selectedOption.id);
        setSelectedPart(selectedOption);
        setPartProgress((prev) => ({
          ...prev,
          [activePart.id]: {
            state: "wrong",
            attempts: prev[activePart.id].attempts + 1,
          },
        }));
        setQuizAnnouncement(`Incorrect. ${selectedOption.name} is not the answer. Try again.`);
      }
    },
    [activePart, partProgress, currentQuizIndex, quizQueue, score, persistCompletion]
  );

  const resetQuiz = useCallback(() => {
    invalidatePendingTransition();
    const initial: Record<string, PartProgress> = {};
    sailControls.forEach((part) => {
      initial[part.id] = { state: "hidden", attempts: 0 };
    });
    setPartProgress(initial);
    setScore(0);
    setActivePart(null);
    setSelectedPart(null);
    setWrongAnswer(null);
    setMode("learn");
    setQuizAnnouncement("");
    toast.success("Reset! Ready to learn.");
  }, [invalidatePendingTransition]);

  const controlsById = useMemo(() => {
    const controlsMap: Record<string, SailControl> = {};
    sailControls.forEach((control) => {
      controlsMap[control.id] = control;
    });
    return controlsMap;
  }, []);

  const correctCount = useMemo(
    () => Object.values(partProgress).filter((p) => p.state === "correct").length,
    [partProgress]
  );
  const wrongPart = useMemo(() => (wrongAnswer ? controlsById[wrongAnswer] ?? null : null), [wrongAnswer, controlsById]);
  const progressPercent = useMemo(() => (correctCount / sailControls.length) * 100, [correctCount]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-ocean-light/10 to-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                aria-label="Back to nautical terms"
                onClick={() => {
                  invalidatePendingTransition();
                  navigate("/nautical-terms");
                }}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold">Sail Controls & Rig Adjustments</h1>
                <p className="text-sm text-muted-foreground">
                  {mode === "learn"
                    ? "Learn lines, deck hardware and rig adjustments"
                    : "Match each purpose to the correct sail control or rig adjustment"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {mode === "quiz" ? (
                <>
                  <Button variant="outline" size="sm" onClick={resetQuiz}>
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset
                  </Button>
                  <div className="flex items-center gap-2" aria-label={`Score: ${score} points`}>
                    <Trophy className="w-5 h-5 text-accent" />
                    <span className="font-bold text-lg">{score}</span>
                  </div>
                  <Badge variant="secondary" aria-label={`${correctCount} of ${sailControls.length} answers correct`}>
                    {correctCount}/{sailControls.length}
                  </Badge>
                </>
              ) : (
                <Button onClick={startQuiz} disabled={durableStatus === "loading"}>
                  {durableStatus === "loading" ? "Loading progress…" : "Start Quiz"}
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {durableStatus === "failed" && !pendingCompletion && user && (
          <Card className="mb-6 border-orange-500" role="alert">
            <CardContent className="flex flex-wrap items-center justify-between gap-3 pt-6">
              <p>Saved progress could not be loaded. You can continue locally or retry.</p>
              <Button variant="outline" onClick={() => setLoadRevision((revision) => revision + 1)}>
                Retry loading progress
              </Button>
            </CardContent>
          </Card>
        )}
        <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
          {quizAnnouncement}
        </div>
        {mode === "quiz" && (
          <div
            className="w-full bg-muted rounded-full h-3 mb-6"
            role="progressbar"
            aria-label="Quiz progress"
            aria-valuemin={0}
            aria-valuemax={sailControls.length}
            aria-valuenow={correctCount}
            aria-valuetext={`${correctCount} of ${sailControls.length} questions completed`}
          >
            <div
              className="bg-green-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        )}

        {mode === "learn" ? (
          /* LEARN MODE */
          <div className="space-y-6">
            {/* Large Diagram with floating active card */}
            <div className="relative">
              <Card className="overflow-hidden">
                <CardContent className="p-4 md:p-6">
                  <div className="relative">
                    {/* The main large diagram */}
                    <p id="sail-controls-diagram-help" className="mb-2 text-center text-xs text-muted-foreground md:hidden">
                      Swipe horizontally to explore the full diagram. Tap a highlighted control for details.
                    </p>
                    <div
                      data-schematic-scroll
                      className="mx-auto w-full max-w-4xl overflow-x-auto overscroll-x-contain rounded-md"
                    >
                      <SailControlsDiagram
                        highlightId={highlightedId}
                        onHover={(id) => {
                          if (id) {
                            const control = controlsById[id];
                            if (control) setHoveredPart(control);
                          } else {
                            setHoveredPart(null);
                          }
                        }}
                        onClick={(id) => {
                          const control = controlsById[id];
                          // Toggle selection: click same = deselect, click different = select
                          if (control) {
                            setSelectedPart(selectedPart?.id === id ? null : control);
                          }
                        }}
                      />
                    </div>

                    {/* Details follow the diagram so they never cover the selected control. */}
                    {selectedPart && (
                      <div data-control-details className="mx-auto mt-4 w-full max-w-2xl animate-in fade-in duration-200">
                        <Card className="shadow-xl border-2" style={{ borderColor: selectedPart.color }}>
                          <CardHeader className="pb-2">
                            <div className="flex items-start justify-between">
                              <CardTitle className="text-lg flex items-center gap-2">
                                <span
                                  className="w-4 h-4 rounded-full"
                                  style={{ backgroundColor: selectedPart.color }}
                                />
                                {selectedPart.name}
                              </CardTitle>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 -mt-1 -mr-2"
                                aria-label={`Close ${selectedPart.name} details`}
                                onClick={() => setSelectedPart(null)}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                            {selectedPart.aka && (
                              <Badge variant="outline" className="text-xs font-normal w-fit">
                                Also called: {selectedPart.aka}
                              </Badge>
                            )}
                          </CardHeader>
                          <CardContent className="space-y-3 text-sm">
                            <Badge variant="secondary">{selectedPart.category}</Badge>
                            <p className="text-muted-foreground">{selectedPart.description}</p>
                            <div className="pt-2 space-y-2 border-t">
                              <div className="flex gap-2">
                                <span className="font-semibold text-primary w-20">Purpose:</span>
                                <span>{selectedPart.purpose}</span>
                              </div>
                              <div className="flex gap-2">
                                <span className="font-semibold text-primary w-20">Location:</span>
                                <span>{selectedPart.location}</span>
                              </div>
                              <div className="flex gap-2">
                                <span className="font-semibold text-primary w-20">Effect:</span>
                                <span>{selectedPart.effect}</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    )}

                    {/* Hint when no card is selected */}
                    {!selectedPart && (
                      <div className="mx-auto mt-4 w-fit max-w-full">
                        <Card className="bg-muted/80 backdrop-blur-sm shadow-md border-dashed">
                          <CardContent className="py-3 px-4 flex items-center gap-2">
                            <HelpCircle className="w-5 h-5 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              Click or use the diagram controls to learn more
                            </span>
                          </CardContent>
                        </Card>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Info and Control Cards Grid below */}
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">
                  This catalogue includes <strong>running rigging</strong> (movable lines), <strong>deck hardware</strong>{" "}
                  (the traveller and jib fairlead/car), and a <strong>standing-rigging adjustment</strong> (the backstay
                  adjuster). Click a diagram control or card to see its classification and effect.
                </p>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-3">
              {sailControls.map((control) => (
                <Card
                  key={control.id}
                  role="button"
                  tabIndex={0}
                  aria-label={`Show ${control.name} details from control list`}
                  aria-pressed={selectedPart?.id === control.id}
                  className={`cursor-pointer hover:shadow-md transition-all border-l-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                    selectedPart?.id === control.id ? "ring-2 ring-primary shadow-lg" : ""
                  } ${hoveredPart?.id === control.id && selectedPart?.id !== control.id ? "shadow-md" : ""}`}
                  style={{ borderLeftColor: control.color }}
                  onClick={() => setSelectedPart(selectedPart?.id === control.id ? null : control)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setSelectedPart(selectedPart?.id === control.id ? null : control);
                    }
                  }}
                  onMouseEnter={() => setHoveredPart(control)}
                  onMouseLeave={() => setHoveredPart(null)}
                >
                  <CardContent className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: control.color }} />
                      <span className="font-medium text-sm truncate">{control.name}</span>
                    </div>
                    {control.aka && <p className="text-xs text-muted-foreground mt-1 pl-5">({control.aka})</p>}
                    <p className="text-xs text-muted-foreground mt-1 pl-5">{control.category}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          /* QUIZ MODE */
          <div className="space-y-6">
            {activePart ? (
              <div className="max-w-2xl mx-auto space-y-4">
                  <Card className="border-2 border-primary">
                    <CardHeader>
                      <CardTitle
                        ref={questionHeadingRef}
                        className="text-center focus:outline-none"
                        id="sail-controls-question"
                        tabIndex={-1}
                      >
                        Question {currentQuizIndex + 1} of {quizQueue.length}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="text-center p-4 bg-muted rounded-lg">
                        <p className="text-lg font-medium mb-2">
                          Which sail control or rig adjustment has this purpose?
                        </p>
                        <p className="text-muted-foreground italic">"{activePart.purpose}"</p>
                      </div>

                      <div className="grid grid-cols-2 gap-3" role="group" aria-labelledby="sail-controls-question">
                        {options.map((option) => {
                          const isWrong = wrongAnswer === option.id;
                          const isCorrect =
                            partProgress[activePart.id]?.state === "correct" && option.id === activePart.id;
                          return (
                            <Button
                              key={option.id}
                              variant={isWrong ? "destructive" : isCorrect ? "default" : "outline"}
                              size="lg"
                              className={`h-auto py-4 ${isWrong ? "opacity-50" : ""} ${
                                isCorrect ? "bg-green-500 hover:bg-green-600" : ""
                              }`}
                              onClick={() => handleOptionSelect(option)}
                              disabled={isWrong || isCorrect}
                            >
                              {option.name}
                            </Button>
                          );
                        })}
                      </div>

                      {partProgress[activePart.id]?.attempts > 0 &&
                        partProgress[activePart.id]?.state !== "correct" && (
                          <p className="text-sm text-muted-foreground text-center">
                            Attempts: {partProgress[activePart.id].attempts} — Next correct answer: 5 pts
                          </p>
                        )}
                    </CardContent>
                  </Card>

                  {/* Wrong answer explanation */}
                  {wrongPart && (
                    <Card className="border-2 border-orange-500">
                      <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-orange-600">
                          <span className="w-3 h-3 rounded-full bg-orange-500" />
                          {wrongPart.name}
                          <Badge className="bg-orange-100 text-orange-700">Wrong Choice</Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground mb-2">{wrongPart.description}</p>
                        <p className="text-orange-600 text-sm font-medium">
                          This isn't the right answer. The clue was: "{activePart.purpose}"
                        </p>
                      </CardContent>
                    </Card>
                  )}
              </div>
            ) : (
              /* Quiz Complete */
              <div className="max-w-xl mx-auto">
                <Card className="border-2 border-green-500">
                  <CardContent className="pt-6 text-center space-y-4">
                    <Trophy className="w-16 h-16 mx-auto text-yellow-500" />
                    <h2 ref={completionHeadingRef} className="text-2xl font-bold focus:outline-none" tabIndex={-1}>
                      Quiz Complete!
                    </h2>
                    <p className="text-xl">
                      Final Score: <span className="text-green-600 font-bold">{score}</span> points
                    </p>
                    <p className="text-muted-foreground">
                      You identified {correctCount} out of {sailControls.length} sail controls.
                    </p>
                    <div className="text-sm" data-testid="durable-status" aria-live="polite">
                      {durableStatus === "anonymous" && "Completed on this device. Sign in to save your progress."}
                      {durableStatus === "saving" && "Saving completion…"}
                      {durableStatus === "queued" && "Completion saved offline and queued to sync."}
                      {durableStatus === "remote" && remoteSaveSemantics === "new" && "Completion saved to your account."}
                      {durableStatus === "remote" && remoteSaveSemantics === "preserved" &&
                        "A completion is saved to your account. Retakes do not replace that durable record."}
                      {durableStatus === "remote" && remoteSaveSemantics === "unknown" &&
                        "A completion is saved to your account. Because earlier progress may already exist or have synced, this may be the previously saved record."}
                      {durableStatus === "failed" && "Completion is still available here, but could not be saved."}
                    </div>
                    {durableStatus === "failed" && pendingCompletion && user && (
                      <Button
                        variant="outline"
                        onClick={() => void persistCompletion(pendingCompletion.percentage, pendingCompletion.score)}
                      >
                        Retry saving
                      </Button>
                    )}
                    <div className="flex gap-3 justify-center pt-4">
                      <Button
                        variant="outline"
                        onClick={() => {
                          invalidatePendingTransition();
                          setMode("learn");
                        }}
                      >
                        Review Controls
                      </Button>
                      <Button onClick={startQuiz}>Try Again</Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default SailControls;
