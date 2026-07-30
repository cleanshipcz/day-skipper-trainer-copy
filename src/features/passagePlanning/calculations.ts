export interface PassageCalculationInput { distanceNm: number; speedKnots: number; fuelLitresPerHour: number; reservePercent: number; departureTime?: string }
export interface PassageCalculation { hours: number; fuelLitres: number; fuelWithReserveLitres: number; eta?: string }

export function validatePassageInput(input: PassageCalculationInput): string[] {
  const errors: string[] = [];
  if (!Number.isFinite(input.distanceNm) || input.distanceNm <= 0 || input.distanceNm > 2000) errors.push("Distance must be between 0 and 2,000 nautical miles.");
  if (!Number.isFinite(input.speedKnots) || input.speedKnots <= 0 || input.speedKnots > 80) errors.push("Speed must be between 0 and 80 knots.");
  if (!Number.isFinite(input.fuelLitresPerHour) || input.fuelLitresPerHour <= 0 || input.fuelLitresPerHour > 500) errors.push("Fuel rate must be between 0 and 500 litres/hour.");
  if (!Number.isFinite(input.reservePercent) || input.reservePercent < 0 || input.reservePercent > 200) errors.push("Reserve must be between 0% and 200%.");
  if (input.departureTime && Number.isNaN(Date.parse(input.departureTime))) errors.push("Departure time is invalid.");
  return errors;
}

export function calculatePassage(input: PassageCalculationInput): PassageCalculation {
  const errors = validatePassageInput(input);
  if (errors.length) throw new RangeError(errors.join(" "));
  const hours = input.distanceNm / input.speedKnots;
  const fuelLitres = hours * input.fuelLitresPerHour;
  return { hours, fuelLitres, fuelWithReserveLitres: fuelLitres * (1 + input.reservePercent / 100), eta: input.departureTime ? new Date(Date.parse(input.departureTime) + hours * 3_600_000).toISOString() : undefined };
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
