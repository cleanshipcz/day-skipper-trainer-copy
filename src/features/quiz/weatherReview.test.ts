import { describe, expect, it } from "vitest";
import type { Question } from "@/data/quizzes";
import { buildWeatherLeafResults, weatherResultMessage } from "./weatherReview";

const question = (id: string, leaf: string): Question => ({ id, leaf, question: id, options: ["right", "wrong"], correctAnswer: 0, explanation: `${id} explanation`, learningObjective: `${id} objective` });

describe("Meteorology post-attempt diagnostics", () => {
  it("reports mixed and undemonstrated leaf performance against all four curriculum leaves", () => {
    const results = buildWeatherLeafResults([
      question("systems", "weather-systems"), question("beaufort", "beaufort-sea-state"),
      question("forecast", "marine-forecasts"), question("fog", "fog-visibility"),
    ], [0, 1, null, 0]);
    expect(results.map(({ label, correct, assessed, total }) => ({ label, correct, assessed, total }))).toEqual([
      { label: "Weather Systems & Fronts", correct: 1, assessed: 1, total: 1 },
      { label: "Beaufort Scale & Sea State", correct: 0, assessed: 1, total: 1 },
      { label: "Marine Forecasts", correct: 0, assessed: 0, total: 1 },
      { label: "Fog & Visibility", correct: 1, assessed: 1, total: 1 },
    ]);
    expect(results[1].route).toBe("/weather/beaufort");
  });

  it("distinguishes perfect, strong, minimum-pass and failed outcomes", () => {
    expect(weatherResultMessage(100).heading).toBe("Mastery demonstrated");
    expect(weatherResultMessage(90).heading).toBe("Strong performance");
    expect(weatherResultMessage(70).heading).toBe("Minimum pass reached");
    expect(weatherResultMessage(69).heading).toBe("More review needed");
  });
});
