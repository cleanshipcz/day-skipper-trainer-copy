import { describe, expect, it } from "vitest";
import { appRoutes } from "@/app/routes";
import { getTopicById, getTopicsByParent } from "@/constants/topicRegistry";
import { loadQuizTopic } from "@/data/quizzes";
import { forecastAreas, SHIPPING_FORECAST_MAP_SOURCE } from "@/data/forecastAreas";

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
      "North Utsire", "South Utsire", "Cromarty", "Forth", "Tyne", "German Bight", "Southeast Iceland",
    ]));
    expect(new Set(forecastAreas.map(({ name }) => name)).size).toBe(31);
    expect(forecastAreas.every(({ polygon, label }) => polygon.split(" ").length >= 4 && label.every(Number.isFinite))).toBe(true);
    expect(SHIPPING_FORECAST_MAP_SOURCE.tracedReferenceSize).toBe("600×739 pixels");
  });

  it("pins representative placements and traced adjacencies", () => {
    const byName = Object.fromEntries(forecastAreas.map((area) => [area.name, area]));
    expect(byName["Southeast Iceland"].label[1]).toBeLessThan(byName.Faeroes.label[1]);
    expect(byName["North Utsire"].label[1]).toBeLessThan(byName["South Utsire"].label[1]);
    expect(byName.Trafalgar.label[1]).toBeGreaterThan(byName.Biscay.label[1]);
    expect(byName.Dogger.neighbours).toEqual(expect.arrayContaining(["Forties", "Fisher", "Humber", "German Bight"]));
    expect(byName["Irish Sea"].neighbours).toEqual(expect.arrayContaining(["Malin", "Lundy", "Fastnet"]));
    expect(byName.Dover.neighbours).toEqual(expect.arrayContaining(["Thames", "Wight"]));
    expect(byName["Irish Sea"].neighbours).not.toContain("Tyne");
    expect(byName.Lundy.neighbours).not.toContain("Humber");
    expect(byName.Portland.neighbours).not.toContain("Lundy");
    expect(byName["South Utsire"].neighbours).not.toContain("Viking");
  });

  it("keeps every neighbour reference valid, unique, self-free and symmetric", () => {
    const byName = new Map(forecastAreas.map((area) => [area.name, area]));
    forecastAreas.forEach((area) => {
      expect(new Set(area.neighbours).size, `${area.name} has duplicate neighbours`).toBe(area.neighbours.length);
      expect(area.neighbours, `${area.name} references itself`).not.toContain(area.name);
      area.neighbours.forEach((neighbour) => {
        expect(byName.has(neighbour), `${area.name} references unknown ${neighbour}`).toBe(true);
        expect(byName.get(neighbour)?.neighbours, `${area.name} → ${neighbour} is not reciprocal`).toContain(area.name);
      });
    });
  });
});
