export interface PrepareStep {
  letter: string;
  title: string;
  description: string;
  considerations: readonly string[];
  example: string;
}

export const prepareSteps: readonly PrepareStep[] = [
  { letter: "P", title: "Passage appraisal", description: "Define the objective and assess the route, crew and vessel.", considerations: ["Charts and hazards", "Crew capability", "Daylight and duration"], example: "Compare an offshore route with a sheltered coastal alternative." },
  { letter: "R", title: "Regulations", description: "Check rules and restrictions that apply along the route.", considerations: ["COLREGs", "Local notices", "Traffic schemes and restricted areas"], example: "Read harbour directions and current Notices to Mariners." },
  { letter: "E", title: "Equipment", description: "Confirm navigation, safety and communication equipment is ready.", considerations: ["Charts and backups", "Life-saving equipment", "Fuel, water and spares"], example: "Test the VHF and carry a charged handheld backup." },
  { letter: "P", title: "Passage plan", description: "Turn the appraisal into waypoints, courses, distances and timings.", considerations: ["Tidal gates", "Weather windows", "Pilotage notes"], example: "Plan each leg and a cockpit-ready departure and arrival brief." },
  { letter: "A", title: "Alternatives", description: "Identify safe refuges and actions if conditions or equipment change.", considerations: ["Ports of refuge", "Abort points", "Crew and equipment failures"], example: "Set a latest diversion time for the nearest all-weather harbour." },
  { letter: "R", title: "Revise", description: "Recheck the plan using the latest information before sailing.", considerations: ["Forecast updates", "Actual tide and visibility", "Crew condition"], example: "Delay departure when the latest forecast moves outside crew limits." },
  { letter: "E", title: "Execute", description: "Brief the crew, monitor progress and adapt while underway.", considerations: ["Position and ETA checks", "Log keeping", "Trigger points"], example: "Record fixes and compare actual progress with the plan every hour." },
];
