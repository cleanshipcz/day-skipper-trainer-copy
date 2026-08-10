export interface Point { x: number; y: number }
export interface Landmark extends Point { id: string; name: string; magneticBearing: number }
export interface Lop { landmarkId: string; origin: Point; reciprocalBearing: number }

export const VARIATION_WEST = 5;
export const CHART_WIDTH = 800;
export const CHART_HEIGHT = 500;
export const SCENARIO_ORACLE: Readonly<Point> = Object.freeze({ x: 300, y: 300 });
export const FIX_TOLERANCE = 4;
export const landmarks: Landmark[] = [
  { id: "L1", x: 100, y: 150, name: "Headland Light", magneticBearing: 311.87 },
  { id: "L2", x: 450, y: 80, name: "North Buoy", magneticBearing: 39.29 },
  { id: "L3", x: 500, y: 350, name: "Island Beacon", magneticBearing: 109.04 },
];

export const normalizeBearing = (bearing: number) => ((bearing % 360) + 360) % 360;
export const angularDifference = (a: number, b: number) => Math.abs(((a - b + 540) % 360) - 180);
export const magneticToTrue = (magnetic: number) => normalizeBearing(magnetic - VARIATION_WEST);
export const reciprocal = (bearing: number) => normalizeBearing(bearing + 180);
export const minutesApart = (first: number, second: number) => {
  const direct = Math.abs(first - second) % 1440;
  return Math.min(direct, 1440 - direct);
};

export const lineFromLandmark = (landmark: Landmark, plottedReciprocal: number): Lop => ({
  landmarkId: landmark.id,
  origin: { x: landmark.x, y: landmark.y },
  reciprocalBearing: normalizeBearing(plottedReciprocal),
});

const direction = (bearing: number): Point => {
  const radians = bearing * Math.PI / 180;
  return { x: Math.sin(radians), y: -Math.cos(radians) };
};

export const intersectLines = (a: Lop, b: Lop): Point | null => {
  const av = direction(a.reciprocalBearing);
  const bv = direction(b.reciprocalBearing);
  const cross = av.x * bv.y - av.y * bv.x;
  if (Math.abs(cross) < 1e-6) return null;
  const delta = { x: b.origin.x - a.origin.x, y: b.origin.y - a.origin.y };
  const t = (delta.x * bv.y - delta.y * bv.x) / cross;
  return { x: a.origin.x + t * av.x, y: a.origin.y + t * av.y };
};

export const solveFix = (lops: Lop[]) => {
  const intersections: Point[] = [];
  for (let i = 0; i < lops.length; i += 1) for (let j = i + 1; j < lops.length; j += 1) {
    const point = intersectLines(lops[i], lops[j]);
    if (point) intersections.push(point);
  }
  if (!intersections.length) return null;
  const fix = intersections.reduce((sum, p) => ({ x: sum.x + p.x, y: sum.y + p.y }), { x: 0, y: 0 });
  fix.x /= intersections.length;
  fix.y /= intersections.length;
  const uncertainty = Math.max(...intersections.map((p) => Math.hypot(p.x - fix.x, p.y - fix.y)));
  return { fix, intersections, uncertainty };
};

export const clientToSvgPoint = (
  clientX: number,
  clientY: number,
  rect: Pick<DOMRect, "left" | "top" | "width" | "height">,
  width = CHART_WIDTH,
  height = CHART_HEIGHT,
): Point => {
  const scale = Math.min(rect.width / width, rect.height / height);
  const renderedWidth = width * scale;
  const renderedHeight = height * scale;
  const offsetX = (rect.width - renderedWidth) / 2;
  const offsetY = (rect.height - renderedHeight) / 2;
  return {
    x: (clientX - rect.left - offsetX) / scale,
    y: (clientY - rect.top - offsetY) / scale,
  };
};
