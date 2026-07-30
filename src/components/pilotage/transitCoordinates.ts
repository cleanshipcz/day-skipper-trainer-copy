import type { MarkerPosition } from "./transitScenarios";

export interface ChartRect {
  readonly left: number;
  readonly top: number;
  readonly width: number;
  readonly height: number;
}

export const clientPointToChart = (
  clientX: number,
  clientY: number,
  rect: ChartRect,
  chartWidth: number,
  chartHeight: number,
): MarkerPosition => {
  const scaleX = rect.width > 0 ? chartWidth / rect.width : 1;
  const scaleY = rect.height > 0 ? chartHeight / rect.height : 1;
  return {
    x: Math.max(0, Math.min(chartWidth, (clientX - rect.left) * scaleX)),
    y: Math.max(0, Math.min(chartHeight, (clientY - rect.top) * scaleY)),
  };
};
