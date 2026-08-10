export interface BeaufortLevel {
  force: number;
  knots: string;
  minKnots: number;
  maxKnots: number;
  description: string;
  seaState: string;
  probableWaveHeight: string | null;
  probableMaximumWaveHeight: string | null;
}

export const BEAUFORT_SCALE_SOURCE = {
  name: "Met Office: Beaufort wind force scale",
  url: "https://weather.metoffice.gov.uk/guides/coast-and-sea/beaufort-scale",
} as const;

export const beaufortScale: readonly BeaufortLevel[] = [
  { force: 0, knots: "<1", minKnots: 0, maxKnots: 0, description: "Calm", seaState: "Calm (glassy)", probableWaveHeight: null, probableMaximumWaveHeight: null },
  { force: 1, knots: "1–3", minKnots: 1, maxKnots: 3, description: "Light air", seaState: "Calm (rippled)", probableWaveHeight: "0.1 m", probableMaximumWaveHeight: "0.1 m" },
  { force: 2, knots: "4–6", minKnots: 4, maxKnots: 6, description: "Light breeze", seaState: "Smooth (wavelets)", probableWaveHeight: "0.2 m", probableMaximumWaveHeight: "0.3 m" },
  { force: 3, knots: "7–10", minKnots: 7, maxKnots: 10, description: "Gentle breeze", seaState: "Slight", probableWaveHeight: "0.6 m", probableMaximumWaveHeight: "1.0 m" },
  { force: 4, knots: "11–16", minKnots: 11, maxKnots: 16, description: "Moderate breeze", seaState: "Slight–moderate", probableWaveHeight: "1.0 m", probableMaximumWaveHeight: "1.5 m" },
  { force: 5, knots: "17–21", minKnots: 17, maxKnots: 21, description: "Fresh breeze", seaState: "Moderate", probableWaveHeight: "2.0 m", probableMaximumWaveHeight: "2.5 m" },
  { force: 6, knots: "22–27", minKnots: 22, maxKnots: 27, description: "Strong breeze", seaState: "Rough", probableWaveHeight: "3.0 m", probableMaximumWaveHeight: "4.0 m" },
  { force: 7, knots: "28–33", minKnots: 28, maxKnots: 33, description: "Near gale", seaState: "Rough–very rough", probableWaveHeight: "4.0 m", probableMaximumWaveHeight: "5.5 m" },
  { force: 8, knots: "34–40", minKnots: 34, maxKnots: 40, description: "Gale", seaState: "Very rough–high", probableWaveHeight: "5.5 m", probableMaximumWaveHeight: "7.5 m" },
  { force: 9, knots: "41–47", minKnots: 41, maxKnots: 47, description: "Severe gale", seaState: "High", probableWaveHeight: "7.0 m", probableMaximumWaveHeight: "10.0 m" },
  { force: 10, knots: "48–55", minKnots: 48, maxKnots: 55, description: "Storm", seaState: "Very high", probableWaveHeight: "9.0 m", probableMaximumWaveHeight: "12.5 m" },
  { force: 11, knots: "56–63", minKnots: 56, maxKnots: 63, description: "Violent storm", seaState: "Very high", probableWaveHeight: "11.5 m", probableMaximumWaveHeight: "16.0 m" },
  { force: 12, knots: "64+", minKnots: 64, maxKnots: Number.POSITIVE_INFINITY, description: "Hurricane force", seaState: "Phenomenal", probableWaveHeight: "14 m+", probableMaximumWaveHeight: null },
];

export const normalizeWindSpeed = (knots: number): number | undefined =>
  Number.isFinite(knots) && knots >= 0 ? Math.round(knots) : undefined;

export const forceForWindSpeed = (knots: number): BeaufortLevel | undefined => {
  const normalizedKnots = normalizeWindSpeed(knots);
  return normalizedKnots === undefined
    ? undefined
    : [...beaufortScale].reverse().find((level) => normalizedKnots >= level.minKnots);
};

export const conditionsForForce = (force: number): BeaufortLevel | undefined =>
  beaufortScale.find((level) => level.force === force);
