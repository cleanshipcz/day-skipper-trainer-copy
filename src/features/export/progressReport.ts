import type { TopicEntry } from "@/constants/topicRegistry";

export interface ProgressReportInput {
  studentName: string;
  generatedAt: Date;
  topics: readonly TopicEntry[];
  progress: Record<string, { completed: boolean; score: number }>;
  quizScores: readonly { topic_id: string; percentage: number; completed_at: string; attempt_id: string }[];
  totalPoints: number;
  assessmentSeconds: number;
}

export interface ProgressReportRow {
  topic: string;
  completed: boolean;
  score: number | null;
}

export interface ProgressReportData {
  studentName: string;
  generatedDate: string;
  rows: ProgressReportRow[];
  totalPoints: number;
  completedTopics: number;
  passRate: number;
  studyDurationMinutes: number;
}

export const buildProgressReportData = (input: ProgressReportInput): ProgressReportData => {
  const latestQuizScores = new Map<string, { percentage: number; completedAt: string; attemptId: string }>();
  input.quizScores.forEach(({ topic_id, percentage, completed_at, attempt_id }) => {
    const current = latestQuizScores.get(topic_id);
    if (!current
      || completed_at > current.completedAt
      || (completed_at === current.completedAt && attempt_id > current.attemptId)) {
      latestQuizScores.set(topic_id, { percentage, completedAt: completed_at, attemptId: attempt_id });
    }
  });
  const rows = input.topics.map((topic) => {
    const ids = topic.submoduleIds.length > 0 ? topic.submoduleIds : [topic.id];
    const completed = ids.every((id) => input.progress[id]?.completed);
    const scores = ids
      .map((id) => latestQuizScores.get(id)?.percentage ?? input.progress[id]?.score)
      .filter((score): score is number => Number.isFinite(score) && score > 0);
    return {
      topic: topic.label,
      completed,
      score: scores.length ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : null,
    };
  });
  const scoredRows = rows.filter((row) => row.score !== null);
  return {
    studentName: input.studentName.trim() || "Learner",
    generatedDate: input.generatedAt.toLocaleDateString("en-GB"),
    rows,
    totalPoints: input.totalPoints,
    completedTopics: rows.filter((row) => row.completed).length,
    passRate: scoredRows.length
      ? Math.round((scoredRows.filter((row) => (row.score ?? 0) >= 70).length / scoredRows.length) * 100)
      : 0,
    studyDurationMinutes: Math.round(input.assessmentSeconds / 60),
  };
};

export const downloadProgressReport = async (data: ProgressReportData): Promise<void> => {
  const { jsPDF } = await import("jspdf");
  const document = new jsPDF();
  document.setFillColor(32, 59, 94);
  document.rect(0, 0, 210, 28, "F");
  document.setTextColor(255, 255, 255);
  document.setFontSize(18);
  document.text("RYA Day Skipper Training Log", 14, 18);
  document.setTextColor(25, 35, 45);
  document.setFontSize(11);
  document.text(`Student: ${data.studentName}`, 14, 38);
  document.text(`Generated: ${data.generatedDate}`, 14, 45);
  document.text(`Topics completed: ${data.completedTopics}/${data.rows.length}`, 14, 54);
  document.text(`Total points: ${data.totalPoints}`, 80, 54);
  document.text(`Quiz pass rate: ${data.passRate}%`, 14, 61);
  document.text(`Recorded assessment study time: ${data.studyDurationMinutes} minutes`, 80, 61);
  document.setFontSize(10);
  document.setFont("helvetica", "bold");
  document.text("Topic", 14, 73);
  document.text("Complete", 145, 73);
  document.text("Score", 176, 73);
  document.setFont("helvetica", "normal");
  let y = 81;
  data.rows.forEach((row) => {
    if (y > 278) {
      document.addPage();
      y = 20;
    }
    document.text(row.topic.slice(0, 58), 14, y);
    document.text(row.completed ? "Yes" : "No", 145, y);
    document.text(row.score === null ? "—" : `${row.score}%`, 176, y);
    y += 8;
  });
  document.save(`day-skipper-progress-${new Date().toISOString().slice(0, 10)}.pdf`);
};
