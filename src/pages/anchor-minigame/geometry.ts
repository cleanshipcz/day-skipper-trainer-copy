import {
  BOAT_LENGTH,
  BOW_ATTACH_OFFSET,
  WORLD_LENGTH,
  type AnchorGameState,
  type AnchorScenario,
} from "./state";

export interface AnchorSceneGeometry {
  viewWidth: number;
  viewHeight: number;
  surfaceY: number;
  seabedY: number;
  boatTopY: number;
  boatBottomY: number;
  anchorPoint: { x: number; y: number };
  chainPath: string;
  boatPath: string;
  toX: (meters: number) => number;
}

export const calculateSceneGeometry = (
  state: AnchorGameState,
  scenario: AnchorScenario,
): AnchorSceneGeometry => {
  const viewWidth = 760;
  const viewHeight = 360;
  const horizontalMargin = 28;
  const xScale = (viewWidth - horizontalMargin * 2) / WORLD_LENGTH;
  const yScale = (viewHeight - 140) / (scenario.depth + scenario.bowHeight + 1.5);
  const surfaceY = 70;
  const seabedY = surfaceY + scenario.depth * yScale;
  const boatTopY = surfaceY - 18;
  const boatBottomY = surfaceY + 10;
  const bowAttachX = state.boatX + BOAT_LENGTH - BOW_ATTACH_OFFSET;
  const anchorDepth = state.anchorOnBottom
    ? scenario.depth
    : Math.min(Math.max(state.rode - scenario.bowHeight, 0), scenario.depth);
  const toX = (meters: number) => horizontalMargin + (meters - state.cameraOrigin) * xScale;
  const toY = (meters: number) => surfaceY + meters * yScale;
  const attach = {
    x: toX(bowAttachX),
    y: surfaceY - Math.min(scenario.bowHeight * yScale, 18),
  };
  const anchorPoint = {
    x: toX(state.anchorOnBottom && state.anchorX !== null ? state.anchorX : bowAttachX),
    y: toY(anchorDepth),
  };
  const slack = Math.max(
    state.rode - Math.hypot((anchorPoint.x - attach.x) / xScale, (anchorPoint.y - attach.y) / yScale),
    0,
  );
  const direction = state.anchorX !== null ? Math.sign(state.anchorX - bowAttachX || 1) : 1;
  const saggyEnd =
    !state.anchorOnBottom || slack <= 0
      ? anchorPoint
      : { x: anchorPoint.x - direction * Math.min(slack, 30) * xScale * 0.6, y: anchorPoint.y };
  const commands: string[] = [];
  for (let index = 0; index <= 18; index += 1) {
    const progress = index / 18;
    const x = attach.x + (saggyEnd.x - attach.x) * progress;
    const baseY = attach.y + (saggyEnd.y - attach.y) * progress;
    const y = Math.min(baseY + Math.sin(Math.PI * progress) * Math.min(slack * xScale * 1.2 + 12, 260), seabedY);
    commands.push(`${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`);
  }
  if (state.anchorOnBottom && slack > 0 && saggyEnd.x !== anchorPoint.x) {
    commands.push(`L ${anchorPoint.x.toFixed(2)} ${anchorPoint.y.toFixed(2)}`);
  }

  return {
    viewWidth,
    viewHeight,
    surfaceY,
    seabedY,
    boatTopY,
    boatBottomY,
    anchorPoint,
    chainPath: commands.join(" "),
    boatPath: `
    M ${toX(state.boatX - 0.6)} ${boatTopY}
    L ${toX(state.boatX + BOAT_LENGTH + 0.6)} ${boatTopY + 6}
    L ${toX(state.boatX + BOAT_LENGTH - 0.8)} ${boatBottomY}
    L ${toX(state.boatX - 1)} ${boatBottomY}
    Z
  `,
    toX,
  };
};
