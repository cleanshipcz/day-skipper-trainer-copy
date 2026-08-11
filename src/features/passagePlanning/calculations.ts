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

export interface PlanLeg {
  course: number;
  distanceNm: number;
  notes: string;
  tidalGate: string;
  weatherWindow: string;
}

/**
 * Ordered route semantics: points[0] is the departure and has no inbound leg.
 * Every later waypoint is an arrival and owns the leg from points[index - 1].
 */
export interface PlanWaypoint {
  id: string;
  name: string;
  latitude: string;
  longitude: string;
  inboundLeg: PlanLeg | null;
}

export type ParsedCoordinate = { latitude: number; longitude: number };
const LATITUDE = /^(\d{1,2})°(\d{1,2}(?:\.\d{1,3})?)'([NS])$/;
const LONGITUDE = /^(\d{1,3})°(\d{1,2}(?:\.\d{1,3})?)'([EW])$/;

/** Parses WGS84 degrees and decimal minutes, e.g. 50°47.400'N 001°06.500'W. */
export function parseWaypointCoordinate(latitude: string, longitude: string): ParsedCoordinate | null {
  const lat=LATITUDE.exec(latitude.trim()),lon=LONGITUDE.exec(longitude.trim());
  if(!lat||!lon)return null;
  const convert=(match:RegExpExecArray,limit:number)=>{const degrees=Number(match[1]),minutes=Number(match[2]);if(degrees>limit||minutes>=60||(degrees===limit&&minutes!==0))return null;const sign=match[3]==="S"||match[3]==="W"?-1:1;return sign*(degrees+minutes/60)};
  const parsedLatitude=convert(lat,90),parsedLongitude=convert(lon,180);
  return parsedLatitude===null||parsedLongitude===null?null:{latitude:parsedLatitude,longitude:parsedLongitude};
}
export const isValidLatitude = (value:string) => { const match=LATITUDE.exec(value.trim());if(!match)return false;const degrees=Number(match[1]),minutes=Number(match[2]);return degrees<=90&&minutes<60&&!(degrees===90&&minutes!==0) };
export const isValidLongitude = (value:string) => { const match=LONGITUDE.exec(value.trim());if(!match)return false;const degrees=Number(match[1]),minutes=Number(match[2]);return degrees<=180&&minutes<60&&!(degrees===180&&minutes!==0) };

const greatCircleNm=(a:ParsedCoordinate,b:ParsedCoordinate)=>{const radians=(value:number)=>value*Math.PI/180;const dLat=radians(b.latitude-a.latitude),dLon=radians(b.longitude-a.longitude);const value=Math.sin(dLat/2)**2+Math.cos(radians(a.latitude))*Math.cos(radians(b.latitude))*Math.sin(dLon/2)**2;return 3440.065*2*Math.atan2(Math.sqrt(value),Math.sqrt(1-value))};
export function routeGeometryIssues(points: readonly PlanWaypoint[]): string[] {
  const issues:string[]=[];
  for(let index=1;index<points.length;index+=1){const from=parseWaypointCoordinate(points[index-1].latitude,points[index-1].longitude),to=parseWaypointCoordinate(points[index].latitude,points[index].longitude),leg=points[index].inboundLeg;if(!from||!to||!leg)continue;const geometry=greatCircleNm(from,to);if(geometry<0.01&&leg.distanceNm>0.1)issues.push(`Leg ${index}: distinct route distance is recorded between effectively identical coordinates.`);else {if(Math.abs(leg.distanceNm-geometry)>Math.max(2,geometry*.5))issues.push(`Leg ${index}: routed ${leg.distanceNm.toFixed(1)} nm differs from endpoint separation ${geometry.toFixed(1)} nm; verify the intended detour.`);const r=(v:number)=>v*Math.PI/180,dLon=r(to.longitude-from.longitude),y=Math.sin(dLon)*Math.cos(r(to.latitude)),x=Math.cos(r(from.latitude))*Math.sin(r(to.latitude))-Math.sin(r(from.latitude))*Math.cos(r(to.latitude))*Math.cos(dLon),bearing=(Math.atan2(y,x)*180/Math.PI+360)%360,difference=Math.abs(((leg.course-bearing+540)%360)-180);if(difference>90)issues.push(`Leg ${index}: entered course differs from endpoint bearing by ${difference.toFixed(0)}°; verify direction and routed track.`)}}
  return issues;
}

export function routeLegs(waypoints: readonly PlanWaypoint[]): PlanLeg[] {
  return waypoints.slice(1).flatMap((point) => point.inboundLeg ? [point.inboundLeg] : []);
}

export function totalRouteDistance(waypoints: readonly PlanWaypoint[]): number {
  return routeLegs(waypoints).reduce((total, leg) => total + (Number.isFinite(leg.distanceNm) ? leg.distanceNm : 0), 0);
}

export function calculateLegEtas(waypoints: readonly PlanWaypoint[], departure: string, speedKnots: number): string[] {
  if (!Number.isFinite(speedKnots) || speedKnots <= 0 || Number.isNaN(Date.parse(departure))) return [];
  let elapsed = 0;
  return waypoints.slice(1).map((waypoint) => {
    if (!waypoint.inboundLeg || !Number.isFinite(waypoint.inboundLeg.distanceNm)) return "";
    elapsed += waypoint.inboundLeg.distanceNm / speedKnots;
    return new Date(Date.parse(departure) + elapsed * 3_600_000).toISOString();
  });
}
