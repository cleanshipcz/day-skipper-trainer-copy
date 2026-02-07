import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowUp, ArrowDown, RefreshCcw, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface Step {
  id: string;
  text: string;
}

const SCENARIOS = {
  immediate: {
    title: "Immediate Actions",
    description: "Order the very first actions to take when someone falls overboard.",
    steps: [
      { id: "shout", text: "SHOUT 'Man Overboard' to alert crew" },
      { id: "throw", text: "THROW lifebuoy/danbuoy to mark position" },
      { id: "point", text: "POINT continuously at the casualty" },
      { id: "digital", text: "PRESS MOB button on GPS" },
      { id: "mayday", text: "SEND Mayday / DSC Distress" },
    ],
  },
  williamson: {
    title: "The Williamson Turn",
    description: "Order the steps for a return maneuver under power in open water.",
    steps: [
      { id: "note", text: "Note the compass heading" },
      { id: "turn60", text: "Turn 60° to port or starboard" },
      { id: "hardover", text: "Turn hard over the OPPOSITE way" },
      { id: "reciprocal", text: "Steady on the reciprocal course (original + 180°)" },
      { id: "search", text: "Proceed down track line to search" },
    ],
  },
};

export const MOBSortingGame = () => {
  const [scenarioKey, setScenarioKey] = useState<keyof typeof SCENARIOS>("immediate");
  const [currentSteps, setCurrentSteps] = useState<Step[]>([]);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  // Shuffle steps on load or scenario change
  useEffect(() => {
    shuffleScenario(scenarioKey);
  }, [scenarioKey]);

  const shuffleScenario = (key: keyof typeof SCENARIOS) => {
    const original = [...SCENARIOS[key].steps];
    // Fisher-Yates shuffle
    for (let i = original.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [original[i], original[j]] = [original[j], original[i]];
    }
    setCurrentSteps(original);
    setIsCorrect(null);
  };

  const moveItem = (index: number, direction: -1 | 1) => {
    const newSteps = [...currentSteps];
    const newIndex = index + direction;

    if (newIndex < 0 || newIndex >= newSteps.length) return;

    [newSteps[index], newSteps[newIndex]] = [newSteps[newIndex], newSteps[index]];
    setCurrentSteps(newSteps);
    setIsCorrect(null); // Reset validation on move
  };

  const checkOrder = () => {
    const correctOrder = SCENARIOS[scenarioKey].steps;
    const isNowCorrect = currentSteps.every((step, index) => step.id === correctOrder[index].id);

    setIsCorrect(isNowCorrect);

    if (isNowCorrect) {
      toast.success("Correct Order!", { description: "Well done, you know the procedure." });
    } else {
      toast.error("Incorrect Order", { description: "Review the sequence and try again." });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 justify-center">
        <Button
          variant={scenarioKey === "immediate" ? "default" : "outline"}
          onClick={() => setScenarioKey("immediate")}
        >
          Immediate Actions
        </Button>
        <Button
          variant={scenarioKey === "williamson" ? "default" : "outline"}
          onClick={() => setScenarioKey("williamson")}
        >
          Williamson Turn
        </Button>
      </div>

      <Card className="border-2 border-primary/20">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>{SCENARIOS[scenarioKey].title}</CardTitle>
              <CardDescription>{SCENARIOS[scenarioKey].description}</CardDescription>
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
                  <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center p-0">
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
