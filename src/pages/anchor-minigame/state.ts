export interface AnchorScenario {
  id: number;
  identity: string;
  seed: number;
  cycle: number;
  family: AnchorScenarioFamily;
  windDirection: string;
  title: string;
  condition: "mild" | "moderate" | "strong";
  depth: number;
  tideRise: number;
  bowHeight: number;
  note: string;
  rode: string;
  anchorAndVessel: string;
  seabed: string;
  minimumRode: number;
  availableSwingRadius: number;
  vesselExtent: number;
  safetyAllowance: number;
  hazards: readonly { label: string; distance: number; clearance: number; bearing: number }[];
  neighbours: readonly { label: string; distance: number; swingRadius: number; bearing: number }[];
  weakHolding: boolean;
  minimumSetDistance: number;
  minimumSetLoadSteps: number;
  guidance: string;
  basis: readonly string[];
}

export type AnchorScenarioFamily = "sheltered" | "harbour" | "exposed" | "tidal";

export type AnchorScenarioTemplate = Omit<AnchorScenario, "id" | "identity" | "seed" | "cycle">;

const hashSeed = (value: string) => {
  let hash = 2166136261;
  for (const character of value) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};

export const normaliseScenarioSeed = (value: string | null | undefined) => {
  if (!value) return 1;
  const numeric = Number(value);
  return Number.isSafeInteger(numeric) && numeric >= 0 ? numeric >>> 0 : hashSeed(value);
};

const seededValue = (seed: number, index: number) => {
  let value = (seed + Math.imul(index + 1, 0x9e3779b1)) >>> 0;
  value ^= value >>> 16;
  value = Math.imul(value, 0x21f0aaad);
  value ^= value >>> 15;
  value = Math.imul(value, 0x735a2d97);
  return (value ^ (value >>> 15)) >>> 0;
};

const getShuffledScenarioFamilies = (seed: number, cycle: number) => {
  const families: AnchorScenarioFamily[] = ["sheltered", "harbour", "exposed", "tidal"];
  // Seed zero is the documented baseline fixture used by examples and browser characterization.
  if (seed === 0 && cycle === 0) return families;
  for (let index = families.length - 1; index > 0; index -= 1) {
    const swap = seededValue(seed, cycle * families.length + index) % (index + 1);
    [families[index], families[swap]] = [families[swap], families[index]];
  }
  return families;
};

export const getScenarioFamilyOrder = (seed: number, cycle: number): AnchorScenarioFamily[] => {
  const families = getShuffledScenarioFamilies(seed, cycle);
  if (cycle > 0) {
    // Boundary correction only swaps the first two entries, so it never changes
    // the previous cycle's last entry. Reading its raw shuffle avoids recursion.
    const previousLast = getShuffledScenarioFamilies(seed, cycle - 1).at(-1);
    if (families[0] === previousLast) [families[0], families[1]] = [families[1], families[0]];
  }
  return families;
};

export const createScenario = (
  templates: readonly AnchorScenarioTemplate[], seed: number, sequenceIndex: number,
): AnchorScenario => {
  if (templates.length === 0) throw new Error("At least one anchor scenario template is required");
  const cycle = Math.floor(sequenceIndex / templates.length);
  const position = sequenceIndex % templates.length;
  const family = getScenarioFamilyOrder(seed, cycle)[position];
  const template = templates.find((candidate) => candidate.family === family);
  if (!template) throw new Error(`Missing anchor scenario family: ${family}`);
  const identity = `anchor-${seed.toString(36)}-${cycle + 1}-${position + 1}-${family}`;
  return { ...template, seed, cycle: cycle + 1, identity, id: hashSeed(identity) };
};

export interface AnchorGameState {
  boatX: number;
  cameraOrigin: number;
  rode: number;
  anchorOnBottom: boolean;
  anchorX: number | null;
  setLoadSteps: number;
  holdingObservationStartedAt: number | null;
  holdingReferenceBowX: number | null;
  conditionsChanged: boolean;
  anchorWatchComplete: boolean;
  dragging: boolean;
  holdingRemediated: boolean;
  recoveryStage: "none" | "engine-support" | "recovered";
}

export const WORLD_LENGTH = 42;
export const BOAT_LENGTH = 8;
export const MOVE_STEP = 0.8;
export const RODE_STEP = 1;
export const MAX_RODE = 120;
export const BOW_ATTACH_OFFSET = 0.3;
export const HOLDING_OBSERVATION_MS = 5_000;

export const createInitialState = (): AnchorGameState => {
  const boatX = WORLD_LENGTH / 2 - BOAT_LENGTH / 2;
  return {
    boatX,
    cameraOrigin: boatX + BOAT_LENGTH / 2 - WORLD_LENGTH / 2,
    rode: 0,
    anchorOnBottom: false,
    anchorX: null,
    setLoadSteps: 0,
    holdingObservationStartedAt: null,
    holdingReferenceBowX: null,
    conditionsChanged: false,
    anchorWatchComplete: false,
    dragging: false,
    holdingRemediated: false,
    recoveryStage: "none",
  };
};

export const getCurrentVerticalDistance = (scenario: Pick<AnchorScenario, "depth" | "bowHeight">) =>
  scenario.depth + scenario.bowHeight;

export const getMaximumVerticalDistance = (scenario: Pick<AnchorScenario, "depth" | "tideRise" | "bowHeight">) =>
  getCurrentVerticalDistance(scenario) + scenario.tideRise;

export const getPlannedSwingRadius = (rode: number, scenario: AnchorScenario) => {
  const maximumDepth = getMaximumVerticalDistance(scenario);
  const horizontalReach = rode >= maximumDepth ? Math.sqrt(rode ** 2 - maximumDepth ** 2) : 0;
  return horizontalReach + scenario.vesselExtent;
};

export const getSweptRadius = (rode: number, scenario: AnchorScenario) =>
  getPlannedSwingRadius(rode, scenario) + scenario.safetyAllowance;

export const getClearanceFailures = (rode: number, scenario: AnchorScenario) => {
  const sweptRadius = getSweptRadius(rode, scenario);
  const failures: string[] = [];
  if (sweptRadius > scenario.availableSwingRadius) failures.push(`room boundary by ${(sweptRadius - scenario.availableSwingRadius).toFixed(1)}m`);
  for (const hazard of scenario.hazards) {
    const available = hazard.distance - hazard.clearance;
    if (sweptRadius > available) failures.push(`${hazard.label} safety zone by ${(sweptRadius - available).toFixed(1)}m`);
  }
  for (const neighbour of scenario.neighbours) {
    const required = sweptRadius + neighbour.swingRadius;
    if (required > neighbour.distance) failures.push(`${neighbour.label} swing envelope by ${(required - neighbour.distance).toFixed(1)}m`);
  }
  return failures;
};

export const getTargetRode = (scenario: AnchorScenario) => scenario.minimumRode;

export const getHorizontalAllowance = (state: AnchorGameState, totalDepth: number) =>
  state.anchorOnBottom && state.rode >= totalDepth
    ? Math.sqrt(Math.max(state.rode ** 2 - totalDepth ** 2, 0))
    : 0;

export interface TransitionResult {
  state: AnchorGameState;
  status: string;
  event?: "anchor-bottom";
}

export const moveBoat = (
  state: AnchorGameState,
  direction: -1 | 1,
  totalDepth: number,
): TransitionResult => {
  let boatX = state.boatX + direction * MOVE_STEP;
  const allowance = getHorizontalAllowance(state, totalDepth);

  if (state.anchorOnBottom && state.anchorX !== null && allowance) {
    const candidateBow = boatX + BOAT_LENGTH - BOW_ATTACH_OFFSET;
    const limitedBow = Math.min(
      Math.max(candidateBow, state.anchorX - allowance),
      state.anchorX + allowance,
    );
    boatX = limitedBow - (BOAT_LENGTH - BOW_ATTACH_OFFSET);
  }

  const viewLeft = state.cameraOrigin;
  const viewRight = state.cameraOrigin + WORLD_LENGTH;
  const nextBowTip = boatX + BOAT_LENGTH;
  const leftMargin = viewLeft + WORLD_LENGTH * 0.25;
  const rightMargin = viewRight - WORLD_LENGTH * 0.25;
  let cameraOrigin = state.cameraOrigin;

  if (nextBowTip > rightMargin) cameraOrigin = nextBowTip - WORLD_LENGTH * 0.75;
  else if (boatX < leftMargin) cameraOrigin = boatX - WORLD_LENGTH * 0.25;

  return {
    state: {
      ...state,
      boatX,
      cameraOrigin,
      setLoadSteps: 0,
      holdingObservationStartedAt: null,
      holdingReferenceBowX: null,
      anchorWatchComplete: false,
      conditionsChanged: false,
    },
    status: direction === -1 ? "Drifting back from the anchor" : "Motoring ahead over the anchor",
  };
};

export const changeRode = (
  state: AnchorGameState,
  delta: number,
  totalDepth: number,
): TransitionResult => {
  const proposed = Math.min(Math.max(state.rode + delta, 0), MAX_RODE);
  const bowAttachX = state.boatX + BOAT_LENGTH - BOW_ATTACH_OFFSET;

  if (!state.anchorOnBottom) {
    if (proposed >= totalDepth) {
      return {
        state: { ...state, rode: proposed, anchorOnBottom: true, anchorX: bowAttachX, setLoadSteps: 0, holdingObservationStartedAt: null, holdingReferenceBowX: null, anchorWatchComplete: false, conditionsChanged: false },
        status: "Anchor just touched the seabed — it will stay put now.",
        event: "anchor-bottom",
      };
    }
    return { state: { ...state, rode: proposed, setLoadSteps: 0, holdingObservationStartedAt: null, holdingReferenceBowX: null, anchorWatchComplete: false, conditionsChanged: false }, status: "" };
  }

  if (state.anchorX !== null) {
    const horizontal = Math.abs(state.anchorX - bowAttachX);
    const minRode = Math.hypot(totalDepth, horizontal);
    if (proposed < minRode && horizontal > 0.6) {
      return {
        state: { ...state, rode: minRode, setLoadSteps: 0, holdingObservationStartedAt: null, holdingReferenceBowX: null, anchorWatchComplete: false, conditionsChanged: false },
        status: "Rode is taut — move the bow toward the anchor before heaving more.",
      };
    }
    if (horizontal <= 0.6 && proposed < totalDepth * 0.95) {
      return {
        state: {
          ...state,
          rode: Math.max(proposed, totalDepth * 0.85),
          anchorOnBottom: false,
          anchorX: null,
          setLoadSteps: 0,
          holdingObservationStartedAt: null,
          holdingReferenceBowX: null,
          anchorWatchComplete: false,
          conditionsChanged: false,
        },
        status: "Anchor coming up — keep heaving.",
      };
    }
  }
  return { state: { ...state, rode: proposed, setLoadSteps: 0, holdingObservationStartedAt: null, holdingReferenceBowX: null, anchorWatchComplete: false, conditionsChanged: false }, status: "" };
};

export const applySettingLoad = (state: AnchorGameState, scenario: AnchorScenario): TransitionResult => {
  const bowTipX = state.boatX + BOAT_LENGTH;
  const geometryReady = state.anchorOnBottom
    && state.anchorX !== null
    && state.anchorX - bowTipX >= scenario.minimumSetDistance
    && state.rode >= scenario.minimumRode
    && getClearanceFailures(state.rode, scenario).length === 0;
  if (!geometryReady) return { state, status: "Lay out suitable rode within safe room and move astern before applying setting load." };
  const setLoadSteps = Math.min(state.setLoadSteps + 1, scenario.minimumSetLoadSteps);
  return {
    state: { ...state, setLoadSteps, holdingObservationStartedAt: null, holdingReferenceBowX: null, anchorWatchComplete: false, conditionsChanged: false },
    status: `Progressive setting load ${setLoadSteps} of ${scenario.minimumSetLoadSteps} applied within the fixture's equipment limits.`,
  };
};

export interface PlacementResult {
  type: "success" | "failure";
  message: string;
  status: string;
  issues: readonly ("procedure" | "scope" | "verification" | "watch")[];
}

export const checkPlacement = (state: AnchorGameState, scenario: AnchorScenario, now = Date.now()): PlacementResult => {
  const issues: string[] = [];
  const bowTipX = state.boatX + BOAT_LENGTH;
  const targetRode = getTargetRode(scenario);
  const maximumDepth = getMaximumVerticalDistance(scenario);
  const clearanceFailures = getClearanceFailures(state.rode, scenario);

  if (!state.anchorOnBottom || state.anchorX === null) issues.push("anchor never made it to the seabed");
  if (state.anchorOnBottom && state.anchorX !== null && state.anchorX - bowTipX <= 0.5) {
    issues.push("anchor ended up under/behind the bow");
  }
  if (state.anchorOnBottom && state.anchorX !== null && state.anchorX - bowTipX < scenario.minimumSetDistance) {
    issues.push(`controlled set short by ${(scenario.minimumSetDistance - (state.anchorX - bowTipX)).toFixed(1)}m`);
  }
  if (state.setLoadSteps < scenario.minimumSetLoadSteps) issues.push("progressive setting load not completed");
  if (state.rode < targetRode) issues.push(`scope short by ${(targetRode - state.rode).toFixed(1)}m`);
  if (clearanceFailures.length) issues.push(`full swept area conflicts with ${clearanceFailures.join(", ")}`);
  const observationComplete = state.holdingObservationStartedAt !== null
    && state.holdingReferenceBowX === state.boatX
    && now - state.holdingObservationStartedAt >= HOLDING_OBSERVATION_MS;
  if (!observationComplete) issues.push(state.holdingObservationStartedAt === null
    ? "timed fixed-position holding observation not started"
    : "holding observation still in progress");
  if (!state.conditionsChanged) issues.push("forecast wind/tide change not yet applied");
  if (!state.anchorWatchComplete) issues.push(state.dragging ? "anchor watch detected dragging" : "post-change anchor watch not completed");

  if (issues.length === 0) {
    return {
      type: "success",
      message: `Modeled checks passed at ${(state.rode / maximumDepth).toFixed(1)}:1 at maximum tide with ${state.rode.toFixed(1)}m out. Continue real holding and anchor-watch checks.`,
      status: "Placement accepted: controlled set, scenario guidance and room checks passed.",
      issues: [],
    };
  }
  return {
    type: "failure",
    message: issues.join(" • "),
    status: "Adjust and try again — use controlled deployment and the scenario's rode limits.",
    issues: [
      ...(!state.anchorOnBottom || state.anchorX === null || state.anchorX - bowTipX < scenario.minimumSetDistance || state.setLoadSteps < scenario.minimumSetLoadSteps ? ["procedure" as const] : []),
      ...(state.rode < targetRode || clearanceFailures.length ? ["scope" as const] : []),
      ...(!observationComplete ? ["verification" as const] : []),
      ...(!state.conditionsChanged || !state.anchorWatchComplete ? ["watch" as const] : []),
    ],
  };
};

export const startHoldingObservation = (state: AnchorGameState, now = Date.now()): AnchorGameState => ({
  ...state,
  holdingObservationStartedAt: now,
  holdingReferenceBowX: state.boatX,
});

export const applyWindTideChange = (state: AnchorGameState, scenario: AnchorScenario, now = Date.now()): TransitionResult => {
  const observationComplete = state.holdingObservationStartedAt !== null
    && state.holdingReferenceBowX === state.boatX
    && now - state.holdingObservationStartedAt >= HOLDING_OBSERVATION_MS;
  const settingComplete = state.anchorOnBottom && state.setLoadSteps >= scenario.minimumSetLoadSteps;
  if (!settingComplete || !observationComplete) {
    return { state, status: "Complete the controlled set and timed holding observation before applying the forecast change." };
  }
  return {
    state: { ...state, conditionsChanged: true, anchorWatchComplete: false },
    status: "Wind/tide change applied — repeat transit, position, depth, load and clearance checks.",
  };
};

export const runAnchorWatch = (state: AnchorGameState, scenario: AnchorScenario, now = Date.now()): TransitionResult => {
  const observationComplete = state.holdingObservationStartedAt !== null
    && state.holdingReferenceBowX === state.boatX
    && now - state.holdingObservationStartedAt >= HOLDING_OBSERVATION_MS;
  if (!state.conditionsChanged || !observationComplete) {
    return { state, status: "Complete the fixed-position observation and apply the wind/tide change before the anchor watch." };
  }
  if (scenario.weakHolding && !state.holdingRemediated) {
    return {
      state: { ...state, dragging: true, anchorWatchComplete: false, anchorX: state.anchorX === null ? null : state.anchorX + 2 },
      status: "Anchor watch detected dragging on weak holding ground — start the engine and recover under control.",
    };
  }
  return {
    state: { ...state, dragging: false, anchorWatchComplete: true },
    status: "Anchor watch complete: modeled transit, position, depth, load and swept clearance remain stable.",
  };
};

export const recoverSafely = (state: AnchorGameState): TransitionResult => {
  if (!state.dragging) return { state, status: "Safe recovery is available when holding is lost or the plan is aborted." };
  if (state.recoveryStage !== "engine-support") {
    return {
      state: { ...state, recoveryStage: "engine-support" },
      status: "Engine support established; coordinate helm and foredeck and take in slack without pulling the vessel on the windlass.",
    };
  }
  return {
    state: {
      ...createInitialState(),
      holdingRemediated: true,
      recoveryStage: "recovered",
    },
    status: "Anchor recovered under control. Re-select the position and complete a fresh deployment, set and watch.",
  };
};
