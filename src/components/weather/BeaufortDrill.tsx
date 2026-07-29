import { useState } from "react";
import { beaufortScale } from "@/data/beaufortScale";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const beaufortDrillItems = beaufortScale.slice(1, 11);

export const BeaufortDrill = () => {
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState<number | null>(null);
  const item = beaufortDrillItems[index];
  const next = () => {
    setIndex((value) => (value + 1) % beaufortDrillItems.length);
    setAnswer(null);
  };
  return (
    <Card>
      <CardHeader><CardTitle>Guess the force</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <p>Sea observation: <strong>{item.seaState}</strong></p>
        <div role="group" aria-label="Choose Beaufort force" className="grid grid-cols-6 sm:grid-cols-11 gap-2">
          {beaufortScale.slice(0, 11).map(({ force }) => (
            <Button key={force} variant={answer === force ? "default" : "outline"} onClick={() => setAnswer(force)} aria-pressed={answer === force}>{force}</Button>
          ))}
        </div>
        {answer !== null && <p role="status">{answer === item.force ? "Correct" : `Not quite — this is Force ${item.force}.`}</p>}
        <Button onClick={next}>Next observation</Button>
      </CardContent>
    </Card>
  );
};
