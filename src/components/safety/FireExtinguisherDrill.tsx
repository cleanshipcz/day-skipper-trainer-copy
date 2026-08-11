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
  readonly incorrectScenarioIds: readonly string[];
  readonly browserPersisted: boolean;
}

export const FIRE_DRILL_PASS_PERCENT = 80;

interface FireExtinguisherDrillProps {
  /** Called once when the student finishes all scenarios. */
  readonly onComplete: (result: DrillResult) => void;
  readonly storageKey?: string;
  readonly onPersistenceRecovered?: (result: DrillResult) => void;
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
  readonly incorrectScenarioIds: readonly string[];
  readonly answers: readonly { scenarioId: string; optionId: string }[];
  readonly hasRestoredAnswers: boolean;
}

const initialState = (scenarios: readonly FireResponseScenario[]): DrillState => ({
  scenarios: shuffle(scenarios),
  currentIndex: 0,
  selectedOptionId: null,
  answered: false,
  correctCount: 0,
  totalAnswered: 0,
  incorrectScenarioIds: [],
  answers: [],
  hasRestoredAnswers: false,
});

const restoreState = (storageKey?: string): DrillState => {
  if (!storageKey) return initialState(fireResponseScenarios);
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) ?? "null") as Partial<DrillState> & { version?: unknown; scenarioIds?: unknown; answers?: unknown };
    if (saved.version !== 2) return initialState(fireResponseScenarios);
    const ids = Array.isArray(saved.scenarioIds) ? saved.scenarioIds.filter((id): id is string => typeof id === "string") : [];
    const scenarios = ids.map((id) => fireResponseScenarios.find((scenario) => scenario.id === id)).filter((scenario): scenario is FireResponseScenario => Boolean(scenario));
    const canonicalIds = new Set(fireResponseScenarios.map((scenario) => scenario.id));
    if (scenarios.length !== fireResponseScenarios.length || new Set(ids).size !== ids.length || ids.some((id) => !canonicalIds.has(id)) || !Array.isArray(saved.answers)) return initialState(fireResponseScenarios);
    const answers = saved.answers.filter((answer): answer is { scenarioId: string; optionId: string } => Boolean(answer) && typeof answer === "object" && typeof (answer as { scenarioId?: unknown }).scenarioId === "string" && typeof (answer as { optionId?: unknown }).optionId === "string");
    if (answers.length !== saved.answers.length || answers.length > scenarios.length || new Set(answers.map((answer) => answer.scenarioId)).size !== answers.length) return initialState(fireResponseScenarios);
    if (answers.some((answer, index) => answer.scenarioId !== scenarios[index]?.id || !scenarios[index]?.options.some((option) => option.id === answer.optionId))) return initialState(fireResponseScenarios);
    const answered = saved.answered === true;
    const expectedIndex = answered ? answers.length - 1 : answers.length;
    if (answers.length === 0 && answered || expectedIndex < 0 || saved.currentIndex !== expectedIndex) return initialState(fireResponseScenarios);
    const selectedOptionId = typeof saved.selectedOptionId === "string" ? saved.selectedOptionId : null;
    const selectedIsValid = expectedIndex < scenarios.length && selectedOptionId !== null && scenarios[expectedIndex].options.some((option) => option.id === selectedOptionId);
    if (answered ? selectedOptionId !== answers.at(-1)?.optionId : selectedOptionId !== null && !selectedIsValid) return initialState(fireResponseScenarios);
    const correctCount = answers.filter((answer, index) => scenarios[index].correctOptionId === answer.optionId).length;
    const incorrectScenarioIds = answers.filter((answer, index) => scenarios[index].correctOptionId !== answer.optionId).map((answer) => answer.scenarioId);
    return { scenarios, currentIndex: expectedIndex, selectedOptionId, answered, correctCount, totalAnswered: answers.length, incorrectScenarioIds, answers, hasRestoredAnswers: answers.length > 0 };
  } catch { return initialState(fireResponseScenarios); }
};

export const FireExtinguisherDrill = ({ onComplete, storageKey, onPersistenceRecovered }: FireExtinguisherDrillProps) => {
  const [state, setState] = useState<DrillState>(() =>
    restoreState(storageKey)
  );

  const completedRef = useRef(false);
  const submittedScenarioRef = useRef<string | null>(null);
  const feedbackRef = useRef<HTMLDivElement>(null);
  const browserPersistedRef = useRef(!storageKey);
  const [storageFailed, setStorageFailed] = useState(false);
  const completedResultRef = useRef<DrillResult | null>(null);

  const currentScenario = state.scenarios[state.currentIndex] as
    | FireResponseScenario
    | undefined;

  const isComplete = state.currentIndex >= state.scenarios.length;

  const isCorrect =
    state.answered &&
    state.selectedOptionId === currentScenario?.correctOptionId;

  useEffect(() => {
    if (!storageKey) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify({ version: 2, scenarioIds: state.scenarios.map((scenario) => scenario.id), answers: state.answers, currentIndex: state.currentIndex, selectedOptionId: state.selectedOptionId, answered: state.answered }));
      browserPersistedRef.current = true;
      setStorageFailed(false);
    } catch { browserPersistedRef.current = false; setStorageFailed(true); }
  }, [state, storageKey]);

  // H1: Fire onComplete callback when drill finishes (once only)
  useEffect(() => {
    if (isComplete && !state.hasRestoredAnswers && !completedRef.current) {
      completedRef.current = true;
      const result = {
        correctCount: state.correctCount,
        totalAnswered: state.totalAnswered,
        incorrectScenarioIds: state.incorrectScenarioIds,
        browserPersisted: browserPersistedRef.current,
      } satisfies DrillResult;
      completedResultRef.current = result;
      onComplete(result);
    }
  }, [isComplete, onComplete, state.correctCount, state.hasRestoredAnswers, state.incorrectScenarioIds, state.totalAnswered]);

  const handleSelect = useCallback((optionId: string) => {
    setState((prev) =>
      prev.answered ? prev : { ...prev, selectedOptionId: optionId }
    );
  }, []);

  // M2: Correctness check moved inside the setState updater to avoid stale closure
  const handleSubmit = useCallback(() => {
    setState((prev) => {
      const scenario = prev.scenarios[prev.currentIndex];
      if (!scenario || prev.selectedOptionId === null || prev.answered || submittedScenarioRef.current === scenario.id) return prev;
      submittedScenarioRef.current = scenario.id;

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
        totalAnswered: Math.min(prev.scenarios.length, prev.totalAnswered + 1),
        incorrectScenarioIds: correct ? prev.incorrectScenarioIds : [...new Set([...prev.incorrectScenarioIds, scenario.id])],
        answers: [...prev.answers, { scenarioId: scenario.id, optionId: prev.selectedOptionId }],
      };
    });
  }, []);

  useEffect(() => {
    if (state.answered) feedbackRef.current?.focus();
  }, [state.answered]);

  const handleNext = useCallback(() => {
    setState((prev) => {
      if (!prev.answered) return prev;
      submittedScenarioRef.current = null;
      return { ...prev, currentIndex: Math.min(prev.scenarios.length, prev.currentIndex + 1), selectedOptionId: null, answered: false };
    });
  }, []);

  const handleReset = useCallback(() => {
    completedRef.current = false;
    completedResultRef.current = null;
    submittedScenarioRef.current = null;
    if (storageKey) localStorage.removeItem(storageKey);
    setState(initialState(fireResponseScenarios));
  }, [storageKey]);

  const retryStorage = useCallback(() => {
    if (!storageKey) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify({ version: 2, scenarioIds: state.scenarios.map((scenario) => scenario.id), answers: state.answers, currentIndex: state.currentIndex, selectedOptionId: state.selectedOptionId, answered: state.answered }));
      browserPersistedRef.current = true;
      setStorageFailed(false);
      if (completedResultRef.current) {
        const recovered = { ...completedResultRef.current, browserPersisted: true };
        completedResultRef.current = recovered;
        onPersistenceRecovered?.(recovered);
      }
    } catch { browserPersistedRef.current = false; setStorageFailed(true); }
  }, [onPersistenceRecovered, state, storageKey]);

  if (isComplete) {
    const scorePercent = state.totalAnswered === 0 ? 0 : Math.round((state.correctCount / state.totalAnswered) * 100);
    const passed = state.totalAnswered === state.scenarios.length && scorePercent >= FIRE_DRILL_PASS_PERCENT;
    return (
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <CardTitle>Drill Complete!</CardTitle>
          <CardDescription>
            You scored {state.correctCount} out of {state.totalAnswered}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {storageFailed && <div role="alert" className="flex flex-wrap items-center gap-2 text-sm text-destructive">Progress is not saved on this device. <Button type="button" size="sm" variant="outline" onClick={retryStorage}>Retry local save</Button></div>}
          <div data-testid="drill-score" className="text-center text-2xl font-bold">
            {state.correctCount} / {state.totalAnswered}
          </div>
          <p role="status" aria-live="polite" className="text-sm">
            {state.hasRestoredAnswers ? "This attempt includes restored practice answers and is shown for review only. It cannot establish a trusted pass or award points; restart to complete a fresh verified in-session attempt." : passed ? "Pass evidence recorded. This drill supports practice; it does not certify firefighting competence." : `Retry required: score at least ${FIRE_DRILL_PASS_PERCENT}% after answering every scenario.`}
          </p>
          {!passed && state.incorrectScenarioIds.length > 0 && <div className="text-sm"><p className="font-medium">Review these decisions before retrying:</p><ul className="list-disc pl-5">{state.incorrectScenarioIds.map((id) => <li key={id}>{state.scenarios.find((scenario) => scenario.id === id)?.description}</li>)}</ul></div>}
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
      {storageFailed && <div role="alert" className="flex flex-wrap items-center gap-2 text-sm text-destructive">Progress could not be saved on this device. <Button type="button" size="sm" variant="outline" onClick={retryStorage}>Retry local save</Button></div>}
      <div className="flex min-w-0 flex-wrap items-center justify-between gap-2">
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

          <fieldset className="grid min-w-0 gap-3 sm:grid-cols-2">
            <legend className="sr-only">Choose one response to this fire scenario</legend>
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
                <label
                  key={option.id}
                  data-testid={`response-option-${option.id}`}
                  className={`flex min-h-11 min-w-0 cursor-pointer items-start gap-3 rounded-lg border-2 p-4 text-left transition-colors forced-colors:border-[CanvasText] ${borderClass}`}
                >
                  <input type="radio" name={`fire-response-${currentScenario.id}`} className="mt-0.5 size-5 shrink-0" checked={isSelected} disabled={state.answered} onChange={() => handleSelect(option.id)} />
                  <span className="min-w-0 break-words text-sm font-medium">{option.label}</span>
                  {showResult && isCorrectAnswer && (
                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-2" />
                  )}
                  {showResult && isSelected && !isCorrectAnswer && (
                    <XCircle className="w-5 h-5 text-red-600 mt-2" />
                  )}
                </label>
              );
            })}
          </fieldset>

          {state.answered && (
            <div
              data-testid="drill-result"
              ref={feedbackRef}
              tabIndex={-1}
              role="status"
              aria-live="polite"
              aria-atomic="true"
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

          <div className="flex min-w-0 flex-wrap gap-3 pt-2">
            {!state.answered ? (
              <Button
                key="submit-answer"
                onClick={handleSubmit}
                className="h-auto min-h-11 min-w-0 flex-1 whitespace-normal"
                disabled={state.selectedOptionId === null}
              >
                Check Answer
              </Button>
            ) : (
              <Button key="next-scenario" onClick={handleNext} className="h-auto min-h-11 min-w-0 flex-1 whitespace-normal">
                Next Scenario
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
