import type { Question } from "@/data/quizzes";
import canonicalSafetyQuestions from "@/data/quizzes/safety";
import { safetyQuizCompletionOutcome } from "@/features/quiz/safetyAssessment";

export interface ExamQuestion extends Question {
  topicId: string;
}

export interface TopicResult {
  correct: number;
  total: number;
  percentage: number;
}

export const classifyExamSafetyEvidence = (questions: readonly ExamQuestion[], answers: readonly (number | null)[]) => {
  const positions = questions.map((question, index) => ({ question, answer: answers[index] })).filter(({ question }) => question.topicId === "safety");
  const answerById = new Map(positions.map(({ question, answer }) => [question.id, answer]));
  const canonicalIds = canonicalSafetyQuestions.map(({ id }) => id);
  if (positions.length !== canonicalIds.length || answerById.size !== canonicalIds.length
    || canonicalIds.some((id) => !answerById.has(id))) {
    return { status: "sampled" as const, masteryEligible: false, passed: false, failedLeaves: [], missedCriticalIds: [] };
  }
  const outcome = safetyQuizCompletionOutcome(canonicalIds.map((id) => answerById.get(id) ?? null), canonicalSafetyQuestions);
  return { status: "full-bank" as const, masteryEligible: outcome.passed, passed: outcome.passed, failedLeaves: outcome.failedLeaves, missedCriticalIds: [...outcome.missedCriticalIds] };
};

const DEFAULT_WEIGHTS: Record<string, number> = {
  colregs: 4,
  "lights-signals": 4,
  pilotage: 3,
  weather: 3,
  "passage-planning": 3,
  safety: 2,
  anchorwork: 2,
  ropework: 1,
  engine: 1,
  rig: 1,
  victualling: 0.5,
  "nautical-terms-quiz": 1,
};

export function selectExamQuestions(
  banks: Record<string, readonly Question[]>,
  count: number,
  random: () => number = Math.random,
): ExamQuestion[] {
  const available = Object.entries(banks).filter(([, questions]) => questions.length > 0);
  const target = Math.max(1, Math.min(Math.floor(count), available.reduce((n, [, q]) => n + q.length, 0)));
  const selected: ExamQuestion[] = [];
  const used = new Set<string>();

  while (selected.length < target) {
    const candidates = available.filter(([topic, questions]) =>
      questions.some((question) => !used.has(`${topic}:${question.id}`)),
    );
    if (!candidates.length) break;
    const weightTotal = candidates.reduce((sum, [topic]) => sum + (DEFAULT_WEIGHTS[topic] ?? 1), 0);
    let pick = random() * weightTotal;
    const [topic, questions] =
      candidates.find(([candidate]) => ((pick -= DEFAULT_WEIGHTS[candidate] ?? 1) <= 0)) ?? candidates[0];
    const remaining = questions.filter((question) => !used.has(`${topic}:${question.id}`));
    const question = remaining[Math.min(Math.floor(random() * remaining.length), remaining.length - 1)];
    used.add(`${topic}:${question.id}`);
    selected.push({ ...question, topicId: topic });
  }
  return selected;
}

export function scoreExam(questions: readonly ExamQuestion[], answers: readonly (number | null)[], passMark = 65) {
  const topicBreakdown: Record<string, TopicResult> = {};
  let score = 0;
  questions.forEach((question, index) => {
    const correct = answers[index] === question.correctAnswer;
    if (correct) score++;
    const topic = topicBreakdown[question.topicId] ?? { correct: 0, total: 0, percentage: 0 };
    topic.total++;
    if (correct) topic.correct++;
    topic.percentage = Math.round((topic.correct / topic.total) * 100);
    topicBreakdown[question.topicId] = topic;
  });
  const percentage = questions.length ? Math.round((score / questions.length) * 100) : 0;
  return { score, percentage, passed: percentage >= passMark, topicBreakdown, safetyEvidence: classifyExamSafetyEvidence(questions, answers) };
}

export const remainingSeconds = (startedAt: number, durationSeconds: number, now = Date.now()) =>
  Math.max(0, durationSeconds - Math.floor((now - startedAt) / 1000));
