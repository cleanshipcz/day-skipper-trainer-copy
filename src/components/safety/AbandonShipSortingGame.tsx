import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowUp, ArrowDown, RefreshCcw, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import {
  abandonShipSteps,
  deploymentProcedureSteps,
  boardingProcedureSteps,
  actionsInRaftSteps,
  type ProcedureStep,
} from "@/data/lifeRaftProcedures";

interface Scenario {
  readonly title: string;
  readonly description: string;
  readonly steps: readonly ProcedureStep[];
}

const SCENARIOS: Record<string, Scenario> = {
  abandon: {
    title: "Abandon Ship Procedure",
    description: "Order the steps for abandoning a vessel in distress.",
    steps: abandonShipSteps,
  },
  deployment: {
    title: "Life Raft Deployment",
    description: "Order the steps to launch and inflate the life raft.",
    steps: deploymentProcedureSteps,
  },
  boarding: {
    title: "Boarding the Raft",
    description: "Order the steps for safely boarding the life raft.",
    steps: boardingProcedureSteps,
  },
  actions: {
    title: "Actions in the Raft",
    description: "Order the immediate actions once everyone is aboard.",
    steps: actionsInRaftSteps,
  },
};

const SCENARIO_KEYS = Object.keys(SCENARIOS) as ReadonlyArray<string>;

/** Fisher-Yates shuffle — returns a new array. */
const shuffle = <T,>(items: readonly T[]): T[] => {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

export const AbandonShipSortingGame = () => {
  const [scenarioKey, setScenarioKey] = useState<string>(SCENARIO_KEYS[0]);
  const [currentSteps, setCurrentSteps] = useState<ProcedureStep[]>([]);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const shuffleScenario = (key: string) => {
    setCurrentSteps(shuffle(SCENARIOS[key].steps));
    setIsCorrect(null);
  };

  // Shuffle on load or scenario change
  useEffect(() => {
    shuffleScenario(scenarioKey);
  }, [scenarioKey]);

  const moveItem = (index: number, direction: -1 | 1) => {
    const newSteps = [...currentSteps];
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= newSteps.length) return;
    [newSteps[index], newSteps[newIndex]] = [newSteps[newIndex], newSteps[index]];
    setCurrentSteps(newSteps);
    setIsCorrect(null);
  };

  const checkOrder = () => {
    const correctOrder = SCENARIOS[scenarioKey].steps;
    const isNowCorrect = currentSteps.every(
      (step, index) => step.id === correctOrder[index].id,
    );
    setIsCorrect(isNowCorrect);

    if (isNowCorrect) {
      toast.success("Correct Order!", { description: "Well done, you know the procedure." });
    } else {
      toast.error("Incorrect Order", { description: "Review the sequence and try again." });
    }
  };

  const scenario = SCENARIOS[scenarioKey];

  return (
    <div className="space-y-6">
      {/* Scenario selector buttons */}
      <div className="flex flex-wrap gap-2 justify-center">
        {SCENARIO_KEYS.map((key) => (
          <Button
            key={key}
            variant={scenarioKey === key ? "default" : "outline"}
            onClick={() => setScenarioKey(key)}
          >
            {SCENARIOS[key].title}
          </Button>
        ))}
      </div>

      {/* Sortable steps card */}
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>{scenario.title}</CardTitle>
              <CardDescription>{scenario.description}</CardDescription>
            </div>
            {isCorrect === true && (
              <Badge className="bg-green-500 hover:bg-green-600 gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Solved
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            {currentSteps.map((step, index) => (
              <div
                key={step.id}
                className={`p-3 rounded-lg border flex items-center justify-between transition-colors ${
                  isCorrect === true
                    ? "bg-green-50/50 border-green-200 dark:bg-green-900/10"
                    : isCorrect === false
                      ? "bg-red-50/10 border-red-200"
                      : "bg-card hover:bg-accent/5"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Badge
                    variant="outline"
                    className="w-8 h-8 rounded-full flex items-center justify-center p-0"
                  >
                    {index + 1}
                  </Badge>
                  <span className="font-medium">{step.text}</span>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    disabled={index === 0 || isCorrect === true}
                    onClick={() => moveItem(index, -1)}
                  >
                    <ArrowUp className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    disabled={index === currentSteps.length - 1 || isCorrect === true}
                    onClick={() => moveItem(index, 1)}
                  >
                    <ArrowDown className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3 pt-4">
            <Button onClick={checkOrder} className="flex-1" disabled={isCorrect === true}>
              Check Order
            </Button>
            <Button variant="outline" onClick={() => shuffleScenario(scenarioKey)}>
              <RefreshCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
