/** Normalize any finite angle to 000–359, rounding to the nearest whole degree. */
export const normalizeHeading = (angle: number) => ((Math.round(angle) % 360) + 360) % 360;
