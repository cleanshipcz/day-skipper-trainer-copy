import { describe, expect, it } from "vitest";
import { appRoutes } from "@/app/routes";
import { getTopicById } from "@/constants/topicRegistry";
import { quizRegistry, topicMeta } from "@/data/quizzes";
import { canonicalQuizProgressKey } from "@/features/quiz/progressKeys";
import { deriveTopicCompletionState } from "@/features/dashboard/topicCompletion";

describe("pilotage module integration", () => {
  it("registers every pilotage learning and quiz route", () => {
    const paths = appRoutes.map((route) => route.path);
    expect(paths).toEqual(expect.arrayContaining([
      "/pilotage",
      "/pilotage/buoyage",
      "/pilotage/transits",
      "/pilotage/clearing-bearings",
      "/pilotage/plan",
      "/quiz/:topicId",
    ]));
  });

  it("provides a meaningful 20-question pilotage bank", () => {
    expect(quizRegistry.pilotage).toHaveLength(20);
    expect(new Set(quizRegistry.pilotage.map((question) => question.id)).size).toBe(20);
    expect(topicMeta.pilotage.title).toBe("Pilotage Quiz");
  });

  it("uses the persisted quiz key in dashboard completion", () => {
    const pilotage = getTopicById("pilotage");
    expect(pilotage?.submoduleIds).toContain(canonicalQuizProgressKey("pilotage"));
    const progress = Object.fromEntries(
      pilotage!.submoduleIds.map((id) => [id, { completed: true, score: 80 }]),
    );
    expect(deriveTopicCompletionState(pilotage!, progress)).toEqual({
      isCompleted: true,
      score: 80,
    });
  });
});
