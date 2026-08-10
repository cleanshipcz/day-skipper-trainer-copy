import { forecastAreas, type ForecastArea } from "@/data/forecastAreas";

export type ForecastPrompt = {
  question: string;
  explanation: string;
  kind: "description" | "boundary" | "passage";
  validAreaNames: readonly string[];
};

export const areasBetween = (first: string, second: string): ForecastArea[] =>
  forecastAreas.filter(({ neighbours }) => neighbours.includes(first) && neighbours.includes(second));

const uniqueNeighbourPair = (area: ForecastArea): readonly [string, string] | undefined => {
  for (let first = 0; first < area.neighbours.length - 1; first += 1) {
    for (let second = first + 1; second < area.neighbours.length; second += 1) {
      const pair = [area.neighbours[first], area.neighbours[second]] as const;
      const matches = areasBetween(...pair);
      if (matches.length === 1 && matches[0].name === area.name) return pair;
    }
  }
  return undefined;
};

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
  const pair = uniqueNeighbourPair(area);
  if (index % 3 === 1 && pair) return {
    question: `Which area shares boundaries with ${pair[0]} and ${pair[1]}?`,
    explanation: `${area.name} is the only forecast area bordering both ${pair[0]} and ${pair[1]}. ${area.description}.`,
    kind: "boundary",
    validAreaNames: areasBetween(...pair).map(({ name }) => name),
  };
  if (index % 3 === 2 && pair) return {
    question: `A passage runs from ${pair[0]}, through one forecast area, then into ${pair[1]}. Which unique intermediate area fits?`,
    explanation: `${area.name} is the only forecast area connecting ${pair[0]} to ${pair[1]}. ${area.description}.`,
    kind: "passage",
    validAreaNames: areasBetween(...pair).map(({ name }) => name),
  };
  return {
    question: `Which forecast area is described as: “${area.description}”?`,
    explanation: `${area.name} is ${area.description.toLowerCase()}; its adjacent areas include ${neighbours.slice(0, 3).join(", ")}.`,
    kind: "description",
    validAreaNames: forecastAreas.filter(({ description }) => description === area.description).map(({ name }) => name),
  };
};
