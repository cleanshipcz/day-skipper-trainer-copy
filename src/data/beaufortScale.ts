export interface BeaufortLevel {
  force: number;
  knots: string;
  minKnots: number;
  maxKnots: number;
  description: string;
  seaState: string;
  waveHeight: string;
}

export const beaufortScale: readonly BeaufortLevel[] = [
  { force: 0, knots: "<1", minKnots: 0, maxKnots: 0, description: "Calm", seaState: "Sea like a mirror", waveHeight: "0 m" },
  { force: 1, knots: "1–3", minKnots: 1, maxKnots: 3, description: "Light air", seaState: "Ripples, no foam crests", waveHeight: "0–0.1 m" },
  { force: 2, knots: "4–6", minKnots: 4, maxKnots: 6, description: "Light breeze", seaState: "Small wavelets; crests glassy", waveHeight: "0.1–0.5 m" },
  { force: 3, knots: "7–10", minKnots: 7, maxKnots: 10, description: "Gentle breeze", seaState: "Large wavelets; scattered white horses", waveHeight: "0.5–1.25 m" },
  { force: 4, knots: "11–16", minKnots: 11, maxKnots: 16, description: "Moderate breeze", seaState: "Small waves becoming longer; frequent white horses", waveHeight: "1–2.5 m" },
  { force: 5, knots: "17–21", minKnots: 17, maxKnots: 21, description: "Fresh breeze", seaState: "Moderate waves; many white horses, some spray", waveHeight: "2–4 m" },
  { force: 6, knots: "22–27", minKnots: 22, maxKnots: 27, description: "Strong breeze", seaState: "Large waves; extensive white foam crests", waveHeight: "3–5 m" },
  { force: 7, knots: "28–33", minKnots: 28, maxKnots: 33, description: "Near gale", seaState: "Sea heaps up; foam streaks downwind", waveHeight: "4–5.5 m" },
  { force: 8, knots: "34–40", minKnots: 34, maxKnots: 40, description: "Gale", seaState: "Moderately high waves; spindrift begins", waveHeight: "5.5–7.5 m" },
  { force: 9, knots: "41–47", minKnots: 41, maxKnots: 47, description: "Severe gale", seaState: "High waves; dense foam streaks; spray affects visibility", waveHeight: "7–10 m" },
  { force: 10, knots: "48–55", minKnots: 48, maxKnots: 55, description: "Storm", seaState: "Very high overhanging waves; sea white with foam", waveHeight: "9–12.5 m" },
  { force: 11, knots: "56–63", minKnots: 56, maxKnots: 63, description: "Violent storm", seaState: "Exceptionally high waves; sea covered in foam", waveHeight: "11.5–16 m" },
  { force: 12, knots: "64+", minKnots: 64, maxKnots: Number.POSITIVE_INFINITY, description: "Hurricane", seaState: "Air filled with foam and spray; sea completely white", waveHeight: "14 m+" },
];

export const forceForWindSpeed = (knots: number): BeaufortLevel | undefined =>
  Number.isFinite(knots) && knots >= 0
    ? beaufortScale.find((level) => knots >= level.minKnots && knots <= level.maxKnots)
    : undefined;

export const conditionsForForce = (force: number): BeaufortLevel | undefined =>
  beaufortScale.find((level) => level.force === force);
