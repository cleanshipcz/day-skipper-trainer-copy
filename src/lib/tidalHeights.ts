export interface TidalEvent {
  minutes: number;
  height: number;
}

export interface PassageInputs {
  previousLow: TidalEvent;
  high: TidalEvent;
  followingLow: TidalEvent;
  draft: number;
  clearance: number;
  chartedDepth: number;
}

export type PassageStatus = "always_safe" | "never_safe" | "safe_window" | "boundary" | "out_of_model" | "invalid";

export interface PassagePlan {
  status: PassageStatus;
  requiredTide: number | null;
  crossings: number[];
  safeWindows: Array<{ start: number; end: number }>;
  errors: Record<string, string>;
}

const MIN_LIMB_MINUTES = 4 * 60;
const MAX_LIMB_MINUTES = 8 * 60;
const EPSILON = 1e-9;

export const minutesAfterMidnight = (time: string) => {
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) return Number.NaN;
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

export const normaliseFollowingTime = (start: number, end: number) =>
  end <= start ? end + 24 * 60 : end;

/**
 * Educational, harmonic interpolation on one published LW/HW limb only.
 * It is not a prediction engine and must never be evaluated outside the two events.
 */
export const heightAtTime = (start: TidalEvent, end: TidalEvent, time: number) => {
  const duration = end.minutes - start.minutes;
  if (![start.minutes, end.minutes, start.height, end.height, time].every(Number.isFinite)) {
    throw new TypeError("Tidal event values must be finite");
  }
  if (duration <= 0 || time < start.minutes || time > end.minutes) {
    throw new RangeError("Time must fall between consecutive tidal events");
  }
  const fraction = (time - start.minutes) / duration;
  const curveFraction = (1 - Math.cos(Math.PI * fraction)) / 2;
  return start.height + (end.height - start.height) * curveFraction;
};

/** Returns the analytic crossing on one bounded rising or falling limb. */
export const timeForHeight = (start: TidalEvent, end: TidalEvent, targetHeight: number) => {
  if (![start.minutes, end.minutes, start.height, end.height, targetHeight].every(Number.isFinite)) {
    throw new TypeError("Tidal event values must be finite");
  }
  const low = Math.min(start.height, end.height);
  const high = Math.max(start.height, end.height);
  if (end.minutes <= start.minutes || Math.abs(start.height - end.height) <= EPSILON || targetHeight < low || targetHeight > high) {
    throw new RangeError("Height must fall within the selected tidal limb");
  }
  const curveFraction = (targetHeight - start.height) / (end.height - start.height);
  const fraction = Math.acos(1 - 2 * curveFraction) / Math.PI;
  return start.minutes + fraction * (end.minutes - start.minutes);
};

const approximatelyEqual = (a: number, b: number) => Math.abs(a - b) <= EPSILON;

export const calculatePassagePlan = (input: PassageInputs): PassagePlan => {
  const errors: Record<string, string> = {};
  const numericFields: Array<[string, number]> = [
    ["previousLow.height", input.previousLow.height], ["high.height", input.high.height],
    ["followingLow.height", input.followingLow.height], ["draft", input.draft],
    ["clearance", input.clearance], ["chartedDepth", input.chartedDepth],
  ];
  for (const [field, value] of numericFields) if (!Number.isFinite(value)) errors[field] = "Enter a finite number.";
  for (const [field, event] of [["previousLow.time", input.previousLow], ["high.time", input.high], ["followingLow.time", input.followingLow]] as const) {
    if (!Number.isFinite(event.minutes)) errors[field] = "Enter a valid time.";
  }
  if (Number.isFinite(input.draft) && input.draft <= 0) errors.draft = "Draft must be greater than zero.";
  if (Number.isFinite(input.clearance) && input.clearance < 0) errors.clearance = "Clearance cannot be negative.";
  if (Object.keys(errors).length) return { status: "invalid", requiredTide: null, crossings: [], safeWindows: [], errors };

  for (const [field, event] of [["previousLow.height", input.previousLow], ["high.height", input.high], ["followingLow.height", input.followingLow]] as const) {
    if (event.height < -20 || event.height > 30) errors[field] = "Tidal heights outside −20 m to 30 m are not supported.";
  }
  if (input.draft > 30) errors.draft = "Drafts over 30 m are outside this teaching model.";
  if (input.clearance > 20) errors.clearance = "Clearance over 20 m is outside this teaching model.";
  if (input.chartedDepth < -100 || input.chartedDepth > 100) errors.chartedDepth = "Charted values outside −100 m to 100 m are not supported.";

  const rise = input.high.minutes - input.previousLow.minutes;
  const fall = input.followingLow.minutes - input.high.minutes;
  if (rise <= 0) errors["high.time"] = "HW must follow the preceding LW.";
  if (fall <= 0) errors["followingLow.time"] = "Following LW must follow HW.";
  if (input.high.height <= input.previousLow.height) errors["high.height"] = "HW must be higher than the preceding LW.";
  if (input.high.height <= input.followingLow.height) errors["followingLow.height"] = "Following LW must be lower than HW.";
  if (rise > 0 && (rise < MIN_LIMB_MINUTES || rise > MAX_LIMB_MINUTES)) errors["high.time"] = "LW to HW must be between 4 and 8 hours for this model.";
  if (fall > 0 && (fall < MIN_LIMB_MINUTES || fall > MAX_LIMB_MINUTES)) errors["followingLow.time"] = "HW to LW must be between 4 and 8 hours for this model.";
  if (Object.keys(errors).length) return { status: "out_of_model", requiredTide: input.draft + input.clearance - input.chartedDepth, crossings: [], safeWindows: [], errors };

  const requiredTide = input.draft + input.clearance - input.chartedDepth;
  const minLow = Math.min(input.previousLow.height, input.followingLow.height);
  if (requiredTide < minLow) {
    return { status: "always_safe", requiredTide, crossings: [], safeWindows: [{ start: input.previousLow.minutes, end: input.followingLow.minutes }], errors };
  }
  if (requiredTide > input.high.height) return { status: "never_safe", requiredTide, crossings: [], safeWindows: [], errors };
  if (approximatelyEqual(requiredTide, input.high.height)) {
    return { status: "boundary", requiredTide, crossings: [input.high.minutes], safeWindows: [{ start: input.high.minutes, end: input.high.minutes }], errors };
  }

  const start = requiredTide <= input.previousLow.height
    ? input.previousLow.minutes
    : timeForHeight(input.previousLow, input.high, requiredTide);
  const end = requiredTide <= input.followingLow.height
    ? input.followingLow.minutes
    : timeForHeight(input.high, input.followingLow, requiredTide);
  const crossings = [
    ...(requiredTide > input.previousLow.height ? [start] : []),
    ...(requiredTide > input.followingLow.height ? [end] : []),
  ];
  const atEventBoundary = approximatelyEqual(requiredTide, input.previousLow.height) || approximatelyEqual(requiredTide, input.followingLow.height);
  return { status: atEventBoundary ? "boundary" : "safe_window", requiredTide, crossings, safeWindows: [{ start, end }], errors };
};

export const conservativeWindow = (window: { start: number; end: number }, increment = 5) => ({
  start: Math.ceil(window.start / increment) * increment,
  end: Math.floor(window.end / increment) * increment,
});

export const formatTidalTime = (minutes: number) => {
  const roundedMinutes = Math.round(minutes);
  const dayOffset = Math.floor(roundedMinutes / (24 * 60));
  const inDay = ((roundedMinutes % (24 * 60)) + 24 * 60) % (24 * 60);
  const value = `${String(Math.floor(inDay / 60)).padStart(2, "0")}:${String(inDay % 60).padStart(2, "0")}`;
  return dayOffset > 0 ? `${value} (+${dayOffset} day)` : value;
};
