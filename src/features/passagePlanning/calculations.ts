export interface PassageCalculationInput {
  distanceNm: number;
  speedKnots: number;
  engineHours: number;
  fuelLitresPerHour: number;
  additionalFuelLitres: number;
  reservePercent: number;
  usableFuelLitres: number;
  departureTime?: string;
}
export interface PassageCalculation {
  hours: number;
  durationMinutes: number;
  fuelLitres: number;
  subtotalFuelLitres: number;
  reserveLitres: number;
  fuelWithReserveLitres: number;
  practicalFuelLitres: number;
  usableFuelMarginLitres: number;
  hasEnoughUsableFuel: boolean;
  eta?: string;
}

export function validatePassageInput(input: PassageCalculationInput): string[] {
  const errors: string[] = [];
  if (!Number.isFinite(input.distanceNm) || input.distanceNm <= 0 || input.distanceNm > 2000) errors.push("Distance must be between 0 and 2,000 nautical miles.");
  if (!Number.isFinite(input.speedKnots) || input.speedKnots <= 0 || input.speedKnots > 80) errors.push("Speed must be between 0 and 80 knots.");
  if (!Number.isFinite(input.fuelLitresPerHour) || input.fuelLitresPerHour <= 0 || input.fuelLitresPerHour > 500) errors.push("Fuel rate must be between 0 and 500 litres/hour.");
  if (!Number.isFinite(input.engineHours) || input.engineHours < 0 || input.engineHours > 1000) errors.push("Engine-running time must be between 0 and 1,000 hours.");
  if (!Number.isFinite(input.additionalFuelLitres) || input.additionalFuelLitres < 0 || input.additionalFuelLitres > 100000) errors.push("Additional consumption must be between 0 and 100,000 litres.");
  if (!Number.isFinite(input.reservePercent) || input.reservePercent <= 0 || input.reservePercent > 200) errors.push("Enter a positive reserve up to 200%, chosen for this vessel and passage.");
  if (!Number.isFinite(input.usableFuelLitres) || input.usableFuelLitres <= 0 || input.usableFuelLitres > 100000) errors.push("Usable fuel must be between 0 and 100,000 litres.");
  if (input.departureTime && Number.isNaN(Date.parse(input.departureTime))) errors.push("Departure time is invalid.");
  return errors;
}

export function calculatePassage(input: PassageCalculationInput): PassageCalculation {
  const errors = validatePassageInput(input);
  if (errors.length) throw new RangeError(errors.join(" "));
  const hours = input.distanceNm / input.speedKnots;
  const fuelLitres = input.engineHours * input.fuelLitresPerHour;
  const subtotalFuelLitres = fuelLitres + input.additionalFuelLitres;
  const reserveLitres = subtotalFuelLitres * input.reservePercent / 100;
  const fuelWithReserveLitres = subtotalFuelLitres + reserveLitres;
  const practicalFuelLitres = Math.ceil(fuelWithReserveLitres);
  return {
    hours,
    durationMinutes: Math.round(hours * 60),
    fuelLitres,
    subtotalFuelLitres,
    reserveLitres,
    fuelWithReserveLitres,
    practicalFuelLitres,
    usableFuelMarginLitres: input.usableFuelLitres - practicalFuelLitres,
    hasEnoughUsableFuel: input.usableFuelLitres >= practicalFuelLitres,
    eta: input.departureTime ? new Date(Date.parse(input.departureTime) + hours * 3_600_000).toISOString() : undefined,
  };
}

export function formatDuration(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours} h ${minutes} min`;
}

/** Formats an ISO instant with an explicit IANA zone and numeric UTC offset. */
export function formatEta(isoInstant: string, locale = "en-GB", timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone): string {
  return new Intl.DateTimeFormat(locale, {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
    hour: "2-digit", minute: "2-digit", second: "2-digit", timeZone, timeZoneName: "shortOffset",
  }).format(new Date(isoInstant)) + ` (${timeZone})`;
}

/** Returns every instant represented by a timezone-free wall-clock value (zero for DST gaps, two for overlaps). */
export function possibleInstants(localDateTime: string, timeZone: string): string[] {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(localDateTime);
  if (!match) return [];
  const wanted = `${match[1]}-${match[2]}-${match[3]} ${match[4]}:${match[5]}`;
  const centre = Date.UTC(+match[1], +match[2] - 1, +match[3], +match[4], +match[5]);
  const formatter = new Intl.DateTimeFormat("en-CA", { timeZone, year:"numeric", month:"2-digit", day:"2-digit", hour:"2-digit", minute:"2-digit", hourCycle:"h23" });
  const found: string[] = [];
  for (let instant = centre - 14 * 3_600_000; instant <= centre + 14 * 3_600_000; instant += 60_000) {
    const parts = Object.fromEntries(formatter.formatToParts(instant).map(({type,value}) => [type,value]));
    if (`${parts.year}-${parts.month}-${parts.day} ${parts.hour}:${parts.minute}` === wanted) found.push(new Date(instant).toISOString());
  }
  return found;
}

export interface PlanWaypoint { id: string; name: string; latitude: string; longitude: string; bearing: number; distanceNm: number; notes: string; tidalGate: string; weatherWindow: string }
export function calculateLegEtas(waypoints: readonly PlanWaypoint[], departure: string, speedKnots: number): string[] {
  if (!Number.isFinite(speedKnots) || speedKnots <= 0 || Number.isNaN(Date.parse(departure))) return [];
  let elapsed = 0;
  return waypoints.map((waypoint) => {
    elapsed += waypoint.distanceNm / speedKnots;
    return new Date(Date.parse(departure) + elapsed * 3_600_000).toISOString();
  });
}
