import { useEffect, useMemo, useRef, useState } from "react";
import { beaufortScale, type BeaufortLevel } from "@/data/beaufortScale";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type RecallDirection = "speed" | "sea";
type DrillQuestion = { id: string; direction: RecallDirection; level: BeaufortLevel };
type DrillResult = { id: string; correct: boolean };

const beaufortDrillQuestions: readonly DrillQuestion[] = beaufortScale.flatMap((level) => [
  { id: `speed-${level.force}`, direction: "speed" as const, level },
  { id: `sea-${level.force}`, direction: "sea" as const, level },
]);

const waveCue = (level: BeaufortLevel) =>
  level.probableWaveHeight ? `Probable waves ${level.probableWaveHeight}.` : "No probable wave height is specified.";

export const BeaufortDrill = () => {
  const [questions, setQuestions] = useState<readonly DrillQuestion[]>(beaufortDrillQuestions);
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState<readonly DrillResult[]>([]);
  const [complete, setComplete] = useState(false);
  const questionHeadingRef = useRef<HTMLHeadingElement>(null);
  const summaryHeadingRef = useRef<HTMLHeadingElement>(null);
  const item = questions[index];
  const correct = submitted && answer === item?.level.force;
  const missed = useMemo(() => results.filter((result) => !result.correct), [results]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      if (complete) summaryHeadingRef.current?.focus();
      else questionHeadingRef.current?.focus();
    });
    return () => cancelAnimationFrame(frame);
  }, [complete, index, questions]);

  const resetAttempt = (nextQuestions: readonly DrillQuestion[]) => {
    setQuestions(nextQuestions);
    setIndex(0);
    setAnswer(null);
    setSubmitted(false);
    setResults([]);
    setComplete(false);
  };

  const submit = () => {
    if (answer === null || submitted) return;
    setSubmitted(true);
    setResults((current) => [...current, { id: item.id, correct: answer === item.level.force }]);
  };

  const advance = () => {
    if (!submitted) return;
    if (index === questions.length - 1) {
      setComplete(true);
      return;
    }
    setIndex((current) => current + 1);
    setAnswer(null);
    setSubmitted(false);
  };

  const retryMissed = () => {
    const missedIds = new Set(missed.map(({ id }) => id));
    resetAttempt(beaufortDrillQuestions.filter(({ id }) => missedIds.has(id)));
  };

  if (complete) {
    const score = results.filter(({ correct: wasCorrect }) => wasCorrect).length;
    return (
      <Card>
        <CardHeader><CardTitle ref={summaryHeadingRef} tabIndex={-1}>Beaufort drill summary</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <p className="text-2xl font-bold">Score: {score} / {questions.length}</p>
          <p role="status">{missed.length === 0 ? "Mastery achieved: every speed band and sea cue was recalled correctly." : `${missed.length} missed. Retry those items or restart the complete drill.`}</p>
          <div className="flex flex-col gap-2 sm:flex-row">
            {missed.length > 0 && <Button type="button" onClick={retryMissed}>Retry missed ({missed.length})</Button>}
            <Button type="button" variant="outline" onClick={() => resetAttempt(beaufortDrillQuestions)}>Restart full drill</Button>
          </div>
          <p className="text-sm text-muted-foreground">This optional practice score is session-only and does not mark the Beaufort theory topic complete or save progress.</p>
        </CardContent>
      </Card>
    );
  }

  const prompt = item.direction === "speed"
    ? <>Which Beaufort force has the wind-speed band <strong>{item.level.knots} knots</strong>?</>
    : <>Which Beaufort force has the sea description <strong>{item.level.seaState}</strong>?</>;
  const questionId = `beaufort-question-${item.id}`;
  const instructionsId = "beaufort-answer-instructions";

  return (
    <Card>
      <CardHeader className="space-y-2">
        <CardTitle>Beaufort recall drill</CardTitle>
        <p>Question {index + 1} of {questions.length} · score {results.filter(({ correct: wasCorrect }) => wasCorrect).length}/{results.length}</p>
        <progress className="w-full" aria-label="Beaufort drill progress" value={index + 1} max={questions.length} />
      </CardHeader>
      <CardContent className="space-y-4">
        <h3 ref={questionHeadingRef} id={questionId} tabIndex={-1} className="font-semibold">{prompt}</h3>
        <p id={instructionsId} className="text-sm text-muted-foreground">Choose one force, then check your answer. A submitted answer is locked before you can advance.</p>
        <div role="group" aria-labelledby={questionId} aria-describedby={instructionsId} className="grid grid-cols-7 gap-2 sm:grid-cols-13">
          {beaufortScale.map(({ force }) => (
            <Button key={force} type="button" disabled={submitted} variant={answer === force ? "default" : "outline"} onClick={() => setAnswer(force)} aria-pressed={answer === force}>{force}</Button>
          ))}
        </div>
        <Button type="button" onClick={submit} disabled={answer === null || submitted}>Check answer</Button>
        {submitted && <div role="status" className={correct ? "text-green-700" : "text-red-700"}>
          <p className="font-semibold">{correct ? "Correct." : `Not quite — you chose Force ${answer}; the answer is Force ${item.level.force}.`}</p>
          <p>Force {item.level.force}: {item.level.description}, {item.level.knots} knots; sea: {item.level.seaState}. {waveCue(item.level)}</p>
        </div>}
        <Button type="button" variant="outline" onClick={advance} disabled={!submitted}>{index === questions.length - 1 ? "See summary" : "Next question"}</Button>
        <p className="text-sm text-muted-foreground">This optional drill does not control or save theory completion; use the lesson’s separate completion action when ready.</p>
      </CardContent>
    </Card>
  );
};
