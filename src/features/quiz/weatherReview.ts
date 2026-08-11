import type { Question } from "@/data/quizzes";

export const WEATHER_LEAF_REVIEW = {
  "weather-systems": { label: "Weather Systems & Fronts", route: "/weather/systems" },
  "beaufort-sea-state": { label: "Beaufort Scale & Sea State", route: "/weather/beaufort" },
  "marine-forecasts": { label: "Marine Forecasts", route: "/weather/forecasts" },
  "fog-visibility": { label: "Fog & Visibility", route: "/weather/fog" },
} as const;

export type WeatherLeafId = keyof typeof WEATHER_LEAF_REVIEW;

export type WeatherLeafResult = {
  readonly id: WeatherLeafId;
  readonly label: string;
  readonly route: string;
  readonly correct: number;
  readonly assessed: number;
  readonly total: number;
  readonly missed: readonly Question[];
};

export const buildWeatherLeafResults = (
  questions: readonly Question[],
  answers: readonly (number | null)[],
): readonly WeatherLeafResult[] => Object.entries(WEATHER_LEAF_REVIEW).map(([id, meta]) => {
  const entries = questions.map((question, index) => ({ question, answer: answers[index] }))
    .filter(({ question }) => question.leaf === id);
  return {
    id: id as WeatherLeafId,
    ...meta,
    total: entries.length,
    assessed: entries.filter(({ answer }) => answer !== null).length,
    correct: entries.filter(({ question, answer }) => answer === question.correctAnswer).length,
    missed: entries.filter(({ question, answer }) => answer !== question.correctAnswer).map(({ question }) => question),
  };
});

export const weatherResultMessage = (percentage: number): { heading: string; detail: string } => {
  if (percentage === 100) return { heading: "Mastery demonstrated", detail: "You demonstrated every assessed Meteorology objective in this attempt." };
  if (percentage >= 85) return { heading: "Strong performance", detail: "You passed comfortably, with a few objectives still worth reviewing before relying on this knowledge." };
  if (percentage >= 70) return { heading: "Minimum pass reached", detail: "This meets the quiz pass threshold, but it is not yet evidence of broad Meteorology mastery." };
  return { heading: "More review needed", detail: "This attempt did not reach the minimum pass threshold. Review the missed objectives, then retry." };
};
