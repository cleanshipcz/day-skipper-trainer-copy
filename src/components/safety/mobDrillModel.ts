import { MOB_THEORY_OUTCOMES } from "@/data/mobGuidance";

export type MobDrillStep = { id: string; text: string; role: string; phase: number; outcome: typeof MOB_THEORY_OUTCOMES[number] };
type Scenario = { title: string; description: string; steps: readonly MobDrillStep[] };
export const MOB_DRILL_CONTRACT_REVISION = 1;
export const MOB_DRILL_STORAGE_KEY = "day-skipper:mob-drill:evidence:v1";
export const MOB_DRILL_SCENARIOS = {
  immediate: { title: "Immediate response and delegated roles", description: "Put the helm's immediate control action first, then group the jobs that available crew carry out concurrently. Jobs within the same group can be in any order.", steps: [
    { id: "helm", text: "Take immediate control of course and speed; prevent a second casualty", role: "Helm", phase: 0, outcome: "vessel-control-and-crew-roles" },
    { id: "alarm", text: "Shout ‘Man overboard’ and alert everyone", role: "First witness", phase: 1, outcome: "alarm-flotation-mark-spotter" },
    { id: "flotation", text: "Throw flotation and visible markers", role: "Available crew", phase: 1, outcome: "alarm-flotation-mark-spotter" },
    { id: "spotter", text: "Point continuously; do not give the spotter another job", role: "Dedicated spotter", phase: 1, outcome: "alarm-flotation-mark-spotter" },
    { id: "mark", text: "Press the electronic MOB mark while keeping visual contact", role: "Available crew", phase: 1, outcome: "alarm-flotation-mark-spotter" },
    { id: "distress", text: "Send the appropriate distress alert and coordinate help", role: "Delegated communicator", phase: 1, outcome: "distress-and-coordination" },
    { id: "recovery", text: "Prepare the vessel's practised recovery point and equipment", role: "Delegated recovery crew", phase: 1, outcome: "secure-and-lift" },
  ] },
  approach: { title: "Return, approach and recovery decisions", description: "Order the decision boundaries. This is not a universal track, approach side, distance or engine setting; adapt each boundary to the vessel and conditions.", steps: [
    { id: "contact", text: "Maintain contact, the electronic mark and vessel control", role: "Helm + spotter", phase: 0, outcome: "vessel-control-and-crew-roles" },
    { id: "select", text: "Select a practised return that fits vessel, weather, traffic, crew and sea room", role: "Skipper/helm", phase: 1, outcome: "vessel-dependent-return-and-approach" },
    { id: "brief", text: "Brief roles; prepare recovery equipment and a safe lifting plan", role: "Skipper + recovery crew", phase: 2, outcome: "secure-and-lift" },
    { id: "approach", text: "Approach under control; abort early and reset if unstable", role: "Helm", phase: 3, outcome: "vessel-dependent-return-and-approach" },
    { id: "propeller", text: "Before propeller exposure, keep people and lines clear and neutralise or stop as control allows", role: "Helm + recovery crew", phase: 4, outcome: "propeller-exclusion" },
    { id: "secure", text: "Secure with rated compatible equipment, recover, give aftercare and escalate help", role: "Recovery crew + communicator", phase: 5, outcome: "cold-incapacitated-recovery-and-aftercare" },
  ] },
} as const satisfies Record<string, Scenario>;
export type MobDrillScenarioKey = keyof typeof MOB_DRILL_SCENARIOS;
export const isValidMobDrillOrder = (steps: readonly MobDrillStep[]) => steps.every((step, index) => index === 0 || steps[index - 1].phase <= step.phase);
export const shuffleMobDrillSteps = (steps: readonly MobDrillStep[], random = Math.random) => {
  const shuffled = [...steps];
  for (let i = shuffled.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]; }
  if (isValidMobDrillOrder(shuffled)) [shuffled[0], shuffled[shuffled.length - 1]] = [shuffled[shuffled.length - 1], shuffled[0]];
  return shuffled;
};
type Evidence = { revision: number; completedScenarioIds: MobDrillScenarioKey[]; lastCompletedAt: string; attempts: number; claim: "practice-completed-not-mastery" };
export const saveMobDrillEvidence = (scenario: MobDrillScenarioKey) => {
  try {
    const prior = JSON.parse(localStorage.getItem(MOB_DRILL_STORAGE_KEY) ?? "null") as Partial<Evidence> | null;
    const completed = new Set<MobDrillScenarioKey>(prior?.revision === MOB_DRILL_CONTRACT_REVISION && Array.isArray(prior.completedScenarioIds) ? prior.completedScenarioIds.filter((id): id is MobDrillScenarioKey => id in MOB_DRILL_SCENARIOS) : []);
    completed.add(scenario);
    const evidence: Evidence = { revision: MOB_DRILL_CONTRACT_REVISION, completedScenarioIds: [...completed], lastCompletedAt: new Date().toISOString(), attempts: (prior?.revision === MOB_DRILL_CONTRACT_REVISION && typeof prior.attempts === "number" ? prior.attempts : 0) + 1, claim: "practice-completed-not-mastery" };
    localStorage.setItem(MOB_DRILL_STORAGE_KEY, JSON.stringify(evidence)); return true;
  } catch { return false; }
};
