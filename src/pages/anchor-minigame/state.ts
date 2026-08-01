export type Condition = "mild" | "moderate" | "strong";

export interface AnchorScenario {
  id: number;
  title: string;
  condition: Condition;
  depth: number;
  bowHeight: number;
  note: string;
}

export interface AnchorGameState {
  boatX: number;
  cameraOrigin: number;
  rode: number;
  anchorOnBottom: boolean;
  anchorX: number | null;
}

export const WORLD_LENGTH = 42;
export const BOAT_LENGTH = 8;
export const MOVE_STEP = 0.8;
export const RODE_STEP = 1;
export const MAX_RODE = 120;
export const BOW_ATTACH_OFFSET = 0.3;

export const CONDITION_SCOPE: Record<Condition, number> = {
  mild: 4,
  moderate: 5,
  strong: 7,
};

export const createInitialState = (): AnchorGameState => {
  const boatX = WORLD_LENGTH / 2 - BOAT_LENGTH / 2;
  return {
    boatX,
    cameraOrigin: boatX + BOAT_LENGTH / 2 - WORLD_LENGTH / 2,
    rode: 0,
    anchorOnBottom: false,
    anchorX: null,
  };
};

export const getTotalDepth = (scenario: Pick<AnchorScenario, "depth" | "bowHeight">) =>
  scenario.depth + scenario.bowHeight;

export const getTargetRode = (scenario: AnchorScenario) =>
  CONDITION_SCOPE[scenario.condition] * getTotalDepth(scenario);

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
    state: { ...state, boatX, cameraOrigin },
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
        state: { ...state, rode: proposed, anchorOnBottom: true, anchorX: bowAttachX },
        status: "Anchor just touched the seabed — it will stay put now.",
        event: "anchor-bottom",
      };
    }
    return { state: { ...state, rode: proposed }, status: "" };
  }

  if (state.anchorX !== null) {
    const horizontal = Math.abs(state.anchorX - bowAttachX);
    const minRode = Math.hypot(totalDepth, horizontal);
    if (proposed < minRode && horizontal > 0.6) {
      return {
        state: { ...state, rode: minRode },
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
        },
        status: "Anchor coming up — keep heaving.",
      };
    }
  }
  return { state: { ...state, rode: proposed }, status: "" };
};

export interface PlacementResult {
  type: "success" | "failure";
  message: string;
  status: string;
  issues: readonly ("procedure" | "scope")[];
}

export const checkPlacement = (state: AnchorGameState, scenario: AnchorScenario): PlacementResult => {
  const issues: string[] = [];
  const bowTipX = state.boatX + BOAT_LENGTH;
  const targetRode = getTargetRode(scenario);
  const totalDepth = getTotalDepth(scenario);

  if (!state.anchorOnBottom || state.anchorX === null) issues.push("anchor never made it to the seabed");
  if (state.anchorOnBottom && state.anchorX !== null && state.anchorX - bowTipX <= 0.5) {
    issues.push("anchor ended up under/behind the bow");
  }
  if (state.rode < targetRode) issues.push(`scope short by ${(targetRode - state.rode).toFixed(1)}m`);

  if (issues.length === 0) {
    return {
      type: "success",
      message: `Scope ${(state.rode / totalDepth).toFixed(1)}x with ${state.rode.toFixed(1)}m out.`,
      status: "Secure: anchor is ahead with enough scope.",
      issues: [],
    };
  }
  return {
    type: "failure",
    message: issues.join(" • "),
    status: "Adjust and try again — keep anchor ahead with enough chain.",
    issues: [
      ...(!state.anchorOnBottom || state.anchorX === null || (state.anchorX - bowTipX <= 0.5) ? ["procedure" as const] : []),
      ...(state.rode < targetRode ? ["scope" as const] : []),
    ],
  };
};
