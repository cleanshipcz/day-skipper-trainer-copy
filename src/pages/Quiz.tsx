import { useCallback, useMemo, useRef, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, CheckCircle2, XCircle, Trophy, RotateCcw, ChevronLeft } from "lucide-react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
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
  clearAllAnonymousQuizSessions,
  clearAnonymousQuizSession,
  createEmptyQuizAnswers,
  isCurrentCompletedQuizCatalogue,
  parseSavedQuizSession,
  persistQuizSessionProgress,
  restoreAnonymousQuizSession,
  saveAnonymousQuizSession,
} from "@/features/quiz/sessionProgress";
import { isQuizTopicId, loadQuizTopic, topicMeta, type Question } from "@/data/quizzes";
import { seedQuizQuestions } from "@/features/spaced-repetition/reviewService";
import { syncEngagementEvent } from "@/features/engagement/engagementService";
import { ownerStorageKey, readStored, removeStored, writeStored } from "@/features/persistence/browserStorage";
import { resolveQuizParentDestination } from "@/constants/topicRegistry";
import { engineTheoryRoute } from "@/data/engineAssessment";
import { anchorQuizRemediationTopic, anchorTheoryRoute } from "@/features/anchorwork/learningPath";
import { victuallingQuizRemediationRoute, victuallingTheoryRoute } from "@/features/victualling/learningPath";

const quizAttemptKey = (owner: string, topic: string) => ownerStorageKey("quiz-attempt", owner, topic);
interface QuizWorkflow {
  readonly version: 2;
  readonly attemptId: string;
  readonly expectedTotal: number;
  readonly scoreSaved: boolean;
  readonly startedAt?: string;
  readonly completion?: {
    readonly session: ReturnType<typeof buildQuizSessionProgress>;
    readonly correctAnswers: number;
    readonly percentage: number;
    readonly passed: boolean;
    readonly pointsEarned: number;
  };
}
type AttemptStartState = "idle" | "starting" | "ready" | "failed";
const QUIZ_ATTEMPT_MAX_AGE_MS = 2 * 60 * 60 * 1000;
const readQuizWorkflow = (owner: string | undefined, topic: string, expectedTotal: number): QuizWorkflow | null => {
  if (!owner) return null;
  const key = quizAttemptKey(owner, topic);
  const parsed = readStored(localStorage, key, {
    decode: (value) => {
      const candidate = value && typeof value === "object" ? value as Partial<QuizWorkflow> : null;
      return candidate && (candidate.version === 1 || candidate.version === 2 || candidate.version === undefined) ? candidate : null;
    },
  });
  try {
    if (!parsed || typeof parsed.attemptId !== "string") return null;
    if (parsed.version !== 2 || parsed.expectedTotal !== expectedTotal) {
      removeStored(localStorage, key);
      return null;
    }
    const scoreSaved = parsed.scoreSaved === true;
    const startedAt = typeof parsed.startedAt === "string" ? parsed.startedAt : undefined;
    const startedAtMs = startedAt ? Date.parse(startedAt) : Number.NaN;
    if (!scoreSaved && (!Number.isFinite(startedAtMs) || Date.now() - startedAtMs >= QUIZ_ATTEMPT_MAX_AGE_MS)) {
      removeStored(localStorage, key);
      return null;
    }
    if (scoreSaved) {
      // localStorage is attacker-controlled and cannot prove that the score RPC
      // succeeded. Never let it skip authoritative submission or promote data.
      removeStored(localStorage, key);
      return null;
    }
    return { version: 2, attemptId: parsed.attemptId, expectedTotal, scoreSaved: false, startedAt };
  } catch { return null; }
};

const Quiz = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { topicId } = useParams<{ topicId: string }>();
  // If topicId is nautical-terms (legacy) or undefined, use the new specific ID
  const topicKey = !topicId || topicId === "nautical-terms" ? "nautical-terms-quiz" : topicId;
  const { user } = useAuth();
  const { loadProgress, saveProgress, resetProgress } = useProgress();
  const [seed, setSeed] = useState(0);
  const [sourceQuestions, setSourceQuestions] = useState<readonly Question[] | null>(null);
  const [catalogueError, setCatalogueError] = useState(false);
  const [anonymousStorageNotice, setAnonymousStorageNotice] = useState<string | null>(null);
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
  const quizParent = resolveQuizParentDestination(topicKey);
  const anchorReturnTopic = searchParams.get("returnTopic") || "scope";

  const [workflow, setWorkflow] = useState<QuizWorkflow | null>(null);
  const [attemptStartState, setAttemptStartState] = useState<AttemptStartState>("idle");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [tentativeAnswer, setTentativeAnswer] = useState<number | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [seedStatus, setSeedStatus] = useState<"idle" | "saving" | "saved" | "failed">("idle");
  const [completionSaveError, setCompletionSaveError] = useState(() => Boolean(workflow?.scoreSaved && workflow.completion));
  const [attemptCycle, setAttemptCycle] = useState(0);
  const questionHeadingRef = useRef<HTMLHeadingElement>(null);
  const completionHeadingRef = useRef<HTMLHeadingElement>(null);
  const focusQuestionAfterAdvanceRef = useRef(false);
  const suppressNextProgressLoadRef = useRef(false);
  const verifiedScoreAttemptRef = useRef<string | null>(null);
  const seedOwnerRef = useRef(user?.id ?? null);
  const seedGenerationRef = useRef(0);
  const assessmentPersistenceRef = useRef<Promise<void> | null>(null);
  const attemptStartRequestRef = useRef<Promise<QuizWorkflow | null> | null>(null);
  const attemptRecoveryRef = useRef(false);
  const completionRequestRef = useRef(false);
  const attemptScopeRef = useRef("");
  const currentSeedOwner = user?.id ?? null;
  attemptScopeRef.current = `${currentSeedOwner ?? "anonymous"}:${topicKey}:${questions.length}:${attemptCycle}`;
  if (seedOwnerRef.current !== currentSeedOwner) {
    seedOwnerRef.current = currentSeedOwner;
    seedGenerationRef.current += 1;
    verifiedScoreAttemptRef.current = null;
    attemptStartRequestRef.current = null;
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
      setIsComplete(false);
      setCompletionSaveError(false);
      setTentativeAnswer(null);
      if (suppressNextProgressLoadRef.current) {
        suppressNextProgressLoadRef.current = false;
        setAnswers(createEmptyQuizAnswers(questions.length));
        setCurrentQuestion(0);
        return;
      }
      const owner = seedOwnerRef.current;
      const generation = seedGenerationRef.current;
      if (!owner) {
        const restored = restoreAnonymousQuizSession(globalThis.sessionStorage, topicKey, questions);
        if (restored.session) {
          setAnswers(restored.session.answers);
          setCurrentQuestion(restored.session.currentQuestion);
          setTentativeAnswer(restored.session.tentativeAnswer ?? null);
          setAnonymousStorageNotice("Practice attempt resumed for this browser session.");
        } else {
          setAnswers(createEmptyQuizAnswers(questions.length));
          setCurrentQuestion(0);
          setAnonymousStorageNotice(restored.status === "missing" ? null
            : "The previous practice attempt was expired or incompatible and could not be resumed.");
        }
        return;
      }
      // Anonymous practice is session-scoped and is never promoted into an
      // authenticated attempt or score on sign-in.
      clearAllAnonymousQuizSessions(globalThis.sessionStorage);
      setAnonymousStorageNotice(null);
      const canonicalKey = canonicalQuizProgressKey(topicKey);
      const canonicalRecord: QuizProgressRow | null = await loadProgress(canonicalKey);
      if (seedOwnerRef.current !== owner || seedGenerationRef.current !== generation) return;
      const legacyRecord: QuizProgressRow | null = canonicalRecord ? null : await loadProgress(topicKey);
      if (seedOwnerRef.current !== owner || seedGenerationRef.current !== generation) return;
      const resolution = resolveQuizProgressForLoad(topicKey, canonicalRecord, legacyRecord);
      const savedData = resolution.record;

      if (savedData?.answers_history) {
        try {
          const savedRaw =
            typeof savedData.answers_history === "string"
              ? JSON.parse(savedData.answers_history)
              : savedData.answers_history;

          if (savedData.completed) {
            if (owner && isCurrentCompletedQuizCatalogue(savedRaw, questions)) void seedReviews(owner, generation);
            setAnswers(createEmptyQuizAnswers(questions.length));
            setCurrentQuestion(0);
            setTentativeAnswer(null);
            return;
          }

          const saved = parseSavedQuizSession(savedRaw, questions);
          if (saved) {
            setAnswers(saved.answers);
            setCurrentQuestion(saved.currentQuestion);
            setTentativeAnswer(saved.tentativeAnswer ?? null);

            if (resolution.shouldMigrateFromLegacy) {
              await saveProgress(
                canonicalKey,
                savedData.completed ?? false,
                savedData.score ?? 0,
                0,
                buildQuizSessionProgress(saved.answers, saved.currentQuestion, questions)
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
  }, [sourceQuestions, questions, topicKey, user?.id, loadProgress, saveProgress, resetProgress, seedReviews]);

  const startAuthenticatedAttempt = useCallback((): Promise<QuizWorkflow | null> => {
    const owner = seedOwnerRef.current;
    const generation = seedGenerationRef.current;
    const scope = attemptScopeRef.current;
    if (!owner || !sourceQuestions) return Promise.resolve(null);
    const existing = readQuizWorkflow(owner, topicKey, questions.length);
    if (existing) {
      setWorkflow(existing);
      setAttemptStartState("ready");
      return Promise.resolve(existing);
    }
    if (attemptStartRequestRef.current) return attemptStartRequestRef.current;

    setAttemptStartState("starting");
    const request = (async () => {
      const { data, error } = await supabase.rpc("start_quiz_attempt", { p_topic_id: topicKey });
      if (seedOwnerRef.current !== owner || seedGenerationRef.current !== generation || attemptScopeRef.current !== scope) return null;
      if (error || !data || typeof data.attempt_id !== "string") {
        attemptStartRequestRef.current = null;
        setWorkflow(null);
        setAttemptStartState("failed");
        return null;
      }
      const created: QuizWorkflow = {
        version: 2,
        attemptId: data.attempt_id,
        expectedTotal: questions.length,
        scoreSaved: false,
        startedAt: data.started_at,
      };
      writeStored(localStorage, quizAttemptKey(owner, topicKey), created);
      setWorkflow(created);
      setAttemptStartState("ready");
      return created;
    })().catch(() => {
      if (seedOwnerRef.current === owner && seedGenerationRef.current === generation && attemptScopeRef.current === scope) {
        attemptStartRequestRef.current = null;
        setWorkflow(null);
        setAttemptStartState("failed");
      }
      return null;
    }).finally(() => {
      if (attemptStartRequestRef.current === request) attemptStartRequestRef.current = null;
    });
    attemptStartRequestRef.current = request;
    return request;
  }, [questions.length, sourceQuestions, topicKey]);

  useEffect(() => {
    if (!sourceQuestions) return;
    const owner = user?.id;
    const existing = readQuizWorkflow(owner, topicKey, questions.length);
    setWorkflow(existing);
    setAttemptStartState(!owner ? "idle" : existing ? "ready" : "idle");
    attemptStartRequestRef.current = null;
    attemptRecoveryRef.current = false;
    if (owner && !existing) void startAuthenticatedAttempt();
  }, [user?.id, topicKey, attemptCycle, sourceQuestions, questions.length, startAuthenticatedAttempt]);

  const assessedAnswer = answers[currentQuestion] ?? null;
  const showExplanation = assessedAnswer !== null;
  const selectedAnswer = assessedAnswer ?? tentativeAnswer;
  const correctAnswers = countCorrectAnswers(answers, questions);

  useEffect(() => {
    if (!isComplete || !completionHeadingRef.current) return;
    completionHeadingRef.current.focus();
  }, [isComplete]);

  useEffect(() => {
    if (!focusQuestionAfterAdvanceRef.current || isComplete) return;
    focusQuestionAfterAdvanceRef.current = false;
    questionHeadingRef.current?.focus();
  }, [currentQuestion, isComplete]);

  const persistSession = async (nextAnswers: Array<number | null>, nextQuestion: number) => {
    const progress = buildQuizSessionProgress(nextAnswers, nextQuestion, questions);
    if (!user) {
      const result = saveAnonymousQuizSession(globalThis.sessionStorage, topicKey, progress);
      setAnonymousStorageNotice(result.ok
        ? "Anonymous progress is kept in this browser session for up to 30 minutes."
        : "This browser blocked practice resume storage. You can continue, but progress will be lost on reload.");
      return;
    }
    await persistQuizSessionProgress({
      isAuthenticated: true,
      topicKey,
      saveProgress,
      progress,
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
            <Button variant="outline" className="flex-1" onClick={() => navigate(quizParent.route)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to {quizParent.label}
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

  const handleAnswerSelect = (answerIndex: number) => {
    if (showExplanation) return;
    setTentativeAnswer(answerIndex);
  };

  const handleSubmit = async () => {
    if (tentativeAnswer === null || assessedAnswer !== null || assessmentPersistenceRef.current) return;
    const nextAnswers = [...answers];
    nextAnswers[currentQuestion] = tentativeAnswer;
    setAnswers(nextAnswers);
    setTentativeAnswer(null);
    const persistence = persistSession(nextAnswers, currentQuestion);
    assessmentPersistenceRef.current = persistence;
    try {
      await persistence;
    } finally {
      if (assessmentPersistenceRef.current === persistence) assessmentPersistenceRef.current = null;
    }
  };

  const handleNext = async () => {
    await assessmentPersistenceRef.current;
    focusQuestionAfterAdvanceRef.current = currentQuestion < questions.length - 1;
    const newQuestion = currentQuestion < questions.length - 1 ? currentQuestion + 1 : currentQuestion;
    setCurrentQuestion(newQuestion);
    setTentativeAnswer(null);

    await persistSession(answers, newQuestion);

    if (currentQuestion >= questions.length - 1) {
      await handleComplete();
    }
  };

  const handlePrevious = async () => {
    if (currentQuestion > 0) {
      focusQuestionAfterAdvanceRef.current = true;
      const newQuestion = currentQuestion - 1;
      setCurrentQuestion(newQuestion);
      setTentativeAnswer(null);

      await persistSession(answers, newQuestion);
    }
  };

  const handleComplete = async (workflowOverride?: QuizWorkflow) => {
    setIsComplete(true);

    if (!user) {
      clearAnonymousQuizSession(globalThis.sessionStorage, topicKey);
      return;
    }
    if (completionRequestRef.current) return;
    completionRequestRef.current = true;
    try {
    const owner = user.id;
    const generation = seedGenerationRef.current;
    const activeWorkflow = workflowOverride ?? workflow;
    if (!activeWorkflow) {
      toast.error(attemptStartState === "failed"
        ? "Your answers are kept, but the quiz attempt still needs to start."
        : "Your answers are kept while the quiz attempt starts.");
      return;
    }
    setCompletionSaveError(false);

    const calculatedCompletion = quizCompletionOutcome(correctAnswers, questions.length);
    const completion = {
      session: buildQuizSessionProgress([...answers], currentQuestion, questions),
      correctAnswers,
      ...calculatedCompletion,
    };
    const { percentage, passed, pointsEarned } = completion;
    const verificationKey = `${owner}:${topicKey}:${activeWorkflow.attemptId}`;

    try {
      // Save quiz score
      if (verifiedScoreAttemptRef.current !== verificationKey) {
        const { error: scoreError } = await supabase.rpc("submit_quiz_score", {
          p_attempt_id: activeWorkflow.attemptId,
          p_topic_id: topicKey,
          p_score: correctAnswers,
          p_total_questions: questions.length,
        });
        if (scoreError) throw scoreError;
        if (seedOwnerRef.current !== owner || seedGenerationRef.current !== generation) return;
        verifiedScoreAttemptRef.current = verificationKey;
        const scoreSavedWorkflow = { ...activeWorkflow, scoreSaved: true, completion };
        removeStored(localStorage, quizAttemptKey(owner, topicKey));
        setWorkflow(scoreSavedWorkflow);
      }

      // Save final progress with answers
      const saved = await saveProgress(
        canonicalQuizProgressKey(topicKey),
        passed,
        percentage,
        pointsEarned,
        {
          ...completion.session,
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
    } finally {
      completionRequestRef.current = false;
    }
  };

  const retryAttemptStart = async () => {
    if (attemptRecoveryRef.current) return;
    attemptRecoveryRef.current = true;
    try {
      const recovered = await startAuthenticatedAttempt();
      if (recovered && isComplete) await handleComplete(recovered);
    } finally {
      attemptRecoveryRef.current = false;
    }
  };

  const handleRestart = () => {
    clearAnonymousQuizSession(globalThis.sessionStorage, topicKey);
    if (user && !workflow?.scoreSaved) {
      removeStored(localStorage, quizAttemptKey(user.id, topicKey));
    }
    focusQuestionAfterAdvanceRef.current = true;
    setCurrentQuestion(0);
    setAnswers(createEmptyQuizAnswers(questions.length));
    setTentativeAnswer(null);
    setIsComplete(false);
    setSeed((n) => n + 1);
    setWorkflow(null);
    setAttemptStartState("idle");
    verifiedScoreAttemptRef.current = null;
    setCompletionSaveError(false);
    suppressNextProgressLoadRef.current = true;
    setAttemptCycle((value) => value + 1);
  };

  if (isComplete) {
    const displayedCorrectAnswers = workflow?.completion?.correctAnswers ?? correctAnswers;
    const percentage = workflow?.completion?.percentage ?? percentageScore(correctAnswers, questions.length);
    const passed = workflow?.completion?.passed ?? percentage >= 70;

    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-ocean-light/10 to-background flex items-center justify-center p-3 sm:p-4">
        <Card className="max-w-2xl w-full border-2">
          <CardHeader className="text-center">
            <div
              className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center motion-reduce:animate-none ${
                passed ? "bg-success/20" : "bg-accent/20"
              }`}
            >
              <Trophy className={`w-10 h-10 ${passed ? "text-success" : "text-accent"}`} />
            </div>
            <CardTitle ref={completionHeadingRef} tabIndex={-1} className="text-3xl break-words [overflow-wrap:anywhere] focus:outline-none">Quiz Complete!</CardTitle>
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

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button variant="outline" className="flex-1" onClick={() => navigate(topicKey === "anchorwork"
                ? anchorTheoryRoute(passed ? anchorReturnTopic : anchorQuizRemediationTopic(questions.map(({ id }) => id), answers, questions.map(({ correctAnswer }) => correctAnswer)), "quiz")
                : topicKey === "victualling" && !passed
                  ? victuallingQuizRemediationRoute(questions.map(({ id }) => id), answers, questions.map(({ correctAnswer }) => correctAnswer))
                  : quizParent.route)}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                {topicKey === "anchorwork" && !passed ? "Review missed anchorwork skill"
                  : topicKey === "victualling" && !passed ? "Review missed Victualling skill"
                    : `Return to ${quizParent.label}`}
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
            {user && attemptStartState !== "ready" && <div className="text-center space-y-2">
              <p role={attemptStartState === "failed" ? "alert" : "status"} aria-live="assertive" className="text-sm text-destructive">
                {attemptStartState === "failed"
                  ? "We could not start your saved quiz attempt. Your answers are still here, but this result cannot be saved until it starts."
                  : "Your answers are kept while your saved quiz attempt starts. This result is not saveable yet."}
              </p>
              {attemptStartState === "failed" && <Button variant="outline" onClick={() => void retryAttemptStart()}>
                Retry starting quiz
              </Button>}
            </div>}
            {user && attemptStartState === "ready" && workflow && !workflow.scoreSaved && !completionSaveError && <div className="text-center">
              <Button variant="outline" onClick={() => void handleComplete()}>Save completed quiz</Button>
            </div>}
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
        <div className="container mx-auto px-3 py-4 sm:px-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex min-w-0 flex-1 items-start gap-2 sm:gap-3">
              <Button variant="ghost" size="icon" aria-label={`Back to ${quizParent.label} from ${meta.title}`} className="shrink-0" onClick={() => navigate(quizParent.route)}>
                <ArrowLeft className="w-5 h-5" aria-hidden="true" />
              </Button>
              <div className="min-w-0">
                <h1 className="text-xl font-bold break-words [overflow-wrap:anywhere]">{meta.title}</h1>
                <p className="text-sm text-muted-foreground break-words [overflow-wrap:anywhere]">
                  {meta.subtitle} • Question {currentQuestion + 1} of {questions.length}
                </p>
              </div>
            </div>
            <Badge variant="secondary" className="shrink-0">
              Score: {correctAnswers}/{questions.length}
            </Badge>
          </div>
          <div className="mt-4">
            <p id="quiz-progress-label" className="mb-1 text-sm font-medium">
              Progress: question {currentQuestion + 1} of {questions.length} ({Math.round(progress)}%)
            </p>
            <Progress
              value={progress}
              className="h-2"
              aria-labelledby="quiz-progress-label"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(progress)}
              aria-valuetext={`Question ${currentQuestion + 1} of ${questions.length}`}
            />
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-3xl px-3 py-5 sm:px-4 sm:py-8">
        {topicKey === "colregs" && <div className="mb-4 rounded-lg border bg-muted/50 p-4 text-sm">
          <p className="font-semibold">Diagnostic: study both learning modules first</p>
          <p className="mt-1 text-muted-foreground">This 20-objective check combines Steering &amp; Sailing with Lights &amp; Signals. A missed answer links to the theory that teaches it.</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={() => navigate("/rules/colregs")}>Steering &amp; Sailing theory</Button>
            <Button size="sm" variant="outline" onClick={() => navigate("/rules/lights/theory")}>Lights &amp; Signals theory</Button>
          </div>
        </div>}
        {user && attemptStartState !== "ready" && <div className="mb-3 space-y-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3">
          <p role={attemptStartState === "failed" ? "alert" : "status"} aria-live="assertive" className="text-sm">
            {attemptStartState === "failed"
              ? "We could not start your saved quiz attempt. You may continue answering, but your result cannot be saved until this is recovered."
              : "Starting your saved quiz attempt. You may answer while it connects; your result is not saveable yet."}
          </p>
          {attemptStartState === "failed" && <Button size="sm" variant="outline" onClick={() => void retryAttemptStart()}>
            Retry starting quiz
          </Button>}
        </div>}
        {anonymousStorageNotice && <p aria-live="polite" aria-atomic="true" className="mb-3 text-sm text-muted-foreground">
          {anonymousStorageNotice}
        </p>}
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
            {question.scenario && (
              <figure aria-label={question.scenario.accessibleName} aria-describedby={`scenario-description-${question.id}`} className="mb-4 rounded-lg border-2 border-current bg-muted/40 p-4 forced-colors:bg-transparent">
                <figcaption id={`scenario-description-${question.id}`} className="font-medium">{question.scenario.description}</figcaption>
                <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                  {question.scenario.facts.map((fact) => <div key={fact.label} className="rounded border border-current p-2">
                    <dt className="font-semibold">{fact.label}</dt><dd>{fact.value}</dd>
                  </div>)}
                </dl>
              </figure>
            )}
            <CardTitle ref={questionHeadingRef} tabIndex={-1} className="text-2xl break-words [overflow-wrap:anywhere] focus:outline-none">{question.question}</CardTitle>
            {topicKey === "colregs" && question.learningObjective && <p className="text-sm text-muted-foreground">
              Objective: {question.learningObjective} · Prerequisite: {question.prerequisite}
            </p>}
          </CardHeader>
          <CardContent className="space-y-4">
            <fieldset className="min-w-0">
              <legend className="sr-only">Choose one answer</legend>
              <div className="grid gap-3" role="radiogroup" aria-label={`Answers for question ${currentQuestion + 1}`}>
              {question.options.map((option, index) => {
                const isSelected = selectedAnswer === index;
                const isCorrect = index === question.correctAnswer;
                const showCorrect = showExplanation && isCorrect;
                const showIncorrect = showExplanation && isSelected && !isCorrect;

                return (
                  <label
                    key={index}
                    className={`block min-w-0 p-4 rounded-lg border-2 text-left transition-all hover:scale-[1.02] focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 motion-reduce:!transition-none motion-reduce:hover:scale-100 ${
                      showCorrect
                        ? "border-success bg-success/10"
                        : showIncorrect
                        ? "border-destructive bg-destructive/10"
                        : isSelected
                        ? "border-secondary bg-secondary/10"
                        : "border-border bg-card hover:border-secondary/50"
                    } ${showExplanation ? "cursor-not-allowed" : "cursor-pointer"}`}
                  >
                    <input
                      type="radio"
                      name={`quiz-question-${currentQuestion}`}
                      value={index}
                      checked={isSelected}
                      disabled={showExplanation}
                      onChange={() => handleAnswerSelect(index)}
                      className="sr-only"
                    />
                    <div className="flex min-w-0 items-start justify-between gap-3">
                      <span className="min-w-0 font-medium break-words [overflow-wrap:anywhere]">{option}</span>
                      {showCorrect && <CheckCircle2 className="w-5 h-5 shrink-0 text-success" aria-hidden="true" />}
                      {showIncorrect && <XCircle className="w-5 h-5 shrink-0 text-destructive" aria-hidden="true" />}
                    </div>
                  </label>
                );
              })}
              </div>
            </fieldset>

            {showExplanation && (
              <div role="status" aria-live="polite" aria-atomic="true" className="mt-6 p-4 bg-muted rounded-lg border-2 border-border animate-in fade-in slide-in-from-bottom-4 duration-500 motion-reduce:!animate-none motion-reduce:!transition-none">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  {selectedAnswer === question.correctAnswer
                    ? <CheckCircle2 className="w-5 h-5 text-success" aria-hidden="true" />
                    : <XCircle className="w-5 h-5 text-destructive" aria-hidden="true" />}
                  {selectedAnswer === question.correctAnswer ? "Correct" : "Incorrect"}
                </h3>
                <p className="text-muted-foreground break-words [overflow-wrap:anywhere]">{question.explanation}</p>
                {topicKey === "colregs" && selectedAnswer !== question.correctAnswer && question.remediationRoute && <Button variant="link" className="h-auto px-0 pt-2" onClick={() => navigate(question.remediationRoute!)}>Review {question.prerequisite ?? "this objective"} theory</Button>}
                {topicKey === "victualling" && selectedAnswer !== question.correctAnswer && <Button variant="link" className="h-auto px-0 pt-2" onClick={() => navigate(victuallingTheoryRoute(question.id))}>Review this objective in Victualling theory</Button>}
                {topicKey === "engine" && selectedAnswer !== question.correctAnswer && <Button variant="link" className="h-auto px-0 pt-2" onClick={() => navigate(engineTheoryRoute(question.id))}>Review this objective in Engine theory</Button>}
              </div>
            )}

            <div className="flex flex-col gap-3 pt-4 sm:flex-row">
              {currentQuestion > 0 && !showExplanation && (
                <Button variant="outline" onClick={handlePrevious}>
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>
              )}
              {!showExplanation ? (
                <Button
                  className="flex-1 bg-secondary text-secondary-foreground hover:bg-secondary/90"
                  onClick={() => void handleSubmit()}
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
