export interface Sm2State {
  readonly easeFactor: number;
  readonly intervalDays: number;
  readonly repetitions: number;
}

const MINIMUM_EASE_FACTOR = 1.3;

/** Pure SuperMemo-2 scheduling step. Intervals are rounded to whole study days. */
export const calculateSm2 = (current: Sm2State, quality: number): Sm2State => {
  if (!Number.isInteger(quality) || quality < 0 || quality > 5) {
    throw new RangeError("quality must be an integer from 0 to 5");
  }

  const easeFactor = Math.max(
    MINIMUM_EASE_FACTOR,
    current.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)),
  );

  if (quality < 3) {
    return { easeFactor, intervalDays: 1, repetitions: 0 };
  }

  const repetitions = current.repetitions + 1;
  const intervalDays =
    repetitions === 1 ? 1
    : repetitions === 2 ? 6
    : Math.max(1, Math.round(current.intervalDays * easeFactor));

  return { easeFactor, intervalDays, repetitions };
};

/** Automatic rating: a correct answer advances; an incorrect answer resets. */
export const qualityForAnswer = (isCorrect: boolean): number => isCorrect ? 4 : 2;

