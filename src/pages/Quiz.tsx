import { useCallback, useMemo, useRef, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, CheckCircle2, XCircle, Trophy, RotateCcw, ChevronLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthHooks";
import { supabase } from "@/integrations/supabase/client";
import { useProgress } from "@/hooks/useProgress";
import {
  countCorrectAnswers,
  percentageScore,
  questionProgressPercent,
  quizCompletionOutcome,
} from "@/features/quiz/scoring";
import { canonicalQuizProgressKey, resolveQuizProgressForLoad, type QuizProgressRow } from "@/features/quiz/progressKeys";
import { createSeededRng, shuffleWithRng } from "@/features/quiz/randomization";
import {
  buildQuizSessionProgress,
  createEmptyQuizAnswers,
  parseSavedQuizSession,
  persistQuizSessionProgress,
} from "@/features/quiz/sessionProgress";
import { isQuizTopicId, loadQuizTopic, topicMeta, type Question } from "@/data/quizzes";
import { seedQuizQuestions } from "@/features/spaced-repetition/reviewService";
import { syncEngagementEvent } from "@/features/engagement/engagementService";
import { ownerStorageKey, readStored, removeStored, writeStored } from "@/features/persistence/browserStorage";

const quizAttemptKey = (owner: string, topic: string) => ownerStorageKey("quiz-attempt", owner, topic);
interface QuizWorkflow {
  readonly version?: 1;
  readonly attemptId: string;
  readonly scoreSaved: boolean;
  readonly startedAt?: string;
  readonly completion?: {
    readonly answers: readonly (number | null)[];
    readonly currentQuestion: number;
    readonly correctAnswers: number;
    readonly percentage: number;
    readonly passed: boolean;
    readonly pointsEarned: number;
  };
}
const QUIZ_ATTEMPT_MAX_AGE_MS = 2 * 60 * 60 * 1000;
const readQuizWorkflow = (owner: string | undefined, topic: string): QuizWorkflow | null => {
  if (!owner) return null;
  const key = quizAttemptKey(owner, topic);
  const parsed = readStored(localStorage, key, {
    decode: (value) => {
      const candidate = value && typeof value === "object" ? value as Partial<QuizWorkflow> : null;
      return candidate && (candidate.version === undefined || candidate.version === 1) ? candidate : null;
    },
  });
  try {
    if (!parsed || typeof parsed.attemptId !== "string") return null;
    const scoreSaved = parsed.scoreSaved === true;
    const startedAt = typeof parsed.startedAt === "string" ? parsed.startedAt : undefined;
    const startedAtMs = startedAt ? Date.parse(startedAt) : Number.NaN;
    if (!scoreSaved && (!Number.isFinite(startedAtMs) || Date.now() - startedAtMs >= QUIZ_ATTEMPT_MAX_AGE_MS)) {
      removeStored(localStorage, key);
      return null;
    }
    const completion = parsed.completion
      && Array.isArray(parsed.completion.answers)
      && typeof parsed.completion.currentQuestion === "number"
      && typeof parsed.completion.correctAnswers === "number"
      && typeof parsed.completion.percentage === "number"
      && typeof parsed.completion.passed === "boolean"
      && typeof parsed.completion.pointsEarned === "number"
      ? parsed.completion as QuizWorkflow["completion"]
      : undefined;
    return { attemptId: parsed.attemptId, scoreSaved, startedAt, completion };
  } catch { return null; }
};

const Quiz = () => {
  const navigate = useNavigate();
  const { topicId } = useParams<{ topicId: string }>();
  // If topicId is nautical-terms (legacy) or undefined, use the new specific ID
  const topicKey = !topicId || topicId === "nautical-terms" ? "nautical-terms-quiz" : topicId;
  const { user } = useAuth();
  const { loadProgress, saveProgress, resetProgress } = useProgress();
  const [seed, setSeed] = useState(0);
  const [sourceQuestions, setSourceQuestions] = useState<readonly Question[] | null>(null);
  const [catalogueError, setCatalogueError] = useState(false);
  const [loadGeneration, setLoadGeneration] = useState(0);
  useEffect(() => {
    let active = true;
    setSourceQuestions(null);
    setCatalogueError(false);
    void loadQuizTopic(topicKey).then(
      (loaded) => { if (active) setSourceQuestions(loaded); },
      () => { if (active) setCatalogueError(true); },
    );
    return () => { active = false; };
  }, [topicKey, loadGeneration]);
  const questions = useMemo(() => {
    const source = sourceQuestions ?? [];
    const rng = createSeededRng(seed + 1);

    return shuffleWithRng([...source], rng)
      .map((q) => {
        const optionObjs = q.options.map((opt, idx) => ({ opt, idx }));
        const shuffledOptions = shuffleWithRng(optionObjs, rng);
        const correctIndex = shuffledOptions.findIndex((o) => o.idx === q.correctAnswer);
        return {
          ...q,
          options: shuffledOptions.map((o) => o.opt),
          correctAnswer: correctIndex,
        };
      });
  }, [sourceQuestions, seed]);
  const meta = isQuizTopicId(topicKey) ? topicMeta[topicKey] : {
    title: "Topic Quiz",
    subtitle: "Answer the questions to test yourself",
  };

  const [workflow, setWorkflow] = useState<QuizWorkflow | null>(() => readQuizWorkflow(user?.id, topicKey));
  const [currentQuestion, setCurrentQuestion] = useState(() => workflow?.completion?.currentQuestion ?? 0);
  const [answers, setAnswers] = useState<(number | null)[]>(() => workflow?.completion ? [...workflow.completion.answers] : []);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isComplete, setIsComplete] = useState(() => Boolean(workflow?.scoreSaved && workflow.completion));
  const [seedStatus, setSeedStatus] = useState<"idle" | "saving" | "saved" | "failed">("idle");
  const [completionSaveError, setCompletionSaveError] = useState(() => Boolean(workflow?.scoreSaved && workflow.completion));
  const [attemptCycle, setAttemptCycle] = useState(0);
  const seedOwnerRef = useRef(user?.id ?? null);
  const seedGenerationRef = useRef(0);
  const currentSeedOwner = user?.id ?? null;
  if (seedOwnerRef.current !== currentSeedOwner) {
    seedOwnerRef.current = currentSeedOwner;
    seedGenerationRef.current += 1;
  }

  const seedReviews = useCallback(async (owner: string, generation: number) => {
    if (seedOwnerRef.current !== owner || seedGenerationRef.current !== generation) return;
    setSeedStatus("saving");
    try {
      if (seedOwnerRef.current !== owner || seedGenerationRef.current !== generation) return;
      await seedQuizQuestions(supabase, topicKey, questions.map(({ id }) => id));
      if (seedOwnerRef.current === owner && seedGenerationRef.current === generation) setSeedStatus("saved");
    } catch {
      if (seedOwnerRef.current === owner && seedGenerationRef.current === generation) {
        setSeedStatus("failed");
        toast.error("Review schedule could not be saved. Retry when connected.");
      }
    }
  }, [questions, topicKey]);

  // Initialize answers array when questions change
  useEffect(() => {
    if (!sourceQuestions) return;
    const initQuiz = async () => {
      const recovery = readQuizWorkflow(user?.id, topicKey);
      if (recovery?.scoreSaved && recovery.completion) {
        setAnswers([...recovery.completion.answers]);
        setCurrentQuestion(recovery.completion.currentQuestion);
        setIsComplete(true);
        setCompletionSaveError(true);
        return;
      }
      setIsComplete(false);
      setCompletionSaveError(false);
      const owner = seedOwnerRef.current;
      const generation = seedGenerationRef.current;
      const canonicalKey = canonicalQuizProgressKey(topicKey);
      const canonicalRecord: QuizProgressRow | null = await loadProgress(canonicalKey);
      if (seedOwnerRef.current !== owner || seedGenerationRef.current !== generation) return;
      const legacyRecord: QuizProgressRow | null = canonicalRecord ? null : await loadProgress(topicKey);
      if (seedOwnerRef.current !== owner || seedGenerationRef.current !== generation) return;
      const resolution = resolveQuizProgressForLoad(topicKey, canonicalRecord, legacyRecord);
      const savedData = resolution.record;

      if (savedData?.completed && owner) void seedReviews(owner, generation);

      if (savedData?.answers_history) {
        try {
          const savedRaw =
            typeof savedData.answers_history === "string"
              ? JSON.parse(savedData.answers_history)
              : savedData.answers_history;

          const saved = parseSavedQuizSession(savedRaw, questions.length, Boolean(savedData.completed));
          if (saved) {
            setAnswers(saved.answers);
            setCurrentQuestion(saved.currentQuestion);

            if (resolution.shouldMigrateFromLegacy) {
              await saveProgress(
                canonicalKey,
                savedData.completed ?? false,
                savedData.score ?? 0,
                0,
                buildQuizSessionProgress(saved.answers, saved.currentQuestion)
              );
              if (seedOwnerRef.current !== owner || seedGenerationRef.current !== generation) return;
              await resetProgress(topicKey);
              if (seedOwnerRef.current !== owner || seedGenerationRef.current !== generation) return;
            }
            return;
          }
        } catch (error) {
          console.error("Error parsing saved quiz progress:", error);
        }
      }
      setAnswers(createEmptyQuizAnswers(questions.length));
    };
    initQuiz();
  }, [sourceQuestions, questions.length, topicKey, user?.id, loadProgress, saveProgress, resetProgress, seedReviews]);

  useEffect(() => {
    const owner = user?.id;
    const generation = seedGenerationRef.current;
    const existing = readQuizWorkflow(owner, topicKey);
    setWorkflow(existing);
    if (!owner || existing) return;
    void (async () => {
      const { data, error } = await supabase.rpc("start_quiz_attempt", { p_topic_id: topicKey });
      if (error || !data || seedOwnerRef.current !== owner || seedGenerationRef.current !== generation) return;
      const created = { attemptId: data.attempt_id, scoreSaved: false, startedAt: data.started_at };
      writeStored(localStorage, quizAttemptKey(owner, topicKey), { ...created, version: 1 });
      setWorkflow(created);
    })();
  }, [user?.id, topicKey, attemptCycle]);

  const selectedAnswer = answers[currentQuestion] ?? null;
  const correctAnswers = countCorrectAnswers(answers, questions);

  const persistSession = async (nextAnswers: Array<number | null>, nextQuestion: number) => {
    await persistQuizSessionProgress({
      isAuthenticated: Boolean(user),
      topicKey,
      saveProgress,
      progress: buildQuizSessionProgress(nextAnswers, nextQuestion),
    });
  };

  if (!sourceQuestions && !catalogueError) {
    return <main className="min-h-screen grid place-items-center p-4" aria-live="polite">Loading quiz…</main>;
  }

  if (catalogueError || !questions.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-ocean-light/10 to-background flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full border-2">
          <CardHeader>
            <CardTitle className="text-2xl">Quiz unavailable</CardTitle>
            <p className="text-sm text-muted-foreground">
              {catalogueError
                ? "This topic could not be loaded. Your saved progress is unchanged."
                : "We could not find any quiz items for this topic. Please head back and choose another module."}
            </p>
          </CardHeader>
          <CardContent className="flex gap-3 flex-col sm:flex-row">
            <Button variant="outline" className="flex-1" onClick={() => navigate("/")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Home
            </Button>
            <Button className="flex-1" onClick={() => navigate("/nautical-terms")}>
              Nautical Terms
            </Button>
            {catalogueError && <Button className="flex-1" onClick={() => setLoadGeneration((value) => value + 1)}>
              Retry loading
            </Button>}
          </CardContent>
        </Card>
      </div>
    );
  }

  const question = questions[currentQuestion];
  const progress = questionProgressPercent(currentQuestion, questions.length);

  const handleAnswerSelect = async (answerIndex: number) => {
    if (showExplanation) return;
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answerIndex;
    setAnswers(newAnswers);

    await persistSession(newAnswers, currentQuestion);
  };

  const handleSubmit = () => {
    if (selectedAnswer === null) return;

    setShowExplanation(true);
    const isCorrect = selectedAnswer === question.correctAnswer;

    if (isCorrect) {
      toast.success("Correct!", {
        description: question.explanation,
      });
    } else {
      toast.error("Incorrect", {
        description: question.explanation,
      });
    }
  };

  const handleNext = async () => {
    const newQuestion = currentQuestion < questions.length - 1 ? currentQuestion + 1 : currentQuestion;
    setCurrentQuestion(newQuestion);
    setShowExplanation(false);

    await persistSession(answers, newQuestion);

    if (currentQuestion >= questions.length - 1) {
      handleComplete();
    }
  };

  const handlePrevious = async () => {
    if (currentQuestion > 0) {
      const newQuestion = currentQuestion - 1;
      setCurrentQuestion(newQuestion);
      setShowExplanation(false);

      await persistSession(answers, newQuestion);
    }
  };

  const handleComplete = async () => {
    setIsComplete(true);

    if (!user) return;
    const owner = user.id;
    const generation = seedGenerationRef.current;
    const activeWorkflow = workflow;
    if (!activeWorkflow) {
      setCompletionSaveError(true);
      toast.error("Quiz attempt is still starting. Retry saving.");
      return;
    }
    setCompletionSaveError(false);

    const calculatedCompletion = quizCompletionOutcome(correctAnswers, questions.length);
    const completion = activeWorkflow.completion ?? {
      answers: [...answers],
      currentQuestion,
      correctAnswers,
      ...calculatedCompletion,
    };
    const { percentage, passed, pointsEarned } = completion;

    try {
      // Save quiz score
      if (!activeWorkflow.scoreSaved) {
        const { error: scoreError } = await supabase.rpc("submit_quiz_score", {
          p_attempt_id: activeWorkflow.attemptId,
          p_topic_id: topicKey,
          p_score: correctAnswers,
          p_total_questions: questions.length,
        });
        if (scoreError) throw scoreError;
        if (seedOwnerRef.current !== owner || seedGenerationRef.current !== generation) return;
        const scoreSavedWorkflow = { ...activeWorkflow, scoreSaved: true, completion };
        writeStored(localStorage, quizAttemptKey(owner, topicKey), { ...scoreSavedWorkflow, version: 1 });
        setWorkflow(scoreSavedWorkflow);
      }

      // Save final progress with answers
      const saved = await saveProgress(
        canonicalQuizProgressKey(topicKey),
        passed,
        percentage,
        pointsEarned,
        {
          ...buildQuizSessionProgress([...completion.answers], completion.currentQuestion),
          completed: true,
        }
      );
      if (seedOwnerRef.current !== owner || seedGenerationRef.current !== generation) return;

      if (saved) {
        try {
          const engagement = await syncEngagementEvent(supabase, owner, { sourceType: "quiz", sourceId: activeWorkflow.attemptId });
          if (seedOwnerRef.current !== owner || seedGenerationRef.current !== generation) return;
          engagement.unlockedBadges.forEach((badge) => toast.success(`${badge.icon} Badge unlocked: ${badge.name}`));
        } catch (error) {
          console.error("Error recording quiz activity:", error);
        }
        toast.success(
          passed
            ? "Quiz passed and saved."
            : "Quiz saved. Score 70% or more to pass."
        );
        removeStored(localStorage, quizAttemptKey(owner, topicKey));
        setWorkflow(null);
      } else {
        setCompletionSaveError(true);
      }
      await seedReviews(owner, generation);
    } catch (error) {
      console.error("Error saving quiz results:", error);
      if (seedOwnerRef.current === owner && seedGenerationRef.current === generation) setCompletionSaveError(true);
    }
  };

  const handleRestart = () => {
    if (user && !workflow?.scoreSaved) {
      removeStored(localStorage, quizAttemptKey(user.id, topicKey));
    }
    setCurrentQuestion(0);
    setAnswers(createEmptyQuizAnswers(questions.length));
    setShowExplanation(false);
    setIsComplete(false);
    setSeed((n) => n + 1);
    setWorkflow(null);
    setCompletionSaveError(false);
    setAttemptCycle((value) => value + 1);
  };

  if (isComplete) {
    const displayedCorrectAnswers = workflow?.completion?.correctAnswers ?? correctAnswers;
    const percentage = workflow?.completion?.percentage ?? percentageScore(correctAnswers, questions.length);
    const passed = workflow?.completion?.passed ?? percentage >= 70;

    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-ocean-light/10 to-background flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full border-2">
          <CardHeader className="text-center">
            <div
              className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center ${
                passed ? "bg-success/20" : "bg-accent/20"
              }`}
            >
              <Trophy className={`w-10 h-10 ${passed ? "text-success" : "text-accent"}`} />
            </div>
            <CardTitle className="text-3xl">Quiz Complete!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="text-6xl font-bold text-gradient mb-2">{percentage}%</div>
              <p className="text-xl text-muted-foreground">
                {displayedCorrectAnswers} out of {questions.length} correct
              </p>
            </div>

            {passed ? (
              <div className="p-4 bg-success/10 border-2 border-success rounded-lg text-center">
                <p className="font-semibold text-success">🎉 Excellent work!</p>
                <p className="text-sm text-muted-foreground mt-1">You've mastered this topic!</p>
              </div>
            ) : (
              <div className="p-4 bg-accent/10 border-2 border-accent rounded-lg text-center">
                <p className="font-semibold text-accent">Keep practicing!</p>
                <p className="text-sm text-muted-foreground mt-1">Review the material and try again</p>
              </div>
            )}

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => navigate("/")}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Home
              </Button>
              <Button
                className="flex-1 bg-secondary text-secondary-foreground"
                onClick={handleRestart}
                disabled={completionSaveError && workflow?.scoreSaved === true}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                {completionSaveError && workflow?.scoreSaved ? "Finish saving first" : "Retry Quiz"}
              </Button>
            </div>
            {seedStatus === "failed" && <div className="text-center space-y-2">
              <p role="alert" className="text-sm text-destructive">Your quiz is saved, but its review schedule still needs syncing.</p>
              <Button variant="outline" onClick={() => {
                if (user) void seedReviews(user.id, seedGenerationRef.current);
              }}>Retry review sync</Button>
            </div>}
            {completionSaveError && <div className="text-center space-y-2">
              <p role="alert" className="text-sm text-destructive">Your completion is not fully saved yet.</p>
              <Button variant="outline" onClick={() => void handleComplete()}>Retry completion save</Button>
            </div>}
          </CardContent>
        </Card>
      </div>
    );
  }

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
                <h1 className="text-xl font-bold">{meta.title}</h1>
                <p className="text-sm text-muted-foreground">
                  {meta.subtitle} • Question {currentQuestion + 1} of {questions.length}
                </p>
              </div>
            </div>
            <Badge variant="secondary">
              Score: {correctAnswers}/{questions.length}
            </Badge>
          </div>
          <div className="mt-4">
            <Progress value={progress} className="h-2" />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <Card className="border-2">
          <CardHeader>
            {question.image && (
              <div className="mb-4 flex justify-center">
                <img
                  src={question.image}
                  alt="Quiz Scenario"
                  className="max-h-64 rounded-lg object-contain border border-border"
                />
              </div>
            )}
            <CardTitle className="text-2xl">{question.question}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              {question.options.map((option, index) => {
                const isSelected = selectedAnswer === index;
                const isCorrect = index === question.correctAnswer;
                const showCorrect = showExplanation && isCorrect;
                const showIncorrect = showExplanation && isSelected && !isCorrect;

                return (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    disabled={showExplanation}
                    className={`p-4 rounded-lg border-2 text-left transition-all hover:scale-[1.02] ${
                      showCorrect
                        ? "border-success bg-success/10"
                        : showIncorrect
                        ? "border-destructive bg-destructive/10"
                        : isSelected
                        ? "border-secondary bg-secondary/10"
                        : "border-border bg-card hover:border-secondary/50"
                    } ${showExplanation ? "cursor-not-allowed" : "cursor-pointer"}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{option}</span>
                      {showCorrect && <CheckCircle2 className="w-5 h-5 text-success" />}
                      {showIncorrect && <XCircle className="w-5 h-5 text-destructive" />}
                    </div>
                  </button>
                );
              })}
            </div>

            {showExplanation && (
              <div className="mt-6 p-4 bg-muted rounded-lg border-2 border-border animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-secondary" />
                  Explanation
                </h3>
                <p className="text-muted-foreground">{question.explanation}</p>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              {currentQuestion > 0 && !showExplanation && (
                <Button variant="outline" onClick={handlePrevious}>
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>
              )}
              {!showExplanation ? (
                <Button
                  className="flex-1 bg-secondary text-secondary-foreground hover:bg-secondary/90"
                  onClick={handleSubmit}
                  disabled={selectedAnswer === null}
                >
                  Submit Answer
                </Button>
              ) : (
                <Button className="flex-1 bg-primary text-primary-foreground" onClick={handleNext}>
                  {currentQuestion < questions.length - 1 ? "Next Question" : "View Results"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Quiz;
