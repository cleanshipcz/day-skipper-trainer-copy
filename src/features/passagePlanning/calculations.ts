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

export type PassageInputField = keyof PassageCalculationInput | "duration" | "fuelTotal";
export interface PassageValidationIssue { field: PassageInputField; message: string }
export const PASSAGE_LIMITS = {
  distanceNm: { min: 0.1, max: 2000, step: 0.1 },
  speedKnots: { min: 0.1, max: 80, step: 0.1 },
  engineHours: { min: 0, max: 1000, step: 0.1 },
  fuelLitresPerHour: { min: 0.1, max: 500, step: 0.1 },
  additionalFuelLitres: { min: 0, max: 100000, step: 0.1 },
  reservePercent: { min: 0.1, max: 200, step: 0.1 },
  usableFuelLitres: { min: 0.1, max: 100000, step: 0.1 },
  maximumDurationHours: 1000,
} as const;

const numericIssue=(field:Exclude<keyof PassageCalculationInput,"departureTime">,value:number,limits:{min:number;max:number;step:number},label:string):PassageValidationIssue|undefined => {
  if(!Number.isFinite(value)||value<limits.min||value>limits.max)return {field,message:`${label} must be a finite number from ${limits.min.toLocaleString("en-GB")} to ${limits.max.toLocaleString("en-GB")}.`};
  const steps=(value-limits.min)/limits.step;
  if(Math.abs(steps-Math.round(steps))>1e-9)return {field,message:`${label} must use increments of ${limits.step} from ${limits.min.toLocaleString("en-GB")} to ${limits.max.toLocaleString("en-GB")}.`};
};

export function passageValidationIssues(input: PassageCalculationInput): PassageValidationIssue[] {
  const issues:PassageValidationIssue[]=[];
  const add=(issue:PassageValidationIssue|undefined)=>{if(issue)issues.push(issue)};
  add(numericIssue("distanceNm",input.distanceNm,PASSAGE_LIMITS.distanceNm,"Distance (nautical miles)"));
  add(numericIssue("speedKnots",input.speedKnots,PASSAGE_LIMITS.speedKnots,"Speed over ground (knots)"));
  add(numericIssue("engineHours",input.engineHours,PASSAGE_LIMITS.engineHours,"Engine-running duration (hours)"));
  add(numericIssue("fuelLitresPerHour",input.fuelLitresPerHour,PASSAGE_LIMITS.fuelLitresPerHour,"Fuel rate (litres/hour)"));
  add(numericIssue("additionalFuelLitres",input.additionalFuelLitres,PASSAGE_LIMITS.additionalFuelLitres,"Additional consumption (litres)"));
  add(numericIssue("reservePercent",input.reservePercent,PASSAGE_LIMITS.reservePercent,"Reserve (percent)"));
  add(numericIssue("usableFuelLitres",input.usableFuelLitres,PASSAGE_LIMITS.usableFuelLitres,"Usable fuel (litres)"));
  if (!issues.some(({field})=>field==="distanceNm"||field==="speedKnots")) {
    const duration=input.distanceNm/input.speedKnots;
    if(!Number.isFinite(duration)||duration<=0||duration>PASSAGE_LIMITS.maximumDurationHours)issues.push({field:"duration",message:`Derived passage duration must be finite, positive and no more than ${PASSAGE_LIMITS.maximumDurationHours.toLocaleString("en-GB")} hours. Increase realistic SOG or shorten the route.`});
  }
  if (!issues.some(({field})=>["engineHours","fuelLitresPerHour","additionalFuelLitres","reservePercent"].includes(field))) {
    const subtotal=input.engineHours*input.fuelLitresPerHour+input.additionalFuelLitres;
    const total=subtotal*(1+input.reservePercent/100);
    if(!Number.isFinite(subtotal)||subtotal<=0||!Number.isFinite(total)||total<=0)issues.push({field:"fuelTotal",message:"Derived fuel subtotal and reserved total must both be finite and positive."});
  }
  if(input.departureTime){
    const departure=Date.parse(input.departureTime);
    if(!Number.isFinite(departure))issues.push({field:"departureTime",message:"Departure time must be a valid representable instant."});
    else if(!issues.some(({field})=>field==="duration"||field==="distanceNm"||field==="speedKnots")){
      const eta=departure+(input.distanceNm/input.speedKnots)*3_600_000;
      if(!Number.isFinite(eta)||Number.isNaN(new Date(eta).getTime()))issues.push({field:"departureTime",message:"Departure plus passage duration must produce a representable ETA."});
    }
  }
  return issues;
}

export function validatePassageInput(input: PassageCalculationInput): string[] {
  return passageValidationIssues(input).map(({message})=>message);
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
