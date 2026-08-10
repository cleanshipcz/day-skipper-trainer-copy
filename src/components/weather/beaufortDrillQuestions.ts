import { beaufortScale, type BeaufortLevel } from "@/data/beaufortScale";

export type RecallDirection = "speed" | "sea";
export type DrillQuestion = { id: string; direction: RecallDirection; level: BeaufortLevel; cue: string };

const height = (value: string | null) => value ?? "not specified";

export const seaRecallCue = (level: BeaufortLevel) =>
  `${level.seaState}; probable wave height ${height(level.probableWaveHeight)}; probable maximum ${height(level.probableMaximumWaveHeight)}`;

export const beaufortDrillQuestions: readonly DrillQuestion[] = beaufortScale.flatMap((level) => [
  { id: `speed-${level.force}`, direction: "speed" as const, level, cue: `${level.knots} knots` },
  { id: `sea-${level.force}`, direction: "sea" as const, level, cue: seaRecallCue(level) },
]);
