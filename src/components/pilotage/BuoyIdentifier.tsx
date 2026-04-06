/**
 * Interactive buoy identification drill component.
 *
 * Presents a series of challenges where the user must identify an IALA
 * buoy type from its visual description. Tracks correct/incorrect answers
 * and fires onComplete when all challenges are answered.
 *
 * @see docs/FEATURE_TASKS.md — Story E2-S1, AC-3
 */
import { useState, useCallback, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RefreshCcw, CheckCircle2, XCircle } from "lucide-react";
import { ialaBuoys, type IalaBuoy } from "@/data/ialabuoys";

/** Result payload passed to the onComplete callback when the drill finishes. */
export interface BuoyDrillResult {
  readonly correctCount: number;
  readonly totalAnswered: number;
}

interface BuoyIdentifierProps {
  /** Called once when the student finishes all challenges. */
  readonly onComplete: (result: BuoyDrillResult) => void;
  /** Override number of challenges (defaults to 12, used in testing). */
  readonly totalChallenges?: number;
}

/**
 * Shuffle an array using Fisher-Yates.
 * Returns a new array (does not mutate the original).
 */
const shuffle = <T,>(arr: readonly T[]): T[] => {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

/** Build a list of challenges by cycling through buoys. */
const buildChallenges = (count: number): readonly IalaBuoy[] => {
  const shuffled = shuffle(ialaBuoys);
  const challenges: IalaBuoy[] = [];
  for (let i = 0; i < count; i++) {
    challenges.push(shuffled[i % shuffled.length]);
  }
  return challenges;
};

/** Generate 3 wrong answer options + the correct answer, shuffled. */
const buildOptions = (correct: IalaBuoy): readonly IalaBuoy[] => {
  const others = ialaBuoys.filter((b) => b.id !== correct.id);
  const wrongOptions = shuffle(others).slice(0, 3);
  return shuffle([correct, ...wrongOptions]);
};

interface DrillState {
  readonly challenges: readonly IalaBuoy[];
  readonly currentIndex: number;
  readonly selectedId: string | null;
  readonly answered: boolean;
  readonly correctCount: number;
  readonly totalAnswered: number;
}

const createInitialState = (totalChallenges: number): DrillState => ({
  challenges: buildChallenges(totalChallenges),
  currentIndex: 0,
  selectedId: null,
  answered: false,
  correctCount: 0,
  totalAnswered: 0,
});

export const BuoyIdentifier = ({
  onComplete,
  totalChallenges = 12,
}: BuoyIdentifierProps) => {
  const [state, setState] = useState<DrillState>(() =>
    createInitialState(totalChallenges)
  );
  const completedRef = useRef(false);

  const currentChallenge = state.challenges[state.currentIndex] as IalaBuoy | undefined;
  const isComplete = state.totalAnswered >= totalChallenges;
  const isCorrect = state.answered && state.selectedId === currentChallenge?.id;
  const options = currentChallenge ? buildOptions(currentChallenge) : [];

  // Fire onComplete callback when drill finishes (once only)
  useEffect(() => {
    if (isComplete && !completedRef.current) {
      completedRef.current = true;
      onComplete({
        correctCount: state.correctCount,
        totalAnswered: state.totalAnswered,
      });
    }
  }, [isComplete, onComplete, state.correctCount, state.totalAnswered]);

  const handleSelect = useCallback(
    (buoyId: string) => {
      if (state.answered || !currentChallenge) return;

      const correct = buoyId === currentChallenge.id;
      setState((prev) => ({
        ...prev,
        selectedId: buoyId,
        answered: true,
        correctCount: prev.correctCount + (correct ? 1 : 0),
        totalAnswered: prev.totalAnswered + 1,
      }));
    },
    [state.answered, currentChallenge]
  );

  const handleNext = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentIndex: prev.currentIndex + 1,
      selectedId: null,
      answered: false,
    }));
  }, []);

  const handleRestart = useCallback(() => {
    completedRef.current = false;
    setState(createInitialState(totalChallenges));
  }, [totalChallenges]);

  // ── Completion screen ────────────────────────────────────────────────
  if (isComplete) {
    const score = Math.round((state.correctCount / state.totalAnswered) * 100);
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Drill Complete!</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-2xl font-bold">
            {state.correctCount} / {state.totalAnswered} correct ({score}%)
          </p>
          <p className="text-muted-foreground">
            {score >= 80
              ? "Excellent buoy identification skills!"
              : score >= 60
                ? "Good effort — review the marks you missed."
                : "Keep practising — review the theory and try again."}
          </p>
          <Button onClick={handleRestart} className="gap-2">
            <RefreshCcw className="w-4 h-4" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!currentChallenge) return null;

  // ── Challenge screen ─────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      {/* Progress indicator */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span data-testid="drill-progress">
          Question {state.currentIndex + 1} of {totalChallenges}
        </span>
        <span>
          {state.correctCount} correct so far
        </span>
      </div>

      {/* Challenge prompt */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Identify this buoy mark</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Visual description of the buoy */}
          <div className="p-4 bg-muted/50 rounded-lg border">
            <p className="text-sm font-medium mb-2">Visual Description:</p>
            <p className="text-sm">{currentChallenge.visualDescriptor}</p>
            <p className="text-xs text-muted-foreground mt-2">
              <strong>Light:</strong> {currentChallenge.lightCharacteristic}
            </p>
          </div>

          {/* Answer options */}
          <div className="grid gap-2">
            {options.map((option) => {
              const isSelected = state.selectedId === option.id;
              const isCorrectOption = option.id === currentChallenge.id;
              const showResult = state.answered;

              let variant: "outline" | "default" | "destructive" = "outline";
              if (showResult && isCorrectOption) variant = "default";
              if (showResult && isSelected && !isCorrectOption) variant = "destructive";

              return (
                <Button
                  key={option.id}
                  variant={variant}
                  className="justify-start h-auto py-3 px-4 text-left whitespace-normal"
                  onClick={() => handleSelect(option.id)}
                  disabled={state.answered}
                  data-testid={
                    isCorrectOption ? "correct-option" : isSelected ? "incorrect-option" : undefined
                  }
                >
                  <span className="flex items-center gap-2">
                    {showResult && isCorrectOption && (
                      <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                    )}
                    {showResult && isSelected && !isCorrectOption && (
                      <XCircle className="w-4 h-4 shrink-0" />
                    )}
                    {option.name}
                  </span>
                </Button>
              );
            })}
          </div>

          {/* Feedback */}
          {state.answered && (
            <div className={`p-3 rounded-lg text-sm ${isCorrect ? "bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300" : "bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300"}`}>
              {isCorrect ? (
                <p><strong>Correct!</strong> {currentChallenge.meaning}</p>
              ) : (
                <p>
                  <strong>Incorrect.</strong> The correct answer is{" "}
                  <strong>{currentChallenge.name}</strong>.{" "}
                  {currentChallenge.meaning}
                </p>
              )}
            </div>
          )}

          {/* Next button */}
          {state.answered && state.totalAnswered < totalChallenges && (
            <Button onClick={handleNext} className="w-full">
              Next Question
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
