import { forecastAreas, type ForecastArea } from "@/data/forecastAreas";

export type ForecastPrompt = { question: string; explanation: string };

export const shuffledForecastAreas = (random: () => number = Math.random): ForecastArea[] => {
  const result = [...forecastAreas];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapWith = Math.floor(random() * (index + 1));
    [result[index], result[swapWith]] = [result[swapWith], result[index]];
  }
  return result;
};

export const forecastPrompt = (area: ForecastArea, index: number): ForecastPrompt => {
  const neighbours = area.neighbours;
  if (index % 3 === 1 && neighbours.length >= 2) return {
    question: `Which area shares boundaries with ${neighbours[0]} and ${neighbours[1]}?`,
    explanation: `${area.name} borders both ${neighbours[0]} and ${neighbours[1]}. ${area.description}.`,
  };
  if (index % 3 === 2 && neighbours.length >= 2) return {
    question: `A passage runs from ${neighbours[0]}, through one forecast area, then into ${neighbours.at(-1)}. Which intermediate area fits?`,
    explanation: `${area.name} connects ${neighbours[0]} to ${neighbours.at(-1)}. ${area.description}.`,
  };
  return {
    question: `Which forecast area is described as: “${area.description}”?`,
    explanation: `${area.name} is ${area.description.toLowerCase()}; its adjacent areas include ${neighbours.slice(0, 3).join(", ")}.`,
  };
};
