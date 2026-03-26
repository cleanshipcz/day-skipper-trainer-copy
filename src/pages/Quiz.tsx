import { useMemo, useState, useEffect } from "react";
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
  pointsFromCorrectAnswers,
  questionProgressPercent,
} from "@/features/quiz/scoring";
import { canonicalQuizProgressKey, resolveQuizProgressForLoad, type QuizProgressRow } from "@/features/quiz/progressKeys";
import { createSeededRng, shuffleWithRng } from "@/features/quiz/randomization";
import {
  buildQuizSessionProgress,
  createEmptyQuizAnswers,
  parseSavedQuizSession,
  persistQuizSessionProgress,
} from "@/features/quiz/sessionProgress";
import { quizRegistry, topicMeta } from "@/data/quizzes";

const Quiz = () => {
  const navigate = useNavigate();
  const { topicId } = useParams<{ topicId: string }>();
  // If topicId is nautical-terms (legacy) or undefined, use the new specific ID
  const topicKey = !topicId || topicId === "nautical-terms" ? "nautical-terms-quiz" : topicId;
  const { user } = useAuth();
  const { loadProgress, saveProgress, resetProgress } = useProgress();
  const [seed, setSeed] = useState(0);
  const questions = useMemo(() => {
    const source = quizRegistry[topicKey] || [];
    const rng = createSeededRng(seed + 1);

    return shuffleWithRng([...source], rng)
      .slice(0, Math.min(20, source.length))
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
  }, [topicKey, seed]);
  const meta = topicMeta[topicKey] || {
    title: "Topic Quiz",
    subtitle: "Answer the questions to test yourself",
  };

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  // Initialize answers array when questions change
  useEffect(() => {
    const initQuiz = async () => {
      const canonicalKey = canonicalQuizProgressKey(topicKey);
      const canonicalRecord: QuizProgressRow | null = await loadProgress(canonicalKey);
      const legacyRecord: QuizProgressRow | null = canonicalRecord ? null : await loadProgress(topicKey);
      const resolution = resolveQuizProgressForLoad(topicKey, canonicalRecord, legacyRecord);
      const savedData = resolution.record;

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
              await resetProgress(topicKey);
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
  }, [questions.length, topicKey, loadProgress, saveProgress, resetProgress]);

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

  if (!questions.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-ocean-light/10 to-background flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full border-2">
          <CardHeader>
            <CardTitle className="text-2xl">No questions available</CardTitle>
            <p className="text-sm text-muted-foreground">
              We could not find any quiz items for this topic. Please head back and choose another module.
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
      toast.success("Correct! +20 points", {
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

    const percentage = percentageScore(correctAnswers, questions.length);
    const pointsEarned = pointsFromCorrectAnswers(correctAnswers);

    try {
      // Save quiz score
      await supabase.from("quiz_scores").insert({
        user_id: user.id,
        topic_id: topicKey,
        score: correctAnswers,
        total_questions: questions.length,
        percentage,
      });

      // Save final progress with answers
      await saveProgress(
        canonicalQuizProgressKey(topicKey),
        percentage >= 70,
        percentage,
        pointsEarned,
        {
          ...buildQuizSessionProgress(answers, currentQuestion),
          completed: true,
        }
      );

      toast.success(`Quiz completed! +${pointsEarned} points`);
    } catch (error) {
      console.error("Error saving quiz results:", error);
    }
  };

  const handleRestart = () => {
    setCurrentQuestion(0);
    setAnswers(createEmptyQuizAnswers(questions.length));
    setShowExplanation(false);
    setIsComplete(false);
    setSeed((n) => n + 1);
  };

  if (isComplete) {
    const percentage = percentageScore(correctAnswers, questions.length);
    const passed = percentage >= 70;

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
                {correctAnswers} out of {questions.length} correct
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
              <Button className="flex-1 bg-secondary text-secondary-foreground" onClick={handleRestart}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Retry Quiz
              </Button>
            </div>
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
