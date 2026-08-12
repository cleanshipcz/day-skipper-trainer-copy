import { abandonShipSteps, actionsInRaftSteps, boardingProcedureSteps, deploymentProcedureSteps, type ProcedureStep } from "./lifeRaftProcedures";

export type Dependency = { readonly before: string; readonly after: string; readonly reason: string };
export type DrillScenario = { readonly id: string; readonly title: string; readonly context: string; readonly steps: readonly ProcedureStep[]; readonly dependencies: readonly Dependency[] };
const byId = (steps: readonly ProcedureStep[], id: string) => {
  const step = steps.find((candidate) => candidate.id === id);
  if (!step) throw new Error(`Missing reviewed life-raft procedure step: ${id}`);
  return step;
};

// Action wording is consumed from #344's review-gated model. This drill only
// adds context dependencies; actions without an edge may occur in either order.
export const ABANDON_SHIP_SCENARIOS: readonly DrillScenario[] = [
  { id: "fast-fire", title: "Fast-moving fire", context: "Fire is spreading near the stern; the crew are together and the raft is at the bow.", steps: [byId(abandonShipSteps, "alarm"), byId(abandonShipSteps, "distress"), byId(abandonShipSteps, "protect"), byId(abandonShipSteps, "deploy")], dependencies: [
    { before: "alarm", after: "deploy", reason: "Account for the crew and protect the escape route before committing people to the raft." },
    { before: "protect", after: "deploy", reason: "Lifejackets and immediately available protection must be donned before boarding." },
  ] },
  { id: "sinking-manual", title: "Flooding vessel, manual-launch raft", context: "Flooding and sinking risk are worsening in rough weather, but the escape route and designated painter strong point remain safely accessible. Follow the exact manual-launch installation instructions without delaying escape if conditions change.", steps: [byId(deploymentProcedureSteps, "assess"), byId(deploymentProcedureSteps, "secure"), byId(deploymentProcedureSteps, "launch"), byId(deploymentProcedureSteps, "inflate"), byId(deploymentProcedureSteps, "inspect")], dependencies: [
    { before: "assess", after: "secure", reason: "Check wind, sea, list, obstructions and vessel drift before using the manual-launch arrangement." },
    { before: "secure", after: "launch", reason: "For this manual installation, secure the painter to its designated strong point before launching; an approved automatic-launch arrangement may differ." },
    { before: "launch", after: "inflate", reason: "The raft must be launched clear before operating its labelled inflation system." },
    { before: "inflate", after: "inspect", reason: "Inflation and orientation can only be confirmed after inflation is initiated." },
  ] },
  { id: "casualty-boarding", title: "Injured crew in heavy weather", context: "One crew member is injured. Direct dry boarding remains practicable and capable crew are available to assist.", steps: [byId(boardingProcedureSteps, "dry"), byId(boardingProcedureSteps, "assist"), byId(boardingProcedureSteps, "distribute"), byId(boardingProcedureSteps, "account")], dependencies: [
    { before: "dry", after: "distribute", reason: "Board directly where practicable before distributing occupants in the raft." },
    { before: "assist", after: "account", reason: "Assist the casualty using the practised crew plan before the final headcount." },
    { before: "distribute", after: "account", reason: "Stabilise and distribute the boarded crew before confirming everyone is accounted for." },
  ] },
  { id: "cold-wait", title: "Cold-weather rescue wait", context: "Everyone is aboard in cold weather; rescue has been alerted and the raft equipment pack is intact.", steps: [byId(actionsInRaftSteps, "account"), byId(actionsInRaftSteps, "stabilise"), byId(actionsInRaftSteps, "dry"), byId(actionsInRaftSteps, "inventory"), byId(actionsInRaftSteps, "signal")], dependencies: [
    { before: "account", after: "inventory", reason: "Treat urgent injuries and account for people before planning supplies." },
    { before: "stabilise", after: "inventory", reason: "Stabilise the raft before making the situation-specific ration plan." },
    { before: "dry", after: "inventory", reason: "Protect occupants from exposure before the non-urgent inventory." },
  ] },
];

export const ABANDON_SHIP_EVIDENCE_KEY = "life-raft-context-drill-v2";
export type DrillEvidence = { readonly masteredScenarioIds: readonly string[]; readonly completedAt: string | null };
const isIsoInstant = (value: unknown): value is string => typeof value === "string" && !Number.isNaN(Date.parse(value)) && new Date(value).toISOString() === value;
export const hasAllScenarioEvidence = (ids: readonly string[]) => ABANDON_SHIP_SCENARIOS.every((scenario) => ids.includes(scenario.id));
export const parseDrillEvidence = (raw: string | null): DrillEvidence => {
  try {
    const value = JSON.parse(raw ?? "null");
    if (value?.version !== 2 || !Array.isArray(value.masteredScenarioIds)) return { masteredScenarioIds: [], completedAt: null };
    const known = new Set(ABANDON_SHIP_SCENARIOS.map((scenario) => scenario.id));
    const masteredScenarioIds = [...new Set(value.masteredScenarioIds.filter((id: unknown): id is string => typeof id === "string" && known.has(id)))];
    return { masteredScenarioIds, completedAt: hasAllScenarioEvidence(masteredScenarioIds) && isIsoInstant(value.completedAt) ? value.completedAt : null };
  } catch { return { masteredScenarioIds: [], completedAt: null }; }
};
export const findDependencyViolations = (steps: readonly ProcedureStep[], dependencies: readonly Dependency[]) => {
  const positions = new Map(steps.map((step, index) => [step.id, index]));
  return dependencies.filter(({ before, after }) => (positions.get(before) ?? Infinity) > (positions.get(after) ?? -1));
};
export const getDrillStep = (scenario: DrillScenario, id: string) => byId(scenario.steps, id);
