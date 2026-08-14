import { useState, useCallback, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { RefreshCcw, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import {
  fireResponseScenarios,
  type FireResponseScenario,
} from "@/data/fireExtinguishers";

/** Result payload passed to the onComplete callback when the drill finishes. */
export interface DrillResult {
  readonly correctCount: number;
  readonly totalAnswered: number;
}

interface FireExtinguisherDrillProps {
  /** Called once when the student finishes all scenarios. */
  readonly onComplete: (result: DrillResult) => void;
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

interface DrillState {
  readonly scenarios: readonly FireResponseScenario[];
  readonly currentIndex: number;
  readonly selectedOptionId: string | null;
  readonly answered: boolean;
  readonly correctCount: number;
  readonly totalAnswered: number;
}

const initialState = (scenarios: readonly FireResponseScenario[]): DrillState => ({
  scenarios: shuffle(scenarios),
  currentIndex: 0,
  selectedOptionId: null,
  answered: false,
  correctCount: 0,
  totalAnswered: 0,
});

export const FireExtinguisherDrill = ({ onComplete }: FireExtinguisherDrillProps) => {
  const [state, setState] = useState<DrillState>(() =>
    initialState(fireResponseScenarios)
  );

  const completedRef = useRef(false);

  const currentScenario = state.scenarios[state.currentIndex] as
    | FireResponseScenario
    | undefined;

  const isComplete = state.currentIndex >= state.scenarios.length;

  const isCorrect =
    state.answered &&
    state.selectedOptionId === currentScenario?.correctOptionId;

  // H1: Fire onComplete callback when drill finishes (once only)
  useEffect(() => {
    if (isComplete && !completedRef.current) {
      completedRef.current = true;
      onComplete({
        correctCount: state.correctCount,
        totalAnswered: state.totalAnswered,
      });
    }
  }, [isComplete, onComplete, state.correctCount, state.totalAnswered]);

  const handleSelect = useCallback((optionId: string) => {
    setState((prev) =>
      prev.answered ? prev : { ...prev, selectedOptionId: optionId }
    );
  }, []);

  // M2: Correctness check moved inside the setState updater to avoid stale closure
  const handleSubmit = useCallback(() => {
    setState((prev) => {
      const scenario = prev.scenarios[prev.currentIndex];
      if (!scenario || prev.selectedOptionId === null) return prev;

      const correct =
        scenario.correctOptionId === prev.selectedOptionId;

      if (correct) {
        toast.success("Correct!", {
          description: scenario.explanation,
        });
      } else {
        toast.error("Incorrect", {
          description: scenario.explanation,
        });
      }

      return {
        ...prev,
        answered: true,
        correctCount: prev.correctCount + (correct ? 1 : 0),
        totalAnswered: prev.totalAnswered + 1,
      };
    });
  }, []);

  const handleNext = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentIndex: prev.currentIndex + 1,
      selectedOptionId: null,
      answered: false,
    }));
  }, []);

  const handleReset = useCallback(() => {
    completedRef.current = false;
    setState(initialState(fireResponseScenarios));
  }, []);

  if (isComplete) {
    return (
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <CardTitle>Drill Complete!</CardTitle>
          <CardDescription>
            You scored {state.correctCount} out of {state.totalAnswered}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div data-testid="drill-score" className="text-center text-2xl font-bold">
            {state.correctCount} / {state.totalAnswered}
          </div>
          <Button onClick={handleReset} className="w-full">
            <RefreshCcw className="w-4 h-4 mr-2" />
            Restart Drill
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!currentScenario) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div data-testid="drill-score" className="text-sm text-muted-foreground">
          Score: {state.correctCount} / {state.totalAnswered} &middot; Question{" "}
          {state.currentIndex + 1} of {state.scenarios.length}
        </div>
        <Button variant="outline" size="sm" onClick={handleReset}>
          <RefreshCcw className="w-4 h-4 mr-2" />
          Reset
        </Button>
      </div>

      <Card className="border-2 border-primary/20">
        <CardHeader>
          <CardTitle>Onboard Response Scenario</CardTitle>
          <CardDescription data-testid="fire-scenario">
            {currentScenario.description}
          </CardDescription>
          <CardDescription>
            This check assesses decisions and sequence. It does not ask you to
            match extinguisher media to fire classes.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm font-medium">
            {currentScenario.question}
          </p>

          <div className="grid gap-3 sm:grid-cols-2">
            {currentScenario.options.map((option) => {
              const isSelected =
                state.selectedOptionId === option.id;
              const showResult = state.answered;
              const isCorrectAnswer =
                currentScenario.correctOptionId === option.id;

              let borderClass = "border-border hover:border-primary/40";
              if (isSelected && !showResult) {
                borderClass = "border-primary ring-2 ring-primary/30";
              } else if (showResult && isCorrectAnswer) {
                borderClass =
                  "border-green-500 bg-green-50/50 dark:bg-green-900/10";
              } else if (showResult && isSelected && !isCorrectAnswer) {
                borderClass =
                  "border-red-500 bg-red-50/50 dark:bg-red-900/10";
              }

              return (
                <button
                  key={option.id}
                  data-testid={`response-option-${option.id}`}
                  type="button"
                  className={`p-4 rounded-lg border-2 text-left transition-colors ${borderClass}`}
                  disabled={state.answered}
                  onClick={() => handleSelect(option.id)}
                >
                  <span className="text-sm font-medium">{option.label}</span>
                  {showResult && isCorrectAnswer && (
                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-2" />
                  )}
                  {showResult && isSelected && !isCorrectAnswer && (
                    <XCircle className="w-5 h-5 text-red-600 mt-2" />
                  )}
                </button>
              );
            })}
          </div>

          {state.answered && (
            <div
              data-testid="drill-result"
              className={`p-4 rounded-lg ${
                isCorrect
                  ? "bg-green-50 dark:bg-green-900/20 border border-green-200"
                  : "bg-red-50 dark:bg-red-900/20 border border-red-200"
              }`}
            >
              <p className="font-medium mb-1">
                {isCorrect ? "✓ Correct!" : "✗ Incorrect"}
              </p>
              <p className="text-sm text-muted-foreground">
                {currentScenario.explanation}
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            {!state.answered ? (
              <Button
                onClick={handleSubmit}
                className="flex-1"
                disabled={state.selectedOptionId === null}
              >
                Check Answer
              </Button>
            ) : (
              <Button onClick={handleNext} className="flex-1">
                Next Scenario
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
