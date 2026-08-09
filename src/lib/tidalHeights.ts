export interface TidalEvent {
  minutes: number;
  height: number;
}

export const minutesAfterMidnight = (time: string) => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

export const normaliseFollowingTime = (start: number, end: number) =>
  end <= start ? end + 24 * 60 : end;

/** Smooth interpolation between adjacent published HW/LW events. */
export const heightAtTime = (start: TidalEvent, end: TidalEvent, time: number) => {
  const duration = end.minutes - start.minutes;
  if (duration <= 0 || time < start.minutes || time > end.minutes) {
    throw new RangeError("Time must fall between consecutive tidal events");
  }
  const fraction = (time - start.minutes) / duration;
  const curveFraction = (1 - Math.cos(Math.PI * fraction)) / 2;
  return start.height + (end.height - start.height) * curveFraction;
};

/** Returns the time on one specified rising or falling limb for a target height. */
export const timeForHeight = (start: TidalEvent, end: TidalEvent, targetHeight: number) => {
  const low = Math.min(start.height, end.height);
  const high = Math.max(start.height, end.height);
  if (end.minutes <= start.minutes || start.height === end.height || targetHeight < low || targetHeight > high) {
    throw new RangeError("Height must fall within the selected tidal limb");
  }
  const curveFraction = (targetHeight - start.height) / (end.height - start.height);
  const fraction = Math.acos(1 - 2 * curveFraction) / Math.PI;
  return start.minutes + fraction * (end.minutes - start.minutes);
};

export const formatTidalTime = (minutes: number) => {
  const roundedMinutes = Math.round(minutes);
  const dayOffset = Math.floor(roundedMinutes / (24 * 60));
  const inDay = ((roundedMinutes % (24 * 60)) + 24 * 60) % (24 * 60);
  const value = `${String(Math.floor(inDay / 60)).padStart(2, "0")}:${String(inDay % 60).padStart(2, "0")}`;
  return dayOffset > 0 ? `${value} (+${dayOffset} day)` : value;
};
