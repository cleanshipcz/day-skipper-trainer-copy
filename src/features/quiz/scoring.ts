type Answer = number | null;

type ScoredQuestion = {
  correctAnswer: number;
};

export function countCorrectAnswers(answers: Answer[], questions: ScoredQuestion[]): number {
  return answers.reduce((count, answer, index) => {
    if (answer === null) return count;
    return answer === questions[index]?.correctAnswer ? count + 1 : count;
  }, 0);
}

export function percentageScore(correctAnswers: number, totalQuestions: number): number {
  if (totalQuestions <= 0) return 0;
  return Math.round((correctAnswers / totalQuestions) * 100);
}

export function pointsFromCorrectAnswers(correctAnswers: number): number {
  return correctAnswers * 20;
}

export function questionProgressPercent(currentQuestionIndex: number, totalQuestions: number): number {
  if (totalQuestions <= 0) return 0;
  return ((currentQuestionIndex + 1) / totalQuestions) * 100;
}
