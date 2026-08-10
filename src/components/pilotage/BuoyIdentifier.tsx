import { useCallback, useEffect, useRef, useState } from "react";
import { CheckCircle2, RefreshCcw, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BuoyMarkDiagram } from "@/components/pilotage/BuoyMarkDiagram";
import { ialaBuoys, type BuoyId, type IalaBuoy } from "@/data/ialabuoys";

export const BUOY_DRILL_REVISION = "iala-region-a-mastery-v1";
export const BUOY_DRILL_ATTEMPT_KEY = `day-skipper:${BUOY_DRILL_REVISION}`;
export const BUOY_PASS_COUNT = 10;
export interface BuoyDrillResult {
  readonly correctCount: number;
  readonly totalAnswered: number;
  readonly mastered: boolean;
  readonly missedIds: readonly BuoyId[];
}
interface Props {
  readonly onComplete: (result: BuoyDrillResult) => void;
  readonly totalChallenges?: number;
  readonly seed?: number;
  readonly storageKey?: string;
}
interface Question {
  readonly buoyId: BuoyId;
  readonly optionIds: readonly BuoyId[];
}
interface Attempt {
  readonly revision: typeof BUOY_DRILL_REVISION;
  readonly questions: readonly Question[];
  readonly index: number;
  readonly selectedId: BuoyId | null;
  readonly answered: boolean;
  readonly initialCorrectIds: readonly BuoyId[];
  readonly masteredIds: readonly BuoyId[];
  readonly missedIds: readonly BuoyId[];
  readonly review: boolean;
  readonly mastered: boolean;
}

const mulberry32 = (seed: number) => () => {
  let value = (seed += 0x6d2b79f5);
  value = Math.imul(value ^ (value >>> 15), value | 1);
  value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
  return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
};
const shuffled = <T,>(items: readonly T[], random: () => number) => {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(random() * (index + 1));
    [result[index], result[swap]] = [result[swap], result[index]];
  }
  return result;
};
// Exported for deterministic evidence tests; this module's runtime export remains the drill.
// eslint-disable-next-line react-refresh/only-export-components
export const buildBuoyQuestions = (
  count = 12,
  seed = 261,
): readonly Question[] => {
  if (!Number.isInteger(count) || count < 1 || count > ialaBuoys.length)
    throw new Error(
      `Challenge count must be between 1 and ${ialaBuoys.length}.`,
    );
  const random = mulberry32(seed);
  return shuffled(ialaBuoys, random)
    .slice(0, count)
    .map((buoy) => ({
      buoyId: buoy.id,
      optionIds: shuffled(
        [
          buoy,
          ...shuffled(
            ialaBuoys.filter((item) => item.id !== buoy.id),
            random,
          ).slice(0, 3),
        ],
        random,
      ).map(({ id }) => id),
    }));
};
const fresh = (count: number, seed: number): Attempt => ({
  revision: BUOY_DRILL_REVISION,
  questions: buildBuoyQuestions(count, seed),
  index: 0,
  selectedId: null,
  answered: false,
  initialCorrectIds: [],
  masteredIds: [],
  missedIds: [],
  review: false,
  mastered: false,
});
const isBuoyId = (value: unknown): value is BuoyId =>
  typeof value === "string" && ialaBuoys.some(({ id }) => id === value);
const restore = (key: string, count: number, seed: number): Attempt => {
  try {
    const p = JSON.parse(
      localStorage.getItem(key) ?? "null",
    ) as Partial<Attempt> | null;
    if (
      !p ||
      p.revision !== BUOY_DRILL_REVISION ||
      !Array.isArray(p.questions) ||
      p.questions.length < 1 ||
      (!p.review && p.questions.length !== count) ||
      !Number.isInteger(p.index) ||
      p.index! < 0 ||
      p.index! >= p.questions.length ||
      !Array.isArray(p.initialCorrectIds) ||
      !Array.isArray(p.masteredIds) ||
      !Array.isArray(p.missedIds)
    )
      return fresh(count, seed);
    if (
      !p.questions.every(
        (q) =>
          isBuoyId(q?.buoyId) &&
          Array.isArray(q.optionIds) &&
          q.optionIds.length === 4 &&
          q.optionIds.every(isBuoyId) &&
          new Set(q.optionIds).size === 4 &&
          q.optionIds.includes(q.buoyId),
      )
    )
      return fresh(count, seed);
    return {
      revision: BUOY_DRILL_REVISION,
      questions: p.questions,
      index: p.index!,
      selectedId: isBuoyId(p.selectedId) ? p.selectedId : null,
      answered: p.answered === true,
      initialCorrectIds: p.initialCorrectIds.filter(isBuoyId),
      masteredIds: p.masteredIds.filter(isBuoyId),
      missedIds: p.missedIds.filter(isBuoyId),
      review: p.review === true,
      mastered: p.mastered === true,
    };
  } catch {
    return fresh(count, seed);
  }
};
const byId = new Map<BuoyId, IalaBuoy>(
  ialaBuoys.map((buoy) => [buoy.id, buoy]),
);

export const BuoyIdentifier = ({
  onComplete,
  totalChallenges = 12,
  seed = 261,
  storageKey = BUOY_DRILL_ATTEMPT_KEY,
}: Props) => {
  const [attempt, setAttempt] = useState(() =>
    restore(storageKey, totalChallenges, seed),
  );
  const headingRef = useRef<HTMLHeadingElement>(null);
  const announcedRef = useRef(false);
  const question = attempt.questions[attempt.index];
  const buoy = byId.get(question.buoyId)!;
  const selected = attempt.selectedId
    ? byId.get(attempt.selectedId)
    : undefined;
  const correct = attempt.selectedId === buoy.id;
  const initialAnswered =
    attempt.initialCorrectIds.length + attempt.missedIds.length;
  const passed =
    initialAnswered >= totalChallenges &&
    attempt.initialCorrectIds.length >=
      Math.min(BUOY_PASS_COUNT, totalChallenges);
  const status = attempt.mastered
    ? "Mastery achieved: every mark identified correctly."
    : attempt.review
      ? `Targeted review: ${attempt.missedIds.length} mark${attempt.missedIds.length === 1 ? "" : "s"} still to master.`
      : `Question ${attempt.index + 1} of ${totalChallenges}. ${attempt.initialCorrectIds.length} correct.`;
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(attempt));
  }, [attempt, storageKey]);
  useEffect(() => {
    if (attempt.mastered && !announcedRef.current) {
      announcedRef.current = true;
      onComplete({
        correctCount: attempt.initialCorrectIds.length,
        totalAnswered: totalChallenges,
        mastered: true,
        missedIds: [],
      });
    }
  }, [
    attempt.initialCorrectIds.length,
    attempt.mastered,
    onComplete,
    totalChallenges,
  ]);
  const choose = useCallback(
    (id: BuoyId) =>
      setAttempt((previous) => {
        if (previous.answered) return previous;
        const target = previous.questions[previous.index].buoyId;
        const right = id === target;
        return {
          ...previous,
          selectedId: id,
          answered: true,
          initialCorrectIds:
            !previous.review && right
              ? [...new Set([...previous.initialCorrectIds, target])]
              : previous.initialCorrectIds,
          masteredIds: right
            ? [...new Set([...previous.masteredIds, target])]
            : previous.masteredIds,
          missedIds: right
            ? previous.missedIds.filter((missed) => missed !== target)
            : [...new Set([...previous.missedIds, target])],
        };
      }),
    [],
  );
  const next = useCallback(() => {
    setAttempt((previous) => {
      if (!previous.answered) return previous;
      if (!previous.review && previous.index < previous.questions.length - 1)
        return {
          ...previous,
          index: previous.index + 1,
          selectedId: null,
          answered: false,
        };
      if (previous.missedIds.length === 0)
        return { ...previous, mastered: true };
      const reviewQuestions = previous.missedIds
        .map((id) => previous.questions.find(({ buoyId }) => buoyId === id)!)
        .filter(Boolean);
      return {
        ...previous,
        questions: reviewQuestions,
        index: 0,
        selectedId: null,
        answered: false,
        review: true,
      };
    });
    requestAnimationFrame(() => headingRef.current?.focus());
  }, []);
  const restart = useCallback(() => {
    announcedRef.current = false;
    localStorage.removeItem(storageKey);
    setAttempt(fresh(totalChallenges, seed));
    requestAnimationFrame(() => headingRef.current?.focus());
  }, [seed, storageKey, totalChallenges]);
  if (attempt.mastered)
    return (
      <Card>
        <CardHeader>
          <CardTitle tabIndex={-1} ref={headingRef} className="text-center">
            Buoy mastery achieved
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p>
            All {totalChallenges} Region A marks are now correct. Initial
            result: {attempt.initialCorrectIds.length}/{totalChallenges} (
            {passed ? "pass" : "below pass"}); retained misses were cleared in
            targeted review.
          </p>
          <Button onClick={restart} className="min-h-11 gap-2">
            <RefreshCcw className="size-4" />
            Start a new seeded attempt
          </Button>
        </CardContent>
      </Card>
    );
  return (
    <div className="min-w-0 space-y-4">
      <p className="text-sm text-muted-foreground">
        Evidence rules: one seeded {totalChallenges}-mark coverage round; pass
        is {Math.min(BUOY_PASS_COUNT, totalChallenges)}/{totalChallenges};
        mastery requires every miss corrected in targeted review. Your current
        attempt resumes on this device.
      </p>
      <div
        role="status"
        aria-live="polite"
        className="text-sm"
        data-testid="drill-progress"
      >
        {status}
      </div>
      <Card>
        <CardHeader>
          <CardTitle ref={headingRef} tabIndex={-1} className="text-lg">
            Identify this buoy mark
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <BuoyMarkDiagram buoy={buoy} concealName />
          <fieldset disabled={attempt.answered} className="grid min-w-0 gap-2">
            <legend className="mb-2 font-semibold">Choose one answer</legend>
            {question.optionIds.map((id) => {
              const option = byId.get(id)!;
              return (
                <label
                  key={id}
                  data-testid={id === buoy.id ? "correct-option" : undefined}
                  className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border p-3 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring forced-colors:border-[CanvasText]"
                >
                  <input
                    type="radio"
                    name="buoy-answer"
                    value={id}
                    checked={attempt.selectedId === id}
                    onChange={() => choose(id)}
                    className="size-5 shrink-0"
                  />
                  <span>{option.name}</span>
                  {attempt.answered && id === buoy.id && (
                    <>
                      <CheckCircle2 aria-hidden className="ml-auto size-5" />
                      <span className="sr-only">Correct answer</span>
                    </>
                  )}
                  {attempt.answered &&
                    id === attempt.selectedId &&
                    id !== buoy.id && (
                      <>
                        <XCircle aria-hidden className="ml-auto size-5" />
                        <span className="sr-only">Your incorrect answer</span>
                      </>
                    )}
                </label>
              );
            })}
          </fieldset>
          {attempt.answered && (
            <div
              role="alert"
              className="space-y-2 rounded-lg border-l-4 border-current bg-muted p-3 text-sm"
            >
              <p>
                <strong>
                  {correct
                    ? "Correct."
                    : `Incorrect. The answer is ${buoy.name}.`}
                </strong>{" "}
                Distinguishing cue: {buoy.visualDescriptor}
              </p>
              {!correct && selected && (
                <p>Your choice differs: {selected.visualDescriptor}</p>
              )}
              <p>
                <strong>Meaning and safe action:</strong> {buoy.meaning}{" "}
                {buoy.chartAndSafety}
              </p>
              <p>
                <strong>Light:</strong> {buoy.lightCharacteristic}. Q means
                quick, VQ very quick, Fl flashing, LFl long flash, Oc occulting,
                Iso isophase and Mo(A) Morse short–long.
              </p>
            </div>
          )}
          {attempt.answered && (
            <Button onClick={next} className="min-h-11 w-full">
              {attempt.review
                ? attempt.missedIds.length === 0
                  ? "Show mastery result"
                  : "Continue targeted review"
                : attempt.index === totalChallenges - 1
                  ? attempt.missedIds.length
                    ? "Review missed marks"
                    : "Show mastery result"
                  : "Next question"}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
