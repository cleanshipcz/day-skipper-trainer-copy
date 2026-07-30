import { describe, expect, it, vi } from "vitest";
import { buildProgressReportData, downloadProgressReport } from "./progressReport";
import type { TopicEntry } from "@/constants/topicRegistry";

const topics: TopicEntry[] = [
  { id: "navigation", label: "Navigation", parentId: null, route: "/", quizRoute: null, submoduleIds: ["charts", "compass"], syllabusArea: 1 },
  { id: "ropework", label: "Ropework", parentId: null, route: "/", quizRoute: null, submoduleIds: [], syllabusArea: 2 },
];

describe("buildProgressReportData", () => {
  it("derives completion, latest quiz scores, pass rate, points and recorded duration", () => {
    const report = buildProgressReportData({
      studentName: "Ada",
      generatedAt: new Date("2026-07-30T10:00:00Z"),
      topics,
      progress: {
        charts: { completed: true, score: 80 },
        compass: { completed: true, score: 60 },
        ropework: { completed: false, score: 0 },
      },
      quizScores: [
        { topic_id: "charts", percentage: 90, completed_at: "2026-07-30T09:00:00Z", attempt_id: "new" },
        { topic_id: "charts", percentage: 60, completed_at: "2026-07-29T09:00:00Z", attempt_id: "old" },
      ],
      totalPoints: 125,
      assessmentSeconds: 3_630,
    });

    expect(report.rows).toEqual([
      { topic: "Navigation", completed: true, score: 75 },
      { topic: "Ropework", completed: false, score: null },
    ]);
    expect(report).toMatchObject({
      studentName: "Ada",
      totalPoints: 125,
      completedTopics: 1,
      passRate: 100,
      studyDurationMinutes: 61,
    });
  });

  it("uses deterministic tie-breaking, fallback identity, and a zero pass rate without scores", () => {
    const report = buildProgressReportData({
      studentName: " ",
      generatedAt: new Date("2026-07-30T10:00:00Z"),
      topics,
      progress: {},
      quizScores: [
        { topic_id: "ropework", percentage: 65, completed_at: "2026-07-30", attempt_id: "a" },
        { topic_id: "ropework", percentage: 75, completed_at: "2026-07-30", attempt_id: "b" },
      ],
      totalPoints: 0,
      assessmentSeconds: 29,
    });

    expect(report.studentName).toBe("Learner");
    expect(report.rows).toEqual([
      { topic: "Navigation", completed: false, score: null },
      { topic: "Ropework", completed: false, score: 75 },
    ]);
    expect(report.passRate).toBe(100);

    const empty = buildProgressReportData({ ...reportInput(), quizScores: [], progress: {} });
    expect(empty.passRate).toBe(0);
  });
});

const reportInput = (): Parameters<typeof buildProgressReportData>[0] => ({
  studentName: "Ada",
  generatedAt: new Date("2026-07-30T10:00:00Z"),
  topics,
  progress: {},
  quizScores: [],
  totalPoints: 0,
  assessmentSeconds: 0,
});

const { pdf } = vi.hoisted(() => ({
  pdf: {
    setFillColor: vi.fn(), rect: vi.fn(), setTextColor: vi.fn(), setFontSize: vi.fn(),
    text: vi.fn(), setFont: vi.fn(), addPage: vi.fn(), save: vi.fn(),
  },
}));
vi.mock("jspdf", () => ({
  jsPDF: vi.fn(function MockJsPdf() {
    return pdf;
  }),
}));

describe("downloadProgressReport", () => {
  it("renders rows, null scores, page breaks, and saves a dated PDF", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-30T12:00:00Z"));
    const rows = Array.from({ length: 27 }, (_, index) => ({
      topic: `Topic ${index} ${"x".repeat(70)}`,
      completed: index % 2 === 0,
      score: index === 0 ? null : 80,
    }));

    await downloadProgressReport({
      studentName: "Ada", generatedDate: "30/07/2026", rows, totalPoints: 10,
      completedTopics: 14, passRate: 80, studyDurationMinutes: 20,
    });

    expect(pdf.addPage).toHaveBeenCalledOnce();
    expect(pdf.text).toHaveBeenCalledWith("—", 176, 81);
    expect(pdf.text).toHaveBeenCalledWith("No", 145, 89);
    expect(pdf.save).toHaveBeenCalledWith("day-skipper-progress-2026-07-30.pdf");
    vi.useRealTimers();
  });
});
