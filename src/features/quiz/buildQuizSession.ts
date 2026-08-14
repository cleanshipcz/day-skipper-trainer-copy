import type { Question } from "@/data/quizzes/types";
import { createSeededRng, shuffleWithRng } from "./randomization";

/** Builds the complete runtime session. It reorders; it never samples questions out. */
export function buildQuizSession<T extends Question>(source: readonly T[], seed: number): T[] {
  const rng = createSeededRng(seed + 1);
  return shuffleWithRng([...source], rng).map((question) => {
    const shuffledOptions = shuffleWithRng(question.options.map((option, originalIndex) => ({ option, originalIndex })), rng);
    return {
      ...question,
      options: shuffledOptions.map(({ option }) => option),
      correctAnswer: shuffledOptions.findIndex(({ originalIndex }) => originalIndex === question.correctAnswer),
    };
  });
}
