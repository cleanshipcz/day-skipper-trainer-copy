import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import questions, { WEATHER_AUTHORITATIVE_SOURCES, WEATHER_QUIZ_COVERAGE_MATRIX } from "./weather";
import { validateQuizBank } from "./index";

describe("applied meteorology quiz bank", () => {
  it("maps every question exactly once to a leaf objective and authoritative source", () => {
    expect(validateQuizBank("weather", questions)).toBe(questions);
    expect(questions).toHaveLength(21);
    expect(WEATHER_QUIZ_COVERAGE_MATRIX.map(({ questionId }) => questionId)).toEqual(questions.map(({ id }) => id));
    expect(new Set(WEATHER_QUIZ_COVERAGE_MATRIX.map(({ questionId }) => questionId)).size).toBe(21);
    expect(new Set(WEATHER_QUIZ_COVERAGE_MATRIX.map(({ leaf }) => leaf))).toEqual(new Set(["weather-systems", "beaufort-sea-state", "marine-forecasts", "fog-visibility"]));
    for (const row of WEATHER_QUIZ_COVERAGE_MATRIX) {
      expect(row.objective?.length, row.questionId).toBeGreaterThan(12);
      expect(row.sourceIds.length, row.questionId).toBeGreaterThan(0);
      for (const sourceId of row.sourceIds) expect(WEATHER_AUTHORITATIVE_SOURCES[sourceId], `${row.questionId}: ${sourceId}`).toBeDefined();
    }
    for (const source of Object.values(WEATHER_AUTHORITATIVE_SOURCES)) expect(source.url).toMatch(/^https:\/\//);
  });

  it("preserves safety-critical forecast, visibility and restricted-visibility facts", () => {
    const byId = new Map(questions.map((question) => [question.id, question]));
    const answer = (id: string) => { const q = byId.get(id)!; return q.options[q.correctAnswer]; };
    expect(answer("weather-8")).toMatch(/22.?27 kt.*strong breeze/i);
    expect(answer("weather-10")).toMatch(/wind opposes.*tidal|steeper.*hazardous/i);
    expect(answer("weather-14")).toMatch(/wind, sea state, weather and visibility.*general synopsis/i);
    expect(byId.get("weather-14")?.explanation).toMatch(/pressure.*not an extra standard field/i);
    expect(answer("weather-15")).toMatch(/current forecast and warnings.*correct area.*validity/i);
    expect(answer("weather-17")).toBe("1,000 m");
    expect(answer("weather-18")).toMatch(/AIS|echo.*possible traffic/i);
    expect(answer("weather-19")).toMatch(/avoid port.*forward of the beam/i);
    expect(answer("weather-21")).toBe("Poor");
    expect(byId.get("weather-21")?.explanation).toMatch(/Very poor is strictly below 1,000/i);
  });

  it("uses sourced local visuals with complete nonvisual equivalents and no keyed-answer leakage", () => {
    const visual = questions.filter(({ image }) => image);
    expect(visual.map(({ id }) => id)).toEqual(["weather-4", "weather-7"]);
    for (const question of visual) {
      expect(question.imageAlt?.length).toBeGreaterThan(60);
      expect(question.scenario?.facts.length).toBeGreaterThanOrEqual(3);
      const svg = readFileSync(`${process.cwd()}/public${question.image}`, "utf8");
      expect(svg).toMatch(/<title[^>]*>.+<\/title>/s);
      expect(svg).toMatch(/<desc[^>]*>.+<\/desc>/s);
      expect(svg).toMatch(/based on (?:the )?Met Office/i);
    }
    expect(visual[0].imageAlt).not.toMatch(/about four hours/i);
    expect(visual[1].imageAlt).not.toMatch(/Force 4/i);
  });

  it("uses plausible operational misconceptions rather than joke distractors", () => {
    const distractors = questions.flatMap((question) => question.options.filter((_, index) => index !== question.correctAnswer));
    expect(distractors.every((option) => option.trim().length > 0)).toBe(true);
    expect(distractors.join(" ")).not.toMatch(/harbour café|marina prices|isobars vanish|days of calm/i);
  });
});
