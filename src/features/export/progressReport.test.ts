import { describe, expect, it } from "vitest";
import { buildProgressReportData } from "./progressReport";
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
});
