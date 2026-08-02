import type { EngineSourceId } from "./engineGuidance";

export const engineObjectives = [
  { id: "installation-authority", title: "Identify the fitted installation and authoritative procedure", theoryAnchor: "engine-objectives" },
  { id: "pre-start-evidence", title: "Inspect and record pre-start evidence", theoryAnchor: "engine-worked-routine" },
  { id: "safe-start", title: "Make the start area safe", theoryAnchor: "engine-safe-routine" },
  { id: "post-start", title: "Verify indications and cooling immediately after start", theoryAnchor: "engine-worked-routine" },
  { id: "alarm-response", title: "Protect navigation, stop and isolate on abnormal evidence", theoryAnchor: "engine-safe-routine" },
  { id: "shutdown-handover", title: "Shut down, isolate and hand over defects", theoryAnchor: "engine-worked-routine" },
  { id: "work-boundary", title: "Distinguish observation from isolated or competent-person work", theoryAnchor: "engine-component-inspections" },
  { id: "fuel-system", title: "Recognise fuel contamination and separator evidence", theoryAnchor: "engine-component-inspections" },
  { id: "belts-hoses", title: "Inspect belts and hoses without generic limits", theoryAnchor: "engine-component-inspections" },
  { id: "battery-exhaust", title: "Recognise battery, charging and exhaust hazards", theoryAnchor: "engine-component-inspections" },
  { id: "stern-gear", title: "Observe stern gear without approaching rotating machinery", theoryAnchor: "engine-component-inspections" },
  { id: "maintenance-record", title: "Plan service, pollution control and an inspectable record", theoryAnchor: "engine-preparation" },
] as const;

export type EngineObjectiveId = typeof engineObjectives[number]["id"];

export type EngineQuestionMapping = {
  objectiveId: EngineObjectiveId;
  theoryAnchor: typeof engineObjectives[number]["theoryAnchor"];
  sourceIds: readonly EngineSourceId[];
};

/** Stable assessment contract shared by topic quiz, exams and review remediation. */
export const engineQuestionMappings = {
  e13: { objectiveId: "installation-authority", theoryAnchor: "engine-objectives", sourceIds: ["rya", "yanmar-6lt"] },
  e14: { objectiveId: "pre-start-evidence", theoryAnchor: "engine-worked-routine", sourceIds: ["rya", "yanmar-8lv"] },
  e15: { objectiveId: "safe-start", theoryAnchor: "engine-safe-routine", sourceIds: ["uscg-ventilation", "rya"] },
  e16: { objectiveId: "post-start", theoryAnchor: "engine-worked-routine", sourceIds: ["rya", "yanmar-6lt"] },
  e17: { objectiveId: "alarm-response", theoryAnchor: "engine-safe-routine", sourceIds: ["yanmar-6lt", "volvo"] },
  e18: { objectiveId: "shutdown-handover", theoryAnchor: "engine-worked-routine", sourceIds: ["yanmar-6lt"] },
  e19: { objectiveId: "work-boundary", theoryAnchor: "engine-component-inspections", sourceIds: ["maib"] },
  e20: { objectiveId: "fuel-system", theoryAnchor: "engine-component-inspections", sourceIds: ["rya"] },
  e21: { objectiveId: "belts-hoses", theoryAnchor: "engine-component-inspections", sourceIds: ["yanmar-6lt"] },
  e22: { objectiveId: "battery-exhaust", theoryAnchor: "engine-component-inspections", sourceIds: ["uscg-ventilation", "volvo"] },
  e23: { objectiveId: "stern-gear", theoryAnchor: "engine-component-inspections", sourceIds: ["maib"] },
  e24: { objectiveId: "maintenance-record", theoryAnchor: "engine-preparation", sourceIds: ["rya", "yanmar-6lt"] },
} as const satisfies Readonly<Record<string, EngineQuestionMapping>>;

export type EngineQuestionId = keyof typeof engineQuestionMappings;

export const engineTheoryRoute = (questionId: string) => {
  const mapping = engineQuestionMappings[questionId as EngineQuestionId];
  return mapping ? `/engine#${mapping.theoryAnchor}` : "/engine";
};
