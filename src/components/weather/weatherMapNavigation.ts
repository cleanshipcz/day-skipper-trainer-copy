import { forecastAreas, type ForecastArea } from "@/data/forecastAreas";

export type ArrowKey = "ArrowUp" | "ArrowDown" | "ArrowLeft" | "ArrowRight";

/** Chooses an adjacent sea area in the requested map direction, with a stable
 * nearest-area fallback for edge data. This keeps keyboard travel spatial. */
export const areaInDirection = (current: ForecastArea, key: ArrowKey): ForecastArea => {
  const [x, y] = current.label;
  const vector = key === "ArrowLeft" ? [-1, 0] : key === "ArrowRight" ? [1, 0] : key === "ArrowUp" ? [0, -1] : [0, 1];
  const neighbours = forecastAreas.filter((area) => current.neighbours.includes(area.name));
  const candidates = neighbours.filter((area) => {
    const dx = area.label[0] - x;
    const dy = area.label[1] - y;
    return dx * vector[0] + dy * vector[1] > 0;
  });
  const pool = candidates.length ? candidates : forecastAreas.filter((area) => {
    const dx = area.label[0] - x;
    const dy = area.label[1] - y;
    return dx * vector[0] + dy * vector[1] > 0;
  });
  return pool.reduce((best, area) => {
    const dx = area.label[0] - x;
    const dy = area.label[1] - y;
    const forward = Math.abs(dx * vector[0] + dy * vector[1]);
    const sideways = Math.abs(dx * vector[1] - dy * vector[0]);
    const score = forward + sideways * 2;
    const bestDx = best.label[0] - x;
    const bestDy = best.label[1] - y;
    const bestScore = Math.abs(bestDx * vector[0] + bestDy * vector[1]) + Math.abs(bestDx * vector[1] - bestDy * vector[0]) * 2;
    return score < bestScore ? area : best;
  }, pool[0] ?? current);
};
