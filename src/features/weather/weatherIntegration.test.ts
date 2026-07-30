import { describe, expect, it } from "vitest";
import { appRoutes } from "@/app/routes";
import { getTopicById, getTopicsByParent } from "@/constants/topicRegistry";
import { loadQuizTopic } from "@/data/quizzes";
import { forecastAreas } from "@/data/forecastAreas";

describe("meteorology integration", () => {
  it("registers the menu and all weather routes lazily", () => {
    const paths = ["/weather", "/weather/systems", "/weather/beaufort", "/weather/forecasts", "/weather/fog"];
    expect(paths.every((path) => appRoutes.some((route) => route.path === path))).toBe(true);
  });

  it("connects dashboard completion to four theories and the quiz", () => {
    expect(getTopicById("weather")?.submoduleIds).toEqual(["weather-systems", "weather-beaufort", "weather-forecasts", "weather-fog", "quiz-weather"]);
    expect(getTopicsByParent("weather")).toHaveLength(5);
  });

  it("ships comprehensive quiz and complete forecast-area data", async () => {
    expect(await loadQuizTopic("weather")).toHaveLength(20);
    expect(forecastAreas).toHaveLength(31);
    expect(forecastAreas.map(({ name }) => name)).toEqual(expect.arrayContaining([
      "North Utsire", "South Utsire", "Cromarty", "Forth", "Tyne", "German Bight",
    ]));
  });
});
