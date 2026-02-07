import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, XCircle, RefreshCcw } from "lucide-react";

interface Question {
  id: number;
  symbol: string; // Using text description or emoji as placeholder for actual symbol images
  type: "text" | "image";
  correctAnswer: string;
  options: string[];
}

const questions: Question[] = [
  {
    id: 1,
    symbol: "💎", // Placeholder for Stone
    type: "text",
    correctAnswer: "Stone or Rock",
    options: ["Stone or Rock", "Wreck", "Anchor Berth", "Fishing Stake"],
  },
  {
    id: 2,
    symbol: "⚓", // Placeholder
    type: "text",
    correctAnswer: "Anchor Berth",
    options: ["Marina", "Anchor Berth", "Port", "Mooring Buoy"],
  },
  {
    id: 3,
    symbol: "Pipeline",
    type: "text",
    correctAnswer: "Submarine Pipeline",
    options: ["Power Cable", "Ferry Route", "Submarine Pipeline", "Bridge"],
  },
  {
    id: 4,
    symbol: "#",
    type: "text",
    correctAnswer: "Foul Ground",
    options: ["Coral", "Sand", "Foul Ground", "Gravel"],
  },
  {
    id: 5,
    symbol: "WK",
    type: "text",
    correctAnswer: "Wreck",
    options: ["Way Point", "Wharf", "Wreck", "White Light"],
  },
];

const ChartSymbolQuiz = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);

  const currentQuestion = questions[currentQuestionIndex];

  const handleOptionClick = (option: string) => {
    if (selectedOption) return; // Prevent changing answer

    setSelectedOption(option);
    const correct = option === currentQuestion.correctAnswer;
    setIsCorrect(correct);
    if (correct) setScore(score + 1);
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOption(null);
      setIsCorrect(null);
    } else {
      setShowResult(true);
    }
  };

  const handleRetry = () => {
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setIsCorrect(null);
    setShowResult(false);
    setScore(0);
  };

  if (showResult) {
    return (
      <Card className="w-full max-w-md mx-auto mt-8 border-2 border-primary">
        <CardContent className="pt-6 text-center">
          <h2 className="text-2xl font-bold mb-4">Quiz Complete!</h2>
          <p className="text-4xl font-bold text-primary mb-2">
            {score} / {questions.length}
          </p>
          <p className="text-muted-foreground mb-6">
            {score === questions.length
              ? "Perfect! You know your charts."
              : "Good effort! Keep practicing those symbols."}
          </p>
          <Button onClick={handleRetry} className="w-full">
            <RefreshCcw className="w-4 h-4 mr-2" /> Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto mt-8 border-2 border-secondary/20">
      <CardHeader>
        <CardTitle className="flex justify-between items-center text-lg">
          <span>Symbol Quiz</span>
          <span className="text-sm font-normal text-muted-foreground">
            {currentQuestionIndex + 1} of {questions.length}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center mb-6">
          <div className="w-24 h-24 bg-muted rounded-xl flex items-center justify-center text-4xl shadow-inner mb-4 border border-border">
            {currentQuestion.symbol}
          </div>
          <p className="text-sm text-muted-foreground">What does this symbol represent?</p>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {currentQuestion.options.map((option) => {
            let variant = "outline";
            let className = "";

            if (selectedOption) {
              if (option === currentQuestion.correctAnswer) {
                variant = "default";
                className = "bg-green-500 hover:bg-green-600 text-white border-green-600";
              } else if (option === selectedOption) {
                variant = "destructive";
              } else {
                className = "opacity-50";
              }
            }

            return (
              <Button
                key={option}
                variant={variant as "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"}
                className={`justify-start h-auto py-3 text-left ${className}`}
                onClick={() => handleOptionClick(option)}
                disabled={!!selectedOption}
              >
                {option}
                {selectedOption && option === currentQuestion.correctAnswer && (
                  <CheckCircle2 className="w-4 h-4 ml-auto" />
                )}
                {selectedOption && option === selectedOption && option !== currentQuestion.correctAnswer && (
                  <XCircle className="w-4 h-4 ml-auto" />
                )}
              </Button>
            );
          })}
        </div>

        {selectedOption && (
          <div className="mt-6 animate-in fade-in slide-in-from-bottom-2">
            <Button onClick={handleNext} className="w-full" size="lg">
              {currentQuestionIndex < questions.length - 1 ? "Next Question" : "See Results"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ChartSymbolQuiz;
