import type { ExamQuestion } from "./examEngine";

export type SaveStatus = "pending" | "saving" | "saved" | "failed";
export interface ExamSession {
  attemptId: string;
  questions: ExamQuestion[];
  answers: (number | null)[];
  flagged: number[];
  current: number;
  startedAt: number;
  durationSeconds: number;
  passMark: number;
  submitted: boolean;
  elapsedSeconds: number | null;
  saveStatus: SaveStatus;
}

export const clampInteger = (value: unknown, fallback: number, min: number, max: number) => {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? Math.min(max, Math.max(min, Math.floor(parsed))) : fallback;
};

export function parseExamSession(raw: string | null, now = Date.now()): ExamSession | null {
  try {
    const value = JSON.parse(raw ?? "null") as Partial<ExamSession> | null;
    if (!value || typeof value.attemptId !== "string" || !/^[0-9a-f-]{36}$/i.test(value.attemptId)) return null;
    if (!Array.isArray(value.questions) || value.questions.length < 1 || value.questions.length > 100) return null;
    const questions = value.questions as ExamQuestion[];
    if (questions.some((q) => !q || typeof q.id !== "string" || typeof q.topicId !== "string" ||
      typeof q.question !== "string" || !Array.isArray(q.options) || q.options.length < 2 ||
      q.options.some((o) => typeof o !== "string") || !Number.isInteger(q.correctAnswer) ||
      q.correctAnswer < 0 || q.correctAnswer >= q.options.length || typeof q.explanation !== "string")) return null;
    if (!Array.isArray(value.answers) || value.answers.length !== questions.length ||
      value.answers.some((a, i) => a !== null && (!Number.isInteger(a) || (a as number) < 0 || (a as number) >= questions[i].options.length))) return null;
    const startedAt = Number(value.startedAt);
    const durationSeconds = Number(value.durationSeconds);
    if (!Number.isFinite(startedAt) || startedAt < 1 || startedAt > now + 60_000 ||
      !Number.isInteger(durationSeconds) || durationSeconds < 300 || durationSeconds > 14_400) return null;
    const current = Number(value.current);
    if (!Number.isInteger(current) || current < 0 || current >= questions.length) return null;
    const flagged = Array.isArray(value.flagged) ? [...new Set(value.flagged.filter((n): n is number =>
      Number.isInteger(n) && n >= 0 && n < questions.length))] : [];
    const submitted = value.submitted === true;
    const elapsedSeconds = submitted ? clampInteger(value.elapsedSeconds, durationSeconds, 0, durationSeconds) : null;
    const allowedStatus: SaveStatus[] = ["pending", "saving", "saved", "failed"];
    const saveStatus = allowedStatus.includes(value.saveStatus as SaveStatus)
      ? (value.saveStatus === "saving" ? "pending" : value.saveStatus as SaveStatus) : "pending";
    return {
      attemptId: value.attemptId, questions, answers: value.answers, flagged, current, startedAt,
      durationSeconds, passMark: clampInteger(value.passMark, 65, 1, 100), submitted,
      elapsedSeconds, saveStatus,
    };
  } catch { return null; }
}
