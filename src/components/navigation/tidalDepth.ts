export interface TidalDepthScenario {
  id: string;
  tide: number;
  chartValue: number;
  feature: "sounding" | "drying";
}

export const waterOverFeature = (scenario: TidalDepthScenario) =>
  scenario.feature === "sounding" ? scenario.tide + scenario.chartValue : scenario.tide - scenario.chartValue;

export const validateDepthAnswer = (raw: string, expected: number): string | null => {
  if (!raw.trim()) return "Enter a value before checking.";
  const value = Number(raw);
  if (!Number.isFinite(value)) return "Enter a finite number.";
  if (value < 0) return "Water depth cannot be negative. If the feature is uncovered, enter 0 and report the dry height.";
  if (value > 30) return "That value is not plausible for this diagram; check the operation and units.";
  if (!/^\d+(?:\.\d)?$/.test(raw.trim())) return "Give the answer to one decimal place at most.";
  if (Math.abs(value - Math.max(0, expected)) > 0.05) return "Not yet. Recheck whether the charted value is added or subtracted.";
  return null;
};
